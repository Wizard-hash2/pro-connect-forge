import express from 'express';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { pipeline } from '@xenova/transformers';
dotenv.config();

const router = express.Router();

// Use service role key for backend access
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Load Hugging Face embedder once
let embedder;
async function loadEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

// Helper to generate embedding for a query using Hugging Face locally
async function generateEmbedding(text) {
  const embedder = await loadEmbedder();
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  // output is a [1, 384] array, so return the first element
  return Array.from(output.data);
}

// Helper to call OpenRouter API
async function callOpenRouterAI(prompt, context) {
  console.log('Calling OpenRouter AI with prompt:', prompt);
  console.log('Context sent to OpenRouter AI:', context);
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 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',
      'HTTP-Referer': 'http://localhost:8080', // Optional, update to your site URL if deploying
      'X-Title': 'Mercy Shop', // Optional, update to your site name if deploying
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o',
      max_tokens: 300,
      messages: [
        { role: 'system', content: context || '' },
        { role: 'user', content: prompt }
      ]
    }),
  });
  const data = await response.json();
  console.log('OpenRouter AI raw response:', JSON.stringify(data, null, 2));
  return data.choices?.[0]?.message?.content || data.response || 'No response from AI.';
}

router.post('/ask', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Missing prompt' });
    // 1. Generate embedding for the query
    const queryEmbedding = await generateEmbedding(prompt);
    // 2. Query Supabase for top 3 similar documents
    const { data: matches, error } = await supabase.rpc('match_knowledge', {
      query_embedding: queryEmbedding,
      match_count: 3,
    });
    if (error) throw error;
    const context = matches?.map(m => m.content).join('\n---\n') || '';
    // 3. Call OpenRouter AI API
    const aiResponse = await callOpenRouterAI(prompt, context);
    res.json({ response: aiResponse });
  } catch (err) {
    console.error('RAG error:', err);
    res.status(500).json({ error: 'RAG processing failed' });
  }
});

router.get('/ping', (req, res) => {
  res.json({ message: 'pong' });
});

export default router; 
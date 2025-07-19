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

// Helper to call Gemini AI API
async function callGeminiAI(prompt, context) {
  console.log('Calling Gemini AI with prompt:', prompt);
  console.log('Context sent to Gemini AI:', context);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GOOGLE_AI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: (context ? context + '\n---\n' : '') + prompt }
            ]
          }
        ]
      })
    }
  );
  const data = await response.json();
  console.log('Gemini AI raw response:', JSON.stringify(data, null, 2));
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    data?.candidates?.[0]?.content?.text ||
    'No response from AI.'
  );
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
    // 3. Call Gemini AI API
    const aiResponse = await callGeminiAI(prompt, context);
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
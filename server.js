import express from 'express';
import ragRouter from './src/api/rag.js';
import dotenv from 'dotenv';
import path from 'path';
//import openai from 'openai';
import axios from 'axios';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(express.json());

// Mount the RAG API
app.use('/api/rag', ragRouter);

// Serve static files from the frontend build
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA (use regex for catch-all in Express 5)
app.get(/^\/((?!api).)*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

//openai.apiKey = process.env.OPENAI_API_KEY;

const context = `
You are an AI assistant for Mercy Shop, a freelancer marketplace.
When a user asks how to post a job, always guide them through the following steps:
1. Ask for the job title.
2. Ask for a detailed job description.
3. Ask for required skills (up to 6).
4. Ask for the minimum and maximum budget.
5. Ask for the deadline.
6. Ask for the required experience level (junior, mid, senior, expert).
After collecting all answers, summarize the job post in a professional format and ask for confirmation to submit.
Never mention other platforms or generic job posting advice.
`;

app.post('/api/polish-job-post', async (req, res) => {
  try {
    const data = req.body;
    const prompt = `You are an expert job post writer. Given the following job details, write a polished, professional job post summary for a freelancer marketplace.\n\nTitle: ${data.title}\nDescription: ${data.description}\nSkills: ${data.skills}\nBudget: ${data.budget_min} - ${data.budget_max}\nDeadline: ${data.deadline}\nExperience Level: ${data.required_experience_level}`;
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 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',
        'HTTP-Referer': 'http://localhost:8080',
        'X-Title': 'kenwork',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        max_tokens: 300,
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: prompt }
        ]
      })
    });
    const result = await response.json();
    const summary = result.choices?.[0]?.message?.content || result.choices?.[0]?.text || result.summary || result.result || '';
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: 'Failed to polish job post', details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
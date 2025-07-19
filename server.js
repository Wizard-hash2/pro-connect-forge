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
You are an AI assistant for KenWORKS, a freelancer marketplace.
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
                { text: prompt }
              ]
            }
          ]
        })
      }
    );

    const result = await response.json();
    // Gemini's response structure:
    // result.candidates[0].content.parts[0].text
    const summary =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      result?.candidates?.[0]?.content?.text ||
      '';

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: 'Failed to polish job post', details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
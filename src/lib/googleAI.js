import fetch from 'node-fetch';

const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro:generateContent';
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

export async function callGoogleAIStudio(prompt, context = '') {
  const response = await fetch(`${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${context}\n\n${prompt}` }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 512 },
    }),
  });
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';
} 
import express from 'express';
import ragRouter from './src/api/rag.js';
import dotenv from 'dotenv';
import path from 'path';

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
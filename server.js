import express from 'express';
import ragRouter from './src/api/rag.js'; // Adjust path if needed
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Mount the RAG API
app.use('/api/rag', ragRouter);

app.get('/test', (req, res) => {
    res.send('Test route works!');
  });
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
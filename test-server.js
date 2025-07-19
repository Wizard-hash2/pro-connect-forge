import express from 'express';

const app = express();
app.use(express.json());

app.get('/test', (req, res) => {
  res.send('Test GET works!');
});

app.post('/test-post', (req, res) => {
  res.json({ message: 'POST works!' });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});
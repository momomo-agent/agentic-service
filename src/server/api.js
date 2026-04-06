import express from 'express';
import cors from 'cors';
import { chat } from '../runtime/llm.js';
import { errorHandler } from './middleware.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    for await (const chunk of chat(message, { history })) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('Chat error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
  }
  res.end();
});

app.get('/api/status', async (req, res) => {
  const { detect } = await import('../detector/hardware.js');
  const hardware = await detect();
  res.json({ hardware, profile: {}, ollama: { installed: true, models: [] } });
});

app.get('/api/config', (req, res) => res.json({}));

app.put('/api/config', (req, res) => res.json(req.body));

app.use(errorHandler);

export async function startServer(port = 3000) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
      resolve(server);
    });
    server.on('error', (error) => {
      reject(error.code === 'EADDRINUSE'
        ? new Error(`Port ${port} is already in use`)
        : error);
    });
  });
}

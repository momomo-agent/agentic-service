import express from 'express';
import cors from 'cors';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { chat } from '../runtime/llm.js';
import { errorHandler } from './middleware.js';

const CONFIG_PATH = path.join(os.homedir(), '.agentic-service', 'config.json');

async function readConfig() {
  try {
    return JSON.parse(await fs.readFile(CONFIG_PATH, 'utf8'));
  } catch {
    return {};
  }
}

async function writeConfig(data) {
  const tmp = CONFIG_PATH + '.tmp';
  await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, CONFIG_PATH);
}

async function getOllamaStatus() {
  try {
    const res = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(2000)
    });
    if (!res.ok) return { running: false, models: [] };
    const { models } = await res.json();
    return { running: true, models: models.map(m => m.name) };
  } catch {
    return { running: false, models: [] };
  }
}

export function createApp() {
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
    const ollama = await getOllamaStatus();
    res.json({ hardware, profile: {}, ollama });
  });

  app.get('/api/config', async (req, res) => {
    res.json(await readConfig());
  });

  app.put('/api/config', async (req, res) => {
    try {
      await writeConfig(req.body);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.use(errorHandler);
  return app;
}

export function startServer(port = 3000) {
  return new Promise((resolve, reject) => {
    const server = createApp().listen(port);
    server.once('listening', () => {
      console.log(`Server running at http://localhost:${port}`);
      resolve(server);
    });
    server.once('error', (err) => {
      reject(err.code === 'EADDRINUSE'
        ? new Error(`Port ${port} is already in use`)
        : err);
    });
  });
}

export function stopServer(server) {
  return new Promise((resolve, reject) =>
    server.close(err => err ? reject(err) : resolve())
  );
}

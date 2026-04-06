import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { chat } from './brain.js';
import * as stt from '../runtime/stt.js';
import * as tts from '../runtime/tts.js';
import { errorHandler } from './middleware.js';
import { getDevices, initWebSocket } from './hub.js';

const upload = multer({ storage: multer.memoryStorage() });

const logBuffer = [];
const _log = console.log;
console.log = (...args) => {
  logBuffer.push({ ts: Date.now(), msg: args.join(' ') });
  if (logBuffer.length > 200) logBuffer.shift();
  _log(...args);
};

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
    const res = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return { running: false, models: [] };
    const { models } = await res.json();
    return { running: true, models: models.map(m => m.name) };
  } catch {
    return { running: false, models: [] };
  }
}

function addRoutes(r) {
  r.post('/api/chat', async (req, res) => {
    const { message, history = [], tools } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message' });
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const messages = [...history, { role: 'user', content: message }];
    try {
      for await (const chunk of chat(messages, { tools })) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      res.write('data: [DONE]\n\n');
    } catch (error) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    }
    res.end();
  });

  r.get('/api/status', async (req, res) => {
    const { detect } = await import('../detector/hardware.js');
    const hardware = await detect();
    const ollama = await getOllamaStatus();
    res.json({ hardware, profile: {}, ollama, devices: getDevices() });
  });

  r.get('/api/devices', (req, res) => res.json(getDevices()));

  r.get('/api/config', async (req, res) => res.json(await readConfig()));

  r.put('/api/config', async (req, res) => {
    try {
      await writeConfig(req.body);
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  r.post('/api/transcribe', upload.single('audio'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'audio required' });
    try {
      res.json({ text: await stt.transcribe(req.file.buffer) });
    } catch (e) {
      res.status(e.code === 'EMPTY_AUDIO' ? 400 : 500).json({ error: e.message });
    }
  });

  r.post('/api/synthesize', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text required' });
    try {
      const audio = await tts.synthesize(text);
      res.set('Content-Type', 'audio/wav').send(audio);
    } catch (e) {
      res.status(e.code === 'EMPTY_TEXT' ? 400 : 500).json({ error: e.message });
    }
  });

  r.get('/api/logs', (req, res) => res.json(logBuffer.slice(-50)));

  const adminDist = new URL('../../dist/admin', import.meta.url).pathname;
  r.use('/admin', express.static(adminDist));
  r.get('/admin', (req, res) => res.sendFile(path.join(adminDist, 'index.html')));
}

export function createRouter() {
  const router = express.Router();
  addRoutes(router);
  return router;
}

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  addRoutes(app);
  app.use(errorHandler);
  return app;
}

export async function startServer(port = 3000, { https: useHttps = false } = {}) {
  const app = createApp();
  let server;
  if (useHttps) {
    const { createServer } = await import('./httpsServer.js');
    server = createServer(app);
    server.listen(port);
  } else {
    server = app.listen(port);
  }
  return new Promise((resolve, reject) => {
    server.once('listening', async () => {
      initWebSocket(server);
      await Promise.all([stt.init(), tts.init()]).catch(err =>
        console.warn('Runtime init warning:', err.message)
      );
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

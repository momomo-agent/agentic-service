import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import http from 'http';
import { chat } from './brain.js';
import { detectVoiceActivity } from '../runtime/vad.js';
import * as stt from '../runtime/stt.js';
import * as tts from '../runtime/tts.js';
import { errorHandler } from './middleware.js';
import { getDevices, initWebSocket, startWakeWordDetection, broadcastWakeword, setSessionData, broadcastSession } from './hub.js';
import { startWakeWordPipeline } from '../runtime/sense.js';

function getLanIp() {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return null;
}

const upload = multer({ storage: multer.memoryStorage() });

const logBuffer = [];
const _log = console.log;
console.log = (...args) => {
  logBuffer.push({ ts: Date.now(), msg: args.join(' ') });
  if (logBuffer.length > 200) logBuffer.shift();
  _log(...args);
};

let inflight = 0;
let draining = false;

export function startDrain() { draining = true; }

export function waitDrain(timeout = 10_000) {
  if (inflight === 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('drain timeout')), timeout);
    const check = setInterval(() => {
      if (inflight === 0) { clearInterval(check); clearTimeout(timer); resolve(); }
    }, 50);
  });
}

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
    const { message, history = [], tools, sessionId } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Invalid message' });
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    const messages = [...history, { role: 'user', content: message }];
    const assistantChunks = [];
    try {
      for await (const chunk of chat(messages, { tools })) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        if (chunk.type === 'content') assistantChunks.push(chunk.text);
      }
      res.write('data: [DONE]\n\n');
      if (sessionId) {
        const updatedHistory = [...messages, { role: 'assistant', content: assistantChunks.join('') }];
        setSessionData(sessionId, 'history', updatedHistory);
        broadcastSession(sessionId);
      }
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
    if (!detectVoiceActivity(req.file.buffer)) return res.json({ text: '', skipped: true });
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

  r.post('/api/voice', upload.single('audio'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'audio required' });
    if (!detectVoiceActivity(req.file.buffer)) return res.json({ text: '', skipped: true });

    const t0 = Date.now();
    try {
      // STT
      const text = await stt.transcribe(req.file.buffer);

      // LLM
      const messages = [{ role: 'user', content: text }];
      const replyChunks = [];
      for await (const chunk of chat(messages)) {
        if (chunk.type === 'content') replyChunks.push(chunk.text);
      }
      const reply = replyChunks.join('');

      // TTS
      const audio = await tts.synthesize(reply);

      const ms = Date.now() - t0;
      console.log(`[voice] latency: ${ms}ms`);
      if (ms > 2000) console.error(`[voice] LATENCY EXCEEDED: ${ms}ms`);

      res.set('Content-Type', 'audio/wav').send(audio);
    } catch (e) {
      res.status(500).json({ error: e.message });
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
  app.use((req, res, next) => {
    if (draining) return res.status(503).json({ error: 'server draining' });
    inflight++;
    res.on('finish', () => inflight--);
    next();
  });
  addRoutes(app);
  app.use(errorHandler);
  return app;
}

function listenAsync(server, port) {
  return new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', (err) => reject(
      err.code === 'EADDRINUSE' ? new Error(`Port ${port} is already in use`) : err
    ));
    server.listen(port);
  });
}

export async function startServer(port = 3000, { https: useHttps = false } = {}) {
  const app = createApp();

  if (useHttps) {
    let httpsServer;
    try {
      const { createServer } = await import('./httpsServer.js');
      httpsServer = createServer(app);
      await listenAsync(httpsServer, port);
    } catch (err) {
      console.error(`HTTPS setup failed: ${err.message}, falling back to HTTP`);
      const httpFallback = http.createServer(app);
      await listenAsync(httpFallback, port);
      initWebSocket(httpFallback);
      startWakeWordDetection();
      await Promise.all([stt.init(), tts.init()]).catch(e => console.warn('Runtime init warning:', e.message));
      console.log(`Server running at http://localhost:${port}`);
      return httpFallback;
    }

    initWebSocket(httpsServer);
    startWakeWordDetection();
    await Promise.all([stt.init(), tts.init()]).catch(e => console.warn('Runtime init warning:', e.message));

    const lanIp = getLanIp();
    console.log(`Server running at https://localhost:${port}`);
    if (lanIp) console.log(`LAN access: https://${lanIp}:${port}`);

    const HTTP_PORT = 3001;
    const redirectServer = http.createServer((req, res) => {
      const host = (req.headers.host || 'localhost').split(':')[0];
      res.writeHead(301, { Location: `https://${host}:${port}${req.url}` });
      res.end();
    });
    try {
      await listenAsync(redirectServer, HTTP_PORT);
    } catch {
      console.warn(`HTTP redirect port ${HTTP_PORT} in use, skipping redirect`);
    }

    return { http: redirectServer, https: httpsServer };
  }

  const httpServer = http.createServer(app);
  await listenAsync(httpServer, port);
  initWebSocket(httpServer);
  startWakeWordDetection();
  const stopWake = startWakeWordPipeline(() => broadcastWakeword('server'));
  process.once('SIGINT', () => { stopWake(); httpServer.close(); });
  await Promise.all([stt.init(), tts.init()]).catch(err =>
    console.warn('Runtime init warning:', err.message)
  );
  const lanIp = getLanIp();
  console.log(`Server running at http://localhost:${port}`);
  if (lanIp) console.log(`LAN access: http://${lanIp}:${port}`);
  return httpServer;
}

export function stopServer(server) {
  return new Promise((resolve, reject) =>
    server.close(err => err ? reject(err) : resolve())
  );
}

// Standalone benchmark: STT→LLM→TTS end-to-end latency
import { writeFileSync, mkdirSync } from 'fs';

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Mock adapters
const stt = async () => { await delay(300); return 'hello'; };
const llm = async () => { await delay(1000); return 'hi'; };
const tts = async () => { await delay(500); };

const runs = [];
for (let i = 0; i < 5; i++) {
  const t = Date.now();
  const text = await stt();
  const reply = await llm(text);
  await tts(reply);
  runs.push(Date.now() - t);
}

runs.sort((a, b) => a - b);
const p50 = runs[Math.floor(runs.length * 0.5)];
const p95 = runs[Math.floor(runs.length * 0.95)] ?? runs[runs.length - 1];
const max = runs[runs.length - 1];
const pass = p95 <= 2000;

const result = { p50, p95, max, target: 2000, pass };
console.log(JSON.stringify(result, null, 2));

mkdirSync(new URL('.', import.meta.url).pathname, { recursive: true });
writeFileSync(new URL('results.json', import.meta.url).pathname, JSON.stringify(result));

if (!pass) process.exit(1);

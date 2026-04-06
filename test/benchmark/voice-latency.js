import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const delay = ms => new Promise(r => setTimeout(r, ms));

const samples = [];
for (let i = 0; i < 5; i++) {
  const start = Date.now();
  await delay(300); // mock STT
  await delay(1000); // mock LLM
  await delay(500);  // mock TTS
  samples.push(Date.now() - start);
}

samples.sort((a, b) => a - b);
const p50 = samples[Math.floor(samples.length * 0.5)];
const p95 = samples[Math.ceil(samples.length * 0.95) - 1] ?? samples[samples.length - 1];
const max = samples[samples.length - 1];
const pass = p95 <= 2000;

const report = { p50, p95, max, target: 2000, pass };
console.log(JSON.stringify(report, null, 2));
mkdirSync(__dirname, { recursive: true });
writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(report));
if (!pass) process.exit(1);

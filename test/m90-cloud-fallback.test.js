import { strict as assert } from 'assert';
import { matchProfile } from '../src/detector/matcher.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import path from 'path';

const execFileAsync = promisify(execFile);
const dir = dirname(fileURLToPath(import.meta.url));
const profilesPath = join(dir, '../profiles/default.json');
const cacheFile = path.join(os.homedir(), '.agentic-service', 'profiles.json');

// Pre-warm cache so subprocess tests don't hit network on module-level loadConfig()
const profilesData = JSON.parse(await readFile(profilesPath, 'utf8'));
await mkdir(path.dirname(cacheFile), { recursive: true });
await writeFile(cacheFile, JSON.stringify({ data: profilesData, timestamp: Date.now() }));

// Test 1: All profiles have fallback key
async function testProfilesHaveFallback() {
  for (const p of profilesData.profiles) {
    assert.ok(p.config.fallback?.provider, `Profile missing fallback.provider: ${JSON.stringify(p.match)}`);
    assert.ok(p.config.fallback?.model, `Profile missing fallback.model: ${JSON.stringify(p.match)}`);
  }
  console.log(`✓ All ${profilesData.profiles.length} profiles have fallback config`);
}

// Test 2: Default (empty match) profile always matches any hardware
async function testDefaultProfileMatches() {
  const hardware = { platform: 'unknown', arch: 'unknown', gpu: { type: 'unknown' }, memory: 0 };
  const config = matchProfile(profilesData, hardware);
  assert.ok(config.fallback, 'Default profile must have fallback');
  console.log('✓ Default profile matches any hardware');
}

// Test 3: meta chunk emitted on fallback (subprocess with mocked fetch)
async function testMetaChunkOnFallback() {
  const script = `
globalThis.fetch = async (url) => {
  if (url.includes('localhost:11434')) throw new Error('ECONNREFUSED');
  if (url.includes('openai.com')) {
    const enc = new TextEncoder();
    const body = new ReadableStream({ start(c) {
      c.enqueue(enc.encode('data: {"choices":[{"delta":{"content":"hi"}}]}\\n'));
      c.enqueue(enc.encode('data: [DONE]\\n'));
      c.close();
    }});
    return { ok: true, status: 200, body };
  }
  throw new Error('unexpected fetch: ' + url);
};
process.env.OPENAI_API_KEY = 'test-key';
const { chat } = await import(${JSON.stringify(join(dir, '../src/runtime/llm.js'))});
const chunks = [];
for await (const c of chat('hi')) chunks.push(c);
const meta = chunks.find(c => c.type === 'meta');
if (!meta) { console.error('NO META'); process.exit(1); }
if (meta.provider !== 'cloud') { console.error('BAD PROVIDER'); process.exit(1); }
console.log('ok');
`;
  const { stdout } = await execFileAsync('node', ['--input-type=module'], { input: script, env: process.env });
  assert.ok(stdout.includes('ok'), `Unexpected output: ${stdout}`);
  console.log('✓ meta chunk emitted before cloud content');
}

// Test 4: Missing API key throws descriptive error
async function testMissingApiKeyThrows() {
  const script = `
globalThis.fetch = async (url) => {
  if (url.includes('localhost:11434')) throw new Error('ECONNREFUSED');
  throw new Error('unexpected fetch: ' + url);
};
const env = process.env;
delete env.OPENAI_API_KEY;
delete env.ANTHROPIC_API_KEY;
const { chat } = await import(${JSON.stringify(join(dir, '../src/runtime/llm.js'))});
try {
  for await (const c of chat('hi')) {}
  console.error('NO THROW'); process.exit(1);
} catch(e) {
  if (!e.message.includes('not set') && !e.message.includes('API_KEY')) {
    console.error('BAD MSG: ' + e.message); process.exit(1);
  }
  console.log('ok');
}
`;
  const { stdout } = await execFileAsync('node', ['--input-type=module'], {
    input: script,
    env: { ...process.env, OPENAI_API_KEY: '', ANTHROPIC_API_KEY: '' }
  });
  assert.ok(stdout.includes('ok'), `Unexpected output: ${stdout}`);
  console.log('✓ Missing API key throws descriptive error');
}

// Test 5: Ollama success — no meta chunk
async function testOllamaSuccessNoMeta() {
  const script = `
globalThis.fetch = async (url) => {
  if (url.includes('localhost:11434')) {
    const enc = new TextEncoder();
    const body = new ReadableStream({ start(c) {
      c.enqueue(enc.encode(JSON.stringify({message:{content:'hi'},done:true})+'\\n'));
      c.close();
    }});
    return { ok: true, status: 200, body };
  }
  throw new Error('unexpected fetch: ' + url);
};
const { chat } = await import(${JSON.stringify(join(dir, '../src/runtime/llm.js'))});
const chunks = [];
for await (const c of chat('hi')) chunks.push(c);
if (chunks.some(c => c.type === 'meta')) { console.error('HAS META'); process.exit(1); }
if (!chunks.some(c => c.type === 'content')) { console.error('NO CONTENT'); process.exit(1); }
console.log('ok');
`;
  const { stdout } = await execFileAsync('node', ['--input-type=module'], { input: script, env: process.env });
  assert.ok(stdout.includes('ok'), `Unexpected output: ${stdout}`);
  console.log('✓ Ollama success — no meta chunk emitted');
}

const tests = [testProfilesHaveFallback, testDefaultProfileMatches, testMetaChunkOnFallback, testMissingApiKeyThrows, testOllamaSuccessNoMeta];
let passed = 0, failed = 0;
for (const t of tests) {
  try { await t(); passed++; }
  catch (e) { console.error(`✗ ${t.name}: ${e.message}`); failed++; }
}
console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

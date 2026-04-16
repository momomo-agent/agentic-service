// M93: Verify cloud fallback and npx entrypoint
import { describe, it, expect, beforeAll } from 'vitest';
import { matchProfile } from '../src/detector/matcher.js';
import { readFile, writeFile, mkdir, unlink } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import path from 'path';

const execFileAsync = promisify(execFile);
const dir = dirname(fileURLToPath(import.meta.url));
const root = join(dir, '..');
const profilesPath = join(root, 'profiles/default.json');
const cacheFile = path.join(os.homedir(), '.agentic-service', 'profiles.json');

let profilesData;

async function setup() {
  profilesData = JSON.parse(await readFile(profilesPath, 'utf8'));
  await mkdir(path.dirname(cacheFile), { recursive: true });
  await writeFile(cacheFile, JSON.stringify({ data: profilesData, timestamp: Date.now() }));
}

async function runScript(code, env = {}) {
  const tmp = path.join(os.tmpdir(), `llm-test-${Date.now()}.mjs`);
  await writeFile(tmp, code);
  try {
    const { stdout } = await execFileAsync('node', [tmp], {
      env: { ...process.env, ...env },
      timeout: 20000
    });
    return stdout.trim();
  } finally {
    await unlink(tmp).catch(() => {});
  }
}

describe('M93 Cloud Fallback + NPX Entrypoint tests', () => {
  beforeAll(setup);

  it('bin/agentic-service.js --help exits 0', async () => {
    const { stdout } = await execFileAsync('node', ['bin/agentic-service.js', '--help'], {
      cwd: root, timeout: 10000
    });
    expect(stdout).toContain('Usage:');
    expect(stdout).toContain('agentic-service');
  });

  it('bin/agentic-service.js --version exits 0', async () => {
    const { stdout } = await execFileAsync('node', ['bin/agentic-service.js', '--version'], {
      cwd: root, timeout: 10000
    });
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('All profiles have fallback config', () => {
    for (const p of profilesData.profiles) {
      expect(p.config.fallback?.provider).toBeTruthy();
      expect(p.config.fallback?.model).toBeTruthy();
    }
  });

  it('Default profile matches any hardware', () => {
    const hardware = { platform: 'unknown', arch: 'unknown', gpu: { type: 'unknown' }, memory: 0 };
    const config = matchProfile(profilesData, hardware);
    expect(config.fallback).toBeTruthy();
  });

  it('Ollama fail → OpenAI fallback yields meta + content chunks', async () => {
    const out = await runScript(`
globalThis.fetch = async (url) => {
  if (url.includes('localhost:11434')) throw new Error('ECONNREFUSED');
  if (url.includes('openai.com')) {
    const enc = new TextEncoder();
    const body = new ReadableStream({ start(c) {
      c.enqueue(enc.encode('data: {"choices":[{"delta":{"content":"hello from cloud"}}]}\\n'));
      c.enqueue(enc.encode('data: [DONE]\\n'));
      c.close();
    }});
    return { ok: true, status: 200, body };
  }
  if (url.includes('githubusercontent.com')) return { ok: false, status: 404 };
  throw new Error('unexpected fetch: ' + url);
};
process.env.OPENAI_API_KEY = 'test-key';
const { chat } = await import(${JSON.stringify(join(root, 'src/runtime/llm.js'))});
const chunks = [];
for await (const c of chat('hi')) chunks.push(c);
const meta = chunks.find(c => c.type === 'meta');
const content = chunks.find(c => c.type === 'content');
if (!meta || meta.provider !== 'cloud') { console.error('NO META'); process.exit(1); }
if (!content || !content.content) { console.error('NO CONTENT'); process.exit(1); }
console.log('ok');
process.exit(0);
`, { OPENAI_API_KEY: 'test-key' });
    expect(out).toContain('ok');
  });

  it('Ollama fail → Anthropic fallback yields content chunks', async () => {
    const anthropicProfile = {
      profiles: [{
        match: {},
        config: {
          llm: { provider: 'ollama', model: 'llama3' },
          stt: { provider: 'default' },
          tts: { provider: 'default' },
          fallback: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' }
        }
      }]
    };
    const profilesJson = JSON.stringify({ data: anthropicProfile, timestamp: Date.now() });

    const out = await runScript(`
import { writeFile, mkdir } from 'fs/promises';
import os from 'os';
import path from 'path';
const cacheFile = path.join(os.homedir(), '.agentic-service', 'profiles.json');
await mkdir(path.dirname(cacheFile), { recursive: true });
await writeFile(cacheFile, ${JSON.stringify(profilesJson)});
globalThis.fetch = async (url) => {
  if (url.includes('localhost:11434')) throw new Error('ECONNREFUSED');
  if (url.includes('anthropic.com')) {
    const enc = new TextEncoder();
    const body = new ReadableStream({ start(c) {
      c.enqueue(enc.encode('data: {"type":"content_block_delta","delta":{"text":"hi from claude"}}\\n'));
      c.enqueue(enc.encode('data: [DONE]\\n'));
      c.close();
    }});
    return { ok: true, status: 200, body };
  }
  if (url.includes('githubusercontent.com')) return { ok: false, status: 404 };
  throw new Error('unexpected fetch: ' + url);
};
process.env.ANTHROPIC_API_KEY = 'test-key';
const { chat } = await import(${JSON.stringify(join(root, 'src/runtime/llm.js'))});
const chunks = [];
for await (const c of chat('hi')) chunks.push(c);
const meta = chunks.find(c => c.type === 'meta');
const content = chunks.find(c => c.type === 'content');
if (!meta || meta.provider !== 'cloud') { console.error('NO META'); process.exit(1); }
if (!content || !content.content) { console.error('NO CONTENT'); process.exit(1); }
console.log('ok');
process.exit(0);
`, { ANTHROPIC_API_KEY: 'test-key' });
    expect(out).toContain('ok');

    await writeFile(cacheFile, JSON.stringify({ data: profilesData, timestamp: Date.now() }));
  });

  it('Missing API key throws descriptive error on fallback', async () => {
    const out = await runScript(`
globalThis.fetch = async (url) => {
  if (url.includes('localhost:11434')) throw new Error('ECONNREFUSED');
  if (url.includes('githubusercontent.com')) return { ok: false, status: 404 };
  throw new Error('unexpected fetch: ' + url);
};
const { chat } = await import(${JSON.stringify(join(root, 'src/runtime/llm.js'))});
try {
  for await (const c of chat('hi')) {}
  console.error('NO THROW'); process.exit(1);
} catch(e) {
  if (!e.message.includes('not set') && !e.message.includes('API_KEY')) {
    console.error('BAD MSG: ' + e.message); process.exit(1);
  }
  console.log('ok');
  process.exit(0);
}
`, { OPENAI_API_KEY: '', ANTHROPIC_API_KEY: '' });
    expect(out).toContain('ok');
  });

  it('Ollama success — no meta chunk, direct content', async () => {
    const out = await runScript(`
globalThis.fetch = async (url) => {
  if (url.includes('localhost:11434')) {
    const enc = new TextEncoder();
    const body = new ReadableStream({ start(c) {
      c.enqueue(enc.encode(JSON.stringify({message:{content:'hello from ollama'},done:true})+'\\n'));
      c.close();
    }});
    return { ok: true, status: 200, body };
  }
  if (url.includes('githubusercontent.com')) return { ok: false, status: 404 };
  throw new Error('unexpected fetch: ' + url);
};
const { chat } = await import(${JSON.stringify(join(root, 'src/runtime/llm.js'))});
const chunks = [];
for await (const c of chat('hi')) chunks.push(c);
if (chunks.some(c => c.type === 'meta')) { console.error('HAS META'); process.exit(1); }
if (!chunks.some(c => c.type === 'content')) { console.error('NO CONTENT'); process.exit(1); }
console.log('ok');
process.exit(0);
`);
    expect(out).toContain('ok');
  });
});

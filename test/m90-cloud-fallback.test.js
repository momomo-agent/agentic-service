import { strict as assert } from 'assert';
import { matchProfile } from '../src/detector/matcher.js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const dir = dirname(fileURLToPath(import.meta.url));

async function collect(gen) {
  const chunks = [];
  for await (const c of gen) chunks.push(c);
  return chunks;
}

function makeOllamaStream(content) {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(ctrl) {
      ctrl.enqueue(enc.encode(JSON.stringify({ message: { content }, done: true }) + '\n'));
      ctrl.close();
    }
  });
}

function makeOpenAIStream(content) {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(ctrl) {
      ctrl.enqueue(enc.encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n`));
      ctrl.enqueue(enc.encode('data: [DONE]\n'));
      ctrl.close();
    }
  });
}

// Test 1: All profiles have fallback key
async function testProfilesHaveFallback() {
  const raw = await readFile(join(dir, '../profiles/default.json'), 'utf8');
  const { profiles } = JSON.parse(raw);
  for (const p of profiles) {
    assert.ok(p.config.fallback?.provider, `Profile missing fallback.provider: ${JSON.stringify(p.match)}`);
    assert.ok(p.config.fallback?.model, `Profile missing fallback.model: ${JSON.stringify(p.match)}`);
  }
  console.log(`✓ All ${profiles.length} profiles have fallback config`);
}

// Test 2: Default (empty match) profile always matches any hardware
async function testDefaultProfileMatches() {
  const raw = await readFile(join(dir, '../profiles/default.json'), 'utf8');
  const profilesData = JSON.parse(raw);
  const hardware = { platform: 'unknown', arch: 'unknown', gpu: { type: 'unknown' }, memory: 0 };
  const config = matchProfile(profilesData, hardware);
  assert.ok(config.fallback, 'Default profile must have fallback');
  console.log('✓ Default profile matches any hardware');
}

// Test 3: meta chunk emitted before cloud content on fallback
async function testMetaChunkOnFallback() {
  const orig = globalThis.fetch;
  const profilesData = JSON.parse(await readFile(join(dir, '../profiles/default.json'), 'utf8'));

  globalThis.fetch = async (url) => {
    if (url.includes('localhost:11434')) throw new Error('ECONNREFUSED');
    if (url.includes('openai.com')) return { ok: true, status: 200, body: makeOpenAIStream('hello') };
    // profiles/CDN fetch
    return { ok: true, status: 200, json: async () => profilesData, text: async () => JSON.stringify(profilesData) };
  };
  process.env.OPENAI_API_KEY = 'test-key';

  try {
    const { chat } = await import('../src/runtime/llm.js?t=' + Date.now());
    const chunks = await collect(chat('hi'));
    const metaIdx = chunks.findIndex(c => c.type === 'meta');
    assert.ok(metaIdx >= 0, 'Should emit meta chunk');
    assert.equal(chunks[metaIdx].provider, 'cloud');
    const contentAfter = chunks.slice(metaIdx + 1).some(c => c.type === 'content');
    assert.ok(contentAfter, 'Content chunks should follow meta');
    console.log('✓ meta chunk emitted before cloud content');
  } finally {
    globalThis.fetch = orig;
    delete process.env.OPENAI_API_KEY;
  }
}

// Test 4: Missing API key throws descriptive error
async function testMissingApiKeyThrows() {
  const orig = globalThis.fetch;
  const profilesData = JSON.parse(await readFile(join(dir, '../profiles/default.json'), 'utf8'));

  globalThis.fetch = async (url) => {
    if (url.includes('localhost:11434')) throw new Error('ECONNREFUSED');
    return { ok: true, status: 200, json: async () => profilesData, text: async () => JSON.stringify(profilesData) };
  };
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;

  try {
    const { chat } = await import('../src/runtime/llm.js?t2=' + Date.now());
    let threw = false;
    try { await collect(chat('hi')); } catch (e) {
      threw = true;
      assert.ok(e.message.includes('not set') || e.message.includes('API_KEY'), `Got: ${e.message}`);
    }
    assert.ok(threw, 'Should throw on missing API key');
    console.log('✓ Missing API key throws descriptive error');
  } finally {
    globalThis.fetch = orig;
  }
}

// Test 5: Ollama success — no meta chunk
async function testOllamaSuccessNoMeta() {
  const orig = globalThis.fetch;
  const profilesData = JSON.parse(await readFile(join(dir, '../profiles/default.json'), 'utf8'));

  globalThis.fetch = async (url) => {
    if (url.includes('localhost:11434')) return { ok: true, status: 200, body: makeOllamaStream('hi') };
    return { ok: true, status: 200, json: async () => profilesData, text: async () => JSON.stringify(profilesData) };
  };

  try {
    const { chat } = await import('../src/runtime/llm.js?t3=' + Date.now());
    const chunks = await collect(chat('hi'));
    assert.ok(!chunks.some(c => c.type === 'meta'), 'No meta chunk when Ollama succeeds');
    assert.ok(chunks.some(c => c.type === 'content'), 'Should have content chunks');
    console.log('✓ Ollama success — no meta chunk emitted');
  } finally {
    globalThis.fetch = orig;
  }
}

const tests = [testProfilesHaveFallback, testDefaultProfileMatches, testMetaChunkOnFallback, testMissingApiKeyThrows, testOllamaSuccessNoMeta];
let passed = 0, failed = 0;
for (const t of tests) {
  try { await t(); passed++; }
  catch (e) { console.error(`✗ ${t.name}: ${e.message}`); failed++; }
}
console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

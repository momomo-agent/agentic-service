// Tests for agentic-voice adapter integration — stt.js + tts.js
import { strict as assert } from 'assert';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

let passed = 0, failed = 0;
async function test(name, fn) {
  try { await fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (e) { console.log(`  ✗ ${name}: ${e.message}`); failed++; }
}

console.log('agentic-voice adapter tests');

// Test 1: package.json imports map covers all agentic-voice subpaths
await test('package.json imports map covers all agentic-voice subpaths', async () => {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const imports = pkg.imports ?? {};
  const required = [
    'agentic-voice/openai-whisper',
    'agentic-voice/openai-tts',
    'agentic-voice/sensevoice',
    'agentic-voice/kokoro',
    'agentic-voice/whisper',
    'agentic-voice/piper',
  ];
  for (const key of required) {
    assert.ok(imports[key], `Missing import map entry: ${key}`);
  }
});

// Test 2: adapter files exist
await test('all adapter files exist', async () => {
  const { existsSync } = await import('fs');
  const adapters = ['openai-whisper.js', 'openai-tts.js', 'sensevoice.js', 'kokoro.js', 'piper.js'];
  for (const f of adapters) {
    assert.ok(existsSync(join(root, 'src/runtime/adapters/voice', f)), `Missing adapter: ${f}`);
  }
});

// Test 3: openai-whisper exports transcribe function
await test('openai-whisper exports transcribe()', async () => {
  const mod = await import('../src/runtime/adapters/voice/openai-whisper.js');
  assert.equal(typeof mod.transcribe, 'function');
});

// Test 4: openai-tts exports synthesize function
await test('openai-tts exports synthesize()', async () => {
  const mod = await import('../src/runtime/adapters/voice/openai-tts.js');
  assert.equal(typeof mod.synthesize, 'function');
});

// Test 5: transcribe throws NO_API_KEY when OPENAI_API_KEY missing
await test('transcribe throws NO_API_KEY without OPENAI_API_KEY', async () => {
  const saved = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const { transcribe } = await import('../src/runtime/adapters/voice/openai-whisper.js');
  try {
    await assert.rejects(() => transcribe(Buffer.from('audio')), (e) => e.code === 'NO_API_KEY');
  } finally {
    if (saved !== undefined) process.env.OPENAI_API_KEY = saved;
  }
});

// Test 6: synthesize throws NO_API_KEY when OPENAI_API_KEY missing
await test('synthesize throws NO_API_KEY without OPENAI_API_KEY', async () => {
  const saved = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const { synthesize } = await import('../src/runtime/adapters/voice/openai-tts.js');
  try {
    await assert.rejects(() => synthesize('hello'), (e) => e.code === 'NO_API_KEY');
  } finally {
    if (saved !== undefined) process.env.OPENAI_API_KEY = saved;
  }
});

// Test 7: sensevoice and kokoro and piper export correct functions
await test('stub adapters export correct function signatures', async () => {
  const sensevoice = await import('../src/runtime/adapters/voice/sensevoice.js');
  const kokoro = await import('../src/runtime/adapters/voice/kokoro.js');
  const piper = await import('../src/runtime/adapters/voice/piper.js');
  assert.equal(typeof sensevoice.transcribe, 'function', 'sensevoice.transcribe');
  assert.equal(typeof kokoro.synthesize, 'function', 'kokoro.synthesize');
  assert.equal(typeof piper.synthesize, 'function', 'piper.synthesize');
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

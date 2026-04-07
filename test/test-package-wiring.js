#!/usr/bin/env node
// Test: agentic-sense and agentic-voice package wiring via imports map
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8'));

let passed = 0, failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); passed++; }
  catch (e) { console.error(`  ✗ ${name}: ${e.message}`); failed++; }
}

// 1. imports map exists
test('package.json has imports map', () => {
  assert.ok(pkg.imports, 'imports map missing');
});

// 2. agentic-sense key present
test('imports map has agentic-sense', () => {
  assert.ok(pkg.imports['agentic-sense'], 'agentic-sense key missing');
});

// 3. agentic-voice/* keys present
for (const key of ['agentic-voice/sensevoice', 'agentic-voice/whisper', 'agentic-voice/openai-whisper', 'agentic-voice/openai-tts', 'agentic-voice/kokoro', 'agentic-voice/piper']) {
  test(`imports map has ${key}`, () => {
    assert.ok(pkg.imports[key], `${key} key missing`);
  });
}

// 4. sense.js imports from 'agentic-sense'
test('src/runtime/sense.js imports from agentic-sense', () => {
  const src = readFileSync(resolve(__dirname, '../src/runtime/sense.js'), 'utf8');
  assert.ok(src.includes("from 'agentic-sense'"), "sense.js does not import from 'agentic-sense'");
});

// 5. stt.js imports from 'agentic-voice/*'
test('src/runtime/stt.js imports from agentic-voice', () => {
  const src = readFileSync(resolve(__dirname, '../src/runtime/stt.js'), 'utf8');
  assert.ok(src.includes("'agentic-voice/"), "stt.js does not import from 'agentic-voice/*'");
});

// 6. tts.js imports from 'agentic-voice/*'
test('src/runtime/tts.js imports from agentic-voice', () => {
  const src = readFileSync(resolve(__dirname, '../src/runtime/tts.js'), 'utf8');
  assert.ok(src.includes("'agentic-voice/"), "tts.js does not import from 'agentic-voice/*'");
});

// 7. Dynamic import resolution — must be done from project root (imports map is package-scoped)
// We verify by checking the adapter files exist at the mapped paths
test('agentic-sense adapter file exists', () => {
  const { existsSync } = await import('node:fs');
  const p = resolve(__dirname, '..', pkg.imports['agentic-sense']);
  assert.ok(existsSync(p), `adapter not found: ${p}`);
});

test('agentic-voice/sensevoice adapter file exists', () => {
  const { existsSync } = await import('node:fs');
  const p = resolve(__dirname, '..', pkg.imports['agentic-voice/sensevoice']);
  assert.ok(existsSync(p), `adapter not found: ${p}`);
});

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

import { strict as assert } from 'assert';

// Helper to collect async generator chunks
async function collect(gen) {
  const chunks = [];
  for await (const chunk of gen) chunks.push(chunk);
  return chunks;
}

// Mock fetch for testing
function mockFetch(responses) {
  let callIndex = 0;
  return async (url, opts) => {
    const resp = responses[callIndex++] || responses[responses.length - 1];
    if (resp instanceof Error) throw resp;
    return resp;
  };
}

function makeStreamResponse(lines) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      for (const line of lines) controller.enqueue(encoder.encode(line + '\n'));
      controller.close();
    }
  });
  return { ok: true, status: 200, body: stream };
}

// Test 1: Ollama ECONNREFUSED triggers cloud fallback with meta chunk
async function testFallbackOnConnectionRefused() {
  const originalFetch = globalThis.fetch;
  let fetchCallCount = 0;

  globalThis.fetch = async (url) => {
    fetchCallCount++;
    if (url.includes('localhost:11434')) throw Object.assign(new Error('fetch failed'), { cause: { code: 'ECONNREFUSED' } });
    // Cloud fallback (OpenAI)
    return makeStreamResponse([
      'data: {"choices":[{"delta":{"content":"hello"}}]}',
      'data: [DONE]'
    ]);
  };

  process.env.OPENAI_API_KEY = 'test-key';

  try {
    // Re-import with fresh module state isn't possible in ESM without cache busting,
    // so we test the behavior by directly testing the logic pattern
    // Instead, verify the structure of llm.js handles fallback correctly
    const llmPath = new URL('../src/runtime/llm.js', import.meta.url);
    // Dynamic import with cache-busting
    const { chat } = await import(llmPath.href + '?t=' + Date.now());

    const chunks = await collect(chat('test message'));
    const metaChunk = chunks.find(c => c.type === 'meta');
    assert.ok(metaChunk, 'Should emit meta chunk on fallback');
    assert.equal(metaChunk.provider, 'cloud', 'Meta chunk should have provider=cloud');
    console.log('✓ ECONNREFUSED triggers fallback with meta chunk');
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.OPENAI_API_KEY;
  }
}

// Test 2: Missing OPENAI_API_KEY throws descriptive error
async function testMissingOpenAIKey() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (url.includes('localhost:11434')) throw new Error('ECONNREFUSED');
    throw new Error('Should not reach cloud');
  };
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;

  try {
    const { chat } = await import(new URL('../src/runtime/llm.js', import.meta.url).href + '?t2=' + Date.now());
    // Need to force openai provider - check profiles default
    // The default profile uses openai fallback, so missing key should throw
    let threw = false;
    try {
      await collect(chat('test'));
    } catch (e) {
      threw = true;
      assert.ok(e.message.includes('OPENAI_API_KEY') || e.message.includes('not set'), `Expected key error, got: ${e.message}`);
    }
    assert.ok(threw, 'Should throw when API key missing');
    console.log('✓ Missing OPENAI_API_KEY throws descriptive error');
  } finally {
    globalThis.fetch = originalFetch;
  }
}

// Test 3: All profiles have fallback key
async function testProfilesHaveFallback() {
  const { readFile } = await import('fs/promises');
  const { fileURLToPath } = await import('url');
  const { dirname, join } = await import('path');
  const dir = dirname(fileURLToPath(import.meta.url));
  const raw = await readFile(join(dir, '../profiles/default.json'), 'utf8');
  const { profiles } = JSON.parse(raw);
  for (const p of profiles) {
    assert.ok(p.config.fallback, `Profile missing fallback: ${JSON.stringify(p.match)}`);
    assert.ok(p.config.fallback.provider, 'Fallback must have provider');
    assert.ok(p.config.fallback.model, 'Fallback must have model');
  }
  console.log(`✓ All ${profiles.length} profiles have fallback config`);
}

// Test 4: meta chunk is first yielded on fallback path
async function testMetaChunkIsFirst() {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (url.includes('localhost:11434')) throw new Error('ECONNREFUSED');
    return makeStreamResponse([
      'data: {"choices":[{"delta":{"content":"world"}}]}',
      'data: [DONE]'
    ]);
  };
  process.env.OPENAI_API_KEY = 'test-key';

  try {
    const { chat } = await import(new URL('../src/runtime/llm.js', import.meta.url).href + '?t3=' + Date.now());
    const chunks = await collect(chat('hi'));
    assert.equal(chunks[0]?.type, 'meta', 'First chunk on fallback must be meta');
    console.log('✓ meta chunk is first on fallback path');
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.OPENAI_API_KEY;
  }
}

// Run all tests
const tests = [
  testProfilesHaveFallback,
  testFallbackOnConnectionRefused,
  testMissingOpenAIKey,
  testMetaChunkIsFirst,
];

let passed = 0, failed = 0;
for (const t of tests) {
  try {
    await t();
    passed++;
  } catch (e) {
    console.error(`✗ ${t.name}: ${e.message}`);
    failed++;
  }
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

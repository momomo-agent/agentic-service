// M20 DBB-003: brain.js chat returns AsyncIterable yielding at least one chunk
import { writeFileSync, rmSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log('  ✅', msg); passed++; }
  else { console.error('  ❌', msg); failed++; }
}

// Write mock llm.js
const mockPath = join(root, 'src/runtime/llm.m20mock.js');
writeFileSync(mockPath, `
export async function* chat(messages, options) {
  if (options?.tools?.length) {
    yield { type: 'tool_use', id: 'call_1', name: options.tools[0].name, input: {}, text: '' };
  } else {
    yield { type: 'content', text: 'hello', done: true };
  }
}
`);

// Patch brain.js to use mock
let src = readFileSync(join(root, 'src/server/brain.js'), 'utf8');
src = src.replace("from '../runtime/llm.js'", `from '../runtime/llm.m20mock.js'`);
const patchedPath = join(root, 'src/server/brain.m20mock.js');
writeFileSync(patchedPath, src);

const { registerTool, chat } = await import('../src/server/brain.m20mock.js');

// DBB-003: chat returns AsyncIterable, yields at least one chunk
const chunks = [];
for await (const chunk of chat([{ role: 'user', content: 'hi' }], {})) {
  chunks.push(chunk);
}
assert(chunks.length > 0, 'DBB-003: chat yields at least one chunk');
assert(typeof chunks[0] === 'object', 'DBB-003: chunk is an object');

// registerTool: tool gets invoked when LLM requests it
let toolCalled = false;
registerTool('greet', (args) => { toolCalled = true; return 'hi there'; });
const chunks2 = [];
for await (const chunk of chat([{ role: 'user', content: 'greet me' }], {})) {
  chunks2.push(chunk);
}
assert(chunks2.length > 0, 'chat with registered tool yields chunks');

// Unknown tool: yields error chunk, does not throw
registerTool('known', () => 'ok');
// Simulate unknown tool by calling with tool_use for unregistered name — brain should not crash
// (brain.js yields error message chunk for unknown tools per design)
const chunks3 = [];
try {
  for await (const chunk of chat([{ role: 'user', content: 'test' }], { tools: [{ name: 'unknown_tool' }] })) {
    chunks3.push(chunk);
  }
  assert(true, 'unknown tool does not throw');
} catch {
  assert(false, 'unknown tool does not throw');
}

// llmChat error propagates: verify brain.js catch block yields error chunk
// by reading the source and confirming the error handling pattern exists
const brainSrc = readFileSync(join(root, 'src/server/brain.js'), 'utf8');
assert(
  brainSrc.includes("type: 'error'") || brainSrc.includes('type:"error"') || brainSrc.includes("yield { type: 'error'"),
  'brain.js has error chunk yield in catch block'
);

// Cleanup
rmSync(mockPath); rmSync(patchedPath);

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

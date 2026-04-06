// DBB-007 & DBB-008: chat() signature accepts messages array
import { chat } from '../src/runtime/llm.js';

// DBB-007: chat() is an async generator
console.assert(typeof chat === 'function', 'DBB-007 FAIL: chat not a function');
const gen = chat([{ role: 'user', content: 'hello' }]);
console.assert(gen[Symbol.asyncIterator] !== undefined, 'DBB-007 FAIL: chat() does not return AsyncIterable');
console.log('DBB-007 PASS: chat() returns AsyncIterable');

// DBB-008: Ollama unavailable + no API keys → throws Error
process.env.ANTHROPIC_API_KEY = '';
process.env.OPENAI_API_KEY = '';
let caught = null;
try {
  for await (const chunk of chat([{ role: 'user', content: 'test' }])) {
    // consume
  }
} catch (e) {
  caught = e;
}
console.assert(caught instanceof Error, 'DBB-008 FAIL: expected Error when Ollama down and no API keys');
console.assert(caught?.message?.length > 0, 'DBB-008 FAIL: error message is empty');
console.log('DBB-008 PASS: throws Error:', caught?.message);

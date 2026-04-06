// DBB-007: brain.js tool_use response includes text field
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/server/brain.js', import.meta.url), 'utf8');

// All tool_use yields must include text field
const toolUseYields = [...src.matchAll(/yield\s*\{[^}]*type:\s*['"]tool_use['"][^}]*\}/gs)];
assert.ok(toolUseYields.length >= 1, 'Expected at least one tool_use yield');

for (const match of toolUseYields) {
  assert.ok(match[0].includes('text:'), `tool_use yield missing text field: ${match[0].trim()}`);
}

console.log(`PASS: brain.js ${toolUseYields.length} tool_use yield(s) all include text field (DBB-007)`);

import { test } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

test('m77-sense-imports', async () => {
let passed = 0, failed = 0;
function ok(name, cond) {
  if (cond) { console.log(`  PASS: ${name}`); passed++; }
  else { console.error(`  FAIL: ${name}`); failed++; }
}

const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
const imports = pkg.imports || {};

// 1. imports field exists
ok('package.json has imports field', !!pkg.imports);

// 2. agentic-sense key exists (with or without #)
const hasWithHash = '#agentic-sense' in imports;
const hasWithoutHash = 'agentic-sense' in imports;
ok('agentic-sense entry exists in imports', hasWithHash || hasWithoutHash);

// 3. Key must start with # for Node.js subpath imports spec
ok('agentic-sense key starts with # (Node.js spec)', hasWithHash);

// 4. Adapter file exists
const adapterPath = resolve('src/runtime/adapters/sense.js');
ok('src/runtime/adapters/sense.js exists', existsSync(adapterPath));

// 5. Adapter exports createPipeline
if (existsSync(adapterPath)) {
  const src = readFileSync(adapterPath, 'utf8');
  ok('sense.js exports createPipeline', src.includes('createPipeline'));
}

// 6. Runtime import resolves (requires # prefix)
try {
  await import('#agentic-sense');
  ok('import("#agentic-sense") resolves at runtime', true);
} catch (e) {
  ok('import("#agentic-sense") resolves at runtime', false);
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
});

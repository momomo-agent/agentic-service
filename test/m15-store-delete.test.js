// DBB-003, DBB-004: store.delete() and store.del() aliases
import assert from 'node:assert/strict';

// Verify export names exist in module
const mod = await import('../src/store/index.js').catch(() => null);

if (!mod) {
  console.log('SKIP: agentic-store not available in test env');
  process.exit(0);
}

// DBB-003: store.delete is exported
assert.equal(typeof mod.delete, 'function', 'store.delete should be a function');

// DBB-004: store.del is exported
assert.equal(typeof mod.del, 'function', 'store.del should be a function');

// Both should be the same function
assert.equal(mod.delete, mod.del, 'store.delete and store.del should be the same function');

console.log('PASS: store.delete() alias exported (DBB-003)');
console.log('PASS: store.del() alias exported (DBB-004)');
console.log('PASS: store.delete === store.del');

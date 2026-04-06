// DBB-006: hub.js heartbeat timeout is 60s (not 40s)
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/server/hub.js', import.meta.url), 'utf8');

// Verify 60000ms timeout values exist (not 40000)
const matches60k = [...src.matchAll(/>\s*60000/g)];
assert.ok(matches60k.length >= 2, `Expected at least 2 occurrences of > 60000, found ${matches60k.length}`);

const matches40k = [...src.matchAll(/>\s*40000/g)];
assert.equal(matches40k.length, 0, 'Should not have 40000ms timeout');

console.log('PASS: hub.js uses 60000ms heartbeat timeout (DBB-006)');

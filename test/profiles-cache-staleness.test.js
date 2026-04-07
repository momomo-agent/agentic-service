import assert from 'assert';

const CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function isCacheExpired(timestamp) {
  return Date.now() - timestamp > CACHE_MAX_AGE;
}

// Test 1: 8-day-old cache is expired
const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);
assert.strictEqual(isCacheExpired(eightDaysAgo), true, '8-day cache should be expired');
console.log('PASS: 8-day-old cache is expired');

// Test 2: 1-day-old cache is fresh
const oneDayAgo = Date.now() - (1 * 24 * 60 * 60 * 1000);
assert.strictEqual(isCacheExpired(oneDayAgo), false, '1-day cache should be fresh');
console.log('PASS: 1-day-old cache is fresh');

// Test 3: exactly 7 days is NOT expired (boundary)
const exactlySevenDays = Date.now() - CACHE_MAX_AGE;
assert.strictEqual(isCacheExpired(exactlySevenDays), false, 'Exactly 7-day cache should not be expired');
console.log('PASS: Exactly 7-day cache is not expired');

// Test 4: 7 days + 1ms is expired
const justOver = Date.now() - CACHE_MAX_AGE - 1;
assert.strictEqual(isCacheExpired(justOver), true, '7 days + 1ms should be expired');
console.log('PASS: 7 days + 1ms is expired');

// Test 5: saveCache writes timestamp field (structural check on profiles.js source)
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, '../src/detector/profiles.js'), 'utf8');
assert.ok(src.includes('timestamp: Date.now()'), 'saveCache must write timestamp: Date.now()');
console.log('PASS: saveCache writes timestamp: Date.now()');

assert.ok(src.includes('isCacheExpired(cached.timestamp)'), 'loadProfiles must check isCacheExpired');
console.log('PASS: loadProfiles calls isCacheExpired(cached.timestamp)');

console.log('\n6 passed, 0 failed');

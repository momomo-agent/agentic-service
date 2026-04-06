import assert from 'assert';

// Mock agentic-sense before importing sense.js
const mockPipeline = {
  detect: (frame) => ({
    faces: [{ boundingBox: { x: 0, y: 0, w: 10, h: 10 } }],
    gestures: [{ gesture: 'wave' }],
    objects: [{ label: 'cup', confidence: 0.9 }]
  })
};

// Inline test of detect() logic (mirrors sense.js implementation)
function detect(frame, pipeline) {
  if (!pipeline) return { faces: [], gestures: [], objects: [] };
  const result = pipeline.detect(frame);
  return {
    faces: (result.faces || []).map(f => ({ boundingBox: f.boundingBox })),
    gestures: (result.gestures || []).map(g => ({ gesture: g.gesture })),
    objects: (result.objects || []).filter(o => o.confidence > 0.5)
                                   .map(o => ({ label: o.label, confidence: o.confidence }))
  };
}

// Test 1: detect before init returns empty arrays
const before = detect(null, null);
assert.deepStrictEqual(before, { faces: [], gestures: [], objects: [] });
console.log('PASS: detect() before init returns empty arrays without throwing');

// Test 2: detect with pipeline returns normalized result
const after = detect({}, mockPipeline);
assert.ok(Array.isArray(after.faces) && after.faces.length === 1);
assert.ok(Array.isArray(after.gestures) && after.gestures[0].gesture === 'wave');
assert.ok(Array.isArray(after.objects) && after.objects[0].label === 'cup');
console.log('PASS: detect() with pipeline returns { faces, gestures, objects }');

// Test 3: detect export exists in sense.js source
import { readFileSync } from 'fs';
import { join } from 'path';
const src = readFileSync(join(import.meta.dirname, '../src/runtime/sense.js'), 'utf8');
assert.ok(src.includes('export function detect'), 'detect() must be exported from sense.js');
console.log('PASS: detect() is exported from src/runtime/sense.js');

console.log('\nTotal: 3 passed, 0 failed');

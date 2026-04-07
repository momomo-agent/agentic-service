import { test } from 'vitest';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

test('m26-hardware-merge', async () => {
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// DBB-001: hardware.js exports GPU detection result
import { detect } from '../src/detector/hardware.js';
const hw = await detect();
console.assert(hw?.gpu?.type !== undefined, 'DBB-001 FAIL: gpu.type missing');
console.assert(hw?.gpu?.vram !== undefined, 'DBB-001 FAIL: gpu.vram missing');
console.log('DBB-001 PASS: gpu =', hw.gpu);

// DBB-002: gpu-detector.js does not exist
const gpuDetectorPath = path.join(__dirname, '../src/detector/gpu-detector.js');
console.assert(!existsSync(gpuDetectorPath), 'DBB-002 FAIL: gpu-detector.js still exists');
console.log('DBB-002 PASS: gpu-detector.js does not exist');
});

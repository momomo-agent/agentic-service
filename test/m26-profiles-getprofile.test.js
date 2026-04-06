import { matchProfile } from '../src/detector/matcher.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const profiles = JSON.parse(readFileSync(path.join(__dirname, '../profiles/default.json'), 'utf-8'));

// DBB-003: apple-silicon profile
const appleHW = { platform: 'darwin', arch: 'arm64', gpu: { type: 'apple-silicon' }, memory: 16 };
const appleProfile = matchProfile(profiles, appleHW);
console.assert(appleProfile?.llm?.model, 'DBB-003 FAIL: no llm.model for apple-silicon');
console.log('DBB-003 PASS: apple-silicon profile =', appleProfile.llm.model);

// DBB-004: nvidia profile
const nvidiaHW = { platform: 'linux', arch: 'x64', gpu: { type: 'nvidia' }, memory: 8 };
const nvidiaProfile = matchProfile(profiles, nvidiaHW);
console.assert(nvidiaProfile?.llm?.model, 'DBB-004 FAIL: no llm.model for nvidia');
console.log('DBB-004 PASS: nvidia profile =', nvidiaProfile.llm.model);

// DBB-005: cpu-only profile (gpu: none)
const cpuHW = { platform: 'linux', arch: 'x64', gpu: { type: 'none' }, memory: 8 };
const cpuProfile = matchProfile(profiles, cpuHW);
console.assert(cpuProfile?.llm?.model, 'DBB-005 FAIL: no llm.model for cpu-only');
console.log('DBB-005 PASS: cpu-only profile =', cpuProfile.llm.model);

// DBB-006: empty hardware no crash
let threw = false;
try {
  const emptyProfile = matchProfile(profiles, {});
  console.assert(emptyProfile?.llm?.model, 'DBB-006 FAIL: no profile for empty hardware');
  console.log('DBB-006 PASS: empty hardware profile =', emptyProfile.llm.model);
} catch (e) {
  threw = true;
  console.error('DBB-006 FAIL: threw exception:', e.message);
}
console.assert(!threw, 'DBB-006 FAIL: should not throw');

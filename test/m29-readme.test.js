import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const readme = readFileSync(path.join(__dirname, '../README.md'), 'utf-8');

let passed = 0, failed = 0;
function assert(cond, msg) {
  if (cond) { console.log('PASS:', msg); passed++; }
  else { console.error('FAIL:', msg); failed++; }
}

assert(readme.includes('npx') || readme.includes('npm i -g'), 'Installation section exists');
assert(readme.includes('Quick Start'), 'Quick Start section exists');
assert(readme.includes('/api/chat'), 'API Reference: /api/chat');
assert(readme.includes('/api/transcribe'), 'API Reference: /api/transcribe');
assert(readme.includes('/api/synthesize'), 'API Reference: /api/synthesize');
assert(readme.includes('/api/status'), 'API Reference: /api/status');
assert(readme.includes('/api/config'), 'API Reference: /api/config');
assert(readme.includes('docker'), 'Docker section exists');
assert(readme.includes('PROFILES_URL') || readme.includes('profile'), 'Configuration section exists');
assert(readme.includes('Ollama') || readme.includes('port in use') || readme.includes('Troubleshoot'), 'Troubleshooting section exists');

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

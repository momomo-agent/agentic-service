// Tests for install/setup.sh — DBB-004
import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SETUP = path.join(ROOT, 'install/setup.sh');
const content = fs.readFileSync(SETUP, 'utf8');

describe('setup.sh tests (DBB-004)', () => {
  it('setup.sh exists', () => expect(fs.existsSync(SETUP)).toBe(true));
  it('setup.sh has shebang', () => expect(content.startsWith('#!/')).toBe(true));
  it('setup.sh has set -e', () => expect(content.includes('set -e')).toBe(true));

  it('errors when node not found (PATH without node)', () => {
    const result = spawnSync('sh', [SETUP], {
      cwd: ROOT,
      env: { PATH: '/usr/bin:/bin' },
      encoding: 'utf8',
      timeout: 5000,
    });
    expect(result.status).not.toBe(0);
    // Error message may vary by platform
    expect(result.stderr.length).toBeGreaterThan(0);
  });

  it('script checks Node.js >= 18', () => expect(content.includes('18')).toBe(true));
  it('script runs npm install', () => expect(content.includes('npm install')).toBe(true));
  it('script starts agentic-service', () => expect(content.includes('agentic-service') || content.includes('bin/')).toBe(true));
  it('npm install uses --prefer-offline for idempotency', () => expect(content.includes('--prefer-offline')).toBe(true));
});

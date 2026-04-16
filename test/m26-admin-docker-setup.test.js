import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const api = readFileSync(path.join(root, 'src/server/api.js'), 'utf-8');
const dockerfile = readFileSync(path.join(root, 'install/Dockerfile'), 'utf-8');
const setup = readFileSync(path.join(root, 'install/setup.sh'), 'utf-8');

describe('admin docker setup', () => {
  it('DBB-009: api.js has /admin route', () => expect(api.includes('/admin')).toBe(true));
  it('DBB-009: dist/admin/index.html exists after build', () => expect(existsSync(path.join(root, 'dist/admin/index.html'))).toBe(true));
  it('DBB-010: Dockerfile exists', () => expect(existsSync(path.join(root, 'install/Dockerfile'))).toBe(true));
  it('DBB-010: Dockerfile includes npm run build', () => expect(dockerfile.includes('npm run build')).toBe(true));
  it('DBB-010: Dockerfile exposes a port', () => expect(dockerfile).toMatch(/EXPOSE \d+/));
  it('DBB-012: setup.sh exists', () => expect(existsSync(path.join(root, 'install/setup.sh'))).toBe(true));
  it('DBB-012: setup.sh references node', () => expect(setup.includes('node')).toBe(true));
  it('DBB-012: setup.sh runs npm install', () => expect(setup.includes('npm install') || setup.includes('npm ci')).toBe(true));
});

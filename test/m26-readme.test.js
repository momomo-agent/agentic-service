import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const readme = readFileSync(path.join(__dirname, '../README.md'), 'utf-8');

describe('README docs', () => {
  it('DBB-013: README has npx agentic-service', () => expect(readme.includes('npx agentic-service')).toBe(true));
  it('DBB-014: README has docker section', () => expect(readme.includes('docker')).toBe(true));
  it('DBB-015: README documents /api/chat', () => expect(readme.includes('/api/chat')).toBe(true));
  it('DBB-015: README shows request body with message field', () => expect(readme.includes('message')).toBe(true));
});

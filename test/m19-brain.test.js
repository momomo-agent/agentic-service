import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const brainSrc = readFileSync(join(projectRoot, 'src/server/brain.js'), 'utf8');

describe('m19-brain', () => {
  it('exports registerTool', () => expect(brainSrc.includes('export function registerTool')).toBe(true));
  it('exports chat', () => expect(brainSrc.includes('export') && brainSrc.includes('chat')).toBe(true));
  it('uses tools Map', () => expect(brainSrc.includes('new Map()')).toBe(true));
  it('normalizes messages', () => expect(brainSrc.includes('normalizeMessages')).toBe(true));
});

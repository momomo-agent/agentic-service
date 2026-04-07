import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

const ROOT = resolve(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(`${ROOT}/package.json`, 'utf8'));

describe('M86: agentic-sense external package wiring', () => {
  it('agentic-sense dep uses file: reference', () => {
    expect(pkg.dependencies?.['agentic-sense']).toMatch(/^file:/);
  });

  it('imports map has #agentic-sense alias', () => {
    expect(pkg.imports?.['#agentic-sense']).toBeDefined();
  });

  it('#agentic-sense resolves to sense adapter', () => {
    expect(pkg.imports?.['#agentic-sense']).toMatch(/sense/i);
  });
});

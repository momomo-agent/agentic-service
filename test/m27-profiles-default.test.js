import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const profiles = JSON.parse(readFileSync(path.join(__dirname, '../profiles/default.json'), 'utf-8'));
const fallback = profiles.profiles.find(e => Object.keys(e.match).length === 0);

describe('profiles/default.json', () => {
  it('DBB-012: fallback profile exists (match: {})', () => expect(fallback).not.toBeNull());
  it('DBB-012: fallback has llm.model', () => expect(fallback?.config?.llm?.model).not.toBeNull());
  it('DBB-012: fallback model is lightweight', () => {
    const model = fallback?.config?.llm?.model || '';
    expect(model.includes('1b') || model.includes('2b') || model.includes('3b') || model.includes('mini')).toBe(true);
  });
  it('has version field', () => expect(profiles.version).not.toBeNull());
  it('has profiles array', () => expect(Array.isArray(profiles.profiles)).toBe(true));
  it('has at least 3 entries (apple, nvidia, fallback)', () => expect(profiles.profiles.length).toBeGreaterThanOrEqual(3));
});

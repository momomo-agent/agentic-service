import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const content = fs.readFileSync(path.join(ROOT, 'src/runtime/llm.js'), 'utf8');

describe('m26 llm.js chat() interface tests', () => {
  it('chat exported as async generator', () => {
    expect(content.includes('export async function* chat(')).toBe(true);
  });

  it('messages passed directly to chatWithOllama', () => {
    expect(content.includes('chatWithOllama(messages)')).toBe(true);
  });

  it('cloud fallback yields meta provider:cloud chunk', () => {
    expect(content.includes("type: 'meta', provider: 'cloud'")).toBe(true);
  });

  it('missing API key throws error', () => {
    expect(content.includes('throw new Error')).toBe(true);
  });
});

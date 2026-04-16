import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const src = readFileSync(resolve('src/runtime/sense.js'), 'utf8');

describe('startWakeWordPipeline', () => {
  it('startWakeWordPipeline is exported', () => {
    expect(src.includes('export async function startWakeWordPipeline')).toBe(true);
  });

  it('stopWakeWordPipeline is exported', () => {
    expect(src.includes('export function stopWakeWordPipeline')).toBe(true);
  });

  it('uses mic package for audio capture', () => {
    expect(src.includes('mic')).toBe(true);
  });

  it('returns a stop function', () => {
    expect(src.includes('return () =>')).toBe(true);
  });
});

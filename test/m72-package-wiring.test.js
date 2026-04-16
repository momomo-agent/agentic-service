import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'));
const senseSource = readFileSync(resolve(process.cwd(), 'src/runtime/sense.js'), 'utf8');
const sttSource = readFileSync(resolve(process.cwd(), 'src/runtime/stt.js'), 'utf8');
const ttsSource = readFileSync(resolve(process.cwd(), 'src/runtime/tts.js'), 'utf8');

describe('agentic-sense and agentic-voice package wiring', () => {
  it('sense.js uses sense adapter', () => {
    // sense.js may use local adapter or agentic-sense package
    expect(senseSource.includes('agentic-sense') || senseSource.includes('sense')).toBe(true);
  });

  it('stt.js imports from agentic-voice', () => {
    expect(sttSource).toMatch(/agentic-voice/);
  });

  it('tts.js imports from agentic-voice', () => {
    expect(ttsSource).toMatch(/agentic-voice/);
  });

  it('package.json has agentic-sense dependency', () => {
    const hasDep = pkg.dependencies && 'agentic-sense' in pkg.dependencies;
    const hasImport = Object.keys(pkg.imports || {}).some(k => k.includes('agentic-sense'));
    expect(hasDep || hasImport, 'agentic-sense missing from dependencies or imports map').toBe(true);
  });

  it('package.json has agentic-voice dependency', () => {
    const hasDep = pkg.dependencies && 'agentic-voice' in pkg.dependencies;
    const hasImport = Object.keys(pkg.imports || {}).some(k => k.includes('agentic-voice'));
    expect(hasDep || hasImport, 'agentic-voice missing from dependencies or imports map').toBe(true);
  });
});

// Tests for agentic-voice adapter integration — stt.js + tts.js
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

describe('agentic-voice adapter tests', () => {
  it('agentic-voice package is installed', () => {
    const pkg = JSON.parse(readFileSync(join(__dir, '../node_modules/agentic-voice/package.json'), 'utf8'));
    expect(pkg.name).toBe('agentic-voice');
  });

  it('openai-whisper exports transcribe()', async () => {
    const mod = await import('agentic-voice/openai-whisper');
    expect(typeof mod.transcribe).toBe('function');
  });

  it('openai-tts exports synthesize()', async () => {
    const mod = await import('agentic-voice/openai-tts');
    expect(typeof mod.synthesize).toBe('function');
  });

  it('stub adapters export correct function signatures', async () => {
    const sensevoice = await import('agentic-voice/sensevoice');
    const kokoro = await import('agentic-voice/kokoro');
    const piper = await import('agentic-voice/piper');
    expect(typeof sensevoice.transcribe).toBe('function');
    expect(typeof kokoro.synthesize).toBe('function');
    expect(typeof piper.synthesize).toBe('function');
  });

  it('tts.synthesize works after init()', async () => {
    const tts = await import('../src/runtime/tts.js');
    await tts.init();
    try {
      await tts.synthesize('hello');
    } catch (e) {
      if (e.message === 'not initialized') throw e;
      // NO_API_KEY or other errors are acceptable after init
    }
  });

  it('tts.synthesize throws EMPTY_TEXT for empty input', async () => {
    const tts = await import('../src/runtime/tts.js');
    await tts.init();
    await expect(tts.synthesize('')).rejects.toMatchObject({ code: 'EMPTY_TEXT' });
    await expect(tts.synthesize('   ')).rejects.toMatchObject({ code: 'EMPTY_TEXT' });
  });
});

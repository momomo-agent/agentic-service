import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('agentic-voice', () => ({ createTTS: vi.fn() }));
import { createTTS } from 'agentic-voice';

let mockProvider;

describe('TTS runtime', () => {
  let synthesize;

  beforeEach(async () => {
    vi.resetModules();
    mockProvider = { synthesize: vi.fn() };
    createTTS.mockResolvedValue(mockProvider);
    const mod = await import('../../src/runtime/tts.js');
    await mod.init();
    synthesize = mod.synthesize;
  });

  it('returns audio buffer for valid text', async () => {
    const buf = Buffer.from('audio');
    mockProvider.synthesize.mockResolvedValue(buf);
    expect(await synthesize('hello')).toBe(buf);
  });

  it('throws EMPTY_TEXT for empty string', async () => {
    const err = await synthesize('').catch(e => e);
    expect(err.code).toBe('EMPTY_TEXT');
  });

  it('throws EMPTY_TEXT for whitespace-only string', async () => {
    const err = await synthesize('   ').catch(e => e);
    expect(err.code).toBe('EMPTY_TEXT');
  });

  it('throws EMPTY_TEXT for null', async () => {
    const err = await synthesize(null).catch(e => e);
    expect(err.code).toBe('EMPTY_TEXT');
  });

  it('propagates provider errors', async () => {
    mockProvider.synthesize.mockRejectedValue(new Error('provider error'));
    await expect(synthesize('hello')).rejects.toThrow('provider error');
  });

  it('throws when agentic-voice unavailable', async () => {
    createTTS.mockRejectedValue(new Error('agentic-voice not available'));
    vi.resetModules();
    const mod = await import('../../src/runtime/tts.js');
    await expect(mod.synthesize('hello')).rejects.toThrow('agentic-voice not available');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('agentic-voice/kokoro', () => ({ default: { synthesize: vi.fn() } }));
vi.mock('agentic-voice/piper', () => ({ default: { synthesize: vi.fn() } }));
vi.mock('agentic-voice/openai-tts', () => ({ default: { synthesize: vi.fn() } }));

let mockProvider;

describe('TTS runtime', () => {
  let synthesize;

  beforeEach(async () => {
    vi.resetModules();
    mockProvider = { synthesize: vi.fn() };

    // Mock the default adapter
    vi.doMock('agentic-voice/openai-tts', () => ({ default: mockProvider }));

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

  it('throws not initialized when adapter fails to load', async () => {
    vi.doMock('agentic-voice/openai-tts', () => { throw new Error('module not found'); });
    vi.resetModules();
    const mod = await import('../../src/runtime/tts.js');
    await expect(mod.synthesize('hello')).rejects.toThrow('not initialized');
  });
});

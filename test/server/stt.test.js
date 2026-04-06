import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('agentic-voice', () => ({ createSTT: vi.fn() }));
import { createSTT } from 'agentic-voice';

let mockProvider;

describe('STT runtime', () => {
  let transcribe;

  beforeEach(async () => {
    vi.resetModules();
    mockProvider = { transcribe: vi.fn() };
    createSTT.mockResolvedValue(mockProvider);
    const mod = await import('../../src/runtime/stt.js');
    transcribe = mod.transcribe;
  });

  it('returns transcribed text for valid audio', async () => {
    mockProvider.transcribe.mockResolvedValue('hello world');
    expect(await transcribe(Buffer.from('audio-data'))).toBe('hello world');
  });

  it('throws EMPTY_AUDIO for empty buffer', async () => {
    const err = await transcribe(Buffer.alloc(0)).catch(e => e);
    expect(err.code).toBe('EMPTY_AUDIO');
  });

  it('throws EMPTY_AUDIO for null input', async () => {
    const err = await transcribe(null).catch(e => e);
    expect(err.code).toBe('EMPTY_AUDIO');
  });

  it('propagates agentic-voice errors', async () => {
    mockProvider.transcribe.mockRejectedValue(new Error('provider error'));
    await expect(transcribe(Buffer.from('data'))).rejects.toThrow('provider error');
  });

  it('throws when agentic-voice unavailable', async () => {
    createSTT.mockRejectedValue(new Error('agentic-voice not available'));
    vi.resetModules();
    const mod = await import('../../src/runtime/stt.js');
    await expect(mod.transcribe(Buffer.from('data'))).rejects.toThrow('agentic-voice not available');
  });
});

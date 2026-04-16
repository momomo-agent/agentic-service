import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/runtime/adapters/sense.js', () => ({
  createPipeline: vi.fn(() => ({ detect: vi.fn(() => ({ faces: [], gestures: [], objects: [] })) }))
}));

describe('startWakeWordPipeline', () => {
  beforeEach(() => { vi.resetModules(); });

  it('resolves without throwing when mic is unavailable', async () => {
    vi.doMock('mic', () => { throw new Error('not found'); });
    const { startWakeWordPipeline } = await import('../../src/runtime/sense.js');
    await expect(startWakeWordPipeline(vi.fn())).resolves.not.toThrow();
  });

  it('calls onWakeWord when audio RMS exceeds threshold', async () => {
    const mockStream = { on: vi.fn().mockReturnThis() };
    const mockMicInstance = { getAudioStream: vi.fn(() => mockStream), start: vi.fn(), stop: vi.fn() };
    vi.doMock('mic', () => ({ default: vi.fn(() => mockMicInstance) }));

    const { startWakeWordPipeline } = await import('../../src/runtime/sense.js');
    const onWakeWord = vi.fn();
    await startWakeWordPipeline(onWakeWord);

    const dataHandler = mockStream.on.mock.calls.find(([e]) => e === 'data')?.[1];
    expect(dataHandler).toBeDefined();

    // Buffer with high RMS (int16 values of 30000 → RMS > 0.01)
    const buf = Buffer.alloc(32);
    for (let i = 0; i < 32; i += 2) buf.writeInt16LE(30000, i);
    dataHandler(buf);

    expect(onWakeWord).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi } from 'vitest';

vi.mock('node:child_process', () => ({
  exec: vi.fn((cmd, cb) => cb(null, { stdout: 'ollama version 0.3.0' })),
  spawn: vi.fn(() => {
    const child = { stdout: { on: vi.fn() }, stderr: { on: vi.fn() }, on: vi.fn() };
    setTimeout(() => child.on.mock.calls.find(([e]) => e === 'close')?.[1](0), 0);
    return child;
  }),
}));

const mockProfile = { llm: { provider: 'ollama', model: 'gemma3:4b' } };

describe('optimizer.js setupOllama', () => {
  it('setupOllama returns the profile', async () => {
    const { setupOllama } = await import('../../src/detector/optimizer.js');
    const result = await setupOllama(mockProfile);
    expect(result).toBeTruthy();
  });

  it('setupOllama accepts a profile argument', async () => {
    const { setupOllama } = await import('../../src/detector/optimizer.js');
    const result = await setupOllama(mockProfile);
    expect(result).toBeDefined();
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/server/hub.js', () => ({
  getSession: vi.fn(() => ({ messages: [] })),
  broadcastSession: vi.fn(),
}));

vi.mock('../src/runtime/profiler.js', () => ({
  startMark: vi.fn(),
  endMark: vi.fn(() => 0),
}));

describe('M20 DBB-003: brain.js chat', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('chat yields at least one chunk', async () => {
    const mockResponse = {
      ok: true,
      body: {
        getReader: () => {
          let done = false;
          return {
            read: async () => {
              if (done) return { done: true };
              done = true;
              const line = JSON.stringify({ message: { content: 'Hi!' }, done: false }) + '\n';
              return { done: false, value: new TextEncoder().encode(line) };
            }
          };
        }
      }
    };
    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const { chat } = await import('../src/server/brain.js');
    const chunks = [];
    for await (const chunk of chat([{ role: 'user', content: 'hi' }], {})) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('registerTool does not throw', async () => {
    const { registerTool } = await import('../src/server/brain.js');
    expect(() => registerTool('my-tool', () => 'ok')).not.toThrow();
  });
});

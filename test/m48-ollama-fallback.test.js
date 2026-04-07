import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('../src/detector/hardware.js', () => ({
  detect: async () => ({ gpu: { type: 'cpu' }, cpu: { arch: 'x64' }, memory: { total: 8 }, os: 'linux' })
}));
vi.mock('../src/detector/profiles.js', () => ({
  getProfile: async () => ({ llm: { model: 'llama3' }, fallback: { provider: 'anthropic', model: 'claude-3-haiku-20240307' } }),
  watchProfiles: () => {}
}));

afterEach(() => vi.restoreAllMocks());

describe('Ollama non-200 fallback (DBB-006)', () => {
  it('falls back to cloud when Ollama returns non-200', async () => {
    const mockCloudReader = { read: vi.fn().mockResolvedValue({ done: true }) };
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, body: { getReader: () => mockCloudReader } })
    );
    process.env.ANTHROPIC_API_KEY = 'test-key';

    const { chat } = await import('../src/runtime/llm.js');
    try { for await (const _ of chat([{ role: 'user', content: 'hi' }])) {} } catch {}

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('11434');
  });

  it('does not call cloud when Ollama returns 200', async () => {
    const mockReader = {
      read: vi.fn()
        .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('{"message":{"content":"hi"},"done":true}\n') })
        .mockResolvedValueOnce({ done: true })
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      ok: true, body: { getReader: () => mockReader }
    }));

    const { chat } = await import('../src/runtime/llm.js');
    for await (const _ of chat([{ role: 'user', content: 'hi' }])) {}

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetch).mock.calls[0][0]).toContain('11434');
  });

  it('throws descriptive error when no API key for fallback', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ ok: false, status: 500 }));
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const { chat } = await import('../src/runtime/llm.js');
    await expect(async () => {
      for await (const _ of chat([{ role: 'user', content: 'hi' }])) {}
    }).rejects.toThrow(/API_KEY/);
  });
});

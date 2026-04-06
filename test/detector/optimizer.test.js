import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockExec = vi.fn();
const mockSpawn = vi.fn();

vi.mock('node:child_process', () => ({
  exec: (...args) => mockExec(...args),
  spawn: (...args) => mockSpawn(...args)
}));

vi.mock('ora', () => ({
  default: () => ({
    start: vi.fn().mockReturnThis(),
    succeed: vi.fn().mockReturnThis(),
    fail: vi.fn().mockReturnThis(),
    info: vi.fn().mockReturnThis(),
    text: ''
  })
}));

vi.mock('chalk', () => ({
  default: {
    red: (s) => s, yellow: (s) => s, cyan: (s) => s,
    white: (s) => s, gray: (s) => s
  }
}));

const mockProfile = { llm: { provider: 'ollama', model: 'gemma4:26b' } };

function makeExec(responses) {
  return (cmd, cb) => {
    const res = responses[cmd];
    if (res instanceof Error) cb(res);
    else cb(null, { stdout: res || '' });
  };
}

beforeEach(() => { vi.clearAllMocks(); });

describe('setupOllama', () => {
  it('returns installed=false when ollama not found', async () => {
    mockExec.mockImplementation((cmd, cb) => cb(new Error('not found')));
    const { setupOllama } = await import('../../src/detector/optimizer.js');
    const result = await setupOllama(mockProfile);
    expect(result.installed).toBe(false);
    expect(result.modelReady).toBe(false);
  });

  it('returns modelReady=true when model exists', async () => {
    mockExec.mockImplementation(makeExec({
      'ollama --version': 'ollama version is 0.1.26',
      'ollama list': 'gemma4:26b    abc123    15 GB    2 days ago'
    }));
    const { setupOllama } = await import('../../src/detector/optimizer.js');
    const result = await setupOllama(mockProfile);
    expect(result.installed).toBe(true);
    expect(result.version).toBe('0.1.26');
    expect(result.modelReady).toBe(true);
  });

  it('returns modelReady=false when pull fails', async () => {
    mockExec.mockImplementation(makeExec({
      'ollama --version': 'ollama version is 0.1.26',
      'ollama list': ''
    }));
    mockSpawn.mockReturnValue({
      stdout: { on: vi.fn() },
      stderr: { on: vi.fn() },
      on: vi.fn((event, cb) => { if (event === 'close') cb(1); })
    });
    const { setupOllama } = await import('../../src/detector/optimizer.js');
    const result = await setupOllama(mockProfile);
    expect(result.installed).toBe(true);
    expect(result.modelReady).toBe(false);
  });
});

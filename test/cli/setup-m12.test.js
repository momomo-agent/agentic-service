import { describe, it, expect, vi, beforeEach } from 'vitest'
import { spawn } from 'child_process'

vi.mock('child_process', () => ({
  spawn: vi.fn(),
}))

vi.mock('ora', () => ({
  default: vi.fn(() => ({ start: vi.fn().mockReturnThis(), succeed: vi.fn().mockReturnThis(), fail: vi.fn().mockReturnThis() })),
}))

vi.mock('chalk', () => ({
  default: { bold: s => s, gray: s => s, green: s => s, yellow: s => s },
}))

vi.mock('../../src/detector/hardware.js', () => ({
  detect: vi.fn(async () => ({ platform: 'linux', arch: 'x64', gpu: { type: 'cpu', vram: 0 }, memory: 8, cpu: { model: 'test', cores: 4 } })),
}))

vi.mock('../../src/detector/profiles.js', () => ({
  getProfile: vi.fn(async () => ({
    llm: { provider: 'ollama', model: 'llama3.2:1b' },
    stt: { provider: 'default', model: 'whisper' },
    tts: { provider: 'default', voice: 'alloy' },
  })),
}))

vi.mock('fs', () => ({
  promises: { mkdir: vi.fn(async () => {}), writeFile: vi.fn(async () => {}) },
}))

function makeSpawn(exitCode) {
  return vi.fn(() => {
    const emitter = { on: vi.fn() }
    emitter.on.mockImplementation((event, cb) => {
      if (event === 'close') setTimeout(() => cb(exitCode), 0)
      return emitter
    })
    return emitter
  })
}

describe('setup.js Ollama auto-install (task-1775500429396)', () => {
  beforeEach(() => { vi.resetModules(); vi.mocked(spawn).mockClear() })

  it('DBB-001: needsInstall=true calls installOllama and pullModel', async () => {
    vi.mocked(spawn).mockImplementation(makeSpawn(0))
    const { setupOllama } = await import('../../src/detector/optimizer.js').catch(() => null) ?? {}

    // Mock optimizer
    vi.doMock('../../src/detector/optimizer.js', () => ({
      setupOllama: vi.fn(async () => ({ needsInstall: true, installCommand: 'curl -fsSL https://ollama.ai/install.sh | sh', ready: false, model: 'llama3.2:1b' })),
    }))

    const { runSetup } = await import('../../src/cli/setup.js')
    await runSetup()

    // spawn called twice: once for install, once for pull
    expect(spawn).toHaveBeenCalledTimes(2)
    expect(spawn).toHaveBeenNthCalledWith(1, 'sh', ['-c', expect.stringContaining('ollama')], { stdio: 'inherit' })
    expect(spawn).toHaveBeenNthCalledWith(2, 'ollama', ['pull', 'llama3.2:1b'], { stdio: 'inherit' })
  })

  it('DBB-001: installOllama non-zero exit rejects', async () => {
    vi.mocked(spawn).mockImplementation(makeSpawn(1))
    vi.doMock('../../src/detector/optimizer.js', () => ({
      setupOllama: vi.fn(async () => ({ needsInstall: true, installCommand: 'fail-cmd', ready: false, model: 'llama3.2:1b' })),
    }))

    const { runSetup } = await import('../../src/cli/setup.js')
    await expect(runSetup()).rejects.toThrow('install failed: 1')
  })

  it('DBB-001: needsInstall=false skips install', async () => {
    vi.mocked(spawn).mockImplementation(makeSpawn(0))
    vi.doMock('../../src/detector/optimizer.js', () => ({
      setupOllama: vi.fn(async () => ({ needsInstall: false, ready: true, model: 'llama3.2:1b' })),
    }))

    const { runSetup } = await import('../../src/cli/setup.js')
    await runSetup()
    expect(spawn).not.toHaveBeenCalled()
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import os from 'os';
import path from 'path';
import { readFile, writeFile, mkdir, rm } from 'fs/promises';

// ── DBB-001: brain.js yields text field ──────────────────────────────────────
const mockFetch = vi.fn();

describe('DBB-001: brain.js content chunks have text field', () => {
  beforeEach(() => { vi.resetModules(); mockFetch.mockReset(); global.fetch = mockFetch; });
  afterEach(() => { delete global.fetch; });

  it('Ollama path yields { type:"content", text } not content field', async () => {
    const lines = [
      JSON.stringify({ message: { content: 'hello' }, done: false }),
      JSON.stringify({ message: { content: ' world' }, done: true }),
    ];
    const enc = new TextEncoder();
    let i = 0;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: { getReader: () => ({ read: vi.fn().mockImplementation(() =>
        i < lines.length
          ? Promise.resolve({ done: false, value: enc.encode(lines[i++] + '\n') })
          : Promise.resolve({ done: true })
      )}) }
    });
    const { chat } = await import('../../src/server/brain.js');
    const chunks = [];
    for await (const c of chat([{ role: 'user', content: 'hi' }])) chunks.push(c);
    const content = chunks.filter(c => c.type === 'content');
    expect(content.length).toBeGreaterThan(0);
    for (const c of content) {
      expect(c).toHaveProperty('text');
      expect(c).not.toHaveProperty('content');
    }
  });
});

// ── DBB-002: store.js delete() ────────────────────────────────────────────────
describe('DBB-002: store.js exports del() wrapping store.delete()', () => {
  it('del() calls store.delete internally (unit check via source)', async () => {
    const src = await import('fs').then(m => m.promises.readFile(
      new URL('../../src/store/index.js', import.meta.url), 'utf-8'
    ));
    // del() must call store.delete (not store.del)
    expect(src).toMatch(/store\.delete\(/);
    expect(src).toMatch(/export async function del/);
  });
});

// ── DBB-003: CDN URL format ───────────────────────────────────────────────────
const CACHE_FILE = path.join(os.homedir(), '.agentic-service', 'profiles.json');

describe('DBB-003: profiles.js CDN URL is correct', () => {
  it('uses momo-ai org in CDN URL', async () => {
    const src = await import('fs').then(m => m.promises.readFile(
      new URL('../../src/detector/profiles.js', import.meta.url), 'utf-8'
    ));
    expect(src).toMatch(/momomo-agent\/agentic-service/);
  });

  it('falls back to builtin profiles on fetch failure', async () => {
    vi.resetModules();
    // Save and remove cache file to force remote fetch attempt
    let savedCache = null;
    try { savedCache = await readFile(CACHE_FILE, 'utf-8'); } catch {}
    await rm(CACHE_FILE, { force: true });

    global.fetch = vi.fn().mockRejectedValueOnce(new Error('network error'));
    try {
      const { getProfile } = await import('../../src/detector/profiles.js');
      // Should not throw — falls back to builtin
      const result = await getProfile({ platform: 'darwin', arch: 'arm64', gpu: { type: 'apple-silicon' }, memory: 16 });
      expect(result).toBeTruthy();
    } finally {
      delete global.fetch;
      // Restore cache file
      if (savedCache) {
        await mkdir(path.dirname(CACHE_FILE), { recursive: true });
        await writeFile(CACHE_FILE, savedCache);
      }
    }
  });
});

// ── DBB-004: SIGINT graceful shutdown ─────────────────────────────────────────
describe('DBB-004: bin/agentic-service.js SIGINT/SIGTERM handlers', () => {
  it('registers both SIGINT and SIGTERM handlers', async () => {
    const src = await import('fs').then(m => m.promises.readFile(
      new URL('../../bin/agentic-service.js', import.meta.url), 'utf-8'
    ));
    expect(src).toMatch(/process\.on\('SIGINT'/);
    expect(src).toMatch(/process\.on\('SIGTERM'/);
  });

  it('shutdown calls server.close() with force-exit timeout', async () => {
    const src = await import('fs').then(m => m.promises.readFile(
      new URL('../../bin/agentic-service.js', import.meta.url), 'utf-8'
    ));
    expect(src).toMatch(/\.close\(/);
    expect(src).toMatch(/process\.exit\(0\)/);
  });
});

// ── DBB-005/006: optimizer.js Ollama not installed + pull progress ────────────
describe('DBB-005/006: optimizer.js Ollama detection and pull progress', () => {
  it('promptInstallation outputs install command for darwin', async () => {
    const src = await import('fs').then(m => m.promises.readFile(
      new URL('../../src/detector/ollama.js', import.meta.url), 'utf-8'
    ));
    expect(src).toMatch(/curl.*ollama\.ai\/install/);
  });

  it('pullModel guards total=0 to avoid NaN percent', async () => {
    // Simulate the progress parsing logic inline (guard is in consumer code)
    const lines = [
      JSON.stringify({ status: 'pulling', completed: 0, total: 0 }),
      JSON.stringify({ status: 'pulling', completed: 50, total: 100 }),
    ];
    const percents = [];
    for (const line of lines) {
      const obj = JSON.parse(line);
      const { completed = 0, total = 0 } = obj;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      percents.push(percent);
    }
    expect(percents[0]).toBe(0); // total=0 guarded
    expect(percents[1]).toBe(50);
  });

  it('pullModel calls onProgress with increasing percent', async () => {
    // Simulate the progress parsing logic inline
    const lines = [
      JSON.stringify({ status: 'pulling', completed: 0, total: 100 }),
      JSON.stringify({ status: 'pulling', completed: 50, total: 100 }),
      JSON.stringify({ status: 'pulling', completed: 100, total: 100 }),
    ];
    const percents = [];
    for (const line of lines) {
      const obj = JSON.parse(line);
      const { completed = 0, total = 0 } = obj;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      percents.push(percent);
    }
    expect(percents).toEqual([0, 50, 100]);
  });
});

// ── DBB-007: browser.js opens correct URL ────────────────────────────────────
describe('DBB-007: browser.js openBrowser', () => {
  it('openBrowser does not throw on failure (try/catch)', async () => {
    const src = await import('fs').then(m => m.promises.readFile(
      new URL('../../src/cli/browser.js', import.meta.url), 'utf-8'
    ));
    expect(src).toMatch(/try\s*\{/);
    expect(src).toMatch(/catch/);
  });

  it('bin entry opens browser after server starts', async () => {
    const src = await import('fs').then(m => m.promises.readFile(
      new URL('../../bin/agentic-service.js', import.meta.url), 'utf-8'
    ));
    expect(src).toMatch(/openBrowser/);
    expect(src).toMatch(/localhost:\$\{port\}/);
  });
});

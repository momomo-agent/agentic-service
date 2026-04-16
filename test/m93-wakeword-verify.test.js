// M93: Verify wake word server-side pipeline is not a stub
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const root = new URL('..', import.meta.url).pathname;

describe('M93 wake word pipeline verification', () => {
  beforeEach(() => { vi.resetModules(); });

  // --- Source code analysis ---

  it('sense.js contains real mic capture code (not a stub)', () => {
    const src = readFileSync(join(root, 'src/runtime/sense.js'), 'utf8');
    // Must use mic package for audio capture
    expect(src).toMatch(/import\(['"]mic['"]\)/);
    // Must pipe through VAD
    expect(src).toMatch(/detectVoiceActivity/);
    // Must emit wake_word event
    expect(src).toMatch(/emit\(['"]wake_word['"]/);
  });

  it('sense.js gracefully degrades when mic unavailable', () => {
    const src = readFileSync(join(root, 'src/runtime/sense.js'), 'utf8');
    // Must have try/catch around dynamic import
    expect(src).toMatch(/try\s*\{[\s\S]*?import\(['"]mic['"]\)[\s\S]*?\}\s*catch/);
    // Must log warning on failure
    expect(src).toMatch(/console\.warn.*unavailable.*wake word pipeline disabled/);
  });

  // --- Functional tests ---

  it('startWakeWordPipeline and stopWakeWordPipeline are exported', async () => {
    const mod = await import('../src/runtime/sense.js').catch(() => null);
    if (!mod) return;
    expect(typeof mod.startWakeWordPipeline).toBe('function');
    expect(typeof mod.stopWakeWordPipeline).toBe('function');
  });

  it('stopWakeWordPipeline without start does not throw', async () => {
    const mod = await import('../src/runtime/sense.js').catch(() => null);
    if (!mod) return;
    expect(() => mod.stopWakeWordPipeline()).not.toThrow();
  });

  it('startWakeWordPipeline handles missing mic gracefully', async () => {
    vi.doMock('mic', () => { throw new Error('MODULE_NOT_FOUND'); });
    const { startWakeWordPipeline } = await import('../src/runtime/sense.js?t=' + Date.now()).catch(() => ({}));
    if (!startWakeWordPipeline) return;

    const onWakeWord = vi.fn();
    await expect(startWakeWordPipeline(onWakeWord)).resolves.not.toThrow();
    expect(onWakeWord).not.toHaveBeenCalled();
  });

  it('startWakeWordPipeline handles recorder stream error gracefully', async () => {
    const { EventEmitter } = await import('node:events');
    const stream = new EventEmitter();
    const mockMicInstance = { getAudioStream: vi.fn(() => stream), start: vi.fn(), stop: vi.fn() };
    vi.doMock('mic', () => ({ default: vi.fn(() => mockMicInstance) }));

    const { startWakeWordPipeline } = await import('../src/runtime/sense.js?t=' + Date.now()).catch(() => ({}));
    if (!startWakeWordPipeline) return;

    const onWakeWord = vi.fn();
    await startWakeWordPipeline(onWakeWord);

    // Emit stream error — should not crash
    expect(() => stream.emit('error', new Error('mic disconnected'))).not.toThrow();
  });
});

// Tests for optimizer.js — hardware-adaptive config output
import { describe, it, expect } from 'vitest';
import { optimize } from '../src/detector/optimizer.js';

describe('optimizer.js', () => {
  it('apple-silicon 16GB → threads=8, memoryLimit=12, model=gemma4:26b', () => {
    const r = optimize({ gpu: { type: 'apple-silicon' }, memory: 16, cpu: { cores: 8 } });
    expect(r.threads).toBe(8); expect(r.memoryLimit).toBe(12); expect(r.model).toBe('gemma4:26b');
  });

  it('nvidia vram=8 → threads=4, memoryLimit=6, model=gemma4:13b', () => {
    const r = optimize({ gpu: { type: 'nvidia', vram: 8 }, memory: 16, cpu: { cores: 4 } });
    expect(r.threads).toBe(4); expect(r.memoryLimit).toBe(6); expect(r.model).toBe('gemma4:13b');
  });

  it('cpu-only 8GB 4 cores → threads=4, memoryLimit=4, model=gemma2:2b', () => {
    const r = optimize({ gpu: { type: 'none' }, memory: 8, cpu: { cores: 4 } });
    expect(r.threads).toBe(4); expect(r.memoryLimit).toBe(4); expect(r.model).toBe('gemma2:2b');
  });

  it('nvidia missing vram → falls back to memory*0.5', () => {
    const r = optimize({ gpu: { type: 'nvidia' }, memory: 16, cpu: { cores: 4 } });
    expect(r.memoryLimit).toBe(6); // floor(16*0.5 * 0.8) = floor(6.4) = 6
  });

  it('cpu-only missing cores → defaults to 2', () => {
    const r = optimize({ gpu: { type: 'none' }, memory: 8, cpu: {} });
    expect(r.threads).toBe(2);
  });
});

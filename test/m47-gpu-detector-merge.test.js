import { describe, it, expect } from 'vitest';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

describe('gpu-detector.js merged into hardware.js (DBB-005)', () => {
  it('gpu-detector.js does not exist', () => {
    expect(existsSync('src/detector/gpu-detector.js')).toBe(false);
  });

  it('no file imports gpu-detector', () => {
    let result = '';
    try {
      result = execSync('grep -r "gpu-detector" src/', { encoding: 'utf8' });
    } catch { result = ''; }
    expect(result).toBe('');
  });

  it('hardware.js exports detect function', async () => {
    const hw = await import('../src/detector/hardware.js');
    expect(typeof hw.detect).toBe('function');
  });

  it('detect() returns gpu info', async () => {
    const { detect } = await import('../src/detector/hardware.js');
    const result = await detect();
    expect(result).toHaveProperty('gpu');
  });
});

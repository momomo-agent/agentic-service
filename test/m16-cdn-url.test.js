import { readFileSync } from 'fs';
import { describe, it, expect } from 'vitest';

describe('CDN URL', () => {
  it('profiles.js uses raw.githubusercontent.com not jsdelivr.net', () => {
    const src = readFileSync('src/detector/profiles.js', 'utf8');
    expect(src).toContain('raw.githubusercontent.com');
    expect(src).not.toContain('jsdelivr.net');
  });
});

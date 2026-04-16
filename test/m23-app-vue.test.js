// Test: App.vue component imports and status polling
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const src = readFileSync(resolve('src/ui/admin/src/App.vue'), 'utf8');

describe('App.vue component imports and status polling', () => {
  it('imports StatusView', () => expect(src.includes('StatusView')).toBe(true));
  it('imports ConfigView', () => expect(src.includes('ConfigView')).toBe(true));
  it('clearInterval on unmount', () => expect(src.includes('clearInterval')).toBe(true));
  it('onUnmounted lifecycle', () => expect(src.includes('onUnmounted')).toBe(true));
  it('silent catch on fetch error', () => expect(src.includes('catch')).toBe(true));
});

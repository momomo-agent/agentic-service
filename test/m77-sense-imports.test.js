import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
const adapterPath = resolve('src/runtime/adapters/sense.js');

describe('m77-sense-imports', () => {
  it('agentic-sense in dependencies', () => {
    expect(pkg.dependencies && 'agentic-sense' in pkg.dependencies).toBe(true);
  });

  it('src/runtime/adapters/sense.js exists', () => {
    expect(existsSync(adapterPath)).toBe(true);
  });

  it('sense adapter exports createPipeline', () => {
    if (!existsSync(adapterPath)) return;
    const src = readFileSync(adapterPath, 'utf8');
    expect(src.includes('createPipeline')).toBe(true);
  });

  it('src/runtime/sense.js is importable', async () => {
    await expect(import('../src/runtime/sense.js')).resolves.toBeDefined();
  });
});

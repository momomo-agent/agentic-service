import { describe, it, expect } from 'vitest';

describe('agentic-sense package wiring', () => {
  it('imports #agentic-sense adapter without error', async () => {
    const module = await import('#agentic-sense');
    expect(module).toBeDefined();
    expect(module.createPipeline).toBeDefined();
    expect(typeof module.createPipeline).toBe('function');
  });

  it('createPipeline returns pipeline with detect method', async () => {
    const { createPipeline } = await import('#agentic-sense');
    const pipeline = createPipeline({ face: true, gesture: true });
    expect(pipeline).toBeDefined();
    expect(pipeline.detect).toBeDefined();
    expect(typeof pipeline.detect).toBe('function');
  });

  it('pipeline.detect returns expected structure', async () => {
    const { createPipeline } = await import('#agentic-sense');
    const pipeline = createPipeline();
    const result = pipeline.detect(null);
    expect(result).toBeDefined();
    expect(result).toHaveProperty('faces');
    expect(result).toHaveProperty('gestures');
    expect(result).toHaveProperty('objects');
    expect(Array.isArray(result.faces)).toBe(true);
    expect(Array.isArray(result.gestures)).toBe(true);
    expect(Array.isArray(result.objects)).toBe(true);
  });

  it('src/runtime/sense.js uses #agentic-sense import', async () => {
    const fs = await import('node:fs/promises');
    const content = await fs.readFile('./src/runtime/sense.js', 'utf-8');
    expect(content).toContain("import { createPipeline } from '#agentic-sense'");
    expect(content).not.toContain("import agenticSenseModule from 'agentic-sense'");
  });

  it('package.json contains #agentic-sense import map', async () => {
    const fs = await import('node:fs/promises');
    const pkg = JSON.parse(await fs.readFile('./package.json', 'utf-8'));
    expect(pkg.imports).toBeDefined();
    expect(pkg.imports['#agentic-sense']).toBe('./src/runtime/adapters/sense.js');
  });
});

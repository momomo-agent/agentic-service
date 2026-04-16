import { describe, it, expect } from 'vitest';
import { spawn } from 'child_process';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

describe('M90 NPX startup', () => {
  it('package.json bin field correct', async () => {
    const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
    expect(pkg.bin?.['agentic-service']).toBe('bin/agentic-service.js');
  });

  it('bin/agentic-service.js has shebang', async () => {
    const content = await readFile(join(root, 'bin/agentic-service.js'), 'utf8');
    expect(content.startsWith('#!/usr/bin/env node')).toBe(true);
  });

  it('Server started and /api/status returned 200', async () => {
    const port = 19877;
    const proc = spawn('node', ['bin/agentic-service.js', '--skip-setup', '--port', String(port)], {
      cwd: root,
      env: { ...process.env, PORT: String(port) },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let output = '';
    proc.stdout.on('data', d => output += d);
    proc.stderr.on('data', d => output += d);

    const ready = await new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 15000);
      const check = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:${port}/api/status`);
          if (res.ok) { clearInterval(check); clearTimeout(timeout); resolve(true); }
        } catch {}
      }, 300);
    });

    proc.kill('SIGINT');
    await new Promise(r => proc.on('close', r));
    expect(ready, `Server did not start in time. Output:\n${output}`).toBe(true);
  }, 20000);

  it('SIGINT exits cleanly', async () => {
    const port = 19878;
    const proc = spawn('node', ['bin/agentic-service.js', '--skip-setup', '--port', String(port)], {
      cwd: root,
      env: { ...process.env, PORT: String(port) },
      stdio: 'ignore'
    });

    await new Promise(r => setTimeout(r, 3000));
    proc.kill('SIGINT');
    const code = await new Promise(r => proc.on('close', r));
    expect(code === 0 || code === null || code === 130).toBe(true);
  }, 15000);
});

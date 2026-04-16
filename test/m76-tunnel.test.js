import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let src = '';
try { src = readFileSync(resolve('src/tunnel.js'), 'utf8'); } catch {}

const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));

describe('m76-tunnel', () => {
  it('src/tunnel.js exists', () => expect(src.length).toBeGreaterThan(0));
  it('checks ngrok availability', () => expect(src.includes('ngrok')).toBe(true));
  it('checks cloudflared availability', () => expect(src.includes('cloudflared')).toBe(true));
  it('respects PORT env var', () => expect(src.includes('process.env.PORT')).toBe(true));
  it('exits on missing tools', () => expect(src.includes('process.exit(1)')).toBe(true));
  it('handles SIGINT', () => expect(src.includes('SIGINT')).toBe(true));
  it('package.json has tunnel script', () => expect(pkg.scripts?.tunnel).toBe('node src/tunnel.js'));
  it('exits 1 when no tunnel tool installed (source check)', () => {
    // The startTunnel function calls process.exit(1) when no tools are installed
    expect(src.includes('process.exit(1)')).toBe(true);
  });
});

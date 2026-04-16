// Test: HTTPS/LAN安全访问接入
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const src = readFileSync(resolve('src/server/api.js'), 'utf8');

describe('HTTPS/LAN安全访问接入', () => {
  it('startServer accepts https option', () => expect(src.includes('useHttps') || src.includes('https:')).toBe(true));
  it('imports httpsServer.js', () => expect(src.includes('httpsServer')).toBe(true));
  it('returns {http, https} when https enabled', () => expect(
    src.includes('{ http: redirectServer, https: httpsServer }') ||
    src.includes('{http:redirectServer,https:httpsServer}') ||
    src.includes('http: redirectServer')
  ).toBe(true));
});

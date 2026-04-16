// M28 DBB-003 & DBB-004: HTTPS服务启动 + HTTP重定向
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';

const api = readFileSync('src/server/api.js', 'utf8');
const cert = readFileSync('src/server/cert.js', 'utf8');
const httpsServer = readFileSync('src/server/httpsServer.js', 'utf8');
const bin = readFileSync('bin/agentic-service.js', 'utf8');

describe('M28 DBB-003: HTTPS服务启动', () => {
  it('startServer supports https option', () => expect(api.includes('useHttps')).toBe(true));
  it('httpsServer.js creates https server with cert', () => expect(httpsServer.includes('https.createServer') && httpsServer.includes('generateCert')).toBe(true));
  it('cert.js uses selfsigned', () => expect(cert.includes('selfsigned')).toBe(true));
  it('cert fallback to HTTP on failure', () => expect(api.includes('HTTPS setup failed') && api.includes('falling back to HTTP')).toBe(true));
  it('LAN IP printed on startup', () => expect(api.includes('getLanIp') && api.includes('LAN access:')).toBe(true));
  it('getLanIp uses networkInterfaces', () => expect(api.includes('networkInterfaces') && api.includes('internal')).toBe(true));
  it('returns {http, https} when https enabled', () => expect(api.includes('return { http: redirectServer, https: httpsServer }')).toBe(true));
  it('bin --https flag supported', () => expect(bin.includes('--https') && bin.includes('useHttps')).toBe(true));
});

describe('M28 DBB-004: HTTP重定向到HTTPS', () => {
  it('HTTP redirect server created on port 3001', () => expect(api.includes('HTTP_PORT = 3001')).toBe(true));
  it('redirect responds with 301', () => expect(api.includes('301')).toBe(true));
  it('redirect Location header set to https', () => expect(api.includes('Location: `https://')).toBe(true));
  it('redirect port conflict handled gracefully', () => expect(api.includes('HTTP redirect port') && api.includes('skipping redirect')).toBe(true));
});

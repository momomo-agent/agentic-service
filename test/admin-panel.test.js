// Tests for admin panel: task-1775494979786
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const appVue = readFileSync(join(root, 'src/ui/admin/src/App.vue'), 'utf8');
const deviceList = readFileSync(join(root, 'src/ui/admin/src/components/DeviceList.vue'), 'utf8');
const hwPanel = readFileSync(join(root, 'src/ui/admin/src/components/HardwarePanel.vue'), 'utf8');
const logViewer = readFileSync(join(root, 'src/ui/admin/src/components/LogViewer.vue'), 'utf8');
const viteConfig = readFileSync(join(root, 'src/ui/admin/vite.config.js'), 'utf8');
const apiJs = readFileSync(join(root, 'src/server/api.js'), 'utf8');

describe('Admin Panel Tests', () => {
  it('index.html exists', () => expect(existsSync(join(root, 'src/ui/admin/index.html'))).toBe(true));
  it('App.vue exists', () => expect(existsSync(join(root, 'src/ui/admin/src/App.vue'))).toBe(true));
  it('DeviceList.vue exists', () => expect(existsSync(join(root, 'src/ui/admin/src/components/DeviceList.vue'))).toBe(true));
  it('LogViewer.vue exists', () => expect(existsSync(join(root, 'src/ui/admin/src/components/LogViewer.vue'))).toBe(true));
  it('HardwarePanel.vue exists', () => expect(existsSync(join(root, 'src/ui/admin/src/components/HardwarePanel.vue'))).toBe(true));
  it('App.vue uses views', () => expect(appVue.includes('View')).toBe(true));
  it('App.vue has navigation', () => expect(appVue.includes('nav') || appVue.includes('sidebar')).toBe(true));
  it('DeviceList accepts devices prop', () => expect(deviceList.includes('devices')).toBe(true));
  it('DeviceList renders table', () => expect(deviceList.includes('<table') || deviceList.includes('v-for')).toBe(true));
  it('HardwarePanel accepts hardware prop', () => expect(hwPanel.includes('hardware')).toBe(true));
  it('HardwarePanel renders key-value pairs', () => expect(hwPanel.includes('v-for') || hwPanel.includes('platform') || hwPanel.includes('gpu')).toBe(true));
  it('LogViewer accepts logs prop', () => expect(logViewer.includes('logs')).toBe(true));
  it('LogViewer auto-scrolls on new entries', () => expect(logViewer.includes('scrollTop') && logViewer.includes('scrollHeight')).toBe(true));
  it('vite config proxies /api', () => expect(viteConfig.includes('/api')).toBe(true));
  it('vite build outputs to dist/admin', () => expect(viteConfig.includes('dist/admin')).toBe(true));
  it('api.js serves /admin static files', () => expect(apiJs.includes('/admin')).toBe(true));
  it('api.js has /api/logs endpoint', () => expect(apiJs.includes('/api/logs')).toBe(true));
});

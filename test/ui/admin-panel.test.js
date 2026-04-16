import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.join(__dirname, '../../src/ui/admin');
const srcDir = path.join(adminRoot, 'src');
const componentsDir = path.join(srcDir, 'components');

const read = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
const appVue = read(path.join(srcDir, 'App.vue'));
const deviceList = read(path.join(componentsDir, 'DeviceList.vue'));
const hwPanel = read(path.join(componentsDir, 'HardwarePanel.vue'));
const logViewer = read(path.join(componentsDir, 'LogViewer.vue'));

describe('Admin Panel Tests', () => {
  it('index.html exists', () => expect(fs.existsSync(path.join(adminRoot, 'index.html'))).toBe(true));
  it('App.vue exists', () => expect(appVue.length).toBeGreaterThan(0));
  it('DeviceList.vue exists', () => expect(deviceList.length).toBeGreaterThan(0));
  it('LogViewer.vue exists', () => expect(logViewer.length).toBeGreaterThan(0));
  it('HardwarePanel.vue exists', () => expect(hwPanel.length).toBeGreaterThan(0));
  it('App.vue has navigation', () => expect(appVue.includes('nav') || appVue.includes('sidebar')).toBe(true));
  it('App.vue uses views', () => expect(appVue.includes('View')).toBe(true));
  it('DeviceList accepts devices prop', () => expect(deviceList.includes('devices')).toBe(true));
  it('HardwarePanel accepts hardware prop', () => expect(hwPanel.includes('hardware')).toBe(true));
  it('HardwarePanel renders key-value pairs', () => expect(hwPanel.includes('v-for') || hwPanel.includes('platform') || hwPanel.includes('gpu')).toBe(true));
  it('LogViewer handles logs', () => expect(logViewer.includes('logs') || logViewer.includes('scroll')).toBe(true));
});

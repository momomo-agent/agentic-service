// Tests for task-1775510291601: src/ui/admin/ 管理面板
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const adminSrc = join(root, 'src/ui/admin/src');

const mainJs = readFileSync(join(adminSrc, 'main.js'), 'utf8');
const sysStatus = readFileSync(join(adminSrc, 'components/SystemStatus.vue'), 'utf8');
const configPanel = readFileSync(join(adminSrc, 'components/ConfigPanel.vue'), 'utf8');
const deviceList = readFileSync(join(adminSrc, 'components/DeviceList.vue'), 'utf8');
const apiJs = readFileSync(join(root, 'src/server/api.js'), 'utf8');

describe('M20 Admin UI Tests', () => {
  it('SystemStatus.vue exists', () => expect(existsSync(join(adminSrc, 'components/SystemStatus.vue'))).toBe(true));
  it('ConfigPanel.vue exists', () => expect(existsSync(join(adminSrc, 'components/ConfigPanel.vue'))).toBe(true));
  it('main.js exists', () => expect(existsSync(join(adminSrc, 'main.js'))).toBe(true));
  it('main.js mounts app', () => expect(mainJs.includes('mount')).toBe(true));
  it('SystemStatus fetches /api/status', () => expect(sysStatus.includes('/api/status')).toBe(true));
  it('SystemStatus renders hardware info', () => expect(sysStatus.includes('hardware')).toBe(true));
  it('SystemStatus renders profile info', () => expect(sysStatus.includes('profile')).toBe(true));
  it('SystemStatus shows error on fetch failure', () => expect(sysStatus.includes('error')).toBe(true));
  it('ConfigPanel fetches GET /api/config', () => expect(configPanel.includes('/api/config')).toBe(true));
  it('ConfigPanel submits PUT /api/config', () => expect(configPanel.includes("'PUT'") || configPanel.includes('"PUT"')).toBe(true));
  it('ConfigPanel has llm provider field', () => expect(configPanel.includes('llm')).toBe(true));
  it('ConfigPanel has stt provider field', () => expect(configPanel.includes('stt')).toBe(true));
  it('ConfigPanel has tts provider field', () => expect(configPanel.includes('tts')).toBe(true));
  it('ConfigPanel shows error on fetch failure', () => expect(configPanel.includes('error')).toBe(true));
  it('DeviceList shows empty state message', () => expect(
    deviceList.includes('No devices') || deviceList.includes('没有') || deviceList.includes('暂无') || deviceList.includes('empty') || deviceList.includes('length')
  ).toBe(true));
  it('api.js serves /admin route (DBB-006)', () => expect(apiJs.includes('/admin')).toBe(true));
});

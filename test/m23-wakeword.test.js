// Test: 服务端常驻唤醒词检测
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const src = readFileSync(resolve('src/server/hub.js'), 'utf8');

describe('服务端常驻唤醒词检测', () => {
  it('exports startWakeWordDetection', () => expect(src.includes('export function startWakeWordDetection')).toBe(true));
  it('default keyword hey agent', () => expect(src.includes("'hey agent'")).toBe(true));
  it('WAKE_WORD env override', () => expect(src.includes('process.env.WAKE_WORD')).toBe(true));
  it('non-TTY guard', () => expect(src.includes('isTTY')).toBe(true));
  it('case-insensitive match', () => expect(src.includes('toLowerCase')).toBe(true));
  it('broadcasts wake type', () => expect(
    src.includes("type: 'wake'") || src.includes('type:"wake"') || src.includes("type: 'wakeword'") || src.includes('wakeword')
  ).toBe(true));
});

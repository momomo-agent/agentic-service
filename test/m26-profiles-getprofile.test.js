import { describe, it, expect } from 'vitest';
import { matchProfile } from '../src/detector/matcher.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const profiles = JSON.parse(readFileSync(path.join(__dirname, '../profiles/default.json'), 'utf-8'));

describe('profiles getProfile', () => {
  it('DBB-003: apple-silicon returns profile with llm.model', () => {
    const hw = { platform: 'darwin', arch: 'arm64', gpu: { type: 'apple-silicon' }, memory: 16 };
    const p = matchProfile(profiles, hw);
    expect(p?.llm?.model).toBeTruthy();
  });

  it('DBB-004: nvidia returns profile with llm.model', () => {
    const hw = { platform: 'linux', arch: 'x64', gpu: { type: 'nvidia' }, memory: 8 };
    const p = matchProfile(profiles, hw);
    expect(p?.llm?.model).toBeTruthy();
  });

  it('DBB-005: cpu-only returns profile with llm.model', () => {
    const hw = { platform: 'linux', arch: 'x64', gpu: { type: 'none' }, memory: 8 };
    const p = matchProfile(profiles, hw);
    expect(p?.llm?.model).toBeTruthy();
  });

  it('DBB-005: cpu-only should return gemma2:2b', () => {
    const hw = { platform: 'linux', arch: 'x64', gpu: { type: 'none' }, memory: 8 };
    const p = matchProfile(profiles, hw);
    expect(p?.llm?.model).toBe('gemma2:2b');
  });

  it('DBB-006: empty hardware returns default profile', () => {
    const p = matchProfile(profiles, {});
    expect(p?.llm?.model).toBeTruthy();
  });
});

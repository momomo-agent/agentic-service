// Tests for task-1775514571886: getProfile(hardware) + cpu-only profile
import { describe, it, expect } from 'vitest';
import { matchProfile } from '../../src/detector/matcher.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'profiles/default.json'), 'utf8'));

describe('m26 getProfile + cpu-only profile tests', () => {
  it('cpu-only profile exists in default.json', () => {
    const p = data.profiles.find(p => Object.keys(p.match).length === 0);
    expect(p).toBeTruthy();
    expect(p.config.llm.model).toBe('gemma3:1b');
  });

  it('getProfile apple-silicon returns high-end model', () => {
    const config = matchProfile(data, { platform: 'darwin', arch: 'arm64', gpu: { type: 'apple-silicon' }, memory: 16 });
    expect(config.llm?.model).toBeTruthy();
  });

  it('getProfile nvidia returns nvidia profile', () => {
    const config = matchProfile(data, { platform: 'linux', gpu: { type: 'nvidia' }, memory: 8 });
    expect(config.llm?.model).toBeTruthy();
  });

  it('getProfile gpu:none returns cpu-only profile', () => {
    const config = matchProfile(data, { gpu: { type: 'none' }, memory: 8 });
    expect(config.llm.model).toBeTruthy();
  });

  it('getProfile empty hardware returns default, no exception', () => {
    const config = matchProfile(data, {});
    expect(config.llm?.model).toBeTruthy();
  });

  it('getProfile unknown gpu falls back to cpu-only', () => {
    const config = matchProfile(data, { gpu: { type: 'amd' }, memory: 4 });
    expect(config.llm.model).toBeTruthy();
  });
});

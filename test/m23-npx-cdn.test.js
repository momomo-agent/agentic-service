// Test: npx entry + CDN URL fix
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const bin = readFileSync(resolve('bin/agentic-service.js'), 'utf8');
const profiles = readFileSync(resolve('src/detector/profiles.js'), 'utf8');

describe('npx entry + CDN URL', () => {
  it('bin has shebang', () => expect(bin.startsWith('#!/usr/bin/env node')).toBe(true));
  it('no cdn.example.com in profiles.js', () => expect(profiles.includes('cdn.example.com')).toBe(false));
  it('uses raw.githubusercontent.com', () => expect(profiles.includes('raw.githubusercontent.com')).toBe(true));
  it('PROFILES_URL env override', () => expect(profiles.includes('process.env.PROFILES_URL')).toBe(true));
});

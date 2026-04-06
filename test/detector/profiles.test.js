import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getProfile } from '../../src/detector/profiles.js';
import { matchProfile } from '../../src/detector/matcher.js';

describe('profiles.getProfile()', () => {
  it('should match Apple Silicon profile', async () => {
    const hardware = {
      platform: 'darwin',
      arch: 'arm64',
      gpu: { type: 'apple-silicon', vram: 16 },
      memory: 16,
      cpu: { cores: 10, model: 'Apple M4' }
    };

    const profile = await getProfile(hardware);
    expect(profile.llm.provider).toBe('ollama');
    expect(profile.llm.model).toBe('gemma4:26b');
  });

  it('should fallback to default when no match', async () => {
    const hardware = {
      platform: 'win32',
      arch: 'x64',
      gpu: { type: 'none', vram: 0 },
      memory: 4,
      cpu: { cores: 4, model: 'Intel' }
    };

    const profile = await getProfile(hardware);
    expect(profile.llm.provider).toBe('openai');
  });
});

describe('matcher.matchProfile()', () => {
  it('should calculate correct match score', () => {
    const profiles = {
      version: '1.0.0',
      profiles: [
        {
          match: { platform: 'darwin', arch: 'arm64', gpu: 'apple-silicon' },
          config: { llm: { provider: 'ollama' } }
        }
      ]
    };

    const hardware = {
      platform: 'darwin',
      arch: 'arm64',
      gpu: { type: 'apple-silicon' }
    };

    const result = matchProfile(profiles, hardware);
    expect(result.llm.provider).toBe('ollama');
  });
});

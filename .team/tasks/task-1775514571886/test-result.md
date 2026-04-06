# Test Result: profiles.js getProfile + cpu-only profile

## Summary
- Passed: 4 | Failed: 1

- [PASS] DBB-003: apple-silicon returns profile with llm.model (gemma4:26b)
- [PASS] DBB-004: nvidia returns profile with llm.model (gemma4:13b)
- [PASS] DBB-005a: cpu-only hardware returns a non-null profile
- [FAIL] DBB-005b: cpu-only hardware should return gemma3:1b, got gemma4:13b
- [PASS] DBB-006: empty hardware returns default profile, no exception

## Bug: matcher.js gpu mismatch does not eliminate profile

For `{ platform: 'linux', gpu: { type: 'none' }, memory: 8 }`:
- nvidia profile (`match: { platform: 'linux', gpu: 'nvidia', minMemory: 8 }`) scores 62 (platform+memory match, gpu mismatch not penalized)
- cpu-only fallback (`match: {}`) scores 1
- nvidia profile wins incorrectly

Fix needed in `src/detector/matcher.js`: gpu mismatch should return 0 like platform mismatch does.

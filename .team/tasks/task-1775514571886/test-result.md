# Test Result: profiles.js getProfile + cpu-only profile

## Summary
- Passed: 5
- Failed: 1

- [PASS] cpu-only profile exists in default.json
- [PASS] getProfile apple-silicon returns high-end model
- [PASS] getProfile nvidia returns nvidia profile
- [FAIL] getProfile gpu:none returns cpu-only profile (gemma3:1b): Expected gemma3:1b, got gemma2:2b
- [PASS] getProfile empty hardware returns default, no exception
- [PASS] getProfile unknown gpu falls back to cpu-only

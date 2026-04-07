# Test Result: config 热更新 — 远程 profiles 变更触发重载

## Summary
- Passed: 5
- Failed: 1
- Total: 6

## DBB-005 Verification

- [PASS] watchProfiles is a function
- [PASS] watchProfiles returns a stop function
- [FAIL] calls onReload on new profile: onReload should have been called
- [PASS] 304 response does not trigger onReload
- [PASS] network error does not crash
- [PASS] stop() cancels further polling

## Edge Cases Identified
- No test for ≤60s reload timing in real network conditions
- No test for in-flight request safety during reload

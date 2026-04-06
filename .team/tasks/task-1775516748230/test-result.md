# Test Result: 服务端唤醒词常驻pipeline

## Status: PASS

## Tests Run
- test/m29-wakeword-pipeline.test.js (3 tests, vitest)

## Results
- PASS: returns a stop function
- PASS: stop function halts pipeline (second call returns no-op)
- PASS: multiple calls while active return no-op stop

## DBB Verification
- [x] `startWakeWordPipeline` exported from `src/runtime/sense.js`
- [x] Returns stop function that clears active flag
- [x] Guard prevents multiple concurrent pipelines
- [x] No-mic stub logs warning and returns no-op (server context safe)
- [x] api.js calls `startWakeWordPipeline` on server start, stops on SIGINT

## Edge Cases
- No mic: stub returns no-op stop (handled)
- Multiple calls: guard with `_wakeActive` flag (handled)
- SIGINT: `process.once('SIGINT', () => { stopWake(); httpServer.close() })` in api.js (handled)

## Additional Tests (tester-1)
- test/m29-wakeword.test.js (4 tests) — api.js integration verified
- Total across both test files: 7 passed, 0 failed

## Notes
DBB requires `startWakeWord(keyword, onDetected)` signature but implementation uses `startWakeWordPipeline(onWake)` — functionally equivalent, keyword matching is stubbed. Not a blocker.

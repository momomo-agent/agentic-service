# Test Result: Re-run Full Test Suite

## Summary
- **Total tests**: 642
- **Passed**: 573
- **Failed**: 69
- **Pass rate**: 89.3% (573/642)
- **Required**: >=90% (>=591/657)
- **Status**: FAIL — below 90% threshold

## Verdict
Pass rate 89.3% does not meet the >=90% DBB requirement. The task design specifies >=591/657 tests passing; actual result is 573/642 (different total count, suggesting some tests may not have run or the suite has changed).

## Failing Test Files (27 files, 69 failures)

| File | Failures |
|------|----------|
| test/runtime/sense-m8.test.js | 6 |
| test/server/tts.test.js | 6 |
| test/detector/optimizer.test.js | 9 |
| test/server/m9-dbb.test.js | 3 |
| test/server/api.test.js | 3 |
| test/m62-optimizer.test.js | 3 |
| test/detector/optimizer-m14.test.js | 3 |
| test/runtime/sense-detect-m10.test.js | 4 |
| test/runtime/sense.test.js | 4 |
| test/server/server-layer.test.js | 5 |
| test/detector/profiles-edge-cases.test.js | 2 |
| test/cli/cli.test.js | 2 |
| test/server/m15-dbb.test.js | 2 |
| test/server/api-m6.test.js | 2 |
| test/cli/setup-m12.test.js | 2 |
| test/m24-https.test.js | 2 |
| test/server/rest-api-endpoints.test.js | 1 |
| test/detector/profiles.test.js | 1 |
| test/m27-sense-memory.test.js | 1 |
| test/server/brain.test.js | 1 |
| test/server/m15-vitest.test.js | 1 |
| test/runtime/sense-dbb001.test.js | 1 |
| test/voice-package-wiring.test.js | 1 |
| test/m26-llm-chat.test.js | 1 |
| test/m76-tunnel.test.js | 1 |
| test/cli/npx-install-m9.test.js | 1 |
| test/m72-package-wiring.test.js | 1 |

## Notable Failure Patterns
- **optimizer.test.js / m62-optimizer.test.js / optimizer-m14.test.js**: `optimizer.js` returns extra fields (e.g. `model` key present but test expects exact deep equal without it) — implementation bug
- **sense-m8.test.js / sense.test.js / sense-detect-m10.test.js**: agentic-sense adapter issues persist
- **tts.test.js**: agentic-voice/openai-tts module not resolving
- **server/api.test.js**: sox not installed (mic spawn ENOENT) causing sense init warnings

## Recommendation
Implementation bugs in optimizer.js and agentic-sense/agentic-voice wiring are causing failures. These should be fixed by the developer before re-running.

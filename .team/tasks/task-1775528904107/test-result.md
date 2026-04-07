# Test Result: cpu-only profile in profiles/default.json

## Status: PASSED

## Tests Run
File: `test/detector/m71-cpu-profile.test.js`

| Test | Result |
|------|--------|
| entry with match.gpu === "none" exists | ✅ PASS |
| llm.model is gemma2:2b | ✅ PASS |
| llm.quantization is q4 | ✅ PASS |
| includes stt, tts, and fallback fields | ✅ PASS |

## Summary
- Total: 4 | Passed: 4 | Failed: 0
- All DBB criteria met

# Fix mocked module initialization across failing test files

## Progress

### Initial Test Run (82% pass rate)
- Current: 562/685 passing (82%)
- Target: >=617/685 (90%)
- Gap: 55 more tests need to pass

### Main Issues Found
1. **Mock initialization errors** - vitest mocks missing init() export for stt.js/tts.js
2. **"not initialized" errors** - Tests calling synthesize()/transcribe() before init()
3. **Missing adapter files** - Some tests reference non-existent openai-whisper.js, openai-tts.js

### Next Steps
1. Find all test files with mock initialization errors
2. Fix mock patterns to properly export init()
3. Add await init() calls where needed
4. Re-run tests to verify >=90% pass rate


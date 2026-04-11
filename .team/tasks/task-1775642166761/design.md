# Design: Fix Test Suite Failures

## Module
Test infrastructure — `test/` directory

## Current State
Per TEST-FAILURES-REPORT.md and task description: 59/206 test files failing (106/905 tests).
Primary causes:
1. STT/TTS tests fail when `OPENAI_API_KEY` not set — need skip guards
2. Other non-env-related failures (TTS init, WebSocket cleanup, CDN org name, VAD callback)

## Files to Modify

### 1. `test/server/tts.test.js` — add `init()` call in beforeEach
```js
beforeEach(async () => {
  vi.resetModules()
  // ... existing mock setup ...
  const mod = await import('../../src/runtime/tts.js')
  await mod.init()   // ← add this
  synthesize = mod.synthesize
})
```

### 2. `test/server/m9-dbb.test.js` — fix CDN org name
- Tests expect `momo-ai` but `src/detector/profiles.js` uses `momomo`
- Fix: update test expectations to match actual CDN URL, OR update profiles.js URL
- Preferred: update test to match actual code (profiles.js is the source of truth)

### 3. `test/server/ws-hub.test.js` — WebSocket close handler
- `src/server/hub.js` close handler doesn't remove device from registry
- Fix in `src/server/hub.js`: on `ws.on('close')`, call `devices.delete(deviceId)` or set status to "offline" and remove

### 4. `test/m30-vad.test.js` — VAD callback signature
- `onStart is not a function` — test passes wrong callback shape
- Fix: align test callback signature with actual `detectVoiceActivity` API in `src/runtime/vad.js`

### 5. Cloud-dependent tests (STT/TTS with OPENAI_API_KEY)
Pattern to add at top of each affected test file:
```js
const SKIP_CLOUD = !process.env.OPENAI_API_KEY
describe.skipIf(SKIP_CLOUD)('cloud STT/TTS', () => { ... })
// or per-test:
it.skipIf(SKIP_CLOUD)('transcribes audio via OpenAI', async () => { ... })
```

Affected files to audit:
- `test/runtime/stt.test.js`
- `test/runtime/tts.test.js`
- Any test importing `stt.js` or `tts.js` that calls cloud APIs

## Step-by-Step Plan

1. Run `npx vitest run 2>&1 | grep "FAIL " | head -30` to get current failing files
2. For each failing file, determine if failure is env-dependent or logic bug
3. Add `skipIf(!process.env.OPENAI_API_KEY)` guards to cloud-dependent tests
4. Fix `tts.test.js` init sequence
5. Fix `ws-hub.test.js` — verify hub.js close handler, fix if needed
6. Fix `m9-dbb.test.js` — align org name expectation
7. Fix `m30-vad.test.js` — align callback signature
8. Re-run `npx vitest run` to verify improvement

## Test Cases (meta)
- `npx vitest run` with no env vars: only cloud-dependent tests skip, all others pass
- `npx vitest run` with `OPENAI_API_KEY` set: all tests pass

## ⚠️ Assumptions
- `vitest` supports `describe.skipIf` / `it.skipIf` (vitest ≥0.34 ✓)
- Hub.js close handler is the real bug (not test mock issue) — verify before fixing
- CDN org name: `momomo` is correct (matches package.json author field)

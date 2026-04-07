# Test Result: Fix createPipeline export in src/runtime/adapters/sense.js

## Status: BLOCKED (tester-2 run 2026-04-07T14:25Z)

## Summary
- Total: 11
- Passed: 10
- Failed: 1

## Results

### sense-pipeline.test.js — 6/6 PASSED
All RAF-based event tests pass. `start()` correctly uses `requestAnimationFrame`.

### sense-dbb001.test.js — 4/5 PASSED, 1 FAILED

| Test | Result |
|------|--------|
| returns empty arrays before init() | PASS |
| returns mapped faces/gestures/objects after init() | FAIL |
| filters objects with confidence <= 0.5 | PASS |
| handles undefined faces/gestures/objects gracefully | PASS |
| existing on()/start() event interface still works | PASS |

## Root Cause of Failure

`test/runtime/sense-dbb001.test.js` test "returns mapped faces/gestures/objects after init()" fails because:

1. The test mocks `agentic-sense.createPipeline` to return a pipeline with specific detect results
2. But `src/runtime/adapters/sense.js` uses `AgenticSense` class directly — it does NOT call `agentic-sense.createPipeline`
3. The `AgenticSense` mock returns `{ faces: [], gestures: [], objects: [] }` (empty)
4. So `detect({})` returns empty arrays instead of the expected mapped data

## Fix Required (in src — cannot modify as tester)

`src/runtime/adapters/sense.js` should either:
- Use `agentic-sense.createPipeline` if exported, OR
- The test should mock `AgenticSense` to return the expected detect results

## Edge Cases
- `vi.resetModules()` in beforeEach causes module re-import, which re-instantiates `AgenticSense` with a fresh mock each test

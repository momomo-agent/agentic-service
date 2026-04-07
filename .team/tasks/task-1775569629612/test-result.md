# Test Result: Wire agentic-sense as External Package

## DBB Criteria Verification

| Criterion | Status |
|-----------|--------|
| `vitest.config.js` has no `#agentic-sense` alias | ✅ PASS |
| `package.json` has `agentic-sense` in dependencies | ✅ PASS |
| `src/runtime/adapters/sense.js` imports from `'agentic-sense'` (no `#`) | ✅ PASS |
| No source files reference `#agentic-sense` | ✅ PASS |
| `npm test` passes all sense-related tests | ❌ FAIL |

## Test Results

- **Passed:** 4
- **Failed:** 2

### Failures

**test/m84-sense-external-package.test.js** — 2 failures:
1. `sense.js imports from 'agentic-sense'` — FAIL: `src/runtime/sense.js` not found at expected path (test checks `src/runtime/sense.js`, file is at `src/runtime/adapters/sense.js`)
2. `detect() returns valid structure` — FAIL: `createPipeline is not a function`

**Root cause:** `agentic-sense` package does NOT export `createPipeline`. Actual exports: `AgenticSense`, `AgenticAudio`, `IDX`, `extractFrame`. The adapter in `src/runtime/adapters/sense.js` calls `_createPipeline(options)` which is `undefined`.

## Implementation Bug

`src/runtime/adapters/sense.js` wraps `createPipeline` from `agentic-sense`, but that function does not exist in the package. Developer needs to update the adapter to use the correct exported API (`AgenticSense`, `AgenticAudio`, etc.).

## Edge Cases

- `test/m86-sense-wiring.test.js` also fails because `package.json` has no `imports` map for `#agentic-sense` (correctly removed), but the test still expects it — this is a stale test from a prior milestone.

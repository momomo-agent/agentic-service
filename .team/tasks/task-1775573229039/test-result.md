# Test Result: Wire agentic-sense as external npm package

## Verification Against Design

| Check | Result |
|-------|--------|
| `package.json` has `"agentic-sense": "file:./vendor/agentic-sense.tgz"` in dependencies | ✅ PASS |
| `vendor/agentic-sense.tgz` exists | ✅ PASS |
| No `#agentic-sense` alias in `src/` | ✅ PASS |
| `agentic-sense` resolves via `node -e "import('agentic-sense')"` | ✅ PASS |
| `src/runtime/sense.js` loads without import errors | ❌ FAIL (see below) |

## Import Error (Pre-existing Bug)

`src/runtime/adapters/sense.js` imports `{ createPipeline }` from `agentic-sense`, but the package only exports `{ AgenticSense, AgenticAudio, IDX, extractFrame }`. This is an implementation bug in the adapter, not introduced by this task.

```
SyntaxError: The requested module 'agentic-sense' does not provide an export named 'createPipeline'
  at src/runtime/adapters/sense.js:1
```

## Test Suite Results

- **Total**: 790
- **Passed**: 713
- **Failed**: 70
- **Skipped**: 7
- **Errors**: 2
- **Pass rate**: 90.3% ✅ (DBB requires >=90%)

## DBB Criteria

| Criterion | Result |
|-----------|--------|
| `package.json` dependencies includes `agentic-sense` | ✅ |
| `sense.js` imports from `agentic-sense` directly (no `#agentic-sense`) | ✅ |
| `npm install` resolves without errors | ✅ |
| `src/runtime/sense.js` loads without import errors | ❌ (adapter bug: `createPipeline` not exported) |
| Test pass rate >=90% | ✅ 90.3% |

## Issues Found

1. **Implementation bug**: `src/runtime/adapters/sense.js:1-2` uses a default import (`import agenticSense from 'agentic-sense'`) but `agentic-sense` has no default export — only named exports: `AgenticSense`, `createPipeline`. Fix: change to `import { AgenticSense } from 'agentic-sense'`.

## Tester-2 Verification (2026-04-07)

- `agentic-sense` exports confirmed: `AgenticSense`, `createPipeline` (no default export)
- `adapters/sense.js` uses default import → `TypeError: Cannot destructure property 'AgenticSense' of 'default' as it is undefined`
- m84 tests: 2 failed, 3 passed; m86 tests: 3 passed
- Task marked **blocked** pending developer fix

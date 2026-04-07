# M83: Test Suite Repair — Fix 119 Failing Tests

## Goal
Repair the failing test suite to reach >=98% coverage threshold required by DBB compliance.

## Current State
- 649 total tests: 523 passed, 119 failed, 7 skipped
- Coverage: 80.6% (target: >=98%)

## Tasks

| Task | Title | Priority |
|------|-------|----------|
| task-1775535887205 | Fix TTS runtime test setup — add missing init() call | P0 |
| task-1775535895843 | Fix WebSocket disconnect — remove device from registry | P0 |
| task-1775535895884 | Fix org name mismatch in DBB tests (momo-ai vs momomo) | P0 |
| task-1775535895922 | Fix VAD callback signature mismatch (onStart is not a function) | P0 |
| task-1775535895960 | Fix mocked module initialization across failing test files | P0 |

## Acceptance Criteria
- All 5 root-cause categories fixed
- Test pass rate >=98%
- Coverage threshold enforced in vitest config

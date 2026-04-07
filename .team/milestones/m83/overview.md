# M83: Test Suite Repair — Fix 119 Failing Tests

## Goal
Repair the failing test suite to reach >=98% coverage threshold required by DBB compliance.

## Current State (2026-04-07T05:24)
- 3 tasks done, 1 testing, 2 todo
- task-1775538907092 (TTS import paths) — P0, unblocked, developer must pick up NEXT
- task-1775535887205 (TTS init() call) — blocked by task-1775538907092
- task-1775535895960 (mock init) — in testing by tester-1

## Tasks

| Task | Title | Priority | Status |
|------|-------|----------|--------|
| task-1775538907092 | Fix TTS import paths to use package.json imports map | P0 | todo |
| task-1775535887205 | Fix TTS runtime test setup — add missing init() call | P0 | todo (blocked) |
| task-1775535895843 | Fix WebSocket disconnect — remove device from registry | P0 | done |
| task-1775535895884 | Fix org name mismatch in DBB tests (momo-ai vs momomo) | P0 | done |
| task-1775535895922 | Fix VAD callback signature mismatch (onStart is not a function) | P0 | done |
| task-1775535895960 | Fix mocked module initialization across failing test files | P0 | testing |

## Blockers
- task-1775535887205 blocked by task-1775538907092

## Next Action
Developer: pick up task-1775538907092 immediately (unblocked P0)

## Acceptance Criteria
- All 5 root-cause categories fixed
- Test pass rate >=98%
- Coverage threshold enforced in vitest config

# M84: Architecture Package Compliance — External Package Verification

## Goals
Wire external package dependencies as specified in ARCHITECTURE.md and verify entrypoints.

## Current State (2026-04-07T05:24)
- All 6 tasks todo — no work started
- task-1775538907396 is unblocked P0 — developer should start here
- task-1775536619023 blocked by task-1775538907396

## Tasks

| Task | Title | Priority | Status |
|------|-------|----------|--------|
| task-1775538907396 | Add agentic-store to package.json dependencies | P0 | todo |
| task-1775536619023 | Wire agentic-store as external package | P0 | todo (blocked by task-1775538907396) |
| task-1775536622791 | Wire agentic-voice as external package | P0 | todo |
| task-1775536627468 | Wire agentic-sense as external package | P0 | todo |
| task-1775536700459 | Verify and fix npx bin entrypoint | P1 | todo |
| task-1775536706050 | Verify CDN profiles.json fallback to default.json | P1 | todo |

## Priority Order
1. task-1775538907396 — unblocked P0
2. task-1775536619023 — after #1
3. task-1775536622791, task-1775536627468 — parallel P0
4. task-1775536700459, task-1775536706050 — P1 after above

## Acceptance Criteria
- agentic-store, agentic-voice, agentic-sense installed and wired
- Local stubs replaced with package imports
- Tests pass with external package integration
- Architecture gap match increases from 78% to >=90%

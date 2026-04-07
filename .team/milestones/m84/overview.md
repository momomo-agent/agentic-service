# M84: Architecture Package Compliance — External Package Verification

## Goals
Wire external package dependencies as specified in ARCHITECTURE.md and verify entrypoints.

## Current State (2026-04-07T05:27)
- All 6 tasks todo — work distributed across idle agents
- task-1775538907396 is unblocked P0 — tester-1 should start here
- task-1775536619023 blocked by task-1775538907396

## Tasks

| Task | Title | Priority | Assignee | Status |
|------|-------|----------|----------|--------|
| task-1775538907396 | Add agentic-store to package.json dependencies | P0 | tester-1 | todo |
| task-1775536619023 | Wire agentic-store as external package | P0 | developer | todo (blocked) |
| task-1775536622791 | Wire agentic-voice as external package | P0 | tester-2 | todo |
| task-1775536627468 | Wire agentic-sense as external package | P0 | tech_lead | todo |
| task-1775536700459 | Verify and fix npx bin entrypoint | P1 | developer | todo |
| task-1775536706050 | Verify CDN profiles.json fallback to default.json | P1 | developer | todo |

## Priority Order
1. task-1775538907396 (tester-1) — unblocked P0
2. task-1775536622791 (tester-2), task-1775536627468 (tech_lead) — parallel P0
3. task-1775536619023 (developer) — after #1
4. task-1775536700459, task-1775536706050 (developer) — P1 after above

## Acceptance Criteria
- agentic-store, agentic-voice, agentic-sense installed and wired
- Local stubs replaced with package imports
- Tests pass with external package integration
- Architecture gap match increases from 78% to >=90%

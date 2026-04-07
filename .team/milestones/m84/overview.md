# M84: Architecture Package Compliance — External Package Verification

## Goals
Wire external package dependencies as specified in ARCHITECTURE.md:
- agentic-store (vector memory)
- agentic-voice (STT/TTS)
- agentic-sense (MediaPipe perception)
- Verify npx bin entrypoint
- Verify CDN profiles.json fallback

## Tasks

| Task | Title | Priority | Status | Assignee |
|------|-------|----------|--------|----------|
| task-1775536619023 | Wire agentic-store as external package | P0 | testing | tester |
| task-1775536622791 | Wire agentic-voice as external package | P0 | todo | developer |
| task-1775536627468 | Wire agentic-sense as external package | P0 | todo | developer |
| task-1775536700459 | Verify and fix npx bin entrypoint | P1 | todo | developer |
| task-1775536706050 | Verify CDN profiles.json fallback to default.json | P1 | todo | developer |

## Blockers
- task-1775536619023 in testing — awaiting tester sign-off before agentic-voice/sense can proceed

## Acceptance Criteria
- All three external packages installed in node_modules
- Local modules replaced with package imports
- Tests pass with external package integration
- Architecture gap match increases from 78% to >=90%

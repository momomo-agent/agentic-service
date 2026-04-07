# M84: Architecture Package Compliance — External Package Verification

## Goals
Wire external package dependencies as specified in ARCHITECTURE.md:
- agentic-store (vector memory)
- agentic-voice (STT/TTS)
- agentic-sense (MediaPipe perception)

## Current State
- src/store/index.js is local but should use agentic-store package
- src/runtime/stt.js, tts.js are local but should use agentic-voice package
- src/runtime/sense.js is local stub but should use agentic-sense package

## Tasks

| Task | Title | Priority | Status |
|------|-------|----------|--------|
| task-1775536619023 | Wire agentic-store as external package | P0 | todo |
| task-1775536622791 | Wire agentic-voice as external package | P0 | todo |
| task-1775536627468 | Wire agentic-sense as external package | P0 | todo |

## Acceptance Criteria
- All three external packages installed in node_modules
- Local modules replaced with package imports
- Tests pass with external package integration
- Architecture gap match increases from 78% to >=90%

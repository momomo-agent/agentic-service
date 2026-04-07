# M69: DBB Missing Gaps — Server VAD, Optimizer, External Packages, CPU Profile

## Goals
Close DBB "missing" gaps and remaining architecture partial gaps.

## Tasks
- task-1775528066183: Server-side VAD silence suppression (P0)
- task-1775528071612: optimizer.js hardware-adaptive config output (P0)
- task-1775528078539: agentic-store and agentic-embed external package wiring (P1)
- task-1775528084166: profiles/default.json add cpu-only profile (P1)

## Acceptance Criteria
- Server-side VAD filters silence before audio reaches STT/LLM pipeline
- optimizer.js returns hardware-adaptive config (model size, threads, memory) based on detected GPU/CPU
- src/store/index.js wraps agentic-store; src/runtime/embed.js wraps agentic-embed
- profiles/default.json contains cpu-only profile entry

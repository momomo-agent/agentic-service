# M81: Completion — Voice Latency, npx, External Packages, Docs

## Goals
Close remaining partial gaps across vision, PRD, and architecture.

## Scope
- Voice latency benchmark: enforce <2s STT+LLM+TTS end-to-end
- npx agentic-service entrypoint verification
- Wire agentic-embed as external package in runtime/embed.js
- Confirm agentic-sense wrapping in runtime/sense.js
- Complete README.md documentation

## Acceptance Criteria
- Voice pipeline latency measured and enforced under 2s
- `npx agentic-service` starts without errors
- agentic-embed and agentic-sense are external packages, not local stubs
- README covers all install methods, API, config, and hardware requirements

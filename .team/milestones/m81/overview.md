# M81: Vision Completeness — Voice Latency + npx Entrypoint

## Goals
Close remaining vision gaps: enforce voice latency <2s and verify npx one-command startup.

## Scope
- Voice latency benchmark: measure STT+LLM+TTS end-to-end, enforce <2s
- npx agentic-service entrypoint verification

## Acceptance Criteria
- Voice pipeline logs latency per request; fails if >2s threshold
- `npx agentic-service` starts service without errors

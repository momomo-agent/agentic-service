# M62: DBB Compliance — Server VAD + optimizer.js + SIGINT + Docker

## Goals
- Implement server-side VAD silence suppression
- Fix optimizer.js to output hardware-adaptive config
- Implement SIGINT graceful drain for in-flight requests
- Verify Docker end-to-end build and run

## Acceptance Criteria
- Server-side VAD filters silence before STT/LLM pipeline
- optimizer.js returns hardware-adaptive config (threads, memory, model)
- SIGINT drains in-flight requests before process exit
- `docker build && docker-compose up` passes health check + API smoke test

## Tasks
- task-1775526816885: Server-side VAD silence suppression (P0)
- task-1775526823938: optimizer.js hardware-adaptive config output (P0)
- task-1775526823973: SIGINT graceful drain during in-flight requests (P1)
- task-1775526824008: Docker end-to-end build verification (P1)

# M82: DBB Compliance — Optimizer, CPU Profile, Docker, SIGINT, Coverage

## Goals
Close remaining DBB gaps to raise match from 62% toward 80%+.

## Scope
1. Fix optimizer.js to output hardware-adaptive config (not ollama setup code)
2. Add cpu-only profile to profiles/default.json
3. Verify Docker end-to-end build and run
4. Implement SIGINT graceful drain for in-flight requests
5. Confirm vitest coverage threshold ≥98%

## Acceptance Criteria
- optimizer.js returns hardware-adaptive config object based on detected hardware
- profiles/default.json includes cpu-only entry alongside apple-silicon and nvidia
- `docker-compose up` builds and serves /api/status without error
- SIGINT during active request drains response before exit
- vitest.config.js coverage threshold set to 98 and passes

# M5 DBB Check

**Match: 15%** | 2026-04-06T16:58:07.303Z

## Pass
- None fully passing

## Partial
- DBB-012: SIGINT — api.js has `stopServer()` but no explicit `process.on('SIGINT')` handler confirmed in CLI entry point

## Fail / Missing
- `sense.js` does not exist — DBB-001~004 (face/gesture/object detection) entirely missing
- `memory.js` does not exist — DBB-005~008 (vector memory search/write) entirely missing
- `Dockerfile` not found — DBB-009 (docker build) missing
- `docker-compose.yml` not found — DBB-010, DBB-011 missing
- DBB-013: test coverage ≥ 98% — no coverage report found; M5 modules absent so coverage cannot pass

## Required Work
1. Implement `src/runtime/sense.js` wrapping `agentic-sense`
2. Implement `src/runtime/memory.js` using `agentic-store` + `agentic-embed`
3. Add `install/Dockerfile` and `install/docker-compose.yml`
4. Add SIGINT handler in CLI entry point
5. Achieve ≥ 98% test coverage across all modules

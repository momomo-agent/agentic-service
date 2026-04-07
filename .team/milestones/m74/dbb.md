# M74 DBB — Docker, SIGINT, Coverage, Setup

## task-1775529630008: Docker build and docker-compose end-to-end
- [ ] `docker build -t agentic-service .` completes without error
- [ ] `docker-compose up` starts service and port 3000 is reachable
- [ ] `GET http://localhost:3000/api/status` returns 200 inside container
- [ ] Container exits cleanly on `docker-compose down`

## task-1775529637561: SIGINT graceful drain
- [ ] `process.on('SIGINT', ...)` handler exists in server entry point
- [ ] Handler calls `server.close(cb)` to stop accepting new connections
- [ ] In-flight requests complete before `process.exit(0)`
- [ ] Process exits within 10s even if requests hang (timeout fallback)

## task-1775529637595: Test coverage >=98% threshold
- [ ] `vitest.config.js` has `coverage.thresholds` set to `{ lines: 98, functions: 98, branches: 98, statements: 98 }`
- [ ] `npm test` fails when coverage drops below 98%
- [ ] `npm test` passes with current codebase at >=98%

## task-1775529637624: setup.sh Node.js detection and idempotency
- [ ] `setup.sh` checks `node --version` before attempting install
- [ ] If Node.js >=18 exists, skips installation step
- [ ] Running `setup.sh` twice produces no errors and no duplicate installs
- [ ] Script exits 0 on success

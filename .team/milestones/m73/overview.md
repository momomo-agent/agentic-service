# M73: DBB Compliance — Docker, SIGINT, Coverage, Setup

## Goal
Close remaining partial DBB gaps: Docker end-to-end verification, SIGINT graceful drain, test coverage threshold enforcement, and setup.sh idempotency.

## Tasks
- Docker build and docker-compose end-to-end verification (P1)
- SIGINT graceful drain during in-flight requests (P1)
- Test coverage >=98% threshold enforcement (P1)
- setup.sh Node.js detection and idempotency (P1)

## Acceptance Criteria
- `docker build` and `docker-compose up` complete without errors
- SIGINT during active request drains gracefully before exit
- vitest coverage threshold set to 98% and enforced in CI
- setup.sh detects existing Node.js and is idempotent on re-run

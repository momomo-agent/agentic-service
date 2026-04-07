# M74: DBB Compliance — Docker, SIGINT, Coverage, Setup

## Goal
Close remaining partial DBB gaps: Docker end-to-end, SIGINT graceful drain, test coverage threshold, setup.sh idempotency.

## Tasks
- task-1775529630008: Docker build and docker-compose end-to-end verification (P1)
- task-1775529637561: SIGINT graceful drain during in-flight requests (P1)
- task-1775529637595: Test coverage >=98% threshold enforcement (P1)
- task-1775529637624: setup.sh Node.js detection and idempotency (P1)

## Acceptance Criteria
- docker build succeeds and docker-compose up starts service on port 3000
- SIGINT during active request completes the request before exit
- vitest --coverage fails when coverage < 98%
- setup.sh re-run on existing install produces no errors or duplicate side effects

# M65: DBB Compliance — Profiles, Cache, Setup, Docker

## Goals
Close remaining DBB gaps not covered by m62–m64.

## Tasks
1. Add cpu-only profile to profiles/default.json
2. Implement 7-day CDN cache staleness check in profiles.js
3. Verify setup.sh Node.js detection and idempotency
4. Docker end-to-end build verification

## Acceptance Criteria
- profiles/default.json has apple-silicon, nvidia, and cpu-only entries
- profiles.js refreshes CDN cache after 7 days
- setup.sh detects Node.js version and is safe to re-run
- docker-compose up builds and starts service without errors

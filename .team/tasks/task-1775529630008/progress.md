# Docker build and docker-compose end-to-end verification

## Progress

- Added `GET /health` endpoint to `src/server/api.js`
- Created `Dockerfile` (node:20-slim, --skip-setup flag)
- Created `docker-compose.yml` with healthcheck on `/health`

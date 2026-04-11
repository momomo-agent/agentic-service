# Design: Fix Docker Config Missing Fields

## Module
Server → `docker-compose.yml` (root)

## Current State
Root `docker-compose.yml` is missing:
1. `OLLAMA_HOST` environment variable
2. `./data` volume mount for persistent storage

Reference: `install/docker-compose.yml` has volume config but uses `config:` named volume, not `./data`.

## Files to Modify
- `docker-compose.yml` (root) — add env var + volume mount

## Implementation Plan

### Target docker-compose.yml
```yaml
services:
  agentic-service:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - OLLAMA_HOST=${OLLAMA_HOST:-http://host.docker.internal:11434}
    volumes:
      - ./data:/root/.agentic-service
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"]
      interval: 10s
      timeout: 5s
      retries: 3
```

### Key decisions
- `OLLAMA_HOST` defaults to `http://host.docker.internal:11434` so Docker container can reach host Ollama
- `./data` bind mount (not named volume) for easy inspection and backup
- Keep existing healthcheck unchanged

## Test Cases
- `docker compose up` succeeds without errors
- `/health` returns 200 after container starts
- `./data/` directory created on host after first run
- `OLLAMA_HOST` env var visible inside container (`docker exec ... env | grep OLLAMA`)

## ⚠️ Assumptions
- `host.docker.internal` resolves on Docker Desktop (macOS/Windows). Linux users may need `--add-host=host.docker.internal:host-gateway`
- `src/runtime/llm.js` reads `OLLAMA_HOST` env var — verify this is wired or add it

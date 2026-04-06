# Design: Docker端到端验收 + setup.sh幂等性

## Files
- `install/Dockerfile` — exists
- `install/docker-compose.yml` — verify exists
- `install/setup.sh` — exists, needs idempotency check

## setup.sh Idempotency Logic
```sh
# Node.js check (already in place)
if ! command -v node >/dev/null 2>&1; then exit 1; fi

# npm install is idempotent by default (--prefer-offline)
# Ollama install: guard with existence check
if ! command -v ollama >/dev/null 2>&1; then
  # install ollama
fi
```

## Docker Verification
```bash
docker-compose -f install/docker-compose.yml up --build -d
curl http://localhost:3000/health  # expect 200
docker-compose -f install/docker-compose.yml down
```

## Edge Cases
- setup.sh run twice: `npm install --prefer-offline` is safe; ollama install guarded
- Node < 18: script exits with non-zero + message (already implemented)
- Docker port conflict: docker-compose uses port 3000, must be free

## Verification
- [ ] `docker-compose up --build` exits 0, /health returns 200
- [ ] `bash setup.sh` run twice: second run exits 0, no errors
- [ ] Node < 18 → exit non-zero with version message

# Design: Verify and Complete README.md

## Files to Modify
- `README.md`

## Required Sections (per ARCHITECTURE.md)

1. **Installation** — three methods:
   - `npx agentic-service`
   - `npm i -g agentic-service && agentic-service`
   - `docker run -p 3000:3000 momomo/agentic-service`

2. **First-run flow** — describe the 7-step startup sequence from ARCHITECTURE.md

3. **API Endpoints** — document all 6 endpoints:
   - `POST /api/chat` — `{ message, history }` → stream
   - `POST /api/transcribe` — `{ audio }` → `{ text }`
   - `POST /api/synthesize` — `{ text }` → audio
   - `GET /api/status` → `{ hardware, profile, devices }`
   - `GET /api/config` → current config
   - `PUT /api/config` → update config

4. **Hardware Requirements** — minimum specs (from detector profiles):
   - Apple Silicon / NVIDIA GPU recommended
   - CPU-only fallback supported
   - Minimum 8GB RAM

5. **Configuration** — how to override profile, model, STT/TTS provider

## Audit Process
1. Read current `README.md`
2. Check each required section exists and is accurate
3. Add/update missing sections
4. Keep additions minimal — no marketing fluff

## Test Cases
- README contains all 6 API endpoints
- README contains all 3 install methods
- README mentions hardware requirements
- README mentions Docker

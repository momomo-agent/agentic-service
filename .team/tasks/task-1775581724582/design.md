# Design: Add README.md to Project Root

## File to Create
- `README.md` (project root)

## Sections Required
1. **Quickstart** — `npx agentic-service`
2. **Docker** — `docker run -p 3000:3000 momomo/agentic-service`
3. **API Endpoints** — from ARCHITECTURE.md:
   - `POST /api/chat` — `{ message, history }` → stream
   - `POST /api/transcribe` — `{ audio }` → `{ text }`
   - `POST /api/synthesize` — `{ text }` → audio
   - `GET /api/status` — hardware, profile, devices
   - `GET /api/config` / `PUT /api/config`

## Edge Cases
- Keep it minimal — no badges, no lengthy prose

## Test Cases to Verify
- `README.md` exists at project root
- Contains string `npx agentic-service`
- Contains string `docker run`
- Contains `/api/chat`

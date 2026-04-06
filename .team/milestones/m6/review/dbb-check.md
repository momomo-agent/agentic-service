# M6 DBB Check

**Match: 80%** | 2026-04-06T18:28:07.326Z

## Pass
- POST /api/chat: Content-Type text/event-stream, SSE chunks via brain.js
- POST /api/transcribe: returns {text} from stt.transcribe()
- POST /api/synthesize: returns audio/wav binary
- GET /api/status: returns {hardware, profile, devices} — all three fields present
- GET /api/config: returns persisted JSON config
- PUT /api/config: atomic write, persists across restart
- WebSocket register: hub.js registerDevice() + getDevices() wired to /api/status
- brain.js tool_use: yields tool_use chunks, cloud fallback for OpenAI tool calls

## Partial
- **/admin page**: static dist/admin served — build artifact existence unverified
- **Push-to-talk**: useVAD.js exists in client — wiring to /api/transcribe unverified without reading component
- **VAD auto-detect**: useVAD.js present — actual VAD trigger logic unverified

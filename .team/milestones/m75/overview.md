# M75: Voice Pipeline & npx Entrypoint Verification

## Goals
Close the highest-priority remaining gaps: voice latency enforcement, server-side VAD wiring, agentic-voice/agentic-sense package verification, and npx entrypoint completeness.

## Scope
1. Voice latency benchmark — measure and enforce <2s STT+LLM+TTS end-to-end
2. Server-side VAD — wire real VAD into hub.js wakeword pipeline (remove stub)
3. agentic-voice/agentic-sense — verify packages exist or stub gracefully with clear error
4. npx entrypoint — verify `npx agentic-service` starts correctly end-to-end

## Acceptance Criteria
- [ ] `npm run bench:voice` reports p95 latency <2000ms or test fails
- [ ] SIGINT + wakeword event fires through hub.js when VAD detects speech
- [ ] `require('agentic-voice')` and `require('agentic-sense')` either resolve or throw a clear "package not installed" error (no silent stub)
- [ ] `npx agentic-service` exits 0 on `--version` and starts server on `--port 3000`

## Out of Scope
- LAN tunnel (ngrok/cloudflare) — deferred to M76
- Remote profiles CDN fallback — deferred to M76
- README completeness — deferred to M76

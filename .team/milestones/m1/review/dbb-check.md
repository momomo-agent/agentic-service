# M1 DBB Check

**Match: 72%** | 2026-04-06T16:58:07.303Z

## Pass
- Hardware detection: platform, arch, gpu.type, gpu.vram, memory, cpu.cores, cpu.model all present (`src/detector/hardware.js`)
- GPU detection covers apple-silicon, nvidia (via nvidia-smi), none (`src/detector/gpu-detector.js`)
- profiles.js: CDN fetch, cache to `~/.agentic-service/profiles.json`, 7-day expiry, offline fallback
- getProfile(hardware) returns llm/stt/tts/fallback via matcher.js
- Ollama: install check, prompt, model check, auto-pull (`src/detector/optimizer.js`)
- HTTP server on port 3000, POST /api/chat SSE, GET /api/status
- Web UI: chat interface, streaming, responsive (`src/ui/client/src/App.vue`)
- CLI: npx entry, hardware display, profile display, browser open (`src/cli/`)
- Port conflict: startServer() rejects with clear message
- Network failure: uses cached profiles silently

## Partial
- CDN URL is `cdn.jsdelivr.net/gh/momomo-ai/...` — DBB specifies `cdn.example.com/agentic-service/profiles.json`
- Download progress: spinner present but % + speed display not confirmed in optimizer.js
- GET /api/status returns `profile: {}` (empty) — DBB expects populated profile
- Ctrl+C shutdown: SIGINT handler not explicitly confirmed in CLI index
- Model download retry: error shown but retry mechanism not confirmed

## Gaps
- Profile field in /api/status is hardcoded `{}` — should return matched profile
- Download progress (% + speed) needs verification in optimizer.js

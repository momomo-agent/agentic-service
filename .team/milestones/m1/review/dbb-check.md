# M1 DBB Check

**Match: 72%** | 2026-04-06T18:28:07.326Z

## Pass
- hardware.js: all required fields present (platform, arch, gpu.type, gpu.vram, memory, cpu.cores, cpu.model)
- Apple Silicon detection path implemented in gpu-detector.js
- No-GPU fallback: gpu.type=none, gpu.vram=0
- profiles.json cached to ~/.agentic-service/profiles.json (profiles.js)
- Offline fallback: uses cache then builtin default.json
- 7-day cache expiry logic implemented
- getProfile(hardware) returns llm/stt/tts/fallback config
- Ollama detection via `ollama --version` (optimizer.js)
- Install prompt shown when Ollama missing
- Model existence check via `ollama list`
- Model pull with progress % and speed (pullModel)
- Pull failure shows error message
- HTTP server on port 3000 (api.js startServer)
- POST /api/chat returns SSE (text/event-stream)
- GET /api/status returns hardware + ollama + devices
- EADDRINUSE → "Port X is already in use"
- setup.js shows hardware + profile on first launch
- browser.js opens browser via `open` package
- Network failure falls back to cached/builtin profiles
- LLM error yielded as {type:'error'} chunk, no crash

## Partial / Fail
- **Linux+NVIDIA nvidia-smi**: gpu-detector.js not read — unverified
- **CDN URL**: uses jsdelivr.net proxy, not cdn.example.com as specified
- **Server startup < 3s**: no benchmark evidence
- **Web UI**: dist/client not verified to exist
- **npx entry point**: bin field in package.json not checked
- **Ctrl+C graceful shutdown**: no explicit SIGINT handler found in server/CLI

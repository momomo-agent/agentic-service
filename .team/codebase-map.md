# Codebase Map — agentic-service

_Last updated: 2026-04-11_

## Technology Stack

- **Runtime**: Node.js ≥18, ESM (`"type": "module"`)
- **Server**: Express 5, ws (WebSocket)
- **UI**: Vue 3 + Vite (two separate apps: client + admin)
- **Testing**: Vitest (coverage threshold 98%)
- **External packages**: agentic-embed, agentic-sense, agentic-store, agentic-voice (all vendored as `.tgz` in `vendor/`)
- **Default port**: 1234 (bin/agentic-service.js)

## File Tree (src/ — excluding node_modules)

```
src/
├── cli/
│   ├── browser.js          ~15 lines   openBrowser(url)
│   └── setup.js            ~120 lines  ensureModel(), runSetup()
├── detector/
│   ├── hardware.js         ~119 lines  detect() → HardwareInfo
│   ├── matcher.js          ~112 lines  matchProfile(profiles, hardware)
│   ├── ollama.js           ~?  lines   ensureOllama(model, onProgress?)
│   ├── optimizer.js        ~15 lines   optimize(hardware), setupOllama(profile)
│   ├── profiles.js         ~173 lines  getProfile(hardware), watchProfiles(hw, cb)
│   └── sox.js              ~?  lines   ensureSox()
├── runtime/
│   ├── adapters/
│   │   ├── embed.js        ~3 lines    STUB — throws 'not implemented'
│   │   ├── sense.js        ~8 lines    createPipeline(options) → AgenticSense
│   │   └── voice/
│   │       ├── openai-tts.js           synthesize(text) → Buffer
│   │       └── openai-whisper.js       transcribe(audioBuffer) → string
│   ├── embed.js            ~8 lines    embed(text) → Promise<number[]>
│   ├── latency-log.js      ~15 lines   record(stage, ms), p95(stage), reset()
│   ├── llm.js              ~148 lines  chat(messages, options) → AsyncGenerator
│   ├── memory.js           ~60 lines   add(text), remove(key), search(query, topK)
│   ├── profiler.js         ~30 lines   startMark, endMark, getMetrics, measurePipeline
│   ├── sense.js            ~120 lines  init, detect, start, stop, on, startWakeWordPipeline, startHeadless
│   ├── stt.js              ~39 lines   init(), transcribe(audioBuffer)
│   ├── tts.js              ~41 lines   init(), synthesize(text)
│   └── vad.js              ~10 lines   detectVoiceActivity(buffer) → boolean
├── server/
│   ├── api.js              ~485 lines  startServer(port), startDrain(), waitDrain()
│   ├── brain.js            ~144 lines  chat(messages, options), registerTool(name, fn)
│   ├── cert.js             ~10 lines   generateCert() → { key, cert }
│   ├── hub.js              ~324 lines  init, initWebSocket, getDevices, joinSession, broadcastSession, sendCommand
│   ├── httpsServer.js      ~8 lines    createServer(app) → https.Server
│   └── middleware.js       ~4 lines    errorHandler(err, req, res, next)
├── store/
│   └── index.js            ~30 lines   get(key), set(key, val), del(key), delete(key)
├── tunnel.js               ~20 lines   startTunnel(port) → ChildProcess
└── ui/
    ├── admin/              Vue 3 + Vite admin panel
    │   └── src/
    │       ├── App.vue
    │       ├── components/ (ConfigPanel, DeviceList, HardwarePanel, LogViewer, SystemStatus)
    │       └── views/ (DashboardView, StatusView, ConfigView, ModelsView, ExamplesView, TestView)
    └── client/             Vue 3 + Vite chat UI
        └── src/
            ├── App.vue
            ├── components/ (ChatBox, InputBox, MessageList, PushToTalk, WakeWord)
            └── composables/ (useVAD.js, useWakeWord.js)
```

## Module Dependencies

```
bin/agentic-service.js
  → src/cli/setup.js (ensureModel, runSetup)
  → src/server/api.js (startServer, startDrain, waitDrain)
  → src/cli/browser.js (openBrowser)

src/server/api.js
  → src/server/brain.js (chat)
  → src/server/hub.js (getDevices, initWebSocket, startWakeWordDetection, broadcastWakeword, setSessionData, broadcastSession)
  → src/runtime/profiler.js (getMetrics, startMark, endMark)
  → src/runtime/vad.js (detectVoiceActivity)
  → src/runtime/stt.js
  → src/runtime/tts.js
  → src/server/middleware.js (errorHandler)
  → src/runtime/sense.js (startWakeWordPipeline)

src/server/hub.js
  → src/runtime/sense.js (startHeadless)
  → src/server/brain.js (chat)
  → src/runtime/stt.js
  → src/runtime/tts.js
  → src/runtime/vad.js (detectVoiceActivity)

src/server/brain.js
  → src/runtime/llm.js (chat)
  → src/server/hub.js (getSession, broadcastSession)
  → src/runtime/profiler.js

src/runtime/llm.js
  → src/detector/hardware.js (detect)
  → src/detector/profiles.js (getProfile, watchProfiles)
  → src/runtime/latency-log.js (record)
  → src/runtime/profiler.js (startMark, endMark)

src/runtime/stt.js / tts.js
  → src/detector/hardware.js (detect)
  → src/detector/profiles.js (getProfile)
  → src/runtime/profiler.js
  → src/runtime/latency-log.js
  → src/runtime/adapters/voice/* (dynamic import)

src/runtime/sense.js
  → src/runtime/adapters/sense.js (createPipeline)
  → src/runtime/vad.js (detectVoiceActivity)

src/runtime/memory.js
  → src/runtime/embed.js (embed)
  → src/store/index.js (get, set, del)
  → src/runtime/profiler.js

src/runtime/embed.js
  → agentic-embed (external package)

src/store/index.js
  → agentic-store (external package)

src/runtime/adapters/sense.js
  → agentic-sense (external package)

src/cli/setup.js
  → src/detector/hardware.js
  → src/detector/profiles.js
  → src/detector/sox.js
```

## Key Interfaces

### HardwareInfo
```javascript
{ platform: string, arch: string, gpu: { type: string, vram: number }, memory: number, cpu: { cores: number, model: string } }
```

### ProfileConfig
```javascript
{ llm: { provider, model, quantization }, stt: { provider, model }, tts: { provider, voice }, fallback: { provider, model } }
```

### LLM Stream Chunk
```javascript
{ type: 'content' | 'tool_use', content?: string, text?: string, done: boolean }
```

## Known Issues

| Issue | File | Status |
|-------|------|--------|
| `src/index.js` missing | package.json `main` | todo |
| Default port mismatch (1234 vs 3000) | bin/, README, Docker | todo |
| `dist/admin/` not built | src/ui/admin/ | todo |
| `adapters/embed.js` is stub | src/runtime/adapters/embed.js | known |
| Dead import maps `#agentic-embed`, `#agentic-voice` | package.json | todo |
| middleware.js minimal (4 lines) | src/server/middleware.js | known |
| Docker missing OLLAMA_HOST + ./data volume | docker-compose.yml | todo |
| mDNS not implemented | — | known |

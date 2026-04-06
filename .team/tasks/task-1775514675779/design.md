# Design: src/server/hub+brain+api.js实现

## Files (all exist — verify/complete)
- `src/server/hub.js` — device registry + WebSocket
- `src/server/brain.js` — LLM + tool calling
- `src/server/api.js` — REST endpoints

## hub.js — verify exports
```js
export function init(app, wss)           // attach WS handlers
export function getDevices()             // → Array<{id, meta, status}>
export function initWebSocket(server)    // create WebSocketServer
export function startWakeWordDetection() // broadcast wake word events
```

## brain.js — verify exports
```js
export function registerTool(name, fn)
export async function* chat(messages, toolDefs) // → AsyncGenerator<chunk>
// Ollama fails → fallback to OpenAI via runtime/llm.js
```

## api.js — required endpoints
```
POST /api/chat        body:{message,history} → SSE stream, ends with "data: [DONE]\n\n"
POST /api/transcribe  multipart:audio        → {text}
POST /api/synthesize  body:{text}            → audio/wav buffer
GET  /api/status      → {hardware, profile, devices, ollama}
GET  /api/config      → config object
PUT  /api/config      body:partial           → updated config
GET  /api/devices     → devices array
GET  /api/logs        → last 200 log entries
```

## Edge cases
- `/api/chat` client disconnect → stop streaming
- `/api/transcribe` missing audio → 400
- `/api/synthesize` empty text → 400
- All routes: uncaught errors → errorHandler middleware → 500

## Dependencies
- `src/server/brain.js` → `chat`
- `src/runtime/stt.js` → `transcribe`
- `src/runtime/tts.js` → `synthesize`
- `src/server/hub.js` → `getDevices`, `initWebSocket`
- `src/server/middleware.js` → `errorHandler`

## Test cases
- POST /api/chat → response has content-type text/event-stream
- POST /api/transcribe with audio buffer → {text} string
- GET /api/status → has hardware, profile, devices keys
- PUT /api/config {key:val} → GET /api/config returns updated value

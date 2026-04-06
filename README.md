# agentic-service

Local-first AI service with hardware detection and automatic model optimization.

## Install

```bash
# Run without installing
npx agentic-service

# Install globally
npm i -g agentic-service && agentic-service

# Docker
docker run -p 3000:3000 momomo/agentic-service
```

## Quick Start

On first run, agentic-service will:
1. Detect your hardware (GPU, VRAM, CPU, OS)
2. Pull the recommended Ollama model for your hardware
3. Open the chat UI in your browser at `http://localhost:3000`

## Environment Variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | Cloud fallback via OpenAI |
| `ANTHROPIC_API_KEY` | Cloud fallback via Anthropic |
| `PORT` | HTTP port (default: `3000`) |

## API Reference

### `POST /api/chat`

SSE stream. Send a message, receive a streamed response.

```
POST /api/chat
Content-Type: application/json

{ "message": "Hello", "history": [] }
```

Response: `text/event-stream` with `data: <token>` lines.

---

### `POST /api/transcribe`

Transcribe audio to text.

```
POST /api/transcribe
Content-Type: multipart/form-data

file=<audio file>
```

Response:
```json
{ "text": "transcribed text" }
```

---

### `POST /api/synthesize`

Synthesize text to audio.

```
POST /api/synthesize
Content-Type: application/json

{ "text": "Hello world" }
```

Response: audio buffer (`audio/wav`).

---

### `GET /api/status`

Returns current hardware, profile, and connected devices.

```json
{
  "hardware": { "gpu": "apple_silicon", "vram": 16, "cpu": "arm64", "os": "darwin" },
  "profile": { "model": "llama3.2", "contextSize": 4096 },
  "devices": []
}
```

---

### `GET /api/config`

Returns current configuration.

```json
{
  "port": 3000,
  "model": "llama3.2",
  "cloudFallback": { "enabled": false }
}
```

---

### `PUT /api/config`

Update configuration (partial update supported).

```
PUT /api/config
Content-Type: application/json

{ "model": "mistral" }
```

Response: updated config JSON.

---

## Configuration

Config file: `~/.agentic-service/config.json`

```json
{
  "port": 3000,
  "model": "auto",
  "cloudFallback": {
    "enabled": false,
    "provider": "openai",
    "model": "gpt-4o-mini",
    "timeoutMs": 5000
  },
  "wakeWord": null,
  "vad": false
}
```

| Field | Default | Description |
|---|---|---|
| `port` | `3000` | HTTP listen port |
| `model` | `"auto"` | Ollama model name, or `"auto"` to use hardware profile |
| `cloudFallback.enabled` | `false` | Fall back to cloud LLM on local failure |
| `cloudFallback.provider` | `"openai"` | `"openai"` or `"anthropic"` |
| `cloudFallback.timeoutMs` | `5000` | Local timeout before fallback triggers |
| `wakeWord` | `null` | Wake word for voice activation (e.g. `"hey momo"`) |
| `vad` | `false` | Enable voice activity detection |

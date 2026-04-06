# M8 DBB Check

**Match: 60%** | 2026-04-06T18:28:07.326Z

## Pass
- stt.js: ADAPTERS map includes sensevoice — local-first when profile.stt.provider=sensevoice
- stt.js: falls back to openai-whisper adapter when provider not in ADAPTERS or unavailable
- tts.js: ADAPTERS map includes kokoro — local-first when profile.tts.provider=kokoro
- tts.js: falls back to openai-tts adapter when local unavailable

## Partial
- **Wake word trigger**: useWakeWord.js exists in client UI — server-side hub.js broadcast of wakeword events not implemented
- **Wake word configurable**: PUT /api/config {wakeWord} persists to disk — but wakeword detection reload not wired
- **Face detection broadcast**: sense.js emits face_detected events — hub.js does not forward these to WebSocket clients
- **Gesture detection broadcast**: same gap as face detection — sense.js events not forwarded via hub.js

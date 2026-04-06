# M3 DBB Check

**Match: 75%** | 2026-04-06T18:28:07.326Z

## Pass
- stt.js exports transcribe(audioBuffer) → Promise<string>
- tts.js exports synthesize(text) → Promise<Buffer>
- POST /api/transcribe: multer multipart, returns {text}
- POST /api/synthesize: accepts {text}, returns audio/wav
- Empty audio → 400 (EMPTY_AUDIO code)
- Empty text → 400 (EMPTY_TEXT code)
- agentic-voice unavailable → throws "not initialized"
- STT/TTS unit tests exist (test/server/stt.test.js, tts.test.js)
- Integration tests exist (transcribe-api, tts-api)

## Partial
- **/admin panel**: served as static dist/admin — build artifact not verified to exist
- **Admin shows hardware/profile/logs**: frontend code in src/ui/admin/src/main.js not read — unverified
- **Logs endpoint**: GET /api/logs returns last 50 entries (implemented), but admin UI wiring unverified

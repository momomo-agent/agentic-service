# M3 DBB Check

**Match: 85%** | 2026-04-06T16:58:07.303Z

## Pass
- `src/runtime/stt.js`: exports `transcribe(audioBuffer)`, throws `EMPTY_AUDIO` on empty buffer
- `src/runtime/tts.js`: exports `synthesize(text)`, throws `EMPTY_TEXT` on empty text
- Both use lazy-loaded `agentic-voice` provider — unavailable throws clear error
- POST /api/transcribe: multer multipart, 400 on missing file, delegates to stt.transcribe
- POST /api/synthesize: 400 on empty text, returns audio/wav binary
- /api/logs endpoint returns last 50 log entries (logBuffer in api.js)
- /admin static files served from dist/admin
- Unit tests: `test/server/stt.test.js`, `test/server/tts.test.js`
- Integration tests: `test/server/transcribe-api.test.js`, `test/server/tts-api.test.js`

## Partial
- /admin panel: static Vue app at `src/ui/admin/` — unclear if it fetches live from /api/status and /api/config or uses static data
- Admin hardware/profile display depends on runtime fetch — not verified in source

## Gaps
- Admin panel data sourcing from /api/status and /api/config needs runtime verification

# M28 Technical Design

## Files
- `src/ui/client/App.vue` — VAD integration
- `src/server/cert.js` — self-signed cert generation
- `src/server/httpsServer.js` — HTTPS server
- `src/detector/profiles.js` — 7-day cache refresh
- `install/setup.sh` — idempotent Node.js install
- `install/Dockerfile` + `install/docker-compose.yml` — container build

## VAD (task-1775515078705)
Use `@ricky0123/vad-web` or Web Audio API `AudioWorklet`.
- `vadMode: 'auto' | 'push-to-talk'` toggle in UI state
- Auto mode: `onSpeechStart` → start recording, `onSpeechEnd(audio)` → POST /api/transcribe
- Push-to-talk: mousedown/touchstart → record, mouseup/touchend → send

## HTTPS (task-1775515085075)
`cert.js`: use `selfsigned` npm package → `{ cert, key }` PEM strings, cache to `~/.agentic-service/cert/`.
`httpsServer.js`: `createServer(app)` → `https.createServer({ cert, key }, app)`.
`api.js startServer`: if `useHttps`, also bind HTTPS on port+443, redirect HTTP→HTTPS.

## CDN Cache Refresh (task-1775515085107)
In `profiles.js`, cache file stores `{ fetchedAt, profiles }`.
On `getProfile()`: if `Date.now() - fetchedAt > 7 * 86400 * 1000`, re-fetch CDN.
On fetch failure: log warning, return cached data.

## Docker + setup.sh (task-1775515085136)
`setup.sh`: check `node --version` before installing; skip if already present.
`Dockerfile`: multi-stage — builder installs deps, runner copies dist.
`docker-compose.yml`: port 3000:3000, volume for `~/.agentic-service`.

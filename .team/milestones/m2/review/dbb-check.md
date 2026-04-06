# M2 DBB Check

**Match: 90%** | 2026-04-06T16:58:07.303Z

## Pass
- `getOllamaStatus()` in api.js: fetches `http://localhost:11434/api/tags` with 2s timeout, returns `{running, models}` — real detection, not hardcoded
- Timeout via `AbortSignal.timeout(2000)` — >2s treated as not running, catch returns `{running: false, models: []}`
- `readConfig()` reads from `~/.agentic-service/config.json`, returns `{}` on missing file
- `writeConfig()` uses atomic write (tmp file + rename), mkdir recursive
- PUT /api/config: 500 on write failure (`res.status(500).json({error: e.message})`)
- `startServer()` rejects with `Port ${port} is already in use` on EADDRINUSE
- `stopServer()` exported — tests can close instances independently
- Test file `test/server/eaddrinuse.test.js` exists

## Partial
- Multiple `startServer()` calls: no module-level singleton server variable, each call creates new instance — safe, but test isolation depends on proper stopServer() usage

## Gaps
- None critical

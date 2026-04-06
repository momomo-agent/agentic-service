# M2 DBB Check

**Match: 90%** | 2026-04-06T18:28:07.326Z

## Pass
- getOllamaStatus() pings http://localhost:11434/api/tags with 2s AbortSignal timeout
- Returns {running:false, models:[]} on timeout/error — no exception thrown
- Returns {running:true, models:[...]} with real model list when Ollama up
- readConfig() returns {} when file missing (catch returns {})
- writeConfig() uses atomic tmp→rename write to disk
- GET /api/config returns persisted config
- PUT /api/config writes to disk, returns 500 on failure
- startServer() rejects with "Port X is already in use" on EADDRINUSE

## Partial
- **Multiple startServer() calls**: createApp() creates new express instance each time — no module-level singleton, but httpServer reference management in tests needs verification
- **Test state isolation**: stopServer() exported and used in tests — partial evidence only

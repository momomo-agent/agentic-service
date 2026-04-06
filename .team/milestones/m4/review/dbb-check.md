# M4 DBB Check

**Match: 78%** | 2026-04-06T16:58:07.303Z

## Pass
- `src/runtime/embed.js`: `embed(text)` returns `[]` for empty string, delegates to `agentic-embed` for non-empty
- `src/store/index.js`: get/set/del over SQLite via `agentic-store`, get returns null for missing keys
- GET /api/status includes `devices: getDevices()` — array from hub registry
- hub.js: registerDevice/unregisterDevice/getDevices — empty registry returns `[]`
- POST /api/chat without tools: yields `{type:'content', ...}` text chunks
- Tests: `test/runtime/embed.test.js`, `test/store/index.test.js`, `test/server/hub.test.js`, `test/server/brain.test.js`

## Partial
- DBB-008: tool_use path in brain.js yields `{type:'tool_use', name, input}` — correct shape, but depends on Ollama supporting tool_calls or OPENAI_API_KEY fallback; not independently testable without live service
- store.js exports `del()` but DBB-004 describes `store.delete()` — naming mismatch in spec vs implementation

## Gaps
- tool_use integration test requires live Ollama or OpenAI key — no mock path confirmed

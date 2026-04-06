# M4 DBB Check

**Match: 85%** | 2026-04-06T18:28:07.326Z

## Pass
- embed.js: returns [] for empty string, delegates to agentic-embed for non-empty
- store/index.js: get/set/del via agentic-store SQLite — persistent across restarts
- store.get on missing key returns null (JSON.parse of null → null)
- store.del calls store.delete() on underlying store
- hub.js: getDevices() returns registry values; GET /api/status includes devices field
- brain.js: chatWithTools yields {type:'tool_use'} blocks when LLM returns tool calls
- POST /api/chat without tools returns {type:'content'} text chunks

## Partial
- **store.delete() export**: store/index.js exports `del` not `delete` — M4 DBB-004 tests `store.delete('k')` which would fail if test imports named export `delete`
- **embed returns float32**: depends on agentic-embed implementation — not directly verifiable

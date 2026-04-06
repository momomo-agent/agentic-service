# M7 DBB Check

**Match: 78%** | 2026-04-06T18:28:07.326Z

## Pass
- llm.js: Ollama failure → auto-fallback to OpenAI or Anthropic
- chatWithAnthropic: uses ANTHROPIC_API_KEY, throws "ANTHROPIC_API_KEY not set" if missing
- chatWithOpenAI: throws "OPENAI_API_KEY not set" if missing
- hub.js: WS register → registerDevice(), replies {type:'registered'}
- hub.js: ping → pong response
- sendCommand(): speak/display/capture delivered; capture returns Promise resolving capture_result
- optimizer.js: pullModel shows percent + speed progress
- brain.js: cloud fallback for tool_use when Ollama unsupported

## Partial
- **Heartbeat timeout**: hub.js removes device after 40s inactivity (not 60s as M7 DBB-005 specifies)
- **tool_use response format**: brain.js yields {type:'tool_use', id, name, input} — M7 DBB-007 expects {role:'tool', tool_use_id, content} format for Anthropic compatibility
- **SIGINT**: no explicit process.on('SIGINT') handler found in server entry
- **CDN URL**: uses jsdelivr.net, not cdn.example.com

## Fail
- **README**: no README.md at project root with install methods and API endpoint docs

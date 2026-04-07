# M76: cpu-only Profile + Server-Side VAD + optimizer.js Fix

## Goals
- Add cpu-only hardware profile to profiles/default.json
- Implement server-side VAD silence suppression
- Fix optimizer.js to contain hardware optimization logic

## Acceptance Criteria
- profiles/default.json has cpu-only profile with model recommendations
- Server-side VAD drops silence frames before STT/LLM pipeline
- optimizer.js returns hardware-based model config (not ollama setup code)

## Gaps Addressed
- DBB partial: profiles/default.json missing cpu-only profile
- DBB missing: server-side VAD silence suppression
- DBB missing: optimizer.js hardware optimization logic

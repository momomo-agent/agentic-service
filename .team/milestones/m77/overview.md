# M77: Server-side VAD + Hardware Optimizer + CPU-only Profile

## Goals
Address three missing/partial gaps blocking architecture compliance and DBB match.

## Scope
1. Server-side VAD — silence suppression before STT/LLM pipeline
2. optimizer.js — hardware-adaptive config output (replace ollama setup stub)
3. profiles/default.json — add cpu-only profile

## Acceptance Criteria
- hub.js wakeword pipeline filters silence via server-side VAD before forwarding to brain
- optimizer.js returns hardware-adaptive config object based on detected hardware
- profiles/default.json contains cpu-only entry alongside apple-silicon and nvidia

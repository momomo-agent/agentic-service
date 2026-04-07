# M71: Server-Side VAD + Optimizer Hardware-Adaptive Config

## Goals
- Implement server-side VAD silence suppression so silence audio never reaches STT/LLM pipeline
- Fix optimizer.js to output hardware-adaptive config instead of ollama setup code
- Add cpu-only profile to profiles/default.json

## Acceptance Criteria
- Server-side VAD filters silence before STT processing
- optimizer.js returns hardware-adaptive config object (threads, model size, quantization)
- profiles/default.json includes cpu-only profile entry

## Priority
P0 (missing gaps from DBB + vision analysis)

## Blocked By
M70 tasks completion

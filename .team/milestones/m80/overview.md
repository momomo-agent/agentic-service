# M80: Wake Word Server Pipeline + Cross-Device Brain State

## Goals
- Implement real server-side wake word pipeline (replace sense.js stub)
- Improve cross-device brain state sharing beyond minimal joinSession/broadcastSession

## Scope
- sense.js: replace startWakeWordPipeline() stub with real mic/audio capture
- hub.js: wire wakeword event to brainChat once sense pipeline fires
- hub.js: deepen cross-device brain state sync (shared context across sessions)

## Acceptance Criteria
- Wake word detection fires brainChat on server without client trigger
- Cross-device sessions share LLM context (not just session ID)
- No regressions in existing hub.js tests

## Gaps Addressed
- vision.json: "multi-device cross-device brain state sharing is minimal" (partial)
- vision.json: "sense.js startWakeWordPipeline() is a stub" (partial)
- prd.json: "Wake word server-side pipeline: hub.js wires wakeword event to brainChat but sense stub means it never fires" (partial)

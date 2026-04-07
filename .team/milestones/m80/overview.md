# M80: Wake Word Server Pipeline + Cross-Device Brain State

## Goals
Implement server-side wake word pipeline and deepen cross-device brain state sharing.

## Scope
- Server-side wake word pipeline in sense.js (partial → P1)
- Cross-device brain state sharing in hub.js (partial → P1)

## Acceptance Criteria
- sense.js startWakeWordPipeline() captures mic audio and fires wakeword events
- hub.js broadcastSession shares brain state across connected devices

# Design: src/runtime/sense.js

## File
`src/runtime/sense.js` (already exists)

## Exports
```js
export async function init(videoElement): Promise<void>
export function detect(frame): { faces: Face[], gestures: Gesture[], objects: Object[] }
export function on(type: string, handler: Function): void
export function start(): void
export function stop(): void
```

## Logic
- init(): createPipeline({ face, gesture, object }), store as module-level `pipeline`
- detect(): if !pipeline return empty struct; call pipeline.detect(frame), map results
- start(): setInterval 100ms, call pipeline.detect(video), emit events via handlers
- stop(): clearInterval, pipeline = null

## Edge Cases
- detect() before init() → return { faces: [], gestures: [], objects: [] }
- objects filtered by confidence > 0.5
- start() called twice → clears previous interval first

## Test Cases (DBB-007, DBB-008)
- After init + detect(frame) → result has faces/gestures/objects arrays
- detect() without init → no throw, returns empty struct

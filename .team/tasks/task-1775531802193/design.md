# Design: Confirm agentic-sense wrapping in runtime/sense.js

## Files
- `src/runtime/sense.js` — already imports from `'agentic-sense'` ✓
- `package.json` imports map — already has `"agentic-sense": "./src/runtime/adapters/sense.js"` ✓

## Verification Steps
1. Confirm `src/runtime/adapters/sense.js` exists and exports `createPipeline`
2. Confirm `package.json` imports map entry is present
3. No `agentic-sense` entry needed in `dependencies` (resolved via imports map)

## Required Fix (if adapter missing)
Create `src/runtime/adapters/sense.js`:
```js
export async function createPipeline(options = {}) {
  return {
    detect: () => ({ faces: [], gestures: [], objects: [] }),
    detectAudio: () => false,
    _video: null
  };
}
```

## Test Cases
- `import { createPipeline } from 'agentic-sense'` resolves to adapter
- `init()` completes without error
- `detect(frame)` returns `{ faces, gestures, objects }`

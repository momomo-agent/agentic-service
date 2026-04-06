# Design: 实现 src/runtime/tts.js

## File
`src/runtime/tts.js` — already exists, implementation complete.

## Interface
```js
export async function init() → Promise<void>
export async function synthesize(text: string) → Promise<Buffer>
```

## Logic
1. `init()`: read profile, select adapter by `profile.tts.provider`
2. Adapter map: `kokoro` → `agentic-voice/kokoro`, `piper` → `agentic-voice/piper`, default → `agentic-voice/openai-tts`
3. If adapter load fails → fallback to default
4. `synthesize()`: guard empty/whitespace text → throw `{ code: 'EMPTY_TEXT' }`, else delegate to `adapter.synthesize(text)`

## Error handling
- Not initialized: throw `Error('not initialized')`
- Empty text: throw with `code: 'EMPTY_TEXT'`

## Test cases (DBB-005, DBB-006)
- Valid text → returns Buffer/Uint8Array
- Empty string → throws EMPTY_TEXT

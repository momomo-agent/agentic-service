# Design: 实现 src/runtime/stt.js

## File
`src/runtime/stt.js` — already exists, implementation complete.

## Interface
```js
export async function init() → Promise<void>
export async function transcribe(audioBuffer: Buffer) → Promise<string>
```

## Logic
1. `init()`: read profile via `getProfile()`, select adapter by `profile.stt.provider`
2. Adapter map: `sensevoice` → `agentic-voice/sensevoice`, `whisper` → `agentic-voice/whisper`, default → `agentic-voice/openai-whisper`
3. If adapter load fails → fallback to default adapter
4. `transcribe()`: guard empty buffer → throw `{ code: 'EMPTY_AUDIO' }`, else delegate to `adapter.transcribe(audioBuffer)`

## Error handling
- Not initialized: throw `Error('not initialized')`
- Empty audio: throw with `code: 'EMPTY_AUDIO'`

## Test cases (DBB-003, DBB-004)
- Valid buffer → returns string
- Empty buffer → throws EMPTY_AUDIO

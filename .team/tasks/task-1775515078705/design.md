# Design: VAD自动语音检测集成

## Files
- `src/ui/client/App.vue` — add VAD logic
- `src/ui/client/composables/useVAD.js` — new composable

## Interface
```js
// useVAD.js
useVAD({ onSpeechEnd: (audioBlob) => void }): { start, stop, isListening }
```

## Logic
1. Import `@ricky0123/vad-web` MicVAD
2. `onSpeechEnd(audio)` → convert Float32Array to WAV blob → POST /api/transcribe → fill input
3. App.vue: toggle button switches between push-to-talk and VAD auto mode

## Edge Cases
- No microphone permission → catch error, show warning, disable VAD toggle
- VAD fires during TTS playback → ignore (gate on `isSpeaking` flag)

## Test Cases
- VAD mode toggle renders without error
- onSpeechEnd called → transcribe POST fired
- No mic permission → no crash, warning shown

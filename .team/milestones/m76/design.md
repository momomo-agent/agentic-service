# M76 Design: cpu-only Profile + Server-Side VAD + optimizer.js Fix

## Tasks

### task-1775530542647: Add cpu-only profile
- File: `profiles/default.json`
- Add entry with `match: { gpu: "none" }` (already exists — verify model is `gemma2:2b` q4)
- No code changes needed if entry already present

### task-1775530548652: Server-side VAD silence suppression
- File: `src/server/hub.js`
- In `init()` wakeword handler, add RMS check before forwarding audio to STT
- `function isSilent(buffer, threshold=0.01)` — compute RMS of Float32 PCM, return true if below threshold
- Drop silent frames; only forward speech frames to `brainChat()`

### task-1775530556380: Fix optimizer.js
- File: `src/detector/optimizer.js`
- Already correct — exports `optimize(hardware)` returning `{ threads, memoryLimit, model, quantization }`
- Verify no ollama setup code remains

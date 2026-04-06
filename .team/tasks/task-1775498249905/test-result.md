# Test Result: STT/TTS 硬件自适应选择

## Status: BLOCKED

## Tests: 7/8 passed, 1 failed

### STT (stt.js) — PASSED 5/5
- DBB-005: sensevoice provider → sensevoice adapter called ✓
- whisper provider → whisper adapter called ✓
- DBB-006: unknown provider → falls back to openai-whisper ✓
- profile load failure → falls back to openai-whisper ✓
- transcribe before init → throws 'not initialized' ✓

### TTS (tts.js) — FAILED 1/3
- ✗ DBB-007: tts.js has init() export — FAILED (init is undefined)
- DBB-007: kokoro provider → skipped (init missing)
- DBB-008: unknown tts provider fallback → skipped (init missing)

## Bug: tts.js missing init() and profile-based adapter selection
tts.js uses `createTTS()` from agentic-voice directly with no profile lookup.
Design requires ADAPTERS map (kokoro/piper/openai-tts) and init() that reads profile.
DBB-007 and DBB-008 cannot pass until tts.js is fixed.

## Test file: test/runtime/stt-tts-adaptive.test.js

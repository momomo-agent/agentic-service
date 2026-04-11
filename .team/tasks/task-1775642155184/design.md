# Design: Fix Cloud Fallback Full Spec

## Module
Runtime → `src/runtime/llm.js`

## Current State
`chat()` in `src/runtime/llm.js` falls back to cloud only on any Ollama error. PRD requires:
1. Timeout >5s triggers fallback
2. 3 consecutive errors trigger fallback
3. 60s auto-recovery probe to restore Ollama

## Files to Modify
- `src/runtime/llm.js` — add timeout tracking, consecutive-error counter, recovery probe

## Implementation Plan

### State variables (module-level)
```js
let _ollamaErrors = 0          // consecutive error count
let _ollamaDisabled = false    // true when fallback is active
let _recoveryTimer = null      // NodeJS.Timeout for 60s probe
```

### chatWithOllama changes
- Wrap fetch with `AbortSignal.timeout(5000)` (5s, not 30s)
- On success: reset `_ollamaErrors = 0`, `_ollamaDisabled = false`
- On error/timeout: increment `_ollamaErrors`; if `_ollamaErrors >= 3` set `_ollamaDisabled = true` and schedule recovery

### Recovery probe
```js
function scheduleRecovery() {
  if (_recoveryTimer) return
  _recoveryTimer = setTimeout(async () => {
    _recoveryTimer = null
    try {
      const r = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(2000) })
      if (r.ok) { _ollamaErrors = 0; _ollamaDisabled = false }
      else scheduleRecovery()
    } catch { scheduleRecovery() }
  }, 60_000)
}
```

### chat() logic
```js
export async function* chat(messageOrText, options = {}) {
  // ... existing message normalization ...
  if (!_ollamaDisabled) {
    try {
      for await (const chunk of chatWithOllama(messages)) { yield chunk }
      return
    } catch (error) {
      _ollamaErrors++
      if (_ollamaErrors >= 3) { _ollamaDisabled = true; scheduleRecovery() }
      console.warn('Ollama failed, falling back to cloud:', error.message)
    }
  }
  // cloud fallback (existing logic)
}
```

## Test Cases
- Ollama responds in <5s → no fallback
- Ollama times out (>5s) → fallback triggered, `_ollamaErrors` incremented
- 3 consecutive errors → `_ollamaDisabled = true`, recovery scheduled
- After 60s probe succeeds → `_ollamaDisabled = false`, next call uses Ollama

## ⚠️ Assumptions
- `AbortSignal.timeout` available (Node ≥18 ✓)
- Recovery timer does not block process exit (use `timer.unref()`)

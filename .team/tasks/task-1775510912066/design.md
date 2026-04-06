# Design: 修复 src/detector/optimizer.js

## Problem
Current `optimizer.js` contains Ollama install logic (wrong content). Architecture requires:
```javascript
// detector/optimizer.js — not defined in ARCHITECTURE.md explicitly,
// but referenced as a module alongside hardware.js, profiles.js, matcher.js
```
The file must export an `optimize(hardware, profile)` function that post-processes a matched profile based on hardware constraints.

## Files to Modify
- `src/detector/optimizer.js` — rewrite entirely

## Interface
```javascript
/**
 * Post-process profile based on actual hardware constraints.
 * @param {HardwareInfo} hardware
 * @param {ProfileConfig} profile
 * @returns {ProfileConfig}
 */
export function optimize(hardware, profile) { ... }
```

## Logic
1. If `hardware.gpu.type === 'none'` and profile uses local LLM → switch to fallback provider
2. If `hardware.memory < 8` → downgrade model quantization or switch to smaller model
3. Otherwise return profile unchanged

## Edge Cases
- `profile.fallback` missing → return profile as-is
- `hardware.gpu.vram` too low for model → use fallback

## Test Cases
1. `optimize({ gpu:{type:'none'}, memory:4 }, profile)` → returns profile with `llm` set to fallback values
2. `optimize({ gpu:{type:'apple-silicon',vram:16}, memory:16 }, profile)` → returns profile unchanged

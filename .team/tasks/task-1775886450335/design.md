# Design: Clean Dead Import Maps in package.json

## Module
Project config — `package.json`

## Current State
`package.json` `imports` field:
```json
"imports": {
  "#agentic-embed": "./src/runtime/adapters/embed.js",
  "#agentic-voice": "./src/runtime/adapters/voice/openai-tts.js"
}
```

These import maps were created when `agentic-embed` and `agentic-voice` were not available as packages. Now the source files use the packages directly (`import ... from 'agentic-embed'`, `import ... from 'agentic-voice'`), so these `#` aliases are dead.

## Verification
Before removing, confirm no source file uses `#agentic-embed` or `#agentic-voice`:
```bash
grep -r "#agentic-embed\|#agentic-voice" src/ test/
```
If grep returns nothing → safe to delete.

## Files to Modify
- `package.json` — remove the `imports` field entirely (or just the two dead entries)

## Implementation Plan

### Step 1: Verify no usages
```bash
grep -r "#agentic-embed\|#agentic-voice" src/ test/ bin/
```
Expected: no matches.

### Step 2: Remove the `imports` field from package.json
```json
// Before:
"imports": {
  "#agentic-embed": "./src/runtime/adapters/embed.js",
  "#agentic-voice": "./src/runtime/adapters/voice/openai-tts.js"
},

// After: field removed entirely
```

### Step 3: Verify adapters still work
The adapter files (`src/runtime/adapters/embed.js`, `src/runtime/adapters/voice/openai-tts.js`) are still used — they're just no longer aliased via import maps. Confirm they're imported by their direct path in the codebase:
```bash
grep -r "adapters/embed\|adapters/voice" src/
```

## Test Cases
- `node -e "import('./src/runtime/embed.js')"` succeeds (no resolution error)
- `npx vitest run` passes same tests as before (no regressions from removing import maps)

## ⚠️ Assumptions
- No test or source file uses `#agentic-embed` or `#agentic-voice` import specifiers
- The adapter files are imported by direct relative path, not via the `#` alias

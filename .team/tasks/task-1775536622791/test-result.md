# Test Result: Wire agentic-voice as external package

## Status: FAILED ❌

## Test Summary
- **Total Tests**: 4 written
- **Passed**: 0
- **Failed**: Cannot run due to implementation bugs
- **Coverage**: 0% (blocked by syntax errors)

## Critical Implementation Bugs Found

### Bug 1: Invalid package.json syntax
**Location**: `package.json:44`
**Issue**: Trailing comma in imports field
```json
"imports": {
  "#agentic-embed": "./src/runtime/adapters/embed.js",  // ← trailing comma
},
```
**Impact**: Prevents npm/vitest from running. Build system fails immediately.
**Fix Required**: Remove trailing comma on line 44

### Bug 2: tts.js uses incorrect import syntax
**Location**: `src/runtime/tts.js:5-7`
**Issue**: Uses import map syntax `#agentic-voice/*` instead of external package `'agentic-voice/*'`

**Current (WRONG)**:
```javascript
const ADAPTERS = {
  kokoro:  () => import('#agentic-voice/kokoro'),
  piper:   () => import('#agentic-voice/piper'),
  default: () => import('#agentic-voice/openai-tts'),
};
```

**Expected (per design.md)**:
```javascript
const ADAPTERS = {
  kokoro:  () => import('agentic-voice/kokoro'),
  piper:   () => import('agentic-voice/piper'),
  default: () => import('agentic-voice/openai-tts'),
};
```

**Impact**: tts.js will fail to load adapters from the external package. It's trying to use import maps which don't exist for agentic-voice.

## Verification Against DBB (M84)

### ✅ Passed Criteria
- [x] `package.json` has `"agentic-voice"` in `dependencies` (line 49)
- [x] `src/runtime/stt.js` imports adapters from `'agentic-voice/*'` correctly

### ❌ Failed Criteria
- [ ] `src/runtime/tts.js` imports adapters from `'agentic-voice/*'` - **USES WRONG SYNTAX**
- [ ] No local voice stubs remain in use - **Cannot verify due to syntax error**

## Tests Written

Created `test/voice-package-wiring.test.js` with 4 test cases:
1. package.json has agentic-voice dependency
2. stt.js imports from agentic-voice package (not local stubs)
3. tts.js imports from agentic-voice package (not local stubs)
4. no local voice adapter stubs remain

**Cannot execute tests** due to package.json syntax error blocking vitest startup.

## Edge Cases Identified

1. **Import map collision**: If `#agentic-voice` import map is defined elsewhere, it could mask the bug temporarily
2. **Runtime vs build-time failure**: The trailing comma fails at build time, but the wrong import syntax would fail at runtime
3. **Fallback behavior**: Even if tts.js fails to load adapters, it should fall back to default adapter - this needs testing once bugs are fixed

## Required Actions

1. **Developer must fix**:
   - Remove trailing comma in package.json line 44
   - Change tts.js imports from `#agentic-voice/*` to `'agentic-voice/*'`

2. **After fixes, re-test**:
   - Run `npx vitest run test/voice-package-wiring.test.js`
   - Verify all 4 tests pass
   - Test runtime behavior with actual agentic-voice package

## Recommendation

**BLOCK this task** and return to developer for fixes. The implementation does not match the design specification.

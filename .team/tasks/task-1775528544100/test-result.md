# Test Result: agentic-sense and agentic-voice external package wiring

## Summary
- Total: 5
- Passed: 4
- Failed: 1

## Results

| Test | Result |
|------|--------|
| sense.js imports from agentic-sense | PASS |
| stt.js imports from agentic-voice | PASS |
| tts.js imports from agentic-voice | PASS |
| package.json imports map has agentic-sense entry | **FAIL** |
| package.json imports map has agentic-voice entries | PASS |

## Bug Found

`package.json` `imports` map is missing the `agentic-sense` key. The `agentic-voice/*` entries are present but `agentic-sense` has no local alias, so `import { createPipeline } from 'agentic-sense'` in `src/runtime/sense.js` will fail at runtime with a module-not-found error.

**Fix needed**: Add to `package.json` `imports`:
```json
"agentic-sense": "./src/runtime/adapters/sense/index.js"
```
(or equivalent local adapter path)

## Edge Cases
- No `agentic-sense` or `agentic-voice` listed in `dependencies` — packages rely solely on `imports` map aliasing to local adapters, which is intentional but undocumented.

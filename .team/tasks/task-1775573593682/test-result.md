# Test Result: Verify npx agentic-service One-Command Startup

## Summary
- **Total Tests**: 4
- **Passed**: 2
- **Failed**: 2

## Results

### ✓ Test 1: package.json bin field
`package.json` has `"bin": { "agentic-service": "bin/agentic-service.js" }` — correct.

### ✓ Test 2: bin/agentic-service.js shebang
File starts with `#!/usr/bin/env node` — correct.

### ✗ Test 3: Server starts and responds to /api/status
**FAILED** — Server crashes at startup with:
```
SyntaxError: The requested module 'agentic-sense' does not provide an export named 'default'
    at src/runtime/adapters/sense.js:1
```

**Root cause**: `src/runtime/adapters/sense.js` line 1 uses:
```js
import agenticSense from 'agentic-sense';
```
But `agentic-sense` only exports `{ AgenticSense, createPipeline }` (no default export).

**Import chain**: `bin/agentic-service.js` → `src/server/api.js` → `src/runtime/sense.js` → `src/runtime/adapters/sense.js` → broken import.

**Fix needed** (in `src/runtime/adapters/sense.js`):
```js
// Change:
import agenticSense from 'agentic-sense';
const { AgenticSense } = agenticSense;

// To:
import { AgenticSense } from 'agentic-sense';
```

### ✗ Test 4: SIGINT exits cleanly
**FAILED** — Server never starts, so SIGINT test cannot run.

## Edge Cases Identified
- `--skip-setup` flag does not bypass the broken import (module load fails before any code runs)
- The bug affects all startup paths, not just wake word functionality

## Status: BLOCKED
Implementation bug in `src/runtime/adapters/sense.js` prevents server from starting.

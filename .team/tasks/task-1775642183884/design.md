# Design: Clean ARCHITECTURE.md Stale Content

## Module
Documentation — `ARCHITECTURE.md`

## Current State
Two problems in ARCHITECTURE.md:
1. Lines 191-252 contain stale CR (Change Request) addition instructions — these are meta-instructions to the architect agent, not actual architecture content. They must be removed.
2. Directory tree (lines 123-155) lists only 14 files but is missing 21 source files that now exist.

## Files to Modify
- `ARCHITECTURE.md` — remove stale CR instructions, update directory tree

## Implementation Plan

### Step 1: Remove stale CR instructions (lines 191-252)
These lines contain text like "Add sections to ARCHITECTURE.md documenting...", "Add the following clarifications...", etc. They are queued change requests that were never cleaned up. Delete the entire block.

### Step 2: Update directory tree to include all actual source files
Current tree is missing:
```
src/
├── index.js                          # ← missing
├── tunnel.js                         # ← missing
├── cli/
│   ├── setup.js                      # ← missing
│   └── browser.js                    # ← missing
├── detector/
│   ├── hardware.js
│   ├── profiles.js
│   ├── matcher.js                    # ← missing
│   ├── ollama.js                     # ← missing
│   └── optimizer.js
├── runtime/
│   ├── llm.js
│   ├── stt.js
│   ├── tts.js
│   ├── sense.js
│   ├── memory.js
│   ├── vad.js                        # ← missing
│   ├── embed.js                      # ← missing
│   ├── profiler.js                   # ← missing
│   ├── latency-log.js                # ← missing
│   └── adapters/                     # ← missing
│       ├── embed.js
│       └── voice/
│           └── openai-tts.js
├── server/
│   ├── hub.js
│   ├── brain.js
│   ├── api.js
│   ├── cert.js                       # ← missing
│   ├── httpsServer.js                # ← missing
│   └── middleware.js                 # ← missing
├── store/
│   └── index.js                      # ← missing
└── ui/
    ├── client/
    └── admin/
```

### Step 3: Verify no other stale content
- Check for any other "Add X to ARCHITECTURE.md" instructions embedded in the doc
- Remove them

## Constraints
- This task is assigned to `tech_lead` but ARCHITECTURE.md is architect-owned
- Per permission rules, tech_lead CANNOT write to ARCHITECTURE.md directly
- Instead: write a change request at `.team/change-requests/cr-<timestamp>.json` describing the exact edits needed
- The developer assigned to this task should be redirected to submit a CR, OR the architect agent should execute the cleanup

## ⚠️ Note for Developer
Since ARCHITECTURE.md is architect-owned, the developer executing this task must either:
(a) Get architect agent approval first, then make the edit, OR
(b) Submit a CR and wait for architect to apply it

The actual content changes are straightforward — no logic, just cleanup.

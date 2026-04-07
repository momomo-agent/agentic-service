# M95: Final Push — Test Pass Rate + Gap Re-evaluation

## Goal
Push Vision 72% → 90%+ and PRD 78% → 90%+ by fixing remaining test failures and running fresh gap evaluations.

## Context
- M92 fixed 86 stale mock tests, but DBB still shows 81.7% pass rate (120 failing)
- agentic-sense wiring gap may be stale — needs fresh verification
- Vision and PRD gap files haven't been re-evaluated since M85-M92 fixes
- M93 (STT/TTS, wake word, cloud fallback) and M94 (architecture CR, CDN fallback) are active

## Scope
1. Run full test suite, identify remaining failing tests, fix top blockers
2. Run fresh DBB evaluation to get true current scores
3. Verify agentic-sense is properly wired as external package (no #agentic-sense import map)
4. If test pass rate hits >=90%, re-run vision/PRD gap evaluations

## Acceptance Criteria
- Test pass rate >=90% (>=599/665 or equivalent)
- DBB match >=90%
- Vision match >=90%
- PRD match >=90%
- agentic-sense not in import map, properly in package.json

## Priority
P0 — final milestone to reach project goals

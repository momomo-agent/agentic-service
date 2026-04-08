# Milestone m23: Critical Gap Resolution

## Goals

Close 2 CRITICAL gaps + major PRD/DBB gaps to reach goal (Vision ≥90% + PRD ≥90%):
1. Fix port mismatch (docs say 3000, code uses 1234) - CRITICAL
2. Create missing src/index.js entry point - CRITICAL
3. Fix cloud fallback compliance (timeout, retry, auto-restore)
4. Fix Docker config gaps (OLLAMA_HOST, data volume)
5. Fix test suite failures (59/206 files failing)
6. Clean up ARCHITECTURE.md stale content

## Scope

- Unify default port to 1234 across all docs and Docker configs
- Create src/index.js exporting core API
- Implement complete cloud fallback logic per PRD spec
- Add missing Docker environment variables and volume mounts
- Fix test failures, especially STT/TTS env-dependent tests
- Clean ARCHITECTURE.md stale CR content and update directory tree

## Success Criteria

- [ ] DBB match ≥90% (currently 65%)
- [ ] PRD match ≥90% (currently 65%)
- [ ] All m23 tasks in "done" status
- [ ] No CRITICAL gaps remaining
- [ ] Test pass rate ≥90%

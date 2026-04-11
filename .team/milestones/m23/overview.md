# Milestone m23: PRD Gap Closure — Critical Fixes + Admin UI

## Goals

Close 2 CRITICAL gaps + major PRD/DBB gaps to reach goal (Vision ≥90% + PRD ≥90%):
1. Fix port mismatch (docs say 3000, code uses 1234) - CRITICAL
2. Create missing src/index.js entry point - CRITICAL
3. Build Admin UI dist (dist/admin/ missing, /admin returns 404) - MAJOR
4. Fix cloud fallback compliance (timeout, retry, auto-restore)
5. Fix Docker config gaps (OLLAMA_HOST, data volume)
6. Fix test suite failures (59/206 files failing)
7. Clean up ARCHITECTURE.md stale content
8. Remove dead import maps from package.json

## Scope

- Unify default port to 1234 across all docs and Docker configs
- Create src/index.js exporting core API (startServer, detector, runtime, server)
- Run npm run build in src/ui/admin/ to generate dist/admin/
- Implement complete cloud fallback logic per PRD spec (>5s timeout, 3 errors, 60s restore)
- Add missing Docker environment variables and volume mounts
- Fix test failures, especially STT/TTS env-dependent tests
- Clean ARCHITECTURE.md stale CR content and update directory tree
- Remove #agentic-embed and #agentic-voice dead import map entries

## Success Criteria

- [ ] DBB match ≥90% (currently 62%)
- [ ] PRD match ≥90% (currently 65%)
- [ ] All m23 tasks in "done" status
- [ ] No CRITICAL gaps remaining
- [ ] Test pass rate ≥90%
- [ ] /admin route returns 200 (Admin UI built)
- [ ] require('agentic-service') works without MODULE_NOT_FOUND

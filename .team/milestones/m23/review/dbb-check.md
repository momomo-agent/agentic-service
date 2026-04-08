# M23: Admin UI Redesign — DBB Check

**Date:** 2026-04-08T17:02:00Z
**Milestone:** m23 — Admin UI Redesign
**Status:** active (no completion criteria defined)

## Issue: m23 dbb.md is empty

The milestone-specific DBB file (`.team/milestones/m23/dbb.md`) contains only a header — no acceptance criteria are defined. This makes it impossible to perform a proper criterion-by-criterion verification.

## What Exists in the Codebase

The Admin UI is **fully implemented** as a Vue 3 + Vite SPA:

| Component | Path | Status |
|-----------|------|--------|
| App.vue | `src/ui/admin/src/App.vue` | Implemented — polls /api/status every 5s, nav links, renders 3 inline components + router-view |
| SystemStatus | `src/ui/admin/src/components/SystemStatus.vue` | Implemented — fetches /api/status, displays hardware + profile |
| DeviceList | `src/ui/admin/src/components/DeviceList.vue` | Implemented — fetches /api/devices, empty state, table rendering |
| ConfigPanel | `src/ui/admin/src/components/ConfigPanel.vue` | Implemented — GET/PUT /api/config, llm/stt/tts fields |
| HardwarePanel | `src/ui/admin/src/components/HardwarePanel.vue` | Implemented — renders hardware prop as key-value pairs |
| LogViewer | `src/ui/admin/src/components/LogViewer.vue` | Implemented — scrollable log display with auto-scroll |
| Router | `src/ui/admin/src/main.js` | Implemented — 3 routes with /admin base |
| Serving | `src/server/api.js:317-323` | Implemented — /admin + / root paths |
| Build | `dist/admin/` | Built — index.html + 94KB JS bundle |
| Tests | `test/m23-app-vue.test.js` | Exists — covers imports, polling, props, lifecycle |

## Global DBB Match: 65%

**11 gaps remaining** (3 missing, 8 partial):

### Critical (2)
1. **src/index.js missing** — package.json "main" points to non-existent file
2. **Port mismatch** — README/Docker use port 3000, CLI defaults to 1234; Docker healthcheck hits :3000 but container listens on 1234

### Major (4)
3. **ARCHITECTURE.md stale CR** — Lines 191-252 contain repeated add-section instructions
4. **ARCHITECTURE.md incomplete directory tree** — Lists 14 files, 35 exist (excl. node_modules)
5. **Dead import maps** — #agentic-embed and #agentic-voice still in package.json imports
6. **Test pass rate ~94%** — ~49 failures from stale mocks

### Minor (5)
7. **embed.js adapter stub** — Throws "not implemented"
8. **mDNS/Bonjour** — Not implemented
9. **Docker OLLAMA_HOST** — Missing env var
10. **Docker data volume** — Missing ./data mount
11. **Middleware** — 4-line error handler, no security middleware

## Resolved Since Last Check

- ~~sense.js adapter stub~~ — Actually implemented (imports agentic-sense, exports createPipeline)

## Recommendation

The m23 milestone should either:
- Be marked **completed** (admin UI is fully implemented and functional), or
- Have its `dbb.md` populated with specific acceptance criteria for verification

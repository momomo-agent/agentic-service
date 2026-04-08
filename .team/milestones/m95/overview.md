# M95: Final Push — Architecture Docs + CPU Profiling + Gap Re-evaluation

## Goal
Close the remaining gaps to reach Vision >=90% and PRD >=90%.

## Context
- M92 (test fixes, Docker, README) — completed
- M93 (STT/TTS, wake word, cloud fallback verification) — completed
- M94 (voice latency benchmark, CDN fallback verification) — completed (2/3 tasks)
- M96 (architecture docs + CPU profiling) — cancelled, tasks absorbed here
- Gap files are stale (last updated Apr 7). ARCHITECTURE.md sections 5-8 already added (tunnel, CLI, VAD, HTTPS/middleware)
- Remaining Vision gaps: agentic-embed docs (partial), CPU profiling (missing)
- Test pass rate already >=90%, agentic-sense wiring verified

## Tasks (4 remaining, ordered by dependency)

### Task 1: Review and merge Architecture CR for undocumented modules
- **Owner:** developer | **Priority:** P0
- Review CR-1775569100684 for ARCHITECTURE.md additions
- Sections 5-8 (tunnel, CLI, VAD, HTTPS/middleware) already present
- Verify completeness and mark CR as reviewed/merged

### Task 2: Document agentic-embed in ARCHITECTURE.md
- **Owner:** developer | **Priority:** P1
- Add section documenting agentic-embed's role (embed.js + adapters/)
- Cover vector embedding capability (bge-m3) and memory.js integration
- Mark related CRs (cr-1775579949939, cr-1775580105000) as reviewed/merged

### Task 3: Implement CPU profiling instrumentation
- **Owner:** developer | **Priority:** P0
- Vision gap: "CPU profiling / performance instrumentation absent" — MISSING
- Add `performance.now()` timing wrappers around stt.js/llm.js/tts.js key functions
- Add `/api/profile` endpoint returning timing data
- Closes the last Vision "missing" gap toward >=90%

### Task 4: Run fresh DBB/PRD/Vision gap evaluation (BLOCKED by Tasks 1-3)
- **Owner:** tester | **Priority:** P0
- Gap files are stale — fresh evaluation needed after all dev work is complete
- Target: Vision >=90%, PRD >=90%, DBB >=90%
- Report final scores

## Acceptance Criteria
- CR-1775569100684 reviewed and ARCHITECTURE.md updated
- ARCHITECTURE.md documents agentic-embed integration (Section 9)
- CPU profiling instrumentation implemented and functional
- Fresh gap evaluation shows Vision >=90%, PRD >=90%, DBB >=90%

## Priority
P0 — final milestone to reach project goals (Vision >=90%, PRD >=90%)

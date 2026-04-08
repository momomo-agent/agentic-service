# M96: Final Vision Push — Architecture Docs + CPU Profiling

## Goal
Close the remaining gaps to reach Vision ≥90% and PRD ≥90%.

## Context
After M91-M95 completion:
- Most "partial" Vision/PRD gaps should be verified as implemented
- Vision gap math: 9 implemented + 8 partial (verified) + 2 missing = 17/19 = 89.5%
- To reach ≥90%, we must address at least one "missing" gap
- Architecture docs (tunnel, CLI, VAD, HTTPS) already added to ARCHITECTURE.md — only agentic-embed missing

## Tasks

### Task 1: Review and merge Architecture CRs + document agentic-embed
- **Owner:** developer
- **Priority:** P1
- Two pending CRs (cr-1775579949939, cr-1775580105000) request tunnel/CLI/VAD/HTTPS docs — already added
- Add agentic-embed section to ARCHITECTURE.md (embed.js + adapters/, bge-m3 vector embedding, memory.js integration)
- Mark both CRs as reviewed/merged
- Expected Architecture match: ~100%

### Task 2: Implement CPU profiling instrumentation
- **Owner:** developer
- **Priority:** P0
- Vision gap: "CPU profiling / performance instrumentation for latency measurement absent" (MISSING)
- Add timing instrumentation around STT/LLM/TTS pipeline functions
- Can use performance.now() wrappers or dedicated profiling module
- Add /api/profile endpoint returning timing data
- Closes the last Vision "missing" gap

## Acceptance Criteria
- [ ] ARCHITECTURE.md documents agentic-embed integration
- [ ] CPU profiling instrumentation implemented and functional
- [ ] Fresh gap evaluation shows Vision ≥90%
- [ ] Fresh gap evaluation shows PRD ≥90%

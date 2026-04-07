# M42: optimizer.js 硬件优化接线

## Goals
- Add `optimize(hardware, profile)` export to `src/detector/optimizer.js`
- Wire optimizer output into `src/runtime/llm.js` for hardware-adaptive settings

## Acceptance Criteria
- `optimizer.js` exports `optimize(hardware, profile)` returning adjusted config (quantization, threads, context size)
- `llm.js` calls optimizer to apply hardware-specific settings before chat

## Tasks
- task-1775522924391: src/detector/optimizer.js — 硬件优化逻辑补全 (P1)

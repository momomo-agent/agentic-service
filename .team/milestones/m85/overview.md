# M85: Final Compliance — agentic-sense, Test Pass Rate, Architecture Docs

## Goals
- Wire agentic-sense as external package in package.json dependencies
- Push test pass rate from 81.7% to ≥90% (fix remaining ~120 failing tests)
- Document missing modules in ARCHITECTURE.md: tunnel, CLI, VAD, HTTPS/middleware

## Scope
- agentic-sense package wiring (DBB gap: missing)
- Test suite completion after M83 fixes land
- Architecture documentation for undocumented modules

## Acceptance Criteria
- agentic-sense in package.json dependencies and import map
- Test pass rate ≥90% (≥591/657)
- ARCHITECTURE.md covers: tunnel, CLI module, VAD, HTTPS/middleware layers

## Blocked By
- M83 must complete first (test suite repair foundation)

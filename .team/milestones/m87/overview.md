# M87: Architecture Docs + agentic-sense Wiring

## Goals
1. Wire agentic-sense as external package (remove import map stub)
2. Update ARCHITECTURE.md to document: tunnel, CLI, HTTPS/middleware, VAD, embed modules

## Acceptance Criteria
- agentic-sense in package.json dependencies, imported directly (not via '#agentic-sense')
- ARCHITECTURE.md covers all 5 missing/partial modules
- DBB architecture match >= 92%

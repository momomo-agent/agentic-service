# M76: Architecture Compliance — agentic-store + agentic-embed External Packages

## Goal
Wire `agentic-store` and `agentic-embed` as external package dependencies per architecture spec.

## Scope
- Replace local `src/store/index.js` with `agentic-store` package import
- Replace local `src/runtime/embed.js` with `agentic-embed` package import
- Verify package.json lists both as dependencies

## Acceptance Criteria
- `import ... from 'agentic-store'` resolves at runtime
- `import ... from 'agentic-embed'` resolves at runtime
- No local stub fallback for these modules

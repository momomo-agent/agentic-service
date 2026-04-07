# Wire agentic-sense as external package

## Progress

- Removed `#agentic-sense` alias from `vitest.config.js`
- Removed `#agentic-sense` from `package.json` imports map
- `src/runtime/sense.js` already imports from `'agentic-sense'` directly
- All 5 m84-sense-external-package tests pass

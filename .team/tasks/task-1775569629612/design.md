# Technical Design: Wire agentic-sense as external package

## Files to Modify

- `vitest.config.js` — remove `'#agentic-sense': path.resolve('./src/runtime/adapters/sense.js')` alias line

## No other changes needed

`src/runtime/adapters/sense.js` already imports from `'agentic-sense'` directly.
`package.json` already has `"agentic-sense": "file:./vendor/agentic-sense.tgz"`.

## Verification

- `grep '#agentic-sense' vitest.config.js` returns nothing
- `npm test` sense tests pass

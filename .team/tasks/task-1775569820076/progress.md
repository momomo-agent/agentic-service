# Fix createPipeline export in src/runtime/adapters/sense.js

## Progress

- Replaced local `createPipeline` in `src/runtime/sense.js` with import from `./adapters/sense.js`
- Adapter already correctly re-exports from `agentic-sense`; tests mocking that package now intercept via adapter chain


# Wire agentic-sense as external npm package

## Progress

Fixed `src/runtime/adapters/sense.js`: agentic-sense is CJS, named ESM imports fail.
Used default import + destructure AgenticSense, wrap with createPipeline factory using init().
All 3 verification steps pass.

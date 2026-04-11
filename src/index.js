// src/index.js
// Main entry point for agentic-service package

// Server API
export { startServer, startDrain, waitDrain } from './server/api.js';

// Detector API
export { detect as detectHardware } from './detector/hardware.js';
export { getProfile, matchProfile } from './detector/profiles.js';
export { ensureOllama } from './detector/ollama.js';

// Module namespaces
export * as runtime from './runtime/index.js';
export * as server from './server/index.js';
export * as detector from './detector/index.js';

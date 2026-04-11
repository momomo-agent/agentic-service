// src/detector/index.js
// Detector module aggregator

export { detect } from './hardware.js';
export { getProfile, matchProfile, watchProfiles } from './profiles.js';
export { ensureOllama } from './ollama.js';
export { matchProfile as match } from './matcher.js';

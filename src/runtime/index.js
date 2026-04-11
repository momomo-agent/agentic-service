// src/runtime/index.js
// Runtime module aggregator

export { chat } from './llm.js';
export { transcribe } from './stt.js';
export { synthesize } from './tts.js';
export { add as addMemory, remove as removeMemory, search as searchMemory } from './memory.js';
export { detectVoiceActivity } from './vad.js';
export { embed } from './embed.js';

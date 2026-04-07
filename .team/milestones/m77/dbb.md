# M77 DBB: Server-side VAD + Hardware Optimizer + CPU-only Profile

## Verification Criteria

1. `src/server/hub.js` drops silent audio frames (RMS < 0.01) before forwarding to STT pipeline
2. `src/detector/optimizer.js` `optimize()` returns `{ threads, memoryLimit, model, quantization }` for apple-silicon, nvidia, and cpu-only hardware
3. `profiles/default.json` has a cpu-only profile entry with model `gemma3:1b` and `q4` quantization
4. `optimize()` does not contain any ollama install/setup code
5. Unit test confirms silent buffer is filtered and `brainChat` is not called

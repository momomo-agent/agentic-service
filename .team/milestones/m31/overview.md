# M31: Detector层补全 + Runtime层核心 (llm/stt/tts)

## 目标
完成 Detector 层（已done）并实现 Runtime 层核心模块。

## 范围
1. `src/detector/profiles.js` — getProfile(hardware) ✅
2. `src/detector/optimizer.js` — 硬件优化路径 ✅
3. `src/detector/gpu-detector.js` — 合并入 hardware.js ✅
4. `profiles/default.json` — cpu-only 默认 profile ✅
5. `src/runtime/llm.js` — chat(messages, options) → stream
6. `src/runtime/stt.js` — transcribe(audioBuffer) → text
7. `src/runtime/tts.js` — synthesize(text) → audioBuffer

## 验收标准
- llm.js 支持 Ollama 本地 + OpenAI/Anthropic 云端回退，流式输出
- stt.js 支持 SenseVoice/Whisper + 云端回退
- tts.js 支持 Kokoro/Piper + 云端回退

## Gap来源
- Architecture gap (missing): src/runtime/llm.js、stt.js、tts.js

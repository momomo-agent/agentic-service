# Task Design: profiles/default.json 内置硬件配置

## File
- `profiles/default.json`

## Required Structure
```json
{
  "version": "1.0.0",
  "profiles": [
    { "match": { "platform": "darwin", "arch": "arm64", "gpu": "apple-silicon", "minMemory": 16 },
      "config": { "llm": { "provider": "ollama", "model": "gemma4:26b", "quantization": "q8" },
                  "stt": { "provider": "sensevoice", "model": "small" },
                  "tts": { "provider": "kokoro", "voice": "default" },
                  "fallback": { "provider": "openai", "model": "gpt-4o-mini" } } },
    { "match": { "platform": "linux", "gpu": "nvidia", "minMemory": 8 },
      "config": { "llm": { "provider": "ollama", "model": "gemma4:13b", "quantization": "q4" },
                  "stt": { "provider": "sensevoice", "model": "small" },
                  "tts": { "provider": "kokoro", "voice": "default" },
                  "fallback": { "provider": "openai", "model": "gpt-4o-mini" } } },
    { "match": {},
      "config": { "llm": { "provider": "ollama", "model": "gemma3:1b", "quantization": "q4" },
                  "stt": { "provider": "sensevoice", "model": "small" },
                  "tts": { "provider": "kokoro", "voice": "default" },
                  "fallback": { "provider": "openai", "model": "gpt-4o-mini" } } }
  ]
}
```

## Notes
- Last entry `match: {}` is the cpu-only fallback — matches any hardware
- `gemma3:1b q4` runs on CPU with 4GB+ RAM
- profiles.js loadBuiltinProfiles() reads this file via import/fs

## Test Cases
1. File parses as valid JSON
2. matchProfile({}) returns last entry (cpu-only)
3. matchProfile({ gpu: 'apple-silicon', memory: 16 }) returns first entry

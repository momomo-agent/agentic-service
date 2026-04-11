# 修复 Cloud Fallback 完整规范

## Progress

Added `_ollamaErrors`, `_ollamaDisabled`, `_recoveryTimer` state + `scheduleRecovery()` (60s probe, `.unref()` to not block exit). Changed timeout 30s→5s. `chat()` checks `_ollamaDisabled`, increments error counter on failure, disables Ollama at 3 consecutive errors and schedules recovery.

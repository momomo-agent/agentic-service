# Examples

演示 Agentic 的各种能力。

## 不需要 service 的示例

直接用 Agentic 库，本地调用 Ollama：

```bash
node examples/chat.js     # LLM 流式对话
node examples/voice.js <audio.wav>  # 语音全链路
```

## 需要 service 的示例

先启动 agentic-service，再查询硬件/设备状态：

```bash
node bin/agentic-service.js  # 启动服务
node examples/hardware.js    # 硬件检测
```

## 示例列表

| 文件 | 能力 | 需要 service? |
|------|------|:---:|
| `chat.js` | LLM 流式对话 + 多轮 | ✗ |
| `voice.js` | 录音→STT→LLM→TTS | ✗ |
| `hardware.js` | 硬件/Ollama/设备状态 | ✓ |

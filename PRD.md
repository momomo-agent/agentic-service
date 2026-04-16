# agentic-service — PRD

## 概述

agentic-service 是一个本地优先的 AI 服务，自动检测硬件 → 选择最优模型 → 一键启动。支持文本/语音/视觉多模态交互，多设备 WebSocket 连接，本地不够时自动切云端。

**默认端口：** 1234
**入口：** `npx agentic-service` 或 `npm start`
**包入口：** src/index.js 导出 startServer, detectHardware, getProfile, matchProfile, ensureOllama, runtime, server, detector

---

## M1: 硬件检测 + 一键启动

**目标：** 检测硬件 → 自动选模型 → 一键启动本地 AI 服务

### Features

1. **硬件检测器** — 检测 GPU 类型、显存/内存、CPU 架构、OS，输出 JSON (detector/hardware.js)
   - 输出格式：`{ gpu: string, vram: number, ram: number, arch: string, os: string, cores: number }`
   - Apple Silicon 检测 via `sysctl`，NVIDIA 检测 via `nvidia-smi`

2. **远程 profiles** — 从 GitHub raw URL 拉取硬件配置推荐表，本地缓存，支持离线 (detector/profiles.js)
   - 4 层 fallback：新鲜缓存 → 远程获取 → 过期缓存 → 内置 default.json
   - ETag 条件获取，缓存路径 `~/.agentic-service/profiles-cache.json`
   - `getProfile()` 返回完整配置，`matchProfile(hardware)` 匹配最优 profile

3. **Profile 匹配器** — 根据硬件特征匹配最优配置 profile (detector/matcher.js)
   - 输入 hardware JSON，输出匹配的 profile 配置
   - 支持 apple-silicon / nvidia / cpu-only 三种硬件类型

4. **硬件优化器** — 根据硬件生成优化配置：线程数、内存限制、推荐模型 (detector/optimizer.js)
   - apple-silicon 16GB → threads=8, memoryLimit=12, model=gemma4:26b
   - nvidia vram=8 → threads=4, memoryLimit=6, model=gemma4:13b
   - cpu-only 8GB → threads=4, memoryLimit=4, model=gemma2:2b

5. **Ollama 集成** — 自动检测/安装 Ollama，拉取推荐模型，显示进度 (detector/ollama.js + cli/setup.js)
   - `ensureOllama()` 检测 Ollama 是否安装，未安装则提示安装
   - `pullModel(model)` 拉取模型并显示下载进度

6. **Sox 自动安装** — 检测并安装 sox（唤醒词检测依赖 node-record-lpcm16）(detector/sox.js)

7. **基础 HTTP 服务** — REST API 接受文本输入，返回 LLM 回复 (server/api.js)
   - 端点：POST /api/chat、GET /api/status、GET /api/config、POST /api/config
   - POST /api/transcribe (STT)、POST /api/synthesize (TTS)、POST /api/voice (全链路)
   - 静态文件：dist/ui (Web UI)、dist/admin (Admin 面板)
   - `startServer(port)` 启动 HTTP 服务，返回 server 实例
   - `startDrain()` / `waitDrain()` 优雅关闭支持

8. **Web UI（最小版）** — Vue 3 + Vite 对话框，能打字聊天 (src/ui/client/)
   - SSE 流式响应，消息历史，自动滚动
   - 响应式设计，支持 Enter 发送
   - 构建产物输出到 dist/ui/

9. **一键安装脚本** — `npx agentic-service` 或全局安装，首次启动自动配置 (bin/agentic-service.js + src/cli/setup.js)
   - CLI 解析 --port、--host、--https 参数
   - setup.js 执行首次配置：检测硬件 → 安装 Ollama → 拉取模型
   - 自动打开浏览器 (cli/browser.js)

### 技术规格

- **默认端口** — 1234 (bin/agentic-service.js)
- **package.json main** — src/index.js 导出核心 API (startServer, detectHardware, getProfile, matchProfile, ensureOllama, runtime, server, detector)
- **package.json bin** — bin/agentic-service.js 作为 CLI 入口
- **硬件检测输出** — `{ gpu: string, vram: number, ram: number, arch: string, os: string, cores: number }`
- **profiles CDN URL** — GitHub raw URL，支持 ETag 条件获取
- **profiles 缓存** — `~/.agentic-service/profiles-cache.json`，含 ETag 和过期时间

### 验收标准

- [x] 在 M4 Mac mini 上 `npx agentic-service` 能自动检测硬件并推荐 gemma4
- [x] 首次安装（含模型下载）< 10 分钟
- [x] 非首次启动 < 10 秒
- [x] 文本对话可用
- [x] src/index.js 存在并导出 startServer、detector、runtime

---

## M2: 语音交互

**目标：** 加上语音输入输出，实现语音对话

### Features

1. **STT 集成** — profile.stt.provider 驱动 runtime/stt.js 提供商选择 (runtime/stt.js)
   - 提供商：sensevoice (apple-silicon) / whisper (nvidia) / cloud (cpu-only)
   - `init()` 根据硬件 profile 初始化适配器
   - `transcribe(audioBuffer)` 转录音频为文本
   - 本地失败时自动切云端 (OpenAI Whisper fallback)
   - 集成 profiler.js 记录延迟

2. **TTS 集成** — profile.tts.provider 驱动 runtime/tts.js 提供商选择 (runtime/tts.js)
   - 提供商：kokoro/piper (本地) / cloud fallback (OpenAI TTS)
   - `init()` 根据硬件 profile 初始化适配器
   - `synthesize(text)` 合成语音，返回 audio buffer
   - 本地失败时自动切云端
   - 集成 profiler.js 记录延迟

3. **STT/TTS 适配器** — 适配器层隔离第三方依赖 (runtime/adapters/)
   - voice/openai-tts.js — OpenAI TTS 云端适配器
   - voice/openai-whisper.js — OpenAI Whisper 云端适配器
   - 缺少 OPENAI_API_KEY 时抛出 NO_API_KEY 错误

4. **VAD (Voice Activity Detection)** — 服务端能量检测 VAD + 客户端 composable (runtime/vad.js)
   - `createVAD(options)` 创建 VAD 实例
   - 基于 RMS 能量阈值检测语音活动
   - hub.js 暴露 `isSilent()` 方法
   - 客户端 useVAD.js composable

5. **Web UI 语音** — PushToTalk.vue 按住说话 / VAD 自动检测 (src/ui/client/components/)

6. **唤醒词** — 可配置唤醒词（默认 "hey"），audio-level 检测 (runtime/sense.js)
   - `startWakeWordPipeline(onWakeWord)` 使用 node-record-lpcm16 录音 + 能量 VAD
   - `stopWakeWordPipeline()` 停止检测
   - 客户端 WakeWord.vue + useWakeWord.js

7. **CPU 性能分析** — profiler.js 提供性能追踪 (runtime/profiler.js)
   - `startMark(label)` / `endMark(label)` 标记性能区间
   - `getMetrics()` 获取所有指标
   - `measurePipeline()` 强制 2000ms 预算
   - 集成到 stt.js、tts.js、llm.js

8. **延迟日志** — latency-log.js 记录和分析延迟 (runtime/latency-log.js)
   - `record(label, ms)` 记录延迟数据点
   - `p95(label)` 计算 P95 延迟
   - `reset(label)` 重置指标

### 技术规格

- **语音延迟** — 端到端 <2s (STT + LLM + TTS)，profiler.js measurePipeline() 强制 2000ms 预算
- **STT/TTS fallback** — 本地失败时自动切云端，匹配 LLM fallback 模式
- **语音 API 端点** — POST /api/transcribe (STT)、POST /api/synthesize (TTS)、POST /api/voice (全链路)
- **profiler 标签** — stt、tts、llm_ttft (time-to-first-token)、llm_total

### 验收标准

- [x] 语音对话端到端延迟 < 2s
- [x] 支持 3 种硬件配置的 STT/TTS 提供商自动选择
- [x] 唤醒词检测可用
- [x] profiler.js 集成到 stt.js、tts.js、llm.js

---

## M3: 多设备 + 感知

**目标：** 多设备连接同一个 AI 大脑，加上视觉感知

### Features

1. **多设备 WebSocket** — 设备注册/心跳，会话同步 (server/hub.js)
   - `register(ws, deviceInfo)` 注册设备
   - `getDevices()` 获取设备列表（不含 ws 引用）
   - `broadcast(type, payload)` 广播消息到所有设备
   - `joinSession(deviceId)` / `broadcastSession(brainState)` 会话管理
   - `sendCommand(deviceId, command)` 发送设备命令（speak/display/capture）
   - 心跳间隔 60s (60000ms)，超时自动断开
   - 消息格式：`{type, deviceId, payload, ts}`

2. **AI 大脑** — brain.js 封装 LLM 对话逻辑 (server/brain.js)
   - `chat(messages)` 异步生成器，流式返回 `{type: 'content', content, done}` 块
   - 支持消息历史和工具调用
   - 集成 cloud fallback

3. **视觉感知** — sense.js 调用 agentic-sense 进行视觉检测 (runtime/sense.js)
   - `init(videoElement)` 初始化 MediaPipe 管线（face, gesture, object）
   - `detect(frame)` 单帧检测 → `{faces, gestures, objects}`
   - `start()` / `stop()` 事件循环（16ms 间隔）
   - `on(type, handler)` 事件监听（face_detected, gesture_detected, object_detected, wake_word）
   - `initHeadless(options)` / `startHeadless()` 无头模式
   - 感知适配器：runtime/adapters/sense.js

4. **管理面板** — Admin UI 提供设备管理和配置界面 (src/ui/admin/)
   - 静态文件从 dist/admin 提供，路由 /admin
   - 4 个视图：Status（设备列表）、Models（模型管理）、Config（完整配置）、Test（API 测试）
   - 从 GET /api/status 获取设备列表，从 GET /api/config 获取配置
   - Vite 构建，产物提交到 dist/admin/

5. **记忆模块** — 向量嵌入语义搜索 (runtime/memory.js)
   - `add(text)` 嵌入文本并存储（ID 格式：mem:timestamp:random）
   - `search(query, topK=5)` 语义搜索，余弦相似度
   - `remove(key)` / `delete(key)` 删除条目
   - 使用 bge-m3 嵌入模型 via agentic-embed
   - 存储在 KV store (agentic-store) 中，维护 `mem:__index__` 索引

6. **嵌入模块** — embed.js 封装向量嵌入 (runtime/embed.js)
   - 适配器层：runtime/adapters/embed.js
   - 使用 agentic-embed 包

7. **KV 存储** — store.js 封装 agentic-store (store/index.js)
   - `get(key)` / `set(key, value)` / `del(key)` / `delete(key)` 基础 KV 操作
   - delete() 是 del() 的别名

8. **HTTPS/LAN 隧道** — 安全连接和跨网络访问 (server/httpsServer.js, server/cert.js, tunnel.js)
   - cert.js 生成自签名证书
   - httpsServer.js 启动 HTTPS 服务（端口 = HTTP 端口 + 443）
   - tunnel.js 支持 ngrok/cloudflared 跨网络访问
   - CLI --https 参数启用

9. **服务器中间件** — 错误处理中间件 (server/middleware.js)

### 技术规格

- **WebSocket 消息格式** — `{type, deviceId, payload, ts}`
- **心跳间隔** — 60s (60000ms)
- **注册握手** — 客户端发送 `{type: "register", deviceId, capabilities}`，服务端响应 `{type: "registered", sessionId}`
- **store.js API** — 导出 get/set/del/delete（delete 是 del 的别名）
- **Admin UI 构建** — src/ui/admin/ 使用 Vite 构建，产物提交到 dist/admin/；api.js 从 dist/admin 提供静态文件
- **memory 存储格式** — key: `mem:timestamp:random`，索引: `mem:__index__`
- **嵌入模型** — bge-m3 via agentic-embed

### 验收标准

- [x] 多设备 WebSocket 连接可用，心跳 60s
- [x] Admin 面板可访问 /admin，显示设备列表和配置
- [x] dist/admin/ 目录存在（已构建）
- [x] memory.js search() 返回语义相关结果
- [x] hub.js sendCommand() 支持 speak/display/capture

---

## M4: 云端 fallback + 产品打磨

**目标：** 本地不够时自动切云端，整体打磨

### Features

1. **云端 fallback** — 本地 LLM 失败时自动切换到云端提供商 (runtime/llm.js)
   - 触发条件：Ollama 响应超时 >5s（AbortSignal.timeout）或连续 3 次错误
   - 切换到 profile.fallback.provider 配置的云端提供商（OpenAI / Anthropic）
   - 60s 后自动探测 Ollama 恢复并切回本地
   - 云端提供商需要 API key（OPENAI_API_KEY / ANTHROPIC_API_KEY）

2. **配置热更新** — watchProfiles() 每 30s 轮询，ETag 条件获取 (detector/profiles.js)
   - 检测到新配置时自动更新运行时配置
   - 支持远程配置变更无需重启

3. **Docker 部署** — 容器化部署支持 (Dockerfile + docker-compose.yml)
   - 根目录 docker-compose.yml：暴露端口 1234，挂载 ./data 卷，包含 OLLAMA_HOST 环境变量
   - install/ 目录：Dockerfile、docker-compose.yml、setup.sh
   - 健康检查：curl http://localhost:1234/api/status
   - SIGINT 优雅关闭支持

4. **文档 + README** — 完整的用户文档 (README.md)
   - 安装方式：npx / 全局安装 / Docker
   - API 端点参考
   - 架构概述
   - 故障排除指南

5. **profiles CDN** — 真实可访问的 GitHub raw URL (detector/profiles.js)
   - 4 层 fallback：新鲜缓存 → 远程获取 → 过期缓存 → 内置 default.json
   - ETag 条件获取减少带宽

6. **Admin UI 构建** — src/ui/admin/ 使用 Vite 构建 (src/ui/admin/)
   - 产物提交到 dist/admin/
   - api.js 从 dist/admin 提供静态文件
   - 包含 Examples 页面（Chat Playground, Agent Sandbox, TTS Lab, Transcription Studio, Live Talk, Voice One-Shot）
   - 包含 Tests 页面（10 个 API 端点测试 + Run All 按钮）
   - 侧边栏导航

7. **package.json 清洁** — 仅保留有效的 import map 条目
   - 删除指向不存在路径的死亡 import map 条目

8. **测试覆盖** — 全面的测试套件 (test/)
   - 206 个测试文件，905 个测试用例
   - 云服务测试（STT/TTS）在缺少 API key 时跳过而非失败
   - 包含 E2E 测试（Examples 页面、API 端点）

### 技术规格

- **默认端口** — 1234 (bin/agentic-service.js)；README 和 Docker 文档均使用 1234
- **package.json main** — src/index.js 导出核心 API
- **云端 fallback 触发器** — profile.fallback.provider 配置；llm.js 先尝试 Ollama；触发条件：响应超时 >5s 或连续 3 次错误；60s 后自动探测 Ollama 恢复并切回本地
- **package.json imports** — 仅保留有效的 import map 条目
- **Docker OLLAMA_HOST** — docker-compose.yml 包含 OLLAMA_HOST 环境变量
- **Docker 数据卷** — docker-compose.yml 挂载 ./data 卷持久化配置和缓存
- **测试覆盖** — 所有测试文件通过；云服务测试在缺少 API key 时跳过

### 验收标准

- [x] 云端 fallback 在 Ollama 超时 >5s 或连续 3 次错误时触发
- [x] 60s 后自动探测 Ollama 恢复并切回本地
- [ ] docker-compose.yml 包含 OLLAMA_HOST 和 ./data 卷挂载
- [ ] 所有测试通过（云服务测试在无 API key 时跳过）
- [ ] package.json imports 无死亡条目

---

## 外部依赖

| 包名 | 用途 |
|------|------|
| agentic-store | KV 存储（store/index.js 封装） |
| agentic-embed | 向量嵌入（embed.js / memory.js） |
| agentic-voice | STT/TTS 适配器（sensevoice, whisper, kokoro, piper） |
| agentic-sense | 视觉感知（face/gesture/object 检测） |

## 目录结构

```
src/
├── index.js                    # 包入口，导出核心 API
├── tunnel.js                   # ngrok/cloudflared LAN 隧道
├── cli/
│   ├── setup.js                # 首次配置向导
│   └── browser.js              # 自动打开浏览器
├── detector/
│   ├── hardware.js             # GPU/CPU/内存检测
│   ├── profiles.js             # 远程 profile 获取 + 缓存
│   ├── matcher.js              # 硬件→profile 匹配
│   ├── optimizer.js            # 硬件优化配置生成
│   ├── ollama.js               # Ollama 安装/模型拉取
│   └── sox.js                  # sox 自动安装
├── runtime/
│   ├── llm.js                  # LLM 对话 + 云端 fallback
│   ├── stt.js                  # 语音转文字
│   ├── tts.js                  # 文字转语音
│   ├── vad.js                  # 语音活动检测
│   ├── sense.js                # 视觉感知 + 唤醒词
│   ├── memory.js               # 向量记忆搜索
│   ├── embed.js                # 向量嵌入
│   ├── profiler.js             # CPU 性能分析
│   ├── latency-log.js          # 延迟记录 + P95
│   └── adapters/
│       ├── embed.js            # 嵌入适配器
│       ├── sense.js            # 感知适配器
│       └── voice/
│           ├── openai-tts.js   # OpenAI TTS 云端
│           └── openai-whisper.js # OpenAI Whisper 云端
├── server/
│   ├── api.js                  # HTTP REST API + 静态文件
│   ├── hub.js                  # WebSocket 设备管理
│   ├── brain.js                # AI 大脑（LLM 封装）
│   ├── cert.js                 # 自签名证书生成
│   ├── httpsServer.js          # HTTPS 服务
│   └── middleware.js           # 错误处理中间件
├── store/
│   └── index.js                # KV 存储封装
└── ui/
    ├── client/                 # Web UI (Vue 3 + Vite)
    └── admin/                  # Admin 面板 (Vite)
```

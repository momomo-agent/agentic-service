# agentic-service — Architecture

## 依赖关系

```
agentic-service
├── agentic-core      # LLM 调用引擎（streaming, tool use, retry）
├── agentic-sense     # MediaPipe 感知（人脸/手势/物体，浏览器端）
├── agentic-voice     # TTS + STT 统一接口
├── agentic-store     # KV 存储抽象（SQLite/IndexedDB/memory）
└── agentic-embed     # 向量嵌入（bge-m3）
```

## 核心模块

### 1. Detector（硬件检测）

```javascript
// detector/hardware.js
detect() → {
  platform: 'darwin' | 'linux' | 'win32',
  arch: 'arm64' | 'x64',
  gpu: { type: 'apple-silicon' | 'nvidia' | 'amd' | 'none', vram: number },
  memory: number,  // GB
  cpu: { cores: number, model: string }
}

// detector/profiles.js
// 远程拉取 + 本地缓存（7天 TTL，ETag 条件请求）
getProfile(hardware) → {
  llm: { provider: 'ollama', model: 'gemma4:26b', quantization: 'q8' },
  stt: { provider: 'sensevoice', model: 'small' },
  tts: { provider: 'kokoro', voice: 'default' },
  fallback: { provider: 'openai', model: 'gpt-4o-mini' }
}
watchProfiles(hardware, callback) → void  // 每30s轮询，ETag条件请求，变更时触发callback

// detector/matcher.js
matchProfile(profiles, hardware) → ProfileConfig
// 按权重匹配硬件配置：platform=30, gpu=30, arch=20, minMemory=20
// platform 或 gpu 不匹配 → 得分 0（排除该 profile）
// 空 match 条件 → 得分 1（兜底默认 profile）
// 返回得分最高的 profile

// detector/ollama.js
ensureOllama(model, onProgress?) → Promise<void>
// 检测 Ollama 是否安装（which ollama），未安装则自动安装：
//   Unix: curl 安装脚本
//   Windows: winget install
// 然后执行 ollama pull <model>，通过 onProgress 回调报告进度

// detector/optimizer.js
optimize(hardware) → { threads, memoryLimit, model, quantization }
// apple-silicon: threads=8, model='gemma4:26b', quantization='q8'
// nvidia: threads=4, model='gemma4:13b', quantization='q4'
// cpu-only: threads=cpu.cores, model='gemma2:2b', quantization='q4'
// NOTE: llm.js loadConfig() uses profiles.js for model selection;
//       optimizer.js output is available for advanced tuning but not
//       currently wired into the primary config path.

// detector/sox.js
ensureSox() → Promise<void>  // checks sox availability for audio recording
```

### 2. Runtime（服务运行时）

每个能力是一个独立模块，统一接口：

```javascript
// runtime/llm.js — Ollama-first + cloud fallback
chat(messages, options) → AsyncGenerator<{ type, content, done }>
// loadConfig() → hardware detect → getProfile → _config
// watchProfiles() 每30s热更新 _config
// Ollama 优先；超时/失败 → OpenAI/Anthropic cloud fallback

// runtime/stt.js — 封装 agentic-voice
init() → Promise<void>  // 按 profile.stt.provider 动态加载 adapter
transcribe(audioBuffer) → Promise<string>
// Adapters: sensevoice (apple-silicon), whisper (nvidia), openai-whisper (default)

// runtime/tts.js — 封装 agentic-voice
init() → Promise<void>  // 按 profile.tts.provider 动态加载 adapter
synthesize(text) → Promise<Buffer>
// Adapters: kokoro (apple-silicon), piper (nvidia), openai-tts (default)

// runtime/sense.js — MediaPipe 感知（双路径）
init(videoElement?) → Promise<void>   // browser: MediaPipe pipeline
detect(frame) → { faces, gestures, objects }  // server-side frame input
start() → void   // browser event loop (16ms interval)
stop() → void
on(type, handler) → void  // 'face_detected' | 'gesture_detected' | 'object_detected'
startWakeWordPipeline(onWakeWord) → Promise<void>  // server-side: node-record-lpcm16 + VAD
stopWakeWordPipeline() → void
startHeadless() → Promise<EventEmitter>  // server-side headless mode

// runtime/memory.js — KV 向量记忆（基于 agentic-embed）
add(text) → Promise<void>          // 嵌入文本，存储向量，生成 key "mem:<ts>:<random>"
remove(key) → Promise<void>        // 别名 delete()
search(query, topK?=5) → Promise<Array<{ text: string, score: number }>>
// 使用 promise 锁（_lock）保证写操作串行

// runtime/embed.js — 向量嵌入
embed(text: string) → Promise<number[]>
// Delegates to agentic-embed package (bge-m3)
// Throws TypeError if text is not a string
// Returns [] for empty string

// runtime/vad.js — 语音活动检测
detectVoiceActivity(buffer: Buffer) → boolean
// RMS energy threshold (0.01) on Int16 PCM samples
// Returns true if audio contains speech

// runtime/profiler.js — 性能计量
startMark(label: string) → void
endMark(label: string) → number  // elapsed ms
getMetrics() → { [stage]: { last, avg, count } }
measurePipeline(stages) → { stages, total, pass }  // pass = total < 2000ms

// runtime/latency-log.js — 延迟采样
record(stage: string, ms: number) → void
p95(stage: string) → number
reset() → void
```

### 3. Server（HTTP/WebSocket）

```javascript
// server/hub.js — 设备管理 + WebSocket
init() → Promise<void>  // starts headless sense, wakeword listener
initWebSocket(server) → void  // attaches WebSocket server
getDevices() → Array<{ id, name, capabilities, lastPong }>
joinSession(sessionId, deviceId) → { sessionId, history, brainState, deviceCount }
setSessionData(sessionId, key, value) → void
getSessionData(sessionId, key) → any
getSession(sessionId) → Session | null
broadcastSession(sessionId, message) → void  // syncs brainState across devices
broadcastWakeword(data) → void
startWakeWordDetection() → void
sendCommand(deviceId, command) → Promise<any>  // speak/display/capture
// Heartbeat: 30s ping, 60s timeout → device removed from registry

// server/brain.js — LLM 推理 + 工具调用
chat(messages, options?) → AsyncGenerator<{ type, text, done }>
registerTool(name, fn) → void
// Ollama-first with tool_use; falls back to OpenAI on tool_use failure
// tool_use response includes text field

// server/api.js — REST API + 静态文件服务
startServer(port?) → http.Server
startDrain() → void   // SIGINT: stop accepting new requests
waitDrain(timeout?) → Promise<void>  // wait for in-flight to complete

// REST 端点
GET  /health             → { status: 'ok' }
POST /api/chat           { messages } → SSE stream
POST /api/transcribe     multipart audio → { text }
POST /api/synthesize     { text } → audio/wav
GET  /api/status         → { hardware, profile, ollama, devices, lanIp }
GET  /api/config         → current config JSON
PUT  /api/config         { ...fields } → updated config JSON
GET  /api/perf           → getMetrics()
POST /api/voice          multipart audio → { text, response, audio }
GET  /admin/*            → static files from dist/admin/
GET  /*                  → static files from dist/ui/

// server/cert.js
generateCert() → { key: string, cert: string }  // self-signed via selfsigned

// server/httpsServer.js
createServer(app) → https.Server  // uses generateCert()

// server/middleware.js
errorHandler(err, req, res, next) → void  // 4-line error handler
```

### 4. UI（Web 前端）

轻量 Vue 3 + Vite，两个独立应用：

```
src/ui/client/   — 用户对话界面（文本 + 语音）
  App.vue
  components/
    ChatBox.vue
    InputBox.vue
    MessageList.vue
    PushToTalk.vue    — hold-to-talk button
    WakeWord.vue      — wake word activation UI
  composables/
    useVAD.js         — WebRTC VAD for auto speech segmentation
    useWakeWord.js    — wake word detection composable

src/ui/admin/    — 管理面板（硬件信息、配置、设备、日志）
  App.vue
  components/
    ConfigPanel.vue
    DeviceList.vue
    HardwarePanel.vue
    LogViewer.vue
    SystemStatus.vue
  views/
    DashboardView.vue
    StatusView.vue
    ConfigView.vue
    ModelsView.vue
    ExamplesView.vue
    TestView.vue
```

### 5. Tunnel（LAN/WAN 暴露）

```javascript
// src/tunnel.js
startTunnel(port: number) → ChildProcess
// Spawns ngrok (preferred) or cloudflared to expose local port
// Exits with error if neither is installed
// Registers SIGINT handler to kill subprocess
```

### 6. CLI 模块

```javascript
// src/cli/setup.js
ensureModel() → Promise<void>
// detect hardware → getProfile → check/install Ollama → pull model
// Called on every startup (idempotent)

runSetup() → Promise<void>
// First-run wizard: hardware detect, profile fetch, Ollama install, model pull

// src/cli/browser.js
openBrowser(url: string) → Promise<void>
// Opens browser via 'open' package; logs URL on failure
```

### 7. Store（KV 存储）

```javascript
// src/store/index.js — wraps agentic-store package
get(key: string) → Promise<any>
set(key: string, value: any) → Promise<void>
del(key: string) → Promise<void>
export { del as delete }  // alias for compatibility
// Persists to ~/.agentic-service/store.db via agentic-store
```

### 8. VAD（语音活动检测）

```javascript
// src/runtime/vad.js
detectVoiceActivity(buffer: Buffer) → boolean
// RMS energy threshold (0.01) on Int16 PCM
// Used by hub.js isSilent() and server-side audio pipeline
```

### 9. agentic-embed（向量嵌入）

```javascript
// src/runtime/embed.js — wraps agentic-embed package
embed(text: string) → Promise<number[]>
// bge-m3 vector embedding via agentic-embed
// Throws TypeError if text is not a string
// Returns [] for empty string
// Used by memory.js for semantic search / retrieval

// src/runtime/adapters/embed.js — STUB (throws 'not implemented')
// NOTE: memory.js imports from src/runtime/embed.js (real impl),
//       NOT from this adapter stub. The adapter is unused.
```

## 安装流程

```bash
# 方式 1: npx（推荐）
npx agentic-service

# 方式 2: 全局安装
npm i -g agentic-service
agentic-service

# 方式 3: Docker
docker run -p 1234:1234 momomo/agentic-service

# 方式 4: curl 一键安装
curl -fsSL https://raw.githubusercontent.com/momomo-agent/agentic-service/main/install/setup.sh | sh
```

首次启动流程：
1. 检测硬件
2. 拉取 profiles.json（CDN，7天缓存）
3. 匹配最优配置
4. 检查/安装 Ollama
5. 拉取推荐模型（显示进度）
6. 启动服务
7. 打开浏览器 → http://localhost:1234

## 目录结构

```
agentic-service/
├── package.json
├── bin/
│   └── agentic-service.js    # CLI 入口（port 默认 1234）
├── src/
│   ├── detector/
│   │   ├── hardware.js       # GPU/CPU/OS/memory 检测
│   │   ├── profiles.js       # 远程 profiles + 7天缓存
│   │   ├── matcher.js        # 硬件权重匹配
│   │   ├── ollama.js         # Ollama 自动安装 + 模型拉取
│   │   ├── optimizer.js      # 硬件自适应优化参数
│   │   └── sox.js            # sox 可用性检测
│   ├── runtime/
│   │   ├── llm.js            # Ollama-first LLM + cloud fallback
│   │   ├── stt.js            # STT 运行时（adaptive adapter）
│   │   ├── tts.js            # TTS 运行时（adaptive adapter）
│   │   ├── sense.js          # MediaPipe 感知 + 唤醒词 pipeline
│   │   ├── memory.js         # 向量记忆（embed + store）
│   │   ├── embed.js          # agentic-embed 封装
│   │   ├── vad.js            # 语音活动检测（RMS energy）
│   │   ├── profiler.js       # 性能计量（startMark/endMark）
│   │   ├── latency-log.js    # 延迟采样（p95）
│   │   └── adapters/
│   │       ├── embed.js      # STUB（未使用，embed.js 直接用 agentic-embed）
│   │       ├── sense.js      # agentic-sense createPipeline 封装
│   │       └── voice/
│   │           ├── openai-tts.js
│   │           └── openai-whisper.js
│   ├── server/
│   │   ├── hub.js            # WebSocket 设备管理 + 会话同步
│   │   ├── brain.js          # LLM 推理 + 工具调用
│   │   ├── api.js            # REST API + 静态文件服务
│   │   ├── cert.js           # 自签名证书生成
│   │   ├── httpsServer.js    # HTTPS 服务器
│   │   └── middleware.js     # 错误处理中间件
│   ├── cli/
│   │   ├── setup.js          # 首次安装向导 + Ollama 确保
│   │   └── browser.js        # 自动打开浏览器
│   ├── store/
│   │   └── index.js          # agentic-store KV 封装
│   ├── tunnel.js             # LAN/WAN 隧道（ngrok/cloudflared）
│   └── ui/
│       ├── client/           # 用户对话 Vue 3 + Vite
│       └── admin/            # 管理面板 Vue 3 + Vite
├── profiles/
│   └── default.json          # 内置默认配置（apple-silicon/nvidia/cpu-only）
├── dist/
│   ├── admin/                # Admin UI 构建产物（npm run build）
│   └── ui/                   # Client UI 构建产物
├── install/
│   ├── setup.sh              # curl 一键安装脚本
│   ├── Dockerfile
│   └── docker-compose.yml
├── Dockerfile                # 根目录 Docker 构建
├── docker-compose.yml        # 根目录 compose（需 OLLAMA_HOST + ./data volume）
└── test/
```

## 数据流

```
用户请求 → api.js → brain.js → llm.js → Ollama / Cloud
                              ↓
                         hub.js (WebSocket) → 多设备广播
                              ↓
                    sense.js (唤醒词/感知) → 事件驱动
                              ↓
                    memory.js → embed.js → store/index.js
```

## 语音延迟预算

```
STT (transcribe)  ≤ 500ms
LLM (first token) ≤ 1000ms
TTS (synthesize)  ≤ 500ms
─────────────────────────
Total             < 2000ms  (enforced via profiler.js measurePipeline)
```

## 已知问题 / 待修复

- `src/index.js` 缺失 — package.json `main` 指向此文件但磁盘上不存在
- 默认端口 1234（bin/agentic-service.js），但 README/Docker healthcheck 引用 3000；需统一
- `dist/admin/` 未构建 — 需运行 `npm run build` 生成；server api.js 引用此路径
- `src/runtime/adapters/embed.js` 是 stub（throws 'not implemented'）— 实际 embed 通过 `src/runtime/embed.js` 直接调用 agentic-embed，adapter 未使用
- `server/middleware.js` 仅 4 行错误处理 — 无请求验证、限流、安全中间件
- `package.json` imports map 中 `#agentic-embed` 和 `#agentic-voice` 为死亡条目 — 源码直接 import agentic-embed/agentic-voice 包
- Docker `docker-compose.yml`（根目录）缺少 `OLLAMA_HOST` 环境变量和 `./data` volume 挂载
- mDNS/Bonjour `.local` 主机名发现未实现 — 仅显示原始 LAN IP

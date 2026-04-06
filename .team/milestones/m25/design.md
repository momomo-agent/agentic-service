# M25 技术设计 — Ollama自动安装 + 服务端感知路径

## 任务1: Ollama自动安装

**文件**: `src/installer/setup.js`

平台检测用 `process.platform`，安装命令：
- `darwin/linux`: `curl -fsSL https://ollama.ai/install.sh | sh`
- `win32`: `winget install Ollama.Ollama`

安装后执行 `ollama pull <model>`，用 `child_process.spawn` 实时输出进度。

## 任务2: sense.js 服务端无头模式

**文件**: `src/runtime/sense.js`

在现有 `init(videoElement)` 基础上：
- 允许无参调用 `init()` → 服务端模式，跳过 video 绑定
- 新增 `detectFrame(buffer)` → 直接调用 `pipeline.detect(buffer)`
- `start()` 在服务端模式下不启动 setInterval（无 video）

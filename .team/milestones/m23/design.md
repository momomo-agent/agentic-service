# M23 Technical Design

## 1. App.vue 修复

**文件**: `src/ui/client/src/App.vue`

- 在 `<script setup>` 中导入 `DeviceList`, `LogViewer`, `HardwarePanel`
- 添加 `ref` 响应式数据: `devices`, `hardware`
- `onMounted` 中启动 `setInterval(() => fetchStatus(), 5000)`
- `fetchStatus()` 调用 `GET /api/status`，更新 `devices` 和 `hardware`
- 模板中绑定 `:devices="devices"` 和 `:hardware="hardware"`

## 2. VAD 自动语音检测

**文件**: `src/ui/client/src/composables/useVAD.js` (新建)

- 使用 `AudioContext` + `AnalyserNode` 检测音量
- 音量超过阈值 (`-50 dBFS`) 持续 `300ms` → 触发录音开始
- 静音低于阈值持续 `800ms` → 停止录音，emit `speech` 事件
- 暴露 `startVAD()`, `stopVAD()`, `onSpeech(cb)` 接口

**文件**: `src/ui/client/src/App.vue`
- 集成 `useVAD`，`onSpeech` 回调触发 STT 流程

## 3. 测试覆盖率

**文件**: `vitest.config.js` 或 `vite.config.js`
- 添加 `coverage: { thresholds: { lines: 98, functions: 98, branches: 98 } }`

**新增测试** (`test/`):
- `api.test.js`: POST /api/transcribe 传入非音频格式 → 400
- `api.test.js`: PUT /api/config 模拟 `fs.writeFile` 失败 → 500
- `profiles.test.js`: `getProfile()` 传入空数组 → 返回 default profile
- `server.test.js`: 发送 SIGINT → 服务优雅关闭，exit code 0

## 4. README.md

**文件**: `README.md` (项目根)

结构:
1. 简介
2. 安装方式 (npx / npm i -g / Docker)
3. 首次启动流程
4. API 端点表格
5. 配置说明

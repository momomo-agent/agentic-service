# M32: Server层补全 + README + 语音延迟基准 + 服务端感知路径

## 目标
补全 server 层核心模块、完善文档、验证语音延迟目标、实现服务端感知路径。

## 范围
1. `src/server/hub.js` — 设备管理：注册、心跳、多设备协调
2. `src/server/brain.js` — LLM推理 + tool calling 服务端逻辑
3. `src/server/api.js` — REST API 端点，暴露 brain/hub/runtime 接口
4. `README.md` — npx/Docker/API 完整文档
5. 语音延迟基准测试 — STT+LLM+TTS 端到端 <2s 验证
6. `src/runtime/sense.js` — 服务端 headless camera 路径

## 验收标准
- hub.js 支持设备注册与心跳
- brain.js 支持流式 LLM 推理与 tool calling
- api.js 暴露完整 REST 端点
- README.md 包含 npx、全局安装、Docker 三种安装方式及 API 文档
- 基准测试输出延迟报告，P50 <2s
- sense.js 在无浏览器环境下可调用摄像头

## Gap来源
- Architecture gap (missing): src/server/hub.js、brain.js、api.js
- PRD gap (missing): README.md
- Vision gap (missing): 语音延迟 <2s 未基准测试
- Vision gap (partial): sense.js 仅浏览器端，无服务端路径

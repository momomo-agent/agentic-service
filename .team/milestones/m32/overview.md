# M32: Server层补全 + Admin UI + 唤醒词管道 + README + 语音延迟基准

## 目标
补全 server 层核心模块、Admin UI、唤醒词管道、完善文档、验证语音延迟目标。

## 范围
1. `src/server/hub.js` — 设备管理：注册、心跳、多设备协调
2. `src/server/brain.js` — LLM推理 + tool calling 服务端逻辑
3. `src/server/api.js` — REST API 端点，暴露 brain/hub/runtime 接口
4. `src/ui/admin/` — 管理面板：设备管理、配置热更新、系统状态监控 (task-1775518468358)
5. 唤醒词服务端管道集成 — 服务端唤醒词检测管道
6. `README.md` — npx/Docker/API 完整文档
7. 语音延迟基准测试 — STT+LLM+TTS 端到端 <2s 验证

## 验收标准
- hub.js 支持设备注册与心跳
- brain.js 支持流式 LLM 推理与 tool calling
- api.js 暴露完整 REST 端点
- Admin UI 可访问设备列表与配置
- 唤醒词管道在服务端可触发
- README.md 包含 npx、全局安装、Docker 三种安装方式及 API 文档
- 基准测试输出延迟报告，P50 <2s

## Gap来源
- Architecture gap (missing): src/server/hub.js、brain.js、api.js、src/ui/admin/
- PRD gap (missing): README.md
- Vision gap (missing): 语音延迟 <2s 未基准测试

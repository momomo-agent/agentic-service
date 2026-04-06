# M36: Server层实现 (hub/brain/api) + profiles/default.json

## 目标
关闭架构中最高优先级的 missing gaps：server层核心文件和默认硬件profile。

## 验收标准
- profiles/default.json: 内置默认硬件profile，离线可用
- hub.js: 设备注册、心跳、多设备协调
- brain.js: LLM推理 + tool calling，流式响应
- api.js: REST端点暴露 brain/hub/runtime 接口

# M35: Server层实现 — Hub/Brain/API/Admin UI

## 目标
实现架构规范中缺失的Server层模块及Admin UI（architecture gap: missing）。

## 任务
- task-1775518153621: 实现src/server/hub.js — 设备管理
- task-1775518153656: 实现src/server/brain.js — LLM推理+工具调用
- task-1775518153688: 实现src/server/api.js — REST API端点
- task-1775518153720: 实现src/ui/admin/ — 管理面板

## 验收标准
- POST /api/chat, /api/transcribe, /api/synthesize, GET /api/status, /api/config, PUT /api/config 全部可用
- Admin面板展示硬件信息、配置、设备列表、日志
- architecture match提升至≥80%

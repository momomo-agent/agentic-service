# M21 Technical Design - Detector完善 + Admin路由 + 架构对齐

## 目标
1. 修复 `src/detector/profiles.js` — 确保 `getProfile()` 在无匹配时不抛出异常
2. 对齐 `src/detector/optimizer.js` — 导出架构规范要求的接口
3. 添加 `/admin` 路由到 `src/ui/client/` — 连接已有 admin 面板

## 任务依赖
- task-1775510905293 (profiles.js) — 无依赖
- task-1775510912066 (optimizer.js) — 无依赖
- task-1775510912106 (admin路由) — 依赖 task-1775510291601 (admin UI 已完成)

## 关键约束
- `matcher.js` 已实现 `matchProfile()`，profiles.js 直接复用
- optimizer.js 当前内容是 ollama 安装逻辑（文件内容错误），需重写为架构规范接口
- admin UI 已在 `src/ui/admin/`，只需在 client router 添加路由

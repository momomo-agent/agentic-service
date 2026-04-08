# Admin UI Redesign - Technical Design

## 概述

解决 2 个 CRITICAL DBB 缺陷：
1. package.json 指向不存在的 src/index.js
2. 文档端口 3000 与代码默认端口 1234 不一致

## 架构影响

无架构变更，仅修复配置和文档一致性问题。

## 技术方案

### 1. 创建 src/index.js 入口文件

**目标**: 使 `require('agentic-service')` 可用，导出核心 API

**导出模块**:
```javascript
// src/index.js
export { startServer, startDrain, waitDrain } from './server/api.js';
export { detect as detectHardware } from './detector/hardware.js';
export { getProfile, matchProfile } from './detector/profiles.js';
export { ensureOllama } from './detector/ollama.js';
export * as runtime from './runtime/index.js';
export * as server from './server/index.js';
export * as detector from './detector/index.js';
```

**依赖文件**:
- `src/server/api.js` — 已存在，导出 startServer
- `src/detector/hardware.js` — 已存在
- `src/detector/profiles.js` — 已存在
- `src/detector/ollama.js` — 已存在
- `src/runtime/index.js` — 需创建聚合导出
- `src/server/index.js` — 需创建聚合导出
- `src/detector/index.js` — 需创建聚合导出

### 2. 统一端口为 1234

**修改文件**:

1. **docker-compose.yml**
   - 端口映射: `"3000:3000"` → `"1234:1234"`
   - 添加环境变量: `PORT=1234`
   - healthcheck URL: `localhost:3000` → `localhost:1234`

2. **README.md**
   - 全局替换 `localhost:3000` → `localhost:1234`
   - 全局替换 `3000:3000` → `1234:1234`

3. **Dockerfile** (如果存在端口引用)
   - EXPOSE 3000 → EXPOSE 1234

## 边界情况

1. **用户自定义端口**: 不影响，`--port` 参数仍然有效
2. **现有配置文件**: 用户本地 `~/.agentic-service/config.json` 不受影响
3. **向后兼容**: 无破坏性变更，仅修复默认值

## 测试策略

1. **单元测试**: 验证 src/index.js 导出完整性
2. **集成测试**: Docker 容器启动并响应 1234 端口
3. **文档测试**: 扫描所有文档确保无 3000 端口残留

## 风险评估

- **风险**: 低
- **影响范围**: 配置文件和文档
- **回滚方案**: Git revert

## 实施顺序

1. 创建 src/index.js (task-1775641694425)
2. 统一端口为 1234 (task-1775641694470)
3. 验证 DBB 和 PRD 匹配度

两个任务可并行执行，无依赖关系。

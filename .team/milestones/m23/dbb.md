# Admin UI Redesign - DBB (验收标准)

## 验收标准

### 1. src/index.js 入口文件存在且可用
- [ ] 文件 `src/index.js` 存在
- [ ] `require('agentic-service')` 或 `import 'agentic-service'` 不报错
- [ ] 导出以下核心 API：
  - `startServer(port, options)` — 启动服务器
  - `detector` — 硬件检测模块
  - `runtime` — 运行时模块 (llm, stt, tts, memory)
  - `server` — 服务器模块 (hub, brain, api)
- [ ] 单元测试覆盖 src/index.js 导出验证

### 2. 端口统一为 1234
- [ ] `docker-compose.yml` 端口映射为 `1234:1234`
- [ ] `docker-compose.yml` 环境变量包含 `PORT=1234`
- [ ] Docker healthcheck URL 使用 `:1234`
- [ ] README.md 所有端口引用为 `1234`
- [ ] 实际运行 `docker-compose up` 后服务监听 1234 端口

### 3. 文档一致性
- [ ] README.md 中所有 `localhost:3000` 替换为 `localhost:1234`
- [ ] 安装流程文档端口正确
- [ ] Docker 使用说明端口正确

### 4. 回归测试
- [ ] 现有测试套件通过率 ≥90%
- [ ] `npm start` 默认启动在 1234 端口
- [ ] `npx agentic-service` 默认启动在 1234 端口
- [ ] Docker 容器健康检查通过

## 验证命令

```bash
# 验证 src/index.js 导出
node -e "import('./src/index.js').then(m => console.log(Object.keys(m)))"

# 验证端口配置
grep -r "3000" docker-compose.yml README.md || echo "No port 3000 found"

# 验证 Docker 启动
docker-compose up -d && sleep 5 && curl http://localhost:1234/api/status

# 验证测试通过
npm test
```

## 成功指标

- DBB 匹配度 ≥90% (当前 65%)
- PRD 匹配度 ≥90% (当前 65%)
- 所有 m23 任务状态为 "done"
- 零 CRITICAL 缺陷残留

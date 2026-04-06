# Design: 编写 README.md

## File
- `README.md` (项目根目录)

## Structure

```markdown
# agentic-service

本地 AI 助手服务，自动检测硬件并选择最优模型。

## 安装

### npx（推荐）
npx agentic-service

### 全局安装
npm i -g agentic-service
agentic-service

### Docker
docker run -p 3000:3000 momomo/agentic-service

## 首次启动流程
1. 检测硬件（GPU/CPU/内存）
2. 拉取 profiles.json 匹配最优配置
3. 检查/安装 Ollama
4. 拉取推荐模型（显示进度）
5. 启动服务 → 打开 http://localhost:3000

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/chat | 文本对话，返回 stream |
| POST | /api/transcribe | 音频转文字 |
| POST | /api/synthesize | 文字转语音 |
| GET  | /api/status | 硬件/配置/设备状态 |
| GET  | /api/config | 当前配置 |
| PUT  | /api/config | 更新配置 |

## 配置
配置文件位于 `~/.agentic-service/config.json`，首次启动自动生成。
```

## Notes
- 不需要代码实现，纯文档文件
- 内容与 ARCHITECTURE.md 保持一致

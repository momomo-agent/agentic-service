# M25 DBB — Ollama自动安装 + 服务端感知路径

## 验收标准

### 1. Ollama自动安装
- [ ] `src/installer/setup.js` 导出 `ensureOllama(model)` 函数
- [ ] 若 `ollama` 命令不存在，自动执行平台对应安装命令
- [ ] 安装后自动执行 `ollama pull <model>`
- [ ] 安装进度通过 `console.log` 实时输出
- [ ] `npm test` 全部通过

### 2. sense.js 服务端无头模式
- [ ] `sense.js` 导出 `detectFrame(buffer: Buffer) → DetectResult`
- [ ] 不依赖 `videoElement` 或 `requestAnimationFrame`
- [ ] `init()` 无参数可调用（服务端模式）
- [ ] 原有浏览器 `init(videoElement)` 路径保持兼容

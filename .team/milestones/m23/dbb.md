# M23 DBB — Done-By-Definition

## 1. App.vue 修复
- [ ] App.vue 导入 DeviceList、LogViewer、HardwarePanel 组件
- [ ] setInterval 每5秒轮询 /api/status，更新 devices 和 hardware 响应式数据
- [ ] DeviceList 绑定 :devices prop，HardwarePanel 绑定 :hardware prop

## 2. VAD 自动语音检测
- [ ] Web UI 中 VAD 检测到语音活动时自动开始录音
- [ ] 静音超过阈值时自动停止录音并触发 STT
- [ ] 手动 push-to-talk 仍可用作备选

## 3. 测试覆盖率
- [ ] vitest 覆盖率阈值配置 >= 98%
- [ ] POST /api/transcribe 无效格式测试通过
- [ ] PUT /api/config 磁盘写失败测试通过
- [ ] profiles.js 空数组边界测试通过
- [ ] SIGINT 优雅关闭测试通过
- [ ] `npm test` 全部通过，覆盖率 >= 98%

## 4. README.md
- [ ] 项目根目录存在 README.md
- [ ] 包含 npx / 全局安装 / Docker 三种安装方式
- [ ] 包含所有 API 端点文档
- [ ] 包含首次启动流程说明

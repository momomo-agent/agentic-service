# Admin UI 重设计 Spec

## 目标
将当前功能完整但无样式的 Admin UI 重新设计为现代、简洁、可用的管理界面。

## 当前状态
- 位置：`src/ui/admin/`（Vue 3 + Vite）
- 组件：App.vue + 5 个组件（ConfigPanel/DeviceList/HardwarePanel/LogViewer/SystemStatus）
- API：10 个端点（/api/status, /api/devices, /api/config, /api/chat, /api/transcribe, /api/synthesize, /api/voice, /api/perf, /api/logs, /health）
- 问题：零样式，信息展示不完整，缺少交互测试界面

## 设计要求

### 视觉风格
- **深色主题**：背景 #0a0a0a，surface #1a1a1a，surface-2 #2a2a2a
- **简洁现代**：卡片布局，清晰层次，充足留白
- **品味优先**：参考 Linear/Vercel/Stripe 的克制美学
- **响应式**：桌面优先，但支持平板/手机

### 布局结构
```
┌─────────────────────────────────────┐
│  Logo  [状态] [模型] [配置] [测试]  │  ← 顶部导航
├─────────────────────────────────────┤
│                                     │
│  主内容区（根据导航切换）            │
│                                     │
│  - 状态：硬件信息 + 设备列表 + 性能  │
│  - 模型：Ollama 模型列表 + 下载     │
│  - 配置：LLM/STT/TTS provider       │
│  - 测试：Chat/STT/TTS 交互界面      │
│                                     │
└─────────────────────────────────────┘
```

### 功能页面

#### 1. 状态页（默认首页）
- **硬件信息卡片**：CPU/内存/架构/核心数，图标 + 数字 + 进度条
- **设备列表卡片**：WebSocket 连接的设备（名称/能力/最后活跃时间）
- **性能监控卡片**：实时 token/s、响应时间、请求数（折线图或数字）
- **日志流**：最近 50 条日志，自动滚动，可暂停

#### 2. 模型页
- **Ollama 状态**：运行中/未运行，端口 11434
- **已安装模型列表**：表格显示（名称/大小/修改时间），可删除
- **推荐模型**：gemma4/qwen3.5/llama3 等，一键下载按钮
- **下载进度**：实时显示下载百分比

#### 3. 配置页
- **LLM Provider**：ollama/openai/anthropic，输入框 + 保存按钮
- **STT Provider**：whisper/deepgram，配置项
- **TTS Provider**：coqui/elevenlabs，配置项
- **高级选项**：端口/日志级别/wake word 开关

#### 4. 测试页
- **Chat 测试**：输入框 + 发送按钮，流式显示回复
- **STT 测试**：上传音频文件或录音，显示转写结果
- **TTS 测试**：输入文本，生成音频并播放
- **Voice 测试**：录音 → 转写 → LLM → 合成 → 播放（全链路）

### 技术要求
- **保留现有 API**：不改后端，只改前端
- **保留 Vue 3 + Vite**：不换框架
- **新增依赖最小化**：优先用 CSS，必要时可加 chart.js 或 echarts
- **构建输出**：`npm run build` 输出到 `../../dist/admin/`

### 组件结构
```
src/
├── App.vue              # 顶部导航 + router-view
├── views/
│   ├── StatusView.vue   # 状态页
│   ├── ModelsView.vue   # 模型页
│   ├── ConfigView.vue   # 配置页
│   └── TestView.vue     # 测试页
├── components/
│   ├── HardwareCard.vue
│   ├── DeviceCard.vue
│   ├── PerfCard.vue
│   ├── LogStream.vue
│   ├── ModelList.vue
│   ├── ChatTest.vue
│   ├── STTTest.vue
│   ├── TTSTest.vue
│   └── VoiceTest.vue
└── router.js            # Vue Router 配置
```

### 样式规范
- **字体**：Inter/SF Pro，16px base，1.5 行高
- **间距**：8px 基准，16/24/32/48 倍数
- **圆角**：8px 卡片，4px 按钮
- **阴影**：0 2px 8px rgba(0,0,0,0.1)
- **动画**：150ms ease-out 过渡
- **颜色**：
  - 主色：#3b82f6（蓝）
  - 成功：#10b981（绿）
  - 警告：#f59e0b（橙）
  - 错误：#ef4444（红）
  - 文字：#e5e5e5（主）/#a3a3a3（次）

### 验收标准
1. `npm run build` 成功，输出到 `dist/admin/`
2. 启动服务后访问 `http://localhost:1234` 看到新 UI
3. 四个页面都能正常切换和显示数据
4. Chat 测试能发送消息并看到流式回复
5. 视觉上达到 Linear/Vercel 级别的简洁美感
6. 零 console error，零 404

## 实现步骤
1. 安装 vue-router（如果没有）
2. 创建 views/ 和新组件
3. 写 router.js 配置路由
4. 重写 App.vue（顶部导航 + router-view）
5. 逐个实现 4 个 view 和对应组件
6. 写全局样式（src/style.css）
7. 测试 + 构建 + 验收

## 参考
- Linear Dashboard: https://linear.app
- Vercel Dashboard: https://vercel.com/dashboard
- Stripe Dashboard: https://dashboard.stripe.com

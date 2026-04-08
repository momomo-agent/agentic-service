# Task: 创建 src/index.js 入口文件

## 目标

创建 `src/index.js` 作为 package.json 的 main 入口，导出核心 API 供外部使用。

## 文件清单

### 需要创建的文件

1. **src/index.js** — 主入口文件
2. **src/runtime/index.js** — runtime 模块聚合导出
3. **src/server/index.js** — server 模块聚合导出
4. **src/detector/index.js** — detector 模块聚合导出

### 需要读取的现有文件

- `src/server/api.js` — 获取 startServer, startDrain, waitDrain
- `src/detector/hardware.js` — 获取 detect
- `src/detector/profiles.js` — 获取 getProfile, matchProfile
- `src/detector/ollama.js` — 获取 ensureOllama
- `src/runtime/llm.js` — 获取 chat
- `src/runtime/stt.js` — 获取 transcribe
- `src/runtime/tts.js` — 获取 synthesize
- `src/runtime/memory.js` — 获取 add, remove, search
- `src/server/hub.js` — 获取 Hub 类
- `src/server/brain.js` — 获取 Brain 类

## 实现细节

### 1. src/index.js

```javascript
// src/index.js
// Main entry point for agentic-service package

// Server API
export { startServer, startDrain, waitDrain } from './server/api.js';

// Detector API
export { detect as detectHardware } from './detector/hardware.js';
export { getProfile, matchProfile } from './detector/profiles.js';
export { ensureOllama } from './detector/ollama.js';

// Module namespaces
export * as runtime from './runtime/index.js';
export * as server from './server/index.js';
export * as detector from './detector/index.js';
```

### 2. src/runtime/index.js

```javascript
// src/runtime/index.js
// Runtime module aggregator

export { chat } from './llm.js';
export { transcribe } from './stt.js';
export { synthesize } from './tts.js';
export { add as addMemory, remove as removeMemory, search as searchMemory } from './memory.js';
export { detectVoiceActivity } from './vad.js';
export { embed } from './embed.js';
```

### 3. src/server/index.js

```javascript
// src/server/index.js
// Server module aggregator

export { default as Hub } from './hub.js';
export { default as Brain } from './brain.js';
export { startServer, startDrain, waitDrain } from './api.js';
```

### 4. src/detector/index.js

```javascript
// src/detector/index.js
// Detector module aggregator

export { detect } from './hardware.js';
export { getProfile, matchProfile } from './profiles.js';
export { ensureOllama } from './ollama.js';
export { optimize } from './optimizer.js';
```

## 函数签名

### 导出的顶层函数

```typescript
// Server
startServer(port: number, options?: { https?: boolean }): Promise<Server>
startDrain(): void
waitDrain(timeout: number): Promise<void>

// Detector
detectHardware(): { platform: string, arch: string, gpu: object, memory: number, cpu: object }
getProfile(hardware: object): Promise<ProfileConfig>
matchProfile(profiles: ProfileConfig[], hardware: object): ProfileConfig
ensureOllama(model: string, onProgress?: Function): Promise<void>

// Runtime namespace
runtime.chat(messages: array, options?: object): AsyncIterator
runtime.transcribe(audioBuffer: Buffer): Promise<string>
runtime.synthesize(text: string): Promise<Buffer>
runtime.addMemory(text: string): Promise<void>
runtime.removeMemory(key: string): Promise<void>
runtime.searchMemory(query: string, topK?: number): Promise<Array>
runtime.detectVoiceActivity(buffer: Buffer): boolean
runtime.embed(text: string): Promise<number[]>

// Server namespace
server.Hub: class
server.Brain: class
server.startServer: function
server.startDrain: function
server.waitDrain: function

// Detector namespace
detector.detect: function
detector.getProfile: function
detector.matchProfile: function
detector.ensureOllama: function
detector.optimize: function
```

## 边界情况

1. **模块不存在**: 如果某个子模块文件不存在，导入会失败。需要确保所有引用的文件都存在。
2. **循环依赖**: 避免 index.js 之间的循环引用。
3. **默认导出 vs 命名导出**: 统一使用命名导出，除非原模块使用 default export (如 Hub, Brain)。

## 错误处理

- 导入失败会在模块加载时抛出 `ERR_MODULE_NOT_FOUND`
- 不需要额外的 try-catch，让 Node.js 自然报错

## 测试用例

### test/index.test.js

```javascript
import { describe, it, expect } from 'vitest';
import * as agenticService from '../src/index.js';

describe('src/index.js exports', () => {
  it('exports startServer function', () => {
    expect(typeof agenticService.startServer).toBe('function');
  });

  it('exports detectHardware function', () => {
    expect(typeof agenticService.detectHardware).toBe('function');
  });

  it('exports runtime namespace', () => {
    expect(agenticService.runtime).toBeDefined();
    expect(typeof agenticService.runtime.chat).toBe('function');
  });

  it('exports server namespace', () => {
    expect(agenticService.server).toBeDefined();
    expect(typeof agenticService.server.Hub).toBe('function');
  });

  it('exports detector namespace', () => {
    expect(agenticService.detector).toBeDefined();
    expect(typeof agenticService.detector.detect).toBe('function');
  });
});
```

## 依赖关系

- 依赖所有 src/ 下的现有模块
- 无新增外部依赖
- 不修改现有模块代码

## 验证步骤

1. 创建所有 4 个文件
2. 运行 `node -e "import('./src/index.js').then(m => console.log(Object.keys(m)))"`
3. 验证输出包含: startServer, detectHardware, runtime, server, detector
4. 运行测试: `npm test test/index.test.js`

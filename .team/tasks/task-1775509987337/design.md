# Design: src/runtime/llm.js

## 现状
文件已存在，实现了 chat(message, options) → AsyncGenerator。

## 接口签名
```js
export async function* chat(message: string, options?: { history?: Message[] }): AsyncGenerator<{type, content, done}>
```

## 逻辑
1. 合并 history + 当前 message 为 messages 数组
2. 尝试 chatWithOllama(messages)，超时 30s
3. 失败 → 读取 config.fallback，调用 chatWithOpenAI 或 chatWithAnthropic
4. 每个 provider 均为 async generator，yield { type:'content', content, done }

## 需修复
- ARCHITECTURE.md 规定接口为 `chat(messages, options)`（messages 数组），当前实现接受 `(message, options)`（单字符串）
- 需将签名改为 `chat(messages: Message[], options?)`，移除内部 history 拼接逻辑

## 边界处理
- Ollama 不可用：catch 后 fallback，不抛出
- fallback provider 无 API key：抛出明确错误
- 空 messages：直接传给 provider，由 provider 处理

## 测试用例
- chat([{role:'user',content:'hi'}]) → 第一个 yield.content 非空
- Ollama 不可用时 → 切换 fallback，无未捕获异常

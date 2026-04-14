/**
 * Example: LLM 流式对话
 *
 * 演示：
 * - 单轮对话（流式输出）
 * - 多轮对话（带 history）
 * - 直接用 Agentic，不需要启动 service
 */

import agentic from 'agentic'
const { Agentic } = agentic

const ai = new Agentic({
  provider: 'ollama',
  model: 'qwen3:0.6b',
  baseUrl: 'http://localhost:11434',
  apiKey: 'ollama',
})

async function main() {
  console.log('=== 单轮对话 ===\n')
  console.log('Q: 用一句话解释什么是向量数据库\n')
  console.log('A: ')

  const answer1 = await ai.think('用一句话解释什么是向量数据库', {
    stream: true,
    tools: [],
    emit: (type, data) => {
      if (type === 'token') process.stdout.write(data.text)
    },
  })
  console.log('\n')

  console.log('=== 多轮对话 ===\n')
  console.log('Q: 给个实际应用场景\n')
  console.log('A: ')

  await ai.think('给个实际应用场景', {
    stream: true,
    tools: [],
    history: [
      { role: 'user', content: '用一句话解释什么是向量数据库' },
      { role: 'assistant', content: answer1 },
    ],
    emit: (type, data) => {
      if (type === 'token') process.stdout.write(data.text)
    },
  })
  console.log('\n')

  ai.destroy()
}

main().catch(console.error)

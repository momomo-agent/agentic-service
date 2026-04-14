/**
 * Example: 硬件检测 + 服务状态
 *
 * 演示：
 * - 通过 Agentic admin 接口查询 service 状态
 * - 硬件信息、Ollama 模型、连接设备
 * - 需要先启动 agentic-service
 */

import agentic from 'agentic'
const { Agentic } = agentic

const ai = new Agentic({
  serviceUrl: 'http://localhost:1234',
})

async function main() {
  const status = await ai.admin.status()

  console.log('=== 硬件检测 ===\n')
  const hw = status.hardware
  console.log(`  平台:    ${hw.platform} (${hw.arch})`)
  console.log(`  GPU:     ${hw.gpu.type} (${hw.gpu.vram}GB VRAM)`)
  console.log(`  内存:    ${hw.memory}GB`)
  console.log(`  CPU:     ${hw.cpu.model} (${hw.cpu.cores} cores)`)

  console.log('\n=== Ollama 模型 ===\n')
  if (status.ollama.running) {
    console.log(`  状态: 运行中`)
    console.log(`  已安装模型 (${status.ollama.models.length}):`)
    for (const m of status.ollama.models) {
      console.log(`    - ${m}`)
    }
  } else {
    console.log('  Ollama 未运行')
  }

  console.log('\n=== 连接设备 ===\n')
  console.log(`  设备数: ${status.devices.length}`)
  for (const d of status.devices) {
    console.log(`    - ${d.name || d.id} (${d.type})`)
  }
}

main().catch(console.error)

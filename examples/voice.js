/**
 * Example: 语音对话
 *
 * 演示：
 * - 录音 → STT → LLM → TTS 全链路
 * - 一行 converse() 搞定
 * - 需要 agentic-voice 子库
 */

import agentic from 'agentic'
const { Agentic } = agentic
import { readFileSync } from 'fs'

const AUDIO_FILE = process.argv[2]

if (!AUDIO_FILE) {
  console.error('Usage: node voice.js <audio-file.wav>')
  process.exit(1)
}

const ai = new Agentic({
  provider: 'ollama',
  model: 'qwen3:0.6b',
  baseUrl: 'http://localhost:11434',
  apiKey: 'ollama',
  tts: { provider: 'openai', apiKey: process.env.OPENAI_API_KEY },
  stt: { provider: 'openai', apiKey: process.env.OPENAI_API_KEY },
})

async function main() {
  const audioBuffer = readFileSync(AUDIO_FILE)

  console.log('[1] 语音识别...')
  const transcript = await ai.listen(audioBuffer)
  console.log(`    "${transcript}"\n`)

  console.log('[2] LLM 思考...')
  const answer = await ai.think(transcript)
  console.log(`    "${answer}"\n`)

  console.log('[3] 语音合成...')
  const audioOut = await ai.speak(answer)
  console.log(`    生成 ${audioOut?.byteLength || 0} bytes 音频\n`)

  // 或者一步到位：
  // const result = await ai.converse(audioBuffer)
  // console.log(result.transcript, result.text, result.audio?.byteLength)

  ai.destroy()
}

main().catch(console.error)

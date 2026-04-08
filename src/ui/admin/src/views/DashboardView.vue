<template>
  <div class="dashboard">
    <h1 class="page-title">⚡ Agentic Service</h1>

    <!-- 系统状态 -->
    <section class="section">
      <h2 class="section-title">系统状态</h2>
      <div class="grid grid-2">
        <div class="card">
          <div class="card-title">硬件信息</div>
          <dl class="info-list">
            <div v-for="(v, k) in hardware" :key="k">
              <dt>{{ formatKey(k) }}</dt>
              <dd>{{ v }}</dd>
            </div>
          </dl>
        </div>
        <div class="card">
          <div class="card-title">Ollama 状态</div>
          <div class="ollama-status">
            <div class="status-indicator" :class="ollama.running ? 'running' : 'stopped'"></div>
            <span>{{ ollama.running ? '运行中' : '未运行' }}</span>
            <span class="status-detail">端口 11434</span>
          </div>
          <div v-if="ollama.models.length > 0" style="margin-top: 16px">
            <div class="info-label">已安装模型 ({{ ollama.models.length }})</div>
            <div class="model-tags">
              <span v-for="m in ollama.models" :key="m" class="tag">{{ m }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 配置 -->
    <section class="section">
      <h2 class="section-title">配置</h2>
      <div class="card">
        <form @submit.prevent="saveConfig" class="config-form">
          <!-- LLM -->
          <div class="config-group">
            <div class="group-title">LLM Provider</div>
            <div class="field-row">
              <div class="field">
                <label>Provider</label>
                <select v-model="config.llm.provider">
                  <option value="ollama">Ollama (本地)</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="custom">自定义</option>
                </select>
              </div>
              <div class="field" v-if="config.llm.provider !== 'ollama'">
                <label>Base URL</label>
                <input v-model="config.llm.baseUrl" placeholder="https://api.openai.com/v1" />
              </div>
            </div>
            <div class="field-row" v-if="config.llm.provider !== 'ollama'">
              <div class="field">
                <label>API Key</label>
                <input v-model="config.llm.apiKey" type="password" placeholder="sk-..." />
              </div>
              <div class="field">
                <label>Model</label>
                <input v-model="config.llm.model" placeholder="gpt-4" />
              </div>
            </div>
          </div>

          <!-- STT -->
          <div class="config-group">
            <div class="group-title">STT Provider</div>
            <div class="field-row">
              <div class="field">
                <label>Provider</label>
                <select v-model="config.stt.provider">
                  <option value="whisper">Whisper (本地)</option>
                  <option value="deepgram">Deepgram</option>
                  <option value="custom">自定义</option>
                </select>
              </div>
              <div class="field" v-if="config.stt.provider !== 'whisper'">
                <label>Base URL</label>
                <input v-model="config.stt.baseUrl" placeholder="https://api.deepgram.com" />
              </div>
            </div>
            <div class="field-row" v-if="config.stt.provider !== 'whisper'">
              <div class="field">
                <label>API Key</label>
                <input v-model="config.stt.apiKey" type="password" />
              </div>
              <div class="field">
                <label>Model</label>
                <input v-model="config.stt.model" placeholder="nova-2" />
              </div>
            </div>
          </div>

          <!-- TTS -->
          <div class="config-group">
            <div class="group-title">TTS Provider</div>
            <div class="field-row">
              <div class="field">
                <label>Provider</label>
                <select v-model="config.tts.provider">
                  <option value="coqui">Coqui (本地)</option>
                  <option value="elevenlabs">ElevenLabs</option>
                  <option value="custom">自定义</option>
                </select>
              </div>
              <div class="field" v-if="config.tts.provider !== 'coqui'">
                <label>Base URL</label>
                <input v-model="config.tts.baseUrl" placeholder="https://api.elevenlabs.io" />
              </div>
            </div>
            <div class="field-row" v-if="config.tts.provider !== 'coqui'">
              <div class="field">
                <label>API Key</label>
                <input v-model="config.tts.apiKey" type="password" />
              </div>
              <div class="field">
                <label>Voice ID</label>
                <input v-model="config.tts.voiceId" placeholder="21m00Tcm4TlvDq8ikWAM" />
              </div>
            </div>
          </div>

          <div class="actions">
            <button type="submit" :disabled="saving">{{ saving ? '保存中...' : '保存配置' }}</button>
            <span v-if="saved" class="saved-msg">✓ 已保存</span>
          </div>
        </form>
      </div>
    </section>

    <!-- 测试 -->
    <section class="section">
      <h2 class="section-title">功能测试</h2>
      <div class="grid grid-2">
        <!-- Chat -->
        <div class="card">
          <div class="card-title">💬 Chat</div>
          <div class="chat-box">
            <div v-for="(msg, i) in chatHistory" :key="i" class="chat-msg" :class="msg.role">
              <div class="msg-text">{{ msg.content }}</div>
            </div>
          </div>
          <form @submit.prevent="sendChat" class="chat-input">
            <input v-model="chatInput" placeholder="输入消息..." :disabled="chatLoading" />
            <button type="submit" :disabled="chatLoading">发送</button>
          </form>
        </div>

        <!-- STT -->
        <div class="card">
          <div class="card-title">🎤 语音转文字</div>
          <div class="test-panel">
            <input type="file" accept="audio/*" @change="handleAudioFile" />
            <button @click="transcribe" :disabled="!audioFile || sttLoading">
              {{ sttLoading ? '转写中...' : '转写' }}
            </button>
          </div>
          <div v-if="sttResult" class="result-box">{{ sttResult }}</div>
        </div>

        <!-- TTS -->
        <div class="card">
          <div class="card-title">🔊 文字转语音</div>
          <div class="test-panel">
            <input v-model="ttsText" placeholder="输入文字..." />
            <button @click="synthesize" :disabled="!ttsText || ttsLoading">
              {{ ttsLoading ? '合成中...' : '合成' }}
            </button>
          </div>
          <audio v-if="ttsAudio" :src="ttsAudio" controls style="margin-top: 12px; width: 100%"></audio>
        </div>

        <!-- Voice -->
        <div class="card">
          <div class="card-title">🎙️ Voice 全链路</div>
          <div class="test-panel">
            <input type="file" accept="audio/*" @change="handleVoiceFile" />
            <button @click="voiceTest" :disabled="!voiceFile || voiceLoading">
              {{ voiceLoading ? '处理中...' : '测试' }}
            </button>
          </div>
          <div v-if="voiceResult" class="result-box">
            <div><strong>识别:</strong> {{ voiceResult.transcript }}</div>
            <div><strong>回复:</strong> {{ voiceResult.response }}</div>
            <audio v-if="voiceResult.audio" :src="voiceResult.audio" controls style="margin-top: 8px; width: 100%"></audio>
          </div>
        </div>
      </div>
    </section>

    <!-- 日志 -->
    <section class="section">
      <h2 class="section-title">日志</h2>
      <div class="card">
        <div class="log-stream">
          <div v-for="(log, i) in logs" :key="i" class="log-line">
            <span class="log-time">{{ formatLogTime(log.ts) }}</span>
            <span class="log-msg">{{ log.msg }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const hardware = ref({})
const ollama = ref({ running: false, models: [] })
const logs = ref([])

const config = ref({
  llm: { provider: 'ollama', baseUrl: '', apiKey: '', model: '' },
  stt: { provider: 'whisper', baseUrl: '', apiKey: '', model: '' },
  tts: { provider: 'coqui', baseUrl: '', apiKey: '', voiceId: '' }
})
const saving = ref(false)
const saved = ref(false)

const chatHistory = ref([])
const chatInput = ref('')
const chatLoading = ref(false)

const audioFile = ref(null)
const sttResult = ref('')
const sttLoading = ref(false)

const ttsText = ref('')
const ttsAudio = ref(null)
const ttsLoading = ref(false)

const voiceFile = ref(null)
const voiceResult = ref(null)
const voiceLoading = ref(false)

let timer = null

async function fetchData() {
  try {
    const [statusRes, logsRes] = await Promise.all([
      fetch('/api/status').then(r => r.json()),
      fetch('/api/logs').then(r => r.json())
    ])
    hardware.value = statusRes.hardware || {}
    ollama.value = statusRes.ollama || { running: false, models: [] }
    logs.value = logsRes
  } catch (e) {
    console.error('fetch failed:', e)
  }
}

async function loadConfig() {
  try {
    const data = await fetch('/api/config').then(r => r.json())
    config.value = {
      llm: { provider: 'ollama', baseUrl: '', apiKey: '', model: '', ...data.llm },
      stt: { provider: 'whisper', baseUrl: '', apiKey: '', model: '', ...data.stt },
      tts: { provider: 'coqui', baseUrl: '', apiKey: '', voiceId: '', ...data.tts }
    }
  } catch (e) {
    console.error('load config failed:', e)
  }
}

async function saveConfig() {
  saving.value = true
  try {
    await fetch('/api/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config.value)
    })
    saved.value = true
    setTimeout(() => saved.value = false, 2000)
  } catch (e) {
    alert('保存失败: ' + e.message)
  } finally {
    saving.value = false
  }
}

async function sendChat() {
  if (!chatInput.value.trim()) return
  const userMsg = chatInput.value
  chatHistory.value.push({ role: 'user', content: userMsg })
  chatInput.value = ''
  chatLoading.value = true
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg })
    })
    const data = await res.json()
    chatHistory.value.push({ role: 'assistant', content: data.response || '无回复' })
  } catch (e) {
    chatHistory.value.push({ role: 'assistant', content: '错误: ' + e.message })
  } finally {
    chatLoading.value = false
  }
}

function handleAudioFile(e) { audioFile.value = e.target.files[0] }

async function transcribe() {
  if (!audioFile.value) return
  sttLoading.value = true
  try {
    const form = new FormData()
    form.append('audio', audioFile.value)
    const res = await fetch('/api/transcribe', { method: 'POST', body: form })
    const data = await res.json()
    sttResult.value = data.text || '无结果'
  } catch (e) {
    sttResult.value = '错误: ' + e.message
  } finally {
    sttLoading.value = false
  }
}

async function synthesize() {
  if (!ttsText.value.trim()) return
  ttsLoading.value = true
  try {
    const res = await fetch('/api/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: ttsText.value })
    })
    const blob = await res.blob()
    ttsAudio.value = URL.createObjectURL(blob)
  } catch (e) {
    alert('合成失败: ' + e.message)
  } finally {
    ttsLoading.value = false
  }
}

function handleVoiceFile(e) { voiceFile.value = e.target.files[0] }

async function voiceTest() {
  if (!voiceFile.value) return
  voiceLoading.value = true
  try {
    const form = new FormData()
    form.append('audio', voiceFile.value)
    const res = await fetch('/api/voice', { method: 'POST', body: form })
    const data = await res.json()
    voiceResult.value = {
      transcript: data.transcript || '',
      response: data.response || '',
      audio: data.audioUrl || null
    }
  } catch (e) {
    alert('测试失败: ' + e.message)
  } finally {
    voiceLoading.value = false
  }
}

function formatKey(k) {
  const map = { platform: '平台', arch: '架构', cpus: 'CPU核心', totalMemory: '内存', freeMemory: '可用内存' }
  return map[k] || k
}

function formatLogTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString('zh-CN', { hour12: false })
}

onMounted(() => {
  fetchData()
  loadConfig()
  timer = setInterval(fetchData, 5000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.dashboard { max-width: 1400px; margin: 0 auto; }
.page-title { font-size: 32px; font-weight: 700; margin-bottom: 32px; }
.section { margin-bottom: 48px; }
.section-title { font-size: 20px; font-weight: 600; margin-bottom: 16px; color: var(--text-dim); }
.grid { display: grid; gap: 24px; }
.grid-2 { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
.info-list { display: flex; flex-direction: column; gap: 12px; }
.info-list > div { display: flex; justify-content: space-between; }
.info-list dt { color: var(--text-dim); font-size: 14px; }
.info-list dd { font-weight: 500; }
.ollama-status { display: flex; align-items: center; gap: 12px; }
.status-indicator { width: 10px; height: 10px; border-radius: 50%; }
.status-indicator.running { background: var(--success); }
.status-indicator.stopped { background: var(--error); }
.status-detail { color: var(--text-dim); font-size: 13px; margin-left: auto; }
.info-label { font-size: 13px; color: var(--text-dim); margin-bottom: 8px; }
.model-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.tag { background: var(--surface-2); padding: 4px 10px; border-radius: 4px; font-size: 13px; }
.config-form { display: flex; flex-direction: column; gap: 32px; }
.config-group { display: flex; flex-direction: column; gap: 16px; }
.group-title { font-weight: 600; font-size: 15px; }
.field-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; color: var(--text-dim); }
.actions { display: flex; align-items: center; gap: 16px; padding-top: 8px; }
.saved-msg { color: var(--success); font-size: 14px; }
.chat-box {
  max-height: 300px; overflow-y: auto; padding: 12px;
  background: var(--surface-2); border-radius: 6px; margin-bottom: 12px;
  display: flex; flex-direction: column; gap: 8px;
}
.chat-msg { display: flex; }
.chat-msg.user { flex-direction: row-reverse; }
.msg-text {
  background: var(--surface-3); padding: 8px 12px; border-radius: 6px;
  max-width: 80%; font-size: 14px;
}
.chat-input { display: flex; gap: 8px; }
.test-panel { display: flex; gap: 8px; margin-bottom: 12px; }
.result-box {
  padding: 12px; background: var(--surface-2); border-radius: 6px;
  font-size: 13px; line-height: 1.6;
}
.log-stream {
  max-height: 300px; overflow-y: auto;
  font-family: 'SF Mono', Monaco, monospace; font-size: 13px;
  background: var(--surface-2); padding: 12px; border-radius: 6px;
}
.log-line { display: flex; gap: 12px; padding: 2px 0; }
.log-time { color: var(--text-dim); flex-shrink: 0; }
.log-msg { color: var(--text); }
</style>

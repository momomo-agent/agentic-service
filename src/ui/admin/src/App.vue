<template>
  <div>
    <nav>
      <button @click="tab='hardware'">硬件</button>
      <button @click="tab='config'">配置</button>
      <button @click="tab='logs'">日志</button>
    </nav>

    <div v-if="error">{{ error }}</div>

    <div v-if="tab==='hardware' && status">
      <p>Platform: {{ status.hardware?.platform }}</p>
      <p>Arch: {{ status.hardware?.arch }}</p>
      <p>GPU: {{ status.hardware?.gpu?.type }} / {{ status.hardware?.gpu?.vram }}</p>
      <p>Memory: {{ status.hardware?.memory }}</p>
      <p>Ollama: {{ status.ollama?.running ? 'running' : 'stopped' }}</p>
      <p>Models: {{ status.ollama?.models?.join(', ') }}</p>
    </div>

    <div v-if="tab==='config'">
      <pre>{{ JSON.stringify(config, null, 2) }}</pre>
    </div>

    <div v-if="tab==='logs'">
      <div v-for="l in logs" :key="l.ts">
        <span>{{ new Date(l.ts).toLocaleTimeString() }}</span> {{ l.msg }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const tab = ref('hardware')
const status = ref(null)
const config = ref(null)
const logs = ref([])
const error = ref(null)

async function fetchAll() {
  try {
    const [s, c, l] = await Promise.all([
      fetch('/api/status').then(r => r.json()),
      fetch('/api/config').then(r => r.json()),
      fetch('/api/logs').then(r => r.json()),
    ])
    status.value = s
    config.value = c
    logs.value = l
  } catch (e) {
    error.value = e.message
  }
}

async function fetchLogs() {
  try {
    logs.value = await fetch('/api/logs').then(r => r.json())
  } catch {}
}

let timer
onMounted(() => { fetchAll(); timer = setInterval(fetchLogs, 5000) })
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div>
    <nav>
      <button @click="tab='hardware'">硬件</button>
      <button @click="tab='devices'">设备</button>
      <button @click="tab='logs'">日志</button>
      <button @click="tab='config'">配置</button>
    </nav>

    <div v-if="error">{{ error }}</div>

    <HardwarePanel v-if="tab==='hardware'" :hardware="status?.hardware" />
    <DeviceList v-if="tab==='devices'" :devices="status?.devices || []" />
    <LogViewer v-if="tab==='logs'" :logs="logs" />

    <div v-if="tab==='config'">
      <pre>{{ JSON.stringify(config, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import DeviceList from './components/DeviceList.vue'
import LogViewer from './components/LogViewer.vue'
import HardwarePanel from './components/HardwarePanel.vue'

const tab = ref('hardware')
const status = ref(null)
const config = ref(null)
const logs = ref([])
const error = ref(null)

async function fetchStatus() {
  try {
    status.value = await fetch('/api/status').then(r => r.json())
  } catch (e) { error.value = e.message }
}

async function fetchAll() {
  try {
    const [s, c, l] = await Promise.all([
      fetch('/api/status').then(r => r.json()),
      fetch('/api/config').then(r => r.json()),
      fetch('/api/logs').then(r => r.json()),
    ])
    status.value = s; config.value = c; logs.value = l
  } catch (e) { error.value = e.message }
}

let timer
onMounted(() => { fetchAll(); timer = setInterval(fetchStatus, 2000) })
onUnmounted(() => clearInterval(timer))
</script>

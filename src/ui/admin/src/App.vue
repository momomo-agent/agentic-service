<template>
  <div>
    <nav>
      <router-link to="/admin">状态</router-link>
      <router-link to="/admin/devices">设备</router-link>
      <router-link to="/admin/config">配置</router-link>
    </nav>
    <DeviceList :devices="devices" />
    <HardwarePanel :hardware="hardware" />
    <LogViewer :logs="logs" />
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import DeviceList from './components/DeviceList.vue'
import HardwarePanel from './components/HardwarePanel.vue'
import LogViewer from './components/LogViewer.vue'

const devices = ref([])
const hardware = ref({})
const logs = ref([])

async function pollStatus() {
  try {
    const data = await fetch('/api/status').then(r => r.json())
    devices.value = data.devices || []
    hardware.value = data.hardware || {}
  } catch (e) {
    logs.value = [...logs.value, `Error: ${e.message}`]
  }
}

onMounted(() => {
  pollStatus()
  const timer = setInterval(pollStatus, 5000)
  onUnmounted(() => clearInterval(timer))
})
</script>

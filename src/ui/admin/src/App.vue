<template>
  <div class="layout">
    <nav class="nav">
      <div class="nav-brand">⚡ Agentic Service</div>
      <div class="nav-links">
        <router-link to="/status">状态</router-link>
        <router-link to="/models">模型</router-link>
        <router-link to="/config">配置</router-link>
        <router-link to="/test">测试</router-link>
      </div>
      <div class="nav-status" :class="online ? 'online' : 'offline'">
        {{ online ? '运行中' : '离线' }}
      </div>
    </nav>
    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const online = ref(false)
let timer = null
async function check() {
  try {
    const r = await fetch('/health')
    online.value = r.ok
  } catch { online.value = false }
}
onMounted(() => { check(); timer = setInterval(check, 5000) })
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.layout { display: flex; flex-direction: column; min-height: 100vh; }
.nav {
  display: flex; align-items: center; gap: 24px;
  padding: 0 32px; height: 56px;
  background: var(--surface); border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 10;
}
.nav-brand { font-weight: 700; font-size: 15px; color: var(--text); white-space: nowrap; }
.nav-links { display: flex; gap: 4px; flex: 1; }
.nav-links a {
  padding: 6px 14px; border-radius: 4px; text-decoration: none;
  color: var(--text-dim); font-size: 14px; transition: all 150ms;
}
.nav-links a:hover { color: var(--text); background: var(--surface-2); }
.nav-links a.router-link-active { color: var(--text); background: var(--surface-2); }
.nav-status {
  font-size: 12px; padding: 4px 10px; border-radius: 99px; font-weight: 500;
}
.online { background: rgba(16,185,129,0.15); color: var(--success); }
.offline { background: rgba(239,68,68,0.15); color: var(--error); }
.main { flex: 1; padding: 32px; max-width: 1200px; width: 100%; margin: 0 auto; }
</style>

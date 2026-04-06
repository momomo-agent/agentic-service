<template>
  <div class="app">
    <a href="/admin" class="admin-link">Admin</a>
    <WakeWord v-if="wakeWord" :wakeWord="wakeWord" @activated="onWakeWord" />
    <ChatBox ref="chatBox" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ChatBox from './components/ChatBox.vue';
import WakeWord from './components/WakeWord.vue';

const wakeWord = ref('');
const chatBox = ref(null);

onMounted(async () => {
  try {
    const res = await fetch('/api/config');
    const cfg = await res.json();
    wakeWord.value = cfg.wakeWord || '';
  } catch {}
});

function onWakeWord() {
  chatBox.value?.startRecording();
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f5f5;
}
.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

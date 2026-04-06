<template>
  <button
    @mousedown="start" @mouseup="stop"
    @touchstart.prevent="start" @touchend.prevent="stop"
    :class="{ recording }"
  >{{ recording ? '🔴' : '🎤' }}</button>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['transcribed']);
const recording = ref(false);

defineExpose({ start, stop });
let recorder, chunks;

async function start() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  chunks = [];
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = e => chunks.push(e.data);
  recorder.onstop = async () => {
    stream.getTracks().forEach(t => t.stop());
    const blob = new Blob(chunks, { type: 'audio/webm' });
    const form = new FormData();
    form.append('audio', blob, 'audio.webm');
    const res = await fetch('/api/transcribe', { method: 'POST', body: form });
    const { text } = await res.json();
    if (text) emit('transcribed', text);
  };
  recorder.start();
  recording.value = true;
}

function stop() {
  recorder?.stop();
  recording.value = false;
}
</script>

<style scoped>
button { font-size: 1.4rem; background: none; border: none; cursor: pointer; padding: 4px 8px; }
button.recording { opacity: 0.7; }
</style>

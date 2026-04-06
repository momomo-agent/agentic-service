import { ref } from 'vue';

export function useVAD() {
  let audioContext, analyser, mediaStream, recorder, chunks;
  const active = ref(false);

  async function startVAD(onSpeechEnd) {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    audioContext.createMediaStreamSource(mediaStream).connect(analyser);

    recorder = new MediaRecorder(mediaStream);
    chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => onSpeechEnd(new Blob(chunks, { type: 'audio/webm' }));
    recorder.start();
    active.value = true;

    const data = new Float32Array(analyser.fftSize);
    let silenceStart = null;

    function check() {
      if (!active.value) return;
      analyser.getFloatTimeDomainData(data);
      const rms = Math.sqrt(data.reduce((s, v) => s + v * v, 0) / data.length);
      if (rms < 0.01) {
        if (!silenceStart) silenceStart = Date.now();
        else if (Date.now() - silenceStart > 1500) { stopVAD(); return; }
      } else {
        silenceStart = null;
      }
      requestAnimationFrame(check);
    }
    check();
  }

  function stopVAD() {
    active.value = false;
    recorder?.stop();
    mediaStream?.getTracks().forEach(t => t.stop());
    audioContext?.close();
  }

  return { startVAD, stopVAD, active };
}

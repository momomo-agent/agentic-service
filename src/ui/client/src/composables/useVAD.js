export function useVAD(onStart, onStop, options = {}) {
  const { threshold = 0.01, silenceMs = 1500 } = options;
  let ctx, processor, stream;
  let recording = false;
  let silenceTimer = null;
  let startTime = 0;
  const MIN_DURATION = 300;

  async function start() {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    processor = ctx.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      const samples = e.inputBuffer.getChannelData(0);
      let sum = 0;
      for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
      const rms = Math.sqrt(sum / samples.length);

      if (rms > threshold) {
        clearTimeout(silenceTimer);
        silenceTimer = null;
        if (!recording) {
          recording = true;
          startTime = Date.now();
          onStart();
        }
      } else if (recording && !silenceTimer) {
        silenceTimer = setTimeout(() => {
          if (Date.now() - startTime >= MIN_DURATION) {
            recording = false;
            onStop();
          }
          silenceTimer = null;
        }, silenceMs);
      }
    };

    source.connect(processor);
    processor.connect(ctx.destination);
    document.addEventListener('visibilitychange', onVisibility);
  }

  function onVisibility() {
    if (document.hidden && recording) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
      recording = false;
      onStop();
    }
  }

  function stop() {
    document.removeEventListener('visibilitychange', onVisibility);
    clearTimeout(silenceTimer);
    processor?.disconnect();
    stream?.getTracks().forEach(t => t.stop());
    ctx?.close();
    recording = false;
  }

  return { start, stop, get isActive() { return recording; } };
}

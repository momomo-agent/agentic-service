export function useVAD({ onStart, onStop, threshold = 0.01, silenceMs = 1500 }) {
  let ctx, analyser, source, stream, rafId, silenceTimer

  async function start() {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    ctx = new AudioContext()
    analyser = ctx.createAnalyser()
    source = ctx.createMediaStreamSource(stream)
    source.connect(analyser)
    let speaking = false
    const buf = new Float32Array(analyser.fftSize)

    function tick() {
      analyser.getFloatTimeDomainData(buf)
      const rms = Math.sqrt(buf.reduce((s, v) => s + v * v, 0) / buf.length)
      if (rms > threshold) {
        clearTimeout(silenceTimer)
        if (!speaking) { speaking = true; onStart?.() }
      } else if (speaking) {
        silenceTimer = setTimeout(() => { speaking = false; onStop?.() }, silenceMs)
      }
      rafId = requestAnimationFrame(tick)
    }
    tick()
  }

  function stop() {
    cancelAnimationFrame(rafId)
    clearTimeout(silenceTimer)
    stream?.getTracks().forEach(t => t.stop())
    ctx?.close()
  }

  return { start, stop }
}

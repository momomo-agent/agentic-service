const SPEECH_THRESHOLD = 0.01
const SILENCE_THRESHOLD = 0.005
const SILENCE_DURATION = 500 // ms

export function useVAD({ onStart, onStop }) {
  let ctx, analyser, source, stream, rafId
  let silenceStart = null
  let isRecording = false
  let consecutiveFrames = 0

  async function start() {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    ctx = new AudioContext()
    if (ctx.state === 'suspended') await ctx.resume()
    analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    source = ctx.createMediaStreamSource(stream)
    source.connect(analyser)
    const buf = new Float32Array(analyser.fftSize)

    function tick() {
      analyser.getFloatTimeDomainData(buf)
      const rms = Math.sqrt(buf.reduce((s, v) => s + v * v, 0) / buf.length)

      if (rms > SPEECH_THRESHOLD) {
        silenceStart = null
        consecutiveFrames++
        if (!isRecording && consecutiveFrames >= 3) {
          isRecording = true
          onStart?.()
        }
      } else if (rms < SILENCE_THRESHOLD && isRecording) {
        consecutiveFrames = 0
        if (!silenceStart) silenceStart = Date.now()
        else if (Date.now() - silenceStart >= SILENCE_DURATION) {
          isRecording = false
          silenceStart = null
          onStop?.()
        }
      } else {
        consecutiveFrames = 0
      }

      rafId = requestAnimationFrame(tick)
    }
    tick()
  }

  function stop() {
    cancelAnimationFrame(rafId)
    stream?.getTracks().forEach(t => t.stop())
    ctx?.close()
    isRecording = false
    silenceStart = null
    consecutiveFrames = 0
  }

  return { start, stop }
}

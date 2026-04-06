import { createPipeline } from 'agentic-sense';

let pipeline = null;
let intervalId = null;
const handlers = {};

export async function init(videoElement) {
  pipeline = await createPipeline({ face: true, gesture: true, object: true });
  pipeline._video = videoElement;
}

export function on(type, handler) {
  if (!handlers[type]) handlers[type] = [];
  handlers[type].push(handler);
}

function emit(type, data) {
  const event = { type, data, ts: Date.now() };
  (handlers[type] || []).forEach(h => h(event));
}

export function start() {
  if (intervalId != null) { clearInterval(intervalId); intervalId = null; }
  intervalId = setInterval(() => {
    const video = pipeline?._video;
    if (video && video.readyState >= 2) {
      const result = pipeline.detect(video);
      if (result.faces?.length) {
        result.faces.forEach(f => emit('face_detected', { boundingBox: f.boundingBox }));
      }
      if (result.gestures?.length) {
        result.gestures.forEach(g => emit('gesture_detected', { gesture: g.gesture }));
      }
      if (result.objects?.length) {
        result.objects
          .filter(o => o.confidence > 0.5)
          .forEach(o => emit('object_detected', { label: o.label, confidence: o.confidence }));
      }
    }
  }, 100);
}

export function detect(frame) {
  if (!pipeline) return { faces: [], gestures: [], objects: [] }
  const result = pipeline.detect(frame)
  return {
    faces: (result.faces || []).map(f => ({ boundingBox: f.boundingBox })),
    gestures: (result.gestures || []).map(g => ({ gesture: g.gesture })),
    objects: (result.objects || []).filter(o => o.confidence > 0.5)
                                   .map(o => ({ label: o.label, confidence: o.confidence }))
  }
}

export function stop() {
  if (intervalId != null) { clearInterval(intervalId); intervalId = null; }
  pipeline = null;
}

let _wakeActive = false;

export function startWakeWordPipeline(onWake) {
  if (_wakeActive) return () => {};
  _wakeActive = true;

  let mic;
  try {
    // Try to open mic via node-microphone or similar; stub if unavailable
    const { default: Mic } = await import('node-microphone').catch(() => null) ?? {};
    if (Mic) {
      mic = new Mic();
      const stream = mic.startRecording();
      stream.on('data', (chunk) => {
        // Keyword detection placeholder — real impl would use a VAD/keyword lib
        if (chunk.toString().toLowerCase().includes(process.env.WAKE_WORD || 'hey agent')) {
          onWake();
        }
      });
    } else {
      console.warn('[sense] No mic available, wake word pipeline is a no-op');
    }
  } catch {
    console.warn('[sense] No mic available, wake word pipeline is a no-op');
  }

  return () => {
    _wakeActive = false;
    try { mic?.stopRecording(); } catch { /* ignore */ }
  };
}

export async function initHeadless(options = { face: true, gesture: true, object: true }) {
  pipeline = await createPipeline(options);
}

export function detectFrame(buffer) {
  if (!pipeline || buffer == null) return { faces: [], gestures: [], objects: [] };
  return detect(buffer);
}

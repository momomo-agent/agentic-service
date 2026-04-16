import { createPipeline } from './adapters/sense.js';
import { EventEmitter } from 'node:events';
import { detectVoiceActivity } from './vad.js';

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
  function loop() {
    if (intervalId == null) return;
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
  }
  intervalId = setInterval(loop, 16);
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

let _micInstance = null;

export async function startWakeWordPipeline(onWakeWord) {
  if (_micInstance) {
    // Already active — return a no-op stop function
    return () => {};
  }

  let micModule;
  try {
    micModule = (await import('mic')).default;
  } catch {
    console.warn('[sense] mic unavailable — wake word pipeline disabled');
    return () => {};
  }

  _micInstance = micModule({ rate: '16000', channels: '1', encoding: 'signed-integer', device: 'default' });
  const audioStream = _micInstance.getAudioStream();
  audioStream.on('data', (buf) => {
    if (detectVoiceActivity(buf)) { onWakeWord(); emit('wake_word', {}); }
  });
  audioStream.on('error', (err) => { console.warn('[sense] mic error:', err.message); });
  _micInstance.start();

  return () => {
    try { _micInstance?.stop(); } catch { /* ignore */ }
    _micInstance = null;
  };
}

export function stopWakeWordPipeline() {
  try { _micInstance?.stop(); } catch { /* ignore */ }
  _micInstance = null;
}

export async function initHeadless(options = { face: true, gesture: true, object: true }) {
  pipeline = await createPipeline(options);
}

export async function startHeadless() {
  const emitter = new EventEmitter();
  await startWakeWordPipeline(() => emitter.emit('wakeword'));
  return emitter;
}

export function detectFrame(buffer) {
  if (!pipeline || buffer == null) return { faces: [], gestures: [], objects: [] };
  return detect(buffer);
}

import { createPipeline } from '#agentic-sense';
import { EventEmitter } from 'node:events';

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
let _micInstance = null;

function _calcEnergy(buffer) {
  let sum = 0;
  for (let i = 0; i + 1 < buffer.length; i += 2) {
    const sample = buffer.readInt16LE(i);
    sum += sample * sample;
  }
  return Math.sqrt(sum / (buffer.length / 2));
}

export async function startWakeWordPipeline(onWake) {
  if (_wakeActive) return () => {};
  _wakeActive = true;

  let micMod;
  try {
    micMod = (await import('mic')).default;
  } catch {
    console.warn('[sense] mic package unavailable — wake word pipeline disabled');
    _wakeActive = false;
    return () => {};
  }

  let inst;
  try {
    inst = micMod({ rate: '16000', channels: '1', encoding: 'signed-integer', device: 'default' });
    const stream = inst.getAudioStream();
    stream.on('data', (buf) => { if (_calcEnergy(buf) > 1000) onWake(); });
    stream.on('error', (err) => console.error('[sense] mic error:', err));
    inst.start();
    _micInstance = inst;
    console.log('[sense] Wake word pipeline started');
  } catch (err) {
    console.warn('[sense] mic start failed:', err.message);
    _wakeActive = false;
    return () => {};
  }

  return () => {
    _wakeActive = false;
    try { _micInstance?.stop(); } catch { /* ignore */ }
    _micInstance = null;
  };
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

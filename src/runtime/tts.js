import { detect } from '../detector/hardware.js';
import { getProfile } from '../detector/profiles.js';
import { startMark, endMark } from './profiler.js';

const ADAPTERS = {
  kokoro:  () => import('agentic-voice/kokoro'),
  piper:   () => import('agentic-voice/piper'),
  default: () => import('agentic-voice/openai-tts'),
};

let adapter = null;

export async function init() {
  let provider = 'default';
  try {
    const hardware = await detect();
    const profile = await getProfile(hardware);
    provider = profile?.tts?.provider ?? 'default';
  } catch {}
  const load = ADAPTERS[provider] ?? ADAPTERS.default;
  try {
    adapter = await load();
  } catch {
    adapter = await ADAPTERS.default();
  }
}

export async function synthesize(text) {
  if (!adapter) throw new Error('not initialized');
  if (!text || !text.trim())
    throw Object.assign(new Error('text required'), { code: 'EMPTY_TEXT' });
  startMark('tts');
  const result = await adapter.synthesize(text);
  synthesize._lastMs = endMark('tts');
  return result;
}

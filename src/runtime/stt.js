import { detect } from '../detector/hardware.js';
import { getProfile } from '../detector/profiles.js';

const ADAPTERS = {
  sensevoice: () => import('agentic-voice/sensevoice'),
  whisper:    () => import('agentic-voice/whisper'),
  default:    () => import('agentic-voice/openai-whisper'),
};

let adapter = null;

export async function init() {
  let provider = 'default';
  try {
    const hardware = await detect();
    const profile = await getProfile(hardware);
    provider = profile?.stt?.provider ?? 'default';
  } catch {}
  const load = ADAPTERS[provider] ?? ADAPTERS.default;
  try {
    adapter = await load();
  } catch {
    adapter = await ADAPTERS.default();
  }
}

export async function transcribe(audioBuffer) {
  if (!adapter) throw new Error('not initialized');
  if (!audioBuffer || audioBuffer.length === 0)
    throw Object.assign(new Error('empty audio'), { code: 'EMPTY_AUDIO' });
  return adapter.transcribe(audioBuffer);
}

export async function synthesize(text) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw Object.assign(new Error('missing API key'), { code: 'NO_API_KEY' });
  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'tts-1', voice: 'alloy', input: text }),
  });
  if (!res.ok) throw new Error(`OpenAI TTS error: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

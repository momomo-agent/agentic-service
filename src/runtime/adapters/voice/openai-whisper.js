export async function transcribe(audioBuffer) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw Object.assign(new Error('missing API key'), { code: 'NO_API_KEY' });
  const boundary = '----boundary';
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-1\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.wav"\r\nContent-Type: audio/wav\r\n\r\n`),
    audioBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body,
  });
  if (!res.ok) throw new Error(`OpenAI STT error: ${res.status}`);
  return (await res.json()).text;
}

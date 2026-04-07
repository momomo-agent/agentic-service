export async function transcribe(audio) {
  if (!process.env.OPENAI_API_KEY)
    throw Object.assign(new Error('OPENAI_API_KEY required'), { code: 'NO_API_KEY' });
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI();
  const { text } = await client.audio.transcriptions.create({ file: audio, model: 'whisper-1' });
  return text;
}

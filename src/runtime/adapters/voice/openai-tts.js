export async function synthesize(text) {
  if (!process.env.OPENAI_API_KEY)
    throw Object.assign(new Error('OPENAI_API_KEY required'), { code: 'NO_API_KEY' });
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI();
  const response = await client.audio.speech.create({ model: 'tts-1', voice: 'alloy', input: text });
  return Buffer.from(await response.arrayBuffer());
}

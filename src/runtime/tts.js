let _provider = null

async function getProvider() {
  if (!_provider) {
    const { createTTS } = await import('agentic-voice')
    _provider = await createTTS()
  }
  return _provider
}

export async function synthesize(text) {
  if (!text || !text.trim()) {
    throw Object.assign(new Error('text required'), { code: 'EMPTY_TEXT' })
  }
  const provider = await getProvider()
  return provider.synthesize(text)
}

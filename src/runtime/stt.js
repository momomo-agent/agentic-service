let _provider = null

async function getProvider() {
  if (!_provider) {
    const { createSTT } = await import('agentic-voice')
    _provider = await createSTT()
  }
  return _provider
}

export async function transcribe(audioBuffer) {
  if (!audioBuffer || audioBuffer.length === 0) {
    throw Object.assign(new Error('empty audio'), { code: 'EMPTY_AUDIO' })
  }
  const provider = await getProvider()
  return provider.transcribe(audioBuffer)
}

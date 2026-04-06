import { detect as detectHardware } from '../detector/hardware.js'
import { getProfile, watchProfiles } from '../detector/profiles.js'

let _config = null
async function loadConfig() {
  if (_config) return _config
  const hardware = await detectHardware()
  const profile = await getProfile(hardware)
  _config = { ...profile, _hardware: hardware }
  return _config
}

loadConfig().then(cfg => {
  watchProfiles(cfg._hardware, (newProfile) => {
    _config = { ...newProfile, _hardware: cfg._hardware }
    console.log('[llm] config reloaded:', newProfile.llm.model)
  })
}).catch(() => {})

async function* chatWithOllama(messages) {
  const config = await loadConfig();
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: config.llm.model, messages, stream: true }),
    signal: AbortSignal.timeout(30000)
  });

  if (!response.ok) throw new Error(`Ollama API error: ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value).split('\n').filter(l => l.trim())) {
      try {
        const data = JSON.parse(line);
        if (data.message?.content) {
          yield { type: 'content', content: data.message.content, done: data.done || false };
        }
      } catch { /* ignore */ }
    }
  }
}

async function* chatWithAnthropic(messages, model) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model, messages, stream: true, max_tokens: 4096 })
  });

  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value).split('\n').filter(l => l.startsWith('data: '))) {
      try {
        const data = JSON.parse(line.slice(6));
        if (data.type === 'content_block_delta' && data.delta?.text) {
          yield { type: 'content', content: data.delta.text, done: false };
        }
      } catch { /* ignore */ }
    }
  }
}

async function* chatWithOpenAI(messages, model) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, stream: true })
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value).split('\n').filter(l => l.startsWith('data: '))) {
      const data = line.slice(6);
      if (data === '[DONE]') return;
      try {
        const content = JSON.parse(data).choices[0]?.delta?.content;
        if (content) yield { type: 'content', content, done: false };
      } catch { /* ignore */ }
    }
  }
}

export async function* chat(messages, options = {}) {
  try {
    yield* chatWithOllama(messages);
    return;
  } catch (error) {
    console.warn('Ollama failed, falling back to cloud:', error.message);
  }

  const config = await loadConfig();
  const { provider, model } = config.fallback;
  yield { type: 'meta', provider: 'cloud' };
  if (provider === 'openai') yield* chatWithOpenAI(messages, model);
  else if (provider === 'anthropic') yield* chatWithAnthropic(messages, model);
  else throw new Error(`Unsupported fallback provider: ${provider}`);
}

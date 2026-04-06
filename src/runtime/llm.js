async function loadConfig() {
  return {
    llm: { provider: 'ollama', model: 'gemma4:26b' },
    fallback: { provider: 'openai', model: 'gpt-4o-mini' }
  };
}

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

export async function* chat(message, options = {}) {
  const { history = [] } = options;
  const messages = [...history, { role: 'user', content: message }];

  try {
    yield* chatWithOllama(messages);
    return;
  } catch (error) {
    console.warn('Ollama failed, falling back to cloud:', error.message);
  }

  const config = await loadConfig();
  if (config.fallback.provider === 'openai') {
    yield* chatWithOpenAI(messages, config.fallback.model);
  } else {
    throw new Error(`Unsupported fallback provider: ${config.fallback.provider}`);
  }
}

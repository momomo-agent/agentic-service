import { chat as llmChat } from '../runtime/llm.js';

async function* chatWithTools(messages, tools) {
  // Try Ollama with tools via native API
  const config = { llm: { provider: 'ollama', model: 'gemma4:26b' } };
  try {
    const body = { model: config.llm.model, messages, stream: true };
    if (tools?.length) body.tools = tools;

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
          if (data.message?.tool_calls?.length) {
            for (const tc of data.message.tool_calls) {
              yield { type: 'tool_use', id: tc.id || `call_${Date.now()}`, name: tc.function.name, input: tc.function.arguments };
            }
          } else if (data.message?.content) {
            yield { type: 'content', content: data.message.content, done: data.done || false };
          }
        } catch { /* ignore */ }
      }
    }
    return;
  } catch (err) {
    if (tools?.length) {
      // Ollama doesn't support tools — fall through to cloud
      console.warn('Ollama tool_use unsupported, falling back to cloud:', err.message);
    } else {
      throw err;
    }
  }

  // Cloud fallback with tools (OpenAI)
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const body = { model: 'gpt-4o-mini', messages, stream: true };
  if (tools?.length) body.tools = tools.map(t => ({ type: 'function', function: t }));

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body)
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const toolCalls = {};

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value).split('\n').filter(l => l.startsWith('data: '))) {
      const data = line.slice(6);
      if (data === '[DONE]') {
        for (const tc of Object.values(toolCalls)) {
          yield { type: 'tool_use', id: tc.id, name: tc.name, input: JSON.parse(tc.args || '{}') };
        }
        return;
      }
      try {
        const delta = JSON.parse(data).choices[0]?.delta;
        if (delta?.content) yield { type: 'content', content: delta.content, done: false };
        if (delta?.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index;
            if (!toolCalls[idx]) toolCalls[idx] = { id: tc.id, name: tc.function?.name, args: '' };
            if (tc.function?.name) toolCalls[idx].name = tc.function.name;
            if (tc.function?.arguments) toolCalls[idx].args += tc.function.arguments;
          }
        }
      } catch { /* ignore */ }
    }
  }
}

export async function* chat(messages, options = {}) {
  const { tools } = options;
  try {
    yield* chatWithTools(messages, tools);
  } catch (err) {
    yield { type: 'error', error: err.message };
  }
}

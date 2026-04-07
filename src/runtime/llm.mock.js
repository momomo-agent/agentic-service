
export async function* chat(messages, options) {
  if (options?.tools?.length) {
    yield { type: 'tool_use', id: 'call_1', name: options.tools[0].name, input: {}, text: '' };
  } else {
    yield { type: 'content', text: 'hello', done: true };
  }
}

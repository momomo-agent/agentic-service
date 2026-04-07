import agenticSense from 'agentic-sense';
const { AgenticSense } = agenticSense;

export async function createPipeline(options = {}) {
  const instance = new AgenticSense(null, options);
  await instance.init();
  return instance;
}

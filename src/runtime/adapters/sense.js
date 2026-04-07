import { AgenticSense } from 'agentic-sense';

export async function createPipeline(options = {}) {
  const instance = new AgenticSense(null, options);
  await instance.init();
  return instance;
}

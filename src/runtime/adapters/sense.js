import pkg from 'agentic-sense';
const { AgenticSense } = pkg;

export function createPipeline(options = {}) {
  const sense = new AgenticSense(null);
  return {
    _video: null,
    detect(frame) {
      try { return sense.detect ? sense.detect(frame) : { faces: [], gestures: [], objects: [] }; }
      catch { return { faces: [], gestures: [], objects: [] }; }
    }
  };
}

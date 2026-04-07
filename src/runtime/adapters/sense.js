import { AgenticSense } from 'agentic-sense';

export function createPipeline(options = {}) {
  const sense = new AgenticSense(null);
  return {
    detect(frame) {
      try {
        const raw = sense.detect ? sense.detect(frame) : {};
        return {
          faces: raw.faces || [],
          gestures: raw.gestures || [],
          objects: raw.objects || [],
        };
      } catch {
        return { faces: [], gestures: [], objects: [] };
      }
    }
  };
}

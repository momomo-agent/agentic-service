export function createPipeline(options = {}) {
  return {
    _video: null,
    detect(frame) {
      return { faces: [], gestures: [], objects: [] };
    }
  };
}

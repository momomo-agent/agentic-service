import { detect as agenticDetect } from 'agentic-sense'

const EMPTY = { faces: [], gestures: [], objects: [] }

export async function detect(frame) {
  if (frame == null) return EMPTY
  try {
    return await agenticDetect(frame)
  } catch {
    return EMPTY
  }
}

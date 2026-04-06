import { describe, it, expect, vi } from 'vitest'

vi.mock('agentic-sense', () => ({
  detect: vi.fn(async (frame) => ({
    faces: [{ x: 0, y: 0, confidence: 0.9 }],
    gestures: [{ type: 'wave', confidence: 0.8 }],
    objects: [{ label: 'cup', confidence: 0.7 }]
  }))
}))

import { detect } from '../../src/runtime/sense.js'

describe('sense.detect', () => {
  it('DBB-004: null frame returns empty result', async () => {
    const result = await detect(null)
    expect(result).toEqual({ faces: [], gestures: [], objects: [] })
  })

  it('DBB-004: undefined frame returns empty result', async () => {
    const result = await detect(undefined)
    expect(result).toEqual({ faces: [], gestures: [], objects: [] })
  })

  it('DBB-001: returns faces array with length >= 1', async () => {
    const result = await detect({ data: 'frame' })
    expect(Array.isArray(result.faces)).toBe(true)
    expect(result.faces.length).toBeGreaterThanOrEqual(1)
  })

  it('DBB-002: returns gestures array with length >= 1', async () => {
    const result = await detect({ data: 'frame' })
    expect(Array.isArray(result.gestures)).toBe(true)
    expect(result.gestures.length).toBeGreaterThanOrEqual(1)
  })

  it('DBB-003: returns objects array with length >= 1', async () => {
    const result = await detect({ data: 'frame' })
    expect(Array.isArray(result.objects)).toBe(true)
    expect(result.objects.length).toBeGreaterThanOrEqual(1)
  })

  it('returns empty result on agentic-sense error', async () => {
    const { detect: agenticDetect } = await import('agentic-sense')
    agenticDetect.mockRejectedValueOnce(new Error('model error'))
    const result = await detect({ data: 'frame' })
    expect(result).toEqual({ faces: [], gestures: [], objects: [] })
  })
})

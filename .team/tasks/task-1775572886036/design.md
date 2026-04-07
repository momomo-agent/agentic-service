# Design: Voice Latency Benchmark Test

## File
- **create** `test/benchmark/voice-latency.test.js`

## Logic
Mock STT, LLM, TTS with `jest.mock()` returning resolved promises after small delays.
Run the pipeline sequentially, measure wall-clock time, assert < 2000ms.

```js
// test/benchmark/voice-latency.test.js
import { transcribe } from '../../src/runtime/stt.js'
import { chat } from '../../src/runtime/llm.js'
import { synthesize } from '../../src/runtime/tts.js'

jest.mock('../../src/runtime/stt.js')
jest.mock('../../src/runtime/llm.js')
jest.mock('../../src/runtime/tts.js')

test('STT+LLM+TTS pipeline completes under 2000ms', async () => {
  transcribe.mockResolvedValue('hello')
  chat.mockResolvedValue('world')
  synthesize.mockResolvedValue(Buffer.alloc(0))

  const start = Date.now()
  const text = await transcribe(Buffer.alloc(0))
  const reply = await chat([{ role: 'user', content: text }], {})
  await synthesize(reply)
  expect(Date.now() - start).toBeLessThan(2000)
})
```

## Edge Cases
- Mocks must not introduce real I/O — use `mockResolvedValue`
- Test should be in a `benchmark` describe block or file so it can be run selectively

## Dependencies
- `src/runtime/stt.js`, `src/runtime/llm.js`, `src/runtime/tts.js` must export named functions

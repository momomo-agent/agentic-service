# Task Design: src/runtime/sense+memory.js 实现

## Files
- `src/runtime/sense.js` — MediaPipe sense runtime (already exists, verify)
- `src/runtime/memory.js` — vector memory runtime (already exists, verify)

## sense.js Interfaces
```js
init(videoElement): Promise<void>       // browser: init with video element
initHeadless(options?): Promise<void>   // server: init without video
detectFrame(buffer): { faces, gestures, objects }
  // if !pipeline → return { faces: [], gestures: [], objects: [] }
start(): void   // begin interval detection (browser)
stop(): void    // clear interval, null pipeline
on(type, handler): void  // register event handler
```

## memory.js Interfaces
```js
add(text: string): Promise<void>
  // embeds text, stores { text, vector } in KV store
  // updates index at 'mem:__index__'
search(query: string, topK?: number): Promise<[{ text, score }]>
  // embeds query, cosine similarity against all stored vectors
  // returns top-k sorted by score desc
remove(key: string): Promise<void>
```

## Edge Cases
- sense: pipeline null → detectFrame returns empty, no throw
- memory: empty query → return []
- memory: empty index → return []
- memory: concurrent add() → serialized via _lock chain

## Test Cases
1. initHeadless() → pipeline set
2. detectFrame(null) → { faces:[], gestures:[], objects:[] }
3. add('hello') → search('hello') returns [{ text:'hello', score≈1 }]
4. search('') → []

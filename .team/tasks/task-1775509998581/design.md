# Design: src/runtime/memory.js

## File
`src/runtime/memory.js` (already exists)

## Exports
```js
export async function add(text: string): Promise<void>
export async function search(query: string, topK?: number): Promise<{text: string, score: number}[]>
export async function remove(key: string): Promise<void>
export { remove as delete }
```

## Logic
- add(): embed(text) → store {text, vector} under unique key, append key to index
- search(): embed(query), cosine similarity against all stored vectors, sort desc, slice topK
- remove(): del(key), filter key from index, save updated index
- Serial write lock via _lock promise chain

## Edge Cases
- search("") or search(null) → return []
- Empty index → return []
- cosine with zero vector → return 0 (no divide-by-zero)

## Dependencies
- `./embed.js` for vector embedding
- `../store/index.js` for get/set/del

## Test Cases (DBB-009, DBB-010)
- add() then search() → first result matches added text, score > 0
- search("") → []

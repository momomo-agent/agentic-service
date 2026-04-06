import { embed } from './embed.js'
import { get, set, del } from '../store/index.js'

const INDEX_KEY = 'mem:__index__'

async function getIndex() {
  return (await get(INDEX_KEY)) || []
}

export async function add(text) {
  const vector = Array.from(await embed(text))
  const id = 'mem:' + Date.now() + ':' + Math.random().toString(36).slice(2)
  await set(id, { text, vector })
  const index = await getIndex()
  index.push(id)
  await set(INDEX_KEY, index)
}

export async function remove(key) {
  await del(key)
  const index = await getIndex()
  const updated = index.filter(id => id !== key)
  await set(INDEX_KEY, updated)
}

export { remove as delete }

export async function search(query, topK = 5) {
  if (!query) return []
  const queryVec = await embed(query)
  if (!queryVec || queryVec.length === 0) return []
  const index = await getIndex()
  if (index.length === 0) return []
  const entries = await Promise.all(index.map(id => get(id)))
  return entries
    .filter(Boolean)
    .map(item => ({ text: item.text, score: cosine(queryVec, item.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0
}

# Design: CDN profiles.json 7天缓存刷新

## Files
- `src/detector/profiles.js` — modify cache logic

## Interface
```js
// profiles.js (existing)
getProfile(hardware?): Promise<Profile>
```

## Logic
- Cache file: `~/.agentic-service/profiles-cache.json`
- On read: check `cache.cachedAt` — if `Date.now() - cachedAt > 7 * 86400 * 1000` → re-fetch CDN
- On fetch success: write `{ ...data, cachedAt: Date.now() }` to cache
- On fetch failure: use existing cache regardless of age; if no cache → use `profiles/default.json`

## Edge Cases
- cachedAt missing in old cache → treat as expired, re-fetch
- CDN returns non-200 → keep old cache
- No cache + no network → fallback to default.json

## Test Cases
- Cache age < 7d → no CDN fetch
- Cache age > 7d → CDN fetch attempted
- CDN fetch fails → old cache returned
- No cache, no network → default.json content returned

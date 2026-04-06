# Design: 修复 src/detector/profiles.js

## Problem
`matchProfile()` throws when no profile matches. `getProfile()` must never throw — fall back to default.

## Files to Modify
- `src/detector/profiles.js` — wrap `matchProfile` call, catch error, return default

## Change
```javascript
// In getProfile(), replace:
return matchProfile(profiles, hardware);

// With:
try {
  return matchProfile(profiles, hardware);
} catch {
  return profiles.profiles.find(e => Object.keys(e.match).length === 0)?.config
    ?? await loadBuiltinDefault();
}
```

## loadBuiltinDefault
```javascript
async function loadBuiltinDefault() {
  const p = new URL('../../profiles/default.json', import.meta.url);
  return JSON.parse(await fs.readFile(p, 'utf8'));
}
```

## Edge Cases
- `profiles.profiles` is empty → return builtin default
- Remote fetch fails + cache expired → already handled by existing `loadProfiles()` fallback chain

## Test Cases
1. `getProfile({ platform:'linux', arch:'x64', gpu:{type:'none'}, memory:4 })` → returns object with `llm`, `stt`, `tts`, `fallback`
2. `getProfile({ platform:'darwin', arch:'arm64', gpu:{type:'apple-silicon'}, memory:16 })` → returns matched profile

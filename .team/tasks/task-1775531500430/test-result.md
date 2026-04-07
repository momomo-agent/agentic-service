# Test Result: Cross-device Brain State Sharing

## Summary
- **Status**: FAILED (implementation bugs)
- **Tests**: 3 passed, 2 failed

## Results

| Test | Result |
|------|--------|
| broadcastSession sends data to all registered devices | FAIL |
| broadcastSession truncates history to last 20 messages | FAIL |
| broadcastSession silently skips unknown sessionId | PASS |
| joinSession returns full session state | PASS |
| setSessionData / getSessionData round-trip | PASS |

## Bugs Found

### Bug 1: `broadcastSession` overwrites `data.history` with empty `session.history`
- **Location**: `src/server/hub.js` broadcastSession legacy path (line ~86)
- **Code**: `const data = { ...session.data, history: session.history.slice(-20) };`
- **Problem**: `session.history` is the internal message log (populated by `broadcastSession(sessionId, message)`), but `session.data.history` is set via `setSessionData`. The spread `{ ...session.data, history: session.history.slice(-20) }` overwrites `data.history` with the empty internal history.
- **Fix**: Should use `session.data.history` directly, or merge correctly.

### Bug 2: `broadcastSession` legacy path broadcasts to all `registry` devices, not session devices
- **Location**: `src/server/hub.js` broadcastSession legacy path (line ~88)
- **Code**: `for (const [id, device] of registry)` — iterates all registered devices
- **Problem**: Test 2 registers `dev-trunc` but never joins `sess-trunc`. The session doesn't exist so `broadcastSession` returns early before sending anything. The test expects the device to receive the broadcast because it's registered globally.
- **Fix**: Either the test should call `joinSession` before `broadcastSession`, or the legacy broadcast should truly go to all registry devices and the session lookup should not gate it.

## Edge Cases Identified
- Device registered but not joined to session receives no broadcast in new path
- `session.data.history` vs `session.history` are two separate stores with conflicting semantics

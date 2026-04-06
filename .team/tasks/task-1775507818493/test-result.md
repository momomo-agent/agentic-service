# Test Result: hub.js心跳超时60s

**Status: PASS**

## Tests
- DBB-006: hub.js uses 60000ms timeout, not 40000ms ✓

## Implementation Verified
- Device status check: `now - d.lastSeen > 60000`
- WebSocket ping timeout: `now - device.lastPong > 60000`
- No 40000ms value present

## Results: 1/1 passed

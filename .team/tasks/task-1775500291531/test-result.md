# Test Result: server/hub.js 设备管理

## Summary
- Total: 5 | Passed: 5 | Failed: 0

## Results
- ✔ registerDevice returns { id, registeredAt }
- ✔ getDevices includes registered device with online status
- ✔ heartbeat on unknown id auto-registers device
- ✔ heartbeat updates lastSeen and sets status online
- ✔ device starts online after registration

## Edge Cases
- 30s offline detection: interval-based, not directly testable without fake timers
- WebSocket device registration path (object form) also sets devices Map

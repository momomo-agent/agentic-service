# Test Result: sense.js服务端无头模式

## Summary
- Tests passed: 6
- Tests failed: 0

## Results (m24-sense-headless.test.js)
- ✓ exports initHeadless
- ✓ exports detectFrame
- ✓ initHeadless does not set _video
- ✓ detectFrame returns empty result before init
- ✓ detectFrame delegates to detect()
- ✓ existing init/start/stop/detect exports preserved

## DBB Verification
- [x] initHeadless(options) creates pipeline without DOM
- [x] detectFrame(buffer) returns {faces, gestures, objects}
- [x] detectFrame before init returns empty result safely
- [x] Existing browser API unchanged

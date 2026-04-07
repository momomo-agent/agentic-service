# Test Result: Fix SIGINT graceful drain during in-flight requests

## Status: PASSED

## Tests Run
- File: `test/sigint.test.js` (1 test)
- File: `test/m48-sigint-drain.test.js` (5 tests)
- Total: 6 tests
- Passed: 6
- Failed: 0

## Results
- SIGINT calls server.close ✓
- waitDrain resolves immediately with no in-flight requests ✓
- waitDrain resolves after in-flight request finishes ✓
- waitDrain rejects on timeout if request never completes ✓
- startDrain sets draining flag ✓
- shutdown waits for in-flight then closes in correct order ✓

## Edge Cases
- No in-flight requests → resolves immediately ✓
- Drain timeout → proceeds with close anyway ✓
- process.once ensures handler runs only once ✓

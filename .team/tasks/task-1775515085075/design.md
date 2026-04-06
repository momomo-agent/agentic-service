# Design: HTTPS/LAN隧道安全访问

## Status
Core files exist (src/server/cert.js, src/server/httpsServer.js). Task is to wire them into the main server startup.

## Files
- `src/server/cert.js` — generateCert() (exists)
- `src/server/httpsServer.js` — createServer(app) (exists)
- `bin/agentic-service.js` — startup entry, needs HTTPS wiring

## Interface
```js
// cert.js
generateCert() → { key: string, cert: string }

// httpsServer.js
createServer(app: Express) → https.Server
```

## Logic
1. In bin/agentic-service.js, replace `app.listen(port)` with:
   ```js
   import { createServer } from '../src/server/httpsServer.js'
   const server = createServer(app)
   server.listen(port, '0.0.0.0', () => console.log(`https://localhost:${port}`))
   ```
2. Bind to `0.0.0.0` (not 127.0.0.1) to allow LAN access
3. Self-signed cert via `selfsigned` package (already used)

## Edge Cases
- Port already in use → EADDRINUSE propagates, process exits with error
- selfsigned not installed → npm install selfsigned (add to package.json if missing)

## Verification
- [ ] https://localhost:3000 returns 200
- [ ] LAN device https://<host-ip>:3000 returns 200
- [ ] HTTP fallback not needed (HTTPS only)

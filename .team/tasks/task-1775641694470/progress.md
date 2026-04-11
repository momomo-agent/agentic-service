# 统一默认端口为 1234

## Progress

Updated all port 3000 → 1234:
- src/server/api.js startServer default
- src/tunnel.js default
- src/ui/admin/vite.config.js proxy
- src/ui/client/vite.config.js proxy
- Dockerfile, install/Dockerfile EXPOSE
- docker-compose.yml, install/docker-compose.yml ports + healthcheck
- README.md all references

bin/agentic-service.js already used 1234. 30000 timeout values untouched.

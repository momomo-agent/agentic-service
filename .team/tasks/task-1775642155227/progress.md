# 修复 Docker 配置缺失

## Progress

Added `OLLAMA_HOST=${OLLAMA_HOST:-http://host.docker.internal:11434}` env var and `./data:/root/.agentic-service` volume mount to docker-compose.yml. Kept port 1234 (existing config, not 3000 as design suggested).

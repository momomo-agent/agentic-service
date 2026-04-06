#!/bin/sh
set -e

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js not found. Install from https://nodejs.org" >&2; exit 1
fi
NODE_MAJOR=$(node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Error: Node.js >= 18 required (found $NODE_MAJOR)" >&2; exit 1
fi

npm install --prefer-offline
node bin/agentic-service.js

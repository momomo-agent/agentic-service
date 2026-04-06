#!/bin/sh
set -e

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js not found. Install from https://nodejs.org" >&2; exit 1
fi
NODE_MAJOR=$(node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Error: Node.js >= 18 required (found $NODE_MAJOR)" >&2; exit 1
fi

if npm list -g agentic-service >/dev/null 2>&1; then
  echo "agentic-service already installed"
else
  npm install --prefer-offline
fi
node bin/agentic-service.js

#!/bin/sh
set -e

# Node.js detection and install
install_node() {
  OS="$(uname -s)"
  if [ "$OS" = "Darwin" ]; then
    if command -v brew >/dev/null 2>&1; then
      brew install node
    elif [ -s "$HOME/.nvm/nvm.sh" ]; then
      . "$HOME/.nvm/nvm.sh" && nvm install 18
    else
      echo "Error: install nvm (https://nvm.sh) or Homebrew, then re-run" >&2; exit 1
    fi
  elif [ "$OS" = "Linux" ]; then
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
      . "$HOME/.nvm/nvm.sh" && nvm install 18
    elif command -v apt-get >/dev/null 2>&1; then
      curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
      sudo apt-get install -y nodejs
    else
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
      . "$HOME/.nvm/nvm.sh" && nvm install 18
    fi
  else
    echo "Error: Windows not supported. Install Node.js >= 18 from https://nodejs.org" >&2; exit 1
  fi
}

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js not found. Installing..."
  install_node
fi

NODE_MAJOR=$(node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Node.js >= 18 required (found $NODE_MAJOR). Installing..."
  install_node
fi

if [ "$AGENTIC_GLOBAL" = "1" ]; then
  if npm list -g agentic-service >/dev/null 2>&1; then
    echo "agentic-service already installed"
  else
    npm install -g agentic-service
  fi
  exec agentic-service "$@"
fi

if npm list -g agentic-service >/dev/null 2>&1; then
  echo "agentic-service already installed"
else
  npm install --prefer-offline
fi
node bin/agentic-service.js

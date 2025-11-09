#!/bin/bash

# Development Server Helper Script
# Automatically sets up PATH and runs the dev server

# Find Node.js
NODE_CMD=""
if command -v node &> /dev/null; then
    NODE_CMD="node"
elif [ -f "/usr/local/bin/node" ]; then
    NODE_CMD="/usr/local/bin/node"
elif [ -f "/opt/homebrew/bin/node" ]; then
    NODE_CMD="/opt/homebrew/bin/node"
else
    CELLAR_NODE=$(find /usr/local/Cellar/node -name node -type f 2>/dev/null | head -1)
    if [ -n "$CELLAR_NODE" ]; then
        NODE_CMD="$CELLAR_NODE"
    fi
fi

if [ -z "$NODE_CMD" ]; then
    echo "❌ Node.js not found!"
    echo "Please install Node.js first: brew install node"
    exit 1
fi

# Add Node.js to PATH
NODE_DIR=$(dirname "$NODE_CMD")
export PATH="$NODE_DIR:$PATH"

# Change to src directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC_DIR="$SCRIPT_DIR/src"

if [ ! -d "$SRC_DIR" ]; then
    echo "❌ src/ directory not found!"
    exit 1
fi

cd "$SRC_DIR" || exit 1

# Start the dev server
echo "🚀 Starting development server..."
echo "📍 Node.js: $NODE_CMD"
echo "📁 Directory: $(pwd)"
echo ""

npm run dev


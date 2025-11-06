#!/bin/bash

# ARLook Installation Script
# This script installs all requirements for the ARLook project
# Usage: ./install.sh

set -e  # Exit on error

echo "🚀 ARLook - Installation Script"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Check if Node.js is installed
echo "📋 Checking prerequisites..."
echo ""

# Find Node.js in common locations
NODE_CMD=""
if command -v node &> /dev/null; then
    NODE_CMD="node"
elif [ -f "/usr/local/bin/node" ]; then
    NODE_CMD="/usr/local/bin/node"
elif [ -f "/opt/homebrew/bin/node" ]; then
    NODE_CMD="/opt/homebrew/bin/node"
else
    # Try to find in Homebrew Cellar
    CELLAR_NODE=$(find /usr/local/Cellar/node -name node -type f 2>/dev/null | head -1)
    if [ -n "$CELLAR_NODE" ]; then
        NODE_CMD="$CELLAR_NODE"
    fi
fi

if [ -z "$NODE_CMD" ]; then
    print_error "Node.js is not installed!"
    echo ""
    echo "Please install Node.js first:"
    echo "  - macOS: brew install node"
    echo "  - Or visit: https://nodejs.org/"
    echo ""
    exit 1
fi

# Add Node.js to PATH immediately (needed for npm to work)
NODE_DIR=$(dirname "$NODE_CMD")
export PATH="$NODE_DIR:$PATH"

NODE_VERSION=$($NODE_CMD --version | sed 's/v//')
print_success "Node.js is installed: v$NODE_VERSION ($NODE_CMD)"

# Check Node.js version (simplified check)
MAJOR_VERSION=$(echo "$NODE_VERSION" | cut -d. -f1)
MINOR_VERSION=$(echo "$NODE_VERSION" | cut -d. -f2)
if [ "$MAJOR_VERSION" -lt 18 ] || ([ "$MAJOR_VERSION" -eq 18 ] && [ "$MINOR_VERSION" -lt 18 ]); then
    if [ "$MAJOR_VERSION" -lt 20 ]; then
        print_warning "Node.js version $NODE_VERSION may be too old!"
        echo "Recommended: 18.18.0+ or 20.0.0+"
        echo ""
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

# Find npm
NPM_CMD=""
if command -v npm &> /dev/null; then
    NPM_CMD="npm"
elif [ -f "/usr/local/bin/npm" ]; then
    NPM_CMD="/usr/local/bin/npm"
elif [ -f "/opt/homebrew/bin/npm" ]; then
    NPM_CMD="/opt/homebrew/bin/npm"
else
    # Try to find in same directory as node
    if [ -f "$NODE_DIR/npm" ]; then
        NPM_CMD="$NODE_DIR/npm"
    fi
fi

if [ -z "$NPM_CMD" ]; then
    print_error "npm is not installed!"
    exit 1
fi

NPM_VERSION=$($NPM_CMD --version)
print_success "npm is installed: v$NPM_VERSION ($NPM_CMD)"
echo ""

# Check if src directory exists
if [ ! -d "src" ]; then
    print_error "src/ directory not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Install npm dependencies
echo "📦 Installing npm packages..."
echo ""

cd src

if [ ! -f "package.json" ]; then
    print_error "package.json not found in src/ directory!"
    exit 1
fi

print_info "Running: $NPM_CMD install"
echo ""

if $NPM_CMD install; then
    print_success "All npm packages installed successfully!"
else
    print_error "Failed to install npm packages!"
    exit 1
fi

echo ""

# Check if .env.local exists
cd ..
if [ ! -f ".env.local" ]; then
    print_warning ".env.local file not found!"
    echo ""
    
    if [ -f ".env.example" ]; then
        print_info "Creating .env.local from .env.example..."
        cp .env.example .env.local
        
        # Also copy to src directory
        cp .env.local src/.env.local
        
        print_success ".env.local created!"
        print_warning "Please edit .env.local and add your API keys:"
        echo "  - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
        echo "  - OPENAI_API_KEY"
    else
        print_warning ".env.example not found. Please create .env.local manually."
    fi
else
    print_success ".env.local file exists"
    
    # Ensure it's also in src directory
    if [ ! -f "src/.env.local" ]; then
        cp .env.local src/.env.local
        print_info "Copied .env.local to src/ directory"
    fi
fi

echo ""
echo "================================="
print_success "Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local and add your API keys"
echo "  2. Run: cd src && npm run dev"
echo "  3. Open: http://localhost:3000"
echo ""
echo "For detailed setup instructions, see START_GUIDE.md"
echo ""


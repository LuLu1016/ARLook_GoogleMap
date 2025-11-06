#!/usr/bin/env python3
"""
ARLook Installation Script
Reads requirements.txt and installs all Node.js dependencies
Usage: python3 install.py
       or: pip install -r requirements.txt (if you have a Python wrapper)
"""

import subprocess
import sys
import os
import re
from pathlib import Path

def run_command(cmd, check=True):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(
            cmd, shell=True, check=check, 
            capture_output=True, text=True
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.CalledProcessError as e:
        return False, e.stdout, e.stderr

def check_node_installed():
    """Check if Node.js is installed"""
    success, stdout, _ = run_command("node --version", check=False)
    if success:
        version = stdout.strip()
        print(f"✅ Node.js found: {version}")
        return True, version
    else:
        print("❌ Node.js is not installed!")
        print("\nPlease install Node.js:")
        print("  - macOS: brew install node")
        print("  - Or visit: https://nodejs.org/")
        return False, None

def check_npm_installed():
    """Check if npm is installed"""
    success, stdout, _ = run_command("npm --version", check=False)
    if success:
        version = stdout.strip()
        print(f"✅ npm found: v{version}")
        return True, version
    else:
        print("❌ npm is not installed!")
        return False, None

def install_dependencies():
    """Install npm dependencies from package.json"""
    src_dir = Path("src")
    
    if not src_dir.exists():
        print("❌ src/ directory not found!")
        print("Please run this script from the project root directory.")
        return False
    
    package_json = src_dir / "package.json"
    if not package_json.exists():
        print("❌ package.json not found in src/ directory!")
        return False
    
    print("\n📦 Installing npm packages...")
    print("   Running: cd src && npm install\n")
    
    os.chdir(src_dir)
    success, stdout, stderr = run_command("npm install", check=False)
    os.chdir("..")
    
    if success:
        print("✅ All npm packages installed successfully!")
        return True
    else:
        print("❌ Failed to install npm packages!")
        if stderr:
            print(f"Error: {stderr}")
        return False

def setup_env_file():
    """Create .env.local from .env.example if it doesn't exist"""
    env_example = Path(".env.example")
    env_local = Path(".env.local")
    src_env_local = Path("src/.env.local")
    
    if not env_local.exists():
        if env_example.exists():
            print("\n📝 Creating .env.local from .env.example...")
            import shutil
            shutil.copy(env_example, env_local)
            shutil.copy(env_local, src_env_local)
            print("✅ .env.local created!")
            print("\n⚠️  Please edit .env.local and add your API keys:")
            print("   - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY")
            print("   - OPENAI_API_KEY")
        else:
            print("\n⚠️  .env.example not found. Please create .env.local manually.")
    else:
        print("✅ .env.local file exists")
        if not src_env_local.exists():
            import shutil
            shutil.copy(env_local, src_env_local)
            print("   Copied .env.local to src/ directory")

def main():
    """Main installation function"""
    print("🚀 ARLook - Installation Script")
    print("=================================\n")
    print("📋 Checking prerequisites...\n")
    
    # Check Node.js
    node_ok, node_version = check_node_installed()
    if not node_ok:
        sys.exit(1)
    
    # Check npm
    npm_ok, npm_version = check_npm_installed()
    if not npm_ok:
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Setup environment file
    setup_env_file()
    
    print("\n=================================")
    print("✅ Installation complete!\n")
    print("Next steps:")
    print("  1. Edit .env.local and add your API keys")
    print("  2. Run: cd src && npm run dev")
    print("  3. Open: http://localhost:3000\n")
    print("For detailed setup instructions, see START_GUIDE.md\n")

if __name__ == "__main__":
    main()


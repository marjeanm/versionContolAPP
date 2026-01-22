#!/bin/bash

# Simple build script - creates portable package
# Does NOT require compiling Node.js!

echo "Building portable Living Docs package..."

# Create distribution directory
mkdir -p portable-dist/living-docs
mkdir -p portable-dist/living-docs/bin

# Copy all source files
cp -r src portable-dist/living-docs/
cp -r config portable-dist/living-docs/
cp package.json portable-dist/living-docs/
cp package-lock.json portable-dist/living-docs/
cp *.md portable-dist/living-docs/

# Create launcher script for Linux/Mac
cat > portable-dist/living-docs/bin/living-docs << 'EOF'
#!/bin/bash
# Living Docs Launcher

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js from: https://nodejs.org"
    exit 1
fi

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
APP_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Install dependencies if needed
if [ ! -d "$APP_DIR/node_modules" ]; then
    echo "Installing dependencies..."
    cd "$APP_DIR"
    npm install --production
fi

# Run the application
node "$APP_DIR/src/cli.js" "$@"
EOF

chmod +x portable-dist/living-docs/bin/living-docs

# Create launcher for Windows
cat > portable-dist/living-docs/bin/living-docs.cmd << 'EOF'
@echo off
REM Living Docs Launcher for Windows

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed.
    echo Please install Node.js from: https://nodejs.org
    exit /b 1
)

SET APP_DIR=%~dp0..

if not exist "%APP_DIR%\node_modules" (
    echo Installing dependencies...
    cd "%APP_DIR%"
    npm install --production
)

node "%APP_DIR%\src\cli.js" %*
EOF

# Create README
cat > portable-dist/living-docs/INSTALL.txt << 'EOF'
Living Docs - Portable Installation

REQUIREMENTS:
- Node.js 14+ must be installed on the target system
- Download from: https://nodejs.org

LINUX/MAC INSTALLATION:
1. Extract this folder anywhere
2. Run: ./bin/living-docs --help
3. (Optional) Add to PATH:
   sudo ln -s $(pwd)/bin/living-docs /usr/local/bin/living-docs

WINDOWS INSTALLATION:
1. Extract this folder anywhere
2. Open Command Prompt in this folder
3. Run: bin\living-docs.cmd --help
4. (Optional) Add bin\ to your PATH

USAGE:
  living-docs init              # Initialize project
  living-docs add "Doc" -c "Content"  # Add documentation
  living-docs list              # List chunks
  living-docs build             # Build master
  living-docs watch             # Start monitoring

For full documentation, see README.md
EOF

# Create archive
cd portable-dist
tar -czf ../living-docs-portable.tar.gz living-docs/
cd ..
zip -r living-docs-portable.zip portable-dist/living-docs/

echo ""
echo "✅ Portable packages created:"
echo "  - living-docs-portable.tar.gz (Linux/Mac)"
echo "  - living-docs-portable.zip (Windows)"
echo ""
echo "Size: $(du -h living-docs-portable.tar.gz | cut -f1)"
echo ""
echo "Users need Node.js installed, then:"
echo "  Extract → Run bin/living-docs"

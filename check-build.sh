#!/bin/bash

# Build Status Monitor
# Run this to check the build progress

OUTPUT_FILE="/tmp/claude/-home-user-versionContolAPP/tasks/b17988f.output"

echo "=== Living Docs Build Status ==="
echo ""

# Check if build is complete
if [ -f "dist/living-docs-linux" ] && [ -f "dist/living-docs-macos" ] && [ -f "dist/living-docs-win.exe" ]; then
    echo "✅ BUILD COMPLETE!"
    echo ""
    echo "Files created:"
    ls -lh dist/living-docs-* 2>/dev/null
    echo ""
    echo "Test the executables:"
    echo "  ./dist/living-docs-linux --version"
    exit 0
fi

# Check current status
echo "🔄 Build in progress..."
echo ""

# Show latest output
echo "Latest output (last 10 lines):"
echo "---"
tail -10 "$OUTPUT_FILE" 2>/dev/null
echo "---"
echo ""

# Check for compilation stage
if grep -q "CC(" "$OUTPUT_FILE" 2>/dev/null; then
    echo "Status: Compiling C/C++ code..."
    COMPILED=$(grep -c "CC(" "$OUTPUT_FILE" 2>/dev/null)
    echo "Compiled files: $COMPILED"
elif grep -q "Extracting" "$OUTPUT_FILE" 2>/dev/null; then
    echo "Status: Extracting source files..."
elif grep -q "Fetching" "$OUTPUT_FILE" 2>/dev/null; then
    echo "Status: Downloading dependencies..."
else
    echo "Status: Initializing build..."
fi

echo ""
echo "This typically takes 5-10 minutes total."
echo "Run this script again to check progress: ./check-build.sh"

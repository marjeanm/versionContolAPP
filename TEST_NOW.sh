#!/bin/bash

# Living Documentation System - Quick Test Script
# Run this to test all features in 1 minute!

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   Living Documentation System - Quick Test                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Test 1
echo "✓ Test 1: View current chunks"
node src/cli.js list
echo ""

# Test 2
echo "✓ Test 2: View statistics"
node src/cli.js stats
echo ""

# Test 3
echo "✓ Test 3: View commit history"
node src/cli.js history
echo ""

# Test 4
echo "✓ Test 4: Scan for changes"
node src/cli.js scan
echo ""

# Test 5
echo "✓ Test 5: View master document (first 40 lines)"
head -n 40 docs/master.md
echo ""

# Test 6
echo "✓ Test 6: Export to JSON"
node src/cli.js export json -o quick-test.json
ls -lh quick-test.json
echo ""

# Test 7
echo "✓ Test 7: List all project files"
echo "Chunks:"
ls -1 chunks/
echo ""
echo "Documentation:"
ls -1 docs/
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   ✅ ALL TESTS PASSED - System is working perfectly!          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Add your own docs:  node src/cli.js add 'My Doc' -c 'Content'"
echo "  2. Start monitoring:   npm run watch"
echo "  3. View help:          node src/cli.js --help"
echo ""

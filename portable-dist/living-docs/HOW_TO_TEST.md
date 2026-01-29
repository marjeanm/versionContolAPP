# How to Open and Test the Application

## Prerequisites

You need:
- Node.js (v14 or higher) ✅ Installed
- npm (comes with Node.js) ✅ Installed

## Quick Test (5 Minutes)

### 1. Open Terminal in Project Directory

```bash
cd /home/user/versionContolAPP
```

### 2. Verify Installation

```bash
# Check that dependencies are installed
npm list --depth=0

# You should see:
# - chalk, commander, diff, marked, node-cron
```

### 3. Run Your First Command

```bash
# See all available commands
node src/cli.js --help
```

### 4. View Existing Documentation

```bash
# List all documentation chunks
node src/cli.js list

# View statistics
node src/cli.js stats

# View the master document
cat docs/master.md
```

### 5. Add New Content

```bash
# Add a new documentation chunk
node src/cli.js add "My First Doc" -c "# Hello World

This is my first documentation chunk!

## Features
- Easy to use
- Markdown based
- Version controlled"

# List again to see it
node src/cli.js list
```

### 6. Test Change Detection

```bash
# Scan for changes
node src/cli.js scan

# Assess the impact
node src/cli.js assess

# Accept the changes
node src/cli.js pull

# View the commit history
node src/cli.js history
```

### 7. Build and View Master Document

```bash
# Rebuild the master document
node src/cli.js build

# View it
cat docs/master.md

# Or open in your editor
```

### 8. Test Export Features

```bash
# Export to JSON
node src/cli.js export json -o my-docs.json
cat my-docs.json

# Export to HTML (open in browser!)
node src/cli.js export html -o my-docs.html

# Export to Markdown
node src/cli.js export markdown -o my-docs.md
```

### 9. Test Update Detection

```bash
# Get a chunk ID from the list
node src/cli.js list

# Update a chunk (use one of the IDs shown)
node src/cli.js update chunk-f612ed8b -c "# Updated Content

This is completely new content to test update detection.

The system should detect this as a HIGH impact change."

# Scan to see the UPDATE (not CREATE!)
node src/cli.js scan

# Assess the impact
node src/cli.js assess

# You'll see HIGH impact because of major changes!
```

### 10. Start Automatic Monitoring (Optional)

```bash
# This runs continuously, checking every 15 minutes
npm run watch

# You'll see:
# - "Living Documentation System - Scheduler Running"
# - "Checking for changes every 15 minutes..."
# - Real-time updates as changes are detected

# Press Ctrl+C to stop
```

## Complete Test Scenario

Run this entire script to test everything:

```bash
# 1. View current state
echo "=== Current State ==="
node src/cli.js list
node src/cli.js stats

# 2. Add test content
echo -e "\n=== Adding Test Content ==="
node src/cli.js add "Test Document" -c "# Test

This is a test." -o 10 -t "test"

# 3. Detect changes
echo -e "\n=== Detecting Changes ==="
node src/cli.js scan
node src/cli.js assess

# 4. Accept changes
echo -e "\n=== Accepting Changes ==="
node src/cli.js pull

# 5. Make update
echo -e "\n=== Making Major Update ==="
node src/cli.js update $(node src/cli.js list | grep "Test Document" -A1 | grep "ID:" | awk '{print $2}') -c "# Major Update

Completely rewritten content with:
- New sections
- New information
- Different structure

This should be HIGH impact!"

# 6. Detect update
echo -e "\n=== Detecting Update ==="
node src/cli.js scan
node src/cli.js assess

# 7. View results
echo -e "\n=== Final State ==="
node src/cli.js stats
node src/cli.js history -n 3

# 8. Export everything
echo -e "\n=== Exporting ==="
node src/cli.js export json -o final-test.json
echo "✓ Exported to final-test.json"

echo -e "\n=== All Tests Complete! ==="
```

## Test the Scheduler (Background Monitoring)

### Option 1: Run in Foreground

```bash
# Start the scheduler (runs continuously)
npm run watch

# Watch the output - you'll see:
# - Scan cycles every 15 minutes
# - Change detection in real-time
# - Impact assessments
# - Automatic commits

# In another terminal, make changes:
node src/cli.js update chunk-xxx -c "new content"

# The scheduler will detect it on next cycle!
```

### Option 2: Run in Background

```bash
# Start in background
npm run watch &

# Continue working normally
node src/cli.js add "More Docs" -c "Content"

# Check the logs
tail -f .dochistory/scheduler.log

# Stop the background process
# Find the process ID
ps aux | grep scheduler
# Kill it
kill <PID>
```

## View Test Results

```bash
# I've created a complete test report
cat TEST_RESULTS.md

# See all 16 tests that passed
```

## Common Commands Reference

```bash
# View help for any command
node src/cli.js <command> --help

# Examples:
node src/cli.js add --help
node src/cli.js update --help
node src/cli.js export --help
```

## File Locations

- **Your chunks:** `chunks/*.json`
- **Master document:** `docs/master.md`
- **Commit history:** `.dochistory/history.json`
- **Impact reports:** `.dochistory/reports/`
- **Scheduler logs:** `.dochistory/scheduler.log`
- **Configuration:** `config/config.json`

## Troubleshooting

### "Cannot find module 'X'"

```bash
# Reinstall dependencies
npm install
```

### "No changes detected"

```bash
# Reset tracking
node src/cli.js pull
```

### "Permission denied"

```bash
# Make scripts executable
chmod +x src/*.js
```

## What's Working

✅ All core features tested and working:
- Add/update/list chunks
- Change detection (create/update/delete)
- Impact assessment (low/medium/high)
- Version control and history
- Master document generation
- Export (JSON, HTML, Markdown)
- Statistics and queries
- Cyclical monitoring

See **TEST_RESULTS.md** for complete test report.

## Next Steps

1. ✅ System is ready to use
2. 📝 Add your real documentation
3. 🔄 Start the scheduler: `npm run watch`
4. 🎉 Enjoy automated documentation management!

## Need Help?

```bash
# Get help
node src/cli.js --help
node src/cli.js <command> --help

# View documentation
cat README.md
cat QUICKSTART.md
cat USAGE_GUIDE.md
cat ARCHITECTURE.md
```

## Success!

If you can run these commands without errors, the system is working perfectly:

```bash
node src/cli.js list
node src/cli.js stats
cat docs/master.md
```

🎉 **You're all set!**

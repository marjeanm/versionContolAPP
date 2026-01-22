# Quick Start Guide

Get up and running with the Living Documentation System in 5 minutes!

## Installation

```bash
# 1. Clone and enter directory
cd versionContolAPP

# 2. Install dependencies
npm install

# 3. Initialize system
npm run init
```

## Basic Workflow

### Step 1: Add Your First Chunk

```bash
node src/cli.js add "Introduction" -c "# Introduction\n\nWelcome to our project!"
```

### Step 2: Add More Content

```bash
node src/cli.js add "Installation" -c "## Install\n\n\`\`\`bash\nnpm install\n\`\`\`" -o 1

node src/cli.js add "Usage" -c "## Usage\n\nRun the application..." -o 2
```

### Step 3: Build Master Document

```bash
node src/cli.js build
```

View the result:
```bash
cat docs/master.md
```

### Step 4: Make Changes

Edit any chunk file in `chunks/` directory, then:

```bash
# Scan for changes
node src/cli.js scan

# Assess impact
node src/cli.js assess

# Accept changes
node src/cli.js pull
```

### Step 5: Enable Auto-Monitoring

```bash
npm run watch
```

This will automatically:
- Check for changes every 15 minutes
- Create commits
- Update master document
- Generate impact reports

## Common Commands

```bash
# View all chunks
node src/cli.js list

# View statistics
node src/cli.js stats

# View history
node src/cli.js history

# Export to different formats
node src/cli.js export markdown -o output.md
node src/cli.js export json -o output.json
node src/cli.js export html -o output.html

# Import existing markdown
node src/cli.js import existing-doc.md

# Get help
node src/cli.js --help
```

## Example: Team Documentation

```bash
# Initialize
npm run init

# Create documentation structure
node src/cli.js add "Overview" -c "# Project Overview..." -o 0
node src/cli.js add "Architecture" -c "# Architecture..." -o 1
node src/cli.js add "API Reference" -c "# API..." -o 2
node src/cli.js add "Deployment" -c "# Deployment..." -o 3

# Build master
node src/cli.js build

# Start watching
npm run watch

# Team members can now:
# 1. Edit chunk files
# 2. Changes are detected automatically
# 3. Master document stays updated
```

## What's Next?

- Read the [full README](README.md) for complete features
- Check the [Usage Guide](USAGE_GUIDE.md) for detailed instructions
- View [Architecture](ARCHITECTURE.md) to understand the system

## Tips

1. **Keep chunks focused**: One topic per chunk
2. **Use order numbers**: Control the sequence with `-o`
3. **Tag your content**: Add tags with `-t` for organization
4. **Review impact reports**: Found in `.dochistory/reports/`
5. **Export regularly**: Create backups with export commands

## Troubleshooting

**Changes not detected?**
```bash
node src/cli.js list  # Verify chunks exist
node src/cli.js pull  # Reset tracking
```

**Need to reset?**
```bash
rm -rf .dochistory chunks docs
npm run init
```

**Want more help?**
```bash
node src/cli.js --help
node src/cli.js <command> --help
```

## Success!

You now have a working living documentation system. Your documentation will automatically stay in sync with changes, track full history, and assess impact of updates.

Happy documenting!

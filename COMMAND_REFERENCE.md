# Living Docs - Command Reference

Quick reference for all available commands.

## Core Commands

### Initialize Project
```bash
living-docs init
```
Creates directory structure and default configuration.

---

### Add Chunk
```bash
living-docs add <name> [file] [options]
```

**Options:**
- `-c, --content <content>` - Inline content (alternative to file)
- `-o, --order <number>` - Display order (default: 999)
- `-t, --tags <tags>` - Comma-separated tags

**Examples:**
```bash
# Add with inline content
living-docs add "Getting Started" -c "# Welcome..."

# Add from file
living-docs add "API Reference" api.md

# Add with metadata
living-docs add "Install Guide" -c "..." -o 1 -t "setup,beginner"
```

---

### Update Chunk
```bash
living-docs update <chunkId> [file] [options]
```

**Options:**
- `-c, --content <content>` - New content (alternative to file)

**Examples:**
```bash
# Update with inline content
living-docs update chunk-abc12345 -c "# Updated content..."

# Update from file
living-docs update chunk-abc12345 updated.md
```

---

### Delete Chunk
```bash
living-docs delete <chunkId> [options]
living-docs remove <chunkId> [options]  # Alias
living-docs rm <chunkId> [options]      # Alias
```

**Options:**
- `-f, --force` - Skip confirmation prompt (required)

**Examples:**
```bash
# View what will be deleted (shows info)
living-docs delete chunk-abc12345

# Actually delete (requires --force)
living-docs delete chunk-abc12345 --force

# Using aliases
living-docs rm chunk-abc12345 --force
```

**Safety:** The delete command requires `--force` to prevent accidental deletions.

---

### List Chunks
```bash
living-docs list
```

Shows all chunks with IDs, names, hashes, and timestamps.

---

### Build Master Document
```bash
living-docs build
```

Generates `docs/master.md` from all chunks in order.

---

## Change Management

### Scan for Changes
```bash
living-docs scan
```

Detects creates, updates, and deletes since last scan.

---

### Assess Impact
```bash
living-docs assess [options]
```

**Options:**
- `-r, --report` - Generate detailed markdown report

Analyzes impact of pending changes (low/medium/high).

**Examples:**
```bash
# Quick assessment
living-docs assess

# Generate detailed report
living-docs assess -r
```

---

### Pull Changes
```bash
living-docs pull [options]
```

**Options:**
- `--no-commit` - Don't create a commit
- `--no-build` - Don't rebuild master document

Accepts pending changes, creates commit, and updates master.

---

## History & Stats

### View History
```bash
living-docs history [options]
```

**Options:**
- `-n, --count <count>` - Number of commits to show (default: 10)
- `--chunk <chunkId>` - Show history for specific chunk

**Examples:**
```bash
# Last 10 commits
living-docs history

# Last 20 commits
living-docs history -n 20

# History for specific chunk
living-docs history --chunk chunk-abc12345
```

---

### View Statistics
```bash
living-docs stats
```

Shows:
- Total chunks
- Total commits and changes
- Change breakdown (create/update/delete)
- Impact distribution (high/medium/low)
- Scan statistics

---

## Import/Export

### Import Markdown
```bash
living-docs import <file>
```

Imports markdown file, splitting on `## ` headings into separate chunks.

**Example:**
```bash
living-docs import existing-docs.md
```

---

### Export
```bash
living-docs export <format> [options]
```

**Formats:**
- `markdown` - Export as markdown
- `json` - Export as JSON
- `html` - Export as styled HTML

**Options:**
- `-o, --output <path>` - Output file path

**Examples:**
```bash
# Export to JSON
living-docs export json -o docs.json

# Export to HTML
living-docs export html -o docs.html

# Export to Markdown
living-docs export markdown -o docs.md
```

---

## Automation

### Start Watcher
```bash
living-docs watch
```

Starts cyclical monitoring (default: every 15 minutes):
- Scans for changes
- Assesses impact
- Creates commits automatically
- Updates master document
- Generates impact reports

Press `Ctrl+C` to stop.

---

## Help

### General Help
```bash
living-docs --help
living-docs -h
```

### Command-Specific Help
```bash
living-docs <command> --help
```

**Examples:**
```bash
living-docs add --help
living-docs delete --help
living-docs export --help
```

---

## Common Workflows

### Daily Update Workflow
```bash
# 1. Check for changes
living-docs scan

# 2. Assess impact
living-docs assess

# 3. Accept changes
living-docs pull

# 4. View updated master
cat docs/master.md
```

### Delete and Update Workflow
```bash
# 1. List chunks to find ID
living-docs list

# 2. Delete unwanted chunk
living-docs delete chunk-xxx --force

# 3. Scan and pull
living-docs scan
living-docs pull

# 4. Rebuild
living-docs build
```

### Continuous Monitoring
```bash
# Start auto-monitoring
living-docs watch

# In another terminal, work as normal
living-docs add "New Doc" -c "..."
living-docs update chunk-yyy -c "..."

# Watcher automatically handles changes
```

---

## Tips

1. **Use `list` frequently** - Find chunk IDs easily
2. **Always use `--force` for delete** - Prevents accidents
3. **Review with `assess -r`** - Generate detailed reports before pulling
4. **Tag your chunks** - Use `-t` for better organization
5. **Set order explicitly** - Use `-o` to control sequence
6. **Export regularly** - Create backups with export commands
7. **Check logs** - View `.dochistory/scheduler.log` for watcher activity
8. **View history** - Use `history --chunk <id>` to track chunk changes

---

## File Locations

- **Chunks:** `chunks/*.json`
- **Master document:** `docs/master.md`
- **Commit history:** `.dochistory/history.json`
- **Commit snapshots:** `.dochistory/snapshots/`
- **Impact reports:** `.dochistory/reports/`
- **Scheduler logs:** `.dochistory/scheduler.log`
- **Configuration:** `config/config.json`

---

## Exit Codes

- `0` - Success
- `1` - Error (invalid input, file not found, etc.)

---

## Version

```bash
living-docs --version
living-docs -V
```

Current version: **1.0.0**

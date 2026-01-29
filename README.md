<<<<<<< Updated upstream
# Living Documentation System

A lightweight living documentation system that allows quick editing of content in modular chunks, with version control and cyclical change detection.

## Features

- **Modular Documentation**: Break your documentation into manageable chunks
- **Markdown-Based**: Use familiar markdown syntax for portability
- **Version Control**: Full history tracking similar to GitHub
- **Cyclical Checks**: Automatic scanning every 15 minutes for changes
- **Impact Assessment**: Analyze the impact of documentation updates
- **Master Document**: Automatically maintained consolidated view
- **Change Detection**: Track creates, updates, and deletes
- **CLI Interface**: Easy-to-use command-line interface
- **Export Options**: Export to Markdown, JSON, or HTML

## Installation

```bash
npm install
```

## Quick Start

### 1. Initialize the System

```bash
npm run init
# or
node src/init.js
```

This creates the necessary directory structure:
- `chunks/` - Individual documentation chunks
- `docs/` - Generated master documents and views
- `.dochistory/` - Version control and change history
- `config/` - Configuration files

### 2. Add Documentation Chunks

```bash
# Add a chunk with inline content
node src/cli.js add "Getting Started" -c "# Welcome to our docs"

# Add a chunk from a file
node src/cli.js add "API Reference" api-docs.md

# Add with metadata
node src/cli.js add "Installation" -c "## Install..." -o 1 -t "setup,guide"
```

### 3. Build Master Document

```bash
node src/cli.js build
```

This generates `docs/master.md` with all chunks combined.

### 4. Start Watching for Changes

```bash
npm run watch
# or
node src/cli.js watch
```

The system will now:
- Check for changes every 15 minutes
- Assess impact of changes
- Create commits automatically
- Update the master document
- Generate impact reports

## CLI Commands

### Core Commands

```bash
# Initialize system
node src/cli.js init

# Add new chunk
node src/cli.js add <name> [file] [options]
  -c, --content <content>    Inline content
  -o, --order <order>        Display order
  -t, --tags <tags>          Comma-separated tags

# Update chunk
node src/cli.js update <chunkId> [file] [options]
  -c, --content <content>    New content

# Delete chunk
node src/cli.js delete <chunkId> [options]
node src/cli.js remove <chunkId>  # Alias
node src/cli.js rm <chunkId>      # Alias
  -f, --force                Force deletion without confirmation

# List all chunks
node src/cli.js list

# Build master document
node src/cli.js build
```

### Change Management

```bash
# Scan for changes
node src/cli.js scan

# Assess impact
node src/cli.js assess
node src/cli.js assess -r  # Generate detailed report

# Pull/accept changes
node src/cli.js pull
node src/cli.js pull --no-commit  # Don't create commit
node src/cli.js pull --no-build   # Don't rebuild master
```

### History & Statistics

```bash
# View commit history
node src/cli.js history
node src/cli.js history -n 20           # Show 20 commits
node src/cli.js history --chunk <id>    # Show chunk history

# View statistics
node src/cli.js stats
```

### Import/Export

```bash
# Import markdown file
node src/cli.js import <file>

# Export master document
node src/cli.js export markdown -o output.md
node src/cli.js export json -o output.json
node src/cli.js export html -o output.html
```

### Watching

```bash
# Start cyclical checker (every 15 minutes)
node src/cli.js watch
```

## Workflow Example

### Daily Usage

1. **Morning**: Check for changes
   ```bash
   node src/cli.js scan
   node src/cli.js assess -r
   ```

2. **Edit Documentation**: Edit chunk files in `chunks/` directory

3. **Review Changes**:
   ```bash
   node src/cli.js scan
   node src/cli.js assess
   ```

4. **Accept Changes**:
   ```bash
   node src/cli.js pull
   ```

5. **View Updated Master**:
   ```bash
   cat docs/master.md
   ```

### Continuous Monitoring

Run the scheduler for automatic monitoring:

```bash
npm run watch
```

This will:
- Monitor chunks every 15 minutes
- Detect all changes (create/update/delete)
- Assess impact (low/medium/high)
- Create commits automatically
- Update master document
- Generate impact reports in `.dochistory/reports/`

## Architecture

### Directory Structure

```
versionContolAPP/
├── chunks/              # Documentation chunks (JSON)
│   └── chunk-*.json    # Individual chunks
├── docs/               # Generated documentation
│   ├── master.md       # Master document
│   └── views/          # Filtered views
├── .dochistory/        # Version control
│   ├── snapshots/      # Commit snapshots
│   ├── changes/        # Change records
│   ├── reports/        # Impact reports
│   ├── history.json    # Commit history
│   ├── tracking.json   # Change tracking
│   └── lastscan.json   # Scan metadata
├── config/             # Configuration
│   └── config.json     # System config
└── src/                # Source code
    ├── cli.js          # CLI interface
    ├── documentManager.js
    ├── changeDetector.js
    ├── impactAssessment.js
    ├── versionControl.js
    ├── masterView.js
    ├── scheduler.js
    └── init.js
```

### Core Modules

1. **DocumentManager**: Manages chunks and master document
2. **ChangeDetector**: Scans for and detects changes
3. **ImpactAssessment**: Analyzes impact of changes
4. **VersionControl**: Tracks history and commits
5. **MasterView**: Generates and manages views
6. **Scheduler**: Cyclical change detection

## Configuration

Edit `config/config.json`:

```json
{
  "interval": "*/15 * * * *",  // Cron expression (15 minutes)
  "autoCommit": true,           // Auto-create commits
  "autoUpdate": true,           // Auto-update master
  "chunksDir": "chunks",
  "docsDir": "docs",
  "historyDir": ".dochistory",
  "masterFile": "docs/master.md"
}
```

### Cron Interval Examples

- `*/15 * * * *` - Every 15 minutes
- `*/5 * * * *` - Every 5 minutes
- `0 * * * *` - Every hour
- `0 */4 * * *` - Every 4 hours

## Impact Assessment

The system automatically assesses the impact of changes:

- **Low Impact** (0-39): Minor text changes, typos
- **Medium Impact** (40-69): Section updates, new content
- **High Impact** (70-100): Major rewrites, deletions, structural changes

Factors considered:
- Percentage of content changed
- Headings modified
- Links changed
- Code blocks updated
- Metadata changes

## Version Control

Every change is tracked with:
- Unique commit ID
- Timestamp
- Author
- Change type (create/update/delete)
- Before/after snapshots
- Impact level

View history:
```bash
node src/cli.js history
```

## Best Practices

1. **Modular Chunks**: Keep chunks focused on single topics
2. **Meaningful Names**: Use descriptive chunk names
3. **Regular Pulls**: Accept changes regularly to avoid conflicts
4. **Review Impact Reports**: Check `.dochistory/reports/` periodically
5. **Tag Appropriately**: Use tags for better organization
6. **Set Order**: Use `-o` flag to control chunk order in master

## Troubleshooting

### No changes detected
- Ensure chunks are in `chunks/` directory
- Check that files are valid JSON
- Run `node src/cli.js list` to see tracked chunks

### Scheduler not running
- Check that node-cron is installed
- Verify cron expression in config
- Check `.dochistory/scheduler.log` for errors

### Master document not updating
- Run `node src/cli.js build` manually
- Check `autoUpdate` in config
- Verify write permissions on `docs/` directory

## License

MIT

## Contributing

Contributions welcome! Please submit issues and pull requests.
=======
﻿# Living Documentation SystemA lightweight living documentation system that allows quick editing of content in modular chunks, with version control and cyclical change detection.## Features- **Modular Documentation**: Break your documentation into manageable chunks- **Markdown-Based**: Use familiar markdown syntax for portability- **Version Control**: Full history tracking similar to GitHub- **Cyclical Checks**: Automatic scanning every 15 minutes for changes- **Impact Assessment**: Analyze the impact of documentation updates- **Master Document**: Automatically maintained consolidated view- **Change Detection**: Track creates, updates, and deletes- **CLI Interface**: Easy-to-use command-line interface- **Export Options**: Export to Markdown, JSON, or HTML## Installation```bashnpm install```## Quick Start### 1. Initialize the System```bashnpm run init# ornode src/init.js```This creates the necessary directory structure:- `chunks/` - Individual documentation chunks- `docs/` - Generated master documents and views- `.dochistory/` - Version control and change history- `config/` - Configuration files### 2. Add Documentation Chunks```bash# Add a chunk with inline contentnode src/cli.js add "Getting Started" -c "# Welcome to our docs"# Add a chunk from a filenode src/cli.js add "API Reference" api-docs.md# Add with metadatanode src/cli.js add "Installation" -c "## Install..." -o 1 -t "setup,guide"```### 3. Build Master Document```bashnode src/cli.js build```This generates `docs/master.md` with all chunks combined.### 4. Start Watching for Changes```bashnpm run watch# ornode src/cli.js watch```The system will now:- Check for changes every 15 minutes- Assess impact of changes- Create commits automatically- Update the master document- Generate impact reports## CLI Commands### Core Commands```bash# Initialize systemnode src/cli.js init# Add new chunknode src/cli.js add <name> [file] [options]  -c, --content <content>    Inline content  -o, --order <order>        Display order  -t, --tags <tags>          Comma-separated tags# Update chunknode src/cli.js update <chunkId> [file] [options]  -c, --content <content>    New content# List all chunksnode src/cli.js list# Build master documentnode src/cli.js build```### Change Management```bash# Scan for changesnode src/cli.js scan# Assess impactnode src/cli.js assessnode src/cli.js assess -r  # Generate detailed report# Pull/accept changesnode src/cli.js pullnode src/cli.js pull --no-commit  # Don't create commitnode src/cli.js pull --no-build   # Don't rebuild master```### History & Statistics```bash# View commit historynode src/cli.js historynode src/cli.js history -n 20           # Show 20 commitsnode src/cli.js history --chunk <id>    # Show chunk history# View statisticsnode src/cli.js stats```### Import/Export```bash# Import markdown filenode src/cli.js import <file># Export master documentnode src/cli.js export markdown -o output.mdnode src/cli.js export json -o output.jsonnode src/cli.js export html -o output.html```### Watching```bash# Start cyclical checker (every 15 minutes)node src/cli.js watch```## Workflow Example### Daily Usage1. **Morning**: Check for changes   ```bash   node src/cli.js scan   node src/cli.js assess -r   ```2. **Edit Documentation**: Edit chunk files in `chunks/` directory3. **Review Changes**:   ```bash   node src/cli.js scan   node src/cli.js assess   ```4. **Accept Changes**:   ```bash   node src/cli.js pull   ```5. **View Updated Master**:   ```bash   cat docs/master.md   ```### Continuous MonitoringRun the scheduler for automatic monitoring:```bashnpm run watch```This will:- Monitor chunks every 15 minutes- Detect all changes (create/update/delete)- Assess impact (low/medium/high)- Create commits automatically- Update master document- Generate impact reports in `.dochistory/reports/`## Architecture### Directory Structure```versionContolAPP/├── chunks/              # Documentation chunks (JSON)│   └── chunk-*.json    # Individual chunks├── docs/               # Generated documentation│   ├── master.md       # Master document│   └── views/          # Filtered views├── .dochistory/        # Version control│   ├── snapshots/      # Commit snapshots│   ├── changes/        # Change records│   ├── reports/        # Impact reports│   ├── history.json    # Commit history│   ├── tracking.json   # Change tracking│   └── lastscan.json   # Scan metadata├── config/             # Configuration│   └── config.json     # System config└── src/                # Source code    ├── cli.js          # CLI interface    ├── documentManager.js    ├── changeDetector.js    ├── impactAssessment.js    ├── versionControl.js    ├── masterView.js    ├── scheduler.js    └── init.js```### Core Modules1. **DocumentManager**: Manages chunks and master document2. **ChangeDetector**: Scans for and detects changes3. **ImpactAssessment**: Analyzes impact of changes4. **VersionControl**: Tracks history and commits5. **MasterView**: Generates and manages views6. **Scheduler**: Cyclical change detection## ConfigurationEdit `config/config.json`:```json{  "interval": "*/15 * * * *",  // Cron expression (15 minutes)  "autoCommit": true,           // Auto-create commits  "autoUpdate": true,           // Auto-update master  "chunksDir": "chunks",  "docsDir": "docs",  "historyDir": ".dochistory",  "masterFile": "docs/master.md"}```### Cron Interval Examples- `*/15 * * * *` - Every 15 minutes- `*/5 * * * *` - Every 5 minutes- `0 * * * *` - Every hour- `0 */4 * * *` - Every 4 hours## Impact AssessmentThe system automatically assesses the impact of changes:- **Low Impact** (0-39): Minor text changes, typos- **Medium Impact** (40-69): Section updates, new content- **High Impact** (70-100): Major rewrites, deletions, structural changesFactors considered:- Percentage of content changed- Headings modified- Links changed- Code blocks updated- Metadata changes## Version ControlEvery change is tracked with:- Unique commit ID- Timestamp- Author- Change type (create/update/delete)- Before/after snapshots- Impact levelView history:```bashnode src/cli.js history```## Best Practices1. **Modular Chunks**: Keep chunks focused on single topics2. **Meaningful Names**: Use descriptive chunk names3. **Regular Pulls**: Accept changes regularly to avoid conflicts4. **Review Impact Reports**: Check `.dochistory/reports/` periodically5. **Tag Appropriately**: Use tags for better organization6. **Set Order**: Use `-o` flag to control chunk order in master## Troubleshooting### No changes detected- Ensure chunks are in `chunks/` directory- Check that files are valid JSON- Run `node src/cli.js list` to see tracked chunks### Scheduler not running- Check that node-cron is installed- Verify cron expression in config- Check `.dochistory/scheduler.log` for errors### Master document not updating- Run `node src/cli.js build` manually- Check `autoUpdate` in config- Verify write permissions on `docs/` directory## LicenseMIT## ContributingContributions welcome! Please submit issues and pull requests.
>>>>>>> Stashed changes

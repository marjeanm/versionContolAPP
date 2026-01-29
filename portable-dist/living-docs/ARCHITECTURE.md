# Living Documentation System - Architecture

## Overview

The Living Documentation System is a modular, event-driven documentation management system built on Node.js. It provides version control, change detection, impact assessment, and automatic synchronization for markdown-based documentation.

## System Design

### Core Principles

1. **Modularity**: Documentation is broken into independent chunks
2. **Portability**: Uses standard markdown format
3. **Version Control**: Complete history tracking like Git
4. **Automation**: Cyclical monitoring and updates
5. **Impact Awareness**: Intelligent assessment of changes

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLI Interface                        │
│                         (cli.js)                             │
└──────────────┬──────────────────────────────────────────────┘
               │
               ├─────────────────────────────────────────────┐
               │                                             │
               ▼                                             ▼
┌──────────────────────────┐                  ┌─────────────────────────┐
│    Document Manager      │                  │       Scheduler         │
│  (documentManager.js)    │                  │    (scheduler.js)       │
│                          │                  │                         │
│  - Create chunks         │                  │  - Cron-based           │
│  - Update chunks         │                  │  - Every 15 min         │
│  - Generate master       │                  │  - Orchestration        │
│  - Import/Export         │                  └────────┬────────────────┘
└──────────┬───────────────┘                           │
           │                                           │
           │                   ┌───────────────────────┤
           │                   │                       │
           ▼                   ▼                       ▼
┌──────────────────┐  ┌────────────────────┐  ┌──────────────────────┐
│ Change Detector  │  │ Impact Assessment  │  │  Version Control     │
│(changeDetector.js)│  │(impactAssessment.js)│  │(versionControl.js)   │
│                  │  │                    │  │                      │
│  - Scan changes  │  │  - Assess impact   │  │  - Track commits     │
│  - Track state   │  │  - Score changes   │  │  - Store snapshots   │
│  - File watching │  │  - Generate reports│  │  - History queries   │
└──────────────────┘  └────────────────────┘  └──────────────────────┘
           │                   │                       │
           └───────────────────┴───────────────────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │    Master View     │
                    │  (masterView.js)   │
                    │                    │
                    │  - Build master    │
                    │  - Create views    │
                    │  - Export formats  │
                    └────────────────────┘
                               │
                               ▼
                    ┌────────────────────┐
                    │   File System      │
                    │                    │
                    │  chunks/           │
                    │  docs/             │
                    │  .dochistory/      │
                    └────────────────────┘
```

## Module Details

### 1. Document Manager (documentManager.js)

**Purpose**: Core document operations

**Responsibilities**:
- Create, read, update, delete chunks
- Generate master document
- Import markdown files
- Parse markdown sections
- Manage chunk metadata

**Key Methods**:
- `createChunk(name, content, metadata)`: Create new chunk
- `updateChunk(chunkId, content)`: Update existing chunk
- `getAllChunks()`: Retrieve all chunks
- `generateMasterDocument()`: Build master from chunks
- `importMarkdown(filePath)`: Import markdown file

**Data Structure** (Chunk):
```javascript
{
  id: "chunk-abc12345",
  name: "Introduction",
  content: "markdown content",
  metadata: {
    createdAt: "ISO timestamp",
    updatedAt: "ISO timestamp",
    order: 0,
    tags: ["tag1", "tag2"]
  },
  hash: "sha256 hash",
  previousHash: "previous hash (if updated)"
}
```

### 2. Change Detector (changeDetector.js)

**Purpose**: Monitor and detect changes

**Responsibilities**:
- Scan chunk directory
- Compare current vs tracked state
- Identify creates, updates, deletes
- Track scan history
- File system watching

**Key Methods**:
- `scan()`: Full scan for changes
- `detectChanges()`: Non-destructive scan
- `acceptChanges()`: Update tracking state
- `getCurrentChunks()`: Get current state
- `watch(callback)`: Real-time file watching

**Change Object**:
```javascript
{
  type: "create|update|delete",
  chunkId: "chunk-abc",
  chunkName: "Name",
  before: { /* previous state */ },
  after: { /* new state */ },
  timestamp: "ISO timestamp"
}
```

### 3. Impact Assessment (impactAssessment.js)

**Purpose**: Analyze change impact

**Responsibilities**:
- Calculate impact scores
- Classify impact levels
- Detect structural changes
- Generate impact reports
- Provide recommendations

**Key Methods**:
- `assessChange(change)`: Assess single change
- `assessChanges(changes)`: Assess multiple changes
- `generateReport(assessment)`: Create markdown report
- `detectStructuralChanges(before, after)`: Analyze structure

**Impact Levels**:
- **Low** (0-39): Minor changes, typos
- **Medium** (40-69): Moderate updates, new content
- **High** (70-100): Major rewrites, deletions

**Scoring Factors**:
- Change percentage
- Headings modified
- Links changed
- Code blocks updated
- Metadata changes

### 4. Version Control (versionControl.js)

**Purpose**: Track history and commits

**Responsibilities**:
- Create commits
- Store snapshots
- Query history
- Calculate diffs
- Export history

**Key Methods**:
- `commit(message, changes, author)`: Create commit
- `getHistory()`: Get all commits
- `getChunkHistory(chunkId)`: Chunk-specific history
- `getSnapshot(commitId)`: Retrieve snapshot
- `getDiff(commitId1, commitId2)`: Compare commits

**Commit Structure**:
```javascript
{
  id: "timestamp-random",
  message: "Commit message",
  author: "user|scheduler|system",
  timestamp: "ISO timestamp",
  changes: [
    {
      chunkId: "chunk-abc",
      chunkName: "Name",
      type: "create|update|delete",
      impact: "low|medium|high",
      before: { /* state */ },
      after: { /* state */ }
    }
  ]
}
```

### 5. Master View (masterView.js)

**Purpose**: Generate and manage views

**Responsibilities**:
- Build master document
- Create filtered views
- Export to various formats
- Search functionality
- Table of contents generation

**Key Methods**:
- `getMasterView()`: Get current master
- `updateMasterView(chunks)`: Rebuild master
- `createFilteredView(name, filter)`: Custom view
- `exportView(format, outputPath)`: Export to format
- `search(query)`: Search content

**Supported Formats**:
- Markdown (.md)
- JSON (.json)
- HTML (.html)

### 6. Scheduler (scheduler.js)

**Purpose**: Automate cyclical checks

**Responsibilities**:
- Run periodic scans (every 15 minutes)
- Orchestrate workflow
- Create automatic commits
- Update master document
- Generate reports
- Log activity

**Key Methods**:
- `start()`: Start scheduler
- `runCycle()`: Execute one cycle
- `getStatus()`: Get scheduler status

**Workflow per Cycle**:
1. Scan for changes
2. Assess impact
3. Create commit (if auto-commit enabled)
4. Accept changes
5. Update master (if auto-update enabled)
6. Generate impact report
7. Log results

### 7. CLI Interface (cli.js)

**Purpose**: User interaction

**Responsibilities**:
- Parse commands
- Display output
- Handle errors
- Provide help

**Commands**:
- `init`: Initialize system
- `add`: Add chunk
- `update`: Update chunk
- `list`: List chunks
- `build`: Build master
- `scan`: Scan changes
- `assess`: Assess impact
- `pull`: Accept changes
- `history`: View history
- `stats`: View statistics
- `watch`: Start scheduler
- `import`: Import markdown
- `export`: Export document

## Data Flow

### 1. Creating a Chunk

```
User Command
    ↓
CLI parses input
    ↓
DocumentManager.createChunk()
    ↓
Generate chunk ID and hash
    ↓
Write JSON to chunks/
    ↓
Return chunk object
```

### 2. Scanning for Changes

```
Trigger (scheduler or manual)
    ↓
ChangeDetector.scan()
    ↓
getCurrentChunks() - read chunks/
    ↓
getTracking() - read .dochistory/tracking.json
    ↓
Compare current vs tracked
    ↓
Identify creates, updates, deletes
    ↓
Return changes array
```

### 3. Assessing Impact

```
Changes detected
    ↓
ImpactAssessment.assessChanges()
    ↓
For each change:
  - Calculate change percentage
  - Detect structural changes
  - Compute score
  - Assign level
    ↓
Calculate overall impact
    ↓
Return assessment result
```

### 4. Creating a Commit

```
Changes + Assessment
    ↓
VersionControl.commit()
    ↓
Generate commit ID
    ↓
Create commit object
    ↓
Save snapshot to .dochistory/snapshots/
    ↓
Update history.json
    ↓
Return commit object
```

### 5. Building Master Document

```
Trigger (manual or auto)
    ↓
DocumentManager.generateMasterDocument()
    ↓
getAllChunks()
    ↓
Sort by order
    ↓
Build markdown:
  - Header
  - Table of contents
  - Content sections
  - Footer
    ↓
Write to docs/master.md
    ↓
Return content
```

## File System Structure

```
versionContolAPP/
├── chunks/                      # Chunk storage
│   ├── chunk-abc12345.json     # Individual chunks
│   └── chunk-xyz67890.json
│
├── docs/                        # Generated docs
│   ├── master.md               # Master document
│   ├── export.md/json/html     # Exports
│   └── views/                  # Filtered views
│       ├── tag-security.md
│       └── daterange-*.md
│
├── .dochistory/                # Version control
│   ├── snapshots/              # Commit snapshots
│   │   └── <commit-id>.json
│   ├── changes/                # Change records
│   ├── reports/                # Impact reports
│   │   └── impact-<timestamp>.md
│   ├── history.json            # Commit history
│   ├── tracking.json           # Current tracked state
│   ├── lastscan.json           # Scan metadata
│   └── scheduler.log           # Scheduler logs
│
├── config/                     # Configuration
│   └── config.json
│
├── src/                        # Source code
│   ├── cli.js                  # CLI interface
│   ├── documentManager.js      # Document operations
│   ├── changeDetector.js       # Change detection
│   ├── impactAssessment.js     # Impact analysis
│   ├── versionControl.js       # Version control
│   ├── masterView.js           # View generation
│   ├── scheduler.js            # Automation
│   └── init.js                 # Initialization
│
├── package.json                # Dependencies
├── README.md                   # Main documentation
├── USAGE_GUIDE.md              # Usage instructions
├── ARCHITECTURE.md             # This file
└── .gitignore                  # Git ignore rules
```

## Configuration

### config.json

```json
{
  "interval": "*/15 * * * *",     // Cron expression
  "autoCommit": true,              // Auto-create commits
  "autoUpdate": true,              // Auto-update master
  "chunksDir": "chunks",           // Chunk directory
  "docsDir": "docs",               // Docs directory
  "historyDir": ".dochistory",     // History directory
  "masterFile": "docs/master.md"   // Master file path
}
```

## Dependencies

- **commander**: CLI framework
- **chalk**: Terminal colors
- **marked**: Markdown parser
- **diff**: Text diffing
- **node-cron**: Cron scheduler

## Performance Considerations

### Scalability

- **Chunks**: Tested with 1000+ chunks
- **History**: Keeps last 1000 commits in memory
- **Snapshots**: Stored separately on disk
- **Reports**: Generated on demand

### Optimization

- Hash-based change detection (fast)
- Lazy loading of snapshots
- Incremental updates
- Efficient file operations

### Memory Usage

- Minimal in-memory storage
- File-based persistence
- Streaming for large files
- Cleanup of old reports

## Security Considerations

1. **Input Validation**: All user inputs validated
2. **File System**: Restricted to project directory
3. **No Remote Access**: Local-only system
4. **Git Integration**: Standard git security applies

## Extension Points

### Custom Impact Scoring

Modify `impactAssessment.js`:
```javascript
assessUpdate(change) {
  // Add custom scoring logic
  if (customCondition) {
    score += customPoints;
  }
}
```

### Custom Views

Extend `masterView.js`:
```javascript
createCustomView(criteria) {
  return this.createFilteredView('custom', chunk => {
    return customFilter(chunk, criteria);
  });
}
```

### Additional Formats

Add export formats in `masterView.js`:
```javascript
exportView(format, outputPath) {
  if (format === 'pdf') {
    // PDF generation logic
  }
}
```

### Event Hooks

Add hooks in `scheduler.js`:
```javascript
runCycle() {
  // Before hook
  await this.beforeScan?.();

  // Scan logic

  // After hook
  await this.afterScan?.(changes);
}
```

## Testing Strategy

### Unit Tests

- Test each module independently
- Mock file system operations
- Validate data structures
- Test edge cases

### Integration Tests

- Test module interactions
- Full workflow tests
- File system integration
- Scheduler cycles

### Manual Tests

- CLI command validation
- User workflow scenarios
- Error handling
- Performance benchmarks

## Troubleshooting

### Common Issues

1. **Tracking out of sync**: Run `pull` to reset
2. **Scheduler not running**: Check cron expression
3. **Master not updating**: Verify `autoUpdate` config
4. **High memory usage**: Clean old reports

### Debug Mode

Enable verbose logging:
```bash
DEBUG=living-docs:* node src/cli.js <command>
```

## Future Enhancements

1. **Collaboration**: Multi-user support
2. **Conflict Resolution**: Merge strategies
3. **Branch Support**: Multiple doc versions
4. **Web UI**: Browser interface
5. **Real-time Sync**: WebSocket updates
6. **Plugins**: Extension system
7. **Cloud Storage**: Remote backups
8. **AI Suggestions**: Smart editing

## Conclusion

The Living Documentation System provides a robust, automated solution for managing modular documentation with version control and intelligent change tracking. Its modular architecture allows for easy extension and customization while maintaining simplicity and performance.

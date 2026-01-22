#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Initialize the Living Documentation System
 */
function init() {
  console.log('Initializing Living Documentation System...\n');

  const baseDir = process.cwd();
  const directories = [
    'chunks',
    'docs',
    'docs/views',
    '.dochistory',
    '.dochistory/snapshots',
    '.dochistory/changes',
    '.dochistory/reports',
    'config'
  ];

  // Create directories
  directories.forEach(dir => {
    const dirPath = path.join(baseDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✓ Created ${dir}/`);
    } else {
      console.log(`  ${dir}/ already exists`);
    }
  });

  // Create default configuration
  const configPath = path.join(baseDir, 'config', 'config.json');
  if (!fs.existsSync(configPath)) {
    const config = {
      interval: '*/15 * * * *',
      autoCommit: true,
      autoUpdate: true,
      chunksDir: path.join(baseDir, 'chunks'),
      docsDir: path.join(baseDir, 'docs'),
      historyDir: path.join(baseDir, '.dochistory'),
      masterFile: path.join(baseDir, 'docs', 'master.md')
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('✓ Created config/config.json');
  }

  // Create .gitignore
  const gitignorePath = path.join(baseDir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    const gitignore = `# Living Documentation System
.dochistory/
node_modules/
*.log
`;
    fs.writeFileSync(gitignorePath, gitignore);
    console.log('✓ Created .gitignore');
  }

  // Create example chunk
  const exampleChunkPath = path.join(baseDir, 'chunks');
  if (fs.existsSync(exampleChunkPath) && fs.readdirSync(exampleChunkPath).length === 0) {
    const DocumentManager = require('./documentManager');
    const docManager = new DocumentManager();

    const exampleContent = `This is an example documentation chunk.

You can write markdown here:
- Lists
- **Bold text**
- *Italic text*
- \`code\`

## Subsections

Add subsections as needed.

### Code Examples

\`\`\`javascript
const example = 'Hello, World!';
console.log(example);
\`\`\`

Edit this chunk or create new ones to build your documentation.
`;

    docManager.createChunk('Getting Started', exampleContent, { order: 0 });
    console.log('✓ Created example chunk');
  }

  // Initialize tracking
  const trackingPath = path.join(baseDir, '.dochistory', 'tracking.json');
  if (!fs.existsSync(trackingPath)) {
    fs.writeFileSync(trackingPath, JSON.stringify({ chunks: {} }, null, 2));
    console.log('✓ Initialized tracking');
  }

  // Initialize history
  const historyPath = path.join(baseDir, '.dochistory', 'history.json');
  if (!fs.existsSync(historyPath)) {
    fs.writeFileSync(historyPath, JSON.stringify({ commits: [] }, null, 2));
    console.log('✓ Initialized history');
  }

  // Initialize last scan
  const lastScanPath = path.join(baseDir, '.dochistory', 'lastscan.json');
  if (!fs.existsSync(lastScanPath)) {
    fs.writeFileSync(lastScanPath, JSON.stringify({ lastScan: null, scanCount: 0 }, null, 2));
    console.log('✓ Initialized scan tracking');
  }

  console.log('\n✓ Living Documentation System initialized successfully!\n');
  console.log('Next steps:');
  console.log('  1. Add documentation chunks:');
  console.log('     node src/cli.js add "My Topic" -c "Content here"');
  console.log('  2. Build master document:');
  console.log('     node src/cli.js build');
  console.log('  3. Start watching for changes:');
  console.log('     node src/cli.js watch');
  console.log('\nFor more commands, run: node src/cli.js --help\n');
}

if (require.main === module) {
  init();
}

module.exports = init;

#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const DocumentManager = require('./documentManager');
const ChangeDetector = require('./changeDetector');
const ImpactAssessment = require('./impactAssessment');
const VersionControl = require('./versionControl');
const MasterView = require('./masterView');
const Scheduler = require('./scheduler');
const fs = require('fs');
const path = require('path');

const program = new Command();

// Initialize managers
const docManager = new DocumentManager();
const changeDetector = new ChangeDetector();
const impactAssessment = new ImpactAssessment();
const versionControl = new VersionControl();
const masterView = new MasterView();

program
  .name('living-docs')
  .description('Lightweight living documentation system with version control')
  .version('1.0.0');

// Initialize command
program
  .command('init')
  .description('Initialize a new living documentation project')
  .action(() => {
    console.log(chalk.blue('Initializing living documentation system...'));

    const dirs = ['chunks', 'docs', '.dochistory', 'config'];
    dirs.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(chalk.green(`✓ Created ${dir}/ directory`));
      }
    });

    // Create default config
    const configPath = path.join(process.cwd(), 'config', 'config.json');
    if (!fs.existsSync(configPath)) {
      const defaultConfig = {
        interval: '*/15 * * * *',
        autoCommit: true,
        autoUpdate: true,
        chunksDir: path.join(process.cwd(), 'chunks'),
        docsDir: path.join(process.cwd(), 'docs'),
        historyDir: path.join(process.cwd(), '.dochistory')
      };
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
      console.log(chalk.green('✓ Created default configuration'));
    }

    // Initialize tracking
    changeDetector.updateTracking();

    console.log(chalk.green('\n✓ Living documentation system initialized!'));
    console.log(chalk.gray('\nNext steps:'));
    console.log(chalk.gray('  1. Add chunks: living-docs add <name> <file>'));
    console.log(chalk.gray('  2. Generate master: living-docs build'));
    console.log(chalk.gray('  3. Start watching: living-docs watch'));
  });

// Add chunk command
program
  .command('add <name> [file]')
  .description('Add a new documentation chunk')
  .option('-c, --content <content>', 'Content of the chunk')
  .option('-o, --order <order>', 'Display order')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .action((name, file, options) => {
    let content = options.content || '';

    if (file && fs.existsSync(file)) {
      content = fs.readFileSync(file, 'utf8');
    }

    if (!content) {
      console.log(chalk.red('Error: No content provided'));
      process.exit(1);
    }

    const metadata = {};
    if (options.order) metadata.order = parseInt(options.order);
    if (options.tags) metadata.tags = options.tags.split(',').map(t => t.trim());

    const chunk = docManager.createChunk(name, content, metadata);
    console.log(chalk.green(`✓ Chunk created: ${chunk.id}`));
    console.log(chalk.gray(`  Name: ${chunk.name}`));
    console.log(chalk.gray(`  Hash: ${chunk.hash.substring(0, 12)}...`));
  });

// Update chunk command
program
  .command('update <chunkId> [file]')
  .description('Update an existing chunk')
  .option('-c, --content <content>', 'New content')
  .action((chunkId, file, options) => {
    let content = options.content || '';

    if (file && fs.existsSync(file)) {
      content = fs.readFileSync(file, 'utf8');
    }

    if (!content) {
      console.log(chalk.red('Error: No content provided'));
      process.exit(1);
    }

    const result = docManager.updateChunk(chunkId, content);

    if (result.changed) {
      console.log(chalk.green(`✓ Chunk updated: ${chunkId}`));
      console.log(chalk.gray(`  Old hash: ${result.oldChunk.hash.substring(0, 12)}...`));
      console.log(chalk.gray(`  New hash: ${result.chunk.hash.substring(0, 12)}...`));
    } else {
      console.log(chalk.yellow('⚠ No changes detected'));
    }
  });

// List chunks command
program
  .command('list')
  .description('List all chunks')
  .action(() => {
    const chunks = docManager.getAllChunks();

    if (chunks.length === 0) {
      console.log(chalk.yellow('No chunks found'));
      return;
    }

    console.log(chalk.blue(`\nFound ${chunks.length} chunk(s):\n`));

    chunks.forEach((chunk, index) => {
      console.log(chalk.green(`${index + 1}. ${chunk.name}`));
      console.log(chalk.gray(`   ID: ${chunk.id}`));
      console.log(chalk.gray(`   Hash: ${chunk.hash.substring(0, 12)}...`));
      console.log(chalk.gray(`   Updated: ${chunk.metadata.updatedAt}`));
      console.log();
    });
  });

// Build master document
program
  .command('build')
  .description('Generate master document from chunks')
  .action(() => {
    console.log(chalk.blue('Building master document...'));

    docManager.generateMasterDocument();

    const chunks = docManager.getAllChunks();
    console.log(chalk.green(`✓ Master document generated with ${chunks.length} chunks`));
    console.log(chalk.gray(`  Output: ${path.join(process.cwd(), 'docs', 'master.md')}`));
  });

// Scan for changes
program
  .command('scan')
  .description('Scan for changes in chunks')
  .action(() => {
    console.log(chalk.blue('Scanning for changes...\n'));

    const changes = changeDetector.detectChanges();

    if (changes.length === 0) {
      console.log(chalk.green('✓ No changes detected'));
      return;
    }

    console.log(chalk.yellow(`Found ${changes.length} change(s):\n`));

    changes.forEach((change, index) => {
      const typeColor = change.type === 'create' ? 'green' :
                       change.type === 'update' ? 'yellow' : 'red';

      console.log(chalk[typeColor](`${index + 1}. ${change.type.toUpperCase()}: ${change.chunkName}`));
      console.log(chalk.gray(`   Chunk ID: ${change.chunkId}`));
      console.log(chalk.gray(`   Time: ${change.timestamp}`));
      console.log();
    });
  });

// Assess impact
program
  .command('assess')
  .description('Assess impact of pending changes')
  .option('-r, --report', 'Generate detailed report')
  .action((options) => {
    console.log(chalk.blue('Assessing impact of changes...\n'));

    const changes = changeDetector.detectChanges();

    if (changes.length === 0) {
      console.log(chalk.green('✓ No changes to assess'));
      return;
    }

    const assessment = impactAssessment.assessChanges(changes);

    console.log(chalk.bold('Overall Impact:'));
    console.log(chalk.gray(`  Level: ${assessment.overall.level.toUpperCase()}`));
    console.log(chalk.gray(`  Score: ${assessment.overall.score}/100`));
    console.log(chalk.gray(`  Summary: ${assessment.overall.summary}\n`));

    console.log(chalk.bold('Detailed Changes:\n'));

    assessment.assessments.forEach((a, index) => {
      const { change, impact } = a;
      const levelColor = impact.level === 'high' ? 'red' :
                        impact.level === 'medium' ? 'yellow' : 'green';

      console.log(chalk[levelColor](`${index + 1}. ${change.chunkName}`));
      console.log(chalk.gray(`   Type: ${change.type.toUpperCase()}`));
      console.log(chalk.gray(`   Impact: ${impact.level.toUpperCase()} (${impact.score}/100)`));
      console.log(chalk.gray(`   Summary: ${impact.summary}`));
      console.log();
    });

    if (options.report) {
      const report = impactAssessment.generateReport(assessment);
      const reportPath = path.join(process.cwd(), '.dochistory', 'reports', `impact-${Date.now()}.md`);

      const reportDir = path.dirname(reportPath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      fs.writeFileSync(reportPath, report);
      console.log(chalk.green(`✓ Report saved: ${reportPath}`));
    }
  });

// Pull/accept changes
program
  .command('pull')
  .description('Accept and apply pending changes')
  .option('--no-commit', 'Do not create a commit')
  .option('--no-build', 'Do not rebuild master document')
  .action((options) => {
    console.log(chalk.blue('Pulling changes...\n'));

    const changes = changeDetector.detectChanges();

    if (changes.length === 0) {
      console.log(chalk.green('✓ Already up to date'));
      return;
    }

    console.log(chalk.yellow(`Applying ${changes.length} change(s)...\n`));

    // Assess impact
    const assessment = impactAssessment.assessChanges(changes);

    // Create commit if requested
    if (options.commit !== false) {
      const commitChanges = changes.map(change => ({
        chunkId: change.chunkId,
        chunkName: change.chunkName,
        type: change.type,
        impact: assessment.assessments.find(a => a.change.chunkId === change.chunkId)?.impact.level || 'low',
        before: change.before,
        after: change.after
      }));

      const commit = versionControl.commit(
        `Pull: ${changes.length} change(s)`,
        commitChanges,
        'user'
      );

      console.log(chalk.green(`✓ Commit created: ${commit.id}`));
    }

    // Accept changes
    changeDetector.acceptChanges();
    console.log(chalk.green('✓ Changes accepted'));

    // Rebuild master document if requested
    if (options.build !== false) {
      docManager.generateMasterDocument();
      console.log(chalk.green('✓ Master document updated'));
    }
  });

// History commands
program
  .command('history')
  .description('View commit history')
  .option('-n, --count <count>', 'Number of commits to show', '10')
  .option('--chunk <chunkId>', 'Show history for specific chunk')
  .action((options) => {
    let history;

    if (options.chunk) {
      history = versionControl.getChunkHistory(options.chunk);
      console.log(chalk.blue(`\nHistory for chunk ${options.chunk}:\n`));
    } else {
      const fullHistory = versionControl.getHistory();
      history = fullHistory.commits.slice(0, parseInt(options.count));
      console.log(chalk.blue(`\nShowing last ${history.length} commit(s):\n`));
    }

    if (history.length === 0) {
      console.log(chalk.yellow('No commits found'));
      return;
    }

    history.forEach((commit, index) => {
      console.log(chalk.green(`${index + 1}. ${commit.message}`));
      console.log(chalk.gray(`   ID: ${commit.id}`));
      console.log(chalk.gray(`   Author: ${commit.author}`));
      console.log(chalk.gray(`   Time: ${commit.timestamp}`));
      console.log(chalk.gray(`   Changes: ${commit.changes.length}`));
      console.log();
    });
  });

// Stats command
program
  .command('stats')
  .description('Show statistics')
  .action(() => {
    const stats = versionControl.getStats();
    const chunks = docManager.getAllChunks();
    const lastScan = changeDetector.getLastScan();

    console.log(chalk.blue('\nLiving Documentation Statistics:\n'));

    console.log(chalk.bold('Content:'));
    console.log(chalk.gray(`  Total Chunks: ${chunks.length}`));
    console.log();

    console.log(chalk.bold('Version Control:'));
    console.log(chalk.gray(`  Total Commits: ${stats.totalCommits}`));
    console.log(chalk.gray(`  Total Changes: ${stats.totalChanges}`));
    console.log(chalk.gray(`  Creates: ${stats.changesByType.create || 0}`));
    console.log(chalk.gray(`  Updates: ${stats.changesByType.update || 0}`));
    console.log(chalk.gray(`  Deletes: ${stats.changesByType.delete || 0}`));
    console.log();

    console.log(chalk.bold('Impact Distribution:'));
    console.log(chalk.gray(`  High: ${stats.changesByImpact.high || 0}`));
    console.log(chalk.gray(`  Medium: ${stats.changesByImpact.medium || 0}`));
    console.log(chalk.gray(`  Low: ${stats.changesByImpact.low || 0}`));
    console.log();

    console.log(chalk.bold('Scanning:'));
    console.log(chalk.gray(`  Total Scans: ${lastScan.scanCount}`));
    console.log(chalk.gray(`  Last Scan: ${lastScan.lastScan || 'Never'}`));
    console.log(chalk.gray(`  Last Changes: ${lastScan.lastChangesCount || 0}`));
    console.log();
  });

// Watch command
program
  .command('watch')
  .description('Start cyclical change detection (every 15 minutes)')
  .action(() => {
    const scheduler = new Scheduler();
    scheduler.start();
  });

// Export command
program
  .command('export <format>')
  .description('Export master document (formats: markdown, json, html)')
  .option('-o, --output <path>', 'Output file path')
  .action((format, options) => {
    console.log(chalk.blue(`Exporting to ${format}...`));

    try {
      const outputPath = masterView.exportView(format, options.output);
      console.log(chalk.green(`✓ Exported to: ${outputPath}`));
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

// Import command
program
  .command('import <file>')
  .description('Import markdown file as chunks')
  .action((file) => {
    console.log(chalk.blue(`Importing from ${file}...`));

    try {
      const chunks = docManager.importMarkdown(file);
      console.log(chalk.green(`✓ Imported ${chunks.length} chunk(s)`));
    } catch (error) {
      console.log(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse();

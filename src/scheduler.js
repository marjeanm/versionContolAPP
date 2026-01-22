#!/usr/bin/env node

const cron = require('node-cron');
const DocumentManager = require('./documentManager');
const ChangeDetector = require('./changeDetector');
const ImpactAssessment = require('./impactAssessment');
const VersionControl = require('./versionControl');
const fs = require('fs');
const path = require('path');

class Scheduler {
  constructor(config = {}) {
    this.config = config;
    this.interval = config.interval || '*/15 * * * *'; // Every 15 minutes by default
    this.docManager = new DocumentManager(config);
    this.changeDetector = new ChangeDetector(config);
    this.impactAssessment = new ImpactAssessment(config);
    this.versionControl = new VersionControl(config);
    this.logFile = config.logFile || path.join(process.cwd(), '.dochistory', 'scheduler.log');
    this.autoCommit = config.autoCommit !== false; // Default true
    this.autoUpdate = config.autoUpdate !== false; // Default true
  }

  /**
   * Start the scheduler
   */
  start() {
    this.log('Scheduler started');
    this.log(`Interval: ${this.interval}`);
    this.log(`Auto-commit: ${this.autoCommit}`);
    this.log(`Auto-update: ${this.autoUpdate}`);

    // Run initial scan
    this.runCycle();

    // Schedule periodic scans
    const task = cron.schedule(this.interval, () => {
      this.runCycle();
    });

    this.log('Cyclical checks scheduled');
    console.log('Living Documentation System - Scheduler Running');
    console.log(`Checking for changes every 15 minutes...`);
    console.log(`Log file: ${this.logFile}`);
    console.log('Press Ctrl+C to stop\n');

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nStopping scheduler...');
      task.stop();
      this.log('Scheduler stopped');
      process.exit(0);
    });

    return task;
  }

  /**
   * Run a single cycle of change detection
   */
  async runCycle() {
    const cycleStart = new Date();
    this.log('='.repeat(60));
    this.log(`Cycle started at ${cycleStart.toISOString()}`);

    try {
      // 1. Scan for changes
      this.log('Step 1: Scanning for changes...');
      const changes = this.changeDetector.detectChanges();

      if (changes.length === 0) {
        this.log('No changes detected');
        console.log(`[${new Date().toLocaleTimeString()}] No changes detected`);
        return;
      }

      this.log(`Found ${changes.length} change(s)`);
      console.log(`\n[${new Date().toLocaleTimeString()}] ${changes.length} change(s) detected`);

      // 2. Assess impact
      this.log('Step 2: Assessing impact...');
      const assessment = this.impactAssessment.assessChanges(changes);

      this.log(`Overall impact: ${assessment.overall.level} (score: ${assessment.overall.score})`);
      console.log(`  Impact: ${assessment.overall.level.toUpperCase()} (score: ${assessment.overall.score}/100)`);

      // Log each change
      assessment.assessments.forEach((a, i) => {
        const { change, impact } = a;
        this.log(`  ${i + 1}. ${change.type.toUpperCase()} - ${change.chunkName} (${impact.level})`);
        console.log(`  ${i + 1}. ${change.type.toUpperCase()} - ${change.chunkName} [${impact.level}]`);
      });

      // 3. Create commit if auto-commit is enabled
      if (this.autoCommit) {
        this.log('Step 3: Creating commit...');

        const commitChanges = changes.map(change => ({
          chunkId: change.chunkId,
          chunkName: change.chunkName,
          type: change.type,
          impact: assessment.assessments.find(a => a.change.chunkId === change.chunkId)?.impact.level || 'low',
          before: change.before,
          after: change.after
        }));

        const commit = this.versionControl.commit(
          `Automatic update: ${changes.length} change(s) detected`,
          commitChanges,
          'scheduler'
        );

        this.log(`Commit created: ${commit.id}`);
        console.log(`  Commit: ${commit.id}`);
      }

      // 4. Accept changes and update tracking
      this.log('Step 4: Accepting changes...');
      this.changeDetector.acceptChanges();
      this.log('Changes accepted and tracking updated');

      // 5. Update master document if auto-update is enabled
      if (this.autoUpdate) {
        this.log('Step 5: Updating master document...');
        this.docManager.generateMasterDocument();
        this.log('Master document updated');
        console.log('  Master document updated');
      }

      // 6. Generate impact report
      const reportPath = path.join(
        process.cwd(),
        '.dochistory',
        'reports',
        `impact-${Date.now()}.md`
      );

      const reportDir = path.dirname(reportPath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }

      const report = this.impactAssessment.generateReport(assessment);
      fs.writeFileSync(reportPath, report);

      this.log(`Impact report saved: ${reportPath}`);

      const cycleEnd = new Date();
      const duration = cycleEnd - cycleStart;
      this.log(`Cycle completed in ${duration}ms`);
      console.log(`  Duration: ${duration}ms\n`);

    } catch (error) {
      this.log(`ERROR: ${error.message}`);
      this.log(error.stack);
      console.error(`[${new Date().toLocaleTimeString()}] Error: ${error.message}`);
    }
  }

  /**
   * Log message to file
   */
  log(message) {
    const logDir = path.dirname(this.logFile);

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    fs.appendFileSync(this.logFile, logMessage);
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    const lastScan = this.changeDetector.getLastScan();
    const stats = this.versionControl.getStats();

    return {
      lastScan: lastScan.lastScan,
      scanCount: lastScan.scanCount,
      lastChangesCount: lastScan.lastChangesCount,
      totalCommits: stats.totalCommits,
      totalChanges: stats.totalChanges
    };
  }
}

// If run directly, start the scheduler
if (require.main === module) {
  const configPath = path.join(process.cwd(), 'config', 'config.json');
  let config = {};

  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  const scheduler = new Scheduler(config);
  scheduler.start();
}

module.exports = Scheduler;

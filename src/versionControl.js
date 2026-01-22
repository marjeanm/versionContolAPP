const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class VersionControl {
  constructor(config = {}) {
    this.historyDir = config.historyDir || path.join(process.cwd(), '.dochistory');
    this.snapshotsDir = path.join(this.historyDir, 'snapshots');
    this.changesDir = path.join(this.historyDir, 'changes');
    this.historyFile = path.join(this.historyDir, 'history.json');

    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.historyDir, this.snapshotsDir, this.changesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    if (!fs.existsSync(this.historyFile)) {
      fs.writeFileSync(this.historyFile, JSON.stringify({ commits: [] }, null, 2));
    }
  }

  /**
   * Create a commit with changes
   */
  commit(message, changes, author = 'system') {
    const commitId = this.generateCommitId();
    const timestamp = new Date().toISOString();

    const commit = {
      id: commitId,
      message,
      author,
      timestamp,
      changes: changes.map(change => ({
        chunkId: change.chunkId,
        chunkName: change.chunkName,
        type: change.type, // 'create', 'update', 'delete'
        impact: change.impact || 'low',
        before: change.before || null,
        after: change.after || null
      }))
    };

    // Save snapshot
    this.saveSnapshot(commitId, changes);

    // Update history
    const history = this.getHistory();
    history.commits.unshift(commit);

    // Keep only last 1000 commits in main history
    if (history.commits.length > 1000) {
      history.commits = history.commits.slice(0, 1000);
    }

    fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 2));

    return commit;
  }

  /**
   * Save a snapshot of changes
   */
  saveSnapshot(commitId, changes) {
    const snapshotPath = path.join(this.snapshotsDir, `${commitId}.json`);
    fs.writeFileSync(snapshotPath, JSON.stringify(changes, null, 2));
  }

  /**
   * Get commit snapshot
   */
  getSnapshot(commitId) {
    const snapshotPath = path.join(this.snapshotsDir, `${commitId}.json`);

    if (!fs.existsSync(snapshotPath)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  }

  /**
   * Get full history
   */
  getHistory() {
    if (!fs.existsSync(this.historyFile)) {
      return { commits: [] };
    }

    return JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
  }

  /**
   * Get commits between time range
   */
  getCommitsByTimeRange(startTime, endTime) {
    const history = this.getHistory();

    return history.commits.filter(commit => {
      const commitTime = new Date(commit.timestamp);
      return commitTime >= startTime && commitTime <= endTime;
    });
  }

  /**
   * Get commits for a specific chunk
   */
  getChunkHistory(chunkId) {
    const history = this.getHistory();

    return history.commits.filter(commit => {
      return commit.changes.some(change => change.chunkId === chunkId);
    });
  }

  /**
   * Get latest commit
   */
  getLatestCommit() {
    const history = this.getHistory();
    return history.commits.length > 0 ? history.commits[0] : null;
  }

  /**
   * Rollback to a specific commit
   */
  rollback(commitId) {
    const snapshot = this.getSnapshot(commitId);

    if (!snapshot) {
      throw new Error(`Commit ${commitId} not found`);
    }

    return snapshot;
  }

  /**
   * Get diff between two commits
   */
  getDiff(commitId1, commitId2) {
    const snapshot1 = this.getSnapshot(commitId1);
    const snapshot2 = this.getSnapshot(commitId2);

    if (!snapshot1 || !snapshot2) {
      throw new Error('One or both commits not found');
    }

    // Compare snapshots
    const diff = {
      added: [],
      modified: [],
      deleted: []
    };

    // Find added and modified
    snapshot2.forEach(item2 => {
      const item1 = snapshot1.find(i => i.chunkId === item2.chunkId);

      if (!item1) {
        diff.added.push(item2);
      } else if (item1.after !== item2.after) {
        diff.modified.push({ before: item1, after: item2 });
      }
    });

    // Find deleted
    snapshot1.forEach(item1 => {
      const item2 = snapshot2.find(i => i.chunkId === item1.chunkId);
      if (!item2) {
        diff.deleted.push(item1);
      }
    });

    return diff;
  }

  /**
   * Generate unique commit ID
   */
  generateCommitId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `${timestamp}-${random}`;
  }

  /**
   * Export history to file
   */
  exportHistory(outputPath) {
    const history = this.getHistory();
    fs.writeFileSync(outputPath, JSON.stringify(history, null, 2));
  }

  /**
   * Get statistics
   */
  getStats() {
    const history = this.getHistory();

    const stats = {
      totalCommits: history.commits.length,
      totalChanges: 0,
      changesByType: { create: 0, update: 0, delete: 0 },
      changesByImpact: { low: 0, medium: 0, high: 0 },
      authors: new Set()
    };

    history.commits.forEach(commit => {
      stats.totalChanges += commit.changes.length;
      stats.authors.add(commit.author);

      commit.changes.forEach(change => {
        stats.changesByType[change.type] = (stats.changesByType[change.type] || 0) + 1;
        stats.changesByImpact[change.impact] = (stats.changesByImpact[change.impact] || 0) + 1;
      });
    });

    stats.authors = Array.from(stats.authors);

    return stats;
  }
}

module.exports = VersionControl;

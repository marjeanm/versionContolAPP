const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ChangeDetector {
  constructor(config = {}) {
    this.chunksDir = config.chunksDir || path.join(process.cwd(), 'chunks');
    this.trackingFile = path.join(process.cwd(), '.dochistory', 'tracking.json');
    this.lastScanFile = path.join(process.cwd(), '.dochistory', 'lastscan.json');

    this.ensureFiles();
  }

  ensureFiles() {
    const historyDir = path.dirname(this.trackingFile);

    if (!fs.existsSync(historyDir)) {
      fs.mkdirSync(historyDir, { recursive: true });
    }

    if (!fs.existsSync(this.trackingFile)) {
      fs.writeFileSync(this.trackingFile, JSON.stringify({ chunks: {} }, null, 2));
    }

    if (!fs.existsSync(this.lastScanFile)) {
      fs.writeFileSync(this.lastScanFile, JSON.stringify({ lastScan: null, scanCount: 0 }, null, 2));
    }
  }

  /**
   * Scan for changes in chunks
   */
  scan() {
    const tracking = this.getTracking();
    const currentChunks = this.getCurrentChunks();
    const changes = [];

    // Check for new and modified chunks
    Object.keys(currentChunks).forEach(chunkId => {
      const currentChunk = currentChunks[chunkId];
      const trackedChunk = tracking.chunks[chunkId];

      if (!trackedChunk) {
        // New chunk
        changes.push({
          type: 'create',
          chunkId,
          chunkName: currentChunk.name,
          before: null,
          after: currentChunk,
          timestamp: new Date().toISOString()
        });
      } else if (trackedChunk.hash !== currentChunk.hash) {
        // Modified chunk
        changes.push({
          type: 'update',
          chunkId,
          chunkName: currentChunk.name,
          before: trackedChunk,
          after: currentChunk,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Check for deleted chunks
    Object.keys(tracking.chunks).forEach(chunkId => {
      if (!currentChunks[chunkId]) {
        changes.push({
          type: 'delete',
          chunkId,
          chunkName: tracking.chunks[chunkId].name,
          before: tracking.chunks[chunkId],
          after: null,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Update last scan
    this.updateLastScan(changes.length);

    return changes;
  }

  /**
   * Get current chunks state
   */
  getCurrentChunks() {
    const chunks = {};

    if (!fs.existsSync(this.chunksDir)) {
      return chunks;
    }

    const files = fs.readdirSync(this.chunksDir);

    files.forEach(file => {
      if (file.endsWith('.json')) {
        const filePath = path.join(this.chunksDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const chunk = JSON.parse(content);
        chunks[chunk.id] = chunk;
      }
    });

    return chunks;
  }

  /**
   * Get tracked chunks
   */
  getTracking() {
    if (!fs.existsSync(this.trackingFile)) {
      return { chunks: {} };
    }

    return JSON.parse(fs.readFileSync(this.trackingFile, 'utf8'));
  }

  /**
   * Update tracking with current state
   */
  updateTracking() {
    const currentChunks = this.getCurrentChunks();

    const tracking = {
      chunks: currentChunks,
      lastUpdate: new Date().toISOString()
    };

    fs.writeFileSync(this.trackingFile, JSON.stringify(tracking, null, 2));

    return tracking;
  }

  /**
   * Update last scan information
   */
  updateLastScan(changesCount) {
    const lastScanData = this.getLastScan();

    const updated = {
      lastScan: new Date().toISOString(),
      scanCount: lastScanData.scanCount + 1,
      lastChangesCount: changesCount
    };

    fs.writeFileSync(this.lastScanFile, JSON.stringify(updated, null, 2));

    return updated;
  }

  /**
   * Get last scan information
   */
  getLastScan() {
    if (!fs.existsSync(this.lastScanFile)) {
      return { lastScan: null, scanCount: 0, lastChangesCount: 0 };
    }

    return JSON.parse(fs.readFileSync(this.lastScanFile, 'utf8'));
  }

  /**
   * Detect changes without updating tracking
   */
  detectChanges() {
    return this.scan();
  }

  /**
   * Accept changes and update tracking
   */
  acceptChanges() {
    const changes = this.scan();
    this.updateTracking();
    return changes;
  }

  /**
   * Get change statistics
   */
  getChangeStats(changes) {
    const stats = {
      total: changes.length,
      creates: changes.filter(c => c.type === 'create').length,
      updates: changes.filter(c => c.type === 'update').length,
      deletes: changes.filter(c => c.type === 'delete').length,
      chunks: {}
    };

    changes.forEach(change => {
      if (!stats.chunks[change.chunkId]) {
        stats.chunks[change.chunkId] = {
          chunkName: change.chunkName,
          changes: []
        };
      }
      stats.chunks[change.chunkId].changes.push(change.type);
    });

    return stats;
  }

  /**
   * Watch for changes (file system watching)
   */
  watch(callback) {
    if (!fs.existsSync(this.chunksDir)) {
      fs.mkdirSync(this.chunksDir, { recursive: true });
    }

    const watcher = fs.watch(this.chunksDir, { recursive: true }, (eventType, filename) => {
      if (filename && filename.endsWith('.json')) {
        const changes = this.detectChanges();
        callback(changes, eventType, filename);
      }
    });

    return watcher;
  }

  /**
   * Compare two chunk states
   */
  compareChunks(chunk1, chunk2) {
    const diff = {
      contentChanged: chunk1.hash !== chunk2.hash,
      metadataChanged: JSON.stringify(chunk1.metadata) !== JSON.stringify(chunk2.metadata),
      nameChanged: chunk1.name !== chunk2.name
    };

    return diff;
  }
}

module.exports = ChangeDetector;

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class DocumentManager {
  constructor(config = {}) {
    this.chunksDir = config.chunksDir || path.join(process.cwd(), 'chunks');
    this.docsDir = config.docsDir || path.join(process.cwd(), 'docs');
    this.masterFile = config.masterFile || path.join(this.docsDir, 'master.md');
    this.historyDir = config.historyDir || path.join(process.cwd(), '.dochistory');

    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.chunksDir, this.docsDir, this.historyDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Create a new chunk of documentation
   */
  createChunk(name, content, metadata = {}) {
    const chunkId = this.generateChunkId(name);
    const chunkData = {
      id: chunkId,
      name,
      content,
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      hash: this.hashContent(content)
    };

    const chunkPath = path.join(this.chunksDir, `${chunkId}.json`);
    fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2));

    return chunkData;
  }

  /**
   * Update an existing chunk
   */
  updateChunk(chunkId, content, metadata = {}) {
    const chunkPath = path.join(this.chunksDir, `${chunkId}.json`);

    if (!fs.existsSync(chunkPath)) {
      throw new Error(`Chunk ${chunkId} not found`);
    }

    const oldChunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
    const newHash = this.hashContent(content);

    // Only update if content has changed
    if (oldChunk.hash !== newHash) {
      const updatedChunk = {
        ...oldChunk,
        content,
        metadata: {
          ...oldChunk.metadata,
          ...metadata,
          updatedAt: new Date().toISOString()
        },
        hash: newHash,
        previousHash: oldChunk.hash
      };

      fs.writeFileSync(chunkPath, JSON.stringify(updatedChunk, null, 2));
      return { changed: true, chunk: updatedChunk, oldChunk };
    }

    return { changed: false, chunk: oldChunk };
  }

  /**
   * Get a chunk by ID
   */
  getChunk(chunkId) {
    const chunkPath = path.join(this.chunksDir, `${chunkId}.json`);

    if (!fs.existsSync(chunkPath)) {
      return null;
    }

    return JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
  }

  /**
   * Get all chunks
   */
  getAllChunks() {
    if (!fs.existsSync(this.chunksDir)) {
      return [];
    }

    const files = fs.readdirSync(this.chunksDir);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const content = fs.readFileSync(path.join(this.chunksDir, file), 'utf8');
        return JSON.parse(content);
      })
      .sort((a, b) => {
        const orderA = a.metadata.order !== undefined ? a.metadata.order : 999;
        const orderB = b.metadata.order !== undefined ? b.metadata.order : 999;
        return orderA - orderB;
      });
  }

  /**
   * Delete a chunk
   */
  deleteChunk(chunkId) {
    const chunkPath = path.join(this.chunksDir, `${chunkId}.json`);

    if (fs.existsSync(chunkPath)) {
      fs.unlinkSync(chunkPath);
      return true;
    }

    return false;
  }

  /**
   * Delete all chunks
   */
  deleteAllChunks() {
    if (!fs.existsSync(this.chunksDir)) {
      return { deleted: 0, chunks: [] };
    }

    const files = fs.readdirSync(this.chunksDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    const deletedChunks = [];

    jsonFiles.forEach(file => {
      const chunkPath = path.join(this.chunksDir, file);
      const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
      deletedChunks.push({ id: chunk.id, name: chunk.name });
      fs.unlinkSync(chunkPath);
    });

    return { deleted: deletedChunks.length, chunks: deletedChunks };
  }

  /**
   * Set chunk order
   */
  setChunkOrder(chunkId, newOrder) {
    const chunkPath = path.join(this.chunksDir, `${chunkId}.json`);

    if (!fs.existsSync(chunkPath)) {
      throw new Error(`Chunk ${chunkId} not found`);
    }

    const chunk = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
    const oldOrder = chunk.metadata.order || 999;

    chunk.metadata.order = parseInt(newOrder);
    chunk.metadata.updatedAt = new Date().toISOString();

    fs.writeFileSync(chunkPath, JSON.stringify(chunk, null, 2));

    return { chunk, oldOrder, newOrder: chunk.metadata.order };
  }

  /**
   * Generate master document from all chunks
   */
  generateMasterDocument() {
    const chunks = this.getAllChunks();

    let masterContent = '# Master Document\n\n';
    masterContent += `*Last updated: ${new Date().toISOString()}*\n\n`;
    masterContent += '---\n\n';

    chunks.forEach(chunk => {
      masterContent += `<!-- CHUNK: ${chunk.id} -->\n`;
      masterContent += `## ${chunk.name}\n\n`;
      masterContent += `${chunk.content}\n\n`;
      masterContent += `---\n\n`;
    });

    fs.writeFileSync(this.masterFile, masterContent);
    return masterContent;
  }

  /**
   * Get master document
   */
  getMasterDocument() {
    if (!fs.existsSync(this.masterFile)) {
      return this.generateMasterDocument();
    }

    return fs.readFileSync(this.masterFile, 'utf8');
  }

  /**
   * Generate a unique chunk ID
   */
  generateChunkId(name) {
    const timestamp = Date.now();
    const hash = crypto.createHash('md5').update(name + timestamp).digest('hex').substring(0, 8);
    return `chunk-${hash}`;
  }

  /**
   * Generate hash for content
   */
  hashContent(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Import markdown file as chunks
   */
  importMarkdown(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${filePath} not found`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const sections = this.parseMarkdownSections(content);

    return sections.map((section, index) => {
      return this.createChunk(section.title, section.content, { order: index });
    });
  }

  /**
   * Parse markdown into sections
   */
  parseMarkdownSections(markdown) {
    const lines = markdown.split('\n');
    const sections = [];
    let currentSection = null;

    lines.forEach(line => {
      const h2Match = line.match(/^## (.+)$/);
      const h1Match = line.match(/^# (.+)$/);

      if (h2Match || h1Match) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: (h2Match || h1Match)[1],
          content: ''
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }
}

module.exports = DocumentManager;

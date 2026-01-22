const diff = require('diff');

class ImpactAssessment {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Assess impact of a single change
   */
  assessChange(change) {
    const impact = {
      level: 'low', // low, medium, high
      score: 0,
      factors: [],
      summary: '',
      details: {}
    };

    if (change.type === 'create') {
      impact.level = 'low';
      impact.score = 30;
      impact.factors.push('New content added');
      impact.summary = `New chunk "${change.chunkName}" added`;
      impact.details.linesAdded = this.countLines(change.after.content);
    } else if (change.type === 'delete') {
      impact.level = 'high';
      impact.score = 90;
      impact.factors.push('Content removed');
      impact.summary = `Chunk "${change.chunkName}" deleted`;
      impact.details.linesRemoved = this.countLines(change.before.content);
    } else if (change.type === 'update') {
      const updateImpact = this.assessUpdate(change);
      Object.assign(impact, updateImpact);
    }

    return impact;
  }

  /**
   * Assess impact of an update
   */
  assessUpdate(change) {
    const before = change.before.content || '';
    const after = change.after.content || '';

    const differences = diff.diffLines(before, after);

    let linesAdded = 0;
    let linesRemoved = 0;
    let linesChanged = 0;

    differences.forEach(part => {
      const lineCount = part.count || 0;
      if (part.added) {
        linesAdded += lineCount;
      } else if (part.removed) {
        linesRemoved += lineCount;
      }
    });

    linesChanged = linesAdded + linesRemoved;

    const totalLinesBefore = this.countLines(before);
    const changePercentage = totalLinesBefore > 0
      ? (linesChanged / totalLinesBefore) * 100
      : 100;

    let score = 0;
    let level = 'low';
    const factors = [];

    // Calculate impact score
    if (changePercentage > 75) {
      score += 80;
      level = 'high';
      factors.push('Major rewrite (>75% changed)');
    } else if (changePercentage > 50) {
      score += 60;
      level = 'high';
      factors.push('Significant changes (>50% changed)');
    } else if (changePercentage > 25) {
      score += 40;
      level = 'medium';
      factors.push('Moderate changes (>25% changed)');
    } else if (changePercentage > 10) {
      score += 20;
      level = 'low';
      factors.push('Minor changes (>10% changed)');
    } else {
      score += 10;
      level = 'low';
      factors.push('Minimal changes');
    }

    // Check for structural changes
    const structuralChanges = this.detectStructuralChanges(before, after);
    if (structuralChanges.headingsChanged) {
      score += 20;
      level = level === 'low' ? 'medium' : 'high';
      factors.push('Headings modified');
    }

    if (structuralChanges.linksChanged) {
      score += 15;
      factors.push('Links modified');
    }

    if (structuralChanges.codeBlocksChanged) {
      score += 15;
      factors.push('Code blocks modified');
    }

    // Check metadata changes
    if (change.before.metadata && change.after.metadata) {
      const metadataChanged = JSON.stringify(change.before.metadata) !==
                             JSON.stringify(change.after.metadata);
      if (metadataChanged) {
        score += 5;
        factors.push('Metadata updated');
      }
    }

    // Determine final level based on score
    if (score >= 70) {
      level = 'high';
    } else if (score >= 40) {
      level = 'medium';
    }

    return {
      level,
      score: Math.min(score, 100),
      factors,
      summary: `Chunk "${change.chunkName}" updated (${changePercentage.toFixed(1)}% changed)`,
      details: {
        linesAdded,
        linesRemoved,
        linesChanged,
        totalLinesBefore,
        totalLinesAfter: this.countLines(after),
        changePercentage: changePercentage.toFixed(2),
        structuralChanges
      }
    };
  }

  /**
   * Assess impact of multiple changes
   */
  assessChanges(changes) {
    const assessments = changes.map(change => ({
      change,
      impact: this.assessChange(change)
    }));

    const overallImpact = this.calculateOverallImpact(assessments);

    return {
      assessments,
      overall: overallImpact
    };
  }

  /**
   * Calculate overall impact from multiple assessments
   */
  calculateOverallImpact(assessments) {
    if (assessments.length === 0) {
      return {
        level: 'none',
        score: 0,
        totalChanges: 0,
        summary: 'No changes detected'
      };
    }

    const totalScore = assessments.reduce((sum, a) => sum + a.impact.score, 0);
    const avgScore = totalScore / assessments.length;

    const highImpact = assessments.filter(a => a.impact.level === 'high').length;
    const mediumImpact = assessments.filter(a => a.impact.level === 'medium').length;
    const lowImpact = assessments.filter(a => a.impact.level === 'low').length;

    let level = 'low';
    if (highImpact > 0 || avgScore >= 70) {
      level = 'high';
    } else if (mediumImpact > 0 || avgScore >= 40) {
      level = 'medium';
    }

    return {
      level,
      score: avgScore.toFixed(2),
      totalChanges: assessments.length,
      breakdown: { high: highImpact, medium: mediumImpact, low: lowImpact },
      summary: `${assessments.length} change(s) detected: ${highImpact} high, ${mediumImpact} medium, ${lowImpact} low impact`
    };
  }

  /**
   * Detect structural changes in markdown
   */
  detectStructuralChanges(before, after) {
    const beforeHeadings = this.extractHeadings(before);
    const afterHeadings = this.extractHeadings(after);

    const beforeLinks = this.extractLinks(before);
    const afterLinks = this.extractLinks(after);

    const beforeCodeBlocks = this.extractCodeBlocks(before);
    const afterCodeBlocks = this.extractCodeBlocks(after);

    return {
      headingsChanged: JSON.stringify(beforeHeadings) !== JSON.stringify(afterHeadings),
      headingsBefore: beforeHeadings.length,
      headingsAfter: afterHeadings.length,
      linksChanged: JSON.stringify(beforeLinks) !== JSON.stringify(afterLinks),
      linksBefore: beforeLinks.length,
      linksAfter: afterLinks.length,
      codeBlocksChanged: JSON.stringify(beforeCodeBlocks) !== JSON.stringify(afterCodeBlocks),
      codeBlocksBefore: beforeCodeBlocks.length,
      codeBlocksAfter: afterCodeBlocks.length
    };
  }

  /**
   * Extract headings from markdown
   */
  extractHeadings(markdown) {
    const headingRegex = /^#{1,6}\s+(.+)$/gm;
    const headings = [];
    let match;

    while ((match = headingRegex.exec(markdown)) !== null) {
      headings.push(match[1]);
    }

    return headings;
  }

  /**
   * Extract links from markdown
   */
  extractLinks(markdown) {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let match;

    while ((match = linkRegex.exec(markdown)) !== null) {
      links.push({ text: match[1], url: match[2] });
    }

    return links;
  }

  /**
   * Extract code blocks from markdown
   */
  extractCodeBlocks(markdown) {
    const codeBlockRegex = /```[\s\S]*?```/g;
    return markdown.match(codeBlockRegex) || [];
  }

  /**
   * Count lines in text
   */
  countLines(text) {
    if (!text) return 0;
    return text.split('\n').length;
  }

  /**
   * Generate impact report
   */
  generateReport(assessmentResult) {
    let report = '# Impact Assessment Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `## Overall Impact\n\n`;
    report += `- **Level**: ${assessmentResult.overall.level.toUpperCase()}\n`;
    report += `- **Score**: ${assessmentResult.overall.score}/100\n`;
    report += `- **Summary**: ${assessmentResult.overall.summary}\n\n`;

    if (assessmentResult.overall.breakdown) {
      report += `### Breakdown\n\n`;
      report += `- High Impact: ${assessmentResult.overall.breakdown.high}\n`;
      report += `- Medium Impact: ${assessmentResult.overall.breakdown.medium}\n`;
      report += `- Low Impact: ${assessmentResult.overall.breakdown.low}\n\n`;
    }

    report += `## Detailed Changes\n\n`;

    assessmentResult.assessments.forEach((assessment, index) => {
      const { change, impact } = assessment;
      report += `### ${index + 1}. ${change.chunkName}\n\n`;
      report += `- **Type**: ${change.type}\n`;
      report += `- **Impact Level**: ${impact.level.toUpperCase()}\n`;
      report += `- **Score**: ${impact.score}/100\n`;
      report += `- **Summary**: ${impact.summary}\n\n`;

      if (impact.factors.length > 0) {
        report += `**Factors**:\n`;
        impact.factors.forEach(factor => {
          report += `- ${factor}\n`;
        });
        report += '\n';
      }

      if (impact.details && Object.keys(impact.details).length > 0) {
        report += `**Details**:\n`;
        Object.entries(impact.details).forEach(([key, value]) => {
          if (typeof value === 'object') {
            report += `- ${key}: ${JSON.stringify(value)}\n`;
          } else {
            report += `- ${key}: ${value}\n`;
          }
        });
        report += '\n';
      }

      report += '---\n\n';
    });

    return report;
  }
}

module.exports = ImpactAssessment;

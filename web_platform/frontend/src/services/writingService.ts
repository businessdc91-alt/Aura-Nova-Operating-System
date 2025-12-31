'use client';

/**
 * Writing Service - Manages documents, AI integration, and text processing
 */

export interface WritingDocument {
  id: string;
  title: string;
  content: string;
  format: 'draft' | 'young-readers' | 'full-novel' | 'research' | 'summary' | 'compiled';
  fontSize: number;
  fontFamily: string;
  metadata: {
    wordCount: number;
    charCount: number;
    createdAt: Date;
    updatedAt: Date;
    chapterCount?: number;
    readingTime?: number;
  };
}

export interface TextSuggestion {
  type: 'grammar' | 'style' | 'clarity' | 'creativity' | 'continuity';
  originalText: string;
  suggestion: string;
  explanation: string;
  confidence: number;
}

export interface ChapterBreak {
  title: string;
  content: string;
  wordCount: number;
  suggestedLength: 'short' | 'medium' | 'long';
}

export class WritingService {
  private static DB_NAME = 'AuraWritingStudio';
  private static STORE_NAMES = {
    DOCUMENTS: 'documents',
    DRAFTS: 'drafts',
    AI_HISTORY: 'aiHistory',
  };

  /**
   * Initialize IndexedDB
   */
  static async initializeDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.STORE_NAMES.DOCUMENTS)) {
          const docStore = db.createObjectStore(this.STORE_NAMES.DOCUMENTS, { keyPath: 'id' });
          docStore.createIndex('format', 'format', { unique: false });
          docStore.createIndex('updatedAt', 'metadata.updatedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(this.STORE_NAMES.DRAFTS)) {
          db.createObjectStore(this.STORE_NAMES.DRAFTS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(this.STORE_NAMES.AI_HISTORY)) {
          db.createObjectStore(this.STORE_NAMES.AI_HISTORY, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Save document
   */
  static async saveDocument(doc: WritingDocument): Promise<void> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.DOCUMENTS], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.DOCUMENTS);
      const request = store.put(doc);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Load document
   */
  static async loadDocument(id: string): Promise<WritingDocument | null> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.DOCUMENTS], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.DOCUMENTS);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all documents
   */
  static async getAllDocuments(): Promise<WritingDocument[]> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.DOCUMENTS], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.DOCUMENTS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete document
   */
  static async deleteDocument(id: string): Promise<void> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.DOCUMENTS], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.DOCUMENTS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Calculate reading time (words / 200 words per minute)
   */
  static calculateReadingTime(wordCount: number): number {
    return Math.ceil(wordCount / 200);
  }

  /**
   * Auto-detect and break into chapters based on format
   */
  static autoCreateChapters(content: string, format: WritingDocument['format']): ChapterBreak[] {
    const paragraphs = content.split('\n\n');
    const chapters: ChapterBreak[] = [];
    let currentChapter = '';
    let chapterCount = 0;

    const targetWordCount = {
      'draft': 1000,
      'young-readers': 800,
      'full-novel': 3000,
      'research': 2000,
      'summary': 500,
      'compiled': 3500,
    };

    for (const para of paragraphs) {
      currentChapter += para + '\n\n';
      const wordCount = currentChapter.split(/\s+/).length;

      if (wordCount >= targetWordCount[format]) {
        chapterCount++;
        chapters.push({
          title: `Chapter ${chapterCount}`,
          content: currentChapter.trim(),
          wordCount,
          suggestedLength: wordCount > 4000 ? 'long' : wordCount > 1500 ? 'medium' : 'short',
        });
        currentChapter = '';
      }
    }

    // Add remaining content
    if (currentChapter.trim()) {
      chapterCount++;
      const wordCount = currentChapter.split(/\s+/).length;
      chapters.push({
        title: `Chapter ${chapterCount}`,
        content: currentChapter.trim(),
        wordCount,
        suggestedLength: wordCount > 4000 ? 'long' : wordCount > 1500 ? 'medium' : 'short',
      });
    }

    return chapters;
  }

  /**
   * Format content based on document format
   */
  static formatContent(content: string, format: WritingDocument['format']): string {
    switch (format) {
      case 'young-readers':
        return this.formatYoungReaders(content);
      case 'full-novel':
        return this.formatNovel(content);
      case 'research':
        return this.formatResearch(content);
      case 'summary':
        return this.formatSummary(content);
      case 'compiled':
        return this.formatCompiled(content);
      case 'draft':
      default:
        return content;
    }
  }

  private static formatYoungReaders(content: string): string {
    // Shorter paragraphs, simpler sentences, larger font guidance
    return content
      .split('\n\n')
      .map(para => {
        // Limit paragraph length
        const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
        if (sentences.length > 3) {
          return sentences.slice(0, 3).join('');
        }
        return para;
      })
      .join('\n\n');
  }

  private static formatNovel(content: string): string {
    // Professional novel formatting
    const lines = content.split('\n');
    return lines
      .map(line => {
        if (line.trim().match(/^chapter|^part|^scene/i)) {
          return `\n${line.toUpperCase()}\n`;
        }
        return line;
      })
      .join('\n');
  }

  private static formatResearch(content: string): string {
    // Add section numbering for research
    const sections = content.split(/###\s+/);
    return sections
      .map((section, idx) => {
        if (idx === 0) return section;
        return `${idx}. ${section}`;
      })
      .join('\n\n');
  }

  private static formatSummary(content: string): string {
    // Compact format, remove excessive spacing
    return content
      .split('\n')
      .filter(line => line.trim())
      .join('\n');
  }

  private static formatCompiled(content: string): string {
    // Professional publication format
    return content
      .replace(/  +/g, ' ') // Remove extra spaces
      .replace(/\n{3,}/g, '\n\n') // Normalize spacing
      .trim();
  }

  /**
   * Check grammar/style suggestions
   */
  static async getSuggestions(text: string): Promise<TextSuggestion[]> {
    const suggestions: TextSuggestion[] = [];

    // Simple regex-based checks (replace with API calls to real grammar checker)
    const commonIssues = [
      {
        pattern: /\b(very very|really really|definitely definitely)\b/gi,
        type: 'style' as const,
        suggestion: 'Avoid repetition',
        explanation: 'Repeating intensifiers weakens your writing',
      },
      {
        pattern: /\b(thing|stuff|something)\b/gi,
        type: 'clarity' as const,
        suggestion: 'Be more specific',
        explanation: 'Use concrete nouns instead of vague words',
      },
      {
        pattern: /\byou know\b/gi,
        type: 'style' as const,
        suggestion: 'Remove filler phrases',
        explanation: 'Filler phrases weaken your writing',
      },
    ];

    for (const issue of commonIssues) {
      const matches = text.match(issue.pattern);
      if (matches) {
        for (const match of matches) {
          suggestions.push({
            type: issue.type,
            originalText: match,
            suggestion: issue.suggestion,
            explanation: issue.explanation,
            confidence: 0.8,
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Check for continuity issues
   */
  static checkContinuity(chapters: ChapterBreak[]): Array<{
    chapter: number;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }> {
    const issues = [];

    for (let i = 0; i < chapters.length - 1; i++) {
      const currentChapter = chapters[i];
      const nextChapter = chapters[i + 1];

      // Check for abrupt tone changes
      if (currentChapter.wordCount < 200 && nextChapter.wordCount > 4000) {
        issues.push({
          chapter: i + 1,
          issue: 'Significant length jump to next chapter',
          severity: 'low',
        });
      }

      // Check for content gaps
      if (currentChapter.content.match(/suddenly|immediately|instantly/i) && 
          !nextChapter.content.match(/continued|after|then/i)) {
        issues.push({
          chapter: i + 1,
          issue: 'Possible narrative gap - consider adding transition',
          severity: 'medium',
        });
      }
    }

    return issues;
  }

  /**
   * Generate document outline
   */
  static generateOutline(content: string): string[] {
    const headings = content.match(/^#+\s+.+$/gm) || [];
    return headings.map(h => h.replace(/^#+\s+/, ''));
  }

  /**
   * Export as different formats
   */
  static exportAsText(doc: WritingDocument): Blob {
    const text = `${doc.title}\n${'='.repeat(doc.title.length)}\n\n${doc.content}`;
    return new Blob([text], { type: 'text/plain' });
  }

  static exportAsMarkdown(doc: WritingDocument): Blob {
    const chapters = this.autoCreateChapters(doc.content, doc.format);
    let markdown = `# ${doc.title}\n\n`;
    
    for (const chapter of chapters) {
      markdown += `## ${chapter.title}\n\n${chapter.content}\n\n`;
    }

    return new Blob([markdown], { type: 'text/markdown' });
  }

  /**
   * Save auto-draft (every 30 seconds)
   */
  static async autoSaveDraft(id: string, content: string): Promise<void> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.DRAFTS], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.DRAFTS);
      const request = store.put({
        id,
        content,
        timestamp: new Date(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

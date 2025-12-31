'use client';

/**
 * AI Writing Assistant Service
 * Handles story suggestions, continuity checks, creative ideas, and corrections
 */

export interface AIWritingRequest {
  type: 'creative' | 'correction' | 'continuity' | 'expansion' | 'simplification' | 'summary';
  selectedText: string;
  context?: string;
  tone?: 'professional' | 'casual' | 'creative' | 'academic' | 'technical';
}

export interface AIWritingResponse {
  suggestion: string;
  alternatives?: string[];
  explanation: string;
  confidence: number;
}

export class AIWritingAssistant {
  private static apiEndpoint = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  /**
   * Get creative writing suggestions
   */
  static async getCreativeSuggestion(text: string, context?: string): Promise<AIWritingResponse> {
    try {
      // Try API first, fall back to local generation
      const response = await fetch(`${this.apiEndpoint}/api/writing/creative-suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, context }),
      });

      if (response.ok) {
        return response.json();
      }
    } catch {
      // Fall through to local generation
    }

    // Local generation as fallback
    return this.generateLocalSuggestion(text, 'creative');
  }

  /**
   * Check for spelling and grammar
   */
  static async checkGrammar(text: string): Promise<Array<{
    error: string;
    suggestion: string;
    start: number;
    end: number;
  }>> {
    try {
      const response = await fetch(`${this.apiEndpoint}/api/writing/check-grammar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        return response.json();
      }
    } catch {
      // Fall through
    }

    // Simple local grammar check
    return this.localGrammarCheck(text);
  }

  /**
   * Continuity check for story coherence
   */
  static async checkContinuity(previousContent: string, newContent: string): Promise<{
    issues: Array<{ issue: string; severity: 'low' | 'medium' | 'high' }>;
    suggestions: string[];
  }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/api/writing/check-continuity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previousContent, newContent }),
      });

      if (response.ok) {
        return response.json();
      }
    } catch {
      // Fall through
    }

    return this.localContinuityCheck(previousContent, newContent);
  }

  /**
   * Expand text with creative details
   */
  static async expandText(text: string, targetLength: number): Promise<string> {
    try {
      const response = await fetch(`${this.apiEndpoint}/api/writing/expand-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLength }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.expandedText;
      }
    } catch {
      // Fall through
    }

    return this.localTextExpansion(text, targetLength);
  }

  /**
   * Simplify complex text
   */
  static async simplifyText(text: string, readingLevel: 'elementary' | 'middle' | 'high' | 'college'): Promise<string> {
    try {
      const response = await fetch(`${this.apiEndpoint}/api/writing/simplify-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, readingLevel }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.simplifiedText;
      }
    } catch {
      // Fall through
    }

    return this.localTextSimplification(text, readingLevel);
  }

  /**
   * Generate story ideas based on context
   */
  static async generateStoryIdeas(theme: string, wordCount: number, genre?: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/api/writing/story-ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, wordCount, genre }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.ideas;
      }
    } catch {
      // Fall through
    }

    return this.generateLocalStoryIdeas(theme, genre);
  }

  /**
   * Generate chapter outline
   */
  static async generateChapterOutline(synopsis: string, chapterCount: number): Promise<string[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}/api/writing/chapter-outline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ synopsis, chapterCount }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.outline;
      }
    } catch {
      // Fall through
    }

    return this.generateLocalChapterOutline(synopsis, chapterCount);
  }

  /**
   * Analyze tone and suggest improvements
   */
  static async analyzeTone(text: string): Promise<{
    detectedTone: string;
    toneScore: number;
    suggestions: string[];
  }> {
    try {
      const response = await fetch(`${this.apiEndpoint}/api/writing/analyze-tone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        return response.json();
      }
    } catch {
      // Fall through
    }

    return this.localToneAnalysis(text);
  }

  /**
   * ============== LOCAL FALLBACK IMPLEMENTATIONS ==============
   */

  private static generateLocalSuggestion(text: string, type: string): AIWritingResponse {
    const suggestions: Record<string, AIWritingResponse[]> = {
      creative: [
        {
          suggestion: 'Consider adding sensory details to make the scene more vivid.',
          explanation: 'Sensory descriptions engage readers and make your writing more immersive.',
          confidence: 0.85,
        },
        {
          suggestion: 'This could benefit from a metaphor or simile.',
          explanation: 'Figurative language makes your writing more engaging and memorable.',
          confidence: 0.8,
        },
        {
          suggestion: 'Try varying your sentence structure here.',
          explanation: 'Varied sentence lengths maintain reader interest and improve readability.',
          confidence: 0.9,
        },
      ],
    };

    const typeOptions = suggestions[type] || suggestions.creative;
    return typeOptions[Math.floor(Math.random() * typeOptions.length)];
  }

  private static localGrammarCheck(text: string): Array<{
    error: string;
    suggestion: string;
    start: number;
    end: number;
  }> {
    const errors = [];

    // Check for common errors
    const patterns = [
      {
        regex: /\byou\'re\b/g,
        suggestion: "you're (you are)",
        error: 'Contraction check',
      },
      {
        regex: /\bthier\b/g,
        suggestion: 'their',
        error: 'Spelling error',
      },
      {
        regex: /\breciever\b/g,
        suggestion: 'receiver',
        error: 'Spelling error',
      },
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        errors.push({
          error: pattern.error,
          suggestion: pattern.suggestion,
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    }

    return errors;
  }

  private static localContinuityCheck(previousContent: string, newContent: string): {
    issues: Array<{ issue: string; severity: 'low' | 'medium' | 'high' }>;
    suggestions: string[];
  } {
    const issues = [];
    const suggestions = [];

    // Check for tense shifts
    const previousHasPast = /was|were|had/.test(previousContent);
    const newHasPresent = /is|are|am/.test(newContent);

    if (previousHasPast && newHasPresent) {
      issues.push({
        issue: 'Tense shift detected between sections',
        severity: 'medium',
      });
      suggestions.push('Ensure consistent verb tense throughout the story');
    }

    // Check for character consistency
    const prevCharNames = previousContent.match(/\b[A-Z][a-z]+\b/g) || [];
    const newCharNames = newContent.match(/\b[A-Z][a-z]+\b/g) || [];

    if (newCharNames.length === 0 && prevCharNames.length > 0) {
      issues.push({
        issue: 'Character introduction may be missing',
        severity: 'low',
      });
      suggestions.push('Reintroduce main characters from the previous section');
    }

    return { issues, suggestions };
  }

  private static localTextExpansion(text: string, targetLength: number): string {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const currentLength = text.length;
    const expansionRatio = targetLength / currentLength;

    if (expansionRatio <= 1.2) {
      return text; // Already close to target
    }

    // Simple expansion: add descriptive phrases
    return sentences
      .map(sentence => {
        if (Math.random() > 0.5) {
          return sentence.trim() + ' In other words, this had profound implications.';
        }
        return sentence;
      })
      .join(' ');
  }

  private static localTextSimplification(text: string, readingLevel: string): string {
    let simplified = text;

    // Simple replacements
    const replacements: Record<string, string> = {
      'utilize': 'use',
      'facilitate': 'help',
      'ameliorate': 'improve',
      'endeavor': 'try',
      'sufficient': 'enough',
      'numerous': 'many',
      'commencement': 'beginning',
    };

    for (const [complex, simple] of Object.entries(replacements)) {
      simplified = simplified.replaceAll(
        new RegExp(`\\b${complex}\\b`, 'gi'),
        simple
      );
    }

    // Break longer sentences
    if (readingLevel === 'elementary') {
      simplified = simplified
        .replace(/([.!?])\s+/g, '$1\n')
        .split('\n')
        .filter(s => s.trim())
        .join('\n');
    }

    return simplified;
  }

  private static generateLocalStoryIdeas(theme: string, genre?: string): string[] {
    const ideas = [
      `A mysterious ${theme} that changes the protagonist's life forever`,
      `Two characters with conflicting views on ${theme}`,
      `A journey to uncover the truth about ${theme}`,
      `What if ${theme} never existed?`,
      `A time-traveling story centered around ${theme}`,
    ];

    if (genre === 'fantasy') {
      ideas.push(`A magical world where ${theme} is forbidden`);
    } else if (genre === 'sci-fi') {
      ideas.push(`A futuristic take on ${theme}`);
    }

    return ideas;
  }

  private static generateLocalChapterOutline(synopsis: string, chapterCount: number): string[] {
    const outline = [];
    const sections = synopsis.split(/[.!?]+/).filter(s => s.trim());

    const chaptersPerSection = Math.ceil(chapterCount / sections.length);

    for (let i = 0; i < chapterCount; i++) {
      const sectionIdx = Math.floor(i / chaptersPerSection);
      const sectionContent = sections[sectionIdx] || 'Story continuation';
      outline.push(`Chapter ${i + 1}: ${sectionContent.trim()}`);
    }

    return outline;
  }

  private static localToneAnalysis(text: string): {
    detectedTone: string;
    toneScore: number;
    suggestions: string[];
  } {
    let toneScore = 0.5;
    let detectedTone = 'neutral';

    if (text.match(/[!]{2,}|amazing|awesome|wonderful/i)) {
      detectedTone = 'enthusiastic';
      toneScore = 0.8;
    } else if (text.match(/unfortunately|sadly|terrible/i)) {
      detectedTone = 'somber';
      toneScore = 0.3;
    } else if (text.match(/however|moreover|consequently/i)) {
      detectedTone = 'formal';
      toneScore = 0.7;
    }

    return {
      detectedTone,
      toneScore,
      suggestions: [
        'Consider your audience and maintain consistent tone',
        'Match tone to the genre and mood of your story',
      ],
    };
  }
}

/**
 * Poems Creator Service
 * Manages poetry creation, styles, and collections
 */

export interface Poem {
  id: string;
  title: string;
  author: string;
  content: string;
  style: PoemStyle;
  theme: string;
  mood: string;
  lineCount: number;
  wordCount: number;
  metrics: {
    syllables: number;
    rhymeScheme: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
}

export type PoemStyle = 
  | 'sonnet' 
  | 'haiku' 
  | 'free-verse' 
  | 'acrostic' 
  | 'limerick' 
  | 'haibun'
  | 'prose-poem'
  | 'blank-verse'
  | 'villanelle'
  | 'sestina';

export interface PoemTheme {
  name: string;
  description: string;
  keywords: string[];
  emoji: string;
}

export interface PoemPrompt {
  id: string;
  title: string;
  description: string;
  style: PoemStyle;
  themes: string[];
  starter: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface PoemCollection {
  id: string;
  title: string;
  description: string;
  poems: Poem[];
  isPublic: boolean;
  createdAt: Date;
}

const POEM_THEMES: Record<string, PoemTheme> = {
  'love': {
    name: 'Love & Romance',
    description: 'Express feelings of affection, passion, and connection',
    keywords: ['heart', 'soul', 'connection', 'passion', 'tender'],
    emoji: '💕',
  },
  'nature': {
    name: 'Nature & Seasons',
    description: 'Celebrate the beauty of the natural world',
    keywords: ['trees', 'flowers', 'rivers', 'mountains', 'seasons'],
    emoji: '🌿',
  },
  'loss': {
    name: 'Loss & Grief',
    description: 'Process emotions of loss, sadness, and change',
    keywords: ['goodbye', 'sorrow', 'empty', 'void', 'memory'],
    emoji: '🖤',
  },
  'hope': {
    name: 'Hope & Resilience',
    description: 'Inspire with themes of recovery and strength',
    keywords: ['dawn', 'light', 'strength', 'future', 'courage'],
    emoji: '✨',
  },
  'journey': {
    name: 'Journey & Adventure',
    description: 'Explore themes of travel and personal growth',
    keywords: ['path', 'horizon', 'quest', 'discovery', 'wandering'],
    emoji: '🗺️',
  },
  'identity': {
    name: 'Identity & Self',
    description: 'Explore self-discovery and personal truth',
    keywords: ['mirror', 'becoming', 'essence', 'truth', 'voice'],
    emoji: '🪞',
  },
  'social': {
    name: 'Social & Political',
    description: 'Address society and collective consciousness',
    keywords: ['unity', 'voice', 'change', 'justice', 'community'],
    emoji: '🤝',
  },
  'surreal': {
    name: 'Surreal & Abstract',
    description: 'Embrace dreamlike and abstract imagery',
    keywords: ['dream', 'floating', 'impossible', 'abstract', 'ethereal'],
    emoji: '🌀',
  },
};

const POEM_STYLES: Record<PoemStyle, { name: string; description: string; rules: string[] }> = {
  'sonnet': {
    name: 'Sonnet',
    description: '14 lines of iambic pentameter with a specific rhyme scheme',
    rules: [
      '14 lines total',
      'Iambic pentameter (10 syllables per line)',
      'ABAB CDCD EFEF GG rhyme scheme (Shakespearean)',
      'Usually about love, beauty, or deep emotion',
    ],
  },
  'haiku': {
    name: 'Haiku',
    description: 'A brief 3-line poem with 5-7-5 syllable structure',
    rules: [
      '3 lines only',
      '5-7-5 syllable pattern',
      'Often about nature or seasons',
      'Captures a single moment',
    ],
  },
  'free-verse': {
    name: 'Free Verse',
    description: 'No rhyme or meter required - focus on imagery and emotion',
    rules: [
      'No required rhyme scheme',
      'No required meter',
      'Emphasis on natural speech rhythm',
      'Focus on imagery and emotional truth',
    ],
  },
  'acrostic': {
    name: 'Acrostic',
    description: 'First letter of each line spells a word',
    rules: [
      'First letter of each line spells a word',
      'Can use any rhyme scheme',
      'Any meter',
      'Letter pattern is the main constraint',
    ],
  },
  'limerick': {
    name: 'Limerick',
    description: 'A humorous 5-line poem with AABBA rhyme scheme',
    rules: [
      '5 lines',
      'AABBA rhyme scheme',
      'Often humorous or whimsical',
      'Bouncy rhythm (anapestic)',
    ],
  },
  'haibun': {
    name: 'Haibun',
    description: 'Prose poetry followed by a haiku',
    rules: [
      'Prose section (paragraph)',
      'Followed by a haiku',
      'Prose and haiku complement each other',
      'Often about a journey or moment',
    ],
  },
  'prose-poem': {
    name: 'Prose Poem',
    description: 'Poetic language in prose form',
    rules: [
      'Written as paragraphs/prose',
      'Uses poetic devices (metaphor, imagery)',
      'Compressed and lyrical',
      'Ambiguous line between prose and poetry',
    ],
  },
  'blank-verse': {
    name: 'Blank Verse',
    description: 'Unrhymed lines of iambic pentameter',
    rules: [
      'No rhyme required',
      'Iambic pentameter (10 syllables per line)',
      'Formal structure without rhyme',
      'Often used in dramatic poetry',
    ],
  },
  'villanelle': {
    name: 'Villanelle',
    description: '19 lines with repeating refrains',
    rules: [
      '19 lines total',
      '5 tercets (3-line stanzas) + 1 quatrain (4-line stanza)',
      'Two rhymes throughout',
      'First and third lines repeat in pattern',
    ],
  },
  'sestina': {
    name: 'Sestina',
    description: '36 lines with repeating end words',
    rules: [
      '36 lines total',
      '6 stanzas of 6 lines + envoi (3 lines)',
      'No rhyme, only word repetition',
      'Six end words repeat in specific pattern',
    ],
  },
};

const POEM_MOODS = [
  { name: 'Melancholic', emoji: '🌧️', color: '#4A90E2' },
  { name: 'Joyful', emoji: '🌟', color: '#FFD700' },
  { name: 'Peaceful', emoji: '🧘', color: '#90EE90' },
  { name: 'Passionate', emoji: '🔥', color: '#FF4500' },
  { name: 'Whimsical', emoji: '✨', color: '#DDA0DD' },
  { name: 'Contemplative', emoji: '🤔', color: '#708090' },
  { name: 'Angry', emoji: '⚡', color: '#DC143C' },
  { name: 'Nostalgic', emoji: '⏳', color: '#CD853F' },
];

class PoemsCreatorServiceClass {
  /**
   * Create a new poem
   */
  createPoem(
    title: string,
    author: string,
    content: string,
    style: PoemStyle,
    theme: string,
    mood: string
  ): Poem {
    const lines = content.split('\n').filter(l => l.trim());
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const syllables = this.estimateSyllables(content);

    return {
      id: `poem-${Date.now()}`,
      title,
      author,
      content,
      style,
      theme,
      mood,
      lineCount: lines.length,
      wordCount: words.length,
      metrics: {
        syllables,
        rhymeScheme: this.analyzeRhymeScheme(lines),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: false,
      tags: [],
    };
  }

  /**
   * Get all poem styles
   */
  getStyles(): Record<PoemStyle, any> {
    return POEM_STYLES;
  }

  /**
   * Get a specific style
   */
  getStyle(styleId: PoemStyle): any {
    return POEM_STYLES[styleId];
  }

  /**
   * Get all themes
   */
  getThemes(): Record<string, PoemTheme> {
    return POEM_THEMES;
  }

  /**
   * Get a specific theme
   */
  getTheme(themeId: string): PoemTheme | undefined {
    return POEM_THEMES[themeId];
  }

  /**
   * Get all moods
   */
  getMoods() {
    return POEM_MOODS;
  }

  /**
   * Estimate syllable count
   */
  private estimateSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;

    for (const word of words) {
      // Simple estimation: vowel groups = syllables
      const vowels = word.match(/[aeiouy]/g);
      if (vowels) {
        count += vowels.length;
      }
    }

    return Math.max(1, count);
  }

  /**
   * Analyze rhyme scheme
   */
  private analyzeRhymeScheme(lines: string[]): string {
    if (lines.length === 0) return '';

    const endWords = lines.map(line => {
      const words = line.trim().split(/\s+/);
      return words[words.length - 1]?.toLowerCase() || '';
    });

    // Simple rhyme detection (last 2-3 characters)
    const scheme: string[] = [];
    const rhymeMap: Record<string, string> = {};
    let currentLetter = 'A';

    for (const word of endWords) {
      const suffix = word.slice(-2); // Simple: last 2 chars

      if (!rhymeMap[suffix]) {
        rhymeMap[suffix] = currentLetter;
        currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
      }

      scheme.push(rhymeMap[suffix]);
    }

    return scheme.join('');
  }

  /**
   * Get poem writing prompts
   */
  getPrompts(): PoemPrompt[] {
    return [
      {
        id: '1',
        title: 'Morning Light',
        description: 'Capture the essence of dawn breaking through darkness',
        style: 'haiku',
        themes: ['nature'],
        starter: 'Light spills across...',
        difficulty: 'beginner',
      },
      {
        id: '2',
        title: 'Lost & Found',
        description: 'Explore the journey of discovering something precious',
        style: 'free-verse',
        themes: ['journey', 'hope'],
        starter: 'I was searching for...',
        difficulty: 'intermediate',
      },
      {
        id: '3',
        title: 'Ode to Self',
        description: 'Write an acrostic about who you are',
        style: 'acrostic',
        themes: ['identity'],
        starter: 'Let each letter spell your truth...',
        difficulty: 'beginner',
      },
      {
        id: '4',
        title: 'Forbidden Love',
        description: 'A Shakespearean sonnet about love and longing',
        style: 'sonnet',
        themes: ['love'],
        starter: 'When first I saw your face...',
        difficulty: 'advanced',
      },
      {
        id: '5',
        title: 'Whimsical Tales',
        description: 'A humorous limerick about anything goes',
        style: 'limerick',
        themes: ['surreal'],
        starter: 'There once was a...',
        difficulty: 'beginner',
      },
      {
        id: '6',
        title: 'Echoes of Self',
        description: 'A villanelle exploring repetition and meaning',
        style: 'villanelle',
        themes: ['identity', 'contemplation'],
        starter: 'I am... (your repeating line)',
        difficulty: 'advanced',
      },
      {
        id: '7',
        title: 'Change in Colors',
        description: 'A haibun journey through personal transformation',
        style: 'haibun',
        themes: ['journey', 'hope'],
        starter: 'Walking through the seasons...',
        difficulty: 'intermediate',
      },
      {
        id: '8',
        title: 'The In-Between',
        description: 'A prose poem about liminal spaces and moments',
        style: 'prose-poem',
        themes: ['surreal', 'contemplative'],
        starter: 'In the space between...',
        difficulty: 'intermediate',
      },
    ];
  }

  /**
   * Clone a poem
   */
  clonePoem(poem: Poem): Poem {
    return {
      ...poem,
      id: `poem-${Date.now()}`,
      title: `${poem.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Add tags to poem
   */
  addTags(poem: Poem, tags: string[]): Poem {
    return {
      ...poem,
      tags: [...new Set([...poem.tags, ...tags])],
      updatedAt: new Date(),
    };
  }

  /**
   * Remove tags from poem
   */
  removeTag(poem: Poem, tag: string): Poem {
    return {
      ...poem,
      tags: poem.tags.filter(t => t !== tag),
      updatedAt: new Date(),
    };
  }

  /**
   * Create a collection
   */
  createCollection(
    title: string,
    description: string,
    isPublic: boolean = false
  ): PoemCollection {
    return {
      id: `collection-${Date.now()}`,
      title,
      description,
      poems: [],
      isPublic,
      createdAt: new Date(),
    };
  }

  /**
   * Add poem to collection
   */
  addPoemToCollection(collection: PoemCollection, poem: Poem): PoemCollection {
    return {
      ...collection,
      poems: [...collection.poems, poem],
    };
  }

  /**
   * Generate poem from AI prompt
   */
  async generateFromPrompt(
    prompt: string,
    style: PoemStyle,
    mood: string
  ): Promise<Partial<Poem>> {
    // This would integrate with an AI service
    return {
      style,
      mood,
      lineCount: 0,
      wordCount: 0,
    };
  }

  /**
   * Validate poem structure for style
   */
  validatePoemStructure(poem: Poem): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];

    if (poem.style === 'haiku' && poem.lineCount !== 3) {
      issues.push('Haiku must have exactly 3 lines');
    }

    if (poem.style === 'sonnet' && poem.lineCount !== 14) {
      issues.push('Sonnet must have exactly 14 lines');
    }

    if (poem.style === 'limerick' && poem.lineCount !== 5) {
      issues.push('Limerick must have exactly 5 lines');
    }

    if (poem.lineCount === 0) {
      issues.push('Poem cannot be empty');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }
}

export const PoemsCreatorService = new PoemsCreatorServiceClass();

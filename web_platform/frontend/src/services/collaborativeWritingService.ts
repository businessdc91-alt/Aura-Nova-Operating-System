/**
 * Collaborative Writing Service
 * Manages real-time collaborative writing, vibes, and shared creativity
 */

export interface WritingSession {
  id: string;
  title: string;
  description: string;
  creator: string;
  vibe: WritingVibe;
  theme: string;
  maxParticipants: number;
  currentParticipants: WritingParticipant[];
  content: string;
  createdAt: Date;
  lastUpdated: Date;
  isActive: boolean;
  wordLimit?: number;
  timeLimit?: number; // minutes
  writePrompt?: string;
}

export interface WritingParticipant {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  joinedAt: Date;
  isActive: boolean;
  contributedWords: number;
  lastActivity: Date;
}

export interface WritingVibe {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  pace: 'gentle' | 'moderate' | 'fast';
  focus: 'narrative' | 'poetry' | 'worldbuilding' | 'dialogue' | 'freestyle';
  mood: string;
}

export interface WritingPrompt {
  id: string;
  title: string;
  description: string;
  vibe: WritingVibe;
  starter: string;
  targetWords?: number;
  timeLimit?: number;
}

export interface WritingFeedback {
  id: string;
  author: string;
  section: string;
  feedback: string;
  sentiment: 'positive' | 'constructive' | 'neutral';
  timestamp: Date;
}

export interface WritingStatistics {
  totalWords: number;
  totalLines: number;
  averageLineLength: number;
  readabilityScore: number; // 0-100
  uniqueWords: number;
  topWords: Array<{ word: string; count: number }>;
}

const WRITING_VIBES: WritingVibe[] = [
  {
    id: 'cozy-cafe',
    name: 'Cozy Cafe',
    emoji: '☕',
    description: 'Warm, intimate, low-pressure writing sessions',
    color: '#8B4513',
    pace: 'gentle',
    focus: 'freestyle',
    mood: 'Relaxed & Comfortable',
  },
  {
    id: 'adventure-sprint',
    name: 'Adventure Sprint',
    emoji: '⚡',
    description: 'Fast-paced, exciting, action-driven writing',
    color: '#FF6347',
    pace: 'fast',
    focus: 'narrative',
    mood: 'Energetic & Bold',
  },
  {
    id: 'poetry-circle',
    name: 'Poetry Circle',
    emoji: '🌙',
    description: 'Lyrical, emotional, poetic expression',
    color: '#9370DB',
    pace: 'moderate',
    focus: 'poetry',
    mood: 'Artistic & Introspective',
  },
  {
    id: 'worldbuilding-forge',
    name: 'Worldbuilding Forge',
    emoji: '🗺️',
    description: 'Collaborative world-building and lore creation',
    color: '#228B22',
    pace: 'moderate',
    focus: 'worldbuilding',
    mood: 'Creative & Visionary',
  },
  {
    id: 'dialogue-jam',
    name: 'Dialogue Jam',
    emoji: '💬',
    description: 'Character voices and dynamic conversation',
    color: '#4169E1',
    pace: 'moderate',
    focus: 'dialogue',
    mood: 'Interactive & Playful',
  },
  {
    id: 'midnight-musings',
    name: 'Midnight Musings',
    emoji: '✨',
    description: 'Late-night, experimental, stream-of-consciousness',
    color: '#2F4F4F',
    pace: 'moderate',
    focus: 'freestyle',
    mood: 'Mysterious & Reflective',
  },
  {
    id: 'storytelling-circle',
    name: 'Storytelling Circle',
    emoji: '🔥',
    description: 'Narrative-focused, turn-based storytelling',
    color: '#FF4500',
    pace: 'moderate',
    focus: 'narrative',
    mood: 'Engaging & Immersive',
  },
  {
    id: 'flash-fiction',
    name: 'Flash Fiction',
    emoji: '⏱️',
    description: 'Quick writes with tight word/time limits',
    color: '#FFD700',
    pace: 'fast',
    focus: 'narrative',
    mood: 'Intense & Focused',
  },
];

const WRITING_THEMES = [
  'Fantasy & Magic',
  'Sci-Fi & Future',
  'Mystery & Thriller',
  'Romance & Relationships',
  'Horror & Dark',
  'Slice of Life',
  'Historical',
  'Adventure',
  'Comedy & Humor',
  'Drama & Emotions',
  'Mythology & Legend',
  'Psychological',
];

class CollaborativeWritingServiceClass {
  /**
   * Create a new writing session
   */
  createSession(
    title: string,
    description: string,
    creator: string,
    vibe: WritingVibe,
    theme: string,
    maxParticipants: number = 5
  ): WritingSession {
    return {
      id: `session-${Date.now()}`,
      title,
      description,
      creator,
      vibe,
      theme,
      maxParticipants,
      currentParticipants: [],
      content: '',
      createdAt: new Date(),
      lastUpdated: new Date(),
      isActive: true,
    };
  }

  /**
   * Get all available vibes
   */
  getVibes(): WritingVibe[] {
    return WRITING_VIBES;
  }

  /**
   * Get a specific vibe
   */
  getVibe(vibeId: string): WritingVibe | undefined {
    return WRITING_VIBES.find(v => v.id === vibeId);
  }

  /**
   * Get all themes
   */
  getThemes(): string[] {
    return WRITING_THEMES;
  }

  /**
   * Join a session
   */
  joinSession(
    session: WritingSession,
    participant: WritingParticipant
  ): WritingSession | null {
    if (session.currentParticipants.length >= session.maxParticipants) {
      return null; // Session full
    }

    return {
      ...session,
      currentParticipants: [...session.currentParticipants, participant],
      lastUpdated: new Date(),
    };
  }

  /**
   * Leave a session
   */
  leaveSession(session: WritingSession, participantId: string): WritingSession {
    return {
      ...session,
      currentParticipants: session.currentParticipants.filter(p => p.id !== participantId),
      lastUpdated: new Date(),
    };
  }

  /**
   * Add content to session
   */
  addContent(session: WritingSession, newContent: string): WritingSession {
    return {
      ...session,
      content: session.content + '\n' + newContent,
      lastUpdated: new Date(),
    };
  }

  /**
   * Update participant activity
   */
  updateParticipantActivity(
    session: WritingSession,
    participantId: string,
    wordsAdded: number
  ): WritingSession {
    return {
      ...session,
      currentParticipants: session.currentParticipants.map(p =>
        p.id === participantId
          ? {
              ...p,
              contributedWords: p.contributedWords + wordsAdded,
              lastActivity: new Date(),
            }
          : p
      ),
      lastUpdated: new Date(),
    };
  }

  /**
   * Generate collaborative prompts
   */
  getPrompts(): WritingPrompt[] {
    return [
      {
        id: '1',
        title: 'The Unexpected Visitor',
        description: 'A mysterious figure arrives at the door. What happens next?',
        vibe: WRITING_VIBES[0],
        starter: 'The knock came at midnight...',
        targetWords: 500,
      },
      {
        id: '2',
        title: 'Last Day on Earth',
        description: 'The world ends tomorrow. How do you spend your final day?',
        vibe: WRITING_VIBES[1],
        starter: 'As the sun rose for the last time...',
        targetWords: 1000,
      },
      {
        id: '3',
        title: 'Shattered Memories',
        description: 'Piece together a story from fragmented memories',
        vibe: WRITING_VIBES[2],
        starter: 'I remember a garden...',
        targetWords: 750,
      },
      {
        id: '4',
        title: 'Build a Kingdom',
        description: 'Collaboratively create a fantasy world with its own rules',
        vibe: WRITING_VIBES[3],
        starter: 'In the land of...',
        targetWords: 2000,
      },
      {
        id: '5',
        title: 'Character Conversations',
        description: 'Two characters meet for the first time',
        vibe: WRITING_VIBES[4],
        starter: '"Have we met before?"',
        targetWords: 600,
      },
      {
        id: '6',
        title: '5-Minute Flash Fiction',
        description: 'Write a complete story in just 5 minutes',
        vibe: WRITING_VIBES[7],
        starter: 'Everything changed when...',
        targetWords: 300,
        timeLimit: 5,
      },
    ];
  }

  /**
   * Calculate writing statistics
   */
  calculateStatistics(content: string): WritingStatistics {
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const lines = content.split('\n').filter(l => l.trim());
    
    const wordFreq: Record<string, number> = {};
    for (const word of words) {
      const normalized = word.toLowerCase().replace(/[^\w]/g, '');
      wordFreq[normalized] = (wordFreq[normalized] || 0) + 1;
    }

    const topWords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    const readability = Math.min(100, Math.max(0, 100 - words.length / 100));

    return {
      totalWords: words.length,
      totalLines: lines.length,
      averageLineLength: lines.length > 0 ? words.length / lines.length : 0,
      readabilityScore: Math.round(readability),
      uniqueWords: Object.keys(wordFreq).length,
      topWords,
    };
  }

  /**
   * Create a writing session from template
   */
  createFromTemplate(
    templateId: string,
    creator: string
  ): WritingSession | null {
    const prompt = this.getPrompts().find(p => p.id === templateId);
    if (!prompt) return null;

    return this.createSession(
      `Writing: ${prompt.title}`,
      prompt.description,
      creator,
      prompt.vibe,
      'Collaborative',
      4
    );
  }

  /**
   * Add feedback to content
   */
  addFeedback(
    feedback: WritingFeedback
  ): WritingFeedback {
    return {
      ...feedback,
      id: `feedback-${Date.now()}`,
    };
  }

  /**
   * Get participant leaderboard
   */
  getLeaderboard(session: WritingSession) {
    return [...session.currentParticipants]
      .sort((a, b) => b.contributedWords - a.contributedWords)
      .map((p, rank) => ({
        ...p,
        rank: rank + 1,
      }));
  }

  /**
   * Detect mood from content
   */
  detectMood(content: string): string {
    const sadWords = ['sad', 'lost', 'alone', 'dark', 'broken'];
    const happyWords = ['happy', 'joy', 'bright', 'love', 'smile'];
    const excitedWords = ['amazing', 'wow', 'incredible', 'exciting', 'thrilled'];

    const lowerContent = content.toLowerCase();
    const sadCount = sadWords.filter(w => lowerContent.includes(w)).length;
    const happyCount = happyWords.filter(w => lowerContent.includes(w)).length;
    const excitedCount = excitedWords.filter(w => lowerContent.includes(w)).length;

    if (excitedCount > happyCount && excitedCount > sadCount) return 'Excited';
    if (happyCount > sadCount) return 'Positive';
    if (sadCount > happyCount) return 'Melancholic';
    return 'Neutral';
  }

  /**
   * Clone a session
   */
  cloneSession(session: WritingSession): WritingSession {
    return {
      ...session,
      id: `session-${Date.now()}`,
      title: `${session.title} (Copy)`,
      content: '',
      currentParticipants: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
    };
  }

  /**
   * Export session as document
   */
  exportAsMarkdown(session: WritingSession): string {
    return `# ${session.title}\n\n**Vibe:** ${session.vibe.name}\n**Theme:** ${session.theme}\n\n---\n\n${session.content}`;
  }

  /**
   * Get writing tip for vibe
   */
  getTipForVibe(vibe: WritingVibe): string {
    const tips: Record<string, string> = {
      'cozy-cafe': '📝 Take your time. Sip your coffee and let the words flow naturally.',
      'adventure-sprint': '⚡ Go fast! Don\'t worry about perfection, just keep writing.',
      'poetry-circle': '✨ Focus on imagery and emotion. Let metaphors guide you.',
      'worldbuilding-forge': '🗺️ Build details. Think about the rules of your world.',
      'dialogue-jam': '💬 Listen to your characters\' voices. Let them speak.',
      'midnight-musings': '🌙 Free your mind. Embrace the strange and unexpected.',
      'storytelling-circle': '🔥 Keep the plot moving. Every sentence should matter.',
      'flash-fiction': '⏱️ Be concise. Every word counts in this format.',
    };
    return tips[vibe.id] || 'Keep writing. You\'re doing great!';
  }
}

export const CollaborativeWritingService = new CollaborativeWritingServiceClass();

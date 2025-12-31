/**
 * AURA GUIDE SERVICE
 * Intelligent navigation and recommendation system for AuraNova Studios
 * 
 * This service powers the AI-driven guide that helps users:
 * - Navigate to the right tools and suites
 * - Get personalized recommendations based on their goals
 * - Learn how to use features effectively
 * - Connect their work to external tools and exports
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UserIntent {
  category: IntentCategory;
  subCategory?: string;
  keywords: string[];
  confidence: number;
  suggestedActions: GuidedAction[];
}

export type IntentCategory = 
  | 'create-game'
  | 'create-art'
  | 'create-music'
  | 'create-writing'
  | 'create-code'
  | 'learn'
  | 'collaborate'
  | 'trade'
  | 'play'
  | 'customize'
  | 'export'
  | 'help'
  | 'navigate'
  | 'unknown';

export interface GuidedAction {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: string;
  priority: number;
  tags: string[];
  prerequisites?: string[];
  estimatedTime?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface FeatureGuide {
  id: string;
  name: string;
  description: string;
  route: string;
  suite: string;
  category: string;
  keywords: string[];
  capabilities: string[];
  tutorials: TutorialStep[];
  externalIntegrations: ExternalIntegration[];
  relatedFeatures: string[];
}

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  actionType?: 'click' | 'type' | 'navigate' | 'wait';
  targetElement?: string;
}

export interface ExternalIntegration {
  name: string;
  description: string;
  exportFormat?: string;
  importFormat?: string;
  instructions: string[];
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  currentRoute: string;
  messageHistory: ConversationMessage[];
  userProfile?: UserProfile;
  lastIntent?: UserIntent;
  activeProject?: string;
}

export interface ConversationMessage {
  role: 'user' | 'aura' | 'system';
  content: string;
  timestamp: Date;
  intent?: UserIntent;
  suggestions?: GuidedAction[];
}

export interface UserProfile {
  id: string;
  experienceLevel: 'new' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  interests: string[];
  completedTutorials: string[];
  frequentlyUsedFeatures: string[];
  creationHistory: string[];
  preferredAIModel?: string;
}

export interface GuideResponse {
  message: string;
  suggestions: GuidedAction[];
  followUpQuestions?: string[];
  tutorials?: TutorialStep[];
  externalTips?: string[];
  relatedFeatures?: FeatureGuide[];
}

// ============================================================================
// FEATURE KNOWLEDGE BASE
// ============================================================================

export const PLATFORM_FEATURES: FeatureGuide[] = [
  // ========== DEV SUITE ==========
  {
    id: 'dojo',
    name: 'The Dojo',
    description: 'Generate game code for Unreal Engine, Unity, Godot, Phaser, and LÖVE2D. Create characters, systems, and complete game mechanics.',
    route: '/dojo',
    suite: 'dev',
    category: 'game-development',
    keywords: ['game', 'unreal', 'unity', 'godot', 'phaser', 'love2d', 'character', 'npc', 'enemy', 'player', 'weapon', 'inventory', 'dialogue', 'quest', 'combat'],
    capabilities: [
      'Generate C++ code for Unreal Engine with UCLASS macros',
      'Generate C# scripts for Unity with proper namespaces',
      'Generate GDScript for Godot with node structure',
      'Generate JavaScript for Phaser with scene management',
      'Generate Lua for LÖVE2D with love callbacks',
      'Create complete character controllers',
      'Design inventory and item systems',
      'Build dialogue and quest systems',
      'Generate AI behavior trees',
    ],
    tutorials: [
      { id: 'dojo-1', title: 'Your First Character', content: 'Select an engine, describe your character, and generate code instantly.' },
      { id: 'dojo-2', title: 'Combat Systems', content: 'Use the Combat template to generate attack, health, and damage systems.' },
      { id: 'dojo-3', title: 'Exporting Code', content: 'Copy the generated code directly into your game engine project.' },
    ],
    externalIntegrations: [
      {
        name: 'Unreal Engine',
        description: 'Copy generated C++ files into your Source folder',
        exportFormat: '.h, .cpp',
        instructions: [
          'Create a new Actor or Component in Unreal',
          'Replace the generated code with The Dojo output',
          'Compile in the editor (Ctrl+Alt+F11)',
        ],
      },
      {
        name: 'Unity',
        description: 'Drop C# scripts into your Scripts folder',
        exportFormat: '.cs',
        instructions: [
          'Create a Scripts folder in your Unity project',
          'Save the generated code as a .cs file',
          'Attach the script to a GameObject',
        ],
      },
    ],
    relatedFeatures: ['constructor', 'code-editor', 'vibe-coding'],
  },
  {
    id: 'constructor',
    name: 'Component Constructor',
    description: 'Build React, Vue, and Svelte components with TypeScript support, Storybook stories, and unit tests.',
    route: '/constructor',
    suite: 'dev',
    category: 'web-development',
    keywords: ['react', 'vue', 'svelte', 'component', 'ui', 'button', 'form', 'card', 'modal', 'typescript', 'storybook', 'test'],
    capabilities: [
      'Generate React functional components with hooks',
      'Generate Vue 3 components with Composition API',
      'Generate Svelte components with reactive statements',
      'Include TypeScript interfaces',
      'Generate Storybook stories',
      'Create Jest/Vitest unit tests',
      'Add Tailwind CSS styling',
    ],
    tutorials: [
      { id: 'constructor-1', title: 'Creating a Button', content: 'Describe your button and get a complete component with variants.' },
      { id: 'constructor-2', title: 'Form Components', content: 'Generate forms with validation and state management.' },
    ],
    externalIntegrations: [
      {
        name: 'Next.js',
        description: 'Copy components into your components folder',
        exportFormat: '.tsx',
        instructions: [
          'Create a components folder in your Next.js project',
          'Save the component with proper naming (PascalCase)',
          'Import and use in your pages',
        ],
      },
    ],
    relatedFeatures: ['code-editor', 'dojo', 'script-fusion'],
  },
  {
    id: 'code-editor',
    name: 'Code Editor',
    description: 'Browser-based multi-file code editor with syntax highlighting, AI assistance, and live preview.',
    route: '/code-editor',
    suite: 'dev',
    category: 'development-tools',
    keywords: ['code', 'editor', 'programming', 'syntax', 'javascript', 'typescript', 'python', 'css', 'html'],
    capabilities: [
      'Multi-file editing with tabs',
      'Syntax highlighting for 20+ languages',
      'AI-powered code suggestions',
      'Error detection and fixing',
      'Live preview for web code',
      'Export as ZIP archive',
    ],
    tutorials: [],
    externalIntegrations: [
      {
        name: 'VS Code',
        description: 'Export and open in VS Code',
        exportFormat: '.zip',
        instructions: ['Download the project as ZIP', 'Extract and open folder in VS Code'],
      },
    ],
    relatedFeatures: ['constructor', 'vibe-coding', 'script-fusion'],
  },
  {
    id: 'vibe-coding',
    name: 'Vibe Coding',
    description: 'Collaborative AI coding where you and Aura take turns building code together.',
    route: '/vibe-coding',
    suite: 'dev',
    category: 'ai-collaboration',
    keywords: ['ai', 'collaborate', 'pair', 'programming', 'together', 'aura', 'help', 'build'],
    capabilities: [
      'Turn-based coding with AI',
      'Real-time suggestions',
      'Code explanation',
      'Refactoring assistance',
      'Learning through collaboration',
    ],
    tutorials: [],
    externalIntegrations: [],
    relatedFeatures: ['code-editor', 'dojo'],
  },
  {
    id: 'script-fusion',
    name: 'Script Fusion',
    description: 'Intelligently merge multiple scripts into one cohesive file with conflict resolution.',
    route: '/script-fusion',
    suite: 'dev',
    category: 'development-tools',
    keywords: ['merge', 'combine', 'scripts', 'conflict', 'resolution', 'refactor'],
    capabilities: [
      'Merge multiple JS/TS files',
      'Detect and resolve conflicts',
      'Preserve functionality',
      'Clean up duplicate code',
    ],
    tutorials: [],
    externalIntegrations: [],
    relatedFeatures: ['code-editor', 'constructor'],
  },

  // ========== ART SUITE ==========
  {
    id: 'art-studio',
    name: 'Art Studio',
    description: 'Complete art creation toolkit with background remover, sprite animator, and AI art generation.',
    route: '/art-studio',
    suite: 'art',
    category: 'visual-creation',
    keywords: ['art', 'image', 'background', 'remove', 'sprite', 'animation', 'pixel', 'draw', 'design', 'ai', 'generate'],
    capabilities: [
      'Remove backgrounds from images',
      'Create sprite sheets and animations',
      'Generate AI art with various styles',
      'Pixel art editor',
      'Color palette extraction',
      'Image effects and filters',
    ],
    tutorials: [
      { id: 'art-1', title: 'Background Removal', content: 'Upload any image and get a transparent PNG in seconds.' },
      { id: 'art-2', title: 'Sprite Animation', content: 'Create frame-by-frame animations and export as sprite sheets.' },
    ],
    externalIntegrations: [
      {
        name: 'Game Engines',
        description: 'Export sprites for use in any game engine',
        exportFormat: '.png, .json (atlas)',
        instructions: [
          'Create your sprite animation',
          'Export as sprite sheet or individual frames',
          'Import into Unity/Unreal/Godot',
        ],
      },
      {
        name: 'Photoshop/GIMP',
        description: 'Export transparent PNGs for further editing',
        exportFormat: '.png',
        instructions: ['Download the processed image', 'Open in your preferred editor'],
      },
    ],
    relatedFeatures: ['avatar-builder', 'clothing-creator'],
  },
  {
    id: 'avatar-builder',
    name: 'Avatar Builder',
    description: 'Create customizable avatars with different body types, clothing, and poses.',
    route: '/avatar-builder',
    suite: 'art',
    category: 'character-creation',
    keywords: ['avatar', 'character', 'customize', 'body', 'clothes', 'pose', 'profile', 'picture'],
    capabilities: [
      'Multiple body types and shapes',
      'Skin tone customization',
      'Hair styles and colors',
      'Clothing layers',
      'Pose selection',
      'Export as PNG',
    ],
    tutorials: [],
    externalIntegrations: [
      {
        name: 'Social Media',
        description: 'Use as profile picture anywhere',
        exportFormat: '.png',
        instructions: ['Create and customize your avatar', 'Export as PNG', 'Upload as profile picture'],
      },
    ],
    relatedFeatures: ['clothing-creator', 'outfit-generator'],
  },
  {
    id: 'clothing-creator',
    name: 'Clothing Creator',
    description: 'Design custom clothing items for avatars with patterns, colors, and styles.',
    route: '/clothing-creator',
    suite: 'art',
    category: 'design',
    keywords: ['clothes', 'fashion', 'design', 'outfit', 'shirt', 'pants', 'dress', 'pattern'],
    capabilities: [
      'Design tops, bottoms, and accessories',
      'Apply patterns and textures',
      'Color customization',
      'Layer multiple items',
      'Save to wardrobe',
    ],
    tutorials: [],
    externalIntegrations: [],
    relatedFeatures: ['avatar-builder', 'outfit-generator'],
  },

  // ========== LITERATURE SUITE ==========
  {
    id: 'poems-creator',
    name: 'Poems Creator',
    description: 'Write poetry in 10 different styles with structure validation and AI assistance.',
    route: '/poems-creator',
    suite: 'art',
    category: 'creative-writing',
    keywords: ['poem', 'poetry', 'haiku', 'sonnet', 'verse', 'rhyme', 'write', 'creative'],
    capabilities: [
      '10 poem styles (Sonnet, Haiku, Free Verse, etc.)',
      'Real-time syllable counting',
      'Rhyme scheme analysis',
      'Structure validation',
      'AI writing assistance',
      'Poetry collections',
    ],
    tutorials: [
      { id: 'poem-1', title: 'Writing a Haiku', content: 'Master the 5-7-5 syllable pattern with instant validation.' },
    ],
    externalIntegrations: [
      {
        name: 'Document Export',
        description: 'Export poems as formatted documents',
        exportFormat: '.txt, .pdf',
        instructions: ['Write your poem', 'Click Export', 'Choose format'],
      },
    ],
    relatedFeatures: ['music-composer', 'collaborative-writing', 'literature-zone'],
  },
  {
    id: 'music-composer',
    name: 'Music Composer',
    description: 'Create music with 12 instruments, effects, and AI-assisted composition.',
    route: '/music-composer',
    suite: 'art',
    category: 'audio-creation',
    keywords: ['music', 'compose', 'song', 'instrument', 'beat', 'melody', 'piano', 'guitar', 'drums'],
    capabilities: [
      '12 virtual instruments',
      '10 musical scales',
      '15 genre presets',
      'Real-time mixer',
      'Effects (reverb, delay, etc.)',
      'AI melody generation',
      'Export as audio',
    ],
    tutorials: [],
    externalIntegrations: [
      {
        name: 'DAW Software',
        description: 'Export MIDI or audio for professional software',
        exportFormat: '.mid, .wav',
        instructions: ['Compose your track', 'Export as MIDI or WAV', 'Import into Ableton/FL Studio/Logic'],
      },
    ],
    relatedFeatures: ['poems-creator', 'literature-zone'],
  },
  {
    id: 'collaborative-writing',
    name: 'Collaborative Writing',
    description: 'Write stories and documents with real-time collaboration and AI assistance.',
    route: '/collaborative-writing',
    suite: 'art',
    category: 'creative-writing',
    keywords: ['write', 'story', 'collaborate', 'together', 'book', 'novel', 'chapter'],
    capabilities: [
      'Real-time multi-user editing',
      'AI writing suggestions',
      'Word count and statistics',
      'Chapter organization',
      'Export options',
    ],
    tutorials: [],
    externalIntegrations: [
      {
        name: 'Google Docs',
        description: 'Export to continue editing in Google Docs',
        exportFormat: '.docx',
        instructions: ['Write your content', 'Export as DOCX', 'Upload to Google Docs'],
      },
    ],
    relatedFeatures: ['poems-creator', 'writing-library'],
  },

  // ========== ACADEMICS SUITE ==========
  {
    id: 'academics',
    name: 'Academics Suite',
    description: 'AI-powered learning with tutoring, flashcards, quizzes, and study planning.',
    route: '/suites/academics',
    suite: 'academics',
    category: 'education',
    keywords: ['learn', 'study', 'tutor', 'flashcard', 'quiz', 'homework', 'school', 'math', 'science', 'history'],
    capabilities: [
      'AI tutor for any subject',
      'Smart flashcard generation',
      'Quiz creation and testing',
      'Study planner',
      'Progress tracking',
      'Multiple learning modes',
    ],
    tutorials: [],
    externalIntegrations: [
      {
        name: 'Anki',
        description: 'Export flashcards for Anki',
        exportFormat: '.apkg',
        instructions: ['Create flashcards', 'Export in Anki format', 'Import into Anki app'],
      },
    ],
    relatedFeatures: ['challenges'],
  },

  // ========== GAMES SUITE ==========
  {
    id: 'games',
    name: 'Games Suite',
    description: 'Play mini-games, complete challenges, and earn rewards.',
    route: '/suites/games',
    suite: 'games',
    category: 'entertainment',
    keywords: ['game', 'play', 'fun', 'puzzle', 'challenge', 'earn', 'points', 'leaderboard'],
    capabilities: [
      'Multiple mini-games',
      'Daily challenges',
      'Leaderboards',
      'Reward system',
      'Achievement tracking',
    ],
    tutorials: [],
    externalIntegrations: [],
    relatedFeatures: ['challenges', 'aetherium'],
  },
  {
    id: 'aetherium',
    name: 'Aetherium TCG',
    description: 'Collect, trade, and battle with digital trading cards.',
    route: '/suites/aetherium',
    suite: 'games',
    category: 'card-game',
    keywords: ['card', 'trading', 'collect', 'battle', 'deck', 'tcg', 'rare', 'legendary'],
    capabilities: [
      '500+ unique cards',
      'Deck building',
      'PvP battles',
      'Card trading',
      'Daily rewards',
      'Tournaments',
    ],
    tutorials: [],
    externalIntegrations: [],
    relatedFeatures: ['games', 'marketplace', 'challenges'],
  },

  // ========== COMMUNITY & MARKETPLACE ==========
  {
    id: 'marketplace',
    name: 'Grand Exchange',
    description: 'Trade assets, templates, and creations with other users.',
    route: '/suites/marketplace',
    suite: 'marketplace',
    category: 'trading',
    keywords: ['buy', 'sell', 'trade', 'market', 'asset', 'template', 'shop', 'store'],
    capabilities: [
      'Buy and sell creations',
      'Asset marketplace',
      'Template store',
      'Auction system',
      'Currency exchange',
    ],
    tutorials: [],
    externalIntegrations: [],
    relatedFeatures: ['aetherium', 'workspace'],
  },
  {
    id: 'community',
    name: 'Community Suite',
    description: 'Connect with other creators through chat, collaboration, and social features.',
    route: '/suites/community',
    suite: 'community',
    category: 'social',
    keywords: ['chat', 'talk', 'friend', 'collaborate', 'team', 'group', 'share', 'social'],
    capabilities: [
      'Real-time chat',
      'Collaboration rooms',
      'User profiles',
      'Project sharing',
      'Activity feed',
    ],
    tutorials: [],
    externalIntegrations: [],
    relatedFeatures: ['chat', 'profile'],
  },
  {
    id: 'chat',
    name: 'Chat',
    description: 'Real-time messaging with channels, direct messages, and file sharing.',
    route: '/chat',
    suite: 'community',
    category: 'communication',
    keywords: ['chat', 'message', 'talk', 'dm', 'channel', 'communicate'],
    capabilities: [
      'Public channels',
      'Private channels',
      'Direct messages',
      'File sharing',
      'Emoji reactions',
      'Message editing',
    ],
    tutorials: [],
    externalIntegrations: [],
    relatedFeatures: ['community'],
  },

  // ========== SYSTEM & NAVIGATION ==========
  {
    id: 'os',
    name: 'OS Mode',
    description: 'Full desktop experience with windowed apps and seamless multitasking.',
    route: '/os',
    suite: 'system',
    category: 'interface',
    keywords: ['desktop', 'windows', 'multitask', 'os', 'taskbar', 'apps'],
    capabilities: [
      'Window management',
      'Taskbar with open apps',
      'Multiple apps simultaneously',
      'Desktop customization',
      'Quick launch',
    ],
    tutorials: [],
    externalIntegrations: [],
    relatedFeatures: ['workspace'],
  },
  {
    id: 'workspace',
    name: 'Workspace',
    description: 'Central hub for all your created assets, projects, and downloads.',
    route: '/workspace',
    suite: 'system',
    category: 'management',
    keywords: ['files', 'projects', 'assets', 'organize', 'manage', 'download', 'save'],
    capabilities: [
      'File organization',
      'Project management',
      'Asset library',
      'Download history',
      'Export tools',
    ],
    tutorials: [],
    externalIntegrations: [],
    relatedFeatures: ['os'],
  },
  {
    id: 'challenges',
    name: 'Daily Challenges',
    description: 'Complete daily challenges to earn Aether Coins and Aurora Points.',
    route: '/challenges',
    suite: 'system',
    category: 'rewards',
    keywords: ['challenge', 'daily', 'earn', 'coin', 'point', 'reward', 'quest'],
    capabilities: [
      'Daily challenges per section',
      'AI persona interactions',
      'Coin rewards',
      'Streak bonuses',
      'Leaderboards',
    ],
    tutorials: [],
    externalIntegrations: [],
    relatedFeatures: ['aetherium', 'games'],
  },
  {
    id: 'onboarding',
    name: 'Setup Wizard',
    description: 'Configure your AI model and personalize your experience.',
    route: '/onboarding',
    suite: 'system',
    category: 'setup',
    keywords: ['setup', 'configure', 'model', 'ai', 'ollama', 'lmstudio', 'start', 'begin'],
    capabilities: [
      'AI model selection',
      'LM Studio / Ollama setup',
      'Connection testing',
      'Model naming',
      'Personalization',
    ],
    tutorials: [
      { id: 'onboard-1', title: 'Setting Up LM Studio', content: 'Download LM Studio, install a model, and connect it to AuraNova.' },
      { id: 'onboard-2', title: 'Setting Up Ollama', content: 'Install Ollama, pull a model, and configure the endpoint.' },
    ],
    externalIntegrations: [
      {
        name: 'LM Studio',
        description: 'Run AI models locally on your computer',
        instructions: [
          'Download LM Studio from lmstudio.ai',
          'Install a model (recommended: 2-4B for laptops)',
          'Start the local server',
          'Enter the endpoint in AuraNova setup',
        ],
      },
      {
        name: 'Ollama',
        description: 'Command-line AI model runner',
        instructions: [
          'Install Ollama from ollama.ai',
          'Run: ollama pull llama2',
          'Run: ollama serve',
          'Enter http://localhost:11434 as endpoint',
        ],
      },
    ],
    relatedFeatures: ['models'],
  },
];

// ============================================================================
// INTENT DETECTION
// ============================================================================

const INTENT_PATTERNS: Record<IntentCategory, string[]> = {
  'create-game': [
    'game', 'unreal', 'unity', 'godot', 'character', 'player', 'enemy', 'npc',
    'weapon', 'inventory', 'quest', 'dialogue', 'combat', 'level', 'platformer',
    'rpg', 'shooter', 'puzzle', 'phaser', 'love2d', 'dojo'
  ],
  'create-art': [
    'art', 'draw', 'paint', 'sprite', 'animation', 'pixel', 'background',
    'remove', 'image', 'picture', 'design', 'avatar', 'character', 'clothes',
    'outfit', 'fashion', 'color', 'style'
  ],
  'create-music': [
    'music', 'song', 'compose', 'beat', 'melody', 'instrument', 'piano',
    'guitar', 'drums', 'sound', 'audio', 'track'
  ],
  'create-writing': [
    'write', 'story', 'poem', 'poetry', 'novel', 'book', 'chapter', 'haiku',
    'sonnet', 'verse', 'creative', 'fiction', 'blog', 'article'
  ],
  'create-code': [
    'code', 'program', 'component', 'react', 'vue', 'svelte', 'javascript',
    'typescript', 'python', 'website', 'app', 'function', 'script', 'merge'
  ],
  'learn': [
    'learn', 'study', 'teach', 'tutorial', 'how', 'help', 'explain', 'understand',
    'practice', 'homework', 'quiz', 'flashcard', 'tutor', 'education', 'school'
  ],
  'collaborate': [
    'together', 'collaborate', 'team', 'partner', 'group', 'share', 'work with',
    'join', 'invite', 'cowork'
  ],
  'trade': [
    'buy', 'sell', 'trade', 'market', 'shop', 'store', 'exchange', 'auction',
    'price', 'coin', 'currency'
  ],
  'play': [
    'play', 'game', 'fun', 'arcade', 'puzzle', 'challenge', 'card', 'battle',
    'deck', 'collect', 'aetherium', 'tcg'
  ],
  'customize': [
    'customize', 'personalize', 'settings', 'configure', 'setup', 'profile',
    'avatar', 'theme', 'preference'
  ],
  'export': [
    'export', 'download', 'save', 'file', 'zip', 'pdf', 'png', 'copy', 'use outside',
    'external', 'transfer', 'take'
  ],
  'help': [
    'help', 'stuck', 'confused', 'lost', 'what', 'where', 'how', 'guide',
    'support', 'assist', 'problem', 'issue', 'cant', "can't", "don't know"
  ],
  'navigate': [
    'go to', 'open', 'find', 'show', 'take me', 'navigate', 'where is',
    'looking for', 'need', 'want'
  ],
  'unknown': [],
};

export class AuraGuideService {
  private features: FeatureGuide[];
  private context: ConversationContext | null = null;

  constructor() {
    this.features = PLATFORM_FEATURES;
  }

  /**
   * Initialize or update conversation context
   */
  setContext(context: Partial<ConversationContext>): void {
    if (!this.context) {
      this.context = {
        userId: context.userId || 'anonymous',
        sessionId: context.sessionId || `session-${Date.now()}`,
        currentRoute: context.currentRoute || '/',
        messageHistory: context.messageHistory || [],
        userProfile: context.userProfile,
      };
    } else {
      this.context = { ...this.context, ...context };
    }
  }

  /**
   * Detect user intent from message
   */
  detectIntent(message: string): UserIntent {
    const lowerMessage = message.toLowerCase();
    const words = lowerMessage.split(/\s+/);
    
    const intentScores: Record<IntentCategory, number> = {
      'create-game': 0,
      'create-art': 0,
      'create-music': 0,
      'create-writing': 0,
      'create-code': 0,
      'learn': 0,
      'collaborate': 0,
      'trade': 0,
      'play': 0,
      'customize': 0,
      'export': 0,
      'help': 0,
      'navigate': 0,
      'unknown': 0,
    };

    // Score each intent based on keyword matches
    for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (lowerMessage.includes(pattern)) {
          intentScores[intent as IntentCategory] += pattern.length > 4 ? 2 : 1;
        }
      }
    }

    // Find the highest scoring intent
    let topIntent: IntentCategory = 'unknown';
    let topScore = 0;
    
    for (const [intent, score] of Object.entries(intentScores)) {
      if (score > topScore) {
        topScore = score;
        topIntent = intent as IntentCategory;
      }
    }

    // Get matching keywords
    const matchedKeywords: string[] = [];
    for (const pattern of INTENT_PATTERNS[topIntent] || []) {
      if (lowerMessage.includes(pattern)) {
        matchedKeywords.push(pattern);
      }
    }

    // Get suggested actions based on intent
    const suggestedActions = this.getActionsForIntent(topIntent, matchedKeywords);

    return {
      category: topIntent,
      keywords: matchedKeywords,
      confidence: Math.min(topScore / 10, 1),
      suggestedActions,
    };
  }

  /**
   * Get relevant actions for an intent
   */
  private getActionsForIntent(intent: IntentCategory, keywords: string[]): GuidedAction[] {
    const actions: GuidedAction[] = [];
    
    // Map intents to feature suites
    const intentToSuites: Record<IntentCategory, string[]> = {
      'create-game': ['dev'],
      'create-art': ['art'],
      'create-music': ['art'],
      'create-writing': ['art'],
      'create-code': ['dev'],
      'learn': ['academics'],
      'collaborate': ['community'],
      'trade': ['marketplace'],
      'play': ['games'],
      'customize': ['system'],
      'export': ['system'],
      'help': ['system'],
      'navigate': ['system'],
      'unknown': [],
    };

    const relevantSuites = intentToSuites[intent] || [];
    
    // Find features that match the intent
    for (const feature of this.features) {
      const keywordMatch = keywords.some(kw => 
        feature.keywords.includes(kw) || 
        feature.name.toLowerCase().includes(kw) ||
        feature.description.toLowerCase().includes(kw)
      );

      const suiteMatch = relevantSuites.includes(feature.suite);

      if (keywordMatch || suiteMatch) {
        actions.push({
          id: feature.id,
          title: feature.name,
          description: feature.description,
          route: feature.route,
          icon: this.getIconForFeature(feature.id),
          priority: keywordMatch ? 10 : 5,
          tags: feature.keywords.slice(0, 5),
          difficulty: this.getDifficultyForFeature(feature.id),
        });
      }
    }

    // Sort by priority
    return actions.sort((a, b) => b.priority - a.priority).slice(0, 5);
  }

  /**
   * Process user message and generate response
   */
  async processMessage(message: string): Promise<GuideResponse> {
    const intent = this.detectIntent(message);
    
    // Store in context
    if (this.context) {
      this.context.lastIntent = intent;
      this.context.messageHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
        intent,
      });
    }

    // Generate response based on intent
    const response = this.generateResponse(intent, message);

    // Store Aura's response
    if (this.context) {
      this.context.messageHistory.push({
        role: 'aura',
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
      });
    }

    return response;
  }

  /**
   * Generate contextual response
   */
  private generateResponse(intent: UserIntent, originalMessage: string): GuideResponse {
    const lowerMessage = originalMessage.toLowerCase();
    
    // Welcome / General Help
    if (intent.category === 'help' || intent.category === 'unknown') {
      return {
        message: `Hi! I'm Aura, your creative companion here at AuraNova Studios. 🌟\n\nI can help you with:\n• 🎮 **Game Development** - Create characters, systems, and code for Unreal, Unity, Godot & more\n• 🎨 **Art & Design** - Make avatars, remove backgrounds, create sprites\n• ✍️ **Creative Writing** - Poetry, stories, and collaborative writing\n• 🎵 **Music** - Compose tracks with virtual instruments\n• 📚 **Learning** - AI tutoring and study tools\n• 🎲 **Games & Trading Cards** - Play mini-games and collect cards\n\nWhat would you like to create today?`,
        suggestions: this.getTopFeatures(5),
        followUpQuestions: [
          "What kind of project are you working on?",
          "Are you new here? Would you like a tour?",
          "Do you have a specific tool in mind?",
        ],
      };
    }

    // Game Development
    if (intent.category === 'create-game') {
      const engine = this.detectGameEngine(lowerMessage);
      return {
        message: `Ready to build something epic! 🎮\n\n${engine ? `I see you're interested in **${engine}**! ` : ''}The Dojo is our game development powerhouse. You can generate:\n\n• Player controllers & character systems\n• Enemy AI and behavior trees\n• Inventory and item systems\n• Dialogue and quest systems\n• Combat mechanics\n• And much more!\n\nJust describe what you want to build, and I'll generate production-ready code.`,
        suggestions: intent.suggestedActions,
        tutorials: this.getTutorialsForFeature('dojo'),
        externalTips: [
          "Generated code includes proper engine macros (UCLASS, UPROPERTY for Unreal)",
          "Copy code directly into your engine's script folder",
          "Use the Component Constructor for UI elements to go with your game",
        ],
      };
    }

    // Art Creation
    if (intent.category === 'create-art') {
      return {
        message: `Time to get creative! 🎨\n\nOur Art Suite has everything you need:\n\n• **Art Studio** - Background removal, sprite animation, AI art generation\n• **Avatar Builder** - Create custom characters\n• **Clothing Creator** - Design outfits and accessories\n\nWhether you're making game assets, profile pictures, or just having fun, I've got you covered!`,
        suggestions: intent.suggestedActions,
        externalTips: [
          "Export sprites as PNG with transparency for game engines",
          "Create sprite sheets for frame-by-frame animation",
          "Use background removal for quick game asset creation",
        ],
      };
    }

    // Music
    if (intent.category === 'create-music') {
      return {
        message: `Let's make some music! 🎵\n\nThe Music Composer gives you:\n\n• 12 virtual instruments across 4 categories\n• 10 musical scales and 15 genres\n• Real-time mixer with effects\n• AI-assisted melody generation\n\nYou can create full tracks and export them for use anywhere!`,
        suggestions: intent.suggestedActions,
        externalTips: [
          "Export as MIDI for use in professional DAWs (Ableton, FL Studio, Logic)",
          "Export as WAV for direct use in games or videos",
          "Use the mood presets to quickly set the vibe",
        ],
      };
    }

    // Writing
    if (intent.category === 'create-writing') {
      return {
        message: `Ready to write something amazing! ✍️\n\nExplore our Literature Zone:\n\n• **Poems Creator** - 10 styles with validation (Haiku, Sonnet, Free Verse...)\n• **Music Composer** - Create songs to accompany your words\n• **Collaborative Writing** - Write stories with others\n• **Writing Library** - Organize all your documents\n\nI can help with structure, suggestions, and inspiration!`,
        suggestions: intent.suggestedActions,
        externalTips: [
          "Export poems as formatted PDFs for printing or sharing",
          "Use the word count and syllable tools for precise poetry",
          "Collaborate in real-time with other writers",
        ],
      };
    }

    // Code / Components
    if (intent.category === 'create-code') {
      return {
        message: `Let's build something! 💻\n\nOur dev tools include:\n\n• **Component Constructor** - Generate React, Vue, Svelte components with tests\n• **Code Editor** - Full browser-based IDE\n• **Vibe Coding** - Collaborative AI coding\n• **Script Fusion** - Merge multiple scripts intelligently\n\nDescribe what you want to build and I'll help you create it!`,
        suggestions: intent.suggestedActions,
        externalTips: [
          "Generated components include TypeScript types",
          "Storybook stories are included for documentation",
          "Export as ZIP for easy import into VS Code",
        ],
      };
    }

    // Learning
    if (intent.category === 'learn') {
      return {
        message: `Learning mode activated! 📚\n\nThe Academics Suite offers:\n\n• AI tutor for any subject\n• Smart flashcard generation\n• Quiz creation and testing\n• Study planning and tracking\n\nI can explain concepts, quiz you, or help you master any skill!`,
        suggestions: intent.suggestedActions,
        followUpQuestions: [
          "What subject are you studying?",
          "Would you like flashcards or a quiz?",
          "Do you prefer explanations or practice problems?",
        ],
      };
    }

    // Collaborate
    if (intent.category === 'collaborate') {
      return {
        message: `Collaboration makes everything better! 👥\n\nConnect with the community:\n\n• **Chat** - Real-time messaging with channels\n• **Collaborative Writing** - Write together in real-time\n• **Vibe Coding** - Code alongside AI\n• **Community Suite** - Find other creators\n\nTeam up to create something amazing!`,
        suggestions: intent.suggestedActions,
      };
    }

    // Trade
    if (intent.category === 'trade') {
      return {
        message: `Welcome to the Grand Exchange! 💰\n\nHere you can:\n\n• Buy and sell digital assets\n• Trade templates and creations\n• Auction rare items\n• Earn through your creativity\n\nYour creations have value - share them with the community!`,
        suggestions: intent.suggestedActions,
      };
    }

    // Play
    if (intent.category === 'play') {
      return {
        message: `Time for some fun! 🎲\n\nCheck out our games:\n\n• **Mini-Games Suite** - Puzzles and challenges\n• **Aetherium TCG** - Trading card game with 500+ cards\n• **Daily Challenges** - Earn rewards every day\n• **AI Games** - Play against smart AI opponents\n\nPlay, earn coins, and collect rare items!`,
        suggestions: intent.suggestedActions,
      };
    }

    // Navigate
    if (intent.category === 'navigate') {
      return {
        message: `I'll help you find your way! 🧭\n\nHere are the main areas of AuraNova Studios:`,
        suggestions: intent.suggestedActions.length > 0 
          ? intent.suggestedActions 
          : this.getTopFeatures(5),
        followUpQuestions: [
          "What are you looking to do?",
          "Would you like to see all available tools?",
        ],
      };
    }

    // Export
    if (intent.category === 'export') {
      return {
        message: `Here's how to take your work outside AuraNova! 📤\n\n**Export Options by Tool:**\n\n• **Game Code** → Copy directly into Unreal/Unity/Godot\n• **Components** → Export as ZIP for VS Code\n• **Art/Sprites** → Download as PNG or sprite sheet\n• **Music** → Export as MIDI or WAV\n• **Writing** → Save as TXT, DOCX, or PDF\n\nEverything you create here is yours to use anywhere!`,
        suggestions: intent.suggestedActions,
        externalTips: [
          "All exports are in standard formats compatible with industry tools",
          "Game code includes proper engine-specific macros and structure",
          "Art exports support transparency for easy integration",
        ],
      };
    }

    // Default
    return {
      message: "I'm here to help! Tell me what you'd like to create or explore, and I'll guide you to the right tools.",
      suggestions: this.getTopFeatures(5),
      followUpQuestions: [
        "Are you working on a game?",
        "Would you like to create some art?",
        "Interested in writing or music?",
      ],
    };
  }

  /**
   * Detect which game engine user is interested in
   */
  private detectGameEngine(message: string): string | null {
    const engines = [
      { name: 'Unreal Engine', keywords: ['unreal', 'ue5', 'ue4', 'c++', 'blueprint'] },
      { name: 'Unity', keywords: ['unity', 'c#', 'csharp'] },
      { name: 'Godot', keywords: ['godot', 'gdscript'] },
      { name: 'Phaser', keywords: ['phaser', 'html5 game'] },
      { name: 'LÖVE2D', keywords: ['love2d', 'love', 'lua'] },
    ];

    for (const engine of engines) {
      for (const keyword of engine.keywords) {
        if (message.includes(keyword)) {
          return engine.name;
        }
      }
    }

    return null;
  }

  /**
   * Get top features for general recommendations
   */
  private getTopFeatures(count: number): GuidedAction[] {
    const topFeatureIds = ['dojo', 'art-studio', 'constructor', 'poems-creator', 'games'];
    
    return this.features
      .filter(f => topFeatureIds.includes(f.id))
      .slice(0, count)
      .map(f => ({
        id: f.id,
        title: f.name,
        description: f.description,
        route: f.route,
        icon: this.getIconForFeature(f.id),
        priority: 5,
        tags: f.keywords.slice(0, 3),
      }));
  }

  /**
   * Get tutorials for a specific feature
   */
  private getTutorialsForFeature(featureId: string): TutorialStep[] {
    const feature = this.features.find(f => f.id === featureId);
    return feature?.tutorials || [];
  }

  /**
   * Get icon emoji for a feature
   */
  private getIconForFeature(id: string): string {
    const icons: Record<string, string> = {
      'dojo': '🎮',
      'constructor': '🧩',
      'code-editor': '💻',
      'vibe-coding': '🤝',
      'script-fusion': '🔗',
      'art-studio': '🎨',
      'avatar-builder': '👤',
      'clothing-creator': '👕',
      'poems-creator': '📝',
      'music-composer': '🎵',
      'collaborative-writing': '✍️',
      'academics': '📚',
      'games': '🎲',
      'aetherium': '✨',
      'marketplace': '🏪',
      'community': '👥',
      'chat': '💬',
      'os': '🖥️',
      'workspace': '📁',
      'challenges': '🏆',
      'onboarding': '🚀',
    };
    return icons[id] || '⭐';
  }

  /**
   * Get difficulty for a feature
   */
  private getDifficultyForFeature(id: string): 'beginner' | 'intermediate' | 'advanced' {
    const advanced = ['vibe-coding', 'script-fusion'];
    const intermediate = ['dojo', 'constructor', 'music-composer'];
    
    if (advanced.includes(id)) return 'advanced';
    if (intermediate.includes(id)) return 'intermediate';
    return 'beginner';
  }

  /**
   * Search features by query
   */
  searchFeatures(query: string): FeatureGuide[] {
    const lowerQuery = query.toLowerCase();
    
    return this.features.filter(f => 
      f.name.toLowerCase().includes(lowerQuery) ||
      f.description.toLowerCase().includes(lowerQuery) ||
      f.keywords.some(k => k.includes(lowerQuery))
    );
  }

  /**
   * Get all features organized by suite
   */
  getFeaturesBySuite(): Record<string, FeatureGuide[]> {
    const bysSuite: Record<string, FeatureGuide[]> = {};
    
    for (const feature of this.features) {
      if (!bysSuite[feature.suite]) {
        bysSuite[feature.suite] = [];
      }
      bysSuite[feature.suite].push(feature);
    }
    
    return bysSuite;
  }

  /**
   * Get quick start recommendations for new users
   */
  getQuickStartGuide(): GuideResponse {
    return {
      message: `Welcome to AuraNova Studios! 🌟\n\nHere's your quick start guide:\n\n**Step 1: Set Up AI** → Visit the Setup Wizard to connect a local AI model\n**Step 2: Explore** → Try OS Mode for a desktop-like experience\n**Step 3: Create** → Jump into The Dojo for games or Art Studio for visuals\n**Step 4: Earn** → Complete Daily Challenges for coins\n**Step 5: Connect** → Join the chat and meet other creators\n\nWhat interests you most?`,
      suggestions: [
        { id: 'onboarding', title: 'Setup Wizard', description: 'Configure your AI model', route: '/onboarding', icon: '🚀', priority: 10, tags: ['setup', 'start'] },
        { id: 'os', title: 'OS Mode', description: 'Desktop experience', route: '/os', icon: '🖥️', priority: 9, tags: ['explore', 'interface'] },
        { id: 'dojo', title: 'The Dojo', description: 'Game code generator', route: '/dojo', icon: '🎮', priority: 8, tags: ['game', 'code'] },
        { id: 'art-studio', title: 'Art Studio', description: 'Create visual content', route: '/art-studio', icon: '🎨', priority: 7, tags: ['art', 'design'] },
        { id: 'challenges', title: 'Daily Challenges', description: 'Earn rewards', route: '/challenges', icon: '🏆', priority: 6, tags: ['earn', 'play'] },
      ],
      followUpQuestions: [
        "Have you used AI coding tools before?",
        "What kind of projects are you interested in?",
        "Would you like a tour of the main features?",
      ],
    };
  }
}

// Export singleton instance
export const auraGuide = new AuraGuideService();

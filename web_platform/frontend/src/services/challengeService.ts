// ============================================================================
// AI PERSONA CHALLENGE SERVICE
// ============================================================================
// Each major section has a unique AI persona that challenges users
// Complete daily challenges to earn Aether Coins for the TCG
// ============================================================================

import { earnCoins, SectionId, CURRENCY_CONFIG, EarningResult } from './currencyService';

// ================== AI PERSONAS ==================
export interface AIPersona {
  id: string;
  name: string;
  title: string;
  personality: string;
  avatar: string;           // Emoji representation
  section: SectionId;
  greeting: string;
  victoryQuote: string;
  defeatQuote: string;
  hintQuote: string;
  difficulty: 'easy' | 'medium' | 'hard';
  specialAbility?: string;
  cardBackStyle?: string;   // For Aetherium integration
}

export const AI_PERSONAS: Record<SectionId, AIPersona> = {
  dev: {
    id: 'codebreaker',
    name: 'C.O.D.E.',
    title: 'The Codebreaker',
    personality: 'Logical, precise, speaks in tech jargon. Appreciates elegant solutions.',
    avatar: '🤖',
    section: 'dev',
    greeting: 'Initializing challenge protocol... Ready to test your debugging skills, developer?',
    victoryQuote: 'Exception caught! Your logic circuits are impressive. Transaction approved.',
    defeatQuote: 'Syntax error detected. Retry recommended. Refactoring opportunity.',
    hintQuote: 'Compiling hint... Consider the edge cases.',
    difficulty: 'medium',
    specialAbility: 'Can generate code puzzles on the fly',
    cardBackStyle: 'chrome-circuit',
  },
  art: {
    id: 'chromatic',
    name: 'Chromática',
    title: 'The Palette Sage',
    personality: 'Creative, whimsical, speaks poetically about colors and form.',
    avatar: '🎨',
    section: 'art',
    greeting: 'Ah, a fellow artist! Let us paint a challenge upon the canvas of your mind...',
    victoryQuote: 'Magnificent! Your artistic vision shines like prismatic light!',
    defeatQuote: 'The muse will return. Every stroke teaches something new.',
    hintQuote: 'Perhaps look at it from a different... perspective?',
    difficulty: 'easy',
    specialAbility: 'Generates visual puzzles and color challenges',
    cardBackStyle: 'prismatic-flow',
  },
  academics: {
    id: 'sage',
    name: 'Professor Nova',
    title: 'The Eternal Scholar',
    personality: 'Wise, encouraging, loves teaching moments. Never condescending.',
    avatar: '📚',
    section: 'academics',
    greeting: 'Welcome, eager mind! Knowledge awaits those who seek it. Shall we begin?',
    victoryQuote: 'Excellent! Your understanding grows like a mighty oak from a tiny seed!',
    defeatQuote: 'Every wrong answer is a step toward the right one. Try again!',
    hintQuote: 'Think of what you already know... the answer connects to it.',
    difficulty: 'medium',
    specialAbility: 'Adaptive difficulty based on subject mastery',
    cardBackStyle: 'arcane-tome',
  },
  games: {
    id: 'arcade',
    name: 'PIXEL',
    title: 'The Arcade Master',
    personality: 'Energetic, competitive, retro-gaming enthusiast. Uses game references.',
    avatar: '👾',
    section: 'games',
    greeting: 'Player detected! Insert challenge to continue... Ready? START!',
    victoryQuote: 'HIGH SCORE! You\'ve leveled up, champion!',
    defeatQuote: 'GAME OVER... but you have infinite continues! Try again?',
    hintQuote: 'Power-up hint: The pattern repeats every third cycle.',
    difficulty: 'easy',
    specialAbility: 'Creates puzzle minigames with increasing difficulty',
    cardBackStyle: 'pixel-grid',
  },
  marketplace: {
    id: 'merchant',
    name: 'Goldwick',
    title: 'The Grand Merchant',
    personality: 'Shrewd but fair, loves a good deal, speaks in trade metaphors.',
    avatar: '💰',
    section: 'marketplace',
    greeting: 'Ah, a customer with potential! Care to earn some coins through a trade of wits?',
    victoryQuote: 'A fine transaction! Your wealth grows, and so does your reputation!',
    defeatQuote: 'The market is unpredictable. Better luck on the next trade!',
    hintQuote: 'Sometimes the best deal isn\'t the most obvious one...',
    difficulty: 'medium',
    specialAbility: 'Economy-based puzzles and bargaining challenges',
    cardBackStyle: 'gold-filigree',
  },
  community: {
    id: 'social',
    name: 'ECHO',
    title: 'The Voice of Many',
    personality: 'Empathetic, social, speaks as if channeling the community.',
    avatar: '💬',
    section: 'community',
    greeting: 'The community whispers your name... Ready to prove your social prowess?',
    victoryQuote: 'The people celebrate! Your social wisdom echoes across the realm!',
    defeatQuote: 'Even the best communicators stumble. The community still believes in you!',
    hintQuote: 'Listen to what isn\'t being said... the answer lies between the lines.',
    difficulty: 'easy',
    specialAbility: 'Social deduction and communication challenges',
    cardBackStyle: 'echo-waves',
  },
  aetherium: {
    id: 'architect',
    name: 'The Architect',
    title: 'Prime Catalyst',
    personality: 'Mysterious, powerful, speaks in riddles. The creator of the TCG.',
    avatar: '👑',
    section: 'aetherium',
    greeting: 'You dare challenge the Architect? Very well... show me your worth.',
    victoryQuote: 'Impressive. Perhaps you are worthy of the Prime cards after all.',
    defeatQuote: 'The Aetherium flows against you today. Return when you are stronger.',
    hintQuote: 'The cards themselves whisper secrets to those who listen...',
    difficulty: 'hard',
    specialAbility: 'TCG strategy challenges, grants Prime card chances on victory',
    cardBackStyle: 'prime-reverse',
  },
  literature: {
    id: 'muse',
    name: 'Lyrica',
    title: 'The Muse of Words',
    personality: 'Poetic, inspiring, speaks in verse and metaphor.',
    avatar: '✨',
    section: 'literature',
    greeting: 'From silence springs the story... What tale shall we weave together?',
    victoryQuote: 'Your words dance like starlight! The muse smiles upon you!',
    defeatQuote: 'Even the greatest poets need revision. Let the words flow again.',
    hintQuote: 'The answer hides within the rhythm of the question itself...',
    difficulty: 'easy',
    specialAbility: 'Word games, poetry challenges, creative writing prompts',
    cardBackStyle: 'ink-quill',
  },
};

// ================== CHALLENGE TYPES ==================
export type ChallengeType = 
  | 'trivia'
  | 'puzzle'
  | 'riddle'
  | 'code'
  | 'pattern'
  | 'memory'
  | 'word'
  | 'math'
  | 'logic'
  | 'creative';

export interface Challenge {
  id: string;
  personaId: string;
  section: SectionId;
  type: ChallengeType;
  title: string;
  description: string;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  hints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  coinReward: number;
  pointReward: number;
  timeLimit?: number;        // in seconds
  expiresAt: Date;           // When this daily challenge expires
}

export interface ChallengeResult {
  success: boolean;
  correct: boolean;
  coinsEarned: number;
  pointsEarned: number;
  message: string;
  personaResponse: string;
  nextChallengeIn?: string;  // Time until next challenge
}

// ================== CHALLENGE GENERATORS ==================
// Dev Suite Challenges
const DEV_CHALLENGES: Omit<Challenge, 'id' | 'expiresAt'>[] = [
  {
    personaId: 'codebreaker',
    section: 'dev',
    type: 'code',
    title: 'Bug Hunt',
    description: 'Find the bug in this code snippet',
    question: 'What will this JavaScript code output?\n\nconst arr = [1, 2, 3];\narr[10] = 11;\nconsole.log(arr.length);',
    options: ['3', '4', '10', '11'],
    correctAnswer: 3,
    hints: ['Arrays in JavaScript are sparse...', 'Setting index 10 changes the length'],
    difficulty: 'medium',
    coinReward: 1,
    pointReward: 50,
  },
  {
    personaId: 'codebreaker',
    section: 'dev',
    type: 'logic',
    title: 'Algorithm Challenge',
    description: 'What is the time complexity?',
    question: 'What is the Big O time complexity of binary search?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctAnswer: 2,
    hints: ['The search space halves each iteration...'],
    difficulty: 'easy',
    coinReward: 1,
    pointReward: 40,
  },
  {
    personaId: 'codebreaker',
    section: 'dev',
    type: 'trivia',
    title: 'Dev Trivia',
    description: 'Test your programming knowledge',
    question: 'Which language was originally called "Oak"?',
    options: ['JavaScript', 'Java', 'Python', 'Ruby'],
    correctAnswer: 1,
    hints: ['It was renamed due to trademark issues...'],
    difficulty: 'easy',
    coinReward: 1,
    pointReward: 30,
  },
];

// Art Suite Challenges
const ART_CHALLENGES: Omit<Challenge, 'id' | 'expiresAt'>[] = [
  {
    personaId: 'chromatic',
    section: 'art',
    type: 'trivia',
    title: 'Color Theory',
    description: 'Test your knowledge of colors',
    question: 'What do you get when you mix blue and yellow?',
    options: ['Orange', 'Green', 'Purple', 'Red'],
    correctAnswer: 1,
    hints: ['Think of the natural world... leaves, grass...'],
    difficulty: 'easy',
    coinReward: 1,
    pointReward: 30,
  },
  {
    personaId: 'chromatic',
    section: 'art',
    type: 'trivia',
    title: 'Art History',
    description: 'Famous artists and their works',
    question: 'Who painted "The Starry Night"?',
    options: ['Monet', 'Picasso', 'Van Gogh', 'Da Vinci'],
    correctAnswer: 2,
    hints: ['A Dutch post-impressionist...'],
    difficulty: 'easy',
    coinReward: 1,
    pointReward: 30,
  },
  {
    personaId: 'chromatic',
    section: 'art',
    type: 'puzzle',
    title: 'Pixel Perfect',
    description: 'Sprite art knowledge',
    question: 'In pixel art, what is "anti-aliasing" used for?',
    options: ['Making images bigger', 'Smoothing jagged edges', 'Adding shadows', 'Creating animation'],
    correctAnswer: 1,
    hints: ['It\'s about those stair-step edges...'],
    difficulty: 'medium',
    coinReward: 1,
    pointReward: 50,
  },
];

// Academics Challenges
const ACADEMICS_CHALLENGES: Omit<Challenge, 'id' | 'expiresAt'>[] = [
  {
    personaId: 'sage',
    section: 'academics',
    type: 'math',
    title: 'Quick Math',
    description: 'Mental arithmetic challenge',
    question: 'What is 15% of 200?',
    options: ['20', '25', '30', '35'],
    correctAnswer: 2,
    hints: ['10% is 20, so 5% is...'],
    difficulty: 'easy',
    coinReward: 1,
    pointReward: 40,
  },
  {
    personaId: 'sage',
    section: 'academics',
    type: 'trivia',
    title: 'Science Quest',
    description: 'Test your scientific knowledge',
    question: 'What is the chemical symbol for gold?',
    options: ['Go', 'Gd', 'Au', 'Ag'],
    correctAnswer: 2,
    hints: ['It comes from the Latin word "aurum"...'],
    difficulty: 'easy',
    coinReward: 1,
    pointReward: 30,
  },
  {
    personaId: 'sage',
    section: 'academics',
    type: 'logic',
    title: 'Logic Puzzle',
    description: 'Deduce the correct answer',
    question: 'If all Bloops are Razzies, and all Razzies are Lazzies, are all Bloops definitely Lazzies?',
    options: ['Yes', 'No', 'Sometimes', 'Not enough info'],
    correctAnswer: 0,
    hints: ['Think about the transitive property...'],
    difficulty: 'medium',
    coinReward: 1,
    pointReward: 50,
  },
];

// Games Challenges
const GAMES_CHALLENGES: Omit<Challenge, 'id' | 'expiresAt'>[] = [
  {
    personaId: 'arcade',
    section: 'games',
    type: 'trivia',
    title: 'Gaming History',
    description: 'Classic gaming knowledge',
    question: 'What was the first commercially successful video game?',
    options: ['Pac-Man', 'Pong', 'Space Invaders', 'Tetris'],
    correctAnswer: 1,
    hints: ['It was a simple tennis-like game from 1972...'],
    difficulty: 'easy',
    coinReward: 1,
    pointReward: 30,
  },
  {
    personaId: 'arcade',
    section: 'games',
    type: 'pattern',
    title: 'Pattern Master',
    description: 'Find the pattern',
    question: 'What comes next: 2, 4, 8, 16, ?',
    options: ['24', '32', '20', '18'],
    correctAnswer: 1,
    hints: ['Each number is doubled...'],
    difficulty: 'easy',
    coinReward: 1,
    pointReward: 30,
  },
  {
    personaId: 'arcade',
    section: 'games',
    type: 'trivia',
    title: 'Game Dev Quiz',
    description: 'Game development knowledge',
    question: 'Which game engine uses Blueprints for visual scripting?',
    options: ['Unity', 'Godot', 'Unreal Engine', 'GameMaker'],
    correctAnswer: 2,
    hints: ['It starts with "U"...'],
    difficulty: 'medium',
    coinReward: 1,
    pointReward: 40,
  },
];

// Marketplace Challenges
const MARKETPLACE_CHALLENGES: Omit<Challenge, 'id' | 'expiresAt'>[] = [
  {
    personaId: 'merchant',
    section: 'marketplace',
    type: 'math',
    title: 'Trade Math',
    description: 'Calculate the best deal',
    question: 'Item A costs 100 with 25% off. Item B costs 80 with 10% off. Which is cheaper?',
    options: ['Item A', 'Item B', 'Same price', 'Need more info'],
    correctAnswer: 1,
    hints: ['Calculate: 100 × 0.75 vs 80 × 0.90...'],
    difficulty: 'medium',
    coinReward: 1,
    pointReward: 50,
  },
  {
    personaId: 'merchant',
    section: 'marketplace',
    type: 'logic',
    title: 'Bargain Hunt',
    description: 'Economics puzzle',
    question: 'If supply increases but demand stays the same, what happens to price?',
    options: ['Goes up', 'Goes down', 'Stays same', 'Becomes random'],
    correctAnswer: 1,
    hints: ['Basic supply and demand...'],
    difficulty: 'easy',
    coinReward: 1,
    pointReward: 30,
  },
];

// Community Challenges
const COMMUNITY_CHALLENGES: Omit<Challenge, 'id' | 'expiresAt'>[] = [
  {
    personaId: 'social',
    section: 'community',
    type: 'word',
    title: 'Word Association',
    description: 'Find the connection',
    question: 'What word connects: FIRE, DRAGON, FRUIT?',
    options: ['Orange', 'Red', 'Fly', 'Breath'],
    correctAnswer: 2,
    hints: ['Think about what each can do with "fly"...'],
    difficulty: 'medium',
    coinReward: 1,
    pointReward: 50,
  },
  {
    personaId: 'social',
    section: 'community',
    type: 'riddle',
    title: 'Social Riddle',
    description: 'Solve the riddle',
    question: 'I have keys but no locks. I have space but no room. You can enter but can\'t go inside. What am I?',
    options: ['A house', 'A keyboard', 'A map', 'A book'],
    correctAnswer: 1,
    hints: ['You\'re using one right now...'],
    difficulty: 'easy',
    coinReward: 1,
    pointReward: 30,
  },
];

// Aetherium Challenges (harder, more rewarding)
const AETHERIUM_CHALLENGES: Omit<Challenge, 'id' | 'expiresAt'>[] = [
  {
    personaId: 'architect',
    section: 'aetherium',
    type: 'logic',
    title: 'Architect\'s Trial',
    description: 'A challenge worthy of the Prime Catalyst',
    question: 'In a game with 5 Aether, which play is optimal? A: 3-cost with 4 attack, B: Two 2-cost with 2 attack each, C: Save for next turn',
    options: ['Play A', 'Play B', 'Play C', 'Depends on board state'],
    correctAnswer: 3,
    hints: ['Context is everything in TCG strategy...'],
    difficulty: 'hard',
    coinReward: 2,
    pointReward: 100,
  },
  {
    personaId: 'architect',
    section: 'aetherium',
    type: 'riddle',
    title: 'Prime Riddle',
    description: 'The Architect speaks in riddles',
    question: 'I am first in legendary, second in rare, never in common, but found in epic and mythic. What am I?',
    options: ['The letter A', 'The letter E', 'The letter R', 'Power'],
    correctAnswer: 1,
    hints: ['Look at the letters themselves...'],
    difficulty: 'medium',
    coinReward: 2,
    pointReward: 75,
  },
];

// Literature Challenges
const LITERATURE_CHALLENGES: Omit<Challenge, 'id' | 'expiresAt'>[] = [
  {
    personaId: 'muse',
    section: 'literature',
    type: 'word',
    title: 'Word Craft',
    description: 'Test your vocabulary',
    question: 'What literary device is used in "The wind whispered through the trees"?',
    options: ['Metaphor', 'Simile', 'Personification', 'Alliteration'],
    correctAnswer: 2,
    hints: ['The wind is doing something only humans can do...'],
    difficulty: 'easy',
    coinReward: 1,
    pointReward: 30,
  },
  {
    personaId: 'muse',
    section: 'literature',
    type: 'creative',
    title: 'Rhyme Time',
    description: 'Find the rhyme',
    question: 'Which word rhymes with "ethereal"?',
    options: ['Material', 'Serial', 'Cereal', 'All of the above'],
    correctAnswer: 3,
    hints: ['They all end the same way...'],
    difficulty: 'easy',
    coinReward: 1,
    pointReward: 30,
  },
];

// Challenge pool by section
const CHALLENGE_POOLS: Record<SectionId, Omit<Challenge, 'id' | 'expiresAt'>[]> = {
  dev: DEV_CHALLENGES,
  art: ART_CHALLENGES,
  academics: ACADEMICS_CHALLENGES,
  games: GAMES_CHALLENGES,
  marketplace: MARKETPLACE_CHALLENGES,
  community: COMMUNITY_CHALLENGES,
  aetherium: AETHERIUM_CHALLENGES,
  literature: LITERATURE_CHALLENGES,
};

// ================== CHALLENGE GENERATION ==================
export function generateDailyChallenge(section: SectionId): Challenge {
  const pool = CHALLENGE_POOLS[section];
  const today = new Date().toISOString().split('T')[0];
  
  // Use date as seed for consistent daily challenge
  const seed = hashCode(today + section);
  const index = Math.abs(seed) % pool.length;
  const template = pool[index];
  
  // Set expiration to end of day
  const expiresAt = new Date();
  expiresAt.setHours(23, 59, 59, 999);
  
  return {
    ...template,
    id: `${section}_${today}_${template.type}`,
    expiresAt,
  };
}

// Simple hash function for seeding
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

// ================== CHALLENGE COMPLETION ==================
export function submitChallenge(
  userId: string,
  challenge: Challenge,
  answer: string | number
): ChallengeResult {
  const persona = AI_PERSONAS[challenge.section];
  const isCorrect = answer === challenge.correctAnswer;
  
  if (isCorrect) {
    // Award coins
    const result = earnCoins(
      userId,
      challenge.section,
      challenge.coinReward,
      challenge.id,
      `${persona.name}'s ${challenge.title} Challenge`
    );
    
    // Calculate next challenge time
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilReset = tomorrow.getTime() - now.getTime();
    const hoursUntil = Math.floor(msUntilReset / (1000 * 60 * 60));
    const minutesUntil = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      success: true,
      correct: true,
      coinsEarned: result.coinsEarned,
      pointsEarned: challenge.pointReward,
      message: result.message,
      personaResponse: persona.victoryQuote,
      nextChallengeIn: result.sectionLimitReached 
        ? `${hoursUntil}h ${minutesUntil}m` 
        : undefined,
    };
  } else {
    return {
      success: true,
      correct: false,
      coinsEarned: 0,
      pointsEarned: 0,
      message: 'Incorrect answer. Try again!',
      personaResponse: persona.defeatQuote,
    };
  }
}

// ================== DAILY CHALLENGE STATUS ==================
export interface DailyChallengeStatus {
  section: SectionId;
  persona: AIPersona;
  challenge: Challenge;
  completed: boolean;
  coinsAvailable: number;
  maxCoins: number;
}

export function getDailyChallengeStatus(
  userId: string,
  section: SectionId
): DailyChallengeStatus {
  const challenge = generateDailyChallenge(section);
  const persona = AI_PERSONAS[section];
  
  // Check if already completed
  const walletData = typeof window !== 'undefined' 
    ? localStorage.getItem(`aura_nova_wallet_${userId}`) 
    : null;
  
  let completed = false;
  let coinsEarnedToday = 0;
  
  if (walletData) {
    const wallet = JSON.parse(walletData);
    const today = new Date().toISOString().split('T')[0];
    
    if (wallet.dailyEarnings?.date === today) {
      completed = wallet.dailyEarnings.challengesCompleted?.includes(challenge.id) || false;
      coinsEarnedToday = wallet.dailyEarnings.coinsBySection?.[section] || 0;
    }
  }
  
  return {
    section,
    persona,
    challenge,
    completed,
    coinsAvailable: Math.max(0, CURRENCY_CONFIG.maxCoinsPerSection - coinsEarnedToday),
    maxCoins: CURRENCY_CONFIG.maxCoinsPerSection,
  };
}

// ================== GET ALL DAILY CHALLENGES ==================
export function getAllDailyChallenges(userId: string): DailyChallengeStatus[] {
  return CURRENCY_CONFIG.sections.map(section => 
    getDailyChallengeStatus(userId, section)
  );
}

// ================== EXPORTS ==================
export const ChallengeService = {
  AI_PERSONAS,
  generateDailyChallenge,
  submitChallenge,
  getDailyChallengeStatus,
  getAllDailyChallenges,
};

export default ChallengeService;

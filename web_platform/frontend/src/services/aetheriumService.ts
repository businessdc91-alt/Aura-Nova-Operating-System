// ============================================================================
// AETHERIUM TCG SERVICE
// Chronicles of the Cogwork Realm - Card Collection & Economy System
// ============================================================================
// 
// RARITY DISTRIBUTION (Season 1 - First Edition):
// - Total Print Run: 800 cards
// - 119 unique card designs across rarities
// - Less rare = more copies in circulation
// - First 25 cards are EXTREMELY RARE (Mythic/Legendary)
// 
// EDITIONS:
// - 1st Edition: Season 1 launch, 800 total cards, special foil stamp
// - 2nd Edition: Mid-Season 1, adds 50 new Starter Pack cards
// ============================================================================

// ================== TYPES ==================
export type CardRarity = 'starter' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type CardType = 'construct' | 'spell' | 'trap' | 'enchantment' | 'gear' | 'catalyst';
export type Faction = 'cogborn' | 'nanoswarm' | 'steamwright' | 'voidforge' | 'neutral' | 'prime';
export type Element = 'steam' | 'volt' | 'nano' | 'void' | 'chrome' | 'aether';
export type Edition = '1st' | '2nd' | 'promo' | 'prime';

export interface CardAbility {
  name: string;
  description: string;
  type: 'passive' | 'activated' | 'triggered' | 'chain';
  cost?: number;
}

export interface CardTemplate {
  id: string;
  name: string;
  type: CardType;
  faction: Faction;
  element: Element;
  rarity: CardRarity;
  cost: number;
  attack?: number;
  defense?: number;
  abilities: CardAbility[];
  flavorText: string;
  artStyle: string; // Steampunk/MTG/Wizard aesthetic description
  artPlaceholder: string;
  imageUrl?: string; // URL for the actual card art
  isLegendary?: boolean;
  tributeRequired?: number;
  attackBonus?: number;
  defenseBonus?: number;
  // For star-based power levels (like Yu-Gi-Oh)
  stars?: number; // 1-12 stars
}

export interface CardInstance {
  instanceId: string;
  templateId: string;
  edition: Edition;
  printNumber: number; // e.g., #45 of 800
  isFirstEdition: boolean;
  isHolographic: boolean;
  isFoil: boolean;
  condition: 'mint' | 'near-mint' | 'good' | 'played';
  ownerId: string;
  obtainedAt: Date;
  obtainedFrom: 'pack' | 'trade' | 'reward' | 'duel' | 'starter';
  customArtUrl?: string; // User-defined custom art for this specific card
  // Prime deck special properties
  isPrimeCard?: boolean;
  isReverseBacking?: boolean;
}

export interface PlayerCollection {
  oderId: string
  cards: CardInstance[];
  decks: SavedDeck[];
  starterDeckClaimed: boolean;
  coins: number;
  dust: number; // For crafting
  packsPurchased: number;
  duelsWon: number;
  duelsLost: number;
  primeCardsWon: number;
}

export interface SavedDeck {
  id: string;
  name: string;
  cardInstanceIds: string[];
  isActive: boolean;
  createdAt: Date;
}

// ================== RARITY DISTRIBUTION ==================
// Total 800 cards for Season 1 First Edition
// Less rare = more copies exist
export const RARITY_PRINT_COUNTS: Record<CardRarity, number> = {
  starter: 0,    // Not in regular packs - starter deck only
  common: 200,   // 200 total common cards in circulation
  uncommon: 150, // 150 uncommon cards
  rare: 100,     // 100 rare cards
  epic: 50,      // 50 epic cards
  legendary: 25, // 25 legendary cards (EXTREMELY RARE)
  mythic: 10,    // 10 mythic cards (THE RAREST - includes first 25 designs)
};
// This distribution across 119 unique designs means:
// - ~25-30 common designs, each printed ~7-8 times
// - ~25-30 uncommon designs, each printed ~5-6 times
// - ~25 rare designs, each printed ~4 times
// - ~15 epic designs, each printed ~3-4 times
// - ~10 legendary designs, each printed 2-3 times
// - ~10 mythic designs, each printed ONLY 1 time (ultra rare!)

// Design counts per rarity (how many unique card designs)
export const RARITY_DESIGN_COUNTS: Record<CardRarity, number> = {
  starter: 20,   // Starter deck cards (weaker, 2nd edition)
  common: 30,    // 30 unique common designs
  uncommon: 25,  // 25 unique uncommon designs
  rare: 20,      // 20 unique rare designs
  epic: 14,      // 14 unique epic designs  
  legendary: 10, // 10 unique legendary designs
  mythic: 10,    // 10 unique mythic designs (THE FIRST 25 most powerful)
};

// Copies per design based on rarity
export const COPIES_PER_DESIGN: Record<CardRarity, number> = {
  starter: 50,   // Lots of starter cards (2nd edition, 50 new cards)
  common: 7,     // Each common design has ~7 copies in circulation
  uncommon: 6,   // Each uncommon has ~6 copies
  rare: 5,       // Each rare has ~5 copies
  epic: 4,       // Each epic has ~4 copies
  legendary: 3,  // Each legendary has only 2-3 copies!
  mythic: 1,     // Each mythic exists ONLY ONCE in 1st edition!
};

// Pack odds (percentage chance when opening)
export const PACK_ODDS: Record<CardRarity, number> = {
  starter: 0,      // Never in packs
  common: 50,      // 50% chance
  uncommon: 25,    // 25% chance
  rare: 15,        // 15% chance
  epic: 7,         // 7% chance
  legendary: 2.5,  // 2.5% chance
  mythic: 0.5,     // 0.5% chance (1 in 200 packs!)
};

// ================== SEASON & EDITION TRACKING ==================
export interface SeasonInfo {
  season: number;
  edition: Edition;
  totalPrintRun: number;
  cardsDistributed: number;
  starterCardsAdded: number;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
}

const SEASON_1: SeasonInfo = {
  season: 1,
  edition: '1st',
  totalPrintRun: 800,
  cardsDistributed: 0,
  starterCardsAdded: 0, // 50 added mid-season as 2nd edition
  isActive: true,
  startDate: new Date('2025-01-01'),
};

// ================== STORAGE KEYS ==================
const STORAGE_KEYS = {
  COLLECTION: 'aetherium_collection',
  SEASON: 'aetherium_season',
  PRINT_TRACKER: 'aetherium_prints',
  CHALLENGES: 'aetherium_challenges',
};

// ================== PRINT TRACKER ==================
// Tracks how many of each card design have been distributed
interface PrintTracker {
  [templateId: string]: {
    totalPrinted: number;
    maxPrint: number;
    edition: Edition;
  };
}

function getPrintTracker(): PrintTracker {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(STORAGE_KEYS.PRINT_TRACKER);
  return stored ? JSON.parse(stored) : {};
}

function savePrintTracker(tracker: PrintTracker): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PRINT_TRACKER, JSON.stringify(tracker));
}

// ================== COLLECTION MANAGEMENT ==================
export function getPlayerCollection(playerId: string): PlayerCollection {
  if (typeof window === 'undefined') {
    return createEmptyCollection(playerId);
  }
  const stored = localStorage.getItem(`${STORAGE_KEYS.COLLECTION}_${playerId}`);
  if (stored) {
    return JSON.parse(stored);
  }
  return createEmptyCollection(playerId);
}

function createEmptyCollection(playerId: string): PlayerCollection {
  return {
    oderId: playerId,
    cards: [],
    decks: [],
    starterDeckClaimed: false,
    coins: 500, // Starting coins
    dust: 0,
    packsPurchased: 0,
    duelsWon: 0,
    duelsLost: 0,
    primeCardsWon: 0,
  };
}

export function savePlayerCollection(collection: PlayerCollection): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    `${STORAGE_KEYS.COLLECTION}_${collection.oderId}`,
    JSON.stringify(collection)
  );
}

// ================== CARD INSTANCE CREATION ==================
export function createCardInstance(
  template: CardTemplate,
  ownerId: string,
  source: CardInstance['obtainedFrom'],
  isPrime: boolean = false
): CardInstance | null {
  const tracker = getPrintTracker();
  const maxCopies = COPIES_PER_DESIGN[template.rarity];
  
  // Check if we can still print this card
  const current = tracker[template.id] || { totalPrinted: 0, maxPrint: maxCopies, edition: '1st' };
  
  if (current.totalPrinted >= current.maxPrint && !isPrime) {
    // Card is sold out for this edition!
    return null;
  }

  const printNumber = current.totalPrinted + 1;
  const instanceId = `${template.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Update tracker
  tracker[template.id] = {
    ...current,
    totalPrinted: printNumber,
  };
  savePrintTracker(tracker);

  // Determine special properties
  const isHolo = template.rarity === 'mythic' || 
                 template.rarity === 'legendary' || 
                 (template.rarity === 'epic' && Math.random() < 0.3);
  const isFoil = printNumber <= 10 || Math.random() < 0.1; // First 10 of any card are foil

  return {
    instanceId,
    templateId: template.id,
    edition: isPrime ? 'prime' : '1st',
    printNumber,
    isFirstEdition: true,
    isHolographic: isHolo,
    isFoil,
    condition: 'mint',
    ownerId,
    obtainedAt: new Date(),
    obtainedFrom: source,
    isPrimeCard: isPrime,
    isReverseBacking: isPrime,
  };
}

// ================== PACK OPENING ==================
export interface PackType {
  id: string;
  name: string;
  cost: number;
  cardCount: number;
  guaranteedRarity: CardRarity;
  description: string;
}

export const PACK_TYPES: PackType[] = [
  {
    id: 'basic',
    name: 'Cogwork Booster',
    cost: 100,
    cardCount: 5,
    guaranteedRarity: 'common',
    description: '5 cards, at least 1 uncommon guaranteed',
  },
  {
    id: 'premium',
    name: 'Aether Vault',
    cost: 300,
    cardCount: 8,
    guaranteedRarity: 'rare',
    description: '8 cards, 1 rare+ guaranteed, higher epic/legendary odds',
  },
  {
    id: 'mythic',
    name: 'Singularity Cache',
    cost: 800,
    cardCount: 10,
    guaranteedRarity: 'epic',
    description: '10 cards, 1 epic+ guaranteed, best odds for mythics',
  },
];

export function rollForRarity(guaranteed: CardRarity = 'common'): CardRarity {
  const roll = Math.random() * 100;
  
  let cumulative = 0;
  const rarities: CardRarity[] = ['mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
  
  for (const rarity of rarities) {
    cumulative += PACK_ODDS[rarity];
    if (roll < cumulative) {
      // Check if this meets the guaranteed minimum
      const rarityOrder: CardRarity[] = ['starter', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
      const rolledIndex = rarityOrder.indexOf(rarity);
      const guaranteedIndex = rarityOrder.indexOf(guaranteed);
      
      return rolledIndex >= guaranteedIndex ? rarity : guaranteed;
    }
  }
  
  return guaranteed;
}

// ================== STARTER DECK ==================
// Starter deck cards are weaker than regular commons
// They help new players learn but aren't competitive
export const STARTER_DECK_SIZE = 40;

export interface StarterDeckConfig {
  constructs: number;  // 20 weak constructs
  spells: number;      // 10 basic spells
  traps: number;       // 5 simple traps
  gear: number;        // 3 basic gear
  catalysts: number;   // 2 aether generators
}

export const STARTER_DECK_COMPOSITION: StarterDeckConfig = {
  constructs: 20,
  spells: 10,
  traps: 5,
  gear: 3,
  catalysts: 2,
};

// ================== CHALLENGE / NPC SYSTEM ==================
export interface NPCChallenger {
  id: string;
  name: string;
  title: string;
  difficulty: 'novice' | 'apprentice' | 'adept' | 'master' | 'architect';
  avatar: string;
  deckTheme: Faction;
  flavorQuote: string;
  winReward: {
    coins: number;
    cardChance: number; // % chance to win a card
    cardRarity: CardRarity; // Max rarity of reward card
  };
  location: string; // Where in the platform they appear
  unlockRequirement?: string;
}

export const PLATFORM_CHALLENGERS: NPCChallenger[] = [
  {
    id: 'npc-tutorial',
    name: 'Rusty',
    title: 'The Salvager',
    difficulty: 'novice',
    avatar: '🤖',
    deckTheme: 'cogborn',
    flavorQuote: "Every master was once a disaster. Let's see what you've got!",
    winReward: { coins: 50, cardChance: 30, cardRarity: 'common' },
    location: 'Tutorial Zone',
  },
  {
    id: 'npc-forge',
    name: 'Ember',
    title: 'Forge Keeper',
    difficulty: 'apprentice',
    avatar: '🔥',
    deckTheme: 'steamwright',
    flavorQuote: "The forge burns eternal. Can you withstand the heat?",
    winReward: { coins: 100, cardChance: 40, cardRarity: 'uncommon' },
    location: 'Art Studio',
  },
  {
    id: 'npc-data',
    name: 'Cipher',
    title: 'Data Phantom',
    difficulty: 'apprentice',
    avatar: '👁️',
    deckTheme: 'nanoswarm',
    flavorQuote: "In the stream of data, I see your every move.",
    winReward: { coins: 100, cardChance: 40, cardRarity: 'uncommon' },
    location: 'Dev Dojo',
  },
  {
    id: 'npc-void',
    name: 'Nihilus',
    title: 'Void Walker',
    difficulty: 'adept',
    avatar: '💀',
    deckTheme: 'voidforge',
    flavorQuote: "The void consumes all. Even hope.",
    winReward: { coins: 200, cardChance: 50, cardRarity: 'rare' },
    location: 'Games Hub',
    unlockRequirement: 'Win 5 duels',
  },
  {
    id: 'npc-queen',
    name: 'Tessera',
    title: 'Clockwork Queen',
    difficulty: 'adept',
    avatar: '👑',
    deckTheme: 'cogborn',
    flavorQuote: "My gears turn empires. Yours barely tick.",
    winReward: { coins: 250, cardChance: 60, cardRarity: 'rare' },
    location: 'Music Composer',
    unlockRequirement: 'Win 10 duels',
  },
  {
    id: 'npc-storm',
    name: 'Voltaris',
    title: 'Storm Conductor',
    difficulty: 'master',
    avatar: '⚡',
    deckTheme: 'nanoswarm',
    flavorQuote: "Lightning never strikes twice? I beg to differ.",
    winReward: { coins: 400, cardChance: 70, cardRarity: 'epic' },
    location: 'Community Hub',
    unlockRequirement: 'Win 20 duels',
  },
  {
    id: 'npc-architect',
    name: 'The Architect',
    title: 'Prime Catalyst',
    difficulty: 'architect',
    avatar: '✨',
    deckTheme: 'prime',
    flavorQuote: "I built this realm. Now defend it... or join me.",
    winReward: { coins: 1000, cardChance: 100, cardRarity: 'mythic' },
    location: 'Aetherium Arena',
    unlockRequirement: 'Win 50 duels',
  },
];

// ================== DUEL RESULT PROCESSING ==================
export interface DuelResult {
  winner: 'player' | 'opponent';
  playerDamageDealt: number;
  opponentDamageDealt: number;
  turnsPlayed: number;
  cardsUsed: number;
  wasAgainstPrime: boolean;
}

export function processDuelReward(
  playerId: string,
  challenger: NPCChallenger,
  result: DuelResult
): { coins: number; card: CardInstance | null } {
  const collection = getPlayerCollection(playerId);
  
  if (result.winner !== 'player') {
    // Lost the duel
    collection.duelsLost++;
    savePlayerCollection(collection);
    return { coins: 0, card: null };
  }

  // Won the duel!
  collection.duelsWon++;
  const coinsWon = challenger.winReward.coins;
  collection.coins += coinsWon;

  // Roll for card reward
  let cardWon: CardInstance | null = null;
  if (Math.random() * 100 < challenger.winReward.cardChance) {
    // Won a card! (Implementation will use card templates from main file)
    // This is a placeholder - actual card selection happens in the game component
    if (result.wasAgainstPrime) {
      collection.primeCardsWon++;
    }
  }

  savePlayerCollection(collection);
  return { coins: coinsWon, card: cardWon };
}

// ================== UTILITY FUNCTIONS ==================
export function getRarityColor(rarity: CardRarity): string {
  const colors: Record<CardRarity, string> = {
    starter: 'border-slate-500 bg-slate-800',
    common: 'border-slate-400 bg-slate-700',
    uncommon: 'border-green-500 bg-green-900/50',
    rare: 'border-blue-500 bg-blue-900/50',
    epic: 'border-purple-500 bg-purple-900/50',
    legendary: 'border-amber-500 bg-amber-900/50',
    mythic: 'border-rose-500 bg-gradient-to-br from-rose-900/50 to-amber-900/50',
  };
  return colors[rarity];
}

export function getRarityGlow(rarity: CardRarity): string {
  const glows: Record<CardRarity, string> = {
    starter: '',
    common: '',
    uncommon: 'shadow-green-500/20 shadow-lg',
    rare: 'shadow-blue-500/30 shadow-lg',
    epic: 'shadow-purple-500/40 shadow-xl',
    legendary: 'shadow-amber-500/50 shadow-xl animate-pulse',
    mythic: 'shadow-rose-500/60 shadow-2xl animate-pulse',
  };
  return glows[rarity];
}

export function getStarsDisplay(stars: number): string {
  return '⭐'.repeat(Math.min(stars, 12));
}

export function formatPrintNumber(printNum: number, maxPrint: number): string {
  return `#${printNum.toString().padStart(3, '0')}/${maxPrint}`;
}

// ================== SEASON INFO ==================
export function getCurrentSeason(): SeasonInfo {
  return SEASON_1;
}

export function getCardsRemaining(rarity: CardRarity): number {
  const tracker = getPrintTracker();
  const maxTotal = RARITY_PRINT_COUNTS[rarity];
  
  let distributed = 0;
  Object.values(tracker).forEach(t => {
    distributed += t.totalPrinted;
  });
  
  return Math.max(0, maxTotal - distributed);
}

console.log('[AetheriumService] Card collection service initialized');
console.log(`[AetheriumService] Season 1 - First Edition: 800 total cards, 119 unique designs`);

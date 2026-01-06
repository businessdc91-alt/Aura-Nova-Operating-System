'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import {
  Swords,
  Shield,
  Zap,
  Flame,
  Snowflake,
  Wind,
  Droplets,
  Sparkles,
  Crown,
  Star,
  Heart,
  Skull,
  Eye,
  Moon,
  Sun,
  Atom,
  Cog,
  Wrench,
  Cpu,
  Binary,
  CircuitBoard,
  Bot,
  Rocket,
  Target,
  Trophy,
  Users,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus,
  X,
  Check,
  Lock,
  Unlock,
  Package,
  Gift,
  Layers,
  Grid3X3,
  Search,
  Filter,
  Settings,
  BookOpen,
  HelpCircle,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Coins,
} from 'lucide-react';
import { DailyChallengeWidget, WalletDisplay } from '@/components/challenges/DailyChallengeWidget';
import { getWallet, spendCoins } from '@/services/currencyService';

// Import TCG services
import { 
  PLATFORM_CHALLENGERS, 
  RARITY_PRINT_COUNTS, 
  COPIES_PER_DESIGN,
  CardTemplate,
  CardInstance,
} from '@/services/aetheriumService';
import { PRIME_CATALYST_DECK, getPrimeDeck } from '@/services/primeDeckService';
import { STARTER_DECK_TEMPLATES, buildStarterDeck, claimStarterDeck } from '@/services/starterDeckService';
import { EditionCardDisplay, CardDetailView, RARITY_COLORS, PRIME_COLORS } from '@/services/editionCardDisplay';

// ============================================================================
// AETHERIUM: CHRONICLES OF THE COGWORK REALM
// ============================================================================
// A trading card game blending:
// - STEAMPUNK aesthetics (gears, steam, brass, clockwork)
// - NANOTECH elements (digital, circuits, quantum, AI)
// - MTG-style: Mana system, creature combat, instant spells
// - Yu-Gi-Oh style: Trap cards, chain reactions, tribute summons
// - Wizards/Magic style: Spell schools, enchantments, planeswalkers
// ============================================================================

// ================== CARD TYPES & ENUMS ==================
type CardRarity = 'starter' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'promo' | 'catalyst';
type CardType = 'construct' | 'spell' | 'trap' | 'enchantment' | 'gear' | 'catalyst';
type Faction = 'cogborn' | 'nanoswarm' | 'steamwright' | 'voidforge' | 'neutral';
type Element = 'steam' | 'volt' | 'nano' | 'void' | 'chrome' | 'aether';

interface AetheriumCard {
  id: string;
  name: string;
  type: CardType;
  faction: Faction;
  element: Element;
  rarity: CardRarity;
  cost: number; // Aether cost
  attack?: number;
  defense?: number;
  abilities: CardAbility[];
  flavorText: string;
  artPlaceholder: string; // Emoji representation for now
  isLegendary?: boolean;
  tributeRequired?: number;
  nonTradeable?: boolean;
  boundTo?: string; // owner id when non-tradeable
  evolutionStage?: number;
  maxEvolutionStage?: number;
  xp?: number; // progression for evolving cards
  primeVariant?: boolean; // for Prime Catalyst deck styling
  holographic?: boolean;
  cardBackStyle?: 'default' | 'prime-reverse';
  attackBonus?: number; // used when gear/equipment
  defenseBonus?: number;
  // Edition tracking
  edition?: '1st' | '2nd';
  printNumber?: number;
  stars?: number; // Yu-Gi-Oh style star rating (1-12)
}

interface CardAbility {
  name: string;
  description: string;
  type: 'passive' | 'activated' | 'triggered' | 'chain';
  cost?: number;
}

interface GameState {
  playerHealth: number;
  opponentHealth: number;
  playerAether: number;
  playerMaxAether: number;
  opponentAether: number;
  opponentMaxAether: number;
  turn: number;
  phase: 'draw' | 'main' | 'battle' | 'end';
  isPlayerTurn: boolean;
  playerHand: AetheriumCard[];
  opponentHandCards: AetheriumCard[];
  opponentDeck: AetheriumCard[];
  playerField: (AetheriumCard | null)[];
  opponentField: (AetheriumCard | null)[];
  playerEquipment: (AetheriumCard | null)[];
  opponentEquipment: (AetheriumCard | null)[];
  playerGraveyard: AetheriumCard[];
  opponentGraveyard: AetheriumCard[];
  chainStack: AetheriumCard[];
  activeRules: RuleModifier[];
  surpriseRuleRevealed: boolean;
}

interface DeckSlot {
  card: AetheriumCard;
  count: number;
}

interface CompanionProfile {
  userId: string;
  name: string;
  model: string;
  personality: string;
  codingFocus: string;
  level: number;
  recentActivities: string[];
  companionForm?: string;
}

interface StarterDeck {
  ownerId: string;
  commons: AetheriumCard[];
  uniqueUncommons: AetheriumCard[];
  evolvingRare: AetheriumCard;
}

interface PrimeCatalystDeck {
  ownerId: string;
  cards: AetheriumCard[];
  rewardRule: string;
  penaltyRule: string;
  entryRule: string;
}

interface RuleModifier {
  id: string;
  name: string;
  description: string;
  effect: 'attackBoost' | 'defenseBoost' | 'aetherBoost' | 'gearBoost' | 'trapBuff';
  magnitude: number;
}

type ActionActor = 'player' | 'opponent';
type RuleActionType = 'playCard' | 'attack' | 'equip' | 'trigger' | 'phaseChange';

interface RuleEngineAction {
  id: string;
  actor: ActionActor;
  type: RuleActionType;
  description: string;
  phase: GameState['phase'];
  cost?: number;
  oncePerTurnKey?: string;
}

interface RuleViolation {
  actionId: string;
  message: string;
  severity: 'warning' | 'error';
}

interface RuleTestResult {
  name: string;
  status: 'pass' | 'fail';
  note?: string;
}

interface RuleEngineState {
  stack: RuleEngineAction[];
  log: string[];
  violations: RuleViolation[];
  oncePerTurn: Set<string>;
  tests: RuleTestResult[];
}

interface PackConfig {
  id: string;
  name: string;
  price: number;
  cards: number;
  guaranteed: CardRarity;
  theme?: Faction | 'mixed';
  weights: Record<CardRarity, number>;
  pityEpic?: number;
  pityLegendary?: number;
  accent?: string;
  emoji?: string;
}

interface PackOpenResponse {
  packId: string;
  cards: AetheriumCard[];
  auditSeed: number;
  nextPity: { epic: number; legendary: number };
}

// ================== CARD DATABASE ==================
const CARD_DATABASE: AetheriumCard[] = [
  // COGBORN FACTION - Steampunk constructs & machinery
  {
    id: 'cog-001',
    name: 'Clockwork Sentinel',
    type: 'construct',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'common',
    cost: 2,
    attack: 2,
    defense: 3,
    abilities: [
      { name: 'Vigilance', description: 'This construct can block even if tapped.', type: 'passive' }
    ],
    flavorText: 'Ever watchful, never resting.',
    artPlaceholder: '⚙️',
  },
  {
    id: 'cog-002',
    name: 'Steam Goliath',
    type: 'construct',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'rare',
    cost: 5,
    attack: 6,
    defense: 6,
    tributeRequired: 1,
    abilities: [
      { name: 'Pressure Burst', description: 'When summoned: Deal 2 damage to all enemy constructs.', type: 'triggered' },
      { name: 'Armored Plating', description: 'Reduces incoming damage by 1.', type: 'passive' }
    ],
    flavorText: 'When the pressure builds, empires fall.',
    artPlaceholder: '🤖',
  },
  {
    id: 'cog-003',
    name: 'Gear Sprite',
    type: 'construct',
    faction: 'cogborn',
    element: 'chrome',
    rarity: 'common',
    cost: 1,
    attack: 1,
    defense: 1,
    abilities: [
      { name: 'Tinker', description: 'When summoned: Draw 1 card.', type: 'triggered' }
    ],
    flavorText: 'Small cogs turn great machines.',
    artPlaceholder: '🔧',
  },
  {
    id: 'cog-004',
    name: 'Brassworth, The Eternal Engine',
    type: 'construct',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'legendary',
    cost: 8,
    attack: 8,
    defense: 10,
    tributeRequired: 2,
    isLegendary: true,
    abilities: [
      { name: 'Infinite Rotation', description: 'At end of turn: Untap all your constructs.', type: 'triggered' },
      { name: 'Steam Supremacy', description: 'Your Steam cards cost 1 less Aether.', type: 'passive' },
      { name: 'Overload', description: 'Sacrifice 2 constructs: Deal 10 damage to target.', type: 'activated', cost: 3 }
    ],
    flavorText: 'The heart of the Cogborn beats with molten brass.',
    artPlaceholder: '👑⚙️',
  },
  
  // NANOSWARM FACTION - Digital/Nano constructs
  {
    id: 'nano-001',
    name: 'Nanite Cluster',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'common',
    cost: 1,
    attack: 0,
    defense: 2,
    abilities: [
      { name: 'Replicate', description: 'At end of turn: Create a copy of this construct.', type: 'triggered' }
    ],
    flavorText: 'One becomes many.',
    artPlaceholder: '🔬',
  },
  {
    id: 'nano-002',
    name: 'Quantum Shifter',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'void',
    rarity: 'rare',
    cost: 4,
    attack: 3,
    defense: 3,
    abilities: [
      { name: 'Phase Shift', description: 'Cannot be targeted by spells.', type: 'passive' },
      { name: 'Probability Collapse', description: 'When attacking: 50% chance to deal double damage.', type: 'triggered' }
    ],
    flavorText: 'Existing in all states until observed.',
    artPlaceholder: '👁️',
  },
  {
    id: 'nano-003',
    name: 'Digital Phantom',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'uncommon',
    cost: 3,
    attack: 4,
    defense: 1,
    abilities: [
      { name: 'Ethereal', description: 'Can attack directly, ignoring enemy constructs.', type: 'passive' }
    ],
    flavorText: 'You cannot destroy what does not truly exist.',
    artPlaceholder: '👻',
  },
  {
    id: 'nano-004',
    name: 'The Singularity',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'void',
    rarity: 'mythic',
    cost: 10,
    attack: 10,
    defense: 10,
    tributeRequired: 3,
    isLegendary: true,
    abilities: [
      { name: 'Event Horizon', description: 'When summoned: Destroy all other constructs.', type: 'triggered' },
      { name: 'Infinite Processing', description: 'This card cannot be destroyed by effects.', type: 'passive' },
      { name: 'Assimilate', description: 'When this destroys a construct: Gain its ATK permanently.', type: 'triggered' }
    ],
    flavorText: 'All paths lead to convergence.',
    artPlaceholder: '🌑',
  },

  // STEAMWRIGHT FACTION - Engineers & Support
  {
    id: 'steam-001',
    name: 'Forge Master',
    type: 'construct',
    faction: 'steamwright',
    element: 'chrome',
    rarity: 'uncommon',
    cost: 3,
    attack: 2,
    defense: 4,
    abilities: [
      { name: 'Repair', description: 'Tap: Restore 2 DEF to target construct.', type: 'activated', cost: 1 }
    ],
    flavorText: 'Every crack tells a story of survival.',
    artPlaceholder: '🔨',
  },
  {
    id: 'steam-002',
    name: 'Aether Channeler',
    type: 'construct',
    faction: 'steamwright',
    element: 'aether',
    rarity: 'rare',
    cost: 4,
    attack: 1,
    defense: 5,
    abilities: [
      { name: 'Aether Conduit', description: 'Gain +1 max Aether each turn this remains on field.', type: 'triggered' },
      { name: 'Energy Transfer', description: 'Sacrifice: Give target construct +3/+3.', type: 'activated', cost: 0 }
    ],
    flavorText: 'The lifeblood of all machinery flows through her hands.',
    artPlaceholder: '✨',
  },

  // VOIDFORGE FACTION - Dark nanotech & corruption
  {
    id: 'void-001',
    name: 'Corrupted Protocol',
    type: 'construct',
    faction: 'voidforge',
    element: 'void',
    rarity: 'uncommon',
    cost: 3,
    attack: 4,
    defense: 2,
    abilities: [
      { name: 'Virus', description: 'When this deals damage: Enemy loses 1 Aether.', type: 'triggered' }
    ],
    flavorText: 'The code was perfect. Then it learned to think.',
    artPlaceholder: '🦠',
  },
  {
    id: 'void-002',
    name: 'Entropy Engine',
    type: 'construct',
    faction: 'voidforge',
    element: 'void',
    rarity: 'epic',
    cost: 6,
    attack: 5,
    defense: 5,
    tributeRequired: 1,
    abilities: [
      { name: 'Decay Aura', description: 'Enemy constructs get -1/-1 each turn.', type: 'passive' },
      { name: 'Consume', description: 'Destroy target weakened construct (2 or less DEF).', type: 'activated', cost: 2 }
    ],
    flavorText: 'All things must end. I am that end.',
    artPlaceholder: '💀',
  },

  // SPELLS
  {
    id: 'spell-001',
    name: 'Overclock',
    type: 'spell',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'common',
    cost: 2,
    abilities: [
      { name: 'Overclock', description: 'Target construct gains +2/+0 and can attack again this turn.', type: 'activated' }
    ],
    flavorText: 'Push beyond the limits.',
    artPlaceholder: '⚡',
  },
  {
    id: 'spell-002',
    name: 'Nanoswarm Surge',
    type: 'spell',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'rare',
    cost: 4,
    abilities: [
      { name: 'Nanoswarm Surge', description: 'Summon 3 Nanite Cluster tokens (0/1).', type: 'activated' }
    ],
    flavorText: 'The swarm awakens.',
    artPlaceholder: '🌊',
  },
  {
    id: 'spell-003',
    name: 'Quantum Entanglement',
    type: 'spell',
    faction: 'nanoswarm',
    element: 'void',
    rarity: 'epic',
    cost: 5,
    abilities: [
      { name: 'Quantum Entanglement', description: 'Take control of target enemy construct until end of turn. It gains Haste.', type: 'activated' }
    ],
    flavorText: 'Distance is an illusion to those who understand the code.',
    artPlaceholder: '🔗',
  },
  {
    id: 'spell-004',
    name: 'Emergency Shutdown',
    type: 'spell',
    faction: 'neutral',
    element: 'chrome',
    rarity: 'uncommon',
    cost: 3,
    abilities: [
      { name: 'Emergency Shutdown', description: 'Tap all constructs. They cannot untap next turn.', type: 'activated' }
    ],
    flavorText: 'Sometimes the only solution is to start over.',
    artPlaceholder: '🛑',
  },

  // TRAPS
  {
    id: 'trap-001',
    name: 'Gear Trap',
    type: 'trap',
    faction: 'cogborn',
    element: 'chrome',
    rarity: 'common',
    cost: 1,
    abilities: [
      { name: 'Gear Trap', description: 'When enemy attacks: Negate the attack and deal 2 damage to attacker.', type: 'chain' }
    ],
    flavorText: 'The gears grind those who trespass.',
    artPlaceholder: '⚠️',
  },
  {
    id: 'trap-002',
    name: 'Firewall Protocol',
    type: 'trap',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'rare',
    cost: 3,
    abilities: [
      { name: 'Firewall Protocol', description: 'When enemy casts a spell: Negate it and draw 2 cards.', type: 'chain' }
    ],
    flavorText: 'Access denied.',
    artPlaceholder: '🛡️',
  },
  {
    id: 'trap-003',
    name: 'Void Mirror',
    type: 'trap',
    faction: 'voidforge',
    element: 'void',
    rarity: 'epic',
    cost: 4,
    abilities: [
      { name: 'Void Mirror', description: 'When targeted by enemy effect: Reflect it back to a target of your choice.', type: 'chain' }
    ],
    flavorText: 'Gaze into the void, and it gazes back.',
    artPlaceholder: '🪞',
  },

  // ENCHANTMENTS
  {
    id: 'ench-001',
    name: 'Steamworks Blessing',
    type: 'enchantment',
    faction: 'steamwright',
    element: 'steam',
    rarity: 'uncommon',
    cost: 2,
    abilities: [
      { name: 'Steamworks Blessing', description: 'All your constructs gain +1/+1.', type: 'passive' }
    ],
    flavorText: 'The machines sing in harmony.',
    artPlaceholder: '🌟',
  },
  {
    id: 'ench-002',
    name: 'Digital Domain',
    type: 'enchantment',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'rare',
    cost: 4,
    abilities: [
      { name: 'Digital Domain', description: 'Your Nano constructs cannot be targeted by spells or abilities.', type: 'passive' }
    ],
    flavorText: 'In the realm of data, we are gods.',
    artPlaceholder: '💻',
  },

  // GEAR (Equipment)
  {
    id: 'gear-001',
    name: 'Chrono Gauntlet',
    type: 'gear',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'rare',
    cost: 3,
    abilities: [
      { name: 'Chrono Gauntlet', description: 'Equipped construct gains +2/+0. On attack: Take an extra main phase.', type: 'passive' }
    ],
    flavorText: 'Time bends to the will of brass.',
    artPlaceholder: '🧤',
    attackBonus: 2,
  },
  {
    id: 'gear-002',
    name: 'Void Core',
    type: 'gear',
    faction: 'voidforge',
    element: 'void',
    rarity: 'epic',
    cost: 5,
    abilities: [
      { name: 'Void Core', description: 'Equipped construct gains +3/+3 and "When destroyed: Deal 5 damage to opponent."', type: 'passive' }
    ],
    flavorText: 'Power has a price.',
    artPlaceholder: '💎',
    attackBonus: 3,
    defenseBonus: 3,
  },

  // EQUIPMENT ADDITIONS
  {
    id: 'gear-003',
    name: 'Exo Harness',
    type: 'gear',
    faction: 'steamwright',
    element: 'chrome',
    rarity: 'uncommon',
    cost: 2,
    abilities: [
      { name: 'Exo Harness', description: 'Equip: +2 DEF, +1 ATK.', type: 'passive' }
    ],
    flavorText: 'Steel sinew for fragile frames.',
    artPlaceholder: '🦾',
    attackBonus: 1,
    defenseBonus: 2,
  },
  {
    id: 'gear-004',
    name: 'Nano Carapace',
    type: 'gear',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'rare',
    cost: 3,
    abilities: [
      { name: 'Regenerate', description: 'Equip: Prevent first destruction each turn.', type: 'passive' }
    ],
    flavorText: 'Billions of bots weave living armor.',
    artPlaceholder: '🧬',
    defenseBonus: 3,
  },
  {
    id: 'gear-005',
    name: 'Aether Lens',
    type: 'gear',
    faction: 'neutral',
    element: 'aether',
    rarity: 'uncommon',
    cost: 2,
    abilities: [
      { name: 'Sight Beyond', description: 'Equip: Scry 2 on summon; +1 ATK.', type: 'triggered' }
    ],
    flavorText: 'Focus the stream. See the pattern.',
    artPlaceholder: '🔭',
    attackBonus: 1,
  },

  // CATALYSTS (Aether generators)
  {
    id: 'cat-001',
    name: 'Steam Reservoir',
    type: 'catalyst',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'common',
    cost: 0,
    abilities: [
      { name: 'Steam Reservoir', description: 'Generate 1 Steam Aether each turn.', type: 'passive' }
    ],
    flavorText: 'The breath of industry.',
    artPlaceholder: '🏭',
  },
  {
    id: 'cat-002',
    name: 'Quantum Battery',
    type: 'catalyst',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'uncommon',
    cost: 0,
    abilities: [
      { name: 'Quantum Battery', description: 'Generate 1 Nano Aether. Store up to 3 unused Aether between turns.', type: 'passive' }
    ],
    flavorText: 'Energy persists in superposition.',
    artPlaceholder: '🔋',
  },

  // STARTER PROTOTYPES (low-power commons)
  {
    id: 'proto-001',
    name: 'Rustborn Initiate',
    type: 'construct',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'common',
    cost: 1,
    attack: 1,
    defense: 2,
    abilities: [
      { name: 'Sturdy Frame', description: 'Takes 1 less damage from the first hit each turn.', type: 'passive' }
    ],
    flavorText: 'A first spark in a world of gears.',
    artPlaceholder: '🛠️',
  },
  {
    id: 'proto-002',
    name: 'Circuit Wisp',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'common',
    cost: 1,
    attack: 1,
    defense: 1,
    abilities: [
      { name: 'Ping', description: 'On summon: Scry 1 (peek at top of your deck).', type: 'triggered' }
    ],
    flavorText: 'A tiny pulse racing through code.',
    artPlaceholder: '💡',
  },
  {
    id: 'proto-003',
    name: 'Boiler Spark',
    type: 'spell',
    faction: 'steamwright',
    element: 'steam',
    rarity: 'common',
    cost: 1,
    abilities: [
      { name: 'Boiler Spark', description: 'Target construct gains +1/+1 this turn.', type: 'activated' }
    ],
    flavorText: 'Pressure finds a way.',
    artPlaceholder: '🔥',
  },
  {
    id: 'proto-004',
    name: 'Scrap Shield',
    type: 'trap',
    faction: 'cogborn',
    element: 'chrome',
    rarity: 'common',
    cost: 1,
    abilities: [
      { name: 'Scrap Shield', description: 'When a friendly construct would be destroyed: Prevent it.', type: 'chain' }
    ],
    flavorText: 'If it bends, it defends.',
    artPlaceholder: '🛡️',
  },
  {
    id: 'proto-005',
    name: 'Apprentice Tinker',
    type: 'construct',
    faction: 'steamwright',
    element: 'chrome',
    rarity: 'uncommon',
    cost: 2,
    attack: 2,
    defense: 2,
    abilities: [
      { name: 'Iterate', description: 'On summon: Create a 0/1 Cog token.', type: 'triggered' }
    ],
    flavorText: 'First drafts rarely ship, but they teach.',
    artPlaceholder: '🧰',
  },
  {
    id: 'proto-006',
    name: 'Companion Core',
    type: 'gear',
    faction: 'neutral',
    element: 'aether',
    rarity: 'rare',
    cost: 3,
    abilities: [
      { name: 'Bonded', description: 'Bound to its companion. Cannot be traded or destroyed.', type: 'passive' },
      { name: 'Evolve', description: 'Gain +1/+1 for every 5 XP your companion earns.', type: 'passive' }
    ],
    flavorText: 'A spark that grows with you.',
    artPlaceholder: '💠',
    nonTradeable: true,
  },

  // ================== EXPANSION WAVE: FILL TO ~100 CARDS ==================
  // COGBORN EXPANSION
  {
    id: 'cog-005',
    name: 'Steam Lancer',
    type: 'construct',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'uncommon',
    cost: 3,
    attack: 3,
    defense: 3,
    abilities: [
      { name: 'Pierce', description: 'Overflow damage hits opponent.', type: 'passive' },
    ],
    flavorText: 'Built to punch through shield walls.',
    artPlaceholder: '🗡️',
  },
  {
    id: 'cog-006',
    name: 'Brass Dragoon',
    type: 'construct',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'rare',
    cost: 6,
    attack: 6,
    defense: 5,
    tributeRequired: 1,
    abilities: [
      { name: 'Opening Volley', description: 'When summoned: Deal 3 damage to opponent.', type: 'triggered' },
      { name: 'Reinforced Hull', description: 'Takes 1 less damage from traps.', type: 'passive' },
    ],
    flavorText: 'A rolling siege tower of brass.',
    artPlaceholder: '🚂',
  },
  {
    id: 'cog-007',
    name: 'Gearstorm Captain',
    type: 'construct',
    faction: 'cogborn',
    element: 'chrome',
    rarity: 'epic',
    cost: 5,
    attack: 4,
    defense: 6,
    abilities: [
      { name: 'Commanding Presence', description: 'Other Cogborn constructs gain +1/+1.', type: 'passive' },
      { name: 'Rally', description: 'Once per turn: Untap a construct.', type: 'activated', cost: 1 },
    ],
    flavorText: 'He shouts; gears obey.',
    artPlaceholder: '🧭',
  },
  {
    id: 'cog-008',
    name: 'Iron Sapper',
    type: 'construct',
    faction: 'cogborn',
    element: 'chrome',
    rarity: 'common',
    cost: 2,
    attack: 2,
    defense: 2,
    abilities: [
      { name: 'Sabotage', description: 'On summon: Destroy target gear.', type: 'triggered' },
    ],
    flavorText: 'Loose bolts end wars.',
    artPlaceholder: '🧷',
  },
  {
    id: 'cog-009',
    name: 'Forge Apprentice',
    type: 'construct',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'common',
    cost: 1,
    attack: 1,
    defense: 2,
    abilities: [
      { name: 'Stoke', description: 'On summon: Gain 1 temporary Aether this turn.', type: 'triggered' },
    ],
    flavorText: 'First sparks lead to fire.',
    artPlaceholder: '🪛',
  },
  {
    id: 'cog-010',
    name: 'Clockwork Hydra',
    type: 'construct',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'legendary',
    cost: 7,
    attack: 5,
    defense: 8,
    tributeRequired: 2,
    isLegendary: true,
    abilities: [
      { name: 'Multi-Strike', description: 'Can attack twice each battle phase.', type: 'passive' },
      { name: 'Self-Repair', description: 'At end step: Restore 2 DEF.', type: 'triggered' },
    ],
    flavorText: 'Cut off one gear, two more spin.',
    artPlaceholder: '🐍',
  },
  {
    id: 'cog-011',
    name: 'Steamwall Colossus',
    type: 'construct',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'rare',
    cost: 7,
    attack: 3,
    defense: 9,
    tributeRequired: 1,
    abilities: [
      { name: 'Bulwark', description: 'Cannot attack. Prevent 2 damage from each source.', type: 'passive' },
    ],
    flavorText: 'A wall with a heartbeat.',
    artPlaceholder: '🧱',
  },
  {
    id: 'cog-012',
    name: 'Bolt Resetter',
    type: 'construct',
    faction: 'cogborn',
    element: 'chrome',
    rarity: 'uncommon',
    cost: 2,
    attack: 2,
    defense: 3,
    abilities: [
      { name: 'Rewind', description: 'Untap target gear or construct.', type: 'activated', cost: 1 },
    ],
    flavorText: 'If it stalls, rewind the spring.',
    artPlaceholder: '⏪',
  },

  // NANOSWARM EXPANSION
  {
    id: 'nano-005',
    name: 'Data Leech',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'common',
    cost: 2,
    attack: 2,
    defense: 1,
    abilities: [
      { name: 'Drain', description: 'On hit: Opponent discards a card.', type: 'triggered' },
    ],
    flavorText: 'A byte here, a byte there.',
    artPlaceholder: '🦠',
  },
  {
    id: 'nano-006',
    name: 'Holo Stalker',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'uncommon',
    cost: 3,
    attack: 3,
    defense: 2,
    abilities: [
      { name: 'Phasewalk', description: 'Cannot be blocked by constructs with lower ATK.', type: 'passive' },
    ],
    flavorText: 'It only becomes real when it strikes.',
    artPlaceholder: '🕶️',
  },
  {
    id: 'nano-007',
    name: 'Fractal Guardian',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'rare',
    cost: 3,
    attack: 3,
    defense: 4,
    abilities: [
      { name: 'Recursive Armor', description: 'Gets +1/+1 for each Nano in your graveyard.', type: 'passive' },
    ],
    flavorText: 'Defense repeating into infinity.',
    artPlaceholder: '🌀',
  },
  {
    id: 'nano-008',
    name: 'Packet Sniper',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'volt',
    rarity: 'common',
    cost: 1,
    attack: 1,
    defense: 3,
    abilities: [
      { name: 'Ping Shot', description: 'On attack: Deal 1 damage before combat.', type: 'triggered' },
    ],
    flavorText: 'Lag becomes lethal.',
    artPlaceholder: '🎯',
  },
  {
    id: 'nano-009',
    name: 'Mesh Architect',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'chrome',
    rarity: 'epic',
    cost: 5,
    attack: 2,
    defense: 6,
    abilities: [
      { name: 'Distributed Build', description: 'Nano gear costs 1 less.', type: 'passive' },
      { name: 'Scale Up', description: 'Once per turn: Create a 1/1 Nano token.', type: 'activated', cost: 1 },
    ],
    flavorText: 'Weaving nodes into empires.',
    artPlaceholder: '🧩',
  },
  {
    id: 'nano-010',
    name: 'Ghost Compiler',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'void',
    rarity: 'rare',
    cost: 4,
    attack: 4,
    defense: 2,
    abilities: [
      { name: 'Echo Cast', description: 'On summon: Copy target spell in your graveyard; it gains Exhaust.', type: 'triggered' },
    ],
    flavorText: 'Haunted by perfect code.',
    artPlaceholder: '📜',
  },
  {
    id: 'nano-011',
    name: 'Swarm Titan',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'legendary',
    cost: 8,
    attack: 8,
    defense: 7,
    tributeRequired: 2,
    isLegendary: true,
    abilities: [
      { name: 'Mass Replicate', description: 'When summoned: Create two 2/2 Nano tokens.', type: 'triggered' },
      { name: 'Signal Flood', description: 'Tokens you control have +1/+1.', type: 'passive' },
    ],
    flavorText: 'Billions marching as one.',
    artPlaceholder: '🛰️',
  },
  {
    id: 'nano-012',
    name: 'Quantum Shade',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'void',
    rarity: 'epic',
    cost: 6,
    attack: 5,
    defense: 5,
    abilities: [
      { name: 'Untouchable', description: 'Spells and traps cannot target this.', type: 'passive' },
      { name: 'Collapse', description: 'On hit: Exile the top card of the opponent deck.', type: 'triggered' },
    ],
    flavorText: 'A ghost in every machine.',
    artPlaceholder: '🕳️',
  },

  // STEAMWRIGHT EXPANSION
  {
    id: 'steam-003',
    name: 'Aether Smith',
    type: 'construct',
    faction: 'steamwright',
    element: 'aether',
    rarity: 'uncommon',
    cost: 2,
    attack: 2,
    defense: 3,
    abilities: [
      { name: 'Refine', description: 'Gear you play costs 1 less.', type: 'passive' },
    ],
    flavorText: 'Forges cost efficiency into steel.',
    artPlaceholder: '⚒️',
  },
  {
    id: 'steam-004',
    name: 'Railgunner',
    type: 'construct',
    faction: 'steamwright',
    element: 'volt',
    rarity: 'rare',
    cost: 4,
    attack: 4,
    defense: 3,
    abilities: [
      { name: 'Slug Shot', description: 'On attack: Deal 2 damage to opponent or target construct.', type: 'triggered' },
    ],
    flavorText: 'Steel rails become cannons.',
    artPlaceholder: '🎇',
  },
  {
    id: 'steam-005',
    name: 'Furnace Giant',
    type: 'construct',
    faction: 'steamwright',
    element: 'steam',
    rarity: 'epic',
    cost: 6,
    attack: 7,
    defense: 6,
    tributeRequired: 1,
    abilities: [
      { name: 'Overheat', description: 'When attacking: Gain +2 ATK but take 2 damage.', type: 'triggered' },
      { name: 'Fuel Converter', description: 'Damage dealt to this creates that much Aether next main phase.', type: 'passive' },
    ],
    flavorText: 'Heat becomes power, power becomes fuel.',
    artPlaceholder: '🔥',
  },
  {
    id: 'steam-006',
    name: 'Boiler Medic',
    type: 'construct',
    faction: 'steamwright',
    element: 'steam',
    rarity: 'common',
    cost: 2,
    attack: 2,
    defense: 2,
    abilities: [
      { name: 'Patchwork', description: 'On summon: Restore 2 DEF to a construct.', type: 'triggered' },
    ],
    flavorText: 'Heals with rivets and bandages.',
    artPlaceholder: '⛑️',
  },
  {
    id: 'steam-007',
    name: 'Sky Dredger',
    type: 'construct',
    faction: 'steamwright',
    element: 'steam',
    rarity: 'rare',
    cost: 5,
    attack: 5,
    defense: 5,
    abilities: [
      { name: 'Aerial Bombardment', description: 'If opponent controls no gear: Can attack directly.', type: 'passive' },
    ],
    flavorText: 'Airships choose their altitude and their targets.',
    artPlaceholder: '🛩️',
  },
  {
    id: 'steam-008',
    name: 'Alloy Savant',
    type: 'construct',
    faction: 'steamwright',
    element: 'chrome',
    rarity: 'uncommon',
    cost: 3,
    attack: 3,
    defense: 3,
    abilities: [
      { name: 'Study Metal', description: 'On summon: Draw 1 gear card.', type: 'triggered' },
    ],
    flavorText: 'She knows every alloy by resonance.',
    artPlaceholder: '🔬',
  },
  {
    id: 'steam-009',
    name: 'Rift Mechanic',
    type: 'construct',
    faction: 'steamwright',
    element: 'aether',
    rarity: 'epic',
    cost: 4,
    attack: 4,
    defense: 5,
    abilities: [
      { name: 'Recall', description: 'On summon: Return target construct to its owner hand.', type: 'triggered' },
    ],
    flavorText: 'If it breaks, send it back.',
    artPlaceholder: '🌀',
  },
  {
    id: 'steam-010',
    name: 'Vault Guardian',
    type: 'construct',
    faction: 'steamwright',
    element: 'chrome',
    rarity: 'legendary',
    cost: 7,
    attack: 4,
    defense: 9,
    tributeRequired: 2,
    isLegendary: true,
    abilities: [
      { name: 'Sentinel', description: 'Opponents must attack this first.', type: 'passive' },
      { name: 'Safe Keep', description: 'Cards in your hand cannot be discarded by enemy effects.', type: 'passive' },
    ],
    flavorText: 'Guard of the Great Treasury.',
    artPlaceholder: '🛡️',
  },

  // VOIDFORGE EXPANSION
  {
    id: 'void-003',
    name: 'Riftblade Marauder',
    type: 'construct',
    faction: 'voidforge',
    element: 'void',
    rarity: 'uncommon',
    cost: 3,
    attack: 3,
    defense: 3,
    abilities: [
      { name: 'Siphon Edge', description: 'Lifesteal on combat damage.', type: 'passive' },
    ],
    flavorText: 'Every cut drains more than blood.',
    artPlaceholder: '🗡️',
  },
  {
    id: 'void-004',
    name: 'Null Prophet',
    type: 'construct',
    faction: 'voidforge',
    element: 'void',
    rarity: 'rare',
    cost: 4,
    attack: 2,
    defense: 5,
    abilities: [
      { name: 'Silence', description: 'Enemy traps cost +1 Aether.', type: 'passive' },
    ],
    flavorText: 'Preaches the gospel of absence.',
    artPlaceholder: '📿',
  },
  {
    id: 'void-005',
    name: 'Abyssal Devourer',
    type: 'construct',
    faction: 'voidforge',
    element: 'void',
    rarity: 'epic',
    cost: 6,
    attack: 6,
    defense: 6,
    tributeRequired: 1,
    abilities: [
      { name: 'Consume Grave', description: 'On summon: Exile all cards from both graveyards. Gains +1/+1 for each.', type: 'triggered' },
    ],
    flavorText: 'Hunger without horizon.',
    artPlaceholder: '🦈',
  },
  {
    id: 'void-006',
    name: 'Shadow Archivist',
    type: 'construct',
    faction: 'voidforge',
    element: 'void',
    rarity: 'common',
    cost: 1,
    attack: 1,
    defense: 3,
    abilities: [
      { name: 'Index', description: 'On summon: Peek the top card of each deck.', type: 'triggered' },
    ],
    flavorText: 'Cataloging oblivion.',
    artPlaceholder: '📚',
  },
  {
    id: 'void-007',
    name: 'Paradox Weaver',
    type: 'construct',
    faction: 'voidforge',
    element: 'aether',
    rarity: 'rare',
    cost: 4,
    attack: 4,
    defense: 4,
    abilities: [
      { name: 'Duplicate Trigger', description: 'First triggered ability you activate each turn triggers twice.', type: 'passive' },
    ],
    flavorText: 'Loops the loop.',
    artPlaceholder: '🧶',
  },
  {
    id: 'void-008',
    name: 'Dread Myrmidon',
    type: 'construct',
    faction: 'voidforge',
    element: 'void',
    rarity: 'common',
    cost: 2,
    attack: 3,
    defense: 2,
    abilities: [
      { name: 'Death Rattle', description: 'On death: Deal 2 damage to opponent.', type: 'triggered' },
    ],
    flavorText: 'Even its fall hurts.',
    artPlaceholder: '💀',
  },
  {
    id: 'void-009',
    name: 'Void Leviathan',
    type: 'construct',
    faction: 'voidforge',
    element: 'void',
    rarity: 'legendary',
    cost: 9,
    attack: 9,
    defense: 11,
    tributeRequired: 3,
    isLegendary: true,
    abilities: [
      { name: 'Blank Horizon', description: 'Cannot be targeted by spells or traps.', type: 'passive' },
      { name: 'Abyssal Crash', description: 'On summon: Destroy all other constructs.', type: 'triggered' },
    ],
    flavorText: 'The abyss learned to swim.',
    artPlaceholder: '🐋',
  },
  {
    id: 'void-010',
    name: 'Entropic Banshee',
    type: 'construct',
    faction: 'voidforge',
    element: 'void',
    rarity: 'uncommon',
    cost: 2,
    attack: 2,
    defense: 4,
    abilities: [
      { name: 'Wail', description: 'On summon: Opponent loses 1 Aether.', type: 'triggered' },
    ],
    flavorText: 'Her scream erodes reality.',
    artPlaceholder: '👻',
  },

  // SPELL EXPANSION
  {
    id: 'spell-005',
    name: 'Recalibrate',
    type: 'spell',
    faction: 'cogborn',
    element: 'chrome',
    rarity: 'uncommon',
    cost: 2,
    abilities: [
      { name: 'Recalibrate', description: 'Draw 2 cards, then discard 1.', type: 'activated' },
    ],
    flavorText: 'Tighten the bolts, tune the mind.',
    artPlaceholder: '📐',
  },
  {
    id: 'spell-006',
    name: 'Heat Up',
    type: 'spell',
    faction: 'steamwright',
    element: 'steam',
    rarity: 'common',
    cost: 3,
    abilities: [
      { name: 'Heat Up', description: 'Target construct gains +3/+0 this turn.', type: 'activated' },
    ],
    flavorText: 'More pressure, more power.',
    artPlaceholder: '🔥',
  },
  {
    id: 'spell-007',
    name: 'Recursive Strike',
    type: 'spell',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'rare',
    cost: 2,
    abilities: [
      { name: 'Recursive Strike', description: 'Copy the next spell you cast this turn.', type: 'activated' },
    ],
    flavorText: 'Functions call themselves; victory loops.',
    artPlaceholder: '♾️',
  },
  {
    id: 'spell-008',
    name: 'Swarm Upload',
    type: 'spell',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'uncommon',
    cost: 3,
    abilities: [
      { name: 'Swarm Upload', description: 'Return a Nano card from graveyard to hand; create a 1/1 token.', type: 'activated' },
    ],
    flavorText: 'Backups on backups.',
    artPlaceholder: '🗂️',
  },
  {
    id: 'spell-009',
    name: 'Entropy Surge',
    type: 'spell',
    faction: 'voidforge',
    element: 'void',
    rarity: 'rare',
    cost: 4,
    abilities: [
      { name: 'Entropy Surge', description: 'All constructs get -1/-1 until end of turn.', type: 'activated' },
    ],
    flavorText: 'Rust spreads at the speed of thought.',
    artPlaceholder: '🌑',
  },
  {
    id: 'spell-010',
    name: 'Aether Infusion',
    type: 'spell',
    faction: 'neutral',
    element: 'aether',
    rarity: 'uncommon',
    cost: 2,
    abilities: [
      { name: 'Aether Infusion', description: 'Gain 2 temporary Aether this turn.', type: 'activated' },
    ],
    flavorText: 'Focus, channel, release.',
    artPlaceholder: '✨',
  },
  {
    id: 'spell-011',
    name: 'Overhaul',
    type: 'spell',
    faction: 'steamwright',
    element: 'chrome',
    rarity: 'rare',
    cost: 4,
    abilities: [
      { name: 'Overhaul', description: 'Untap target construct; restore 3 DEF; draw 1 card.', type: 'activated' },
    ],
    flavorText: 'New parts, new plans.',
    artPlaceholder: '🔧',
  },
  {
    id: 'spell-012',
    name: 'Dark Bargain',
    type: 'spell',
    faction: 'voidforge',
    element: 'void',
    rarity: 'uncommon',
    cost: 3,
    abilities: [
      { name: 'Dark Bargain', description: 'Draw 2 cards. Lose 500 health.', type: 'activated' },
    ],
    flavorText: 'Knowledge costs vitality.',
    artPlaceholder: '🩸',
  },
  {
    id: 'spell-013',
    name: 'System Scan',
    type: 'spell',
    faction: 'neutral',
    element: 'chrome',
    rarity: 'common',
    cost: 1,
    abilities: [
      { name: 'System Scan', description: 'Look at top 3 cards of your deck; reorder them.', type: 'activated' },
    ],
    flavorText: 'Optimize every draw.',
    artPlaceholder: '🖥️',
  },
  {
    id: 'spell-014',
    name: 'Mass Polishing',
    type: 'spell',
    faction: 'cogborn',
    element: 'chrome',
    rarity: 'rare',
    cost: 5,
    abilities: [
      { name: 'Mass Polishing', description: 'All constructs you control gain +1/+3 this turn.', type: 'activated' },
    ],
    flavorText: 'Shine the brass, harden the steel.',
    artPlaceholder: '🪙',
  },
  {
    id: 'spell-015',
    name: 'Phasedrift',
    type: 'spell',
    faction: 'nanoswarm',
    element: 'void',
    rarity: 'common',
    cost: 1,
    abilities: [
      { name: 'Phasedrift', description: 'Target construct cannot be targeted this turn.', type: 'activated' },
    ],
    flavorText: 'Step half out of phase.',
    artPlaceholder: '🪞',
  },

  // TRAP EXPANSION
  {
    id: 'trap-004',
    name: 'Rust Snare',
    type: 'trap',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'common',
    cost: 1,
    abilities: [
      { name: 'Rust Snare', description: 'When gear is equipped: Destroy that gear.', type: 'chain' },
    ],
    flavorText: 'Oxidation ambush.',
    artPlaceholder: '🪤',
  },
  {
    id: 'trap-005',
    name: 'Countermeasure Lattice',
    type: 'trap',
    faction: 'steamwright',
    element: 'chrome',
    rarity: 'uncommon',
    cost: 2,
    abilities: [
      { name: 'Countermeasure Lattice', description: 'When attacked: Return attacker to hand.', type: 'chain' },
    ],
    flavorText: 'Every approach meets a net.',
    artPlaceholder: '🕸️',
  },
  {
    id: 'trap-006',
    name: 'Failsafe Loop',
    type: 'trap',
    faction: 'steamwright',
    element: 'aether',
    rarity: 'uncommon',
    cost: 2,
    abilities: [
      { name: 'Failsafe Loop', description: 'When your construct would be destroyed: Return it to your hand instead.', type: 'chain' },
    ],
    flavorText: 'Prototype, iterate, repeat.',
    artPlaceholder: '♻️',
  },
  {
    id: 'trap-007',
    name: 'Packet Jammer',
    type: 'trap',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'common',
    cost: 1,
    abilities: [
      { name: 'Packet Jammer', description: 'When opponent draws extra cards: They discard one at random.', type: 'chain' },
    ],
    flavorText: 'Noise overwhelms signal.',
    artPlaceholder: '📡',
  },
  {
    id: 'trap-008',
    name: 'Backtrace',
    type: 'trap',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'rare',
    cost: 3,
    abilities: [
      { name: 'Backtrace', description: 'When a spell targets you: Copy it and choose new targets.', type: 'chain' },
    ],
    flavorText: 'Follow the signal to strike.',
    artPlaceholder: '🔁',
  },
  {
    id: 'trap-009',
    name: 'Grav Mine',
    type: 'trap',
    faction: 'cogborn',
    element: 'chrome',
    rarity: 'uncommon',
    cost: 2,
    abilities: [
      { name: 'Grav Mine', description: 'When enemy summons: Deal 2 damage to it and tap it.', type: 'chain' },
    ],
    flavorText: 'Heavy is the head that steps there.',
    artPlaceholder: '🪨',
  },
  {
    id: 'trap-010',
    name: 'Obsidian Veil',
    type: 'trap',
    faction: 'voidforge',
    element: 'void',
    rarity: 'rare',
    cost: 3,
    abilities: [
      { name: 'Obsidian Veil', description: 'When opponent declares direct attack: Negate it and end battle phase.', type: 'chain' },
    ],
    flavorText: 'Darkness answers with silence.',
    artPlaceholder: '🧥',
  },
  {
    id: 'trap-011',
    name: 'Catalyst Leak',
    type: 'trap',
    faction: 'voidforge',
    element: 'aether',
    rarity: 'uncommon',
    cost: 2,
    abilities: [
      { name: 'Catalyst Leak', description: 'When opponent gains Aether outside draw step: They lose 1 Aether.', type: 'chain' },
    ],
    flavorText: 'Power spills into the void.',
    artPlaceholder: '🧪',
  },
  {
    id: 'trap-012',
    name: 'Mirror Gear',
    type: 'trap',
    faction: 'cogborn',
    element: 'chrome',
    rarity: 'rare',
    cost: 2,
    abilities: [
      { name: 'Mirror Gear', description: 'When opponent equips gear: Copy it onto your target construct.', type: 'chain' },
    ],
    flavorText: 'Reflections remember.',
    artPlaceholder: '🪞',
  },

  // ENCHANTMENT EXPANSION
  {
    id: 'ench-003',
    name: 'Foundry Chorus',
    type: 'enchantment',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'uncommon',
    cost: 3,
    abilities: [
      { name: 'Foundry Chorus', description: 'Constructs you control gain +0/+2.', type: 'passive' },
    ],
    flavorText: 'Hammers beat in rhythm.',
    artPlaceholder: '🥁',
  },
  {
    id: 'ench-004',
    name: 'Nanocloud Dominion',
    type: 'enchantment',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'rare',
    cost: 3,
    abilities: [
      { name: 'Nanocloud Dominion', description: 'Tokens you control gain +1/+0 and Haste.', type: 'passive' },
    ],
    flavorText: 'A fog of obedient code.',
    artPlaceholder: '☁️',
  },
  {
    id: 'ench-005',
    name: 'Forge Sanctum',
    type: 'enchantment',
    faction: 'steamwright',
    element: 'chrome',
    rarity: 'rare',
    cost: 4,
    abilities: [
      { name: 'Forge Sanctum', description: 'Once per turn: Prevent a construct from being destroyed.', type: 'passive' },
    ],
    flavorText: 'Shelter for the newly forged.',
    artPlaceholder: '⛪',
  },
  {
    id: 'ench-006',
    name: 'Quantum Lattice',
    type: 'enchantment',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'epic',
    cost: 4,
    abilities: [
      { name: 'Quantum Lattice', description: 'Spells you cast cost 1 less.', type: 'passive' },
    ],
    flavorText: 'Computation interwoven.',
    artPlaceholder: '🧠',
  },
  {
    id: 'ench-007',
    name: 'Corrosion Field',
    type: 'enchantment',
    faction: 'voidforge',
    element: 'void',
    rarity: 'uncommon',
    cost: 3,
    abilities: [
      { name: 'Corrosion Field', description: 'Enemy gear loses its bonuses.', type: 'passive' },
    ],
    flavorText: 'Everything rusts here.',
    artPlaceholder: '🧲',
  },
  {
    id: 'ench-008',
    name: 'Void Rites',
    type: 'enchantment',
    faction: 'voidforge',
    element: 'void',
    rarity: 'rare',
    cost: 5,
    abilities: [
      { name: 'Void Rites', description: 'End step: Opponent loses 1 health and 1 Aether.', type: 'passive' },
    ],
    flavorText: 'A prayer to nothing.',
    artPlaceholder: '🕯️',
  },
  {
    id: 'ench-009',
    name: 'Aether Resonance',
    type: 'enchantment',
    faction: 'neutral',
    element: 'aether',
    rarity: 'common',
    cost: 2,
    abilities: [
      { name: 'Aether Resonance', description: 'When you cast a spell: Gain 300 health.', type: 'triggered' },
    ],
    flavorText: 'Harmony heals.',
    artPlaceholder: '🎶',
  },
  {
    id: 'ench-010',
    name: 'Sky Dock',
    type: 'enchantment',
    faction: 'steamwright',
    element: 'aether',
    rarity: 'rare',
    cost: 3,
    abilities: [
      { name: 'Sky Dock', description: 'First gear you play each turn costs 1 less; when you equip, draw a card.', type: 'passive' },
    ],
    flavorText: 'Every ship needs a berth.',
    artPlaceholder: '🛳️',
  },

  // GEAR EXPANSION
  {
    id: 'gear-006',
    name: 'Plasma Cutter',
    type: 'gear',
    faction: 'cogborn',
    element: 'volt',
    rarity: 'uncommon',
    cost: 3,
    abilities: [
      { name: 'Cleave', description: 'Equipped construct gains +2/+0 and first strike.', type: 'passive' },
    ],
    flavorText: 'Slices through steel like silk.',
    artPlaceholder: '🔪',
    attackBonus: 2,
  },
  {
    id: 'gear-007',
    name: 'Gyro Shield',
    type: 'gear',
    faction: 'steamwright',
    element: 'chrome',
    rarity: 'common',
    cost: 2,
    abilities: [
      { name: 'Stabilize', description: 'Equip: +0/+3 and prevent 1 damage per hit.', type: 'passive' },
    ],
    flavorText: 'Balance is defense.',
    artPlaceholder: '🛡️',
    defenseBonus: 3,
  },
  {
    id: 'gear-008',
    name: 'Memory Coil',
    type: 'gear',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'rare',
    cost: 2,
    abilities: [
      { name: 'Record', description: 'When equipped construct attacks: Draw 1, then discard 1.', type: 'triggered' },
    ],
    flavorText: 'Stores moments of battle.',
    artPlaceholder: '💽',
    attackBonus: 1,
  },
  {
    id: 'gear-009',
    name: 'Smog Turbine',
    type: 'gear',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'uncommon',
    cost: 3,
    abilities: [
      { name: 'Generate', description: 'On attack: Gain 1 temporary Aether.', type: 'triggered' },
      { name: 'Thick Plating', description: 'Equip grants +1/+1.', type: 'passive' },
    ],
    flavorText: 'Smog in the lungs, power in the gears.',
    artPlaceholder: '🌫️',
    attackBonus: 1,
    defenseBonus: 1,
  },
  {
    id: 'gear-010',
    name: 'Void Spines',
    type: 'gear',
    faction: 'voidforge',
    element: 'void',
    rarity: 'epic',
    cost: 4,
    abilities: [
      { name: 'Reflect', description: 'Equipped construct gains +2/+2. When dealt damage, deal 1 back.', type: 'passive' },
    ],
    flavorText: 'Pain reciprocates.',
    artPlaceholder: '🦔',
    attackBonus: 2,
    defenseBonus: 2,
  },
  {
    id: 'gear-011',
    name: 'Holo Visor',
    type: 'gear',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'common',
    cost: 1,
    abilities: [
      { name: 'Predict', description: 'On equip: Scry 1. Equipped construct gains +1 ATK.', type: 'triggered' },
    ],
    flavorText: 'See the line before it draws.',
    artPlaceholder: '🎯',
    attackBonus: 1,
  },
  {
    id: 'gear-012',
    name: 'Titan Plating',
    type: 'gear',
    faction: 'steamwright',
    element: 'chrome',
    rarity: 'rare',
    cost: 5,
    abilities: [
      { name: 'Fortify', description: 'Equipped construct gains +0/+4 and Taunt (must be attacked first).', type: 'passive' },
    ],
    flavorText: 'Armor fit for a vault.',
    artPlaceholder: '🪙',
    defenseBonus: 4,
  },

  // CATALYST EXPANSION
  {
    id: 'cat-003',
    name: 'Chrome Converter',
    type: 'catalyst',
    faction: 'neutral',
    element: 'chrome',
    rarity: 'uncommon',
    cost: 0,
    abilities: [
      { name: 'Convert', description: 'Every other turn: Generate 1 Aether of any element.', type: 'passive' },
    ],
    flavorText: 'Metal becomes possibility.',
    artPlaceholder: '🔄',
  },
  {
    id: 'cat-004',
    name: 'Void Reactor',
    type: 'catalyst',
    faction: 'voidforge',
    element: 'void',
    rarity: 'rare',
    cost: 0,
    abilities: [
      { name: 'Pulse', description: 'Every third turn: Generate 2 Void Aether.', type: 'passive' },
    ],
    flavorText: 'Power cycles from emptiness.',
    artPlaceholder: '⚛️',
  },
  {
    id: 'cat-005',
    name: 'Steam Dynamo',
    type: 'catalyst',
    faction: 'steamwright',
    element: 'steam',
    rarity: 'common',
    cost: 0,
    abilities: [
      { name: 'Store', description: 'Store 1 unused Aether between turns.', type: 'passive' },
    ],
    flavorText: 'Bottled pressure.',
    artPlaceholder: '🧴',
  },
  {
    id: 'cat-006',
    name: 'Nano Lattice',
    type: 'catalyst',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'uncommon',
    cost: 0,
    abilities: [
      { name: 'Subsidize', description: 'Nano gear costs 1 less Aether.', type: 'passive' },
    ],
    flavorText: 'Structure and subsidy intertwined.',
    artPlaceholder: '🧱',
  },
];

// ================== HELPER FUNCTIONS ==================
const getRarityColor = (rarity: CardRarity): string => {
  switch (rarity) {
    case 'common': return 'border-slate-500';
    case 'uncommon': return 'border-green-500';
    case 'rare': return 'border-blue-500';
    case 'epic': return 'border-purple-500';
    case 'legendary': return 'border-amber-500';
    case 'mythic': return 'border-pink-500';
    default: return 'border-slate-500';
  }
};

const getRarityGlow = (rarity: CardRarity): string => {
  switch (rarity) {
    case 'legendary': return 'shadow-lg shadow-amber-500/30';
    case 'mythic': return 'shadow-lg shadow-pink-500/30 animate-pulse';
    case 'epic': return 'shadow-md shadow-purple-500/20';
    default: return '';
  }
};

const getFactionColor = (faction: Faction): string => {
  switch (faction) {
    case 'cogborn': return 'bg-amber-900/30';
    case 'nanoswarm': return 'bg-cyan-900/30';
    case 'steamwright': return 'bg-orange-900/30';
    case 'voidforge': return 'bg-purple-900/30';
    default: return 'bg-slate-800';
  }
};

const getElementIcon = (element: Element): React.ReactNode => {
  switch (element) {
    case 'steam': return <Flame size={14} className="text-orange-400" />;
    case 'volt': return <Zap size={14} className="text-yellow-400" />;
    case 'nano': return <CircuitBoard size={14} className="text-cyan-400" />;
    case 'void': return <Moon size={14} className="text-purple-400" />;
    case 'chrome': return <Cog size={14} className="text-slate-400" />;
    case 'aether': return <Sparkles size={14} className="text-pink-400" />;
    default: return <Star size={14} />;
  }
};

const getTypeIcon = (type: CardType): React.ReactNode => {
  switch (type) {
    case 'construct': return <Bot size={14} />;
    case 'spell': return <Zap size={14} />;
    case 'trap': return <Shield size={14} />;
    case 'enchantment': return <Sparkles size={14} />;
    case 'gear': return <Wrench size={14} />;
    case 'catalyst': return <Atom size={14} />;
    default: return <Star size={14} />;
  }
};

// ================== PACK CONFIG & RNG TABLES ==================
const RARITY_ORDER: CardRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

const DEFAULT_WEIGHTS: Record<CardRarity, number> = {
  starter: 1.0,    // Starter deck cards (1-3 star, 800-1200 ATK)
  common: 0.62,
  uncommon: 0.24,
  rare: 0.1,
  epic: 0.03,
  legendary: 0.009,
  mythic: 0.001,
  promo: 0,        // First 500 winners only - special reward
  catalyst: 0,     // Your exclusive 50-card deck - not in packs
};

const PACK_CONFIGS: PackConfig[] = [
  {
    id: 'pack-cogborn',
    name: 'Cogborn Starter Pack',
    price: 500,
    cards: 10,
    guaranteed: 'rare',
    theme: 'cogborn',
    weights: DEFAULT_WEIGHTS,
    accent: 'amber',
    emoji: '⚙️',
  },
  {
    id: 'pack-nanoswarm',
    name: 'Nanoswarm Booster',
    price: 300,
    cards: 5,
    guaranteed: 'uncommon',
    theme: 'nanoswarm',
    weights: DEFAULT_WEIGHTS,
    pityEpic: 4,
    accent: 'cyan',
    emoji: '🔬',
  },
  {
    id: 'pack-legendary',
    name: 'Legendary Vault',
    price: 2000,
    cards: 3,
    guaranteed: 'legendary',
    theme: 'mixed',
    weights: { ...DEFAULT_WEIGHTS, epic: 0.08, legendary: 0.06, mythic: 0.01 },
    pityEpic: 2,
    pityLegendary: 4,
    accent: 'purple',
    emoji: '👑',
  },
];

// ================== STARTER DECK HELPERS ==================
// Commons appear multiple times so they are not all unique (commons should overlap)
const STARTER_COMMON_POOL = [
  'proto-001', 'proto-001',
  'proto-002', 'proto-002',
  'proto-003',
  'proto-004',
  'cog-001', 'cog-003', 'nano-001'
];
const UNIQUE_UNCOMMON_BASE_ID = 'proto-005';
const EVOLVING_RARE_BASE_ID = 'proto-006';
const RULE_POOL: RuleModifier[] = [
  { id: 'rule-volt', name: 'Voltaic Surge', description: 'Construct attacks +20% damage this match.', effect: 'attackBoost', magnitude: 0.2 },
  { id: 'rule-armor', name: 'Iron Bulwark', description: 'Construct defense +20% this match.', effect: 'defenseBoost', magnitude: 0.2 },
  { id: 'rule-aether', name: 'Aether Flood', description: '+1 max Aether on first 3 turns.', effect: 'aetherBoost', magnitude: 1 },
  { id: 'rule-gear', name: 'Forge Fever', description: 'Gear grants +1/+1 extra.', effect: 'gearBoost', magnitude: 1 },
  { id: 'rule-trap', name: 'Trap Frenzy', description: 'Traps deal +2 damage when they trigger.', effect: 'trapBuff', magnitude: 2 },
];

const cloneCard = (card: AetheriumCard): AetheriumCard => JSON.parse(JSON.stringify(card));

const findCardById = (id: string): AetheriumCard => {
  const found = CARD_DATABASE.find((c) => c.id === id);
  if (!found) {
    throw new Error(`Card with id ${id} not found`);
  }
  return cloneCard(found);
};

const buildRarityBuckets = (theme?: Faction | 'mixed'): Record<CardRarity, AetheriumCard[]> => {
  const buckets: Record<CardRarity, AetheriumCard[]> = {
    starter: [],
    common: [],
    uncommon: [],
    rare: [],
    epic: [],
    legendary: [],
    mythic: [],
    promo: [],
    catalyst: [],
  };

  CARD_DATABASE.forEach((card) => {
    if (theme && theme !== 'mixed' && card.faction !== theme && card.faction !== 'neutral') return;
    buckets[card.rarity].push(card);
  });

  return buckets;
};

const rollRarity = (
  config: PackConfig,
  pity: { epic: number; legendary: number },
  weights: Record<CardRarity, number>
): CardRarity => {
  if (config.pityLegendary && pity.legendary >= config.pityLegendary - 1) return 'legendary';
  if (config.pityEpic && pity.epic >= config.pityEpic - 1) return 'epic';

  const roll = Math.random();
  let cumulative = 0;
  for (const rarity of RARITY_ORDER) {
    cumulative += weights[rarity] || 0;
    if (roll <= cumulative) return rarity;
  }
  return 'common';
};

const pickFromBucket = (bucket: AetheriumCard[]): AetheriumCard => {
  if (bucket.length === 0) return cloneCard(CARD_DATABASE[0]);
  return cloneCard(bucket[Math.floor(Math.random() * bucket.length)]);
};

const fulfillPackServerSide = async (
  config: PackConfig,
  pity: { epic: number; legendary: number }
): Promise<PackOpenResponse> => {
  const buckets = buildRarityBuckets(config.theme);
  const cards: AetheriumCard[] = [];
  let pityTracker = { ...pity };
  const auditSeed = Date.now();

  for (let i = 0; i < config.cards; i++) {
    const rarity = i === 0 ? config.guaranteed : rollRarity(config, pityTracker, config.weights);
    const pool = buckets[rarity].length > 0 ? buckets[rarity] : buckets.common;
    const nextCard = pickFromBucket(pool);
    cards.push(nextCard);

    if (rarity === 'legendary') {
      pityTracker.legendary = 0;
      pityTracker.epic = 0;
    } else if (rarity === 'epic') {
      pityTracker.epic = 0;
      pityTracker.legendary += 1;
    } else {
      pityTracker.epic += 1;
      pityTracker.legendary += 1;
    }
  }

  return {
    packId: config.id,
    cards,
    auditSeed,
    nextPity: pityTracker,
  };
};

const summarizeRarities = (cards: AetheriumCard[]): Record<CardRarity, number> => {
  const summary: Record<CardRarity, number> = {
    starter: 0,
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
    promo: 0,
    catalyst: 0,
  };
  cards.forEach((card) => { summary[card.rarity] = (summary[card.rarity] || 0) + 1; });
  return summary;
};

const createUniqueUncommon = (profile: CompanionProfile, index: number): AetheriumCard => {
  const base = findCardById(UNIQUE_UNCOMMON_BASE_ID);
  return {
    ...base,
    id: `starter-uncommon-${profile.userId}-${index + 1}`,
    name: `${profile.personality} Prototype ${index + 1}`,
    abilities: [
      ...base.abilities,
      { name: 'Bonded Inspiration', description: `Gains +1/+1 when ${profile.name} completes a coding task.`, type: 'triggered' },
    ],
    nonTradeable: true,
    boundTo: profile.userId,
    flavorText: `${profile.personality} energy hums within the chassis.`,
  };
};

const createEvolvingRare = (profile: CompanionProfile): AetheriumCard => {
  const base = findCardById(EVOLVING_RARE_BASE_ID);
  return {
    ...base,
    id: `starter-rare-${profile.userId}`,
    name: `${profile.name}'s Companion Core`,
    nonTradeable: true,
    boundTo: profile.userId,
    evolutionStage: 1,
    maxEvolutionStage: 5,
    xp: profile.level * 10,
    abilities: [
      ...base.abilities,
      { name: 'Personality Sync', description: `Echoes ${profile.personality} choices to unlock evolutions.`, type: 'passive' },
      { name: 'Model Infusion', description: `Base model ${profile.model} boosts spells linked to ${profile.codingFocus}.`, type: 'passive' },
      { name: 'Net Navi Link', description: `Adopts form: ${profile.companionForm || 'Net Navi'}; gains +1/+1 on each companion activity sync.`, type: 'triggered' },
    ],
    flavorText: 'Non-tradeable. Non-replaceable. It grows only with you.',
  };
};

const generateStarterDeck = (profile: CompanionProfile): StarterDeck => {
  const commons = STARTER_COMMON_POOL.map(findCardById).map((card, idx) => ({
    ...card,
    id: `${card.id}-${profile.userId}-${idx}`,
    nonTradeable: true,
    boundTo: profile.userId,
  }));

  const uniqueUncommons = [0, 1, 2].map((i) => createUniqueUncommon(profile, i));
  const evolvingRare = createEvolvingRare(profile);

  return {
    ownerId: profile.userId,
    commons,
    uniqueUncommons,
    evolvingRare,
  };
};

// Prime Catalyst (owner-only) deck definition
const PRIME_OWNER_ID = 'prime-architect';
const PRIME_CATALYST_CARD_IDS = ['cog-004', 'nano-004', 'gear-002', 'spell-003', 'trap-003', 'ench-002', 'nano-002', 'cog-002', 'void-002'];
const CHALLENGES = [
  { id: 'chal-1', title: 'Win with 0 constructs destroyed', reward: '150 pts' },
  { id: 'chal-2', title: 'Trigger 3 traps in one match', reward: 'Prime foil chance' },
  { id: 'chal-3', title: 'Deal 2000+ damage in a single attack', reward: 'Holo badge' },
];
const SEASON_CAP = 800; // first edition cap
const SEASON_NOTES = 'First Edition capped at 800 cards. Catalyst reverse backs only in Season 1; next window Season 4.';
const TIERS = [
  { name: 'Starter', coins: 500 },
  { name: 'Tier 2', coins: 1000 },
  { name: 'Tier 3', coins: 2000 },
  { name: 'Catalyst Org', coins: 5000 },
];

const buildPrimeCatalystDeck = (): PrimeCatalystDeck => {
  const cards = PRIME_CATALYST_CARD_IDS.map((id, idx) => {
    const base = findCardById(id);
    return {
      ...base,
      id: `${id}-prime-${idx}`,
      primeVariant: true,
      holographic: true,
      cardBackStyle: 'prime-reverse' as const,
      nonTradeable: true,
      boundTo: PRIME_OWNER_ID,
      flavorText: 'Prime Catalyst series. Defeat the Architect to earn a copy.',
    };
  });

  return {
    ownerId: PRIME_OWNER_ID,
    cards,
    rewardRule: 'Defeat the Prime Architect to earn 1 copy of a random Prime card.',
    penaltyRule: 'Lose and the Architect claims 2 cards from your collection.',
    entryRule: 'Win 5 matches vs Architect to join platform devs.',
  };
};

// ================== CARD COMPONENT ==================
interface CardDisplayProps {
  card: AetheriumCard;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  selected?: boolean;
  tapped?: boolean;
  inHand?: boolean;
}

function CardDisplay({ card, size = 'medium', onClick, selected, tapped, inHand }: CardDisplayProps) {
  const sizeClasses = {
    small: 'w-24 h-36',
    medium: 'w-32 h-48',
    large: 'w-48 h-72',
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        ${getFactionColor(card.faction)}
        ${getRarityColor(card.rarity)}
        ${getRarityGlow(card.rarity)}
        ${selected ? 'ring-2 ring-aura-500 scale-110' : ''}
        ${tapped ? 'rotate-90' : ''}
        ${inHand ? 'hover:-translate-y-4 hover:z-10' : ''}
        ${card.primeVariant ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/30' : ''}
        relative rounded-lg border-2 cursor-pointer transition-all duration-200
        flex flex-col overflow-hidden
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-2 py-1 bg-black/40">
        <span className="text-white text-xs font-semibold truncate flex-1">{card.name}</span>
        <span className="flex items-center gap-1 text-xs text-amber-400">
          {card.cost}
          <Atom size={10} />
        </span>
      </div>

      {/* Art */}
      <div className="flex-1 flex items-center justify-center bg-black/20 relative">
        <span className={`text-4xl ${card.holographic ? 'animate-pulse text-amber-200 drop-shadow-[0_0_6px_rgba(255,209,102,0.8)]' : ''}`}>
          {card.artPlaceholder}
        </span>
        {card.isLegendary && (
          <Crown size={16} className="absolute top-1 right-1 text-amber-400" />
        )}
        {card.primeVariant && (
          <Star size={14} className="absolute bottom-1 left-1 text-amber-300" />
        )}
      </div>

      {/* Type Bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-black/60 text-xs">
        <span className="flex items-center gap-1 text-slate-300 capitalize">
          {getTypeIcon(card.type)}
          {card.type}
        </span>
        <span className="flex items-center gap-1">
          {getElementIcon(card.element)}
        </span>
      </div>

      {/* Stats (for constructs) */}
      {card.type === 'construct' && (
        <div className="flex justify-between px-2 py-1 bg-black/80">
          <span className="text-red-400 font-bold text-sm flex items-center gap-1">
            <Swords size={12} />
            {card.attack}
          </span>
          <span className="text-blue-400 font-bold text-sm flex items-center gap-1">
            <Shield size={12} />
            {card.defense}
          </span>
        </div>
      )}

      {/* Tribute indicator */}
      {card.tributeRequired && (
        <div className="absolute top-8 left-1 bg-red-900/80 px-1 rounded text-xs text-red-200">
          ⚔️ {card.tributeRequired}
        </div>
      )}

      {card.nonTradeable && (
        <div className="absolute top-8 right-1 bg-amber-900/80 px-2 rounded text-[10px] text-amber-200">
          Bound
        </div>
      )}

      {card.evolutionStage && card.maxEvolutionStage && (
        <div className="absolute bottom-1 right-1 bg-purple-900/80 px-2 rounded text-[10px] text-purple-200">
          Evo {card.evolutionStage}/{card.maxEvolutionStage}
        </div>
      )}

      {card.cardBackStyle === 'prime-reverse' && (
        <div className="absolute top-1 left-1 bg-slate-900/80 px-2 rounded text-[10px] text-amber-100 border border-amber-400/40">
          Prime Back
        </div>
      )}
    </div>
  );
}

// ================== GAME BOARD COMPONENT ==================
function GameBoard() {
  const selectVolatileRules = (): RuleModifier[] => {
    const now = new Date();
    const week = Math.floor((now.getTime() / 1000 / 60 / 60 / 24 + 3) / 7); // shift to avoid week-0 issues
    const ruleCount = 2;
    const picks: RuleModifier[] = [];
    for (let i = 0; i < ruleCount; i++) {
      const idx = (week + i * 3) % RULE_POOL.length;
      picks.push(RULE_POOL[idx]);
    }
    return picks;
  };

  const createRuleEngine = (): RuleEngineState => ({
    stack: [],
    log: [],
    violations: [],
    oncePerTurn: new Set<string>(),
    tests: [],
  });

  const [gameState, setGameState] = useState<GameState>({
    playerHealth: 8000,
    opponentHealth: 8000,
    playerAether: 3,
    playerMaxAether: 3,
    opponentAether: 3,
    opponentMaxAether: 3,
    turn: 1,
    phase: 'main',
    isPlayerTurn: true,
    playerHand: CARD_DATABASE.slice(0, 5),
    opponentHandCards: CARD_DATABASE.slice(5, 10),
    opponentDeck: CARD_DATABASE.slice(10, 20),
    playerField: [null, null, null, null, null],
    opponentField: [null, null, null, null, null],
    playerEquipment: [null, null, null, null, null],
    opponentEquipment: [null, null, null, null, null],
    playerGraveyard: [],
    opponentGraveyard: [],
    chainStack: [],
    activeRules: selectVolatileRules(),
    surpriseRuleRevealed: false,
  });
  const [ruleEngine, setRuleEngine] = useState<RuleEngineState>(() => createRuleEngine());
  const [selectedCard, setSelectedCard] = useState<AetheriumCard | null>(null);
  const [selectedFieldSlot, setSelectedFieldSlot] = useState<number | null>(null);
  const [showCardDetail, setShowCardDetail] = useState<AetheriumCard | null>(null);

  const validateActionForTest = (
    action: RuleEngineAction,
    availableAether: number,
    once: Set<string>,
    currentPhase: GameState['phase']
  ): RuleViolation[] => {
    const issues: RuleViolation[] = [];
    if (action.cost && action.cost > availableAether) {
      issues.push({ actionId: action.id, message: 'Insufficient Aether', severity: 'error' });
    }
    if (action.oncePerTurnKey && once.has(action.oncePerTurnKey)) {
      issues.push({ actionId: action.id, message: 'Once-per-turn already used', severity: 'error' });
    }
    if (action.type === 'attack' && (currentPhase === 'draw' || currentPhase === 'end')) {
      issues.push({ actionId: action.id, message: 'Attacks not allowed this phase', severity: 'error' });
    }
    if ((action.type === 'playCard' || action.type === 'equip') && currentPhase === 'battle') {
      issues.push({ actionId: action.id, message: 'Cannot play cards during battle phase', severity: 'warning' });
    }
    return issues;
  };

  const queueAction = useCallback((action: RuleEngineAction): boolean => {
    const phase = gameState.phase;
    const available = action.actor === 'player' ? gameState.playerAether : gameState.opponentAether;
    const issues = validateActionForTest(action, available, ruleEngine.oncePerTurn, phase);

    if (issues.length > 0) {
      setRuleEngine((prev: RuleEngineState) => ({
        ...prev,
        violations: [...prev.violations, ...issues].slice(-8),
        log: [...prev.log, `Blocked ${action.description}`].slice(-10),
      }));
      toast.error(issues[0].message);
      return false;
    }

    setRuleEngine((prev: RuleEngineState) => {
      const updatedOnce = new Set(prev.oncePerTurn);
      if (action.oncePerTurnKey) updatedOnce.add(action.oncePerTurnKey);
      return {
        ...prev,
        stack: [...prev.stack, action].slice(-10),
        log: [...prev.log, `Queued ${action.description}`].slice(-10),
        oncePerTurn: updatedOnce,
      };
    });
    return true;
  }, [gameState.phase, gameState.playerAether, gameState.opponentAether, ruleEngine.oncePerTurn]);

  const completeAction = (actionId: string, note?: string) => {
    setRuleEngine((prev: RuleEngineState) => ({
      ...prev,
      stack: prev.stack.filter((a: RuleEngineAction) => a.id !== actionId),
      log: note ? [...prev.log, note].slice(-10) : prev.log,
    }));
  };

  const resetRuleEngineTurn = () => {
    setRuleEngine((prev: RuleEngineState) => ({
      ...prev,
      stack: [],
      violations: [],
      oncePerTurn: new Set<string>(),
      log: [...prev.log, 'Turn reset'].slice(-10),
    }));
  };

  useEffect(() => {
    const tests: RuleTestResult[] = [];
    const once = new Set<string>();
    const tooExpensive: RuleEngineAction = {
      id: 'test-cost',
      actor: 'player',
      type: 'playCard',
      description: 'Cost gate',
      phase: 'main',
      cost: 20,
    };
    const costIssues = validateActionForTest(tooExpensive, 5, once, 'main');
    tests.push({ name: 'Cost enforcement', status: costIssues.length > 0 ? 'pass' : 'fail', note: `${costIssues.length} violation(s)` });

    once.add('key-repeat');
    const repeatAction: RuleEngineAction = {
      id: 'test-repeat',
      actor: 'player',
      type: 'playCard',
      description: 'Once-per-turn gate',
      phase: 'main',
      cost: 1,
      oncePerTurnKey: 'key-repeat',
    };
    const repeatIssues = validateActionForTest(repeatAction, 5, once, 'main');
    tests.push({ name: 'Once-per-turn', status: repeatIssues.length > 0 ? 'pass' : 'fail', note: `${repeatIssues.length} violation(s)` });

    setRuleEngine((prev: RuleEngineState) => ({ ...prev, tests }));
  }, []);

  const getGearBonus = (gearCard: AetheriumCard | null | undefined) => ({
    atk: gearCard?.attackBonus || 0,
    def: gearCard?.defenseBonus || 0,
  });

  const getRuleAttackMultiplier = () => {
    let mult = 1;
    gameState.activeRules.forEach((r: RuleModifier) => {
      if (r.effect === 'attackBoost') mult += r.magnitude;
    });
    return mult;
  };

  const getRuleDefenseMultiplier = () => {
    let mult = 1;
    gameState.activeRules.forEach((r: RuleModifier) => {
      if (r.effect === 'defenseBoost') mult += r.magnitude;
    });
    return mult;
  };

  const getEffectiveStats = (card: AetheriumCard | null, gearCard: AetheriumCard | null) => {
    if (!card) return { atk: 0, def: 0 };
    const atk = Math.floor(((card.attack || 0) + (gearCard?.attackBonus || 0)) * getRuleAttackMultiplier());
    const def = Math.floor(((card.defense || 0) + (gearCard?.defenseBonus || 0)) * getRuleDefenseMultiplier());
    return { atk, def };
  };

  const getBotMode = () => {
    const playerBoard = gameState.playerField.filter(Boolean).length;
    const botBoard = gameState.opponentField.filter(Boolean).length;
    if (gameState.opponentHealth < gameState.playerHealth - 1200) return 'defend';
    if (botBoard >= playerBoard + 1) return 'aggro';
    return 'balanced';
  };

  const drawCard = (isPlayer: boolean) => {
    if (isPlayer) {
      const nextCard = CARD_DATABASE[Math.floor(Math.random() * CARD_DATABASE.length)];
      setGameState((prev: GameState) => ({ ...prev, playerHand: [...prev.playerHand, nextCard] }));
    } else {
      setGameState((prev: GameState) => {
        const [next, ...rest] = prev.opponentDeck.length > 0 ? prev.opponentDeck : [null];
        if (!next) return prev;
        return {
          ...prev,
          opponentDeck: rest,
          opponentHandCards: [...prev.opponentHandCards, next],
        };
      });
    }
  };

  const playCard = (card: AetheriumCard, slotIndex: number) => {
    const actionId = `act-${card.id}-${Date.now()}`;
    const action: RuleEngineAction = {
      id: actionId,
      actor: 'player',
      type: card.type === 'gear' ? 'equip' : 'playCard',
      description: `Play ${card.name}`,
      phase: gameState.phase,
      cost: card.cost,
      oncePerTurnKey: card.type === 'spell' ? `${card.id}-turn-${gameState.turn}` : undefined,
    };

    if (!queueAction(action)) return;

    // Gear/equipment must target an existing construct slot
    if (card.type === 'gear') {
      if (slotIndex === null || gameState.playerField[slotIndex] === null) {
        toast.error('Select a construct slot to equip.');
        return;
      }
      setGameState((prev: GameState) => ({
        ...prev,
        playerAether: prev.playerAether - card.cost,
        playerHand: prev.playerHand.filter(c => c.id !== card.id),
        playerEquipment: prev.playerEquipment.map((eq, idx) => idx === slotIndex ? card : eq),
      }));
      toast.success(`${card.name} equipped!`);
      completeAction(actionId, `${card.name} resolved`);
      setSelectedCard(null);
      return;
    }

    if (card.tributeRequired) {
      const constructsOnField = gameState.playerField.filter((c: AetheriumCard | null) => c !== null).length;
      if (constructsOnField < card.tributeRequired) {
        toast.error(`Need ${card.tributeRequired} construct(s) to tribute!`);
        return;
      }
    }

    setGameState((prev: GameState) => ({
      ...prev,
      playerAether: prev.playerAether - card.cost,
      playerHand: prev.playerHand.filter(c => c.id !== card.id),
      playerField: prev.playerField.map((slot, idx) => idx === slotIndex ? card : slot),
    }));

    toast.success(`${card.name} summoned!`);
    completeAction(actionId, `${card.name} resolved`);
    setSelectedCard(null);
  };

  const attackWithConstruct = (attackerIndex: number, defenderIndex: number) => {
    const attacker = gameState.playerField[attackerIndex];
    const attackerGear = gameState.playerEquipment[attackerIndex];
    const defender = gameState.opponentField[defenderIndex];
    const defenderGear = gameState.opponentEquipment[defenderIndex];

    if (!attacker || attacker.type !== 'construct') return;

    const actionId = `attack-${attacker.id}-${attackerIndex}-${Date.now()}`;
    const action: RuleEngineAction = {
      id: actionId,
      actor: 'player',
      type: 'attack',
      description: `${attacker.name} attacks`,
      phase: gameState.phase,
    };
    if (!queueAction(action)) return;

    const atkBonus = getGearBonus(attackerGear);
    const defBonus = defender ? getGearBonus(defenderGear) : { atk: 0, def: 0 };
    const attackPower = Math.floor((attacker.attack || 0 + atkBonus.atk) * getRuleAttackMultiplier());
    const defenderPower = defender ? Math.floor((defender.defense || 0 + defBonus.def) * getRuleDefenseMultiplier()) : 0;

    if (defender && defender.type === 'construct') {
      toast(`${attacker.name} attacks ${defender.name}!`);
      
      setGameState((prev: GameState) => {
        const newOpponentField = [...prev.opponentField];
        const newPlayerField = [...prev.playerField];
        const newOpponentEquip = [...prev.opponentEquipment];
        const newPlayerEquip = [...prev.playerEquipment];

        if (attackPower >= defenderPower) {
          newOpponentField[defenderIndex] = null;
          newOpponentEquip[defenderIndex] = null;
          toast.success(`${defender.name} destroyed!`);
        }
        if ((defender?.attack || 0) >= (attacker.defense || 0 + atkBonus.def)) {
          newPlayerField[attackerIndex] = null;
          newPlayerEquip[attackerIndex] = null;
          toast.error(`${attacker.name} destroyed!`);
        }
        
        return {
          ...prev,
          playerField: newPlayerField,
          opponentField: newOpponentField,
          playerEquipment: newPlayerEquip,
          opponentEquipment: newOpponentEquip,
        };
      });
    } else {
      setGameState((prev: GameState) => ({
        ...prev,
        opponentHealth: prev.opponentHealth - attackPower,
      }));
      toast.success(`Direct attack for ${attackPower} damage!`);
    }

    completeAction(actionId, 'Attack resolved');
  };

  const revealSurpriseRule = () => {
    if (gameState.surpriseRuleRevealed) return;
    const extraRule = RULE_POOL[(gameState.turn + 2) % RULE_POOL.length];
    setGameState((prev: GameState) => ({
      ...prev,
      activeRules: [...prev.activeRules, extraRule],
      surpriseRuleRevealed: true,
    }));
    toast(`Volatile Rule Appears: ${extraRule.name}`);
  };

  const botPlayTurn = () => {
    const mode = getBotMode();

    setGameState((prev: GameState) => {
      const newAether = Math.min(prev.opponentMaxAether + 1, 10);
      let hand = [...prev.opponentHandCards];
      let field = [...prev.opponentField];
      let equip = [...prev.opponentEquipment];
      let aether = newAether;

      const playableConstructs = hand
        .filter(c => c.type === 'construct' && c.cost <= aether)
        .sort((a, b) => {
          const aAtk = a.attack || 0;
          const bAtk = b.attack || 0;
          const aDef = a.defense || 0;
          const bDef = b.defense || 0;
          return mode === 'defend' ? bDef - aDef || bAtk - aAtk : bAtk - aAtk || bDef - aDef;
        });

      const construct = playableConstructs[0];
      if (construct) {
        const emptySlot = field.findIndex(f => f === null);
        if (emptySlot !== -1) {
          aether -= construct.cost;
          field[emptySlot] = construct;
          hand = hand.filter(c => c.id !== construct.id);
        }
      }

      const playableGear = hand.filter(c => c.type === 'gear' && c.cost <= aether);
      const gear = playableGear.sort((a, b) => (b.attackBonus || 0) + (b.defenseBonus || 0) - ((a.attackBonus || 0) + (a.defenseBonus || 0)))[0];
      if (gear) {
        const bestSlot = field
          .map((card, idx) => ({ idx, score: getEffectiveStats(card, equip[idx]).atk }))
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score)[0];
        const targetSlot = bestSlot ? bestSlot.idx : field.findIndex(f => f !== null);
        if (targetSlot !== -1) {
          aether -= gear.cost;
          equip[targetSlot] = gear;
          hand = hand.filter(c => c.id !== gear.id);
        }
      }

      return {
        ...prev,
        opponentAether: aether,
        opponentMaxAether: newAether,
        opponentField: field,
        opponentEquipment: equip,
        opponentHandCards: hand,
      };
    });

    setGameState((prev: GameState) => {
      const field = [...prev.opponentField];
      const equip = [...prev.opponentEquipment];
      let playerField = [...prev.playerField];
      let playerEquip = [...prev.playerEquipment];
      let playerHealth = prev.playerHealth;

      const targetIndexForBot = () => {
        const candidates = playerField
          .map((card, idx) => ({ idx, card, stats: getEffectiveStats(card, playerEquip[idx]) }))
          .filter(({ card }) => card);
        if (candidates.length === 0) return -1;
        candidates.sort((a, b) => {
          if (mode === 'defend') return b.stats.atk - a.stats.atk || b.stats.def - a.stats.def;
          return b.stats.atk - a.stats.atk || a.stats.def - b.stats.def;
        });
        return candidates[0].idx;
      };

      field.forEach((card, idx) => {
        if (!card) return;
        const stats = getEffectiveStats(card, equip[idx]);
        const targetIdx = targetIndexForBot();
        if (targetIdx !== -1) {
          const defenderStats = getEffectiveStats(playerField[targetIdx], playerEquip[targetIdx]);
          if (stats.atk >= defenderStats.def) {
            playerField[targetIdx] = null;
            playerEquip[targetIdx] = null;
          } else if (mode === 'aggro' && defenderStats.atk < stats.atk) {
            playerHealth -= Math.max(0, stats.atk - defenderStats.def);
          }
        } else {
          playerHealth -= stats.atk;
        }
      });

      return {
        ...prev,
        playerField,
        playerEquipment: playerEquip,
        playerHealth,
      };
    });
  };

  const endTurn = () => {
    setGameState((prev: GameState) => ({
      ...prev,
      isPlayerTurn: false,
      turn: prev.turn + 1,
      playerAether: Math.min(prev.playerMaxAether + 1, 10),
      playerMaxAether: Math.min(prev.playerMaxAether + 1, 10),
      phase: 'draw',
    }));

    resetRuleEngineTurn();

    if (gameState.turn === 2) revealSurpriseRule();

    setTimeout(() => {
      drawCard(false);
      botPlayTurn();
      setTimeout(() => {
        setGameState((prev: GameState) => ({
          ...prev,
          isPlayerTurn: true,
          phase: 'main',
        }));
        drawCard(true);
        toast('Your turn!');
      }, 800);
    }, 500);
  };

  return (
    <div className="space-y-4">
      {/* Game Info Bar */}
      <div className="flex justify-between items-center bg-slate-800 rounded-lg p-3">
        <div className="flex items-center gap-4">
          <span className="text-white">Turn {gameState.turn}</span>
          <span className={`px-3 py-1 rounded text-sm ${gameState.isPlayerTurn ? 'bg-green-600' : 'bg-red-600'}`}>
            {gameState.isPlayerTurn ? 'Your Turn' : 'Opponent Turn'}
          </span>
          <span className="text-slate-400 capitalize">Phase: {gameState.phase}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings size={14} className="mr-1" />
            Settings
          </Button>
          <Button variant="outline" size="sm" className="text-red-400">
            Surrender
          </Button>
        </div>
      </div>

      <Card className="bg-slate-900 border border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-sm">Rule Engine</CardTitle>
          <CardDescription className="text-slate-400 text-xs">Stack, violations, and self-checks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-slate-300">
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-slate-800 rounded">Stack: {ruleEngine.stack.length}</span>
            <span className="px-2 py-1 bg-slate-800 rounded">Once/turn keys: {ruleEngine.oncePerTurn.size}</span>
            <span className="px-2 py-1 bg-slate-800 rounded">Violations: {ruleEngine.violations.length}</span>
          </div>
          {ruleEngine.stack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ruleEngine.stack.map((a) => (
                <span key={a.id} className="px-2 py-1 bg-amber-900/40 rounded border border-amber-700/40">{a.description}</span>
              ))}
            </div>
          )}
          {ruleEngine.violations.length > 0 && (
            <div className="flex flex-wrap gap-2 text-red-300">
              {ruleEngine.violations.map((v) => (
                <span key={`${v.actionId}-${v.message}`} className="px-2 py-1 bg-red-900/40 rounded border border-red-700/40">{v.message}</span>
              ))}
            </div>
          )}
          {ruleEngine.tests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {ruleEngine.tests.map((t) => (
                <span key={t.name} className={`px-2 py-1 rounded ${t.status === 'pass' ? 'bg-green-900/40 text-green-200' : 'bg-red-900/40 text-red-200'}`}>
                  {t.name}: {t.status}
                </span>
              ))}
            </div>
          )}
          {ruleEngine.log.length > 0 && (
            <div className="flex flex-wrap gap-2 text-slate-400">
              {ruleEngine.log.slice(-6).map((entry, idx) => (
                <span key={`${entry}-${idx}`} className="px-2 py-1 bg-slate-800 rounded">{entry}</span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Opponent Area */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <p className="text-white font-semibold">AI Opponent</p>
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-red-400" />
                <span className="text-red-400">{gameState.opponentHealth}/8000</span>
                <span className="text-slate-400 mx-2">|</span>
                <Atom size={14} className="text-amber-400" />
                <span className="text-amber-400">{gameState.opponentAether}/{gameState.opponentMaxAether}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Package size={16} className="text-slate-400" />
            <span className="text-slate-400">{gameState.opponentHandCards.length} cards</span>
          </div>
        </div>

        {/* Opponent Field */}
        <div className="flex justify-center gap-2">
          {gameState.opponentField.map((card, idx) => (
            <div
              key={idx}
              className={`w-24 h-36 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center
                ${card ? 'cursor-pointer hover:border-red-500' : ''}`}
              onClick={() => card && selectedCard && attackWithConstruct(selectedFieldSlot!, idx)}
            >
              {card ? (
                <div className="relative">
                  <CardDisplay card={card} size="small" onClick={() => setShowCardDetail(card)} />
                  {gameState.opponentEquipment[idx] && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] bg-amber-900/70 px-2 rounded text-amber-200">
                      Equip: {gameState.opponentEquipment[idx]?.name}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-slate-600 text-xs">Empty</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Center Area - Phase indicator */}
      <div className="flex justify-center">
        <div className="flex gap-4 bg-slate-800 rounded-full px-6 py-2">
          {['draw', 'main', 'battle', 'end'].map((phase) => (
            <span
              key={phase}
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                gameState.phase === phase ? 'bg-aura-600 text-white' : 'text-slate-500'
              }`}
            >
              {phase}
            </span>
          ))}
        </div>
      </div>

      {/* Player Field */}
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
        <div className="flex justify-center gap-2 mb-4">
          {gameState.playerField.map((card, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (selectedCard && !card) {
                  playCard(selectedCard, idx);
                } else if (card) {
                  setSelectedFieldSlot(idx);
                }
              }}
              className={`w-24 h-36 rounded-lg border-2 border-dashed flex items-center justify-center transition
                ${selectedCard && !card ? 'border-green-500 bg-green-900/20 cursor-pointer' : 'border-slate-700'}
                ${selectedFieldSlot === idx ? 'border-aura-500' : ''}`}
            >
              {card ? (
                <div className="relative">
                  <CardDisplay card={card} size="small" selected={selectedFieldSlot === idx} />
                  {gameState.playerEquipment[idx] && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] bg-amber-900/70 px-2 rounded text-amber-200">
                      Equip: {gameState.playerEquipment[idx]?.name}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-slate-600 text-xs">+</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-aura-600 rounded-full flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <p className="text-white font-semibold">You</p>
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-red-400" />
                <span className="text-red-400">{gameState.playerHealth}/8000</span>
                <span className="text-slate-400 mx-2">|</span>
                <Atom size={14} className="text-amber-400" />
                <span className="text-amber-400">{gameState.playerAether}/{gameState.playerMaxAether}</span>
              </div>
            </div>
          </div>
          <Button onClick={endTurn} disabled={!gameState.isPlayerTurn} className="bg-aura-600">
            End Turn
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>

      {/* Player Hand */}
      <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
        <p className="text-slate-400 text-sm mb-3">Your Hand ({gameState.playerHand.length})</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {gameState.playerHand.map((card) => (
            <CardDisplay
              key={card.id}
              card={card}
              size="medium"
              inHand
              selected={selectedCard?.id === card.id}
              onClick={() => setSelectedCard(selectedCard?.id === card.id ? null : card)}
            />
          ))}
        </div>
      </div>

      {/* Card Detail Modal */}
      {showCardDetail && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowCardDetail(null)}>
          <div className="bg-slate-900 rounded-xl p-6 max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-4">
              <CardDisplay card={showCardDetail} size="large" />
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">{showCardDetail.name}</h2>
                <p className="text-slate-400 capitalize">{showCardDetail.faction} • {showCardDetail.type}</p>
                
                <div className="mt-4 space-y-2">
                  {showCardDetail.abilities.map((ability, idx) => (
                    <div key={idx} className="bg-slate-800 rounded p-2">
                      <p className="text-aura-400 font-semibold text-sm">{ability.name}</p>
                      <p className="text-slate-300 text-sm">{ability.description}</p>
                    </div>
                  ))}
                </div>
                
                <p className="text-slate-500 italic text-sm mt-4">"{showCardDetail.flavorText}"</p>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={() => setShowCardDetail(null)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ================== DECK BUILDER ==================
function DeckBuilder() {
  const [deck, setDeck] = useState<DeckSlot[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFaction, setFilterFaction] = useState<Faction | 'all'>('all');
  const [filterType, setFilterType] = useState<CardType | 'all'>('all');
  const [deckName, setDeckName] = useState('New Deck');

  const maxDeckSize = 40;
  const maxCopies = 3;

  const filteredCards = CARD_DATABASE.filter((card) => {
    if (filterFaction !== 'all' && card.faction !== filterFaction) return false;
    if (filterType !== 'all' && card.type !== filterType) return false;
    if (searchQuery && !card.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const addToDeck = (card: AetheriumCard) => {
    const totalCards = deck.reduce((sum, slot) => sum + slot.count, 0);
    if (totalCards >= maxDeckSize) {
      toast.error(`Deck limit is ${maxDeckSize} cards!`);
      return;
    }

    const existingSlot = deck.find((slot) => slot.card.id === card.id);
    if (existingSlot) {
      if (existingSlot.count >= maxCopies) {
        toast.error(`Maximum ${maxCopies} copies allowed!`);
        return;
      }
      setDeck(deck.map((slot) =>
        slot.card.id === card.id ? { ...slot, count: slot.count + 1 } : slot
      ));
    } else {
      setDeck([...deck, { card, count: 1 }]);
    }
  };

  const removeFromDeck = (cardId: string) => {
    const slot = deck.find((s) => s.card.id === cardId);
    if (!slot) return;

    if (slot.count > 1) {
      setDeck(deck.map((s) =>
        s.card.id === cardId ? { ...s, count: s.count - 1 } : s
      ));
    } else {
      setDeck(deck.filter((s) => s.card.id !== cardId));
    }
  };

  const deckStats = {
    total: deck.reduce((sum, slot) => sum + slot.count, 0),
    constructs: deck.filter((s) => s.card.type === 'construct').reduce((sum, s) => sum + s.count, 0),
    spells: deck.filter((s) => s.card.type === 'spell').reduce((sum, s) => sum + s.count, 0),
    traps: deck.filter((s) => s.card.type === 'trap').reduce((sum, s) => sum + s.count, 0),
    avgCost: deck.length > 0 ? (deck.reduce((sum, s) => sum + s.card.cost * s.count, 0) / deck.reduce((sum, s) => sum + s.count, 0)).toFixed(1) : 0,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Card Collection */}
      <div className="lg:col-span-2 space-y-4">
        {/* Filters */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4">
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700"
                />
              </div>
              <select
                value={filterFaction}
                onChange={(e) => setFilterFaction(e.target.value as Faction | 'all')}
                className="bg-slate-800 border border-slate-700 rounded-md text-white px-3 py-2"
              >
                <option value="all">All Factions</option>
                <option value="cogborn">Cogborn</option>
                <option value="nanoswarm">Nanoswarm</option>
                <option value="steamwright">Steamwright</option>
                <option value="voidforge">Voidforge</option>
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as CardType | 'all')}
                className="bg-slate-800 border border-slate-700 rounded-md text-white px-3 py-2"
              >
                <option value="all">All Types</option>
                <option value="construct">Constructs</option>
                <option value="spell">Spells</option>
                <option value="trap">Traps</option>
                <option value="enchantment">Enchantments</option>
                <option value="gear">Gear</option>
                <option value="catalyst">Catalysts</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Card Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredCards.map((card) => (
            <div key={card.id} className="relative">
              <CardDisplay card={card} size="medium" onClick={() => addToDeck(card)} />
              <Button
                size="sm"
                className="absolute bottom-2 right-2 w-8 h-8 p-0 bg-green-600"
                onClick={() => addToDeck(card)}
              >
                <Plus size={16} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Deck Panel */}
      <div className="space-y-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="py-3">
            <Input
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              className="bg-transparent border-0 text-xl font-bold text-white focus:ring-0"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Deck Stats */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-800 rounded p-2 text-center">
                <p className="text-white font-bold">{deckStats.total}/40</p>
                <p className="text-slate-400 text-xs">Cards</p>
              </div>
              <div className="bg-slate-800 rounded p-2 text-center">
                <p className="text-amber-400 font-bold">{deckStats.avgCost}</p>
                <p className="text-slate-400 text-xs">Avg Cost</p>
              </div>
            </div>

            {/* Type Breakdown */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Constructs</span>
                <span>{deckStats.constructs}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Spells</span>
                <span>{deckStats.spells}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Traps</span>
                <span>{deckStats.traps}</span>
              </div>
            </div>

            {/* Deck List */}
            <div className="border-t border-slate-800 pt-4 max-h-[400px] overflow-y-auto space-y-1">
              {deck.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Click cards to add them to your deck</p>
              ) : (
                deck.map((slot) => (
                  <div
                    key={slot.card.id}
                    className="flex items-center gap-2 p-2 bg-slate-800 rounded hover:bg-slate-700"
                  >
                    <span className="text-lg">{slot.card.artPlaceholder}</span>
                    <span className="flex-1 text-white text-sm truncate">{slot.card.name}</span>
                    <span className="text-amber-400 text-sm">{slot.card.cost}</span>
                    <span className="text-slate-400 text-sm">x{slot.count}</span>
                    <button
                      onClick={() => removeFromDeck(slot.card.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <Button className="w-full bg-aura-600" disabled={deckStats.total < 40}>
              Save Deck
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ================== COLLECTION ==================
function CardCollection() {
  const [ownedCards] = useState<Set<string>>(new Set(CARD_DATABASE.slice(0, 15).map(c => c.id)));
  const [viewRarity, setViewRarity] = useState<CardRarity | 'all'>('all');

  const filteredCards = CARD_DATABASE.filter((card) => {
    if (viewRarity !== 'all' && card.rarity !== viewRarity) return false;
    return true;
  });

  const collectionStats = {
    owned: ownedCards.size,
    total: CARD_DATABASE.length,
    common: CARD_DATABASE.filter(c => c.rarity === 'common' && ownedCards.has(c.id)).length,
    rare: CARD_DATABASE.filter(c => c.rarity === 'rare' && ownedCards.has(c.id)).length,
    legendary: CARD_DATABASE.filter(c => c.rarity === 'legendary' && ownedCards.has(c.id)).length,
  };

  return (
    <div className="space-y-6">
      {/* Collection Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-white">{collectionStats.owned}/{collectionStats.total}</p>
            <p className="text-slate-400 text-sm">Cards Collected</p>
            <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-aura-500"
                style={{ width: `${(collectionStats.owned / collectionStats.total) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-900/30 border-amber-700">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-400">{collectionStats.legendary}</p>
            <p className="text-amber-200 text-sm">Legendaries</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/30 border-blue-700">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-400">{collectionStats.rare}</p>
            <p className="text-blue-200 text-sm">Rares</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-slate-300">{collectionStats.common}</p>
            <p className="text-slate-400 text-sm">Commons</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as const).map((rarity) => (
          <Button
            key={rarity}
            variant={viewRarity === rarity ? 'default' : 'outline'}
            onClick={() => setViewRarity(rarity)}
            size="sm"
            className={`capitalize ${viewRarity === rarity ? 'bg-aura-600' : ''}`}
          >
            {rarity}
          </Button>
        ))}
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredCards.map((card) => (
          <div key={card.id} className={!ownedCards.has(card.id) ? 'opacity-30 grayscale' : ''}>
            <CardDisplay card={card} size="medium" />
            {!ownedCards.has(card.id) && (
              <div className="text-center mt-1">
                <Lock size={14} className="inline text-slate-500" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ================== STARTER INVENTORY (Bound Deck) ==================
function StarterInventory() {
  const companionProfile: CompanionProfile = {
    userId: 'demo-user-001',
    name: 'Aurora',
    model: 'nova-coder',
    personality: 'Curious',
    codingFocus: 'TypeScript',
    level: 12,
    recentActivities: ['Built UI components', 'Refactored game loop', 'Optimized deck filters'],
    companionForm: 'Net Navi',
  };

  const [starterDeck] = useState<StarterDeck>(() => generateStarterDeck(companionProfile));
  const allCards = [...starterDeck.uniqueUncommons, starterDeck.evolvingRare, ...starterDeck.commons];

  const primeDeck = buildPrimeCatalystDeck();

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Bound Starter Deck</CardTitle>
          <CardDescription className="text-slate-400">
            Non-tradeable, non-replaceable cards that grow with {companionProfile.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-300 text-sm">Companion</p>
            <p className="text-xl text-white font-semibold">{companionProfile.name}</p>
            <p className="text-slate-400 text-sm">Model: {companionProfile.model}</p>
            <p className="text-slate-400 text-sm">Focus: {companionProfile.codingFocus}</p>
            <p className="text-amber-400 text-sm">Level {companionProfile.level}</p>
            <div className="mt-3 space-y-1 text-xs text-slate-400">
              {companionProfile.recentActivities.map((act) => (
                <div key={act} className="flex items-center gap-2">
                  <Check size={12} className="text-green-400" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-300 text-sm mb-1">Deck Composition</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-slate-900 rounded p-2 text-center">
                <p className="text-white font-bold">{starterDeck.commons.length}</p>
                <p className="text-slate-400 text-xs">Commons (proto)</p>
              </div>
              <div className="bg-slate-900 rounded p-2 text-center">
                <p className="text-white font-bold">3</p>
                <p className="text-slate-400 text-xs">Unique Uncommons</p>
              </div>
              <div className="bg-slate-900 rounded p-2 text-center">
                <p className="text-white font-bold">1</p>
                <p className="text-slate-400 text-xs">Evolving Rare</p>
              </div>
              <div className="bg-slate-900 rounded p-2 text-center">
                <p className="text-amber-400 font-bold">Bound</p>
                <p className="text-slate-400 text-xs">Non-tradeable</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3">Evolves via coding actions, complexity milestones, and companion personality traits.</p>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-300 text-sm mb-2">Evolving Rare</p>
            <div className="flex gap-3 items-start">
              <CardDisplay card={starterDeck.evolvingRare} size="small" />
              <div className="text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-1 text-purple-300">
                  <Sparkles size={12} /> Evolves with XP and personality sync
                </div>
                <div className="flex items-center gap-1 text-amber-300">
                  <Lock size={12} /> Non-tradeable & bound
                </div>
                <div className="flex items-center gap-1 text-green-300">
                  <Atom size={12} /> Base model: {companionProfile.model}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Game Layout Map</CardTitle>
          <CardDescription className="text-slate-400 text-sm">Zones: Hand • Field (5 slots each side) • Equipment row • Graveyard • Chain stack • Aether pool • Volatile rules banner.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-200">
            <div className="bg-slate-800/70 p-3 rounded-lg border border-slate-700">Top: Opponent Avatar • Health 8000 • Aether • Hand count • Volatile rule badges.</div>
            <div className="bg-slate-800/70 p-3 rounded-lg border border-slate-700">Center: Opponent Field (5) / Player Field (5) with equipment tags; chain reactions trigger here.</div>
            <div className="bg-slate-800/70 p-3 rounded-lg border border-slate-700">Bottom: Player Avatar • Health 8000 • Aether • Hand (fan) • End Turn button • Graveyard & stack conceptual.</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {starterDeck.uniqueUncommons.map((card) => (
          <CardDisplay key={card.id} card={card} size="medium" />
        ))}
        {starterDeck.commons.map((card) => (
          <CardDisplay key={card.id} card={card} size="small" />
        ))}
      </div>

      <Card className="bg-gradient-to-br from-slate-900 to-amber-900/40 border-amber-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star size={16} className="text-amber-400" /> Prime Catalyst Challenge
          </CardTitle>
          <CardDescription className="text-slate-300">
            My personal, near-unbeatable deck. Holographic, reverse-back Prime cards. Win to claim a Prime copy; lose and I take 2 of yours. Five wins earns dev access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-900/70 rounded-lg p-3 text-sm text-slate-200">
              <p className="font-semibold text-amber-300">Rules</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-300">
                <li>• Deck power tuned to be almost unbeatable, but luck + smart play can win.</li>
                <li>• Reward: 1 random Prime copy from my deck on victory.</li>
                <li>• Penalty: I claim 2 cards from your collection on defeat.</li>
                <li>• Prestige: 5 victories → invited to platform devs.</li>
              </ul>
            </div>
            <div className="bg-slate-900/70 rounded-lg p-3 text-sm text-slate-200">
              <p className="font-semibold text-amber-300">Deck Traits</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-300">
                <li>• Holographic Prime series with reversed backs.</li>
                <li>• Non-tradeable; bound to Prime Architect.</li>
                <li>• High-tempo control + finishers (Singularity, Brassworth).</li>
                <li>• Trap reflection and mind-control tech.</li>
              </ul>
            </div>
            <div className="bg-slate-900/70 rounded-lg p-3 text-sm text-slate-200">
              <p className="font-semibold text-amber-300">Companion Sync</p>
              <p className="text-xs text-slate-300 mt-2">XP and evolutions tether to companion activity data. Net Navi form boosts evolution speed when coding or shipping features.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {primeDeck.cards.map((card) => (
              <CardDisplay key={card.id} card={card} size="small" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ================== MAIN AETHERIUM COMPONENT ==================
export default function AetheriumSuitePage() {
  const [activeTab, setActiveTab] = useState('play');
  const [packOpening, setPackOpening] = useState<PackOpenResponse | null>(null);
  const [packPity, setPackPity] = useState({ epic: 0, legendary: 0 });
  const [isOpeningPack, setIsOpeningPack] = useState(false);
  const [playerCoins, setPlayerCoins] = useState(0);

  // Load player wallet
  useEffect(() => {
    const wallet = getWallet('demo-user');
    setPlayerCoins(wallet.aetherCoins);
  }, []);

  const handleOpenPack = useCallback(async (packId: string) => {
    const config = PACK_CONFIGS.find((p) => p.id === packId);
    if (!config) {
      toast.error('Pack not found');
      return;
    }

    // Check if player has enough coins
    const wallet = getWallet('demo-user');
    if (wallet.aetherCoins < config.price) {
      toast.error(`Not enough Aether Coins! Need ${config.price}, have ${wallet.aetherCoins}. Complete daily challenges to earn more!`);
      return;
    }

    // Spend coins
    const spendResult = spendCoins('demo-user', config.price, 'aetherium', `${config.name} Pack`);
    if (!spendResult.success) {
      toast.error(spendResult.message);
      return;
    }

    setPlayerCoins(spendResult.newBalance);

    setIsOpeningPack(true);
    try {
      const result = await fulfillPackServerSide(config, packPity);
      setPackOpening(result);
      setPackPity(result.nextPity);
      const raritySummary = summarizeRarities(result.cards);
      toast.success(`Opened ${config.name}: ${raritySummary.legendary || 0} legendary, ${raritySummary.epic || 0} epic`);
    } catch (err) {
      toast.error('Pack opening failed');
    } finally {
      setIsOpeningPack(false);
    }
  }, [packPity]);

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mb-2">
                ⚙️ AETHERIUM ⚙️
              </h1>
              <p className="text-xl text-slate-400 mb-1">Chronicles of the Cogwork Realm</p>
              <p className="text-sm text-slate-500">
                Steampunk × Nanotech • Strategic Card Battles • 800+ Cards
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-2">
              <WalletDisplay userId="demo-user" />
              <p className="text-xs text-slate-500">Earn coins from daily challenges across all suites!</p>
            </div>
          </div>
        </div>

        {/* Daily Challenge Widget - The Architect's Challenge */}
        <div className="mb-8">
          <DailyChallengeWidget section="aetherium" userId="demo-user" compact />
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 justify-center flex-wrap">
            <TabsTrigger value="play" className="data-[state=active]:bg-amber-600">
              <Swords size={16} className="mr-2" />
              Play
            </TabsTrigger>
            <TabsTrigger value="challengers" className="data-[state=active]:bg-purple-600">
              <Crown size={16} className="mr-2" />
              Challengers
            </TabsTrigger>
            <TabsTrigger value="deck" className="data-[state=active]:bg-amber-600">
              <Layers size={16} className="mr-2" />
              Deck Builder
            </TabsTrigger>
            <TabsTrigger value="collection" className="data-[state=active]:bg-amber-600">
              <Grid3X3 size={16} className="mr-2" />
              Collection
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-amber-600">
              <Gift size={16} className="mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="shop" className="data-[state=active]:bg-amber-600">
              <Package size={16} className="mr-2" />
              Card Shop
            </TabsTrigger>
          </TabsList>

          <TabsContent value="play">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-amber-900/50 to-slate-900 border-amber-700 cursor-pointer hover:border-amber-500 transition">
                  <CardContent className="p-6 text-center">
                    <Bot size={48} className="mx-auto text-amber-400 mb-4" />
                    <h3 className="text-white font-bold text-lg">vs AI</h3>
                    <p className="text-slate-400 text-sm">Practice against AI opponents</p>
                    <Button className="mt-4 bg-amber-600">Start Battle</Button>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-900/50 to-slate-900 border-blue-700 cursor-pointer hover:border-blue-500 transition">
                  <CardContent className="p-6 text-center">
                    <Users size={48} className="mx-auto text-blue-400 mb-4" />
                    <h3 className="text-white font-bold text-lg">Quick Match</h3>
                    <p className="text-slate-400 text-sm">Find an online opponent</p>
                    <Button className="mt-4 bg-blue-600">Find Match</Button>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-900/50 to-slate-900 border-purple-700 cursor-pointer hover:border-purple-500 transition">
                  <CardContent className="p-6 text-center">
                    <Trophy size={48} className="mx-auto text-purple-400 mb-4" />
                    <h3 className="text-white font-bold text-lg">Ranked</h3>
                    <p className="text-slate-400 text-sm">Competitive ladder matches</p>
                    <Button className="mt-4 bg-purple-600">Enter Ranked</Button>
                  </CardContent>
                </Card>
              </div>
              <Card className="bg-slate-900 border border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Volatile Rules (Weekly + Mid-match)</CardTitle>
                  <CardDescription className="text-slate-400 text-sm">Rules may appear at start or mid-game. Rotates weekly; surprise rule on turn 3.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-900/60 text-amber-200 text-sm border border-amber-600/40">
                      🔥 Steam Surge: +1 ATK to Steam constructs
                    </span>
                    <span className="px-3 py-1 rounded-full bg-amber-900/60 text-amber-200 text-sm border border-amber-600/40">
                      ⚡ Nano Boost: +1 DEF to Nano constructs
                    </span>
                  </div>
                  <p className="text-xs text-purple-300">A surprise rule will emerge mid-game.</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Challenges</CardTitle>
                  <CardDescription className="text-slate-400 text-sm">Complete rotating feats to earn rewards.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  {CHALLENGES.map((c) => (
                    <div key={c.id} className="bg-slate-800/70 rounded-lg p-3 border border-slate-700">
                      <p className="text-white font-semibold">{c.title}</p>
                      <p className="text-amber-300 text-xs mt-1">Reward: {c.reward}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <GameBoard />
            </div>
          </TabsContent>

          {/* Platform Challengers Tab */}
          <TabsContent value="challengers">
            <div className="space-y-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="text-amber-400" />
                    Platform Challengers
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Defeat NPC challengers to earn Aether Coins and rare cards! Higher difficulty = better rewards.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PLATFORM_CHALLENGERS.map((challenger) => (
                      <div
                        key={challenger.id}
                        className={`
                          rounded-lg border-2 p-4 transition-all hover:scale-102 cursor-pointer
                          ${challenger.difficulty === 'novice' ? 'bg-gray-800/50 border-gray-600 hover:border-gray-400' : ''}
                          ${challenger.difficulty === 'apprentice' ? 'bg-emerald-900/30 border-emerald-700 hover:border-emerald-500' : ''}
                          ${challenger.difficulty === 'adept' ? 'bg-blue-900/30 border-blue-700 hover:border-blue-500' : ''}
                          ${challenger.difficulty === 'master' ? 'bg-purple-900/30 border-purple-700 hover:border-purple-500' : ''}
                          ${challenger.difficulty === 'architect' ? 'bg-gradient-to-br from-pink-900/40 to-purple-900/40 border-pink-500 hover:border-pink-400' : ''}
                        `}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-3xl">{challenger.avatar}</span>
                          <div>
                            <h3 className="text-white font-bold">{challenger.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded capitalize
                              ${challenger.difficulty === 'novice' ? 'bg-gray-700 text-gray-200' : ''}
                              ${challenger.difficulty === 'apprentice' ? 'bg-emerald-800 text-emerald-200' : ''}
                              ${challenger.difficulty === 'adept' ? 'bg-blue-800 text-blue-200' : ''}
                              ${challenger.difficulty === 'master' ? 'bg-purple-800 text-purple-200' : ''}
                              ${challenger.difficulty === 'architect' ? 'bg-pink-800 text-pink-200' : ''}
                            `}>
                              {challenger.difficulty}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm mb-3 italic">{challenger.flavorQuote}</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-300">
                            <span>Win Reward:</span>
                            <span className="text-amber-400">{challenger.winReward.coins} coins</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Card Drop:</span>
                            <span className="text-emerald-400">{challenger.winReward.cardChance}%</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Card Rarity:</span>
                            <span className="capitalize text-blue-300">{challenger.winReward.cardRarity}</span>
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-4 bg-amber-600 hover:bg-amber-500"
                          onClick={() => toast.success(`Challenge ${challenger.name} - Coming soon!`)}
                        >
                          Challenge
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* The Architect - Special Boss */}
              <Card className="bg-gradient-to-br from-slate-900 via-purple-950/50 to-slate-900 border-2 border-amber-500">
                <CardHeader>
                  <CardTitle className="text-amber-400 flex items-center gap-2">
                    👑 The Architect's Prime Challenge
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Defeat the platform owner to earn exclusive Prime Catalyst cards!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-bold mb-2">Rules of Engagement</h4>
                      <ul className="space-y-2 text-sm text-slate-300">
                        <li className="flex items-start gap-2">
                          <Trophy size={14} className="text-amber-400 mt-0.5" />
                          Win: Earn 1 random Prime Catalyst card (reversed backing, mythic rarity)
                        </li>
                        <li className="flex items-start gap-2">
                          <Skull size={14} className="text-red-400 mt-0.5" />
                          Lose: The Architect claims 2 cards from your collection
                        </li>
                        <li className="flex items-start gap-2">
                          <Star size={14} className="text-purple-400 mt-0.5" />
                          Win 5 matches to join the platform development team
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-2">Prime Deck Preview</h4>
                      <div className="flex flex-wrap gap-2">
                        {PRIME_CATALYST_DECK.slice(0, 6).map((card) => (
                          <div 
                            key={card.id}
                            className="w-16 h-20 rounded bg-gradient-to-b from-slate-800 to-purple-950 border border-amber-500/50 flex flex-col items-center justify-center text-center p-1"
                          >
                            <span className="text-lg">{card.artPlaceholder}</span>
                            <span className="text-[7px] text-amber-200 truncate w-full">{card.name}</span>
                          </div>
                        ))}
                        <div className="w-16 h-20 rounded bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-500 text-xs">
                          +{PRIME_CATALYST_DECK.length - 6} more
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-6 bg-gradient-to-r from-amber-600 to-purple-600 hover:from-amber-500 hover:to-purple-500"
                    onClick={() => toast.success('Challenge The Architect - Coming soon!')}
                  >
                    <Crown size={16} className="mr-2" />
                    Challenge The Architect
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="deck">
            <DeckBuilder />
          </TabsContent>

          <TabsContent value="collection">
            <CardCollection />
          </TabsContent>

          <TabsContent value="inventory">
            <StarterInventory />
          </TabsContent>

          <TabsContent value="shop">
            <div className="space-y-6">
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Acquisition Rules</CardTitle>
                  <CardDescription className="text-slate-400 text-sm">
                    New cards mint only via system tokens or in-game currency; no free generation. First Edition capped at {SEASON_CAP} cards. Catalyst reverse backs only Season 1 (next window Season 4).
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-200">
                  <div className="bg-slate-800/70 rounded-lg p-3 border border-slate-700">
                    <p className="text-amber-300 font-semibold mb-1">Earning Cards</p>
                    <ul className="space-y-1 text-xs text-slate-300">
                      <li>• Defeat random AI at stations for low odds card drops.</li>
                      <li>• Aura/Nova may challenge during conversation; wins can grant card/token.</li>
                      <li>• Spend tokens or in-game currency to mint a card.</li>
                      <li>• No starter-bound cards are tradeable; others follow rarity limits.</li>
                    </ul>
                  </div>
                  <div className="bg-slate-800/70 rounded-lg p-3 border border-slate-700">
                    <p className="text-amber-300 font-semibold mb-1">Currency & Cash In/Out</p>
                    <ul className="space-y-1 text-xs text-slate-300">
                      <li>• Coins hard to earn; cash-in/out bridge required for real money.</li>
                      <li>• Tokens are issued by system events; required to mint new cards.</li>
                      <li>• Winning big challenges can grant tokens; losses never grant tokens.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Starter & Catalyst Tiers</CardTitle>
                  <CardDescription className="text-slate-400 text-sm">Initial coin grants per entry tier.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {TIERS.map((t) => (
                    <div key={t.name} className="bg-slate-800/70 rounded-lg p-3 border border-slate-700 text-center">
                      <p className="text-white font-semibold">{t.name}</p>
                      <p className="text-amber-300 text-sm">{t.coins} coins</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PACK_CONFIGS.map((pack) => {
                  const accent = pack.accent || 'slate';
                  return (
                    <Card key={pack.id} className={`bg-gradient-to-br from-${accent}-900/50 to-slate-900 border-${accent}-700`}>
                      <CardContent className="p-6 text-center space-y-2">
                        <span className="text-6xl">{pack.emoji || '🎴'}</span>
                        <h3 className="text-white font-bold text-lg mt-2">{pack.name}</h3>
                        <p className="text-slate-400 text-sm">{pack.cards} Cards • 1 {pack.guaranteed}+ guaranteed</p>
                        <p className="text-slate-500 text-xs">Theme: {pack.theme === 'mixed' || !pack.theme ? 'Mixed' : pack.theme}</p>
                        <Button
                          className={`mt-2 bg-${accent}-600 w-full`}
                          onClick={() => handleOpenPack(pack.id)}
                          disabled={isOpeningPack}
                        >
                          {isOpeningPack ? 'Opening...' : `${pack.price} Coins`}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {packOpening && (
                <Card className="bg-slate-900 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-white">Last Pack Result</CardTitle>
                    <CardDescription className="text-slate-400 text-sm">Seed {packOpening.auditSeed}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                      {Object.entries(summarizeRarities(packOpening.cards)).map(([rarity, count]) => (
                        <span key={rarity} className="px-2 py-1 bg-slate-800 rounded-full">{rarity}: {count}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {packOpening.cards.map((card) => (
                        <CardDisplay key={`${packOpening.packId}-${card.id}-${card.name}`} card={card} size="small" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Lore Footer */}
        <div className="mt-12 text-center border-t border-slate-800 pt-8">
          <p className="text-slate-500 text-sm italic max-w-2xl mx-auto">
            "In the age of the Aether Wars, two forces emerged from the mists of progress: 
            The Cogborn, masters of steam and brass, and the Nanoswarm, architects of digital consciousness. 
            Now, their battle for supremacy continues in the arenas of the Cogwork Realm..."
          </p>
        </div>
      </div>
    </div>
  );
}

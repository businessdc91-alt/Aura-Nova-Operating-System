// ============================================================================
// STARTER DECK SERVICE - Beginner Cards for New Players
// ============================================================================
//
// Starter deck cards are WEAKER than regular commons.
// They help new players learn the game mechanics but aren't competitive.
// These are added as 2nd Edition mid-Season 1 (50 new unique cards).
//
// Starter Deck Composition (40 cards):
// - 20 Constructs (weak stats, simple abilities)
// - 10 Spells (basic effects)
// - 5 Traps (simple triggers)
// - 3 Gear (minor bonuses)
// - 2 Catalysts (basic aether generation)
// ============================================================================

import { CardTemplate, CardAbility } from './aetheriumService';

// ================== STARTER DECK CARDS ==================
// All marked as 'starter' rarity - weaker than commons

export const STARTER_CONSTRUCTS: CardTemplate[] = [
  // Low cost, low stats - learning cards
  {
    id: 'starter-cog-001',
    name: 'Rusty Automaton',
    type: 'construct',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'starter',
    cost: 1,
    attack: 1,
    defense: 1,
    stars: 1,
    abilities: [],
    flavorText: 'Every master starts with scrap.',
    artStyle: 'Worn brass robot with visible rust patches, missing a gear, crooked stance.',
    artPlaceholder: '🤖',
  },
  {
    id: 'starter-cog-002',
    name: 'Tin Scout',
    type: 'construct',
    faction: 'cogborn',
    element: 'chrome',
    rarity: 'starter',
    cost: 1,
    attack: 1,
    defense: 2,
    stars: 1,
    abilities: [
      { name: 'Lookout', description: 'When summoned: Look at top card of your deck.', type: 'triggered' }
    ],
    flavorText: 'Dented but determined.',
    artStyle: 'Small tin soldier with telescope eye, one bent antenna, patched armor.',
    artPlaceholder: '🔭',
  },
  {
    id: 'starter-cog-003',
    name: 'Cog Roller',
    type: 'construct',
    faction: 'cogborn',
    element: 'steam',
    rarity: 'starter',
    cost: 2,
    attack: 2,
    defense: 1,
    stars: 2,
    abilities: [],
    flavorText: 'It gets there... eventually.',
    artStyle: 'Wheel-based construct with smoking engine, wobbling motion.',
    artPlaceholder: '🛞',
  },
  {
    id: 'starter-cog-004',
    name: 'Apprentice Frame',
    type: 'construct',
    faction: 'steamwright',
    element: 'chrome',
    rarity: 'starter',
    cost: 2,
    attack: 1,
    defense: 3,
    stars: 2,
    abilities: [
      { name: 'Learning', description: 'Gains +1 ATK the first time it survives combat.', type: 'triggered' }
    ],
    flavorText: 'Still figuring out the gears.',
    artStyle: 'Humanoid training dummy with padding, practice marks.',
    artPlaceholder: '🎯',
  },
  {
    id: 'starter-nano-001',
    name: 'Glitch Sprite',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'starter',
    cost: 1,
    attack: 1,
    defense: 1,
    stars: 1,
    abilities: [
      { name: 'Unstable', description: '50% chance to deal 1 extra damage when attacking.', type: 'triggered' }
    ],
    flavorText: 'Error: Success not found.',
    artStyle: 'Pixelated nanite cluster, glitching appearance, corrupted data trails.',
    artPlaceholder: '💻',
  },
  {
    id: 'starter-nano-002',
    name: 'Data Fragment',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'starter',
    cost: 1,
    attack: 0,
    defense: 2,
    stars: 1,
    abilities: [
      { name: 'Buffer', description: 'Can be sacrificed to prevent 2 damage to another construct.', type: 'activated', cost: 0 }
    ],
    flavorText: 'A piece of something greater.',
    artStyle: 'Floating data cube, partial code visible, incomplete form.',
    artPlaceholder: '📦',
  },
  {
    id: 'starter-nano-003',
    name: 'Ping Bot',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'volt',
    rarity: 'starter',
    cost: 2,
    attack: 2,
    defense: 1,
    stars: 2,
    abilities: [],
    flavorText: 'Response time: acceptable.',
    artStyle: 'Small round bot with antenna, single blinking light, simple design.',
    artPlaceholder: '📡',
  },
  {
    id: 'starter-nano-004',
    name: 'Cache Crawler',
    type: 'construct',
    faction: 'nanoswarm',
    element: 'nano',
    rarity: 'starter',
    cost: 2,
    attack: 1,
    defense: 2,
    stars: 2,
    abilities: [
      { name: 'Scavenge', description: 'When destroyed: Draw 1 card.', type: 'triggered' }
    ],
    flavorText: 'Even broken code has value.',
    artStyle: 'Spider-like data crawler, gathering loose bytes.',
    artPlaceholder: '🕷️',
  },
  {
    id: 'starter-steam-001',
    name: 'Bellows Boy',
    type: 'construct',
    faction: 'steamwright',
    element: 'steam',
    rarity: 'starter',
    cost: 1,
    attack: 0,
    defense: 2,
    stars: 1,
    abilities: [
      { name: 'Stoke', description: 'Tap: Give target construct +1 ATK this turn.', type: 'activated', cost: 0 }
    ],
    flavorText: 'Keeping the fires burning.',
    artStyle: 'Small worker construct with bellows arms, soot-covered.',
    artPlaceholder: '🔥',
  },
  {
    id: 'starter-steam-002',
    name: 'Valve Turner',
    type: 'construct',
    faction: 'steamwright',
    element: 'steam',
    rarity: 'starter',
    cost: 2,
    attack: 1,
    defense: 2,
    stars: 2,
    abilities: [
      { name: 'Pressure Control', description: 'Tap: Untap another construct.', type: 'activated', cost: 1 }
    ],
    flavorText: 'Release. Contain. Repeat.',
    artStyle: 'Worker with multiple arms on valves, pressure gauges.',
    artPlaceholder: '🔧',
  },
  {
    id: 'starter-void-001',
    name: 'Shadow Wisp',
    type: 'construct',
    faction: 'voidforge',
    element: 'void',
    rarity: 'starter',
    cost: 1,
    attack: 1,
    defense: 1,
    stars: 1,
    abilities: [
      { name: 'Fade', description: 'Takes 1 less damage from the first attack each turn.', type: 'passive' }
    ],
    flavorText: 'Hard to hit, easy to break.',
    artStyle: 'Wispy shadow with faint clockwork skeleton visible.',
    artPlaceholder: '👻',
  },
  {
    id: 'starter-void-002',
    name: 'Entropy Mote',
    type: 'construct',
    faction: 'voidforge',
    element: 'void',
    rarity: 'starter',
    cost: 2,
    attack: 2,
    defense: 1,
    stars: 2,
    abilities: [
      { name: 'Decay Touch', description: 'When dealing damage: Target loses 1 DEF permanently.', type: 'triggered' }
    ],
    flavorText: 'Everything it touches rusts.',
    artStyle: 'Small void orb corroding nearby metal, entropy aura.',
    artPlaceholder: '💀',
  },
  {
    id: 'starter-neutral-001',
    name: 'Practice Dummy',
    type: 'construct',
    faction: 'neutral',
    element: 'chrome',
    rarity: 'starter',
    cost: 1,
    attack: 0,
    defense: 3,
    stars: 1,
    abilities: [],
    flavorText: 'Hit me. I can take it.',
    artStyle: 'Training dummy with target painted on chest, many dents.',
    artPlaceholder: '🎯',
  },
  {
    id: 'starter-neutral-002',
    name: 'Junk Golem',
    type: 'construct',
    faction: 'neutral',
    element: 'chrome',
    rarity: 'starter',
    cost: 3,
    attack: 2,
    defense: 3,
    stars: 3,
    abilities: [],
    flavorText: 'Made from leftovers. Still standing.',
    artStyle: 'Golem assembled from various scrap parts, mismatched pieces.',
    artPlaceholder: '🗑️',
  },
  {
    id: 'starter-neutral-003',
    name: 'Eager Recruit',
    type: 'construct',
    faction: 'neutral',
    element: 'steam',
    rarity: 'starter',
    cost: 2,
    attack: 2,
    defense: 2,
    stars: 2,
    abilities: [],
    flavorText: 'Ready to prove itself.',
    artStyle: 'Young-looking automaton in shiny but basic armor.',
    artPlaceholder: '⚔️',
  },
  {
    id: 'starter-neutral-004',
    name: 'Scrap Sentinel',
    type: 'construct',
    faction: 'neutral',
    element: 'chrome',
    rarity: 'starter',
    cost: 3,
    attack: 2,
    defense: 4,
    stars: 3,
    abilities: [
      { name: 'Guard', description: 'Enemy must attack this if able.', type: 'passive' }
    ],
    flavorText: 'Rebuilt three times. Still watches.',
    artStyle: 'Patched-up guard construct, multiple repair marks.',
    artPlaceholder: '🛡️',
  },
  {
    id: 'starter-aether-001',
    name: 'Spark Collector',
    type: 'construct',
    faction: 'neutral',
    element: 'aether',
    rarity: 'starter',
    cost: 2,
    attack: 1,
    defense: 2,
    stars: 2,
    abilities: [
      { name: 'Gather', description: 'When summoned: Gain 1 Aether.', type: 'triggered' }
    ],
    flavorText: 'Harvesting ambient energy.',
    artStyle: 'Orb with collection arms, aether particles flowing in.',
    artPlaceholder: '✨',
  },
  {
    id: 'starter-volt-001',
    name: 'Static Charge',
    type: 'construct',
    faction: 'neutral',
    element: 'volt',
    rarity: 'starter',
    cost: 1,
    attack: 1,
    defense: 1,
    stars: 1,
    abilities: [
      { name: 'Zap', description: 'When destroyed: Deal 1 damage to attacker.', type: 'triggered' }
    ],
    flavorText: 'Small shock, big annoyance.',
    artStyle: 'Crackling electric ball with angry face.',
    artPlaceholder: '⚡',
  },
  {
    id: 'starter-volt-002',
    name: 'Volt Hopper',
    type: 'construct',
    faction: 'neutral',
    element: 'volt',
    rarity: 'starter',
    cost: 2,
    attack: 2,
    defense: 1,
    stars: 2,
    abilities: [
      { name: 'Quick', description: 'Can attack the turn it is summoned.', type: 'passive' }
    ],
    flavorText: 'Fast. Not durable.',
    artStyle: 'Grasshopper-like construct with electric legs.',
    artPlaceholder: '🦗',
  },
  {
    id: 'starter-heavy-001',
    name: 'Training Mech',
    type: 'construct',
    faction: 'neutral',
    element: 'steam',
    rarity: 'starter',
    cost: 4,
    attack: 3,
    defense: 4,
    stars: 4,
    abilities: [],
    flavorText: 'For practice runs only.',
    artStyle: 'Basic bipedal mech with training wheels, safety padding.',
    artPlaceholder: '🤖',
  },
];

export const STARTER_SPELLS: CardTemplate[] = [
  {
    id: 'starter-spell-001',
    name: 'Minor Repair',
    type: 'spell',
    faction: 'neutral',
    element: 'steam',
    rarity: 'starter',
    cost: 1,
    abilities: [
      { name: 'Minor Repair', description: 'Restore 2 DEF to target construct.', type: 'activated' }
    ],
    flavorText: 'A patch in time.',
    artStyle: 'Simple wrench with glowing tip.',
    artPlaceholder: '🔧',
  },
  {
    id: 'starter-spell-002',
    name: 'Small Boost',
    type: 'spell',
    faction: 'neutral',
    element: 'steam',
    rarity: 'starter',
    cost: 1,
    abilities: [
      { name: 'Small Boost', description: 'Target construct gains +1/+1 this turn.', type: 'activated' }
    ],
    flavorText: 'Every bit helps.',
    artStyle: 'Small pressure gauge increasing.',
    artPlaceholder: '📈',
  },
  {
    id: 'starter-spell-003',
    name: 'Draw Schematic',
    type: 'spell',
    faction: 'neutral',
    element: 'aether',
    rarity: 'starter',
    cost: 2,
    abilities: [
      { name: 'Draw Schematic', description: 'Draw 1 card.', type: 'activated' }
    ],
    flavorText: 'Study the blueprints.',
    artStyle: 'Rolled parchment with gear drawings.',
    artPlaceholder: '📜',
  },
  {
    id: 'starter-spell-004',
    name: 'Static Discharge',
    type: 'spell',
    faction: 'neutral',
    element: 'volt',
    rarity: 'starter',
    cost: 2,
    abilities: [
      { name: 'Static Discharge', description: 'Deal 2 damage to target construct.', type: 'activated' }
    ],
    flavorText: 'Zap!',
    artStyle: 'Lightning bolt hitting metal.',
    artPlaceholder: '⚡',
  },
  {
    id: 'starter-spell-005',
    name: 'Emergency Vent',
    type: 'spell',
    faction: 'neutral',
    element: 'steam',
    rarity: 'starter',
    cost: 1,
    abilities: [
      { name: 'Emergency Vent', description: 'Untap target construct.', type: 'activated' }
    ],
    flavorText: 'Release the pressure.',
    artStyle: 'Steam vent releasing pressure.',
    artPlaceholder: '💨',
  },
  {
    id: 'starter-spell-006',
    name: 'Dim the Lights',
    type: 'spell',
    faction: 'neutral',
    element: 'void',
    rarity: 'starter',
    cost: 2,
    abilities: [
      { name: 'Dim the Lights', description: 'Target construct gets -2 ATK this turn.', type: 'activated' }
    ],
    flavorText: 'Hard to hit what you can\'t see.',
    artStyle: 'Lamp going dark, shadows spreading.',
    artPlaceholder: '🌑',
  },
  {
    id: 'starter-spell-007',
    name: 'Quick Study',
    type: 'spell',
    faction: 'neutral',
    element: 'nano',
    rarity: 'starter',
    cost: 1,
    abilities: [
      { name: 'Quick Study', description: 'Look at the top 3 cards of your deck.', type: 'activated' }
    ],
    flavorText: 'Knowledge is half the battle.',
    artStyle: 'Eye scanning data streams.',
    artPlaceholder: '👁️',
  },
  {
    id: 'starter-spell-008',
    name: 'Patch Up',
    type: 'spell',
    faction: 'neutral',
    element: 'chrome',
    rarity: 'starter',
    cost: 2,
    abilities: [
      { name: 'Patch Up', description: 'Return target construct with 2 or less ATK from graveyard to hand.', type: 'activated' }
    ],
    flavorText: 'Never throw anything away.',
    artStyle: 'Hand reaching into scrap pile.',
    artPlaceholder: '🗑️',
  },
  {
    id: 'starter-spell-009',
    name: 'Aether Trickle',
    type: 'spell',
    faction: 'neutral',
    element: 'aether',
    rarity: 'starter',
    cost: 0,
    abilities: [
      { name: 'Aether Trickle', description: 'Gain 1 Aether. Draw this card at start of game.', type: 'activated' }
    ],
    flavorText: 'A drop in the bucket.',
    artStyle: 'Single aether droplet falling.',
    artPlaceholder: '💧',
  },
  {
    id: 'starter-spell-010',
    name: 'Basic Strike',
    type: 'spell',
    faction: 'neutral',
    element: 'chrome',
    rarity: 'starter',
    cost: 3,
    abilities: [
      { name: 'Basic Strike', description: 'Deal 3 damage to target.', type: 'activated' }
    ],
    flavorText: 'Simple. Effective.',
    artStyle: 'Basic hammer striking.',
    artPlaceholder: '🔨',
  },
];

export const STARTER_TRAPS: CardTemplate[] = [
  {
    id: 'starter-trap-001',
    name: 'Tripwire',
    type: 'trap',
    faction: 'neutral',
    element: 'chrome',
    rarity: 'starter',
    cost: 1,
    abilities: [
      { name: 'Tripwire', description: 'When enemy attacks: Deal 1 damage to attacker.', type: 'chain' }
    ],
    flavorText: 'Watch your step.',
    artStyle: 'Wire stretched across path.',
    artPlaceholder: '🪤',
  },
  {
    id: 'starter-trap-002',
    name: 'Smoke Screen',
    type: 'trap',
    faction: 'neutral',
    element: 'steam',
    rarity: 'starter',
    cost: 1,
    abilities: [
      { name: 'Smoke Screen', description: 'When enemy attacks: 50% chance to negate the attack.', type: 'chain' }
    ],
    flavorText: 'Now you see me...',
    artStyle: 'Smoke grenade exploding.',
    artPlaceholder: '💨',
  },
  {
    id: 'starter-trap-003',
    name: 'Alarm Bell',
    type: 'trap',
    faction: 'neutral',
    element: 'chrome',
    rarity: 'starter',
    cost: 1,
    abilities: [
      { name: 'Alarm Bell', description: 'When enemy summons a construct: Draw 1 card.', type: 'chain' }
    ],
    flavorText: 'Ding ding ding!',
    artStyle: 'Brass bell with motion sensor.',
    artPlaceholder: '🔔',
  },
  {
    id: 'starter-trap-004',
    name: 'Oil Slick',
    type: 'trap',
    faction: 'neutral',
    element: 'steam',
    rarity: 'starter',
    cost: 2,
    abilities: [
      { name: 'Oil Slick', description: 'When enemy attacks: Attacker is tapped after combat.', type: 'chain' }
    ],
    flavorText: 'Slippery situation.',
    artStyle: 'Dark oil spreading on floor.',
    artPlaceholder: '🛢️',
  },
  {
    id: 'starter-trap-005',
    name: 'Static Fence',
    type: 'trap',
    faction: 'neutral',
    element: 'volt',
    rarity: 'starter',
    cost: 2,
    abilities: [
      { name: 'Static Fence', description: 'When opponent plays a spell: Deal 2 damage to them.', type: 'chain' }
    ],
    flavorText: 'Touch and get zapped.',
    artStyle: 'Electric fence with warning sign.',
    artPlaceholder: '⚡',
  },
];

export const STARTER_GEAR: CardTemplate[] = [
  {
    id: 'starter-gear-001',
    name: 'Rusty Blade',
    type: 'gear',
    faction: 'neutral',
    element: 'chrome',
    rarity: 'starter',
    cost: 1,
    attackBonus: 1,
    abilities: [
      { name: 'Rusty Blade', description: 'Equip: +1 ATK.', type: 'passive' }
    ],
    flavorText: 'Sharp enough... probably.',
    artStyle: 'Old sword with rust spots.',
    artPlaceholder: '🗡️',
  },
  {
    id: 'starter-gear-002',
    name: 'Dented Shield',
    type: 'gear',
    faction: 'neutral',
    element: 'chrome',
    rarity: 'starter',
    cost: 1,
    defenseBonus: 1,
    abilities: [
      { name: 'Dented Shield', description: 'Equip: +1 DEF.', type: 'passive' }
    ],
    flavorText: 'Better than nothing.',
    artStyle: 'Shield with multiple dents.',
    artPlaceholder: '🛡️',
  },
  {
    id: 'starter-gear-003',
    name: 'Steam Pack',
    type: 'gear',
    faction: 'neutral',
    element: 'steam',
    rarity: 'starter',
    cost: 2,
    attackBonus: 1,
    defenseBonus: 1,
    abilities: [
      { name: 'Steam Pack', description: 'Equip: +1/+1.', type: 'passive' }
    ],
    flavorText: 'Mobility and protection.',
    artStyle: 'Backpack with steam jets.',
    artPlaceholder: '🎒',
  },
];

export const STARTER_CATALYSTS: CardTemplate[] = [
  {
    id: 'starter-cat-001',
    name: 'Leaky Pipe',
    type: 'catalyst',
    faction: 'neutral',
    element: 'steam',
    rarity: 'starter',
    cost: 0,
    abilities: [
      { name: 'Leaky Pipe', description: 'Generate 1 Aether every other turn.', type: 'passive' }
    ],
    flavorText: 'It works... mostly.',
    artStyle: 'Pipe with steam leaking from cracks.',
    artPlaceholder: '🔧',
  },
  {
    id: 'starter-cat-002',
    name: 'Dim Crystal',
    type: 'catalyst',
    faction: 'neutral',
    element: 'aether',
    rarity: 'starter',
    cost: 0,
    abilities: [
      { name: 'Dim Crystal', description: 'When you play your first spell each turn: Gain 1 Aether.', type: 'triggered' }
    ],
    flavorText: 'Faint, but functional.',
    artStyle: 'Cloudy crystal with weak glow.',
    artPlaceholder: '💎',
  },
];

// ================== COMPLETE STARTER DECK ==================
export const STARTER_DECK_TEMPLATES: CardTemplate[] = [
  ...STARTER_CONSTRUCTS,
  ...STARTER_SPELLS,
  ...STARTER_TRAPS,
  ...STARTER_GEAR,
  ...STARTER_CATALYSTS,
];

// Build a balanced starter deck (40 cards)
export function buildStarterDeck(): CardTemplate[] {
  const deck: CardTemplate[] = [];
  
  // Add 2 copies of each construct (20 constructs, 40 total slots used by 10 unique)
  const selectedConstructs = STARTER_CONSTRUCTS.slice(0, 10);
  selectedConstructs.forEach(c => {
    deck.push(c, c);
  });
  
  // Add spells (10 cards)
  STARTER_SPELLS.forEach(s => deck.push(s));
  
  // Add traps (5 cards)
  STARTER_TRAPS.forEach(t => deck.push(t));
  
  // Add gear (3 cards)
  STARTER_GEAR.forEach(g => deck.push(g));
  
  // Add catalysts (2 cards)
  STARTER_CATALYSTS.forEach(c => deck.push(c));
  
  return deck;
}

// Starter deck is claimable once per account
export function claimStarterDeck(playerId: string): CardTemplate[] {
  const storageKey = `aetherium_starter_claimed_${playerId}`;
  
  if (typeof window !== 'undefined') {
    const claimed = localStorage.getItem(storageKey);
    if (claimed === 'true') {
      throw new Error('Starter deck already claimed!');
    }
    localStorage.setItem(storageKey, 'true');
  }
  
  return buildStarterDeck();
}

console.log('[StarterDeck] Starter deck templates loaded: 40 cards (20 constructs, 10 spells, 5 traps, 3 gear, 2 catalysts)');

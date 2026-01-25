
import { CardTemplate } from '../services/aetheriumService';

// Re-exporting types locally if needed or extending CardTemplate to match legacy data
// The data below uses 'artPlaceholder' which is in CardTemplate.

export const CARD_DATABASE: CardTemplate[] = [
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
    artStyle: 'Steampunk construct'
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
    artStyle: 'Massive steam robot'
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
    artStyle: 'Tiny mechanical faerie'
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
    artStyle: 'Legendary brass colossus'
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
    artStyle: 'Microscopic robots'
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
    artStyle: 'Glitchy digital ghost'
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
    artStyle: 'Holographic entity'
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
    artStyle: 'Black hole of data'
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
    artStyle: 'Dwarven engineer'
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
    artStyle: 'Mage channelling energy'
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
    artStyle: 'Corrupted algorithm'
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
    artStyle: 'Machine of death'
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
    artStyle: 'Lightning surge'
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
    artStyle: 'Wave of robots'
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
    artStyle: 'Energy beams connecting'
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
    artStyle: 'Red button'
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
    artStyle: 'Hidden grinding gears'
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
    artStyle: 'Burning digital wall'
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
    artStyle: 'Dark reflective surface'
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
    artStyle: 'Golden aura'
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
    artStyle: 'Matrix code rain'
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
    artStyle: 'Steam powered gauntlet'
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
    artStyle: 'Dark energy core'
  },
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
    artStyle: 'Mechanical exoskeleton'
  },
  
  // CATALYSTS
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
    artStyle: 'Steampunk factory'
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
    artStyle: 'Blue energy cell'
  }
];

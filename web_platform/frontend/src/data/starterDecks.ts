/**
 * STARTER DECK TEMPLATES
 * 5 themed starter decks - given to players after LLM setup
 * TODO: Implement proper card templates matching CardTemplate interface
 */

export interface StarterDeck {
  id: string;
  name: string;
  description: string;
  playstyle: string;
  icon: string;
}

// ================== EXPORT ALL STARTER DECKS ==================
export const STARTER_DECKS: StarterDeck[] = [
  {
    id: 'starter-rush-assault',
    name: 'Rush Assault',
    description: 'Overwhelm your opponent with fast, aggressive attacks',
    playstyle: 'Aggressive - Summon low-cost constructs quickly and attack relentlessly',
    icon: '⚔️',
  },
  {
    id: 'starter-mystic-control',
    name: 'Mystic Control',
    description: 'Control the battlefield with spells and traps',
    playstyle: 'Control - Use spells and traps to disrupt your opponent while building your field',
    icon: '🔮',
  },
  {
    id: 'starter-balanced-harmony',
    name: 'Balanced Harmony',
    description: 'A well-rounded deck with offense and defense',
    playstyle: 'Balanced - Mix of attacking constructs and defensive spells/traps',
    icon: '⚖️',
  },
  {
    id: 'starter-shadow-tactics',
    name: 'Shadow Tactics',
    description: 'Cunning strategies and deceptive plays',
    playstyle: 'Tactical - Use effects to outmaneuver your opponent',
    icon: '🌙',
  },
  {
    id: 'starter-elemental-force',
    name: 'Elemental Force',
    description: 'Harness the power of fire, water, and wind',
    playstyle: 'Versatile - Multi-element constructs with varied effects',
    icon: '⚡',
  },
];

export const getStarterDeck = (id: string): StarterDeck | undefined => {
  return STARTER_DECKS.find(deck => deck.id === id);
};

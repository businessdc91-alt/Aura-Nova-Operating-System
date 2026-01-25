
import { v4 as uuidv4 } from 'uuid';
import { CardTemplate, CardInstance, Faction, Element, CardType, CardRarity, CardAbility } from './aetheriumService';
import { CARD_DATABASE } from '../data/aetheriumCards';

// ================== BATTLE TYPES ==================

export type Zone = 'deck' | 'hand' | 'field' | 'graveyard' | 'exile' | 'mana';
export type Phase = 'draw' | 'main1' | 'battle' | 'main2' | 'end';

export interface BattleCard extends CardInstance {
  // Runtime battle stats (can be modified by buffs/damage)
  currentAttack: number;
  currentDefense: number;
  currentCost: number;
  isTapped: boolean;
  canAttack: boolean;
  summoningSickness: boolean;
  zone: Zone;
  controllerId: string; // 'player' or 'opponent'
  attachedTo?: string; // ID of construct this is equipped/enchanted to
  token?: boolean;
}

export interface PlayerState {
  id: string; // 'player' or 'opponent'
  health: number;
  maxHealth: number;
  aether: number; // Current mana
  maxAether: number; // Max mana capacity
  deck: BattleCard[];
  hand: BattleCard[];
  field: BattleCard[]; // Constructs
  backrow: BattleCard[]; // Traps/Gear/Enchantments
  graveyard: BattleCard[];
  exile: BattleCard[];
}

export interface BattleState {
  turnCount: number;
  currentTurn: string; // 'player' or 'opponent'
  phase: Phase;
  player: PlayerState;
  opponent: PlayerState;
  chainStack: any[]; // For complex interactions later
  log: string[];
  winner: string | null;
}

// ================== HELPER FUNCTIONS ==================

export function createBattleCard(templateId: string, controllerId: string): BattleCard {
  const template = CARD_DATABASE.find(c => c.id === templateId);
  if (!template) throw new Error(`Card template not found: ${templateId}`);

  return {
    instanceId: uuidv4(),
    templateId: template.id,
    edition: '1st',
    printNumber: 0,
    isFirstEdition: false,
    isHolographic: false,
    isFoil: false,
    condition: 'mint',
    ownerId: controllerId,
    obtainedAt: new Date(),
    obtainedFrom: 'duel',
    
    // Battle specific
    currentAttack: template.attack || 0,
    currentDefense: template.defense || 0,
    currentCost: template.cost,
    isTapped: false,
    canAttack: false,
    summoningSickness: true,
    zone: 'deck',
    controllerId
  };
}

export function getTemplate(card: BattleCard): CardTemplate {
  return CARD_DATABASE.find(c => c.id === card.templateId)!;
}

// ================== GAME LOGIC ==================

export function initializeBattle(playerDeckIds: string[], opponentDeckIds: string[]): BattleState {
  // Create decks
  const playerDeck = playerDeckIds.map(id => createBattleCard(id, 'player'));
  const opponentDeck = opponentDeckIds.map(id => createBattleCard(id, 'opponent'));

  // Shuffle
  playerDeck.sort(() => Math.random() - 0.5);
  opponentDeck.sort(() => Math.random() - 0.5);

  const initialState: BattleState = {
    turnCount: 1,
    currentTurn: 'player', // Player goes first for now
    phase: 'draw',
    player: {
      id: 'player',
      health: 30, // Standard health
      maxHealth: 30,
      aether: 1,
      maxAether: 1,
      deck: playerDeck,
      hand: [],
      field: [],
      backrow: [],
      graveyard: [],
      exile: []
    },
    opponent: {
      id: 'opponent',
      health: 30,
      maxHealth: 30,
      aether: 1,
      maxAether: 1,
      deck: opponentDeck,
      hand: [],
      field: [],
      backrow: [],
      graveyard: [],
      exile: []
    },
    chainStack: [],
    log: ['Battle started!'],
    winner: null
  };

  // Initial Draw (5 cards)
  for (let i = 0; i < 5; i++) {
    drawCard(initialState, 'player');
    drawCard(initialState, 'opponent');
  }

  return initialState;
}

export function drawCard(state: BattleState, playerId: string) {
  const actor = playerId === 'player' ? state.player : state.opponent;
  if (actor.deck.length === 0) {
    // Deck out = loss (simplified)
    state.log.push(`${playerId} decked out!`);
    state.winner = playerId === 'player' ? 'opponent' : 'player';
    return;
  }

  const card = actor.deck.pop()!;
  card.zone = 'hand';
  actor.hand.push(card);
  state.log.push(`${playerId} drew a card.`);
}

export function playCard(state: BattleState, cardInstanceId: string, playerId: string): boolean {
  if (state.winner) return false;
  if (state.currentTurn !== playerId) return false;
  // Simplified phase check: can only play in main phases
  if (state.phase !== 'main1' && state.phase !== 'main2') return false;

  const actor = playerId === 'player' ? state.player : state.opponent;
  const cardIndex = actor.hand.findIndex(c => c.instanceId === cardInstanceId);
  if (cardIndex === -1) return false;

  const card = actor.hand[cardIndex];
  const template = getTemplate(card);

  // Check cost
  if (actor.aether < card.currentCost) {
    state.log.push(`Not enough Aether to play ${template.name}`);
    return false;
  }

  // Pay cost
  actor.aether -= card.currentCost;

  // Move Zone
  actor.hand.splice(cardIndex, 1);

  if (template.type === 'construct') {
    card.zone = 'field';
    card.summoningSickness = true; // Cannot attack turn 1
    actor.field.push(card);
    state.log.push(`${playerId} summoned ${template.name}.`);
    
    // Trigger "On Summon" effects (simplified placeholder)
    triggerAbilities(state, card, 'triggered', 'On summon');
    
  } else if (template.type === 'spell') {
    card.zone = 'graveyard';
    actor.graveyard.push(card);
    state.log.push(`${playerId} cast ${template.name}.`);
    triggerAbilities(state, card, 'activated');
    
  } else if (template.type === 'gear' || template.type === 'enchantment' || template.type === 'trap') {
    card.zone = 'field'; // Backrow logic can be field for now logically
    actor.backrow.push(card);
    state.log.push(`${playerId} placed ${template.name}.`);
  }

  return true;
}

export function attack(state: BattleState, attackerId: string, targetId: string | null): boolean {
  if (state.phase !== 'battle') return false;
  
  const actor = state.currentTurn === 'player' ? state.player : state.opponent;
  const defender = state.currentTurn === 'player' ? state.opponent : state.player;

  const attacker = actor.field.find(c => c.instanceId === attackerId);
  if (!attacker || attacker.isTapped || attacker.summoningSickness) return false;
  if (attacker.currentAttack <= 0) return false;

  // Tap attacker
  attacker.isTapped = true;

  if (!targetId) {
    // Direct Attack on Player
    const tauntBlocker = defender.field.find(c => {
        const t = getTemplate(c);
        return t.abilities.some(a => a.name === 'Sentinel' || a.name === 'Vigilance'); // Simplify taunt logic
    });
    
    // Simple block check logic - forcing attack on blockers if heavily simplified
    // In real TCG, defender declares blocks. Here we might simplify to hearthstone style (taunt mandatory)
    // Let's assume Hearthstone style targeting for now for easier AI/UI implementation
    
    defender.health -= attacker.currentAttack;
    state.log.push(`${getTemplate(attacker).name} attacked direct for ${attacker.currentAttack} damage!`);
  } else {
    // Attack Construct
    const target = defender.field.find(c => c.instanceId === targetId);
    if (!target) return false;

    // Combat math
    target.currentDefense -= attacker.currentAttack;
    attacker.currentDefense -= target.currentAttack;

    state.log.push(`${getTemplate(attacker).name} attacked ${getTemplate(target).name}.`);

    if (target.currentDefense <= 0) destroyCard(state, target);
    if (attacker.currentDefense <= 0) destroyCard(state, attacker);
  }

  checkWinCondition(state);
  return true;
}

function destroyCard(state: BattleState, card: BattleCard) {
  const owner = card.controllerId === 'player' ? state.player : state.opponent;
  const index = owner.field.findIndex(c => c.instanceId === card.instanceId);
  if (index > -1) {
    owner.field.splice(index, 1);
    card.zone = 'graveyard';
    owner.graveyard.push(card);
    state.log.push(`${getTemplate(card).name} was destroyed.`);
  }
}

function triggerAbilities(state: BattleState, card: BattleCard, type: string, triggerName?: string) {
    // Placeholder for complex ability engine
    // Real engine would parse "Deal 2 damage" strings or lookup effect callbacks
}

export function endPhase(state: BattleState) {
  const phases: Phase[] = ['draw', 'main1', 'battle', 'main2', 'end'];
  const currentIndex = phases.indexOf(state.phase);
  
  if (currentIndex < phases.length - 1) {
    state.phase = phases[currentIndex + 1];
    state.log.push(`Phase changed to ${state.phase}`);
  } else {
    endTurn(state);
  }
}

export function endTurn(state: BattleState) {
  state.log.push(`${state.currentTurn} ended their turn.`);
  
  // Switch Value
  state.currentTurn = state.currentTurn === 'player' ? 'opponent' : 'player';
  state.turnCount++;
  state.phase = 'draw';
  
  const activePlayer = state.currentTurn === 'player' ? state.player : state.opponent;
  
  // Untap
  activePlayer.field.forEach(c => {
    c.isTapped = false;
    c.summoningSickness = false;
  });
  activePlayer.aether = Math.min(activePlayer.maxAether + 1, 10); // Ramp logic
  activePlayer.maxAether = Math.min(activePlayer.maxAether + 1, 10);
  
  // Draw
  drawCard(state, state.currentTurn);
}

function checkWinCondition(state: BattleState) {
  if (state.player.health <= 0) {
    state.winner = 'opponent';
    state.log.push('Opponent wins!');
  } else if (state.opponent.health <= 0) {
    state.winner = 'player';
    state.log.push('Player wins!');
  }
}

// ================== AI ==================

export function runAITurn(state: BattleState) {
  if (state.currentTurn !== 'opponent' || state.winner) return;
  
  const ai = state.opponent;
  const player = state.player;
  
  // 1. Play constructs if possible
  // Sort hand by cost high to low (simple greedy)
  // Logic: in main1
  if (state.phase === 'draw') endPhase(state); 
  
  if (state.phase === 'main1') {
      const playable = ai.hand.filter(c => c.currentCost <= ai.aether && getTemplate(c).type === 'construct');
      playable.forEach(c => {
         if (ai.aether >= c.currentCost) {
             playCard(state, c.instanceId, 'opponent');
         }
      });
      endPhase(state); // Go to battle
  }
  
  if (state.phase === 'battle') {
      // Simple Face Hunter AI
      const attackers = ai.field.filter(c => !c.isTapped && !c.summoningSickness);
      attackers.forEach(c => {
          // If player has taunt (not implemented fully), attack it, else face
          attack(state, c.instanceId, null); // Face is the place
      });
      endPhase(state); // Go to main2
  }
  
  if (state.phase === 'main2') {
      // Play anything left over?
       endPhase(state); // Go to end
  }
  
  if (state.phase === 'end') {
      endPhase(state); // Pass turn
  }
}


import fs from 'fs';
import path from 'path';

export interface CardData {
  id: string;
  name: string;
  type: string; // Creature, Spell, Glitch, etc.
  stats?: string; // e.g., "500/500"
  lore: string;
  glitchEffect?: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Ultra-Rare';
  family?: string; // Grouping (e.g., "Needle-Bot")
}

const ASSETS_PATH = 'D:\\Aetherium_Project\\Assets\\aetherium cards description.txt';

export class CardParser {
  private rawText: string = '';
  public cards: CardData[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      if (fs.existsSync(ASSETS_PATH)) {
        this.rawText = fs.readFileSync(ASSETS_PATH, 'utf-8');
        this.parse();
      } else {
        console.warn(`Card definitions not found at ${ASSETS_PATH}`);
      }
    } catch (error) {
      console.error('Error loading card data:', error);
    }
  }

  private parse() {
    // Split by double newlines or some delimiter roughly separating cards
    // This is a naive implementation based on the expected format.
    // We'll need to refine this based on the actual text file structure.
    
    // Assuming format roughly:
    // Name: [Name]
    // ...
    
    const lines = this.rawText.split('\n');
    let currentCard: Partial<CardData> = {};
    
    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Heuristics for parsing (to be adjusted based on actual file content)
        if (trimmed.startsWith('Name:') || trimmed.match(/^[A-Z][a-z]+ [A-Z][a-z]+/)) {
             // If we have a previous card pending, save it
             if (currentCard.name) {
                 this.finalizeCard(currentCard);
                 currentCard = {};
             }
             currentCard.name = trimmed.replace('Name:', '').trim();
        } else if (trimmed.startsWith('Stats:') || trimmed.includes('/')) {
            currentCard.stats = trimmed.replace('Stats:', '').trim();
        } else if (trimmed.startsWith('Lore:')) {
            currentCard.lore = trimmed.replace('Lore:', '').trim();
        } else if (trimmed.startsWith('Glitch:') || trimmed.includes('Glitch')) {
            currentCard.glitchEffect = trimmed.replace('Glitch:', '').trim();
        } else {
            // Append to lore if it's just text
            if (currentCard.lore && !currentCard.glitchEffect) {
                currentCard.lore += ' ' + trimmed;
            }
        }
    });
    
    // Finalize last card
    if (currentCard.name) {
        this.finalizeCard(currentCard);
    }
  }

  private finalizeCard(card: Partial<CardData>) {
      // Determine Rarity & Type based on content
      // TODO: Refine this logic with User's specific rules
      
      let rarity: CardData['rarity'] = 'Common';
      if (card.glitchEffect) rarity = 'Rare';
      if (card.stats && (parseInt(card.stats) > 2000)) rarity = 'Ultra-Rare';
      
      const newCard: CardData = {
          id: card.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
          name: card.name || 'Unknown Entity',
          type: 'Creature', // Default
          lore: card.lore || '',
          stats: card.stats,
          glitchEffect: card.glitchEffect,
          rarity,
          family: this.guessFamily(card.name || '')
      };
      
      this.cards.push(newCard);
  }
  
  private guessFamily(name: string): string {
      // e.g., "Needle-Bot Nuisance" -> "Needle-Bot"
      return name.split(' ')[0];
  }

  public getAllCards() {
      return this.cards;
  }
  
  public getPack(size: number = 5): CardData[] {
      // Weighted random generation
      const packer: CardData[] = [];
      for(let i=0; i<size; i++) {
          const rand = Math.random();
          let pool = this.cards.filter(c => c.rarity === 'Common');
          
          if (rand > 0.95) pool = this.cards.filter(c => c.rarity === 'Ultra-Rare');
          else if (rand > 0.85) pool = this.cards.filter(c => c.rarity === 'Rare');
          else if (rand > 0.60) pool = this.cards.filter(c => c.rarity === 'Uncommon');
          
          if (pool.length === 0) pool = this.cards; // Fallback
          
          const card = pool[Math.floor(Math.random() * pool.length)];
          packer.push(card);
      }
      return packer;
  }
}

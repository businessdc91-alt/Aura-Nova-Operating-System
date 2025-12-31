/**
 * AI Outfit Generator Service
 * Suggests complete outfits based on context, mood, and style preferences
 * Uses smart matching algorithm to create cohesive combinations
 */

import { ClothingItem } from './clothingCreatorService';

export interface StyleProfile {
  name: string;
  keywords: string[];
  colorPalette: string[];
  clothingTypes: string[];
  mood: string;
}

export interface OutfitSuggestion {
  id: string;
  name: string;
  description: string;
  items: ClothingItem[];
  colorHarmony: number; // 0-100 (how well colors match)
  styleCoherence: number; // 0-100 (how well styles match)
  occasion: string;
  mood: string;
  confidence: number; // 0-100 (how confident AI is)
  reasoning: string[];
}

// ============== STYLE PROFILES ==============
const STYLE_PROFILES: StyleProfile[] = [
  {
    name: 'Casual Comfortable',
    keywords: ['relaxed', 'everyday', 'comfy', 'chill'],
    colorPalette: ['#3D3D3D', '#6B5B4B', '#8B7A6A', '#FFFFFF'],
    clothingTypes: ['top', 'bottom', 'shoes'],
    mood: 'relaxed',
  },
  {
    name: 'Formal Professional',
    keywords: ['business', 'formal', 'professional', 'elegant'],
    colorPalette: ['#000000', '#1A1A1A', '#FFFFFF', '#C0C0C0'],
    clothingTypes: ['top', 'bottom', 'coat', 'shoes'],
    mood: 'professional',
  },
  {
    name: 'Beach Vacation',
    keywords: ['beach', 'summer', 'tropical', 'vacation'],
    colorPalette: ['#FF8844', '#FFD700', '#4A90FF', '#FFFFFF'],
    clothingTypes: ['top', 'bottom', 'shoes'],
    mood: 'fun',
  },
  {
    name: 'Night Out Party',
    keywords: ['party', 'night', 'glamorous', 'fun', 'dance'],
    colorPalette: ['#FF44FF', '#4A4AFF', '#FFD700', '#000000'],
    clothingTypes: ['top', 'bottom', 'shoes', 'accessory'],
    mood: 'excited',
  },
  {
    name: 'Sporty Active',
    keywords: ['sport', 'athletic', 'active', 'gym', 'exercise'],
    colorPalette: ['#FF4444', '#000000', '#FFFFFF', '#4A90FF'],
    clothingTypes: ['top', 'bottom', 'shoes'],
    mood: 'energetic',
  },
  {
    name: 'Boho Chic',
    keywords: ['bohemian', 'earthy', 'artistic', 'free-spirited'],
    colorPalette: ['#8B6F47', '#D4A574', '#6B8A7A', '#FFB347'],
    clothingTypes: ['top', 'bottom', 'coat', 'accessory'],
    mood: 'creative',
  },
  {
    name: 'Gothic Dark',
    keywords: ['dark', 'gothic', 'mysterious', 'edgy', 'bold'],
    colorPalette: ['#000000', '#2C2C2C', '#FF4444', '#9944FF'],
    clothingTypes: ['top', 'bottom', 'coat', 'shoes', 'accessory'],
    mood: 'mysterious',
  },
  {
    name: 'Anime Fantasy',
    keywords: ['anime', 'fantasy', 'magical', 'colorful', 'cute'],
    colorPalette: ['#FF69B4', '#4A4AFF', '#00FF00', '#FFD700'],
    clothingTypes: ['top', 'bottom', 'coat', 'hat', 'accessory'],
    mood: 'playful',
  },
];

// ============== OCCASION SUGGESTIONS ==============
const OCCASION_SUGGESTIONS = {
  'office-work': {
    profile: 'Formal Professional',
    tips: ['Keep it neutral', 'Focus on fit', 'Comfortable shoes recommended'],
    mood: 'professional',
  },
  'casual-hangout': {
    profile: 'Casual Comfortable',
    tips: ['Mix and match', 'Express personality', 'Go for comfort'],
    mood: 'relaxed',
  },
  'date-night': {
    profile: 'Night Out Party',
    tips: ['Show your style', 'Be confident', 'Choose flattering colors'],
    mood: 'confident',
  },
  'gym-exercise': {
    profile: 'Sporty Active',
    tips: ['Prioritize comfort', 'Breathable fabrics', 'Supportive footwear'],
    mood: 'energetic',
  },
  'beach-day': {
    profile: 'Beach Vacation',
    tips: ['Go for brightness', 'Cooling fabrics', 'Sun protection'],
    mood: 'happy',
  },
  'party-celebration': {
    profile: 'Night Out Party',
    tips: ['Express boldly', 'Make a statement', 'Have fun with it'],
    mood: 'excited',
  },
  'fantasy-cosplay': {
    profile: 'Anime Fantasy',
    tips: ['Embrace creativity', 'Mix colors boldly', 'Add accessories'],
    mood: 'playful',
  },
  'gothic-night': {
    profile: 'Gothic Dark',
    tips: ['Go dark', 'Add mystery', 'Layer pieces'],
    mood: 'mysterious',
  },
};

export class OutfitGeneratorService {
  /**
   * Get all style profiles
   */
  static getStyleProfiles(): StyleProfile[] {
    return STYLE_PROFILES;
  }

  /**
   * Get style profile by name
   */
  static getStyleProfile(name: string): StyleProfile | undefined {
    return STYLE_PROFILES.find(p => p.name === name);
  }

  /**
   * Generate outfit for occasion
   */
  static generateOutfitForOccasion(
    occasion: string,
    availableClothing: ClothingItem[]
  ): OutfitSuggestion {
    const suggestion = OCCASION_SUGGESTIONS[occasion as keyof typeof OCCASION_SUGGESTIONS];
    if (!suggestion) {
      return this.generateRandomOutfit(availableClothing);
    }

    const profile = this.getStyleProfile(suggestion.profile);
    if (!profile) {
      return this.generateRandomOutfit(availableClothing);
    }

    return this.generateOutfitFromProfile(profile, availableClothing, occasion);
  }

  /**
   * Generate outfit from style profile
   */
  static generateOutfitFromProfile(
    profile: StyleProfile,
    availableClothing: ClothingItem[],
    occasion?: string
  ): OutfitSuggestion {
    const selectedItems: ClothingItem[] = [];
    const reasoning: string[] = [];

    // Get clothing by type from profile
    const topItems = availableClothing.filter(
      item => item.type === 'top' && this.matchesProfile(item, profile)
    );
    const bottomItems = availableClothing.filter(
      item => item.type === 'bottom' && this.matchesProfile(item, profile)
    );
    const shoeItems = availableClothing.filter(
      item => item.type === 'shoes' && this.matchesProfile(item, profile)
    );

    // Select best matching items
    if (topItems.length > 0) {
      const top = this.selectBestMatch(topItems, profile);
      selectedItems.push(top);
      reasoning.push(`Selected top: "${top.name}" - matches ${profile.name} style`);
    }

    if (bottomItems.length > 0) {
      const bottom = this.selectBestMatch(bottomItems, profile);
      selectedItems.push(bottom);
      reasoning.push(`Selected bottom: "${bottom.name}" - complements the top`);
    }

    if (shoeItems.length > 0) {
      const shoes = this.selectBestMatch(shoeItems, profile);
      selectedItems.push(shoes);
      reasoning.push(`Selected shoes: "${shoes.name}" - completes the look`);
    }

    // Calculate outfit metrics
    const colorHarmony = this.calculateColorHarmony(selectedItems, profile);
    const styleCoherence = this.calculateStyleCoherence(selectedItems, profile);
    const confidence = Math.round((colorHarmony + styleCoherence) / 2);

    return {
      id: `outfit-${Date.now()}`,
      name: `${profile.name} Outfit`,
      description: `A ${profile.mood} outfit perfect for ${occasion || 'any occasion'}`,
      items: selectedItems,
      colorHarmony,
      styleCoherence,
      occasion: occasion || 'casual',
      mood: profile.mood,
      confidence,
      reasoning,
    };
  }

  /**
   * Generate random outfit
   */
  static generateRandomOutfit(availableClothing: ClothingItem[]): OutfitSuggestion {
    const randomProfile =
      STYLE_PROFILES[Math.floor(Math.random() * STYLE_PROFILES.length)];
    return this.generateOutfitFromProfile(randomProfile, availableClothing);
  }

  /**
   * Match clothing item to style profile
   */
  private static matchesProfile(item: ClothingItem, profile: StyleProfile): boolean {
    // Check if any of the item's colors match the profile palette
    const colorMatch = item.colors.some(color =>
      profile.colorPalette.some(palColor => this.colorSimilarity(color, palColor) > 0.6)
    );

    return colorMatch || Math.random() > 0.3; // 70% baseline match
  }

  /**
   * Select best matching item from array
   */
  private static selectBestMatch(items: ClothingItem[], profile: StyleProfile): ClothingItem {
    const scores = items.map(item => ({
      item,
      score:
        this.calculateColorScore(item, profile) +
        this.calculateStyleScore(item, profile) +
        (Math.random() * 0.2), // Add slight randomness
    }));

    scores.sort((a, b) => b.score - a.score);
    return scores[0].item;
  }

  /**
   * Calculate color harmony score
   */
  private static calculateColorHarmony(items: ClothingItem[], profile: StyleProfile): number {
    if (items.length === 0) return 0;

    let totalScore = 0;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const sim = Math.max(
          ...items[i].colors.map(c1 =>
            Math.max(...items[j].colors.map(c2 => this.colorSimilarity(c1, c2)))
          )
        );
        totalScore += sim;
      }
    }

    const maxPairs = (items.length * (items.length - 1)) / 2;
    return Math.round((totalScore / maxPairs) * 100);
  }

  /**
   * Calculate style coherence score
   */
  private static calculateStyleCoherence(items: ClothingItem[], profile: StyleProfile): number {
    let matchCount = 0;

    items.forEach(item => {
      // Check if item category/type aligns with profile
      if (profile.clothingTypes.includes(item.type)) {
        matchCount += 1;
      }

      // Check color alignment
      const colorMatch = item.colors.some(color =>
        profile.colorPalette.some(palColor => this.colorSimilarity(color, palColor) > 0.7)
      );
      if (colorMatch) {
        matchCount += 0.5;
      }
    });

    return Math.round((matchCount / items.length) * 100);
  }

  /**
   * Calculate color score for item
   */
  private static calculateColorScore(item: ClothingItem, profile: StyleProfile): number {
    const matches = item.colors.map(color =>
      Math.max(...profile.colorPalette.map(palColor => this.colorSimilarity(color, palColor)))
    );

    return Math.max(...matches);
  }

  /**
   * Calculate style score for item
   */
  private static calculateStyleScore(item: ClothingItem, profile: StyleProfile): number {
    const typeMatch = profile.clothingTypes.includes(item.type) ? 0.5 : 0.2;
    const categoryBonus = profile.keywords.some(kw => item.category.includes(kw)) ? 0.3 : 0;

    return typeMatch + categoryBonus;
  }

  /**
   * Calculate color similarity (0-1)
   */
  private static colorSimilarity(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const dr = rgb1.r - rgb2.r;
    const dg = rgb1.g - rgb2.g;
    const db = rgb1.b - rgb2.b;

    const distance = Math.sqrt(dr * dr + dg * dg + db * db);
    return 1 - distance / 442; // 442 is max RGB distance
  }

  /**
   * Convert hex color to RGB
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Get outfit suggestions for multiple occasions
   */
  static generateMultipleSuggestions(
    occasion: string,
    availableClothing: ClothingItem[],
    count: number = 3
  ): OutfitSuggestion[] {
    const suggestions: OutfitSuggestion[] = [];

    // Generate suggestion from specific profile
    const occasionSuggestion = OCCASION_SUGGESTIONS[occasion as keyof typeof OCCASION_SUGGESTIONS];
    if (occasionSuggestion) {
      const profile = this.getStyleProfile(occasionSuggestion.profile);
      if (profile) {
        suggestions.push(this.generateOutfitFromProfile(profile, availableClothing, occasion));
      }
    }

    // Generate from other profiles for variety
    for (let i = 0; i < count - 1 && i < STYLE_PROFILES.length - 1; i++) {
      const randomProfile =
        STYLE_PROFILES[Math.floor(Math.random() * STYLE_PROFILES.length)];
      if (!suggestions.some(s => s.name.includes(randomProfile.name))) {
        suggestions.push(this.generateOutfitFromProfile(randomProfile, availableClothing, occasion));
      }
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);
    return suggestions.slice(0, count);
  }

  /**
   * Get outfit tips for occasion
   */
  static getOccasionTips(occasion: string): string[] {
    const tips =
      OCCASION_SUGGESTIONS[occasion as keyof typeof OCCASION_SUGGESTIONS]?.tips || [];
    return tips;
  }

  /**
   * Get all occasions
   */
  static getAllOccasions(): string[] {
    return Object.keys(OCCASION_SUGGESTIONS);
  }
}

/**
 * Hair System Service
 * Manages avatar hair styles, colors, and styling options
 * ~20 distinct styles with customizable colors and variations
 */

export interface HairStyle {
  id: string;
  name: string;
  category: 'short' | 'medium' | 'long' | 'curly' | 'straight' | 'fantasy';
  description: string;
  complexity: number; // 1-10 (affects rendering quality)
  defaultColor: string;
  canCustomizeColor: boolean;
  canAddHighlights: boolean;
  canBraid: boolean;
  canAddAccessories: boolean;
  compatibleHeadShapes: ('round' | 'square' | 'oval' | 'heart')[];
  previewEmoji: string;
}

export interface AvatarHair {
  id: string;
  styleId: string;
  primaryColor: string;
  secondaryColor?: string; // For highlights
  highlightIntensity: number; // 0-100
  length: number; // 0.8-1.2 scale
  volume: number; // 0.7-1.3 scale
  texture: 'straight' | 'wavy' | 'curly' | 'coily';
  shine: number; // 0-100 (glossiness)
  highlights: boolean;
  accessories: HairAccessory[];
}

export interface HairAccessory {
  id: string;
  name: string;
  type: 'bow' | 'clip' | 'band' | 'pin' | 'flower' | 'crown';
  color: string;
  position: 'top' | 'side' | 'back' | 'center';
}

// Hair Style Library - 20 distinct styles
const HAIR_STYLES: HairStyle[] = [
  // Short Styles
  {
    id: 'short-pixie',
    name: 'Pixie Cut',
    category: 'short',
    description: 'Classic short and sharp',
    complexity: 3,
    defaultColor: '#3D3D3D',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: false,
    canAddAccessories: true,
    compatibleHeadShapes: ['round', 'oval', 'square'],
    previewEmoji: '✂️',
  },
  {
    id: 'short-bob',
    name: 'Short Bob',
    category: 'short',
    description: 'Sleek and professional',
    complexity: 3,
    defaultColor: '#2C2C2C',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: false,
    canAddAccessories: true,
    compatibleHeadShapes: ['round', 'oval', 'square', 'heart'],
    previewEmoji: '💇',
  },
  {
    id: 'short-undercut',
    name: 'Undercut',
    category: 'short',
    description: 'Modern with shaved sides',
    complexity: 4,
    defaultColor: '#1A1A1A',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: false,
    canAddAccessories: true,
    compatibleHeadShapes: ['square', 'oval'],
    previewEmoji: '🔌',
  },
  {
    id: 'short-spiky',
    name: 'Spiky',
    category: 'short',
    description: 'Edgy and energetic',
    complexity: 4,
    defaultColor: '#4A4A4A',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: false,
    canAddAccessories: true,
    compatibleHeadShapes: ['round', 'square'],
    previewEmoji: '⚡',
  },

  // Medium Styles
  {
    id: 'medium-lob',
    name: 'Lob',
    category: 'medium',
    description: 'Long bob, versatile',
    complexity: 3,
    defaultColor: '#5A4A3A',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: true,
    canAddAccessories: true,
    compatibleHeadShapes: ['round', 'oval', 'heart'],
    previewEmoji: '👩',
  },
  {
    id: 'medium-layers',
    name: 'Layered',
    category: 'medium',
    description: 'Dynamic with layers',
    complexity: 5,
    defaultColor: '#6B5B4B',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: true,
    canAddAccessories: true,
    compatibleHeadShapes: ['round', 'oval', 'heart'],
    previewEmoji: '🎀',
  },
  {
    id: 'medium-sideswept',
    name: 'Side-Swept',
    category: 'medium',
    description: 'Romantic and flattering',
    complexity: 4,
    defaultColor: '#7A6A5A',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: true,
    canAddAccessories: true,
    compatibleHeadShapes: ['oval', 'heart', 'round'],
    previewEmoji: '💕',
  },
  {
    id: 'medium-waves',
    name: 'Waves',
    category: 'medium',
    description: 'Soft and feminine',
    complexity: 4,
    defaultColor: '#8B7B6B',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: false,
    canAddAccessories: true,
    compatibleHeadShapes: ['oval', 'heart', 'round'],
    previewEmoji: '〰️',
  },

  // Long Styles
  {
    id: 'long-straight',
    name: 'Long Straight',
    category: 'long',
    description: 'Classic and elegant',
    complexity: 3,
    defaultColor: '#4A3A2A',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: true,
    canAddAccessories: true,
    compatibleHeadShapes: ['oval', 'heart', 'round'],
    previewEmoji: '✨',
  },
  {
    id: 'long-wavy',
    name: 'Long Wavy',
    category: 'long',
    description: 'Flowing and graceful',
    complexity: 4,
    defaultColor: '#5A4A3A',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: true,
    canAddAccessories: true,
    compatibleHeadShapes: ['oval', 'heart', 'round'],
    previewEmoji: '🌊',
  },
  {
    id: 'long-mermaid',
    name: 'Mermaid',
    category: 'long',
    description: 'Ombre and fantasy',
    complexity: 5,
    defaultColor: '#2A5A7A',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: true,
    canAddAccessories: true,
    compatibleHeadShapes: ['oval', 'heart'],
    previewEmoji: '🧜‍♀️',
  },

  // Curly Styles
  {
    id: 'curly-afro',
    name: 'Afro',
    category: 'curly',
    description: 'Natural and voluminous',
    complexity: 4,
    defaultColor: '#3A2A1A',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: false,
    canAddAccessories: true,
    compatibleHeadShapes: ['round', 'oval'],
    previewEmoji: '👑',
  },
  {
    id: 'curly-ringlets',
    name: 'Ringlets',
    category: 'curly',
    description: 'Bouncy and playful',
    complexity: 5,
    defaultColor: '#6A5A4A',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: false,
    canAddAccessories: true,
    compatibleHeadShapes: ['round', 'heart'],
    previewEmoji: '🎪',
  },
  {
    id: 'curly-waves-tight',
    name: 'Tight Waves',
    category: 'curly',
    description: 'Defined and textured',
    complexity: 4,
    defaultColor: '#5A4A3A',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: true,
    canAddAccessories: true,
    compatibleHeadShapes: ['round', 'oval', 'heart'],
    previewEmoji: '〰️',
  },

  // Fantasy Styles
  {
    id: 'fantasy-twin-tails',
    name: 'Twin Tails',
    category: 'fantasy',
    description: 'Anime-style iconic',
    complexity: 6,
    defaultColor: '#8A5A3A',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: false,
    canAddAccessories: true,
    compatibleHeadShapes: ['round', 'heart'],
    previewEmoji: '🎀',
  },
  {
    id: 'fantasy-buns',
    name: 'Space Buns',
    category: 'fantasy',
    description: 'Fun and whimsical',
    complexity: 5,
    defaultColor: '#9A6A4A',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: false,
    canAddAccessories: true,
    compatibleHeadShapes: ['round', 'heart'],
    previewEmoji: '🌙',
  },
  {
    id: 'fantasy-elf',
    name: 'Elf',
    category: 'fantasy',
    description: 'Long and mystical',
    complexity: 6,
    defaultColor: '#7A9A5A',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: true,
    canAddAccessories: true,
    compatibleHeadShapes: ['oval', 'heart'],
    previewEmoji: '🍃',
  },
  {
    id: 'fantasy-vampire',
    name: 'Slicked Back',
    category: 'fantasy',
    description: 'Gothic and dramatic',
    complexity: 4,
    defaultColor: '#1A1A1A',
    canCustomizeColor: true,
    canAddHighlights: true,
    canBraid: false,
    canAddAccessories: true,
    compatibleHeadShapes: ['oval', 'square'],
    previewEmoji: '🦇',
  },
];

// Hair Accessories
const HAIR_ACCESSORIES: HairAccessory[] = [
  { id: 'bow-pink', name: 'Pink Bow', type: 'bow', color: '#FF69B4', position: 'top' },
  { id: 'bow-blue', name: 'Blue Bow', type: 'bow', color: '#4A90FF', position: 'top' },
  { id: 'clip-gold', name: 'Gold Clip', type: 'clip', color: '#FFD700', position: 'side' },
  { id: 'band-black', name: 'Black Headband', type: 'band', color: '#1A1A1A', position: 'center' },
  { id: 'flower-rose', name: 'Rose', type: 'flower', color: '#FF4444', position: 'side' },
  { id: 'flower-daisy', name: 'Daisy', type: 'flower', color: '#FFFF44', position: 'side' },
  { id: 'crown-gold', name: 'Gold Crown', type: 'crown', color: '#FFD700', position: 'top' },
  { id: 'crown-silver', name: 'Silver Crown', type: 'crown', color: '#C0C0C0', position: 'top' },
];

export class HairService {
  // ============== STYLE MANAGEMENT ==============

  /**
   * Get all available hair styles
   */
  static getAllStyles(): HairStyle[] {
    return HAIR_STYLES;
  }

  /**
   * Get styles by category
   */
  static getStylesByCategory(category: HairStyle['category']): HairStyle[] {
    return HAIR_STYLES.filter(s => s.category === category);
  }

  /**
   * Get styles compatible with head shape
   */
  static getStylesForHeadShape(headShape: string): HairStyle[] {
    return HAIR_STYLES.filter(s => s.compatibleHeadShapes.includes(headShape as any));
  }

  /**
   * Get single style by ID
   */
  static getStyle(styleId: string): HairStyle | undefined {
    return HAIR_STYLES.find(s => s.id === styleId);
  }

  // ============== HAIR CREATION ==============

  /**
   * Create new hair with defaults
   */
  static createHair(styleId: string): AvatarHair {
    const style = this.getStyle(styleId);
    if (!style) throw new Error(`Hair style ${styleId} not found`);

    return {
      id: `hair-${Date.now()}`,
      styleId,
      primaryColor: style.defaultColor,
      secondaryColor: undefined,
      highlightIntensity: 0,
      length: 1,
      volume: 1,
      texture: 'straight',
      shine: 50,
      highlights: false,
      accessories: [],
    };
  }

  /**
   * Clone hair
   */
  static cloneHair(hair: AvatarHair): AvatarHair {
    return {
      ...hair,
      id: `hair-${Date.now()}`,
      accessories: [...hair.accessories],
    };
  }

  // ============== COLOR CUSTOMIZATION ==============

  /**
   * Change primary hair color
   */
  static setPrimaryColor(hair: AvatarHair, color: string): AvatarHair {
    return { ...hair, primaryColor: color };
  }

  /**
   * Add/change highlight color
   */
  static setHighlightColor(hair: AvatarHair, color: string, intensity: number): AvatarHair {
    return {
      ...hair,
      secondaryColor: color,
      highlightIntensity: Math.max(0, Math.min(100, intensity)),
      highlights: intensity > 0,
    };
  }

  /**
   * Remove highlights
   */
  static removeHighlights(hair: AvatarHair): AvatarHair {
    return {
      ...hair,
      secondaryColor: undefined,
      highlightIntensity: 0,
      highlights: false,
    };
  }

  // ============== STYLING ==============

  /**
   * Change hair texture
   */
  static setTexture(hair: AvatarHair, texture: AvatarHair['texture']): AvatarHair {
    return { ...hair, texture };
  }

  /**
   * Adjust hair length
   */
  static setLength(hair: AvatarHair, length: number): AvatarHair {
    return { ...hair, length: Math.max(0.8, Math.min(1.2, length)) };
  }

  /**
   * Adjust hair volume
   */
  static setVolume(hair: AvatarHair, volume: number): AvatarHair {
    return { ...hair, volume: Math.max(0.7, Math.min(1.3, volume)) };
  }

  /**
   * Change shine/glossiness
   */
  static setShine(hair: AvatarHair, shine: number): AvatarHair {
    return { ...hair, shine: Math.max(0, Math.min(100, shine)) };
  }

  // ============== ACCESSORIES ==============

  /**
   * Get available accessories
   */
  static getAccessories(): HairAccessory[] {
    return HAIR_ACCESSORIES;
  }

  /**
   * Add accessory to hair
   */
  static addAccessory(hair: AvatarHair, accessoryId: string): AvatarHair {
    const accessory = HAIR_ACCESSORIES.find(a => a.id === accessoryId);
    if (!accessory) throw new Error(`Accessory ${accessoryId} not found`);

    return {
      ...hair,
      accessories: [...hair.accessories, { ...accessory }],
    };
  }

  /**
   * Remove accessory
   */
  static removeAccessory(hair: AvatarHair, accessoryIndex: number): AvatarHair {
    return {
      ...hair,
      accessories: hair.accessories.filter((_, i) => i !== accessoryIndex),
    };
  }

  /**
   * Clear all accessories
   */
  static clearAccessories(hair: AvatarHair): AvatarHair {
    return { ...hair, accessories: [] };
  }

  /**
   * Recolor accessory
   */
  static recolorAccessory(
    hair: AvatarHair,
    accessoryIndex: number,
    color: string
  ): AvatarHair {
    const newAccessories = [...hair.accessories];
    if (newAccessories[accessoryIndex]) {
      newAccessories[accessoryIndex] = {
        ...newAccessories[accessoryIndex],
        color,
      };
    }
    return { ...hair, accessories: newAccessories };
  }

  // ============== VALIDATION ==============

  /**
   * Check if style supports highlights
   */
  static supportsHighlights(styleId: string): boolean {
    const style = this.getStyle(styleId);
    return style?.canAddHighlights || false;
  }

  /**
   * Check if style supports braids
   */
  static supportsBraids(styleId: string): boolean {
    const style = this.getStyle(styleId);
    return style?.canBraid || false;
  }

  /**
   * Check if style supports accessories
   */
  static supportsAccessories(styleId: string): boolean {
    const style = this.getStyle(styleId);
    return style?.canAddAccessories || false;
  }

  // ============== PRESETS ==============

  /**
   * Get popular color presets
   */
  static getColorPresets(): string[] {
    return [
      '#000000', // Black
      '#1A1A1A', // Dark Gray
      '#3D3D3D', // Gray
      '#6B5B4B', // Brown
      '#8B7355', // Medium Brown
      '#C9A961', // Light Brown
      '#FF4444', // Red
      '#FF6B6B', // Light Red
      '#FF8844', // Orange
      '#FFD700', // Gold
      '#FFFF44', // Yellow
      '#44FF44', // Green
      '#4A90FF', // Blue
      '#9944FF', // Purple
      '#FF44FF', // Magenta
      '#E6E6FA', // Lavender
      '#FFFFFF', // White
    ];
  }

  /**
   * Create preset hair combinations
   */
  static getPresets() {
    return [
      {
        name: 'Innocent Angel',
        style: 'medium-waves',
        color: '#FFFACD',
        highlights: true,
        highlightColor: '#FFD700',
        accessories: ['bow-pink', 'flower-daisy'],
      },
      {
        name: 'Dark Mystery',
        style: 'long-straight',
        color: '#000000',
        highlights: false,
        accessories: [],
      },
      {
        name: 'Sunset Beach',
        style: 'long-wavy',
        color: '#FF9944',
        highlights: true,
        highlightColor: '#FFD700',
        accessories: ['band-black'],
      },
      {
        name: 'Mermaid Fantasy',
        style: 'long-mermaid',
        color: '#4A7A9A',
        highlights: true,
        highlightColor: '#7AFFAA',
        accessories: ['crown-silver'],
      },
      {
        name: 'Rebel Spirit',
        style: 'short-undercut',
        color: '#1A1A1A',
        highlights: true,
        highlightColor: '#FF4444',
        accessories: ['clip-gold'],
      },
    ];
  }
}

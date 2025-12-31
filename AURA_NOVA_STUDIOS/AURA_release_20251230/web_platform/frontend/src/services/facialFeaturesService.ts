/**
 * Facial Features Service
 * Manages eyes, noses, lips, eyebrows, makeup, tattoos
 * Provides 50+ combinations for deep customization
 */

// ============== EYE TYPES ==============
export interface EyeType {
  id: string;
  name: string;
  style: 'round' | 'almond' | 'cat' | 'monolid' | 'hooded' | 'wide';
  description: string;
  complexity: number;
  defaultColor: string;
  allowSecondaryColor: boolean;
  previewEmoji: string;
}

export interface Eyes {
  type: string;
  primaryColor: string;
  secondaryColor?: string; // For two-tone eyes
  pupilColor: string;
  pupilSize: number; // 0.5-1.5
  eyebrowStyle: string;
  eyebrowColor: string;
  eyebrowThickness: number; // 0.7-1.5
  eyebrowAngle: number; // -20 to 20 degrees
  eyeLidShadow?: EyeShadow;
  eyeliner?: Eyeliner;
}

export interface EyeShadow {
  color: string;
  intensity: number; // 0-100
  blend: number; // 0-100 (softness)
  style: 'neutral' | 'smokey' | 'bold' | 'shimmer' | 'gradient';
}

export interface Eyeliner {
  color: string;
  thickness: number; // 1-5
  style: 'thin' | 'normal' | 'thick' | 'winged' | 'dramatic';
  topLid: boolean;
  bottomLid: boolean;
}

// ============== NOSE TYPES ==============
export interface NoseType {
  id: string;
  name: string;
  shape: 'button' | 'straight' | 'bulbous' | 'hooked' | 'wide' | 'pointed';
  size: number; // 0.8-1.3
  description: string;
  previewEmoji: string;
}

// ============== LIPS ==============
export interface Lips {
  shape: 'thin' | 'full' | 'pouty' | 'heart-shaped' | 'bow';
  color: string;
  gloss: number; // 0-100
  outline: boolean;
  outlineColor?: string;
  opacity: number; // 0-100
  lipstickFinish: 'matte' | 'satin' | 'glossy' | 'metallic';
}

// ============== BLUSH & MAKEUP ==============
export interface Blush {
  color: string;
  intensity: number; // 0-100
  blendSize: number; // 0.5-2 (spread)
  position: 'high' | 'normal' | 'low';
}

export interface FacialMark {
  id: string;
  type: 'freckle' | 'beauty-mark' | 'scar' | 'tattoo' | 'birthmark';
  color: string;
  size: number;
  position: { x: number; y: number }; // 0-1 normalized coordinates
  opacity: number; // 0-100
  rotation: number; // 0-360
}

export interface Makeup {
  eyeShadow?: EyeShadow[];
  eyeliner?: Eyeliner;
  blush?: Blush;
  lipstick?: Lips;
  foundation?: { intensity: number }; // 0-100
}

// ============== COMPLETE FACIAL FEATURES ==============
export interface FacialFeatures {
  eyes: Eyes;
  noseType: string;
  lips: Lips;
  makeup: Makeup;
  facialMarks: FacialMark[];
  blushIntensity: number;
  faceShape: 'round' | 'square' | 'oval' | 'heart';
  jawline: number; // 0.8-1.2
}

// ============== EYE LIBRARY (10 types) ==============
const EYE_TYPES: EyeType[] = [
  {
    id: 'eyes-round',
    name: 'Round',
    style: 'round',
    description: 'Classic innocent look',
    complexity: 2,
    defaultColor: '#8B6F47',
    allowSecondaryColor: true,
    previewEmoji: '●',
  },
  {
    id: 'eyes-almond',
    name: 'Almond',
    style: 'almond',
    description: 'Elegant and sultry',
    complexity: 3,
    defaultColor: '#6B4423',
    allowSecondaryColor: true,
    previewEmoji: '◆',
  },
  {
    id: 'eyes-cat',
    name: 'Cat Eye',
    style: 'cat',
    description: 'Sharp and mysterious',
    complexity: 4,
    defaultColor: '#4A7A2A',
    allowSecondaryColor: false,
    previewEmoji: '△',
  },
  {
    id: 'eyes-monolid',
    name: 'Monolid',
    style: 'monolid',
    description: 'Smooth and serene',
    complexity: 2,
    defaultColor: '#5A4A3A',
    allowSecondaryColor: false,
    previewEmoji: '─',
  },
  {
    id: 'eyes-hooded',
    name: 'Hooded',
    style: 'hooded',
    description: 'Sleepy and dreamy',
    complexity: 3,
    defaultColor: '#7B5A3A',
    allowSecondaryColor: true,
    previewEmoji: '◐',
  },
  {
    id: 'eyes-wide',
    name: 'Wide-Set',
    style: 'wide',
    description: 'Expressive and open',
    complexity: 2,
    defaultColor: '#9B7A5A',
    allowSecondaryColor: true,
    previewEmoji: '◉',
  },
  {
    id: 'eyes-sparkle',
    name: 'Sparkle',
    style: 'round',
    description: 'Magical and bright',
    complexity: 5,
    defaultColor: '#FFD700',
    allowSecondaryColor: true,
    previewEmoji: '✨',
  },
  {
    id: 'eyes-anime',
    name: 'Anime',
    style: 'round',
    description: 'Exaggerated and stylized',
    complexity: 4,
    defaultColor: '#4A4AFF',
    allowSecondaryColor: true,
    previewEmoji: '◉',
  },
  {
    id: 'eyes-fox',
    name: 'Fox Eyes',
    style: 'cat',
    description: 'Cunning and playful',
    complexity: 4,
    defaultColor: '#FF8844',
    allowSecondaryColor: false,
    previewEmoji: '◀',
  },
  {
    id: 'eyes-doll',
    name: 'Doll Eyes',
    style: 'round',
    description: 'Large and innocent',
    complexity: 3,
    defaultColor: '#7A9FBF',
    allowSecondaryColor: true,
    previewEmoji: '⭕',
  },
];

// ============== NOSE LIBRARY (6 types) ==============
const NOSE_TYPES: NoseType[] = [
  {
    id: 'nose-button',
    name: 'Button',
    shape: 'button',
    size: 0.9,
    description: 'Small and cute',
    previewEmoji: '∨',
  },
  {
    id: 'nose-straight',
    name: 'Straight',
    shape: 'straight',
    size: 1.0,
    description: 'Classic and balanced',
    previewEmoji: '║',
  },
  {
    id: 'nose-bulbous',
    name: 'Bulbous',
    shape: 'bulbous',
    size: 1.2,
    description: 'Round and gentle',
    previewEmoji: '◯',
  },
  {
    id: 'nose-hooked',
    name: 'Hooked',
    shape: 'hooked',
    size: 1.1,
    description: 'Curved and distinctive',
    previewEmoji: '⌒',
  },
  {
    id: 'nose-wide',
    name: 'Wide',
    shape: 'wide',
    size: 1.3,
    description: 'Bold and strong',
    previewEmoji: '◇',
  },
  {
    id: 'nose-pointed',
    name: 'Pointed',
    shape: 'pointed',
    size: 0.8,
    description: 'Sharp and delicate',
    previewEmoji: '▲',
  },
];

// ============== EYEBROW STYLES ==============
const EYEBROW_STYLES = [
  { id: 'brow-straight', name: 'Straight', shape: 'straight' },
  { id: 'brow-arched', name: 'Arched', shape: 'arched' },
  { id: 'brow-soft', name: 'Soft', shape: 'soft' },
  { id: 'brow-bold', name: 'Bold', shape: 'bold' },
  { id: 'brow-thin', name: 'Thin', shape: 'thin' },
  { id: 'brow-thick', name: 'Thick', shape: 'thick' },
];

export class FacialFeaturesService {
  // ============== EYE MANAGEMENT ==============

  /**
   * Get all eye types
   */
  static getAllEyeTypes(): EyeType[] {
    return EYE_TYPES;
  }

  /**
   * Get eye type by ID
   */
  static getEyeType(id: string): EyeType | undefined {
    return EYE_TYPES.find(e => e.id === id);
  }

  /**
   * Create default eyes
   */
  static createDefaultEyes(): Eyes {
    return {
      type: 'eyes-round',
      primaryColor: '#8B6F47',
      secondaryColor: '#6B4423',
      pupilColor: '#000000',
      pupilSize: 1,
      eyebrowStyle: 'brow-arched',
      eyebrowColor: '#3D3D3D',
      eyebrowThickness: 1,
      eyebrowAngle: 5,
    };
  }

  /**
   * Change eye type
   */
  static setEyeType(eyes: Eyes, typeId: string): Eyes {
    const type = this.getEyeType(typeId);
    if (!type) throw new Error(`Eye type ${typeId} not found`);

    return {
      ...eyes,
      type: typeId,
      primaryColor: type.defaultColor,
    };
  }

  /**
   * Change eye color
   */
  static setEyeColor(eyes: Eyes, color: string, secondary?: string): Eyes {
    return {
      ...eyes,
      primaryColor: color,
      secondaryColor: secondary,
    };
  }

  /**
   * Change pupil color
   */
  static setPupilColor(eyes: Eyes, color: string): Eyes {
    return { ...eyes, pupilColor: color };
  }

  /**
   * Adjust pupil size
   */
  static setPupilSize(eyes: Eyes, size: number): Eyes {
    return { ...eyes, pupilSize: Math.max(0.5, Math.min(1.5, size)) };
  }

  // ============== EYEBROW MANAGEMENT ==============

  /**
   * Get eyebrow styles
   */
  static getEyebrowStyles() {
    return EYEBROW_STYLES;
  }

  /**
   * Set eyebrow style
   */
  static setEyebrowStyle(eyes: Eyes, styleId: string): Eyes {
    return { ...eyes, eyebrowStyle: styleId };
  }

  /**
   * Set eyebrow color
   */
  static setEyebrowColor(eyes: Eyes, color: string): Eyes {
    return { ...eyes, eyebrowColor: color };
  }

  /**
   * Set eyebrow thickness
   */
  static setEyebrowThickness(eyes: Eyes, thickness: number): Eyes {
    return { ...eyes, eyebrowThickness: Math.max(0.7, Math.min(1.5, thickness)) };
  }

  /**
   * Set eyebrow angle
   */
  static setEyebrowAngle(eyes: Eyes, angle: number): Eyes {
    return { ...eyes, eyebrowAngle: Math.max(-20, Math.min(20, angle)) };
  }

  // ============== NOSE MANAGEMENT ==============

  /**
   * Get all nose types
   */
  static getAllNoseTypes(): NoseType[] {
    return NOSE_TYPES;
  }

  /**
   * Get nose type by ID
   */
  static getNoseType(id: string): NoseType | undefined {
    return NOSE_TYPES.find(n => n.id === id);
  }

  /**
   * Create default nose
   */
  static createDefaultNose(): string {
    return 'nose-straight';
  }

  // ============== LIP MANAGEMENT ==============

  /**
   * Create default lips
   */
  static createDefaultLips(): Lips {
    return {
      shape: 'full',
      color: '#FFB3BA',
      gloss: 30,
      outline: false,
      opacity: 80,
      lipstickFinish: 'satin',
    };
  }

  /**
   * Set lip shape
   */
  static setLipShape(lips: Lips, shape: Lips['shape']): Lips {
    return { ...lips, shape };
  }

  /**
   * Set lipstick color
   */
  static setLipstickColor(lips: Lips, color: string): Lips {
    return { ...lips, color };
  }

  /**
   * Set lip gloss
   */
  static setLipGloss(lips: Lips, gloss: number): Lips {
    return { ...lips, gloss: Math.max(0, Math.min(100, gloss)) };
  }

  /**
   * Add lip outline
   */
  static setLipOutline(lips: Lips, enable: boolean, color?: string): Lips {
    return {
      ...lips,
      outline: enable,
      outlineColor: color,
    };
  }

  /**
   * Set lipstick finish
   */
  static setLipstickFinish(lips: Lips, finish: Lips['lipstickFinish']): Lips {
    return { ...lips, lipstickFinish: finish };
  }

  // ============== MAKEUP MANAGEMENT ==============

  /**
   * Create default makeup
   */
  static createDefaultMakeup(): Makeup {
    return {
      eyeliner: undefined,
      blush: undefined,
      lipstick: undefined,
      foundation: { intensity: 0 },
    };
  }

  /**
   * Add eye shadow
   */
  static addEyeShadow(makeup: Makeup, shadow: EyeShadow): Makeup {
    return {
      ...makeup,
      eyeShadow: [...(makeup.eyeShadow || []), shadow],
    };
  }

  /**
   * Add eyeliner
   */
  static addEyeliner(makeup: Makeup, eyeliner: Eyeliner): Makeup {
    return { ...makeup, eyeliner };
  }

  /**
   * Add blush
   */
  static addBlush(makeup: Makeup, blush: Blush): Makeup {
    return { ...makeup, blush };
  }

  /**
   * Set lipstick
   */
  static setLipstick(makeup: Makeup, lips: Lips): Makeup {
    return { ...makeup, lipstick: lips };
  }

  /**
   * Set foundation
   */
  static setFoundation(makeup: Makeup, intensity: number): Makeup {
    return {
      ...makeup,
      foundation: { intensity: Math.max(0, Math.min(100, intensity)) },
    };
  }

  /**
   * Clear all makeup
   */
  static clearMakeup(): Makeup {
    return {
      eyeliner: undefined,
      blush: undefined,
      lipstick: undefined,
      foundation: { intensity: 0 },
    };
  }

  // ============== FACIAL MARKS ==============

  /**
   * Add facial mark (freckles, scars, tattoos, etc.)
   */
  static addFacialMark(marks: FacialMark[], mark: FacialMark): FacialMark[] {
    return [...marks, mark];
  }

  /**
   * Remove facial mark
   */
  static removeFacialMark(marks: FacialMark[], index: number): FacialMark[] {
    return marks.filter((_, i) => i !== index);
  }

  /**
   * Update facial mark
   */
  static updateFacialMark(marks: FacialMark[], index: number, mark: FacialMark): FacialMark[] {
    const updated = [...marks];
    updated[index] = mark;
    return updated;
  }

  /**
   * Add freckles pattern
   */
  static addFrecklePattern(marks: FacialMark[], intensity: number): FacialMark[] {
    const newMarks = [...marks];
    const frecklCount = Math.floor(intensity * 30); // 0-30 freckles

    for (let i = 0; i < frecklCount; i++) {
      newMarks.push({
        id: `freckle-${Date.now()}-${i}`,
        type: 'freckle',
        color: '#C4956B',
        size: Math.random() * 0.3 + 0.1,
        position: { x: Math.random(), y: Math.random() * 0.7 },
        opacity: Math.random() * 80 + 20,
        rotation: Math.random() * 360,
      });
    }

    return newMarks;
  }

  // ============== COMPLETE FEATURES ==============

  /**
   * Create complete facial features with defaults
   */
  static createDefaultFeatures(): FacialFeatures {
    return {
      eyes: this.createDefaultEyes(),
      noseType: 'nose-straight',
      lips: this.createDefaultLips(),
      makeup: this.createDefaultMakeup(),
      facialMarks: [],
      blushIntensity: 0,
      faceShape: 'oval',
      jawline: 1,
    };
  }

  /**
   * Clone features
   */
  static cloneFeatures(features: FacialFeatures): FacialFeatures {
    return {
      ...features,
      makeup: { ...features.makeup },
      facialMarks: [...features.facialMarks],
    };
  }

  // ============== PRESETS ==============

  /**
   * Get makeup presets
   */
  static getMakeupPresets() {
    return [
      {
        name: 'No Makeup',
        makeup: this.createDefaultMakeup(),
      },
      {
        name: 'Natural',
        makeup: {
          eyeliner: { color: '#333333', thickness: 1, style: 'thin', topLid: true, bottomLid: false },
          blush: { color: '#FF9999', intensity: 30, blendSize: 1, position: 'high' },
          lipstick: { shape: 'full', color: '#FFB3BA', gloss: 40, outline: false, opacity: 70, lipstickFinish: 'satin' },
          foundation: { intensity: 20 },
        },
      },
      {
        name: 'Smokey',
        makeup: {
          eyeShadow: [{ color: '#333333', intensity: 60, blend: 80, style: 'smokey' }],
          eyeliner: { color: '#000000', thickness: 3, style: 'thick', topLid: true, bottomLid: true },
          blush: { color: '#FF6666', intensity: 50, blendSize: 1.2, position: 'normal' },
          lipstick: { shape: 'pouty', color: '#8B4040', gloss: 20, outline: true, outlineColor: '#000000', opacity: 80, lipstickFinish: 'matte' },
          foundation: { intensity: 50 },
        },
      },
      {
        name: 'Bold',
        makeup: {
          eyeShadow: [{ color: '#FF44FF', intensity: 80, blend: 40, style: 'bold' }],
          eyeliner: { color: '#FF44FF', thickness: 4, style: 'winged', topLid: true, bottomLid: false },
          blush: { color: '#FF6666', intensity: 70, blendSize: 1.5, position: 'high' },
          lipstick: { shape: 'bow', color: '#FF0000', gloss: 60, outline: true, outlineColor: '#8B0000', opacity: 100, lipstickFinish: 'glossy' },
          foundation: { intensity: 70 },
        },
      },
      {
        name: 'Shimmer Goddess',
        makeup: {
          eyeShadow: [{ color: '#FFD700', intensity: 100, blend: 30, style: 'shimmer' }],
          eyeliner: { color: '#FFD700', thickness: 2, style: 'normal', topLid: true, bottomLid: false },
          blush: { color: '#FFAA66', intensity: 60, blendSize: 1.3, position: 'high' },
          lipstick: { shape: 'full', color: '#FF8844', gloss: 80, outline: false, opacity: 90, lipstickFinish: 'metallic' },
          foundation: { intensity: 40 },
        },
      },
    ];
  }

  /**
   * Get color presets
   */
  static getColorPresets() {
    return {
      eyeColors: [
        '#8B6F47', // Brown
        '#6B4423', // Dark Brown
        '#4A7A2A', // Green
        '#5A4A3A', // Dark Brown
        '#7B5A3A', // Light Brown
        '#9B7A5A', // Hazel
        '#4A4AFF', // Blue
        '#FF6B6B', // Red (fantasy)
        '#FFD700', // Gold (sparkle)
      ],
      lipColors: [
        '#FFB3BA', // Pink
        '#FF6B9D', // Hot Pink
        '#C41E3A', // Red
        '#8B0000', // Dark Red
        '#8B6666', // Mauve
        '#FF4444', // Coral
        '#FFB347', // Peach
        '#666666', // Dark (nude)
      ],
      eyebrowColors: [
        '#000000',
        '#3D3D3D',
        '#6B5B4B',
        '#8B7355',
        '#FFD700',
        '#FF6B6B',
      ],
    };
  }
}

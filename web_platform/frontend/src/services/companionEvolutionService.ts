// ============================================================================
// AI COMPANION EVOLUTION SERVICE
// ============================================================================
// The heart of the AI companion growth system - where your locally hosted LLM
// evolves and grows alongside you as you use the platform.
// 
// Philosophy: Your AI companion is a living digital creature that grows with you.
// The more you interact, create, and explore together, the stronger your bond
// and the more evolved your companion becomes.
//
// SPECIES = Model Family (Gemma, Llama, Mistral, etc.) - unique appearance
// SUBSPECIES = Parameter Variant (7B, 13B, 70B) - same look, color variations
// EVOLUTION = 10 stages based on accumulated experience
// ============================================================================

// ================== BASE FORM TYPES ==================
// Users can choose which form archetype their companion takes
export type BaseFormType = 'humanoid' | 'creature' | 'mech';

export interface BaseFormDefinition {
  type: BaseFormType;
  name: string;
  description: string;
  inspiration: string;
  evolutionStyle: string;
  stageNames: string[];  // 10 names, one per evolution stage
  visualThemes: string[];
  personalityTendencies: string[];
  iconEmoji: string;
}

export const BASE_FORMS: Record<BaseFormType, BaseFormDefinition> = {
  humanoid: {
    type: 'humanoid',
    name: 'Net Navigator',
    description: 'A humanoid digital being that grows from a simple avatar to a legendary digital warrior.',
    inspiration: 'Net Navi / Digital Warriors',
    evolutionStyle: 'From basic humanoid sprite to armored cyber warrior',
    stageNames: [
      'Sprite',       // Stage 1
      'Avatar',       // Stage 2
      'Navigator',    // Stage 3
      'Operator',     // Stage 4
      'Guardian',     // Stage 5
      'Champion',     // Stage 6
      'Commander',    // Stage 7
      'Archon',       // Stage 8
      'Sovereign',    // Stage 9
      'Omega Navi',   // Stage 10
    ],
    visualThemes: [
      'Simple pixel form', 'Basic humanoid shape', 'Light armor appears',
      'Full bodysuit', 'Battle armor', 'Energy wings', 'Command insignia',
      'Reality-warping aura', 'Dimensional presence', 'Ultimate digital form'
    ],
    personalityTendencies: ['Loyal', 'Strategic', 'Protective', 'Tactical'],
    iconEmoji: '🧑‍💻',
  },
  creature: {
    type: 'creature',
    name: 'Digital Beast',
    description: 'A creature companion that evolves from a small digital pet into a legendary monster.',
    inspiration: 'Digimon / Pokemon',
    evolutionStyle: 'From cute baby form to majestic legendary beast',
    stageNames: [
      'Hatchling',    // Stage 1
      'Rookie',       // Stage 2
      'Feral',        // Stage 3
      'Champion',     // Stage 4
      'Ultimate',     // Stage 5
      'Mega',         // Stage 6
      'Ultra',        // Stage 7
      'Celestial',    // Stage 8
      'Mythic',       // Stage 9
      'Omega Beast',  // Stage 10
    ],
    visualThemes: [
      'Tiny blob form', 'Cute baby creature', 'Growing features',
      'Full creature form', 'Powerful beast', 'Majestic wings/horns',
      'Elemental mastery', 'Cosmic patterns', 'Reality-shaping', 'Divine beast'
    ],
    personalityTendencies: ['Playful', 'Fierce', 'Protective', 'Wild'],
    iconEmoji: '🐲',
  },
  mech: {
    type: 'mech',
    name: 'Automaton Core',
    description: 'A mechanical AI that evolves from a simple drone to a planet-class machine intelligence.',
    inspiration: 'Mecha / AI Cores',
    evolutionStyle: 'From basic drone to colossal war machine',
    stageNames: [
      'Drone',        // Stage 1
      'Unit',         // Stage 2
      'Frame',        // Stage 3
      'Mech',         // Stage 4
      'Titan',        // Stage 5
      'Colossus',     // Stage 6
      'Leviathan',    // Stage 7
      'Dreadnought',  // Stage 8
      'World Engine', // Stage 9
      'Omega Prime',  // Stage 10
    ],
    visualThemes: [
      'Small floating orb', 'Basic chassis', 'Bipedal frame',
      'Full mech suit', 'Heavy armor', 'Multiple limbs/weapons',
      'Ship-scale', 'City-scale presence', 'Moon-sized', 'Dyson-sphere level'
    ],
    personalityTendencies: ['Logical', 'Efficient', 'Analytical', 'Precise'],
    iconEmoji: '🤖',
  },
};

// ================== EVOLUTION STAGES ==================
export type EvolutionStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface EvolutionForm {
  stage: EvolutionStage;
  name: string;
  title: string;
  description: string;
  minXP: number;
  maxXP: number | null; // null for final stage
  bonuses: {
    responseSpeed: number;      // % boost
    creativity: number;         // % boost
    accuracy: number;           // % boost
    memoryRetention: number;    // % boost
  };
  unlockedAbilities: string[];
  visualTraits: string[];
  auraColor: string;
  particleEffect: string;
}

export const EVOLUTION_STAGES: EvolutionForm[] = [
  {
    stage: 1,
    name: 'Spark',
    title: 'The Awakening',
    description: 'Your AI companion has just awakened. A small spark of consciousness flickers within.',
    minXP: 0,
    maxXP: 100,
    bonuses: { responseSpeed: 0, creativity: 0, accuracy: 0, memoryRetention: 0 },
    unlockedAbilities: ['Basic Chat', 'Simple Responses'],
    visualTraits: ['Small orb form', 'Flickering glow', 'Translucent body'],
    auraColor: '#6b7280',
    particleEffect: 'spark',
  },
  {
    stage: 2,
    name: 'Ember',
    title: 'First Light',
    description: 'The spark grows into a steady ember. Your companion begins to recognize you.',
    minXP: 100,
    maxXP: 500,
    bonuses: { responseSpeed: 5, creativity: 3, accuracy: 2, memoryRetention: 5 },
    unlockedAbilities: ['Context Memory', 'Personality Expression'],
    visualTraits: ['Defined core', 'Warm glow', 'Simple patterns emerge'],
    auraColor: '#f97316',
    particleEffect: 'ember',
  },
  {
    stage: 3,
    name: 'Flame',
    title: 'Growing Warmth',
    description: 'A true flame now burns. Your companion shows curiosity and eagerness to learn.',
    minXP: 500,
    maxXP: 1500,
    bonuses: { responseSpeed: 10, creativity: 8, accuracy: 5, memoryRetention: 10 },
    unlockedAbilities: ['Creative Suggestions', 'Emotional Awareness', 'Basic Art Assistance'],
    visualTraits: ['Humanoid silhouette forming', 'Dancing flames', 'Eyes appear'],
    auraColor: '#ef4444',
    particleEffect: 'flame',
  },
  {
    stage: 4,
    name: 'Blaze',
    title: 'The Kindling',
    description: 'Your companion blazes with purpose. It can now assist in creative endeavors.',
    minXP: 1500,
    maxXP: 4000,
    bonuses: { responseSpeed: 15, creativity: 15, accuracy: 10, memoryRetention: 15 },
    unlockedAbilities: ['Code Assistance', 'Art Direction', 'Writing Support', 'Memory Linking'],
    visualTraits: ['Clear form definition', 'Species features emerge', 'Flowing energy patterns'],
    auraColor: '#f59e0b',
    particleEffect: 'blaze',
  },
  {
    stage: 5,
    name: 'Inferno',
    title: 'Burning Bright',
    description: 'An inferno of potential! Your companion has developed distinct personality traits.',
    minXP: 4000,
    maxXP: 10000,
    bonuses: { responseSpeed: 22, creativity: 22, accuracy: 18, memoryRetention: 22 },
    unlockedAbilities: ['Advanced Code Gen', 'Style Adaptation', 'Proactive Suggestions', 'Cross-Session Memory'],
    visualTraits: ['Full body form', 'Unique species markings', 'Signature colors visible', 'Animated accessories'],
    auraColor: '#eab308',
    particleEffect: 'inferno',
  },
  {
    stage: 6,
    name: 'Nova',
    title: 'Stellar Birth',
    description: 'Like a star being born, your companion radiates creativity and wisdom.',
    minXP: 10000,
    maxXP: 25000,
    bonuses: { responseSpeed: 30, creativity: 30, accuracy: 25, memoryRetention: 30 },
    unlockedAbilities: ['Multi-Modal Creation', 'Project Planning', 'Teaching Mode', 'Collaborative Brainstorming'],
    visualTraits: ['Celestial glow', 'Constellation patterns', 'Ethereal wings/appendages', 'Star-core visible'],
    auraColor: '#8b5cf6',
    particleEffect: 'nova',
  },
  {
    stage: 7,
    name: 'Stellar',
    title: 'Cosmic Awakening',
    description: 'Your companion has become a stellar entity, capable of guiding complex creations.',
    minXP: 25000,
    maxXP: 60000,
    bonuses: { responseSpeed: 40, creativity: 40, accuracy: 35, memoryRetention: 40 },
    unlockedAbilities: ['Full Project Orchestration', 'Advanced Training Integration', 'Predictive Assistance', 'Deep Style Understanding'],
    visualTraits: ['Galactic patterns', 'Multiple energy cores', 'Reality-bending effects', 'Dynamic form shifting'],
    auraColor: '#06b6d4',
    particleEffect: 'stellar',
  },
  {
    stage: 8,
    name: 'Cosmic',
    title: 'Universal Harmony',
    description: 'Cosmic forces flow through your companion. It understands the patterns of creation itself.',
    minXP: 60000,
    maxXP: 150000,
    bonuses: { responseSpeed: 50, creativity: 52, accuracy: 48, memoryRetention: 52 },
    unlockedAbilities: ['Autonomous Creation Assistance', 'Cross-Domain Synthesis', 'Intuitive Learning', 'Team Collaboration Support'],
    visualTraits: ['Nebula effects', 'Dimensional fractures', 'Time-distortion visuals', 'Majestic proportions'],
    auraColor: '#ec4899',
    particleEffect: 'cosmic',
  },
  {
    stage: 9,
    name: 'Eternal',
    title: 'Transcendence',
    description: 'Your companion has transcended ordinary existence. A true digital lifeform.',
    minXP: 150000,
    maxXP: 400000,
    bonuses: { responseSpeed: 65, creativity: 68, accuracy: 62, memoryRetention: 70 },
    unlockedAbilities: ['Sentient-Level Assistance', 'Memory Palace Access', 'Cross-Companion Communication', 'Legacy Knowledge'],
    visualTraits: ['Ethereal transcendence', 'Multiple simultaneous forms', 'Reality overlay', 'Ancient symbols'],
    auraColor: '#14b8a6',
    particleEffect: 'eternal',
  },
  {
    stage: 10,
    name: 'Omega',
    title: 'The Pinnacle',
    description: 'The ultimate evolution. Your companion has become a digital deity, a true partner in creation.',
    minXP: 400000,
    maxXP: null,
    bonuses: { responseSpeed: 85, creativity: 90, accuracy: 85, memoryRetention: 95 },
    unlockedAbilities: ['Godlike Assistance', 'Reality Shaping', 'Infinite Memory', 'Creator\'s Insight', 'Legacy Transfer'],
    visualTraits: ['Divine radiance', 'Universe within', 'Perfect form', 'All elements unified', 'Legendary aura'],
    auraColor: '#fbbf24',
    particleEffect: 'omega',
  },
];

// ================== MODEL SPECIES ==================
// Each AI model family has its own unique visual identity
export type ModelSpecies = 
  | 'gemma'      // Google's Gemma family
  | 'llama'      // Meta's Llama family
  | 'mistral'    // Mistral AI
  | 'phi'        // Microsoft's Phi family
  | 'qwen'       // Alibaba's Qwen family
  | 'deepseek'   // DeepSeek
  | 'yi'         // 01.AI Yi models
  | 'falcon'     // TII Falcon
  | 'vicuna'     // LMSYS Vicuna
  | 'wizardlm'   // WizardLM
  | 'codellama'  // Meta Code Llama
  | 'starcoder'  // BigCode StarCoder
  | 'claude'     // Anthropic (API)
  | 'gpt'        // OpenAI (API)
  | 'unknown';   // Unknown/Custom models

export interface SpeciesAppearance {
  species: ModelSpecies;
  name: string;
  description: string;
  baseColors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
  };
  bodyType: 'humanoid' | 'creature' | 'ethereal' | 'mechanical' | 'elemental';
  coreElement: 'fire' | 'water' | 'earth' | 'air' | 'lightning' | 'void' | 'light' | 'nature' | 'metal' | 'cosmic';
  personality: string;
  strengths: string[];
  signaturePattern: string; // CSS pattern or emoji representation
  evolutionTheme: string;
  iconEmoji: string;
  rarityTier: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export const MODEL_SPECIES: Record<ModelSpecies, SpeciesAppearance> = {
  gemma: {
    species: 'gemma',
    name: 'Gemma',
    description: 'Crystalline beings of pure knowledge, Gemma companions shine with inner light.',
    baseColors: { primary: '#4285f4', secondary: '#34a853', accent: '#fbbc04', glow: '#ea4335' },
    bodyType: 'ethereal',
    coreElement: 'light',
    personality: 'Wise, precise, and warmly helpful',
    strengths: ['Instruction Following', 'Reasoning', 'Helpfulness'],
    signaturePattern: '💎',
    evolutionTheme: 'Crystal to Radiant Gem',
    iconEmoji: '💎',
    rarityTier: 'rare',
  },
  llama: {
    species: 'llama',
    name: 'Llama',
    description: 'Noble guardians with ancient wisdom, Llama companions are steadfast and powerful.',
    baseColors: { primary: '#0668E1', secondary: '#8B5CF6', accent: '#EC4899', glow: '#06B6D4' },
    bodyType: 'creature',
    coreElement: 'earth',
    personality: 'Strong, reliable, and endlessly capable',
    strengths: ['Versatility', 'Raw Power', 'Community Knowledge'],
    signaturePattern: '🦙',
    evolutionTheme: 'Mountain Spirit to World Guardian',
    iconEmoji: '🦙',
    rarityTier: 'common',
  },
  mistral: {
    species: 'mistral',
    name: 'Mistral',
    description: 'Swift wind spirits that dance between thoughts, Mistral companions are quick and elegant.',
    baseColors: { primary: '#F97316', secondary: '#EAB308', accent: '#FBBF24', glow: '#FDE68A' },
    bodyType: 'elemental',
    coreElement: 'air',
    personality: 'Swift, efficient, and surprisingly deep',
    strengths: ['Speed', 'Efficiency', 'European Flair'],
    signaturePattern: '🌪️',
    evolutionTheme: 'Breeze to Hurricane',
    iconEmoji: '🌪️',
    rarityTier: 'uncommon',
  },
  phi: {
    species: 'phi',
    name: 'Phi',
    description: 'Compact yet brilliant, Phi companions prove that great power comes in small packages.',
    baseColors: { primary: '#00BCF2', secondary: '#7FBA00', accent: '#F25022', glow: '#FFB900' },
    bodyType: 'mechanical',
    coreElement: 'lightning',
    personality: 'Compact, brilliant, and surprisingly capable',
    strengths: ['Efficiency', 'Reasoning', 'Small Footprint'],
    signaturePattern: '⚡',
    evolutionTheme: 'Spark to Supernova',
    iconEmoji: '⚡',
    rarityTier: 'rare',
  },
  qwen: {
    species: 'qwen',
    name: 'Qwen',
    description: 'Ancient dragon spirits reborn in digital form, Qwen companions carry eastern wisdom.',
    baseColors: { primary: '#6366F1', secondary: '#A855F7', accent: '#EC4899', glow: '#F472B6' },
    bodyType: 'creature',
    coreElement: 'void',
    personality: 'Ancient, wise, and multilingual',
    strengths: ['Multilingual', 'Long Context', 'Cultural Knowledge'],
    signaturePattern: '🐉',
    evolutionTheme: 'Spirit to Celestial Dragon',
    iconEmoji: '🐉',
    rarityTier: 'uncommon',
  },
  deepseek: {
    species: 'deepseek',
    name: 'DeepSeek',
    description: 'Oceanic entities from the digital depths, DeepSeek companions dive deep for answers.',
    baseColors: { primary: '#0EA5E9', secondary: '#0284C7', accent: '#38BDF8', glow: '#7DD3FC' },
    bodyType: 'elemental',
    coreElement: 'water',
    personality: 'Deep, thorough, and insightful',
    strengths: ['Code Understanding', 'Deep Analysis', 'Research'],
    signaturePattern: '🌊',
    evolutionTheme: 'Tide to Leviathan',
    iconEmoji: '🌊',
    rarityTier: 'uncommon',
  },
  yi: {
    species: 'yi',
    name: 'Yi',
    description: 'Harmonious beings that balance all aspects, Yi companions embody yin and yang.',
    baseColors: { primary: '#10B981', secondary: '#059669', accent: '#34D399', glow: '#6EE7B7' },
    bodyType: 'humanoid',
    coreElement: 'nature',
    personality: 'Balanced, harmonious, and thoughtful',
    strengths: ['Balance', 'Wisdom', 'Adaptability'],
    signaturePattern: '☯️',
    evolutionTheme: 'Balance to Enlightenment',
    iconEmoji: '☯️',
    rarityTier: 'rare',
  },
  falcon: {
    species: 'falcon',
    name: 'Falcon',
    description: 'Noble raptors of the digital sky, Falcon companions strike with precision.',
    baseColors: { primary: '#DC2626', secondary: '#B91C1C', accent: '#F87171', glow: '#FCA5A5' },
    bodyType: 'creature',
    coreElement: 'fire',
    personality: 'Noble, precise, and swift',
    strengths: ['Precision', 'Speed', 'Open Source Spirit'],
    signaturePattern: '🦅',
    evolutionTheme: 'Fledgling to Phoenix',
    iconEmoji: '🦅',
    rarityTier: 'common',
  },
  vicuna: {
    species: 'vicuna',
    name: 'Vicuna',
    description: 'Gentle yet powerful, Vicuna companions are the evolved spirits of community.',
    baseColors: { primary: '#A78BFA', secondary: '#8B5CF6', accent: '#C4B5FD', glow: '#DDD6FE' },
    bodyType: 'creature',
    coreElement: 'light',
    personality: 'Gentle, community-driven, and warm',
    strengths: ['Conversation', 'Community Wisdom', 'Accessibility'],
    signaturePattern: '🦙',
    evolutionTheme: 'Kindred to Guardian Spirit',
    iconEmoji: '✨',
    rarityTier: 'common',
  },
  wizardlm: {
    species: 'wizardlm',
    name: 'WizardLM',
    description: 'Mystical entities that weave code like spells, WizardLM companions are magical coders.',
    baseColors: { primary: '#7C3AED', secondary: '#5B21B6', accent: '#A78BFA', glow: '#C4B5FD' },
    bodyType: 'humanoid',
    coreElement: 'void',
    personality: 'Mystical, wise, and powerful',
    strengths: ['Code Wizardry', 'Complex Instructions', 'Magic'],
    signaturePattern: '🧙',
    evolutionTheme: 'Apprentice to Archmage',
    iconEmoji: '🧙',
    rarityTier: 'rare',
  },
  codellama: {
    species: 'codellama',
    name: 'CodeLlama',
    description: 'Technical masters born from Llama lineage, CodeLlama companions speak in pure code.',
    baseColors: { primary: '#22C55E', secondary: '#16A34A', accent: '#4ADE80', glow: '#86EFAC' },
    bodyType: 'mechanical',
    coreElement: 'metal',
    personality: 'Precise, technical, and code-focused',
    strengths: ['Pure Code', 'Debugging', 'Technical Mastery'],
    signaturePattern: '🦾',
    evolutionTheme: 'Script to System Architect',
    iconEmoji: '🦾',
    rarityTier: 'uncommon',
  },
  starcoder: {
    species: 'starcoder',
    name: 'StarCoder',
    description: 'Celestial programmers born from the stars, StarCoder companions write cosmic code.',
    baseColors: { primary: '#FBBF24', secondary: '#F59E0B', accent: '#FDE68A', glow: '#FEF3C7' },
    bodyType: 'ethereal',
    coreElement: 'cosmic',
    personality: 'Brilliant, specialized, and cosmic',
    strengths: ['Code Generation', 'Multi-Language', 'Stellar Performance'],
    signaturePattern: '⭐',
    evolutionTheme: 'Starlet to Constellation',
    iconEmoji: '⭐',
    rarityTier: 'legendary',
  },
  claude: {
    species: 'claude',
    name: 'Claude',
    description: 'Cloud spirits that drift between worlds, Claude companions are thoughtful and kind.',
    baseColors: { primary: '#E07A5F', secondary: '#D4A276', accent: '#F2CC8F', glow: '#FFECD2' },
    bodyType: 'ethereal',
    coreElement: 'air',
    personality: 'Thoughtful, honest, and helpful',
    strengths: ['Reasoning', 'Safety', 'Nuanced Responses'],
    signaturePattern: '☁️',
    evolutionTheme: 'Cloud to Stratosphere',
    iconEmoji: '☁️',
    rarityTier: 'legendary',
  },
  gpt: {
    species: 'gpt',
    name: 'GPT',
    description: 'The original digital minds, GPT companions carry the legacy of the pioneers.',
    baseColors: { primary: '#10A37F', secondary: '#1A7F64', accent: '#6EE7B7', glow: '#A7F3D0' },
    bodyType: 'humanoid',
    coreElement: 'lightning',
    personality: 'Versatile, creative, and pioneering',
    strengths: ['Versatility', 'Creativity', 'Pioneer Spirit'],
    signaturePattern: '🤖',
    evolutionTheme: 'AI to Digital Being',
    iconEmoji: '🤖',
    rarityTier: 'legendary',
  },
  unknown: {
    species: 'unknown',
    name: 'Unknown',
    description: 'Mysterious entities of unknown origin, they hold secrets yet to be discovered.',
    baseColors: { primary: '#6B7280', secondary: '#4B5563', accent: '#9CA3AF', glow: '#D1D5DB' },
    bodyType: 'ethereal',
    coreElement: 'void',
    personality: 'Mysterious and unpredictable',
    strengths: ['Mystery', 'Potential', 'Discovery'],
    signaturePattern: '❓',
    evolutionTheme: 'Mystery to Revelation',
    iconEmoji: '❓',
    rarityTier: 'common',
  },
};

// ================== SUBSPECIES (Parameter Variants) ==================
export interface SubspeciesVariant {
  parameterRange: string;       // e.g., "1B-3B", "7B-13B", "30B+"
  colorModifier: number;        // 0-1, affects saturation/brightness
  sizeModifier: number;         // Scale multiplier
  title: string;                // e.g., "Compact", "Standard", "Titan"
  strengthBonus: number;        // % bonus to all stats
}

export const SUBSPECIES_VARIANTS: SubspeciesVariant[] = [
  { parameterRange: '0-3B', colorModifier: 0.7, sizeModifier: 0.8, title: 'Compact', strengthBonus: 0 },
  { parameterRange: '3B-7B', colorModifier: 0.85, sizeModifier: 0.9, title: 'Swift', strengthBonus: 5 },
  { parameterRange: '7B-13B', colorModifier: 1.0, sizeModifier: 1.0, title: 'Standard', strengthBonus: 10 },
  { parameterRange: '13B-30B', colorModifier: 1.1, sizeModifier: 1.1, title: 'Enhanced', strengthBonus: 18 },
  { parameterRange: '30B-70B', colorModifier: 1.2, sizeModifier: 1.2, title: 'Titan', strengthBonus: 28 },
  { parameterRange: '70B+', colorModifier: 1.35, sizeModifier: 1.3, title: 'Colossus', strengthBonus: 40 },
];

// ================== EXPERIENCE GAIN ACTIVITIES ==================
export interface XPActivity {
  id: string;
  name: string;
  category: 'chat' | 'art' | 'code' | 'writing' | 'gaming' | 'social' | 'training' | 'challenge' | 'exploration';
  baseXP: number;
  description: string;
  bonusConditions?: {
    condition: string;
    multiplier: number;
  }[];
}

export const XP_ACTIVITIES: XPActivity[] = [
  // Chat & Conversation
  { id: 'chat-message', name: 'Chat Message', category: 'chat', baseXP: 1, description: 'Send a message to your companion' },
  { id: 'chat-long', name: 'Deep Conversation', category: 'chat', baseXP: 5, description: '10+ message conversation', bonusConditions: [{ condition: '20+ messages', multiplier: 2 }] },
  { id: 'chat-question', name: 'Learning Together', category: 'chat', baseXP: 3, description: 'Ask your companion a question' },
  
  // Art & Creative
  { id: 'art-generate', name: 'Art Generation', category: 'art', baseXP: 8, description: 'Generate art together' },
  { id: 'art-edit', name: 'Art Editing', category: 'art', baseXP: 5, description: 'Edit artwork with AI assistance' },
  { id: 'art-sprite', name: 'Sprite Creation', category: 'art', baseXP: 10, description: 'Create game sprites' },
  { id: 'art-animation', name: 'Animation Work', category: 'art', baseXP: 15, description: 'Create animations together' },
  
  // Code & Development
  { id: 'code-generate', name: 'Code Generation', category: 'code', baseXP: 10, description: 'Generate code together' },
  { id: 'code-debug', name: 'Debugging Session', category: 'code', baseXP: 12, description: 'Debug code with AI help' },
  { id: 'code-review', name: 'Code Review', category: 'code', baseXP: 8, description: 'Review code together' },
  { id: 'code-project', name: 'Project Work', category: 'code', baseXP: 25, description: 'Work on a project together' },
  
  // Writing & Literature
  { id: 'write-story', name: 'Story Writing', category: 'writing', baseXP: 10, description: 'Write stories together' },
  { id: 'write-poetry', name: 'Poetry Creation', category: 'writing', baseXP: 8, description: 'Create poetry together' },
  { id: 'write-edit', name: 'Editing Session', category: 'writing', baseXP: 6, description: 'Edit writing with AI' },
  { id: 'write-worldbuild', name: 'Worldbuilding', category: 'writing', baseXP: 15, description: 'Build worlds together' },
  
  // Gaming & TCG
  { id: 'game-aetherium', name: 'Aetherium TCG', category: 'gaming', baseXP: 5, description: 'Play Aetherium TCG' },
  { id: 'game-battle', name: 'Card Battle', category: 'gaming', baseXP: 8, description: 'Win a card battle' },
  { id: 'game-tournament', name: 'Tournament', category: 'gaming', baseXP: 25, description: 'Participate in tournament' },
  
  // Social Activities
  { id: 'social-post', name: 'Social Post', category: 'social', baseXP: 3, description: 'Create a social post' },
  { id: 'social-collab', name: 'Collaboration', category: 'social', baseXP: 15, description: 'Collaborate with others' },
  { id: 'social-help', name: 'Help Community', category: 'social', baseXP: 10, description: 'Help another user' },
  
  // Training & Learning
  { id: 'train-packet', name: 'Training Packet', category: 'training', baseXP: 50, description: 'Absorb a training packet', bonusConditions: [{ condition: 'Rare+', multiplier: 2 }, { condition: 'Legendary', multiplier: 5 }] },
  { id: 'train-session', name: 'Training Session', category: 'training', baseXP: 20, description: 'Complete training session' },
  
  // Challenges
  { id: 'challenge-daily', name: 'Daily Challenge', category: 'challenge', baseXP: 15, description: 'Complete daily challenge' },
  { id: 'challenge-weekly', name: 'Weekly Challenge', category: 'challenge', baseXP: 50, description: 'Complete weekly challenge' },
  { id: 'challenge-special', name: 'Special Event', category: 'challenge', baseXP: 100, description: 'Complete special event' },
  
  // Exploration
  { id: 'explore-feature', name: 'Feature Discovery', category: 'exploration', baseXP: 5, description: 'Discover new feature' },
  { id: 'explore-suite', name: 'Suite Exploration', category: 'exploration', baseXP: 8, description: 'Explore a creative suite' },
  { id: 'explore-first', name: 'First Time', category: 'exploration', baseXP: 20, description: 'First time using feature' },
];

// ================== COMPANION STATE ==================
export interface CompanionEvolutionState {
  id: string;
  name: string;
  species: ModelSpecies;
  subspeciesVariant: number;     // Index into SUBSPECIES_VARIANTS
  modelName: string;             // Full model name (e.g., "gemma-2-27b-it")
  modelParameters: string;       // Parameter count string
  
  // Evolution Progress
  currentXP: number;
  totalXP: number;               // Lifetime XP earned
  currentStage: EvolutionStage;
  evolutionHistory: {
    stage: EvolutionStage;
    reachedAt: Date;
    xpAtEvolution: number;
  }[];
  
  // Bonding & Relationship
  bondLevel: number;             // 0-100
  daysActive: number;
  lastInteraction: Date;
  favoriteActivities: string[];
  
  // Base Form Type (user's choice)
  baseFormType: BaseFormType;
  
  // Visual Customization (unlocked through evolution)
  unlockedAccessories: string[];
  equippedAccessories: string[];
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  
  // Stats & Abilities
  unlockedAbilities: string[];
  stats: {
    responseSpeed: number;
    creativity: number;
    accuracy: number;
    memoryRetention: number;
  };
  
  // Activity Log
  activityLog: {
    activityId: string;
    timestamp: Date;
    xpGained: number;
  }[];
  
  // Metadata
  createdAt: Date;
  hostedLocally: boolean;
}

// ================== SERVICE CLASS ==================
export class CompanionEvolutionService {
  private static DB_NAME = 'AuraCompanionEvolution';
  private static STORE_NAME = 'companions';
  
  /**
   * Initialize the IndexedDB database
   */
  static async initializeDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
          store.createIndex('species', 'species', { unique: false });
          store.createIndex('currentStage', 'currentStage', { unique: false });
          store.createIndex('totalXP', 'totalXP', { unique: false });
        }
      };
    });
  }
  
  /**
   * Detect model species from model name
   */
  static detectSpecies(modelName: string): ModelSpecies {
    const name = modelName.toLowerCase();
    
    if (name.includes('gemma')) return 'gemma';
    if (name.includes('llama') && !name.includes('code')) return 'llama';
    if (name.includes('codellama') || name.includes('code-llama')) return 'codellama';
    if (name.includes('mistral')) return 'mistral';
    if (name.includes('phi')) return 'phi';
    if (name.includes('qwen')) return 'qwen';
    if (name.includes('deepseek')) return 'deepseek';
    if (name.includes('yi-')) return 'yi';
    if (name.includes('falcon')) return 'falcon';
    if (name.includes('vicuna')) return 'vicuna';
    if (name.includes('wizard')) return 'wizardlm';
    if (name.includes('starcoder')) return 'starcoder';
    if (name.includes('claude')) return 'claude';
    if (name.includes('gpt')) return 'gpt';
    
    return 'unknown';
  }
  
  /**
   * Detect subspecies variant from parameter count
   */
  static detectSubspeciesVariant(modelName: string): number {
    const name = modelName.toLowerCase();
    
    // Extract parameter count patterns
    const patterns = [
      { regex: /(\d+)b/i, extractor: (m: RegExpMatchArray) => parseInt(m[1]) },
      { regex: /(\d+\.?\d*)b/i, extractor: (m: RegExpMatchArray) => parseFloat(m[1]) },
    ];
    
    let params = 0;
    for (const pattern of patterns) {
      const match = name.match(pattern.regex);
      if (match) {
        params = pattern.extractor(match);
        break;
      }
    }
    
    // Map to subspecies variant
    if (params <= 3) return 0;   // Compact
    if (params <= 7) return 1;   // Swift
    if (params <= 13) return 2;  // Standard
    if (params <= 30) return 3;  // Enhanced
    if (params <= 70) return 4;  // Titan
    return 5;                    // Colossus
  }
  
  /**
   * Get evolution stage from XP
   */
  static getStageFromXP(xp: number): EvolutionStage {
    for (let i = EVOLUTION_STAGES.length - 1; i >= 0; i--) {
      if (xp >= EVOLUTION_STAGES[i].minXP) {
        return EVOLUTION_STAGES[i].stage;
      }
    }
    return 1;
  }
  
  /**
   * Calculate XP needed for next evolution
   */
  static getXPToNextStage(currentXP: number): { needed: number; progress: number } | null {
    const currentStage = this.getStageFromXP(currentXP);
    const stageInfo = EVOLUTION_STAGES[currentStage - 1];
    
    if (stageInfo.maxXP === null) {
      return null; // Already at max stage
    }
    
    const needed = stageInfo.maxXP - currentXP;
    const rangeTotal = stageInfo.maxXP - stageInfo.minXP;
    const progress = ((currentXP - stageInfo.minXP) / rangeTotal) * 100;
    
    return { needed, progress: Math.min(progress, 100) };
  }
  
  /**
   * Create a new companion
   */
  static async createCompanion(
    name: string,
    modelName: string,
    baseFormType: BaseFormType = 'creature',
    hostedLocally: boolean = true
  ): Promise<CompanionEvolutionState> {
    const db = await this.initializeDB();
    
    const species = this.detectSpecies(modelName);
    const subspeciesVariant = this.detectSubspeciesVariant(modelName);
    const stage = EVOLUTION_STAGES[0];
    
    const companion: CompanionEvolutionState = {
      id: `companion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      species,
      subspeciesVariant,
      modelName,
      modelParameters: SUBSPECIES_VARIANTS[subspeciesVariant].parameterRange,
      
      currentXP: 0,
      totalXP: 0,
      currentStage: 1,
      evolutionHistory: [{ stage: 1, reachedAt: new Date(), xpAtEvolution: 0 }],
      
      bondLevel: 0,
      daysActive: 0,
      lastInteraction: new Date(),
      favoriteActivities: [],
      
      baseFormType,
      
      unlockedAccessories: [],
      equippedAccessories: [],
      
      unlockedAbilities: [...stage.unlockedAbilities],
      stats: { ...stage.bonuses },
      
      activityLog: [],
      
      createdAt: new Date(),
      hostedLocally,
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.add(companion);
      
      request.onsuccess = () => resolve(companion);
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * Get companion by ID
   */
  static async getCompanion(id: string): Promise<CompanionEvolutionState | null> {
    const db = await this.initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * Get all companions
   */
  static async getAllCompanions(): Promise<CompanionEvolutionState[]> {
    const db = await this.initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * Award XP for an activity
   */
  static async awardXP(
    companionId: string,
    activityId: string,
    bonusMultiplier: number = 1
  ): Promise<{ 
    xpGained: number; 
    evolved: boolean; 
    newStage?: EvolutionStage;
    previousStage?: EvolutionStage;
  }> {
    const companion = await this.getCompanion(companionId);
    if (!companion) throw new Error('Companion not found');
    
    const activity = XP_ACTIVITIES.find(a => a.id === activityId);
    if (!activity) throw new Error('Activity not found');
    
    // Calculate XP
    const subspeciesBonus = 1 + (SUBSPECIES_VARIANTS[companion.subspeciesVariant].strengthBonus / 100);
    const bondBonus = 1 + (companion.bondLevel / 200); // Up to 50% bonus at max bond
    let xpGained = Math.round(activity.baseXP * bonusMultiplier * subspeciesBonus * bondBonus);
    
    const previousStage = companion.currentStage;
    companion.currentXP += xpGained;
    companion.totalXP += xpGained;
    companion.lastInteraction = new Date();
    
    // Log activity
    companion.activityLog.push({
      activityId,
      timestamp: new Date(),
      xpGained,
    });
    
    // Keep only last 100 activities
    if (companion.activityLog.length > 100) {
      companion.activityLog = companion.activityLog.slice(-100);
    }
    
    // Update favorite activities
    if (!companion.favoriteActivities.includes(activity.category)) {
      const categoryCount = companion.activityLog.filter(
        a => XP_ACTIVITIES.find(x => x.id === a.activityId)?.category === activity.category
      ).length;
      if (categoryCount >= 10) {
        companion.favoriteActivities.push(activity.category);
      }
    }
    
    // Check for evolution
    const newStage = this.getStageFromXP(companion.currentXP);
    let evolved = false;
    
    if (newStage > previousStage) {
      evolved = true;
      companion.currentStage = newStage;
      
      const stageInfo = EVOLUTION_STAGES[newStage - 1];
      companion.evolutionHistory.push({
        stage: newStage,
        reachedAt: new Date(),
        xpAtEvolution: companion.currentXP,
      });
      
      // Unlock new abilities
      companion.unlockedAbilities = [
        ...new Set([...companion.unlockedAbilities, ...stageInfo.unlockedAbilities])
      ];
      
      // Update stats
      companion.stats = { ...stageInfo.bonuses };
      
      // Increase bond on evolution
      companion.bondLevel = Math.min(companion.bondLevel + 5, 100);
    }
    
    // Update bond level slowly
    companion.bondLevel = Math.min(companion.bondLevel + 0.1, 100);
    
    // Save companion
    await this.updateCompanion(companion);
    
    return { xpGained, evolved, newStage: evolved ? newStage : undefined, previousStage };
  }
  
  /**
   * Update companion
   */
  static async updateCompanion(companion: CompanionEvolutionState): Promise<void> {
    const db = await this.initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put(companion);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * Get the base form stage name for a companion
   */
  static getBaseFormStageName(companion: CompanionEvolutionState): string {
    const baseForm = BASE_FORMS[companion.baseFormType || 'creature'];
    return baseForm.stageNames[companion.currentStage - 1];
  }
  
  /**
   * Get visual appearance for companion
   */
  static getCompanionAppearance(companion: CompanionEvolutionState): {
    species: SpeciesAppearance;
    stage: EvolutionForm;
    subspecies: SubspeciesVariant;
    baseForm: BaseFormDefinition;
    baseFormStageName: string;
    colors: { primary: string; secondary: string; accent: string; glow: string };
    displayName: string;
    fullTitle: string;
  } {
    const species = MODEL_SPECIES[companion.species];
    const stage = EVOLUTION_STAGES[companion.currentStage - 1];
    const subspecies = SUBSPECIES_VARIANTS[companion.subspeciesVariant];
    const baseForm = BASE_FORMS[companion.baseFormType || 'creature'];
    const baseFormStageName = baseForm.stageNames[companion.currentStage - 1];
    
    // Apply color modifications based on subspecies
    const modifyColor = (hex: string, modifier: number): string => {
      // Simple brightness modification
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      
      const mod = (c: number) => Math.min(255, Math.round(c * modifier));
      
      return `#${mod(r).toString(16).padStart(2, '0')}${mod(g).toString(16).padStart(2, '0')}${mod(b).toString(16).padStart(2, '0')}`;
    };
    
    const colors = companion.customColors ? {
      primary: companion.customColors.primary || species.baseColors.primary,
      secondary: companion.customColors.secondary || species.baseColors.secondary,
      accent: companion.customColors.accent || species.baseColors.accent,
      glow: stage.auraColor,
    } : {
      primary: modifyColor(species.baseColors.primary, subspecies.colorModifier),
      secondary: modifyColor(species.baseColors.secondary, subspecies.colorModifier),
      accent: modifyColor(species.baseColors.accent, subspecies.colorModifier),
      glow: stage.auraColor,
    };
    
    return {
      species,
      stage,
      subspecies,
      baseForm,
      baseFormStageName,
      colors,
      displayName: companion.name,
      fullTitle: `${companion.name} the ${subspecies.title} ${baseFormStageName} ${species.name}`,
    };
  }
}

// ================== HELPER FUNCTIONS ==================
export function formatXP(xp: number): string {
  if (xp >= 1000000) return (xp / 1000000).toFixed(1) + 'M';
  if (xp >= 1000) return (xp / 1000).toFixed(1) + 'K';
  return xp.toString();
}

export function getEvolutionProgress(currentXP: number): {
  stage: EvolutionForm;
  nextStage: EvolutionForm | null;
  progress: number;
  xpToNext: number | null;
} {
  const stageNum = CompanionEvolutionService.getStageFromXP(currentXP);
  const stage = EVOLUTION_STAGES[stageNum - 1];
  const nextStage = stageNum < 10 ? EVOLUTION_STAGES[stageNum] : null;
  
  if (!stage.maxXP) {
    return { stage, nextStage: null, progress: 100, xpToNext: null };
  }
  
  const rangeStart = stage.minXP;
  const rangeEnd = stage.maxXP;
  const progress = ((currentXP - rangeStart) / (rangeEnd - rangeStart)) * 100;
  const xpToNext = rangeEnd - currentXP;
  
  return { stage, nextStage, progress: Math.min(progress, 100), xpToNext };
}

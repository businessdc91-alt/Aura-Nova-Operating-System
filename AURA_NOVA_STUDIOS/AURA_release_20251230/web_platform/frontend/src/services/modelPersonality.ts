/**
 * Model Personality System
 * Defines characteristics, strengths, and best-use cases for each AI model
 * Helps users understand which model is right for each task
 */

export type ModelPlatform = 'lm-studio' | 'ollama' | 'gemini' | 'vertex' | 'claude';
export type PerformanceTier = 'ultra-fast' | 'fast' | 'moderate' | 'slow' | 'very-slow';
export type QualityTier = 'experimental' | 'good' | 'excellent' | 'enterprise';
export type CostProfile = 'free' | 'low' | 'moderate' | 'high';

export interface ModelPersonality {
  // Identity
  id: string;
  platform: ModelPlatform;
  friendlyName: string;
  officialName: string;
  
  // Characteristics
  strengths: string[];  // ["Fast", "Lightweight", "Great with code"]
  bestFor: string[];    // ["Quick tasks", "Prototyping", "Components"]
  weaknesses?: string[]; // ["Complex reasoning", "Long context"]
  
  // Performance Profile
  speedTier: PerformanceTier;
  qualityTier: QualityTier;
  costProfile: CostProfile;
  
  // Metrics (actual or estimated)
  avgLatencyMs: number;  // Average time to first token
  costPerMInput?: number; // Cost per million input tokens (or 0 for free)
  costPerMOutput?: number; // Cost per million output tokens
  contextWindow: number; // Max tokens
  
  // Visual Identity
  icon: string;         // Lucide icon name
  color: string;        // Tailwind color for badge
  emoji: string;        // Quick identifier
  
  // Personality
  personality: string;  // "The speedster", "The thinker", etc.
  tagline: string;      // One-liner description
  recommendedFor: string[]; // Task categories
  
  // Capabilities
  canStreamOutput: boolean;
  supportsVision: boolean;
  supportsCodeExecution: boolean;
  maxConcurrentRequests: number;
}

/**
 * Built-in model personalities
 */
export const MODEL_PERSONALITIES: Record<string, ModelPersonality> = {
  'phi': {
    id: 'phi',
    platform: 'lm-studio',
    friendlyName: 'Phi',
    officialName: 'Microsoft Phi 3.5',
    strengths: ['Ultra-fast', 'Lightweight', 'Perfect for local', 'Great for quick snippets'],
    bestFor: ['React components', 'Utility functions', 'Quick prototypes', 'Small features'],
    weaknesses: ['Complex logic', 'Long explanations', 'Advanced reasoning'],
    speedTier: 'ultra-fast',
    qualityTier: 'good',
    costProfile: 'free',
    avgLatencyMs: 200,
    contextWindow: 4096,
    icon: 'Zap',
    color: 'yellow',
    emoji: '⚡',
    personality: 'The Speedster',
    tagline: 'Fast, lightweight, always ready',
    recommendedFor: ['components', 'quick-fixes', 'brainstorming'],
    canStreamOutput: true,
    supportsVision: false,
    supportsCodeExecution: false,
    maxConcurrentRequests: 1,
  },

  'mistral': {
    id: 'mistral',
    platform: 'lm-studio',
    friendlyName: 'Mistral',
    officialName: 'Mistral 7B',
    strengths: ['Balanced', 'Good reasoning', 'Fast enough', 'Code-aware'],
    bestFor: ['Full features', 'Code review', 'Explanations', 'Architecture'],
    weaknesses: ['Not as fast as Phi', 'Limited context'],
    speedTier: 'fast',
    qualityTier: 'excellent',
    costProfile: 'free',
    avgLatencyMs: 400,
    contextWindow: 8192,
    icon: 'Brain',
    color: 'blue',
    emoji: '🧠',
    personality: 'The Balanced Thinker',
    tagline: 'Smart, capable, reliable',
    recommendedFor: ['full-features', 'complex-code', 'explanations'],
    canStreamOutput: true,
    supportsVision: false,
    supportsCodeExecution: false,
    maxConcurrentRequests: 1,
  },

  'neural-chat': {
    id: 'neural-chat',
    platform: 'lm-studio',
    friendlyName: 'Neural Chat',
    officialName: 'Neural Chat 7B v3.2',
    strengths: ['Great conversationalist', 'Natural language', 'Context-aware', 'Empathetic'],
    bestFor: ['Chat', 'Documentation', 'User guidance', 'Descriptions'],
    weaknesses: ['Slower', 'Can be verbose'],
    speedTier: 'moderate',
    qualityTier: 'excellent',
    costProfile: 'free',
    avgLatencyMs: 600,
    contextWindow: 4096,
    icon: 'MessageCircle',
    color: 'purple',
    emoji: '💬',
    personality: 'The Conversationalist',
    tagline: 'Natural, engaging, understanding',
    recommendedFor: ['chat', 'documentation', 'guidance'],
    canStreamOutput: true,
    supportsVision: false,
    supportsCodeExecution: false,
    maxConcurrentRequests: 1,
  },

  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    platform: 'gemini',
    friendlyName: 'Gemini Pro',
    officialName: 'Google Gemini 1.5 Pro',
    strengths: ['Enterprise-grade', 'Fast cloud', 'Large context window', 'Vision capable', 'Multimodal'],
    bestFor: ['Complex projects', 'Large codebases', 'Image analysis', 'Production code'],
    weaknesses: ['Requires API key', 'Cloud-dependent'],
    speedTier: 'fast',
    qualityTier: 'enterprise',
    costProfile: 'moderate',
    avgLatencyMs: 800,
    costPerMInput: 3.5,
    costPerMOutput: 10.5,
    contextWindow: 1000000,
    icon: 'Cloud',
    color: 'cyan',
    emoji: '☁️',
    personality: 'The Cloud Professional',
    tagline: 'Powerful, reliable, enterprise-ready',
    recommendedFor: ['production', 'complex-code', 'large-projects', 'vision'],
    canStreamOutput: true,
    supportsVision: true,
    supportsCodeExecution: false,
    maxConcurrentRequests: 30,
  },

  'claude-3.5-sonnet': {
    id: 'claude-3.5-sonnet',
    platform: 'claude',
    friendlyName: 'Claude Sonnet',
    officialName: 'Anthropic Claude 3.5 Sonnet',
    strengths: ['Best reasoning', 'Excellent writer', 'Safe by default', 'Long context', 'Nuanced'],
    bestFor: ['Complex reasoning', 'Writing', 'Architecture', 'Safety-critical'],
    weaknesses: ['Slower', 'Higher cost'],
    speedTier: 'moderate',
    qualityTier: 'enterprise',
    costProfile: 'high',
    avgLatencyMs: 1200,
    costPerMInput: 3.0,
    costPerMOutput: 15.0,
    contextWindow: 200000,
    icon: 'Sparkles',
    color: 'orange',
    emoji: '✨',
    personality: 'The Master Craftsperson',
    tagline: 'Thoughtful, nuanced, deeply capable',
    recommendedFor: ['complex-reasoning', 'writing', 'architecture', 'safety'],
    canStreamOutput: true,
    supportsVision: false,
    supportsCodeExecution: false,
    maxConcurrentRequests: 10,
  },

  'llama-2-13b': {
    id: 'llama-2-13b',
    platform: 'ollama',
    friendlyName: 'Llama 2',
    officialName: 'Meta Llama 2 13B',
    strengths: ['Solid performer', 'Good code', 'Friendly output', 'Open source'],
    bestFor: ['General tasks', 'Code', 'Conversation', 'Learning'],
    weaknesses: ['Not specialized', 'Context limited'],
    speedTier: 'moderate',
    qualityTier: 'good',
    costProfile: 'free',
    avgLatencyMs: 800,
    contextWindow: 4096,
    icon: 'Flame',
    color: 'red',
    emoji: '🔥',
    personality: 'The Generalist',
    tagline: 'Solid, reliable, open source',
    recommendedFor: ['general-tasks', 'code', 'learning'],
    canStreamOutput: true,
    supportsVision: false,
    supportsCodeExecution: false,
    maxConcurrentRequests: 1,
  },
};

/**
 * Get personality for a model
 */
export function getModelPersonality(modelId: string): ModelPersonality | undefined {
  return MODEL_PERSONALITIES[modelId];
}

/**
 * Get all personalities
 */
export function getAllPersonalities(): ModelPersonality[] {
  return Object.values(MODEL_PERSONALITIES);
}

/**
 * Recommend best model for a task
 */
export interface TaskProfile {
  complexity: 'simple' | 'moderate' | 'complex';
  urgency: 'low' | 'medium' | 'high';
  type: string; // 'code' | 'writing' | 'analysis' | 'chat'
  budget?: 'free-only' | 'low-budget' | 'flexible';
}

export function recommendModel(task: TaskProfile): string {
  const { complexity, urgency, type, budget = 'flexible' } = task;

  // Speed prioritized (high urgency)
  if (urgency === 'high') {
    return 'phi'; // Fastest local option
  }

  // Free only
  if (budget === 'free-only') {
    if (complexity === 'complex' && type === 'code') return 'mistral';
    if (type === 'chat') return 'neural-chat';
    return 'phi';
  }

  // Complex reasoning tasks
  if (complexity === 'complex') {
    if (type === 'writing' || type === 'analysis') return 'claude-3.5-sonnet';
    if (type === 'code') return 'gemini-1.5-pro';
    return 'mistral';
  }

  // Moderate complexity
  if (complexity === 'moderate') {
    if (type === 'code') return 'mistral';
    if (type === 'chat') return 'neural-chat';
    return 'phi';
  }

  // Simple tasks - always fast
  return 'phi';
}

/**
 * Compare two models
 */
export interface ModelComparison {
  model1: ModelPersonality;
  model2: ModelPersonality;
  speedWinner: string; // Model ID
  qualityWinner: string; // Model ID
  costWinner: string; // Model ID
  overallWinner: string; // Model ID (based on balanced score)
  reasoning: string;
}

export function compareModels(id1: string, id2: string): ModelComparison | null {
  const m1 = getModelPersonality(id1);
  const m2 = getModelPersonality(id2);

  if (!m1 || !m2) return null;

  // Speed scoring (lower latency is better)
  const speedScores: Record<PerformanceTier, number> = {
    'ultra-fast': 10,
    'fast': 8,
    'moderate': 5,
    'slow': 2,
    'very-slow': 1,
  };

  const qualityScores: Record<QualityTier, number> = {
    'experimental': 3,
    'good': 6,
    'excellent': 8,
    'enterprise': 10,
  };

  const costScores: Record<CostProfile, number> = {
    'free': 10,
    'low': 7,
    'moderate': 5,
    'high': 2,
  };

  const speed1 = speedScores[m1.speedTier];
  const speed2 = speedScores[m2.speedTier];
  const quality1 = qualityScores[m1.qualityTier];
  const quality2 = qualityScores[m2.qualityTier];
  const cost1 = costScores[m1.costProfile];
  const cost2 = costScores[m2.costProfile];

  // Balanced score
  const balanced1 = (speed1 + quality1 + cost1) / 3;
  const balanced2 = (speed2 + quality2 + cost2) / 3;

  return {
    model1: m1,
    model2: m2,
    speedWinner: speed1 > speed2 ? id1 : id2,
    qualityWinner: quality1 > quality2 ? id1 : id2,
    costWinner: cost1 > cost2 ? id1 : id2,
    overallWinner: balanced1 > balanced2 ? id1 : id2,
    reasoning: `${m1.friendlyName} scores ${balanced1.toFixed(1)}/10 overall, ${m2.friendlyName} scores ${balanced2.toFixed(1)}/10. ${balanced1 > balanced2 ? m1.friendlyName : m2.friendlyName} is the better choice for this scenario.`,
  };
}

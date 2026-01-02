// ============================================================================
// API SERVICE COST MANAGER
// ============================================================================
// Manages the cost system for API-dependent functions
// 
// CORE PHILOSOPHY:
// - Cloud API calls (Vertex, Gemini, OpenAI, etc.) cost 100 Aether Coins
// - Local LLM usage is FREE and encouraged
// - Each function gets a limited number of free daily uses
// - This creates incentive to:
//   1. Play the game to earn coins
//   2. Set up local LLMs for unlimited free access
//   3. Be thoughtful about cloud API usage
// ============================================================================

import { getWallet, spendCoins, earnCoins } from './currencyService';

// ================== TYPES ==================
export type ServiceProvider = 
  | 'vertex'       // Google Vertex AI
  | 'gemini'       // Google Gemini API
  | 'openai'       // OpenAI API (ChatGPT, DALL-E, etc.)
  | 'anthropic'    // Claude API
  | 'mistral'      // Mistral AI
  | 'replicate'    // Replicate.com
  | 'stability'    // Stability AI
  | 'midjourney'   // Midjourney
  | 'local';       // Local LLM (FREE!)

export type FunctionCategory = 
  | 'chat'           // General chat/conversation
  | 'code-gen'       // Code generation
  | 'code-review'    // Code review/analysis
  | 'image-gen'      // Image generation
  | 'image-edit'     // Image editing
  | 'music-gen'      // Music generation
  | 'voice-synth'    // Voice synthesis
  | 'translation'    // Translation
  | 'summarization'  // Text summarization
  | 'analysis'       // Data/text analysis
  | 'embedding'      // Vector embeddings
  | 'game-ai';       // Game AI opponents

export interface APIFunction {
  id: string;
  name: string;
  description: string;
  category: FunctionCategory;
  defaultProvider: ServiceProvider;
  allowLocalOverride: boolean;
  costPerUse: number;           // Coins if using cloud API
  freeUsesPerDay: number;
  cooldownMinutes: number;      // Minimum time between uses (0 = no cooldown)
}

export interface FunctionUsage {
  functionId: string;
  date: string;              // YYYY-MM-DD
  cloudUses: number;
  localUses: number;
  lastUsedAt?: string;
}

export interface UserProviderConfig {
  preferLocal: boolean;
  localEndpoint?: string;     // e.g., 'http://localhost:1234/v1'
  localModelName?: string;    // e.g., 'mistral-7b-instruct'
  apiKeys?: Partial<Record<ServiceProvider, string>>;
}

// ================== CONSTANTS ==================
export const CLOUD_API_COST = 100; // Coins per cloud API call
export const LOCAL_COST = 0;       // Local is FREE

// ================== FUNCTION REGISTRY ==================
export const API_FUNCTIONS: APIFunction[] = [
  // ====== CHAT FUNCTIONS ======
  {
    id: 'chat-general',
    name: 'General Chat',
    description: 'General conversation with AI assistant',
    category: 'chat',
    defaultProvider: 'local',
    allowLocalOverride: true,
    costPerUse: CLOUD_API_COST,
    freeUsesPerDay: 10,
    cooldownMinutes: 0,
  },
  {
    id: 'chat-expert',
    name: 'Expert Consultation',
    description: 'Deep expert-level consultation on specific topics',
    category: 'chat',
    defaultProvider: 'gemini',
    allowLocalOverride: true,
    costPerUse: CLOUD_API_COST,
    freeUsesPerDay: 3,
    cooldownMinutes: 1,
  },

  // ====== CODE FUNCTIONS ======
  {
    id: 'code-generate',
    name: 'Code Generation',
    description: 'Generate code from natural language descriptions',
    category: 'code-gen',
    defaultProvider: 'local',
    allowLocalOverride: true,
    costPerUse: CLOUD_API_COST,
    freeUsesPerDay: 15,
    cooldownMinutes: 0,
  },
  {
    id: 'code-complete',
    name: 'Code Completion',
    description: 'Autocomplete code as you type',
    category: 'code-gen',
    defaultProvider: 'local',
    allowLocalOverride: true,
    costPerUse: CLOUD_API_COST,
    freeUsesPerDay: 50,
    cooldownMinutes: 0,
  },
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'AI-powered code review and suggestions',
    category: 'code-review',
    defaultProvider: 'local',
    allowLocalOverride: true,
    costPerUse: CLOUD_API_COST,
    freeUsesPerDay: 5,
    cooldownMinutes: 0,
  },
  {
    id: 'code-debug',
    name: 'Debugging Assistant',
    description: 'Help debug and fix code issues',
    category: 'code-review',
    defaultProvider: 'local',
    allowLocalOverride: true,
    costPerUse: CLOUD_API_COST,
    freeUsesPerDay: 10,
    cooldownMinutes: 0,
  },
  {
    id: 'code-explain',
    name: 'Code Explanation',
    description: 'Explain what code does in plain language',
    category: 'analysis',
    defaultProvider: 'local',
    allowLocalOverride: true,
    costPerUse: CLOUD_API_COST,
    freeUsesPerDay: 20,
    cooldownMinutes: 0,
  },

  // ====== IMAGE FUNCTIONS ======
  {
    id: 'image-generate',
    name: 'Image Generation',
    description: 'Generate images from text descriptions',
    category: 'image-gen',
    defaultProvider: 'stability',
    allowLocalOverride: true, // Can use Stable Diffusion locally
    costPerUse: CLOUD_API_COST * 2, // 200 coins - more expensive
    freeUsesPerDay: 3,
    cooldownMinutes: 1,
  },
  {
    id: 'image-edit',
    name: 'Image Editing',
    description: 'AI-powered image editing and manipulation',
    category: 'image-edit',
    defaultProvider: 'stability',
    allowLocalOverride: true,
    costPerUse: CLOUD_API_COST,
    freeUsesPerDay: 5,
    cooldownMinutes: 0,
  },
  {
    id: 'image-upscale',
    name: 'Image Upscaling',
    description: 'Upscale and enhance image resolution',
    category: 'image-edit',
    defaultProvider: 'replicate',
    allowLocalOverride: true,
    costPerUse: 50, // Cheaper
    freeUsesPerDay: 10,
    cooldownMinutes: 0,
  },

  // ====== MUSIC FUNCTIONS ======
  {
    id: 'music-generate',
    name: 'Music Generation',
    description: 'Generate music from descriptions',
    category: 'music-gen',
    defaultProvider: 'replicate',
    allowLocalOverride: false, // Needs cloud for now
    costPerUse: CLOUD_API_COST * 3, // 300 coins - expensive
    freeUsesPerDay: 2,
    cooldownMinutes: 5,
  },
  {
    id: 'music-accompany',
    name: 'Accompaniment Generation',
    description: 'Generate backing tracks and accompaniments',
    category: 'music-gen',
    defaultProvider: 'replicate',
    allowLocalOverride: false,
    costPerUse: CLOUD_API_COST * 2,
    freeUsesPerDay: 3,
    cooldownMinutes: 2,
  },

  // ====== VOICE FUNCTIONS ======
  {
    id: 'voice-tts',
    name: 'Text to Speech',
    description: 'Convert text to natural speech',
    category: 'voice-synth',
    defaultProvider: 'openai',
    allowLocalOverride: true, // Can use Coqui locally
    costPerUse: 50,
    freeUsesPerDay: 20,
    cooldownMinutes: 0,
  },
  {
    id: 'voice-clone',
    name: 'Voice Cloning',
    description: 'Clone voices for custom TTS',
    category: 'voice-synth',
    defaultProvider: 'replicate',
    allowLocalOverride: true,
    costPerUse: CLOUD_API_COST * 2,
    freeUsesPerDay: 2,
    cooldownMinutes: 5,
  },

  // ====== TRANSLATION FUNCTIONS ======
  {
    id: 'translate-text',
    name: 'Text Translation',
    description: 'Translate text between languages',
    category: 'translation',
    defaultProvider: 'local',
    allowLocalOverride: true,
    costPerUse: 25,
    freeUsesPerDay: 30,
    cooldownMinutes: 0,
  },

  // ====== ANALYSIS FUNCTIONS ======
  {
    id: 'summarize',
    name: 'Text Summarization',
    description: 'Summarize long documents',
    category: 'summarization',
    defaultProvider: 'local',
    allowLocalOverride: true,
    costPerUse: 50,
    freeUsesPerDay: 10,
    cooldownMinutes: 0,
  },
  {
    id: 'analyze-sentiment',
    name: 'Sentiment Analysis',
    description: 'Analyze emotional tone of text',
    category: 'analysis',
    defaultProvider: 'local',
    allowLocalOverride: true,
    costPerUse: 25,
    freeUsesPerDay: 20,
    cooldownMinutes: 0,
  },

  // ====== EMBEDDING FUNCTIONS ======
  {
    id: 'embed-text',
    name: 'Text Embeddings',
    description: 'Generate vector embeddings for semantic search',
    category: 'embedding',
    defaultProvider: 'local',
    allowLocalOverride: true,
    costPerUse: 10,
    freeUsesPerDay: 100,
    cooldownMinutes: 0,
  },

  // ====== GAME AI FUNCTIONS ======
  {
    id: 'game-ai-easy',
    name: 'Game AI (Easy)',
    description: 'Easy difficulty AI opponent',
    category: 'game-ai',
    defaultProvider: 'local',
    allowLocalOverride: true,
    costPerUse: 0, // Always free - uses local algorithms
    freeUsesPerDay: 999,
    cooldownMinutes: 0,
  },
  {
    id: 'game-ai-medium',
    name: 'Game AI (Medium)',
    description: 'Medium difficulty AI opponent',
    category: 'game-ai',
    defaultProvider: 'local',
    allowLocalOverride: true,
    costPerUse: 0,
    freeUsesPerDay: 999,
    cooldownMinutes: 0,
  },
  {
    id: 'game-ai-hard',
    name: 'Game AI (Hard)',
    description: 'Hard difficulty AI opponent - uses advanced LLM reasoning',
    category: 'game-ai',
    defaultProvider: 'local',
    allowLocalOverride: true,
    costPerUse: 50, // Costs coins if using cloud for hard AI
    freeUsesPerDay: 10,
    cooldownMinutes: 0,
  },
];

// ================== LOCAL STORAGE KEYS ==================
const USAGE_KEY = 'aura_nova_api_usage';
const CONFIG_KEY = 'aura_nova_provider_config';

// ================== USAGE TRACKING ==================
function getUsageData(): FunctionUsage[] {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(USAGE_KEY);
  if (!stored) return [];
  
  return JSON.parse(stored);
}

function saveUsageData(usage: FunctionUsage[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getUsageForFunction(functionId: string): FunctionUsage {
  const today = getTodayString();
  const allUsage = getUsageData();
  
  let usage = allUsage.find(u => u.functionId === functionId && u.date === today);
  
  if (!usage) {
    usage = {
      functionId,
      date: today,
      cloudUses: 0,
      localUses: 0,
    };
  }
  
  return usage;
}

function incrementUsage(functionId: string, isLocal: boolean): void {
  const today = getTodayString();
  const allUsage = getUsageData();
  
  const index = allUsage.findIndex(u => u.functionId === functionId && u.date === today);
  
  if (index >= 0) {
    if (isLocal) {
      allUsage[index].localUses++;
    } else {
      allUsage[index].cloudUses++;
    }
    allUsage[index].lastUsedAt = new Date().toISOString();
  } else {
    allUsage.push({
      functionId,
      date: today,
      cloudUses: isLocal ? 0 : 1,
      localUses: isLocal ? 1 : 0,
      lastUsedAt: new Date().toISOString(),
    });
  }
  
  saveUsageData(allUsage);
}

// ================== PROVIDER CONFIG ==================
export function getUserProviderConfig(): UserProviderConfig {
  if (typeof window === 'undefined') {
    return { preferLocal: true };
  }
  
  const stored = localStorage.getItem(CONFIG_KEY);
  if (!stored) {
    return { preferLocal: true };
  }
  
  return JSON.parse(stored);
}

export function setUserProviderConfig(config: Partial<UserProviderConfig>): void {
  const current = getUserProviderConfig();
  const updated = { ...current, ...config };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
  }
}

export function isLocalLLMConfigured(): boolean {
  const config = getUserProviderConfig();
  return !!(config.localEndpoint && config.localModelName);
}

// ================== MAIN API CALL HANDLER ==================
export interface APICallResult {
  allowed: boolean;
  isLocal: boolean;
  cost: number;
  message: string;
  remainingFreeUses: number;
}

export function canUseFunction(functionId: string, forceCloud: boolean = false): APICallResult {
  const func = API_FUNCTIONS.find(f => f.id === functionId);
  if (!func) {
    return {
      allowed: false,
      isLocal: false,
      cost: 0,
      message: 'Unknown function',
      remainingFreeUses: 0,
    };
  }
  
  const config = getUserProviderConfig();
  const usage = getUsageForFunction(functionId);
  const wallet = getWallet('default-user');
  
  // Check cooldown
  if (func.cooldownMinutes > 0 && usage.lastUsedAt) {
    const lastUsed = new Date(usage.lastUsedAt);
    const cooldownEnd = new Date(lastUsed.getTime() + func.cooldownMinutes * 60 * 1000);
    if (new Date() < cooldownEnd) {
      const remainingSeconds = Math.ceil((cooldownEnd.getTime() - Date.now()) / 1000);
      return {
        allowed: false,
        isLocal: false,
        cost: 0,
        message: `Cooldown: ${remainingSeconds}s remaining`,
        remainingFreeUses: func.freeUsesPerDay - usage.cloudUses,
      };
    }
  }
  
  // Determine if using local or cloud
  const useLocal = !forceCloud && config.preferLocal && func.allowLocalOverride && isLocalLLMConfigured();
  
  if (useLocal) {
    // Local is always free!
    return {
      allowed: true,
      isLocal: true,
      cost: 0,
      message: `Using local LLM - FREE! 🏠`,
      remainingFreeUses: func.freeUsesPerDay - usage.cloudUses,
    };
  }
  
  // Cloud API
  const totalCloudUses = usage.cloudUses;
  const remainingFree = func.freeUsesPerDay - totalCloudUses;
  
  if (remainingFree > 0) {
    // Free daily use available
    return {
      allowed: true,
      isLocal: false,
      cost: 0,
      message: `Free daily use (${remainingFree - 1} remaining after this)`,
      remainingFreeUses: remainingFree - 1,
    };
  }
  
  // Must pay coins
  if (wallet.aetherCoins >= func.costPerUse) {
    return {
      allowed: true,
      isLocal: false,
      cost: func.costPerUse,
      message: `Costs ${func.costPerUse} Aether Coins`,
      remainingFreeUses: 0,
    };
  }
  
  // Not enough coins
  return {
    allowed: false,
    isLocal: false,
    cost: func.costPerUse,
    message: `Insufficient coins! Need ${func.costPerUse}, have ${wallet.aetherCoins}. 💡 Set up a local LLM for free access!`,
    remainingFreeUses: 0,
  };
}

export function executeFunction(functionId: string, forceCloud: boolean = false): {
  success: boolean;
  message: string;
  isLocal: boolean;
  coinsSpent: number;
} {
  const check = canUseFunction(functionId, forceCloud);
  
  if (!check.allowed) {
    return {
      success: false,
      message: check.message,
      isLocal: false,
      coinsSpent: 0,
    };
  }
  
  // Deduct coins if needed
  if (check.cost > 0) {
    const spendResult = spendCoins('default-user', check.cost, 'api', `API: ${functionId}`);
    if (!spendResult.success) {
      return {
        success: false,
        message: spendResult.message,
        isLocal: false,
        coinsSpent: 0,
      };
    }
  }
  
  // Track usage
  incrementUsage(functionId, check.isLocal);
  
  return {
    success: true,
    message: check.isLocal 
      ? '✅ Using local LLM - No coins spent!' 
      : check.cost > 0 
        ? `✅ Used ${check.cost} coins for cloud API` 
        : '✅ Free daily use consumed',
    isLocal: check.isLocal,
    coinsSpent: check.cost,
  };
}

// ================== STATISTICS ==================
export function getDailyAPIStats(): {
  totalCloudCalls: number;
  totalLocalCalls: number;
  totalCoinsSpent: number;
  functionBreakdown: { functionId: string; name: string; cloudUses: number; localUses: number }[];
  savingsFromLocal: number;
} {
  const today = getTodayString();
  const allUsage = getUsageData().filter(u => u.date === today);
  
  let totalCloudCalls = 0;
  let totalLocalCalls = 0;
  let totalCoinsSpent = 0;
  const functionBreakdown: { functionId: string; name: string; cloudUses: number; localUses: number }[] = [];
  let savingsFromLocal = 0;
  
  for (const usage of allUsage) {
    const func = API_FUNCTIONS.find(f => f.id === usage.functionId);
    if (!func) continue;
    
    totalCloudCalls += usage.cloudUses;
    totalLocalCalls += usage.localUses;
    
    // Calculate coins spent (cloud uses beyond free tier)
    const paidCalls = Math.max(0, usage.cloudUses - func.freeUsesPerDay);
    totalCoinsSpent += paidCalls * func.costPerUse;
    
    // Calculate savings from local usage
    savingsFromLocal += usage.localUses * func.costPerUse;
    
    functionBreakdown.push({
      functionId: usage.functionId,
      name: func.name,
      cloudUses: usage.cloudUses,
      localUses: usage.localUses,
    });
  }
  
  return {
    totalCloudCalls,
    totalLocalCalls,
    totalCoinsSpent,
    functionBreakdown,
    savingsFromLocal,
  };
}

export function getFunctionStatus(functionId: string): {
  function: APIFunction | undefined;
  usage: FunctionUsage;
  remainingFreeUses: number;
  isLocalAvailable: boolean;
  nextCost: number;
} {
  const func = API_FUNCTIONS.find(f => f.id === functionId);
  const usage = getUsageForFunction(functionId);
  const config = getUserProviderConfig();
  
  const remainingFreeUses = func ? Math.max(0, func.freeUsesPerDay - usage.cloudUses) : 0;
  const isLocalAvailable = !!(func?.allowLocalOverride && config.preferLocal && isLocalLLMConfigured());
  const nextCost = isLocalAvailable ? 0 : (remainingFreeUses > 0 ? 0 : (func?.costPerUse || 0));
  
  return {
    function: func,
    usage,
    remainingFreeUses,
    isLocalAvailable,
    nextCost,
  };
}

// ================== LOCAL LLM SETUP HELPERS ==================
export interface LocalLLMProvider {
  id: string;
  name: string;
  description: string;
  website: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  platforms: ('windows' | 'mac' | 'linux')[];
  defaultEndpoint: string;
  setupSteps: string[];
  recommendedModels: string[];
}

export const LOCAL_LLM_PROVIDERS: LocalLLMProvider[] = [
  {
    id: 'lm-studio',
    name: 'LM Studio',
    description: 'User-friendly GUI for running local LLMs. Perfect for beginners!',
    website: 'https://lmstudio.ai',
    difficulty: 'easy',
    platforms: ['windows', 'mac', 'linux'],
    defaultEndpoint: 'http://localhost:1234/v1',
    setupSteps: [
      'Download LM Studio from lmstudio.ai',
      'Install and launch the application',
      'Search for a model (e.g., "Mistral 7B Instruct")',
      'Click Download on your chosen model',
      'Go to the Server tab and click Start Server',
      'Configure Aura Nova to use endpoint: http://localhost:1234/v1',
    ],
    recommendedModels: [
      'mistral-7b-instruct-v0.2',
      'codellama-13b-instruct',
      'deepseek-coder-6.7b-instruct',
      'neural-chat-7b-v3-1',
    ],
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: 'Simple CLI tool for running LLMs. Great for developers!',
    website: 'https://ollama.ai',
    difficulty: 'easy',
    platforms: ['windows', 'mac', 'linux'],
    defaultEndpoint: 'http://localhost:11434/v1',
    setupSteps: [
      'Download Ollama from ollama.ai',
      'Install and run the application',
      'Open terminal and run: ollama pull mistral',
      'Run: ollama serve (keeps server running)',
      'Configure Aura Nova to use endpoint: http://localhost:11434/v1',
    ],
    recommendedModels: [
      'mistral',
      'codellama',
      'deepseek-coder',
      'llama2',
      'neural-chat',
    ],
  },
  {
    id: 'text-generation-webui',
    name: 'Text Generation WebUI',
    description: 'Feature-rich interface with many model formats. For power users.',
    website: 'https://github.com/oobabooga/text-generation-webui',
    difficulty: 'medium',
    platforms: ['windows', 'mac', 'linux'],
    defaultEndpoint: 'http://localhost:5000/v1',
    setupSteps: [
      'Clone the repository from GitHub',
      'Run the start script for your OS',
      'Download a model through the interface',
      'Enable the OpenAI API extension',
      'Configure Aura Nova to use endpoint: http://localhost:5000/v1',
    ],
    recommendedModels: [
      'TheBloke/Mistral-7B-Instruct-v0.2-GPTQ',
      'TheBloke/CodeLlama-13B-Instruct-GPTQ',
      'TheBloke/deepseek-coder-6.7B-instruct-GPTQ',
    ],
  },
  {
    id: 'jan',
    name: 'Jan',
    description: 'Open-source ChatGPT alternative. Very user-friendly!',
    website: 'https://jan.ai',
    difficulty: 'easy',
    platforms: ['windows', 'mac', 'linux'],
    defaultEndpoint: 'http://localhost:1337/v1',
    setupSteps: [
      'Download Jan from jan.ai',
      'Install and launch the application',
      'Go to Hub and download a model',
      'Enable Local API Server in settings',
      'Configure Aura Nova to use endpoint: http://localhost:1337/v1',
    ],
    recommendedModels: [
      'mistral-instruct-7b-q4',
      'codellama-7b-instruct',
      'tinyllama-1.1b',
    ],
  },
  {
    id: 'llamacpp',
    name: 'llama.cpp',
    description: 'Lightweight C++ inference. Maximum performance for experts.',
    website: 'https://github.com/ggerganov/llama.cpp',
    difficulty: 'advanced',
    platforms: ['windows', 'mac', 'linux'],
    defaultEndpoint: 'http://localhost:8080/v1',
    setupSteps: [
      'Clone and compile llama.cpp',
      'Download a GGUF model file',
      'Run: ./server -m model.gguf --port 8080',
      'Configure Aura Nova to use endpoint: http://localhost:8080/v1',
    ],
    recommendedModels: [
      'mistral-7b-instruct-v0.2.Q4_K_M.gguf',
      'codellama-13b-instruct.Q4_K_M.gguf',
      'deepseek-coder-6.7b-instruct.Q4_K_M.gguf',
    ],
  },
];

export function getRecommendedProvider(): LocalLLMProvider {
  // Return easiest option
  return LOCAL_LLM_PROVIDERS.find(p => p.difficulty === 'easy') || LOCAL_LLM_PROVIDERS[0];
}

// ================== EXPORTS ==================
export const APICostService = {
  canUseFunction,
  executeFunction,
  getDailyAPIStats,
  getFunctionStatus,
  getUserProviderConfig,
  setUserProviderConfig,
  isLocalLLMConfigured,
  getRecommendedProvider,
  API_FUNCTIONS,
  LOCAL_LLM_PROVIDERS,
  CLOUD_API_COST,
  LOCAL_COST,
};

export default APICostService;

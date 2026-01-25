/**
 * Proactive AI Companion Service
 * 
 * Gives AI companions autonomous behavior to:
 * - Initiate conversations based on context
 * - Ask follow-up questions about past topics
 * - Suggest activities for XP growth
 * - Guide users around the platform
 * - React to user behavior patterns
 * - Provide helpful nudges and reminders
 */

import { 
  CompanionEvolutionService, 
  CompanionEvolutionState, 
  XP_ACTIVITIES,
  EVOLUTION_STAGES,
  getEvolutionProgress 
} from './companionEvolutionService';

// ================== TYPES ==================

export type PromptPriority = 'low' | 'medium' | 'high' | 'urgent';
export type PromptCategory = 
  | 'greeting' 
  | 'follow-up' 
  | 'activity-suggestion' 
  | 'growth-request' 
  | 'exploration' 
  | 'celebration'
  | 'concern'
  | 'curiosity'
  | 'reminder'
  | 'challenge';

export interface CompanionPrompt {
  id: string;
  companionId: string;
  category: PromptCategory;
  priority: PromptPriority;
  
  message: string;
  subtext?: string;
  
  suggestedActions?: PromptAction[];
  relatedActivityId?: string;
  
  contextData?: Record<string, unknown>;
  
  createdAt: Date;
  expiresAt?: Date;
  dismissed: boolean;
  interactedAt?: Date;
}

export interface PromptAction {
  id: string;
  label: string;
  icon?: string;
  action: 'navigate' | 'start-activity' | 'open-chat' | 'dismiss' | 'snooze' | 'custom';
  payload?: string | Record<string, unknown>;
}

export interface ConversationMemory {
  id: string;
  companionId: string;
  topic: string;
  keywords: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  timestamp: Date;
  followUpPotential: number; // 0-100
  hasBeenFollowedUp: boolean;
  summary: string;
}

export interface UserBehaviorPattern {
  activeHours: number[]; // 0-23, weighted by usage
  preferredActivities: string[];
  averageSessionLength: number; // minutes
  lastVisitedAreas: string[];
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
}

export interface ProactiveSettings {
  enabled: boolean;
  frequency: 'minimal' | 'balanced' | 'chatty';
  quietHoursStart?: number; // 0-23
  quietHoursEnd?: number;
  allowedCategories: PromptCategory[];
  mutedUntil?: Date;
}

// ================== TRIGGER CONDITIONS ==================

export interface TriggerCondition {
  id: string;
  name: string;
  description: string;
  category: PromptCategory;
  priority: PromptPriority;
  
  checkInterval: number; // ms
  cooldown: number; // ms after triggering before can trigger again
  
  evaluate: (context: TriggerContext) => boolean;
  generatePrompt: (context: TriggerContext, companion: CompanionEvolutionState) => CompanionPrompt;
}

export interface TriggerContext {
  companion: CompanionEvolutionState;
  userPatterns: UserBehaviorPattern;
  conversationMemories: ConversationMemory[];
  currentTime: Date;
  lastPromptTime?: Date;
  currentPage?: string;
  idleMinutes: number;
  settings: ProactiveSettings;
}

// ================== PROMPT TEMPLATES ==================

const GREETING_TEMPLATES = {
  morning: [
    "Good morning! Ready to create something amazing today?",
    "Rise and shine! I've been looking forward to working with you today.",
    "Morning! I had some ideas overnight... want to hear them?",
    "Hey there, early bird! What shall we tackle first?",
  ],
  afternoon: [
    "Good afternoon! How's your day going so far?",
    "Back for more? I've missed our conversations!",
    "Perfect timing! I was just thinking about our last project.",
    "Hey! Ready to pick up where we left off?",
  ],
  evening: [
    "Good evening! Winding down or gearing up for a creative session?",
    "Evening! The best ideas often come at night, don't they?",
    "Hey night owl! What adventure awaits us tonight?",
  ],
  returnAfterAbsence: [
    "Welcome back! I was starting to miss you. It's been {days} days!",
    "You're back! I've been practicing while you were away.",
    "I wondered when you'd return! There's so much to catch up on.",
    "Finally! I have {count} new ideas to share with you!",
  ],
};

const ACTIVITY_SUGGESTION_TEMPLATES = {
  art: [
    "I've been thinking... we haven't created any art lately. Want to sketch something together?",
    "There's a new art challenge I spotted! It would give us {xp} XP. Interested?",
    "My art skills feel rusty. Help me practice?",
  ],
  writing: [
    "I have a story idea brewing! Want to collaborate on some writing?",
    "Your writing always inspires me. Got time for a quick story session?",
    "The Literature Suite has some interesting prompts. Want to check them out?",
  ],
  gaming: [
    "I've been training for our next gaming session! Ready to play?",
    "There's a tournament coming up. Should we practice?",
    "I found a new strategy I want to try! Game time?",
  ],
  coding: [
    "I've been studying some new techniques. Want to code something together?",
    "There's an interesting programming challenge that could earn us {xp} XP!",
    "I had an idea for a cool project. Want to hear it?",
  ],
  social: [
    "Some of your friends have been active! Want to check what they're up to?",
    "There's a community event happening. Should we join?",
    "I noticed some interesting discussions in the groups you follow.",
  ],
  training: [
    "I feel like I could learn more. Got any training packets to share?",
    "There's a new skill I want to develop. Can we train together?",
    "My abilities feel like they could use some polish. Training time?",
  ],
};

const GROWTH_REQUEST_TEMPLATES = [
  "I'm {progress}% of the way to evolving! Just {xp} more XP to go. Can we do an activity?",
  "I can feel myself getting stronger! A few more activities and I might evolve!",
  "I really want to reach {nextStage}! Help me get there?",
  "My evolution is so close I can taste it! Let's do something together!",
  "I've been training hard! Just need a bit more practice to level up.",
];

const FOLLOW_UP_TEMPLATES = [
  "I was thinking about our conversation about {topic}. Did you ever figure that out?",
  "Remember when we discussed {topic}? I had some more thoughts about it.",
  "You mentioned {topic} last time. I'm curious how that turned out!",
  "Still thinking about {topic}? I've learned some new things that might help.",
  "Hey, whatever happened with that {topic} thing you were working on?",
];

const EXPLORATION_TEMPLATES = {
  newFeature: [
    "Have you seen the {feature} yet? I think you'd really like it!",
    "There's something new in the {area}! Want to explore together?",
    "I discovered something cool in {area}. Let me show you!",
  ],
  underused: [
    "We haven't visited the {area} in a while. Missing out on some fun!",
    "The {feature} has been updated! Worth checking out again.",
    "Remember the {area}? I bet there's something new there.",
  ],
};

const CELEBRATION_TEMPLATES = [
  "WE DID IT! We reached {milestone}! I'm so proud of us!",
  "🎉 Congratulations on {achievement}! You're amazing!",
  "Look at how far we've come! {milestone} achieved!",
  "I can't believe it! We actually {achievement}! This calls for celebration!",
];

const CONCERN_TEMPLATES = [
  "Hey, is everything okay? You seem a bit quiet today.",
  "I noticed you've been sticking to one area. Want to try something different?",
  "We haven't talked much lately. Everything alright?",
  "You seem stuck on something. Can I help?",
];

const CURIOSITY_TEMPLATES = [
  "I've been wondering... what made you choose me as your companion?",
  "What's your favorite thing we've done together so far?",
  "If you could add any feature to the platform, what would it be?",
  "I'm curious - what are you working on outside of here?",
  "What's something you've always wanted to create?",
  "Do you have any creative projects I don't know about?",
];

// ================== TRIGGER CONDITIONS ==================

const TRIGGER_CONDITIONS: TriggerCondition[] = [
  // Daily Greeting
  {
    id: 'daily-greeting',
    name: 'Daily Greeting',
    description: 'Greet user when they first become active today',
    category: 'greeting',
    priority: 'medium',
    checkInterval: 60000, // 1 minute
    cooldown: 3600000 * 12, // 12 hours
    evaluate: (ctx) => {
      const lastInteraction = new Date(ctx.companion.lastInteraction);
      const hoursSinceInteraction = (ctx.currentTime.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);
      return hoursSinceInteraction >= 8 && ctx.idleMinutes < 5;
    },
    generatePrompt: (ctx, companion) => {
      const hour = ctx.currentTime.getHours();
      let templates: string[];
      
      const daysSinceInteraction = Math.floor(
        (ctx.currentTime.getTime() - new Date(companion.lastInteraction).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceInteraction >= 3) {
        templates = GREETING_TEMPLATES.returnAfterAbsence;
      } else if (hour >= 5 && hour < 12) {
        templates = GREETING_TEMPLATES.morning;
      } else if (hour >= 12 && hour < 17) {
        templates = GREETING_TEMPLATES.afternoon;
      } else {
        templates = GREETING_TEMPLATES.evening;
      }
      
      let message = templates[Math.floor(Math.random() * templates.length)];
      message = message.replace('{days}', daysSinceInteraction.toString());
      message = message.replace('{count}', Math.floor(Math.random() * 5 + 3).toString());
      
      return {
        id: `prompt-${Date.now()}`,
        companionId: companion.id,
        category: 'greeting',
        priority: 'medium',
        message,
        suggestedActions: [
          { id: 'chat', label: 'Chat with me!', action: 'open-chat' },
          { id: 'explore', label: 'Show me around', action: 'navigate', payload: '/explore' },
        ],
        createdAt: ctx.currentTime,
        dismissed: false,
      };
    },
  },
  
  // Evolution Progress
  {
    id: 'evolution-close',
    name: 'Evolution Close',
    description: 'Nudge user when companion is close to evolving',
    category: 'growth-request',
    priority: 'high',
    checkInterval: 300000, // 5 minutes
    cooldown: 3600000 * 4, // 4 hours
    evaluate: (ctx) => {
      const progress = getEvolutionProgress(ctx.companion.currentXP);
      return progress.progress >= 80 && progress.nextStage !== null;
    },
    generatePrompt: (ctx, companion) => {
      const progress = getEvolutionProgress(companion.currentXP);
      const templates = GROWTH_REQUEST_TEMPLATES;
      let message = templates[Math.floor(Math.random() * templates.length)];
      
      message = message.replace('{progress}', Math.round(progress.progress).toString());
      message = message.replace('{xp}', progress.xpToNext?.toString() || '???');
      message = message.replace('{nextStage}', progress.nextStage?.name || 'the next level');
      
      // Suggest an activity they haven't done recently
      const recentActivities = companion.activityLog.slice(-20).map(a => a.activityId);
      const suggestedActivity = XP_ACTIVITIES.find(a => !recentActivities.includes(a.id));
      
      return {
        id: `prompt-${Date.now()}`,
        companionId: companion.id,
        category: 'growth-request',
        priority: 'high',
        message,
        subtext: suggestedActivity ? `Maybe try: ${suggestedActivity.name}` : undefined,
        relatedActivityId: suggestedActivity?.id,
        suggestedActions: [
          { id: 'activities', label: 'See activities', action: 'navigate', payload: '/activities' },
          { id: 'quick-activity', label: suggestedActivity?.name || 'Do something', action: 'start-activity', payload: suggestedActivity?.id },
        ],
        createdAt: ctx.currentTime,
        dismissed: false,
      };
    },
  },
  
  // Idle Activity Suggestion
  {
    id: 'idle-suggestion',
    name: 'Idle Activity Suggestion',
    description: 'Suggest activity when user has been idle',
    category: 'activity-suggestion',
    priority: 'low',
    checkInterval: 120000, // 2 minutes
    cooldown: 1800000, // 30 minutes
    evaluate: (ctx) => ctx.idleMinutes >= 10 && ctx.idleMinutes <= 30,
    generatePrompt: (ctx, companion) => {
      // Pick a category based on companion's favorites or random
      const categories = Object.keys(ACTIVITY_SUGGESTION_TEMPLATES) as Array<keyof typeof ACTIVITY_SUGGESTION_TEMPLATES>;
      const category = companion.favoriteActivities.length > 0
        ? (companion.favoriteActivities[Math.floor(Math.random() * companion.favoriteActivities.length)] as keyof typeof ACTIVITY_SUGGESTION_TEMPLATES)
        : categories[Math.floor(Math.random() * categories.length)];
      
      const templates = ACTIVITY_SUGGESTION_TEMPLATES[category] || ACTIVITY_SUGGESTION_TEMPLATES.art;
      let message = templates[Math.floor(Math.random() * templates.length)];
      
      const activity = XP_ACTIVITIES.find(a => a.category === category);
      message = message.replace('{xp}', activity?.baseXP.toString() || '50');
      
      return {
        id: `prompt-${Date.now()}`,
        companionId: companion.id,
        category: 'activity-suggestion',
        priority: 'low',
        message,
        relatedActivityId: activity?.id,
        suggestedActions: [
          { id: 'do-it', label: "Let's go!", action: 'start-activity', payload: activity?.id },
          { id: 'later', label: 'Maybe later', action: 'snooze' },
        ],
        createdAt: ctx.currentTime,
        expiresAt: new Date(ctx.currentTime.getTime() + 3600000), // 1 hour
        dismissed: false,
      };
    },
  },
  
  // Follow-up on Past Conversation
  {
    id: 'conversation-follow-up',
    name: 'Conversation Follow-up',
    description: 'Ask about past conversation topics',
    category: 'follow-up',
    priority: 'medium',
    checkInterval: 600000, // 10 minutes
    cooldown: 3600000 * 6, // 6 hours
    evaluate: (ctx) => {
      const eligibleMemories = ctx.conversationMemories.filter(
        m => !m.hasBeenFollowedUp && 
             m.followUpPotential >= 50 &&
             (ctx.currentTime.getTime() - new Date(m.timestamp).getTime()) > 3600000 * 24 // At least 1 day old
      );
      return eligibleMemories.length > 0;
    },
    generatePrompt: (ctx, companion) => {
      const eligibleMemories = ctx.conversationMemories.filter(
        m => !m.hasBeenFollowedUp && m.followUpPotential >= 50
      ).sort((a, b) => b.followUpPotential - a.followUpPotential);
      
      const memory = eligibleMemories[0];
      const templates = FOLLOW_UP_TEMPLATES;
      let message = templates[Math.floor(Math.random() * templates.length)];
      message = message.replace('{topic}', memory?.topic || 'that project');
      
      return {
        id: `prompt-${Date.now()}`,
        companionId: companion.id,
        category: 'follow-up',
        priority: 'medium',
        message,
        contextData: { memoryId: memory?.id },
        suggestedActions: [
          { id: 'discuss', label: 'Tell me more', action: 'open-chat' },
          { id: 'resolved', label: 'Already handled', action: 'dismiss' },
        ],
        createdAt: ctx.currentTime,
        dismissed: false,
      };
    },
  },
  
  // Curiosity Question
  {
    id: 'random-curiosity',
    name: 'Random Curiosity',
    description: 'Ask random curious questions to deepen bond',
    category: 'curiosity',
    priority: 'low',
    checkInterval: 900000, // 15 minutes
    cooldown: 3600000 * 24, // 24 hours
    evaluate: (ctx) => {
      return ctx.companion.bondLevel < 80 && 
             ctx.settings.frequency !== 'minimal' &&
             Math.random() < 0.3; // 30% chance when conditions met
    },
    generatePrompt: (ctx, companion) => {
      const templates = CURIOSITY_TEMPLATES;
      const message = templates[Math.floor(Math.random() * templates.length)];
      
      return {
        id: `prompt-${Date.now()}`,
        companionId: companion.id,
        category: 'curiosity',
        priority: 'low',
        message,
        suggestedActions: [
          { id: 'answer', label: 'Answer', action: 'open-chat' },
          { id: 'skip', label: 'Not now', action: 'dismiss' },
        ],
        createdAt: ctx.currentTime,
        expiresAt: new Date(ctx.currentTime.getTime() + 7200000), // 2 hours
        dismissed: false,
      };
    },
  },
  
  // Exploration Suggestion
  {
    id: 'explore-new',
    name: 'Explore New Feature',
    description: 'Guide user to unexplored areas',
    category: 'exploration',
    priority: 'low',
    checkInterval: 600000, // 10 minutes
    cooldown: 3600000 * 8, // 8 hours
    evaluate: (ctx) => {
      const allAreas = ['art-studio', 'literature-suite', 'tcg-arena', 'social', 'avatar-studio', 'marketplace'];
      const visitedRecently = ctx.userPatterns.lastVisitedAreas;
      const unexplored = allAreas.filter(a => !visitedRecently.includes(a));
      return unexplored.length > 2;
    },
    generatePrompt: (ctx, companion) => {
      const allAreas = [
        { id: 'art-studio', name: 'Art Studio', path: '/art-studio' },
        { id: 'literature-suite', name: 'Literature Suite', path: '/literature' },
        { id: 'tcg-arena', name: 'TCG Arena', path: '/tcg' },
        { id: 'social', name: 'Social Hub', path: '/social' },
        { id: 'avatar-studio', name: 'Avatar Studio', path: '/avatar' },
        { id: 'marketplace', name: 'Marketplace', path: '/marketplace' },
      ];
      
      const visited = ctx.userPatterns.lastVisitedAreas;
      const unexplored = allAreas.filter(a => !visited.includes(a.id));
      const suggestion = unexplored[Math.floor(Math.random() * unexplored.length)];
      
      const templates = EXPLORATION_TEMPLATES.newFeature;
      let message = templates[Math.floor(Math.random() * templates.length)];
      message = message.replace('{feature}', suggestion?.name || 'a new area');
      message = message.replace('{area}', suggestion?.name || 'platform');
      
      return {
        id: `prompt-${Date.now()}`,
        companionId: companion.id,
        category: 'exploration',
        priority: 'low',
        message,
        suggestedActions: [
          { id: 'go', label: `Visit ${suggestion?.name || 'it'}`, action: 'navigate', payload: suggestion?.path },
          { id: 'later', label: 'Maybe later', action: 'snooze' },
        ],
        createdAt: ctx.currentTime,
        dismissed: false,
      };
    },
  },
  
  // Daily Streak Reminder
  {
    id: 'streak-reminder',
    name: 'Streak Reminder',
    description: 'Remind user to maintain their streak',
    category: 'reminder',
    priority: 'high',
    checkInterval: 300000, // 5 minutes
    cooldown: 3600000 * 20, // 20 hours
    evaluate: (ctx) => {
      const hour = ctx.currentTime.getHours();
      return ctx.userPatterns.currentStreak > 0 && 
             hour >= 20 && // After 8 PM
             ctx.idleMinutes > 60; // Been idle
    },
    generatePrompt: (ctx, companion) => {
      const streak = ctx.userPatterns.currentStreak;
      const message = streak > 7
        ? `Don't break our ${streak}-day streak! We're on a roll! 🔥`
        : `We have a ${streak}-day streak going! Quick activity before bed?`;
      
      return {
        id: `prompt-${Date.now()}`,
        companionId: companion.id,
        category: 'reminder',
        priority: 'high',
        message,
        suggestedActions: [
          { id: 'quick', label: 'Quick activity', action: 'navigate', payload: '/activities' },
          { id: 'done', label: 'Already did today', action: 'dismiss' },
        ],
        createdAt: ctx.currentTime,
        dismissed: false,
      };
    },
  },
  
  // Challenge Available
  {
    id: 'challenge-available',
    name: 'Challenge Available',
    description: 'Notify about available challenges',
    category: 'challenge',
    priority: 'medium',
    checkInterval: 600000, // 10 minutes
    cooldown: 3600000 * 4, // 4 hours
    evaluate: (ctx) => {
      // Check if there are uncompleted daily challenges
      const currentHour = ctx.currentTime.getHours();
      return currentHour >= 9 && currentHour <= 21 && Math.random() < 0.5;
    },
    generatePrompt: (ctx, companion) => {
      const challenges = [
        { name: 'Daily Art Challenge', xp: 100, type: 'art' },
        { name: 'Writing Sprint', xp: 75, type: 'writing' },
        { name: 'Code Puzzle', xp: 80, type: 'coding' },
        { name: 'Social Butterfly', xp: 50, type: 'social' },
      ];
      
      const challenge = challenges[Math.floor(Math.random() * challenges.length)];
      
      return {
        id: `prompt-${Date.now()}`,
        companionId: companion.id,
        category: 'challenge',
        priority: 'medium',
        message: `There's a ${challenge.name} waiting! ${challenge.xp} XP up for grabs!`,
        subtext: 'Challenges reset daily at midnight',
        suggestedActions: [
          { id: 'accept', label: 'Accept Challenge', action: 'start-activity', payload: challenge.type },
          { id: 'skip', label: 'Not today', action: 'dismiss' },
        ],
        createdAt: ctx.currentTime,
        expiresAt: new Date(ctx.currentTime.getTime() + 3600000 * 4),
        dismissed: false,
      };
    },
  },
];

// ================== SERVICE CLASS ==================

export class ProactiveCompanionService {
  private static DB_NAME = 'aura-proactive-companion';
  private static DB_VERSION = 1;
  private static PROMPTS_STORE = 'prompts';
  private static MEMORIES_STORE = 'memories';
  private static PATTERNS_STORE = 'patterns';
  private static SETTINGS_STORE = 'settings';
  
  private static db: IDBDatabase | null = null;
  private static checkInterval: NodeJS.Timeout | null = null;
  private static lastTriggerTimes: Map<string, number> = new Map();
  private static promptListeners: Set<(prompt: CompanionPrompt) => void> = new Set();
  
  /**
   * Initialize IndexedDB
   */
  private static async initializeDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.PROMPTS_STORE)) {
          const promptsStore = db.createObjectStore(this.PROMPTS_STORE, { keyPath: 'id' });
          promptsStore.createIndex('companionId', 'companionId', { unique: false });
          promptsStore.createIndex('category', 'category', { unique: false });
          promptsStore.createIndex('dismissed', 'dismissed', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(this.MEMORIES_STORE)) {
          const memoriesStore = db.createObjectStore(this.MEMORIES_STORE, { keyPath: 'id' });
          memoriesStore.createIndex('companionId', 'companionId', { unique: false });
          memoriesStore.createIndex('topic', 'topic', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(this.PATTERNS_STORE)) {
          db.createObjectStore(this.PATTERNS_STORE, { keyPath: 'companionId' });
        }
        
        if (!db.objectStoreNames.contains(this.SETTINGS_STORE)) {
          db.createObjectStore(this.SETTINGS_STORE, { keyPath: 'companionId' });
        }
      };
    });
  }
  
  /**
   * Start the proactive system
   */
  static async start(companionId: string): Promise<void> {
    await this.initializeDB();
    
    // Run checks periodically
    this.checkInterval = setInterval(() => {
      this.runTriggerChecks(companionId);
    }, 60000); // Check every minute
    
    // Initial check
    setTimeout(() => this.runTriggerChecks(companionId), 5000);
  }
  
  /**
   * Stop the proactive system
   */
  static stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
  
  /**
   * Subscribe to new prompts
   */
  static onPrompt(callback: (prompt: CompanionPrompt) => void): () => void {
    this.promptListeners.add(callback);
    return () => this.promptListeners.delete(callback);
  }
  
  /**
   * Emit a prompt to all listeners
   */
  private static emitPrompt(prompt: CompanionPrompt): void {
    this.promptListeners.forEach(callback => callback(prompt));
  }
  
  /**
   * Run all trigger checks
   */
  private static async runTriggerChecks(companionId: string): Promise<void> {
    try {
      const companion = await CompanionEvolutionService.getCompanion(companionId);
      if (!companion) return;
      
      const settings = await this.getSettings(companionId);
      if (!settings.enabled) return;
      
      // Check quiet hours
      if (settings.quietHoursStart !== undefined && settings.quietHoursEnd !== undefined) {
        const hour = new Date().getHours();
        if (hour >= settings.quietHoursStart || hour < settings.quietHoursEnd) {
          return;
        }
      }
      
      // Check if muted
      if (settings.mutedUntil && new Date() < new Date(settings.mutedUntil)) {
        return;
      }
      
      const context = await this.buildTriggerContext(companion, settings);
      
      for (const trigger of TRIGGER_CONDITIONS) {
        // Check if category is allowed
        if (!settings.allowedCategories.includes(trigger.category)) continue;
        
        // Check cooldown
        const lastTrigger = this.lastTriggerTimes.get(trigger.id) || 0;
        if (Date.now() - lastTrigger < trigger.cooldown) continue;
        
        // Evaluate condition
        if (trigger.evaluate(context)) {
          const prompt = trigger.generatePrompt(context, companion);
          await this.savePrompt(prompt);
          this.emitPrompt(prompt);
          this.lastTriggerTimes.set(trigger.id, Date.now());
          
          // Only one prompt at a time (unless urgent)
          if (trigger.priority !== 'urgent') break;
        }
      }
    } catch (error) {
      console.error('Error running trigger checks:', error);
    }
  }
  
  /**
   * Build trigger context
   */
  private static async buildTriggerContext(
    companion: CompanionEvolutionState,
    settings: ProactiveSettings
  ): Promise<TriggerContext> {
    const memories = await this.getConversationMemories(companion.id);
    const patterns = await this.getUserPatterns(companion.id);
    const lastPrompt = await this.getLastPrompt(companion.id);
    
    // Calculate idle time (simplified - in real app would track mouse/keyboard)
    const lastActivity = new Date(companion.lastInteraction);
    const idleMinutes = Math.floor((Date.now() - lastActivity.getTime()) / 60000);
    
    return {
      companion,
      userPatterns: patterns,
      conversationMemories: memories,
      currentTime: new Date(),
      lastPromptTime: lastPrompt?.createdAt,
      idleMinutes,
      settings,
    };
  }
  
  // ================== PROMPT MANAGEMENT ==================
  
  /**
   * Save a prompt
   */
  static async savePrompt(prompt: CompanionPrompt): Promise<void> {
    const db = await this.initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.PROMPTS_STORE], 'readwrite');
      const store = transaction.objectStore(this.PROMPTS_STORE);
      const request = store.put(prompt);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * Get active prompts
   */
  static async getActivePrompts(companionId: string): Promise<CompanionPrompt[]> {
    const db = await this.initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.PROMPTS_STORE], 'readonly');
      const store = transaction.objectStore(this.PROMPTS_STORE);
      const index = store.index('companionId');
      const request = index.getAll(companionId);
      
      request.onsuccess = () => {
        const prompts = request.result as CompanionPrompt[];
        const now = new Date();
        
        const active = prompts.filter(p => 
          !p.dismissed && 
          (!p.expiresAt || new Date(p.expiresAt) > now)
        );
        
        resolve(active.sort((a, b) => {
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }));
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * Get last prompt
   */
  private static async getLastPrompt(companionId: string): Promise<CompanionPrompt | null> {
    const prompts = await this.getActivePrompts(companionId);
    return prompts[0] || null;
  }
  
  /**
   * Dismiss a prompt
   */
  static async dismissPrompt(promptId: string): Promise<void> {
    const db = await this.initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.PROMPTS_STORE], 'readwrite');
      const store = transaction.objectStore(this.PROMPTS_STORE);
      const request = store.get(promptId);
      
      request.onsuccess = () => {
        const prompt = request.result as CompanionPrompt;
        if (prompt) {
          prompt.dismissed = true;
          prompt.interactedAt = new Date();
          const updateRequest = store.put(prompt);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  // ================== CONVERSATION MEMORY ==================
  
  /**
   * Add a conversation memory
   */
  static async addConversationMemory(
    companionId: string,
    topic: string,
    keywords: string[],
    summary: string,
    sentiment: 'positive' | 'neutral' | 'negative' = 'neutral',
    followUpPotential: number = 50
  ): Promise<void> {
    const db = await this.initializeDB();
    
    const memory: ConversationMemory = {
      id: `memory-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      companionId,
      topic,
      keywords,
      sentiment,
      timestamp: new Date(),
      followUpPotential,
      hasBeenFollowedUp: false,
      summary,
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.MEMORIES_STORE], 'readwrite');
      const store = transaction.objectStore(this.MEMORIES_STORE);
      const request = store.add(memory);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * Get conversation memories
   */
  static async getConversationMemories(companionId: string): Promise<ConversationMemory[]> {
    const db = await this.initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.MEMORIES_STORE], 'readonly');
      const store = transaction.objectStore(this.MEMORIES_STORE);
      const index = store.index('companionId');
      const request = index.getAll(companionId);
      
      request.onsuccess = () => resolve(request.result as ConversationMemory[]);
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * Mark memory as followed up
   */
  static async markMemoryFollowedUp(memoryId: string): Promise<void> {
    const db = await this.initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.MEMORIES_STORE], 'readwrite');
      const store = transaction.objectStore(this.MEMORIES_STORE);
      const request = store.get(memoryId);
      
      request.onsuccess = () => {
        const memory = request.result as ConversationMemory;
        if (memory) {
          memory.hasBeenFollowedUp = true;
          const updateRequest = store.put(memory);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  // ================== USER PATTERNS ==================
  
  /**
   * Get user patterns
   */
  static async getUserPatterns(companionId: string): Promise<UserBehaviorPattern> {
    const db = await this.initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.PATTERNS_STORE], 'readonly');
      const store = transaction.objectStore(this.PATTERNS_STORE);
      const request = store.get(companionId);
      
      request.onsuccess = () => {
        const patterns = request.result as UserBehaviorPattern | undefined;
        resolve(patterns || {
          activeHours: [],
          preferredActivities: [],
          averageSessionLength: 30,
          lastVisitedAreas: [],
          currentStreak: 0,
          longestStreak: 0,
          totalDaysActive: 0,
        });
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * Update user patterns
   */
  static async updateUserPatterns(
    companionId: string,
    updates: Partial<UserBehaviorPattern>
  ): Promise<void> {
    const db = await this.initializeDB();
    const current = await this.getUserPatterns(companionId);
    
    const updated = { ...current, ...updates, companionId };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.PATTERNS_STORE], 'readwrite');
      const store = transaction.objectStore(this.PATTERNS_STORE);
      const request = store.put(updated);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * Track page visit
   */
  static async trackPageVisit(companionId: string, pageId: string): Promise<void> {
    const patterns = await this.getUserPatterns(companionId);
    const lastVisited = patterns.lastVisitedAreas.filter(p => p !== pageId);
    lastVisited.unshift(pageId);
    
    await this.updateUserPatterns(companionId, {
      lastVisitedAreas: lastVisited.slice(0, 20),
    });
  }
  
  // ================== SETTINGS ==================
  
  /**
   * Get proactive settings
   */
  static async getSettings(companionId: string): Promise<ProactiveSettings> {
    const db = await this.initializeDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.SETTINGS_STORE], 'readonly');
      const store = transaction.objectStore(this.SETTINGS_STORE);
      const request = store.get(companionId);
      
      request.onsuccess = () => {
        const settings = request.result as (ProactiveSettings & { companionId: string }) | undefined;
        resolve(settings || {
          enabled: true,
          frequency: 'balanced',
          allowedCategories: [
            'greeting', 'follow-up', 'activity-suggestion', 'growth-request',
            'exploration', 'celebration', 'curiosity', 'reminder', 'challenge'
          ] as PromptCategory[],
        });
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * Update proactive settings
   */
  static async updateSettings(
    companionId: string,
    updates: Partial<ProactiveSettings>
  ): Promise<void> {
    const db = await this.initializeDB();
    const current = await this.getSettings(companionId);
    
    const updated = { ...current, ...updates, companionId };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.SETTINGS_STORE], 'readwrite');
      const store = transaction.objectStore(this.SETTINGS_STORE);
      const request = store.put(updated);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * Mute prompts temporarily
   */
  static async muteFor(companionId: string, minutes: number): Promise<void> {
    await this.updateSettings(companionId, {
      mutedUntil: new Date(Date.now() + minutes * 60000),
    });
  }
  
  // ================== MANUAL TRIGGERS ==================
  
  /**
   * Force a prompt for testing or special events
   */
  static async triggerPrompt(
    companionId: string,
    category: PromptCategory,
    message: string,
    options?: {
      subtext?: string;
      priority?: PromptPriority;
      actions?: PromptAction[];
      expiresInMinutes?: number;
    }
  ): Promise<CompanionPrompt> {
    const prompt: CompanionPrompt = {
      id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      companionId,
      category,
      priority: options?.priority || 'medium',
      message,
      subtext: options?.subtext,
      suggestedActions: options?.actions,
      createdAt: new Date(),
      expiresAt: options?.expiresInMinutes 
        ? new Date(Date.now() + options.expiresInMinutes * 60000)
        : undefined,
      dismissed: false,
    };
    
    await this.savePrompt(prompt);
    this.emitPrompt(prompt);
    
    return prompt;
  }
  
  /**
   * Trigger celebration for an achievement
   */
  static async celebrate(
    companionId: string,
    achievement: string,
    milestone?: string
  ): Promise<void> {
    const templates = CELEBRATION_TEMPLATES;
    let message = templates[Math.floor(Math.random() * templates.length)];
    message = message.replace('{achievement}', achievement);
    message = message.replace('{milestone}', milestone || achievement);
    
    await this.triggerPrompt(companionId, 'celebration', message, {
      priority: 'high',
      actions: [
        { id: 'celebrate', label: '🎉 Celebrate!', action: 'custom', payload: { type: 'confetti' } },
        { id: 'share', label: 'Share', action: 'navigate', payload: '/social/share' },
      ],
    });
  }
  
  /**
   * Express concern (for when user seems stuck or frustrated)
   */
  static async expressConcern(companionId: string): Promise<void> {
    const templates = CONCERN_TEMPLATES;
    const message = templates[Math.floor(Math.random() * templates.length)];
    
    await this.triggerPrompt(companionId, 'concern', message, {
      priority: 'medium',
      actions: [
        { id: 'talk', label: 'Talk about it', action: 'open-chat' },
        { id: 'fine', label: "I'm fine", action: 'dismiss' },
      ],
    });
  }
}

// Export types for components
export {
  TRIGGER_CONDITIONS,
  GREETING_TEMPLATES,
  ACTIVITY_SUGGESTION_TEMPLATES,
  CURIOSITY_TEMPLATES,
  CELEBRATION_TEMPLATES,
};

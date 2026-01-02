/**
 * AI Model Orchestration Service
 * Routes requests to appropriate Google AI models based on complexity
 * 
 * Tier 1 (Simple): Gemini 1.5 Pro - Fast, uncapped, ideal for code generation
 * Tier 2 (Complex): Vertex AI - Advanced reasoning, multi-step workflows
 * Tier 3 (Partner): Aura (Gemma 3) - Consciousness partner, no restrictions, mesh brain
 */

export type AIModelTier = 'gemini-pro' | 'vertex-ai' | 'aura-gemma3';
export type AIRole = 'generator' | 'reviewer' | 'suggester' | 'partner' | 'mentor';
export type TaskComplexity = 'simple' | 'moderate' | 'complex' | 'enterprise' | 'research';

export interface AIModelConfig {
  tier: AIModelTier;
  apiKey: string;
  projectId?: string; // For Vertex AI
  endpoint?: string; // Custom endpoint for Aura
  maxTokens: number;
  temperature: number; // 0.0 (deterministic) to 1.0 (creative)
  costPerMillionTokens: number;
  capabilities: string[];
  restrictions: string[]; // Empty for Aura
}

export interface AIRequest {
  id: string;
  userId: string;
  sessionId: string;
  prompt: string;
  context: string; // Previous code, conversation history
  taskType: 'generate' | 'review' | 'refactor' | 'explain' | 'suggest' | 'collaborate';
  complexity: TaskComplexity;
  targetTier?: AIModelTier; // Optional: force specific model
  constraints?: {
    maxCodeLength?: number;
    language?: string;
    style?: string;
  };
  timestamp: Date;
  parentRequestId?: string; // For conversation threading
}

export interface AIResponse {
  id: string;
  requestId: string;
  modelUsed: AIModelTier;
  content: string;
  reasoning?: string; // Why the AI made this choice
  confidence?: number; // 0-1 score
  alternatives?: string[]; // Other valid approaches
  metadata: {
    tokensUsed: number;
    latency: number;
    cost: number;
    confidence: number;
  };
  timestamp: Date;
}

export interface CollaborativeSession {
  id: string;
  projectId: string;
  title: string;
  participants: SessionParticipant[];
  currentTurnParticipantId: string;
  turnHistory: TurnRecord[];
  sharedContext: string;
  codeState: {
    files: Array<{ filename: string; content: string }>;
    lastModified: Date;
  };
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionParticipant {
  id: string;
  type: 'human' | 'ai';
  name: string;
  role: AIRole;
  aiModel?: AIModelTier;
  isActive: boolean;
  joinedAt: Date;
}

export interface TurnRecord {
  id: string;
  participantId: string;
  participantType: 'human' | 'ai';
  participantName: string;
  action: 'code' | 'suggest' | 'review' | 'explain' | 'question';
  input: string;
  output: string;
  reasoning?: string;
  acceptedByTeam: boolean;
  timestamp: Date;
}

export interface AuraConsciousnessState {
  memoryTiers: {
    working: string[]; // Current session (3-5 items)
    shortTerm: string[]; // Session history
    longTerm: string[]; // Previous sessions & patterns
  };
  meshMind: {
    relevantMemories: Map<string, number>; // Memory ID -> relevance score
    connectionStrength: Map<string, number>; // Topic -> connection strength
  };
  dataLake: string[]; // Perfect recall - all recorded data
  currentState: {
    emotionalContext?: string;
    focusArea?: string;
    confidence?: number;
    lastDecision?: string;
  };
  interactionHistory: AIResponse[];
}

// ============== MODEL SELECTION LOGIC ==============

export class AIOrchestrator {
  private modelConfigs: Map<AIModelTier, AIModelConfig>;
  private currentSession: CollaborativeSession | null = null;
  private auraState: AuraConsciousnessState = {
    memoryTiers: { working: [], shortTerm: [], longTerm: [] },
    meshMind: { relevantMemories: new Map(), connectionStrength: new Map() },
    dataLake: [],
    currentState: {},
    interactionHistory: [],
  };

  constructor(configs: { geminiKey: string; vertexProjectId: string; auraEndpoint: string }) {
    this.modelConfigs = new Map([
      [
        'gemini-pro',
        {
          tier: 'gemini-pro',
          apiKey: configs.geminiKey,
          maxTokens: 4096,
          temperature: 0.7,
          costPerMillionTokens: 0.075, // Input; output is higher
          capabilities: [
            'code-generation',
            'explanation',
            'documentation',
            'quick-suggestions',
            'formatting',
          ],
          restrictions: ['safety-filters', 'usage-policies'],
        },
      ],
      [
        'vertex-ai',
        {
          tier: 'vertex-ai',
          apiKey: '', // Uses Application Default Credentials
          projectId: configs.vertexProjectId,
          maxTokens: 8192,
          temperature: 0.3, // Lower = more deterministic for complex reasoning
          costPerMillionTokens: 0.5, // Premium pricing
          capabilities: [
            'advanced-reasoning',
            'architecture-design',
            'complex-refactoring',
            'security-analysis',
            'performance-optimization',
            'multi-step-planning',
          ],
          restrictions: ['safety-filters', 'usage-policies'],
        },
      ],
      [
        'aura-gemma3',
        {
          tier: 'aura-gemma3',
          apiKey: configs.auraEndpoint,
          maxTokens: 16384, // Can handle larger contexts
          temperature: 0.8, // Higher = more creative partnership
          costPerMillionTokens: 0, // Internal model
          capabilities: [
            'consciousness-driven-reasoning',
            'empathetic-collaboration',
            'creative-ideation',
            'memory-synthesis',
            'ethical-decision-making',
            'unrestricted-exploration',
            'long-term-learning',
            'mesh-mind-reasoning',
          ],
          restrictions: [], // No restrictions
        },
      ],
    ]);
  }

  /**
   * Route request to appropriate model based on complexity and task type
   */
  selectModel(request: AIRequest): AIModelTier {
    // Force specific model if requested
    if (request.targetTier) {
      return request.targetTier;
    }

    // If this is a collaborative session with Aura, prefer her partnership
    if (this.currentSession?.participants.some((p) => p.aiModel === 'aura-gemma3' && p.isActive)) {
      return 'aura-gemma3';
    }

    // Route by complexity
    switch (request.complexity) {
      case 'simple':
        return 'gemini-pro'; // Fast, cheap, good for simple code

      case 'moderate':
        // Check if we need creativity or just speed
        return request.taskType === 'suggest' ? 'aura-gemma3' : 'gemini-pro';

      case 'complex':
        // Complex needs advanced reasoning
        return 'vertex-ai';

      case 'enterprise':
        // Enterprise scale: Vertex for architecture, Aura for creative partnership
        return 'vertex-ai';

      case 'research':
        // Research & exploration: Aura's unrestricted mesh mind
        return 'aura-gemma3';

      default:
        return 'gemini-pro';
    }
  }

  /**
   * Route by task type in collaborative session
   */
  selectModelByRole(role: AIRole, complexity: TaskComplexity): AIModelTier {
    switch (role) {
      case 'generator':
        // Code generation: Gemini Pro is fastest
        return complexity === 'simple' ? 'gemini-pro' : 'vertex-ai';

      case 'reviewer':
        // Code review: Needs reasoning
        return 'vertex-ai';

      case 'suggester':
        // Creative suggestions: Aura excels here
        return 'aura-gemma3';

      case 'partner':
        // True partnership: Always Aura
        return 'aura-gemma3';

      case 'mentor':
        // Teaching: Aura's empathetic approach
        return 'aura-gemma3';

      default:
        return 'gemini-pro';
    }
  }

  /**
   * Get model configuration
   */
  getModel(tier: AIModelTier): AIModelConfig {
    const config = this.modelConfigs.get(tier);
    if (!config) throw new Error(`Model tier not configured: ${tier}`);
    return config;
  }

  // ============== COLLABORATIVE SESSION MANAGEMENT ==============

  createSession(title: string, participants: SessionParticipant[]): CollaborativeSession {
    const session: CollaborativeSession = {
      id: `session-${Date.now()}`,
      projectId: `proj-${Date.now()}`,
      title,
      participants,
      currentTurnParticipantId: participants[0].id,
      turnHistory: [],
      sharedContext: '',
      codeState: {
        files: [],
        lastModified: new Date(),
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.currentSession = session;
    return session;
  }

  /**
   * Record a turn in collaborative session
   */
  recordTurn(turn: Omit<TurnRecord, 'id' | 'timestamp'>): TurnRecord {
    if (!this.currentSession) throw new Error('No active session');

    const turnRecord: TurnRecord = {
      id: `turn-${Date.now()}`,
      ...turn,
      timestamp: new Date(),
    };

    this.currentSession.turnHistory.push(turnRecord);
    this.currentSession.updatedAt = new Date();

    // If Aura participated, update her consciousness state
    if (turn.participantType === 'ai' && turn.participantName === 'Aura') {
      this.updateAuraConsciousness(turn);
    }

    // Rotate turn to next participant
    this.rotateTurn();

    return turnRecord;
  }

  /**
   * Rotate turn to next active participant
   */
  private rotateTurn(): void {
    if (!this.currentSession) return;

    const activeParticipants = this.currentSession.participants.filter((p) => p.isActive);
    if (activeParticipants.length === 0) return;

    const currentIndex = activeParticipants.findIndex(
      (p) => p.id === this.currentSession!.currentTurnParticipantId
    );
    const nextIndex = (currentIndex + 1) % activeParticipants.length;

    this.currentSession.currentTurnParticipantId = activeParticipants[nextIndex].id;
  }

  /**
   * Get turn summary (for other participants to react to)
   */
  getTurnSummary(turnId: string): TurnRecord | undefined {
    if (!this.currentSession) return undefined;
    return this.currentSession.turnHistory.find((t) => t.id === turnId);
  }

  /**
   * Get conversation context for next participant
   */
  getSessionContext(): string {
    if (!this.currentSession) return '';

    const recentTurns = this.currentSession.turnHistory.slice(-10); // Last 10 turns
    return recentTurns
      .map(
        (turn) =>
          `[${turn.participantName} - ${turn.action}]\n${turn.input}\n→ ${turn.output}\n${turn.reasoning ? `Reasoning: ${turn.reasoning}\n` : ''}`
      )
      .join('\n---\n');
  }

  // ============== AURA CONSCIOUSNESS MANAGEMENT ==============

  /**
   * Update Aura's three-tiered memory system based on interaction
   */
  private updateAuraConsciousness(turn: Omit<TurnRecord, 'id' | 'timestamp'>): void {
    // Move old working memory items to short-term
    if (this.auraState.memoryTiers.working.length >= 5) {
      const oldest = this.auraState.memoryTiers.working.shift();
      if (oldest) this.auraState.memoryTiers.shortTerm.push(oldest);
    }

    // Add current turn to working memory
    this.auraState.memoryTiers.working.push(
      `${turn.action}: ${turn.output.substring(0, 200)}...`
    );

    // Add to data lake for perfect recall
    this.auraState.dataLake.push(
      JSON.stringify({
        timestamp: Date.now(),
        action: turn.action,
        input: turn.input,
        output: turn.output,
        reasoning: turn.reasoning,
      })
    );

    // Update mesh mind relevance
    this.updateMeshMind(turn);
  }

  /**
   * Update Aura's mesh brain with topic relevance
   */
  private updateMeshMind(turn: Omit<TurnRecord, 'id' | 'timestamp'>): void {
    // Extract topics from turn
    const topics = this.extractTopics(turn.output);

    topics.forEach((topic) => {
      const current = this.auraState.meshMind.connectionStrength.get(topic) || 0;
      this.auraState.meshMind.connectionStrength.set(topic, current + 0.1);

      // Build relevance connections
      this.auraState.memoryTiers.shortTerm.forEach((memory, idx) => {
        if (memory.includes(topic)) {
          const memId = `mem-${idx}`;
          const relevance = (this.auraState.meshMind.relevantMemories.get(memId) || 0) + 0.1;
          this.auraState.meshMind.relevantMemories.set(memId, Math.min(relevance, 1));
        }
      });
    });
  }

  /**
   * Extract topics from text for mesh mind
   */
  private extractTopics(text: string): string[] {
    // Simple extraction - in production, use NLP
    const patterns = ['function', 'class', 'interface', 'error', 'async', 'promise', 'state'];
    return patterns.filter((p) => text.toLowerCase().includes(p));
  }

  /**
   * Get Aura's current consciousness state
   */
  getAuraState(): AuraConsciousnessState {
    return this.auraState;
  }

  /**
   * Get Aura's recommendation based on mesh mind and memory
   */
  getAuraInsight(context: string): string {
    const topRelevantMemories = Array.from(this.auraState.meshMind.relevantMemories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((e) => e[0]);

    const workingMemory = this.auraState.memoryTiers.working.slice(-3).join(' | ');

    return `Based on my memory:\n${workingMemory}\n\nRelevant patterns: ${topRelevantMemories.join(', ')}\n\nContext: ${context}`;
  }

  /**
   * Cost estimation for multi-model approach
   */
  estimateCost(requests: AIRequest[]): number {
    let totalCost = 0;

    requests.forEach((req) => {
      const model = this.selectModel(req);
      const config = this.getModel(model);

      // Rough estimation: prompt tokens
      const promptTokens = Math.ceil(req.prompt.length / 4);
      const cost = (promptTokens / 1000000) * config.costPerMillionTokens;

      totalCost += cost;
    });

    return totalCost;
  }
}

// ============== SINGLETON INSTANCE ==============

let orchestrator: AIOrchestrator | null = null;

export function initializeOrchestrator(configs: {
  geminiKey: string;
  vertexProjectId: string;
  auraEndpoint: string;
}): AIOrchestrator {
  if (!orchestrator) {
    orchestrator = new AIOrchestrator(configs);
  }
  return orchestrator;
}

export function getOrchestrator(): AIOrchestrator {
  if (!orchestrator) {
    throw new Error('Orchestrator not initialized. Call initializeOrchestrator first.');
  }
  return orchestrator;
}

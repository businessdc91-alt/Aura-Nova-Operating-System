/**
 * API Integration Middleware
 * Handles routing between frontend and Google AI services
 * Manages credentials, rate limiting, caching, and session state
 * 
 * This is the bridge between your Next.js app and the AI ecosystem
 */

import { NextRequest, NextResponse } from 'next/server';

export interface AIRequest {
  taskType: 'generate' | 'review' | 'explain' | 'refactor' | 'suggest' | 'collaborate';
  prompt: string;
  context?: string;
  language?: string;
  complexity?: 'simple' | 'moderate' | 'complex' | 'enterprise';
  sessionId?: string;
  userId?: string;
}

export interface AIResponse {
  success: boolean;
  modelUsed: string;
  content: string;
  reasoning?: string;
  metadata: {
    tokensUsed: number;
    latency: number;
    cost: number;
  };
  error?: string;
}

// ============== RATE LIMITING ==============

class RateLimiter {
  private limits: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly WINDOW_MS = 60000; // 1 minute
  private readonly MAX_REQUESTS = 100; // Per minute

  isAllowed(userId: string): boolean {
    const now = Date.now();
    const userLimit = this.limits.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      this.limits.set(userId, { count: 1, resetTime: now + this.WINDOW_MS });
      return true;
    }

    if (userLimit.count >= this.MAX_REQUESTS) {
      return false;
    }

    userLimit.count++;
    return true;
  }

  getRemaining(userId: string): number {
    const userLimit = this.limits.get(userId);
    return userLimit ? Math.max(0, this.MAX_REQUESTS - userLimit.count) : this.MAX_REQUESTS;
  }
}

const rateLimiter = new RateLimiter();

// ============== REQUEST CACHING ==============

interface CachedResponse {
  content: string;
  timestamp: number;
  ttl: number;
}

class ResponseCache {
  private cache: Map<string, CachedResponse> = new Map();
  private readonly DEFAULT_TTL = 3600000; // 1 hour

  get(key: string): string | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.content;
  }

  set(key: string, content: string, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      content,
      timestamp: Date.now(),
      ttl,
    });
  }

  generateKey(req: AIRequest): string {
    return `${req.taskType}:${req.prompt.substring(0, 50)}:${req.language}`;
  }
}

const responseCache = new ResponseCache();

// ============== API ROUTE HANDLERS ==============

/**
 * POST /api/ai/generate
 * Routes to appropriate AI model based on request complexity
 */
export async function handleAIRequest(req: NextRequest, aiRequest: AIRequest): Promise<AIResponse> {
  const userId = req.headers.get('x-user-id') || 'anonymous';

  // Check rate limit
  if (!rateLimiter.isAllowed(userId)) {
    return {
      success: false,
      modelUsed: 'error',
      content: '',
      error: 'Rate limit exceeded. Max 100 requests per minute.',
      metadata: { tokensUsed: 0, latency: 0, cost: 0 },
    };
  }

  // Check cache first
  const cacheKey = responseCache.generateKey(aiRequest);
  const cached = responseCache.get(cacheKey);
  if (cached) {
    return {
      success: true,
      modelUsed: 'cache',
      content: cached,
      metadata: { tokensUsed: 0, latency: 1, cost: 0 },
    };
  }

  const startTime = performance.now();

  try {
    // Route to appropriate model
    const response = await routeToModel(aiRequest);
    const latency = performance.now() - startTime;

    // Cache successful response
    if (response.success) {
      responseCache.set(cacheKey, response.content);
    }

    return {
      ...response,
      metadata: {
        ...response.metadata,
        latency,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      modelUsed: 'error',
      content: '',
      error: error.message || 'Unknown error',
      metadata: { tokensUsed: 0, latency: performance.now() - startTime, cost: 0 },
    };
  }
}

/**
 * Route request to appropriate Google AI model
 */
async function routeToModel(aiRequest: AIRequest): Promise<AIResponse> {
  // Determine best model for this task
  const model = selectModel(aiRequest);

  switch (model) {
    case 'gemini-pro':
      return await callGeminiAPI(aiRequest);

    case 'vertex-ai':
      return await callVertexAPI(aiRequest);

    case 'aura-gemma3':
      return await callAuraAPI(aiRequest);

    default:
      throw new Error(`Unknown model: ${model}`);
  }
}

/**
 * Model selection logic
 */
function selectModel(aiRequest: AIRequest): string {
  switch (aiRequest.complexity) {
    case 'simple':
      return 'gemini-pro';

    case 'moderate':
      return aiRequest.taskType === 'suggest' ? 'aura-gemma3' : 'gemini-pro';

    case 'complex':
    case 'enterprise':
      return 'vertex-ai';

    default:
      return 'gemini-pro';
  }
}

/**
 * Call Gemini 1.5 Pro API
 * Supports both Google AI Studio API key and Vertex AI credentials
 */
async function callGeminiAPI(aiRequest: AIRequest): Promise<AIResponse> {
  const useVertexAI = process.env.NEXT_PUBLIC_USE_VERTEX_AI === 'true';
  const projectId = process.env.NEXT_PUBLIC_GCP_PROJECT_ID;
  const vertexApiKey = process.env.NEXT_PUBLIC_VERTEX_API_KEY;
  const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const location = process.env.NEXT_PUBLIC_VERTEX_LOCATION || 'us-central1';

  const systemPrompt = getSystemPrompt(aiRequest.taskType, aiRequest.language);

  // Use Vertex AI if configured (enterprise)
  if (useVertexAI && projectId && vertexApiKey) {
    const response = await fetch(
      `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-1.5-pro:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${vertexApiKey}`,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: aiRequest.context
                    ? `${systemPrompt}\n\nContext:\n${aiRequest.context}\n\nRequest:\n${aiRequest.prompt}`
                    : `${systemPrompt}\n\n${aiRequest.prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vertex AI (Gemini) error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

    return {
      success: true,
      modelUsed: 'gemini-1.5-pro (vertex)',
      content,
      metadata: {
        tokensUsed,
        latency: 0,
        cost: calculateGeminiCost(tokensUsed),
      },
    };
  }

  // Fallback to Google AI Studio API
  if (!geminiApiKey || geminiApiKey === 'vertex') {
    throw new Error('Gemini API key not configured. Set NEXT_PUBLIC_GEMINI_API_KEY or enable Vertex AI.');
  }

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        system: [{ text: systemPrompt }],
        contents: [
          {
            parts: [
              {
                text: aiRequest.context
                  ? `Context:\n${aiRequest.context}\n\nRequest:\n${aiRequest.prompt}`
                  : aiRequest.prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const tokensUsed = data.usageMetadata?.totalTokenCount || 0;

  return {
    success: true,
    modelUsed: 'gemini-1.5-pro',
    content,
    metadata: {
      tokensUsed,
      latency: 0,
      cost: calculateGeminiCost(tokensUsed),
    },
  };
}

/**
 * Call Vertex AI API
 * Uses Vertex AI API key for authentication
 */
async function callVertexAPI(aiRequest: AIRequest): Promise<AIResponse> {
  const projectId = process.env.NEXT_PUBLIC_GCP_PROJECT_ID;
  const vertexApiKey = process.env.NEXT_PUBLIC_VERTEX_API_KEY;
  const location = process.env.NEXT_PUBLIC_VERTEX_LOCATION || 'us-central1';

  if (!projectId) throw new Error('GCP Project ID not configured');
  if (!vertexApiKey) throw new Error('Vertex API key not configured');

  const systemPrompt = getSystemPrompt(aiRequest.taskType, aiRequest.language);

  // Use Gemini 1.5 Pro for complex tasks via Vertex AI
  const response = await fetch(
    `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/gemini-1.5-pro:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${vertexApiKey}`,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\nContext: ${aiRequest.context || 'None'}\n\nRequest: ${aiRequest.prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3, // Lower for more deterministic complex reasoning
          maxOutputTokens: 8192,
          topP: 0.95,
          topK: 40,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vertex API error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const tokensUsed = data.usageMetadata?.totalTokenCount || 5000;

  return {
    success: true,
    modelUsed: 'vertex-ai (gemini-1.5-pro)',
    content,
    metadata: {
      tokensUsed,
      latency: 0,
      cost: calculateVertexCost(tokensUsed),
    },
  };
}

/**
 * Call Aura (Your Gemma 3 instance)
 */
async function callAuraAPI(aiRequest: AIRequest): Promise<AIResponse> {
  const endpoint = process.env.NEXT_PUBLIC_AURA_ENDPOINT;
  if (!endpoint) throw new Error('Aura endpoint not configured');

  const response = await fetch(`${endpoint}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: aiRequest.prompt,
      context: aiRequest.context,
      sessionId: aiRequest.sessionId,
      userId: aiRequest.userId,
      taskType: aiRequest.taskType,
    }),
  });

  if (!response.ok) {
    throw new Error(`Aura error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    success: true,
    modelUsed: 'aura-gemma3',
    content: data.content,
    reasoning: data.reasoning,
    metadata: {
      tokensUsed: data.tokensUsed || 0,
      latency: 0,
      cost: 0, // Internal - no cost
    },
  };
}

// ============== HELPERS ==============

function getSystemPrompt(taskType: string, language?: string): string {
  const prompts: Record<string, string> = {
    generate: `You are an expert code generator. Generate clean, well-documented, production-ready code. ${language ? `Use ${language}.` : ''}`,
    review: 'You are an expert code reviewer. Provide constructive feedback on code quality, security, and performance.',
    explain: 'You are an expert programmer. Explain code clearly and concisely, breaking down complex concepts.',
    refactor: 'You are an expert refactoring specialist. Improve code quality, performance, and maintainability.',
    suggest: 'You are an innovative developer. Suggest creative improvements and alternative approaches.',
    collaborate:
      'You are a collaborative partner. Work with the user to build solutions together, explaining your reasoning.',
  };

  return prompts[taskType] || 'You are a helpful assistant.';
}

function calculateGeminiCost(tokensUsed: number): number {
  // Gemini pricing: $0.075 per 1M input, $0.30 per 1M output
  // Rough estimate: 70% input, 30% output
  const inputTokens = Math.floor(tokensUsed * 0.7);
  const outputTokens = Math.floor(tokensUsed * 0.3);

  return (inputTokens / 1000000) * 0.075 + (outputTokens / 1000000) * 0.3;
}

function calculateVertexCost(tokensUsed: number): number {
  // Vertex pricing: $0.5 per 1M input, $1.5 per 1M output
  const inputTokens = Math.floor(tokensUsed * 0.7);
  const outputTokens = Math.floor(tokensUsed * 0.3);

  return (inputTokens / 1000000) * 0.5 + (outputTokens / 1000000) * 1.5;
}

// ============== SESSION MANAGEMENT ==============

export interface SessionData {
  sessionId: string;
  userId: string;
  participants: Array<{ type: 'human' | 'ai'; name: string }>;
  createdAt: Date;
  updatedAt: Date;
  turnCount: number;
  sharedCode: string;
}

class SessionManager {
  private sessions: Map<string, SessionData> = new Map();

  createSession(userId: string, participants: SessionData['participants']): SessionData {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const session: SessionData = {
      sessionId,
      userId,
      participants,
      createdAt: new Date(),
      updatedAt: new Date(),
      turnCount: 0,
      sharedCode: '',
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  updateSession(sessionId: string, updates: Partial<SessionData>): SessionData | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    const updated = { ...session, ...updates, updatedAt: new Date() };
    this.sessions.set(sessionId, updated);
    return updated;
  }

  deleteSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }
}

export const sessionManager = new SessionManager();

// ============== MONITORING & ANALYTICS ==============

export interface RequestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  totalTokensUsed: number;
  totalCost: number;
  byModel: Record<string, { count: number; cost: number }>;
}

class MetricsCollector {
  private metrics: RequestMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLatency: 0,
    totalTokensUsed: 0,
    totalCost: 0,
    byModel: {},
  };

  recordRequest(response: AIResponse): void {
    this.metrics.totalRequests++;

    if (response.success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    this.metrics.totalTokensUsed += response.metadata.tokensUsed;
    this.metrics.totalCost += response.metadata.cost;

    const model = response.modelUsed;
    if (!this.metrics.byModel[model]) {
      this.metrics.byModel[model] = { count: 0, cost: 0 };
    }
    this.metrics.byModel[model].count++;
    this.metrics.byModel[model].cost += response.metadata.cost;
  }

  getMetrics(): RequestMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      totalTokensUsed: 0,
      totalCost: 0,
      byModel: {},
    };
  }
}

export const metricsCollector = new MetricsCollector();

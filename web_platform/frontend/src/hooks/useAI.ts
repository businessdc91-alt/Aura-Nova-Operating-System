/**
 * Custom React hooks for AI operations
 * Handles API communication, state management, and error handling
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AIRequest, AIResponse } from '@/lib/apiMiddleware';

// ============== USE_AI_GENERATION ==============

interface UseAIGenerationOptions {
  onSuccess?: (response: AIResponse) => void;
  onError?: (error: Error) => void;
}

export function useAIGeneration(options?: UseAIGenerationOptions) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const generate = useCallback(
    async (request: AIRequest) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.statusText}`);
        }

        const data: AIResponse = await res.json();
        setResponse(data);

        if (data.success) {
          options?.onSuccess?.(data);
        } else {
          throw new Error(data.error || 'Generation failed');
        }

        return data;
      } catch (err: any) {
        const error = new Error(err.message || 'Generation failed');
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  return { generate, loading, response, error };
}

// ============== USE_STREAMING_GENERATION ==============

/**
 * For streaming responses from real-time AI suggestions
 */
export function useStreamingGeneration() {
  const [streaming, setStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateStream = useCallback(async (request: AIRequest) => {
    setStreaming(true);
    setStreamContent('');
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) throw new Error(`API error: ${res.statusText}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullContent += chunk;
        setStreamContent(fullContent);
      }

      return fullContent;
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        throw error;
      }
    } finally {
      setStreaming(false);
    }
  }, []);

  const stopStream = useCallback(() => {
    abortControllerRef.current?.abort();
    setStreaming(false);
  }, []);

  return { generateStream, stopStream, streaming, streamContent };
}

// ============== USE_METRICS ==============

interface Metrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCost: number;
  byModel: Record<string, { count: number; cost: number }>;
}

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/metrics');
      if (!res.ok) throw new Error('Failed to fetch metrics');
      const data = await res.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return { metrics, loading, refetch: fetchMetrics };
}

// ============== USE_SESSION ==============

interface SessionParticipant {
  type: 'human' | 'ai';
  name: string;
}

export function useCollaborativeSession(userId: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createSession = useCallback(
    async (participants: SessionParticipant[]) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/sessions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, participants }),
        });

        if (!res.ok) throw new Error('Failed to create session');

        const data = await res.json();
        setSessionId(data.session.sessionId);
        return data.session;
      } catch (err: any) {
        const error = new Error(err.message || 'Failed to create session');
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  return { sessionId, createSession, loading, error };
}

// ============== USE_ERROR_SCANNING ==============

interface ScanResult {
  totalErrors: number;
  errors: Array<{
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
    suggestion?: string;
  }>;
}

export function useErrorScanning() {
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResult | null>(null);

  const scan = useCallback(async (code: string, language: string) => {
    setScanning(true);

    try {
      // In production, this would call a backend scanner
      // For now, this is a placeholder
      const res = await fetch('/api/ai/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });

      if (!res.ok) throw new Error('Scan failed');

      const data: ScanResult = await res.json();
      setResults(data);
      return data;
    } catch (error) {
      console.error('Scan failed:', error);
      throw error;
    } finally {
      setScanning(false);
    }
  }, []);

  return { scan, scanning, results };
}

// ============== USE_CODE_GENERATION ==============

interface GenerationOptions {
  language?: string;
  style?: 'educational' | 'professional' | 'experimental' | 'defensive' | 'minimalist';
  complexity?: 'simple' | 'moderate' | 'complex' | 'enterprise';
}

export function useCodeGeneration() {
  const { generate, loading, response, error } = useAIGeneration();

  const generateCode = useCallback(
    async (prompt: string, options?: GenerationOptions) => {
      return generate({
        taskType: 'generate',
        prompt,
        language: options?.language,
        complexity: options?.complexity || 'moderate',
      });
    },
    [generate]
  );

  return { generateCode, loading, response, error };
}

// ============== USE_AURA_INSIGHTS ==============

export function useAuraInsights(sessionId: string) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/insights`);
      if (!res.ok) throw new Error('Failed to fetch insights');
      const data = await res.json();
      setInsights(data);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      fetchInsights();
      const interval = setInterval(fetchInsights, 5000);
      return () => clearInterval(interval);
    }
  }, [sessionId, fetchInsights]);

  return { insights, loading, refetch: fetchInsights };
}

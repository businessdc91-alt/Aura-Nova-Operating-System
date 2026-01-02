'use client';

import { useState, useEffect, useCallback } from 'react';
import { ModelRegistryService, LocalModel, HealthCheckResult, trainingPackets } from './modelRegistry';
import { ModelHealthChecker } from './modelHealthChecker';

/**
 * Hook to manage the model registry
 */
export function useModelRegistry() {
  const [models, setModels] = useState<LocalModel[]>([]);
  const [activeModel, setActiveModel] = useState<LocalModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize models on mount
  useEffect(() => {
    const loadModels = () => {
      const allModels = ModelRegistryService.getAllModels();
      setModels(allModels);

      const active = ModelRegistryService.getActiveModel();
      setActiveModel(active);
      setIsLoading(false);
    };

    loadModels();
  }, []);

  const refreshModels = useCallback(() => {
    const allModels = ModelRegistryService.getAllModels();
    setModels(allModels);

    const active = ModelRegistryService.getActiveModel();
    setActiveModel(active);
  }, []);

  const switchModel = useCallback((modelId: string) => {
    ModelRegistryService.setActiveModel(modelId);
    const active = ModelRegistryService.getActiveModel();
    setActiveModel(active);
  }, []);

  const registerModel = useCallback(
    (
      modelName: string,
      friendlyName: string,
      endpoint: string,
      platform: 'lm-studio' | 'ollama',
      sizeB?: number
    ) => {
      const newModel = ModelRegistryService.registerModel({
        name: friendlyName,
        modelName,
        endpoint,
        platform,
        type: 'local',
        sizeB: sizeB || 0,
        health: {
          status: 'unknown',
          lastCheck: new Date(),
        },
        features: [],
        isFavorite: false,
      });
      refreshModels();
      return newModel;
    },
    [refreshModels]
  );

  const deleteModel = useCallback((modelId: string) => {
    ModelRegistryService.deleteModel(modelId);
    refreshModels();
  }, [refreshModels]);

  const toggleFavorite = useCallback((modelId: string) => {
    ModelRegistryService.toggleFavorite(modelId);
    refreshModels();
  }, [refreshModels]);

  const recordSession = useCallback((modelId: string) => {
    ModelRegistryService.recordSession(modelId);
    refreshModels();
  }, [refreshModels]);

  return {
    models,
    activeModel,
    isLoading,
    refreshModels,
    switchModel,
    registerModel,
    deleteModel,
    toggleFavorite,
    recordSession,
  };
}

/**
 * Hook to check health of a specific model
 */
export function useModelHealth(modelId: string | undefined) {
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!modelId) return;

    const checkHealth = async () => {
      setIsChecking(true);
      const model = ModelRegistryService.getModel(modelId);
      if (!model) {
        setIsChecking(false);
        return;
      }

      const result = await ModelHealthChecker.checkHealth(model);
      setHealth(result);
      setIsChecking(false);
    };

    // Initial check
    checkHealth();

    // Set up auto-check every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, [modelId]);

  return { health, isChecking };
}

/**
 * Hook to get currently active model
 */
export function useActiveModel() {
  const [activeModel, setActiveModel] = useState<LocalModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const active = ModelRegistryService.getActiveModel();
    setActiveModel(active);
    setIsLoading(false);
  }, []);

  return { activeModel, isLoading };
}

/**
 * Hook for the onboarding wizard
 */
export function useModelSetup() {
  const [step, setStep] = useState<'choose-platform' | 'configure' | 'test' | 'name' | 'done'>(
    'choose-platform'
  );
  const [platform, setPlatform] = useState<'lm-studio' | 'ollama' | null>(null);
  const [endpoint, setEndpoint] = useState('');
  const [modelName, setModelName] = useState('');
  const [friendlyName, setFriendlyName] = useState('');
  const [testResult, setTestResult] = useState<HealthCheckResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { registerModel } = useModelRegistry();

  const testConnection = useCallback(async () => {
    if (!endpoint) {
      setError('Please enter an endpoint');
      return;
    }

    setIsTesting(true);
    setError(null);

    try {
      const result = await ModelHealthChecker.checkHealthByEndpoint(endpoint, platform || 'lm-studio');
      setTestResult(result);

      if (result.status === 'healthy') {
        setError(null);
      } else {
        setError(result.errorMessage || 'Connection failed');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setTestResult(null);
    } finally {
      setIsTesting(false);
    }
  }, [endpoint, platform]);

  const completeSetup = useCallback(() => {
    if (!platform || !endpoint || !modelName || !friendlyName) {
      setError('Please fill in all fields');
      return;
    }

    try {
      registerModel(modelName, friendlyName, endpoint, platform);
      setStep('done');
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register model';
      setError(message);
    }
  }, [platform, endpoint, modelName, friendlyName, registerModel]);

  const nextStep = useCallback(() => {
    if (step === 'choose-platform') {
      if (!platform) {
        setError('Please select a platform');
        return;
      }
      setError(null);
      setStep('configure');
    } else if (step === 'configure') {
      if (!endpoint) {
        setError('Please enter an endpoint');
        return;
      }
      setError(null);
      setStep('test');
    } else if (step === 'test') {
      if (!testResult || testResult.status !== 'healthy') {
        setError('Connection must be tested and successful');
        return;
      }
      setError(null);
      setStep('name');
    } else if (step === 'name') {
      completeSetup();
    }
  }, [step, platform, endpoint, testResult, completeSetup]);

  const previousStep = useCallback(() => {
    if (step === 'configure') setStep('choose-platform');
    else if (step === 'test') setStep('configure');
    else if (step === 'name') setStep('test');
  }, [step]);

  return {
    step,
    setStep,
    platform,
    setPlatform,
    endpoint,
    setEndpoint,
    modelName,
    setModelName,
    friendlyName,
    setFriendlyName,
    testResult,
    isTesting,
    error,
    testConnection,
    nextStep,
    previousStep,
    completeSetup,
  };
}

/**
 * Hook to access training packets library
 */
export function useTrainingPackets() {
  const [packets, setPackets] = useState(trainingPackets.getAll());

  useEffect(() => {
    const loadPackets = () => {
      const allPackets = trainingPackets.getAll();
      setPackets(allPackets);
    };

    loadPackets();
  }, []);

  return packets;
}

/**
 * Hook for collaborative vibe coding sessions
 */
export function useDojoSession(userId: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turns, setTurns] = useState<any[]>([]);
  const [isActive, setIsActive] = useState(false);

  const startSession = useCallback(() => {
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    setIsActive(true);
    setTurns([]);
  }, []);

  const submitTurn = useCallback(
    (prompt: string, modelResponse: string, userApproval: boolean) => {
      if (!sessionId) return;

      const turn = {
        id: `turn-${Date.now()}`,
        timestamp: new Date().toISOString(),
        prompt,
        modelResponse,
        userApproval,
      };

      setTurns((prev) => [...prev, turn]);
    },
    [sessionId]
  );

  const endSession = useCallback(() => {
    setIsActive(false);
    // In a real app, this would save to Firestore
    return {
      sessionId,
      userId,
      turns,
      createdAt: new Date().toISOString(),
    };
  }, [sessionId, userId, turns]);

  return {
    sessionId,
    turns,
    isActive,
    startSession,
    submitTurn,
    endSession,
  };
}

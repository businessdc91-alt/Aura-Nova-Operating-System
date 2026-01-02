/**
 * React hooks for model management
 * Handles UI state for model selection, health checks, and bonding
 */

import { useState, useCallback, useEffect } from 'react';
import { modelRegistry } from '@/lib/modelRegistry';
import { ModelHealthChecker } from '@/lib/modelHealthChecker';
import type { LocalModel, TrainingPacket } from '@/lib/modelRegistry';

// ============== USE_MODEL_REGISTRY ==============

export function useModelRegistry() {
  const [models, setModels] = useState<LocalModel[]>([]);
  const [activeModel, setActiveModel] = useState<LocalModel | null>(null);

  const refreshModels = useCallback(() => {
    setModels(modelRegistry.getAllModels());
    setActiveModel(modelRegistry.getActiveModel() || null);
  }, []);

  useEffect(() => {
    refreshModels();
  }, [refreshModels]);

  const registerModel = useCallback(
    (model: Omit<LocalModel, 'id' | 'createdAt' | 'sessionCount'>) => {
      const registered = modelRegistry.registerModel(model);
      refreshModels();
      return registered;
    },
    [refreshModels]
  );

  const switchModel = useCallback(
    (id: string) => {
      const success = modelRegistry.setActiveModel(id);
      if (success) {
        refreshModels();
      }
      return success;
    },
    [refreshModels]
  );

  const deleteModel = useCallback(
    (id: string) => {
      const success = modelRegistry.deleteModel(id);
      if (success) {
        refreshModels();
      }
      return success;
    },
    [refreshModels]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      modelRegistry.toggleFavorite(id);
      refreshModels();
    },
    [refreshModels]
  );

  const recordSession = useCallback((success = true) => {
    if (activeModel) {
      modelRegistry.recordSession(activeModel.id, success);
      refreshModels();
    }
  }, [activeModel, refreshModels]);

  return {
    models,
    activeModel,
    registerModel,
    switchModel,
    deleteModel,
    toggleFavorite,
    recordSession,
    refresh: refreshModels,
  };
}

// ============== USE_MODEL_HEALTH ==============

export function useModelHealth(modelId?: string) {
  const [health, setHealth] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    if (!modelId) return;

    setChecking(true);
    setError(null);

    try {
      const model = modelRegistry.getModel(modelId);
      if (!model) {
        throw new Error('Model not found');
      }

      const result = await ModelHealthChecker.checkHealth(model);
      setHealth(result);

      if (result.status !== 'healthy') {
        setError(result.errorMessage || 'Model is not responding');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  }, [modelId]);

  useEffect(() => {
    if (modelId) {
      checkHealth();
      // Auto-check every 30 seconds
      const interval = setInterval(checkHealth, 30000);
      return () => clearInterval(interval);
    }
  }, [modelId, checkHealth]);

  return { health, checking, error, checkHealth };
}

// ============== USE_MODEL_SETUP ==============

export function useModelSetup() {
  const [step, setStep] = useState<'choose-platform' | 'configure' | 'test' | 'name' | 'done'>(
    'choose-platform'
  );
  const [platform, setPlatform] = useState<'lm-studio' | 'ollama' | null>(null);
  const [endpoint, setEndpoint] = useState('');
  const [modelName, setModelName] = useState('');
  const [friendlyName, setFriendlyName] = useState('');
  const [testing, setTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const guide = platform ? ModelHealthChecker.getConnectionGuide(platform) : null;

  const testConnection = useCallback(async () => {
    setTesting(true);
    setTestError(null);

    try {
      const response = await fetch(`${endpoint}/api/status`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      setStep('name');
    } catch (err: any) {
      setTestError(err.message || 'Connection failed');
    } finally {
      setTesting(false);
    }
  }, [endpoint]);

  const finishSetup = useCallback(() => {
    if (!platform || !modelName || !friendlyName || !endpoint) {
      setTestError('Missing required fields');
      return;
    }

    const model = modelRegistry.registerModel({
      name: friendlyName,
      type: 'local',
      modelName,
      sizeB: 4, // TODO: detect from model
      endpoint,
      platform,
      features: ['coding', 'creative'],
      isFavorite: true,
      health: { status: 'healthy', lastCheck: new Date() },
    });

    // Start monitoring
    ModelHealthChecker.startMonitoring(model.id);

    setStep('done');
    return model;
  }, [platform, modelName, friendlyName, endpoint]);

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
    testing,
    testError,
    guide,
    testConnection,
    finishSetup,
  };
}

// ============== USE_ACTIVE_MODEL ==============

export function useActiveModel() {
  const [model, setModel] = useState<LocalModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setModel(modelRegistry.getActiveModel() || null);
    setLoading(false);

    // Listen for changes
    const interval = setInterval(() => {
      setModel(modelRegistry.getActiveModel() || null);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { model, loading };
}

// ============== USE_TRAINING_PACKETS ==============

export function useTrainingPackets() {
  const [packets, setPackets] = useState<TrainingPacket[]>([]);

  useEffect(() => {
    const { trainingPackets } = require('@/lib/modelRegistry');
    setPackets(trainingPackets.getAll());
  }, []);

  const getByCategory = useCallback((category: TrainingPacket['category']) => {
    const { trainingPackets } = require('@/lib/modelRegistry');
    return trainingPackets.getByCategory(category);
  }, []);

  return { packets, getByCategory };
}

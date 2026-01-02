/**
 * Model Health Check Service
 * Verifies local models are running and responsive
 * Tracks latency and availability
 */

import { ModelRegistryService, type LocalModel, type HealthCheckResult } from './modelRegistry';

class ModelHealthCheckerService {
  private checkIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private readonly TIMEOUT_MS = 5000;
  private readonly CHECK_INTERVAL_MS = 30000; // 30 seconds

  /**
   * Check health of a single model
   */
  async checkHealth(model: LocalModel): Promise<HealthCheckResult> {
    if (model.platform === 'cloud') {
      // Cloud models don't need health checks - assume healthy
      return {
        modelId: model.id,
        status: 'healthy',
        latency: 0,
        errorMessage: null,
        timestamp: new Date().toISOString(),
      };
    }
    return this.checkHealthByEndpoint(model.endpoint, model.platform);
  }

  /**
   * Check health by endpoint directly (for onboarding)
   */
  async checkHealthByEndpoint(
    endpoint: string,
    platform: 'lm-studio' | 'ollama'
  ): Promise<HealthCheckResult> {
    const startTime = performance.now();

    try {
      const url = platform === 'lm-studio' 
        ? `${endpoint}/api/status`
        : `${endpoint}/api/tags`;

      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(this.TIMEOUT_MS),
      }).catch((error) => {
        throw new Error(`Connection failed: ${error.message}`);
      });

      const latency = Math.round(performance.now() - startTime);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return {
        modelId: '',
        status: 'healthy',
        latency,
        errorMessage: null,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      const latency = Math.round(performance.now() - startTime);

      return {
        modelId: '',
        status: 'unhealthy',
        latency,
        errorMessage: error.message || 'Connection failed',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Check all local models
   */
  async checkAllLocalModels(): Promise<HealthCheckResult[]> {
    const localModels = ModelRegistryService.getAllModels();
    const results = await Promise.all(localModels.map((m) => this.checkHealth(m)));
    return results;
  }

  /**
   * Start continuous health checks for a model
   */
  startMonitoring(modelId: string): void {
    if (this.checkIntervals.has(modelId)) {
      return; // Already monitoring
    }

    const interval = setInterval(async () => {
      const model = ModelRegistryService.getModel(modelId);
      if (model) {
        const result = await this.checkHealth(model);
        ModelRegistryService.updateHealth(modelId, {
          status: result.status,
          latency: result.latency,
        });
      }
    }, this.CHECK_INTERVAL_MS);

    this.checkIntervals.set(modelId, interval);
  }

  /**
   * Stop monitoring a model
   */
  stopMonitoring(modelId: string): void {
    const interval = this.checkIntervals.get(modelId);
    if (interval) {
      clearInterval(interval);
      this.checkIntervals.delete(modelId);
    }
  }

  /**
   * Stop all monitoring
   */
  stopAllMonitoring(): void {
    this.checkIntervals.forEach((interval) => clearInterval(interval));
    this.checkIntervals.clear();
  }

  /**
   * Get connection info for setup help
   */
  getConnectionGuide(platform: 'lm-studio' | 'ollama'): {
    name: string;
    url: string;
    defaultEndpoint: string;
    instructions: string[];
  } {
    if (platform === 'lm-studio') {
      return {
        name: 'LM Studio',
        url: 'https://lmstudio.ai',
        defaultEndpoint: 'http://localhost:1234',
        instructions: [
          '1. Download and install LM Studio from lmstudio.ai',
          '2. Select a model from the library (try Gemma 2B or Phi 3)',
          '3. Click "Load" to start the model',
          '4. Go to the "Developer Console" tab',
          '5. Start the Local Server (should run on localhost:1234)',
          '6. Come back here and test the connection',
        ],
      };
    }

    if (platform === 'ollama') {
      return {
        name: 'Ollama',
        url: 'https://ollama.ai',
        defaultEndpoint: 'http://localhost:11434',
        instructions: [
          '1. Download and install Ollama from ollama.ai',
          '2. Run: ollama pull gemma:2b (or another model)',
          '3. Start the server: ollama serve',
          '4. The API will be available at localhost:11434',
          '5. Come back here and test the connection',
        ],
      };
    }

    return {
      name: 'Unknown',
      url: '',
      defaultEndpoint: '',
      instructions: [],
    };
  }
}

export const ModelHealthChecker = new ModelHealthCheckerService();

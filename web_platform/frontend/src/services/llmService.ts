/**
 * LLM CONNECTION SERVICE
 * Handles connections to local LLMs (LM Studio/Ollama) and cloud APIs
 */

export interface LLMConfig {
  method: 'lmstudio' | 'ollama' | 'cloud' | 'none';
  model: string;
  endpoint?: string;
}

export interface LLMConnectionStatus {
  connected: boolean;
  method: string;
  model: string;
  latency?: number;
}

class LLMService {
  private config: LLMConfig = {
    method: 'none',
    model: 'none',
  };

  private readonly ENDPOINTS = {
    lmstudio: 'http://localhost:1234',
    ollama: 'http://localhost:11434',
  };

  /**
   * Configure LLM connection
   */
  setConfig(config: LLMConfig) {
    this.config = config;
    localStorage.setItem('llm_config', JSON.stringify(config));
  }

  /**
   * Load saved config from localStorage
   */
  loadConfig(): LLMConfig {
    try {
      const saved = localStorage.getItem('llm_config');
      if (saved) {
        this.config = JSON.parse(saved);
        return this.config;
      }
    } catch (error) {
      console.error('Failed to load LLM config:', error);
    }
    return this.config;
  }

  /**
   * Test connection to LLM
   */
  async testConnection(): Promise<LLMConnectionStatus> {
    const startTime = performance.now();

    try {
      if (this.config.method === 'lmstudio') {
        const response = await fetch(`${this.ENDPOINTS.lmstudio}/v1/models`, {
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          return {
            connected: true,
            method: 'lmstudio',
            model: this.config.model,
            latency: performance.now() - startTime,
          };
        }
      } else if (this.config.method === 'ollama') {
        const response = await fetch(`${this.ENDPOINTS.ollama}/api/tags`, {
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          return {
            connected: true,
            method: 'ollama',
            model: this.config.model,
            latency: performance.now() - startTime,
          };
        }
      } else if (this.config.method === 'cloud') {
        // Cloud AI is always "connected" if configured
        return {
          connected: true,
          method: 'cloud',
          model: this.config.model,
          latency: 0,
        };
      }
    } catch (error) {
      console.error('Connection test failed:', error);
    }

    return {
      connected: false,
      method: this.config.method,
      model: this.config.model,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): LLMConfig {
    return this.config;
  }

  /**
   * Check if LLM is configured
   */
  isConfigured(): boolean {
    return this.config.method !== 'none';
  }

  /**
   * Check if setup wizard should be shown
   */
  shouldShowSetupWizard(): boolean {
    const dismissed = localStorage.getItem('llm_setup_dismissed');
    return !this.isConfigured() && !dismissed;
  }

  /**
   * Mark setup wizard as dismissed
   */
  dismissSetupWizard() {
    localStorage.setItem('llm_setup_dismissed', 'true');
  }
}

export const llmService = new LLMService();

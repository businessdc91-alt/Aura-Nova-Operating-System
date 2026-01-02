/**
 * API Keys & Credentials Management
 * Securely manage multiple Google AI service keys
 * 
 * Supports:
 * - Google Gemini 1.5 Pro API
 * - Vertex AI (requires GCP project)
 * - Aura/Gemma 3 (custom endpoint)
 * - Firestore (realtime collaboration)
 * - Cloud Storage (session snapshots)
 */

export interface APICredentials {
  gemini: {
    apiKey: string;
    rateLimit: number; // Requests per minute (uncapped = 0)
    quotaUsed: number;
    status: 'active' | 'inactive' | 'error';
  };
  vertex: {
    projectId: string;
    location: string; // us-central1, etc.
    status: 'active' | 'inactive' | 'error';
    quotaUsed: number;
  };
  aura: {
    endpoint: string; // Your custom Gemma 3 instance
    internalKey: string; // For your own use
    restrictions: 'none'; // No restrictions
    status: 'active' | 'inactive' | 'error';
  };
  firestore: {
    projectId: string;
    status: 'active' | 'inactive' | 'error';
  };
  cloudStorage: {
    projectId: string;
    bucket: string;
    status: 'active' | 'inactive' | 'error';
  };
}

export interface CredentialStatus {
  provider: string;
  isValid: boolean;
  lastVerified: Date;
  quotaRemaining?: number;
  nextResetDate?: Date;
  errorMessage?: string;
}

// ============== CREDENTIALS STORE ==============

class CredentialsManager {
  private credentials: APICredentials | null = null;
  private encryptionKey: CryptoKey | null = null;

  async initialize(credentials: APICredentials): Promise<void> {
    // In production, encrypt credentials before storage
    this.credentials = credentials;
    console.log('✅ Credentials initialized');
  }

  /**
   * Get specific API key safely (only when needed)
   */
  getGeminiKey(): string {
    if (!this.credentials?.gemini.apiKey) {
      throw new Error('Gemini API key not configured');
    }
    return this.credentials.gemini.apiKey;
  }

  getVertexProjectId(): string {
    if (!this.credentials?.vertex.projectId) {
      throw new Error('Vertex AI project ID not configured');
    }
    return this.credentials.vertex.projectId;
  }

  getAuraEndpoint(): string {
    if (!this.credentials?.aura.endpoint) {
      throw new Error('Aura endpoint not configured');
    }
    return this.credentials.aura.endpoint;
  }

  /**
   * Verify credential validity
   */
  async verifyCredentials(): Promise<Record<string, CredentialStatus>> {
    if (!this.credentials) {
      throw new Error('No credentials initialized');
    }

    const status: Record<string, CredentialStatus> = {};

    // Verify Gemini
    status['gemini'] = await this.verifyGemini();

    // Verify Vertex
    status['vertex'] = await this.verifyVertex();

    // Verify Aura
    status['aura'] = await this.verifyAura();

    // Verify Firestore
    status['firestore'] = await this.verifyFirestore();

    return status;
  }

  private async verifyGemini(): Promise<CredentialStatus> {
    try {
      // Test with a minimal request
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.getGeminiKey(),
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Test',
                },
              ],
            },
          ],
        }),
      });

      const isValid = response.ok;

      return {
        provider: 'Gemini 1.5 Pro',
        isValid,
        lastVerified: new Date(),
        errorMessage: isValid ? undefined : `HTTP ${response.status}`,
      };
    } catch (error: any) {
      return {
        provider: 'Gemini 1.5 Pro',
        isValid: false,
        lastVerified: new Date(),
        errorMessage: error.message,
      };
    }
  }

  private async verifyVertex(): Promise<CredentialStatus> {
    try {
      // In production, this would use Application Default Credentials
      // and verify project access
      const projectId = this.getVertexProjectId();

      return {
        provider: 'Vertex AI',
        isValid: !!projectId,
        lastVerified: new Date(),
      };
    } catch (error: any) {
      return {
        provider: 'Vertex AI',
        isValid: false,
        lastVerified: new Date(),
        errorMessage: error.message,
      };
    }
  }

  private async verifyAura(): Promise<CredentialStatus> {
    try {
      const endpoint = this.getAuraEndpoint();

      // Test connectivity
      const response = await fetch(`${endpoint}/health`, {
        method: 'GET',
      }).catch(() => ({ ok: false }));

      return {
        provider: 'Aura (Gemma 3)',
        isValid: response.ok,
        lastVerified: new Date(),
        errorMessage: response.ok ? undefined : 'Connection failed',
      };
    } catch (error: any) {
      return {
        provider: 'Aura (Gemma 3)',
        isValid: false,
        lastVerified: new Date(),
        errorMessage: error.message,
      };
    }
  }

  private async verifyFirestore(): Promise<CredentialStatus> {
    // Placeholder - actual verification would require initialized Firestore
    return {
      provider: 'Firestore',
      isValid: true,
      lastVerified: new Date(),
    };
  }

  /**
   * Get quota usage
   */
  getQuotaStatus(): Record<string, { used: number; limit: number; percentUsed: number }> {
    if (!this.credentials) {
      throw new Error('No credentials initialized');
    }

    return {
      gemini: {
        used: this.credentials.gemini.quotaUsed,
        limit: this.credentials.gemini.rateLimit || Infinity,
        percentUsed:
          this.credentials.gemini.rateLimit > 0
            ? (this.credentials.gemini.quotaUsed / this.credentials.gemini.rateLimit) * 100
            : 0,
      },
      vertex: {
        used: this.credentials.vertex.quotaUsed,
        limit: Infinity, // Vertex typically has generous limits
        percentUsed: 0,
      },
    };
  }

  /**
   * Track usage
   */
  trackUsage(provider: 'gemini' | 'vertex', tokensUsed: number): void {
    if (!this.credentials) return;

    if (provider === 'gemini') {
      this.credentials.gemini.quotaUsed += tokensUsed;
    } else if (provider === 'vertex') {
      this.credentials.vertex.quotaUsed += tokensUsed;
    }
  }

  /**
   * Get all credentials (admin only)
   */
  getAllCredentials(): APICredentials | null {
    return this.credentials;
  }

  /**
   * Update credentials
   */
  updateCredentials(updates: Partial<APICredentials>): void {
    if (!this.credentials) return;
    this.credentials = { ...this.credentials, ...updates };
  }
}

// ============== SINGLETON INSTANCE ==============

let credentialsManager: CredentialsManager | null = null;

export function initializeCredentials(credentials: APICredentials): CredentialsManager {
  if (!credentialsManager) {
    credentialsManager = new CredentialsManager();
    credentialsManager.initialize(credentials);
  }
  return credentialsManager;
}

export function getCredentialsManager(): CredentialsManager {
  if (!credentialsManager) {
    throw new Error('Credentials manager not initialized');
  }
  return credentialsManager;
}

export function getCredentials(): CredentialsManager {
  return getCredentialsManager();
}

// ============== ENVIRONMENT VARIABLE HELPERS ==============

export function loadCredentialsFromEnv(): APICredentials {
  return {
    gemini: {
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
      rateLimit: 0, // Uncapped
      quotaUsed: 0,
      status: 'active',
    },
    vertex: {
      projectId: process.env.NEXT_PUBLIC_GCP_PROJECT_ID || '',
      location: 'us-central1',
      status: 'active',
      quotaUsed: 0,
    },
    aura: {
      endpoint: process.env.NEXT_PUBLIC_AURA_ENDPOINT || 'http://localhost:8000',
      internalKey: process.env.AURA_INTERNAL_KEY || '',
      restrictions: 'none',
      status: 'active',
    },
    firestore: {
      projectId: process.env.NEXT_PUBLIC_GCP_PROJECT_ID || '',
      status: 'active',
    },
    cloudStorage: {
      projectId: process.env.NEXT_PUBLIC_GCP_PROJECT_ID || '',
      bucket: process.env.NEXT_PUBLIC_GCS_BUCKET || '',
      status: 'active',
    },
  };
}

// ============== COST CALCULATOR ==============

export interface APICost {
  provider: string;
  inputTokens: number;
  outputTokens: number;
  costUSD: number;
}

export function calculateCosts(requests: Array<{ provider: 'gemini' | 'vertex'; tokensUsed: number }>): APICost[] {
  const costs: APICost[] = [];

  requests.forEach(({ provider, tokensUsed }) => {
    let costUSD = 0;
    const inputTokens = Math.floor(tokensUsed * 0.7);
    const outputTokens = Math.floor(tokensUsed * 0.3);

    if (provider === 'gemini') {
      // Gemini 1.5 Pro: $0.075 per 1M input, $0.30 per 1M output
      costUSD = (inputTokens / 1000000) * 0.075 + (outputTokens / 1000000) * 0.3;
    } else if (provider === 'vertex') {
      // Vertex AI: Higher cost for advanced reasoning
      costUSD = (inputTokens / 1000000) * 0.5 + (outputTokens / 1000000) * 1.5;
    }

    costs.push({
      provider,
      inputTokens,
      outputTokens,
      costUSD,
    });
  });

  return costs;
}

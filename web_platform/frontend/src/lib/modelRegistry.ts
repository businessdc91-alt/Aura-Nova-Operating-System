/**
 * Model Registry
 * Manages user's local and cloud AI models
 * Stores preferences, health status, and bonding metadata
 */

export interface LocalModel {
  id: string;
  name: string; // User-given name ("My Friend Gemma", etc.)
  type: 'local' | 'cloud';
  modelName: string; // "gemma-3-4b", "phi-3-small", etc.
  sizeB: number; // Size in billions of parameters
  endpoint: string; // localhost:1234, etc.
  platform: 'lm-studio' | 'ollama' | 'cloud';
  createdAt: Date;
  lastUsed?: Date;
  sessionCount: number;
  health: {
    status: 'healthy' | 'unhealthy' | 'unknown';
    lastCheck: Date;
    latency?: number;
  };
  features: string[]; // ["coding", "creative", "analysis"]
  isFavorite: boolean;
}

export interface TrainingPacket {
  id: string;
  name: string;
  category: 'graphics' | 'gamedev' | 'coding' | 'creative';
  subcategory?: string; // "zelda-style", "pixel-art", etc.
  downloadUrl: string;
  size: string; // "250MB", "1.2GB"
  description: string;
  usedBy?: string[]; // Model IDs that can use this
}

export interface HealthCheckResult {
  modelId: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  latency: number;
  errorMessage: string | null;
  timestamp: string;
}

class ModelRegistryServiceClass {
  private models: Map<string, LocalModel> = new Map();
  private activeModelId: string | null = null;
  private storageKey = 'aura-model-registry';

  constructor() {
    this.loadFromStorage();
  }

  // ============== MODEL MANAGEMENT ==============

  registerModel(model: Omit<LocalModel, 'id' | 'createdAt' | 'sessionCount'>): LocalModel {
    const id = `model-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const fullModel: LocalModel = {
      ...model,
      id,
      createdAt: new Date(),
      sessionCount: 0,
    };

    this.models.set(id, fullModel);
    this.saveToStorage();

    return fullModel;
  }

  getModel(id: string): LocalModel | undefined {
    return this.models.get(id);
  }

  getAllModels(): LocalModel[] {
    return Array.from(this.models.values());
  }

  getLocalModels(): LocalModel[] {
    return this.getAllModels().filter((m) => m.type === 'local');
  }

  getCloudModels(): LocalModel[] {
    return this.getAllModels().filter((m) => m.type === 'cloud');
  }

  updateModel(id: string, updates: Partial<LocalModel>): LocalModel | undefined {
    const model = this.models.get(id);
    if (!model) return undefined;

    const updated = { ...model, ...updates };
    this.models.set(id, updated);
    this.saveToStorage();

    return updated;
  }

  deleteModel(id: string): boolean {
    const deleted = this.models.delete(id);
    if (deleted) {
      if (this.activeModelId === id) {
        this.activeModelId = null;
      }
      this.saveToStorage();
    }
    return deleted;
  }

  // ============== ACTIVE MODEL ==============

  setActiveModel(id: string): boolean {
    if (!this.models.has(id)) return false;
    this.activeModelId = id;
    this.saveToStorage();
    return true;
  }

  getActiveModel(): LocalModel | undefined {
    return this.activeModelId ? this.models.get(this.activeModelId) : undefined;
  }

  // ============== SESSION TRACKING ==============

  recordSession(modelId: string, success: boolean = true): void {
    const model = this.models.get(modelId);
    if (model) {
      model.sessionCount++;
      model.lastUsed = new Date();
      this.saveToStorage();
    }
  }

  // ============== HEALTH TRACKING ==============

  updateHealth(
    modelId: string,
    health: Partial<LocalModel['health']>
  ): LocalModel | undefined {
    const model = this.models.get(modelId);
    if (!model) return undefined;

    model.health = {
      ...model.health,
      ...health,
      lastCheck: new Date(),
    };

    this.saveToStorage();
    return model;
  }

  // ============== FAVORITES ==============

  toggleFavorite(modelId: string): boolean {
    const model = this.models.get(modelId);
    if (!model) return false;

    model.isFavorite = !model.isFavorite;
    this.saveToStorage();
    return model.isFavorite;
  }

  getFavorites(): LocalModel[] {
    return this.getAllModels().filter((m) => m.isFavorite);
  }

  // ============== STORAGE ==============

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    const data = {
      models: Array.from(this.models.entries()),
      activeModelId: this.activeModelId,
    };

    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return;

    try {
      const data = JSON.parse(stored);
      this.models = new Map(data.models);
      this.activeModelId = data.activeModelId;
    } catch (error) {
      console.error('Failed to load model registry:', error);
    }
  }

  clear(): void {
    this.models.clear();
    this.activeModelId = null;
    this.saveToStorage();
  }
}

// ============== TRAINING PACKETS ==============

class TrainingPacketLibrary {
  private packets: Map<string, TrainingPacket> = new Map();

  constructor() {
    this.initializePackets();
  }

  private initializePackets(): void {
    // Placeholder packets - user can add more or we curate over time
    const defaultPackets: TrainingPacket[] = [
      {
        id: 'zelda-oot-graphics',
        name: 'Zelda: Ocarina of Time Style Pack',
        category: 'graphics',
        subcategory: 'zelda-style',
        downloadUrl: 'https://example.com/zelda-oot-pack.zip', // TODO: find real source
        size: '850MB',
        description: 'Complete asset pack with Zelda OoT-style 3D models, textures, and design guidelines',
      },
      {
        id: 'pixel-art-classic',
        name: 'Classic Pixel Art Library',
        category: 'graphics',
        subcategory: 'pixel-art',
        downloadUrl: 'https://example.com/pixel-art-lib.zip',
        size: '420MB',
        description: 'Retro pixel art assets for 2D games, characters, tiles, effects',
      },
      {
        id: 'unity-game-starter',
        name: 'Unity Game Development Starter',
        category: 'gamedev',
        downloadUrl: 'https://example.com/unity-starter.zip',
        size: '1.2GB',
        description: 'Unity project template with common game dev libraries and systems',
      },
      {
        id: 'unreal-game-starter',
        name: 'Unreal Engine Game Starter',
        category: 'gamedev',
        downloadUrl: 'https://example.com/unreal-starter.zip',
        size: '2.1GB',
        description: 'UE5 project template with blueprints and C++ starter code',
      },
      {
        id: 'javascript-gamedev',
        name: 'JavaScript Game Dev Library',
        category: 'coding',
        downloadUrl: 'https://example.com/js-gamedev.zip',
        size: '180MB',
        description: 'Phaser 3, Babylon.js, and Three.js libraries for web-based games',
      },
    ];

    defaultPackets.forEach((packet) => {
      this.packets.set(packet.id, packet);
    });
  }

  getPacket(id: string): TrainingPacket | undefined {
    return this.packets.get(id);
  }

  getByCategory(category: TrainingPacket['category']): TrainingPacket[] {
    return Array.from(this.packets.values()).filter((p) => p.category === category);
  }

  getAll(): TrainingPacket[] {
    return Array.from(this.packets.values());
  }

  addPacket(packet: TrainingPacket): void {
    this.packets.set(packet.id, packet);
  }
}

// ============== SINGLETON EXPORTS ==============

export const ModelRegistryService = new ModelRegistryServiceClass();
export const modelRegistry = ModelRegistryService;
export const trainingPackets = new TrainingPacketLibrary();

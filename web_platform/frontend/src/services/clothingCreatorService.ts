'use client';

/**
 * Clothing Creator Service
 * Manages clothing item creation, customization, and composition
 */

export interface ClothingItem {
  id: string;
  name: string;
  type: 'top' | 'bottom' | 'shoes' | 'accessory' | 'hat' | 'coat' | 'dress' | 'full-body';
  category: 'casual' | 'formal' | 'sport' | 'fantasy' | 'historical' | 'futuristic' | 'custom';
  baseColor: string;
  patterns?: ClothingPattern[];
  fit: 'loose' | 'fitted' | 'oversized' | 'slim' | 'relaxed';
  material?: string;
  layers: ClothingLayer[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    creator?: string;
    tags: string[];
  };
  preview?: string; // Base64 or URL
  public: boolean;
}

export interface ClothingPattern {
  id: string;
  name: string;
  type: 'stripes' | 'checkered' | 'polka-dots' | 'floral' | 'geometric' | 'gradient';
  opacity: number;
  color: string;
  secondaryColor?: string;
  scale: number;
}

export interface ClothingLayer {
  id: string;
  name: string;
  order: number;
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'lighten';
  visible: boolean;
  content: string; // Canvas drawing or SVG
}

export interface ClothingTemplate {
  id: string;
  name: string;
  type: ClothingItem['type'];
  baseShape: string; // SVG or canvas template
  editableAreas: EditableArea[];
  defaultColors: string[];
}

export interface EditableArea {
  id: string;
  name: string;
  path?: string; // SVG path
  defaultColor: string;
  allowedColors: string[];
}

export interface BodySize {
  chest: number;
  waist: number;
  inseam: number;
  shoulderWidth: number;
}

export interface Outfit {
  id: string;
  name: string;
  itemIds: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  description?: string;
  preview?: string;
}

export class ClothingCreatorService {
  private static DB_NAME = 'AuraClothingStudio';
  private static STORE_NAMES = {
    ITEMS: 'clothingItems',
    TEMPLATES: 'templates',
    OUTFITS: 'outfits',
    SAVED_DESIGNS: 'savedDesigns',
  };

  /**
   * Initialize IndexedDB
   */
  static async initializeDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(this.STORE_NAMES.ITEMS)) {
          const itemStore = db.createObjectStore(this.STORE_NAMES.ITEMS, { keyPath: 'id' });
          itemStore.createIndex('type', 'type', { unique: false });
          itemStore.createIndex('category', 'category', { unique: false });
          itemStore.createIndex('public', 'public', { unique: false });
          itemStore.createIndex('tags', 'metadata.tags', { unique: false, multiEntry: true });
        }

        if (!db.objectStoreNames.contains(this.STORE_NAMES.TEMPLATES)) {
          const templateStore = db.createObjectStore(this.STORE_NAMES.TEMPLATES, { keyPath: 'id' });
          templateStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains(this.STORE_NAMES.OUTFITS)) {
          db.createObjectStore(this.STORE_NAMES.OUTFITS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(this.STORE_NAMES.SAVED_DESIGNS)) {
          db.createObjectStore(this.STORE_NAMES.SAVED_DESIGNS, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Create a new clothing item
   */
  static async createItem(item: Omit<ClothingItem, 'id' | 'metadata'>): Promise<ClothingItem> {
    const db = await this.initializeDB();
    const itemId = `clothing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const fullItem: ClothingItem = {
      ...item,
      id: itemId,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      },
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.ITEMS], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.ITEMS);
      const request = store.add(fullItem);

      request.onsuccess = () => resolve(fullItem);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get item by ID
   */
  static async getItem(id: string): Promise<ClothingItem | null> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.ITEMS], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.ITEMS);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all items of a type
   */
  static async getItemsByType(type: ClothingItem['type']): Promise<ClothingItem[]> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.ITEMS], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.ITEMS);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get items by category
   */
  static async getItemsByCategory(category: ClothingItem['category']): Promise<ClothingItem[]> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.ITEMS], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.ITEMS);
      const index = store.index('category');
      const request = index.getAll(category);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all public items
   */
  static async getPublicItems(): Promise<ClothingItem[]> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.ITEMS], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.ITEMS);
      const request = store.getAll();

      request.onsuccess = () => {
        const allItems = request.result as ClothingItem[];
        resolve(allItems.filter(item => item.public === true));
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Search items by tags
   */
  static async searchByTags(tags: string[]): Promise<ClothingItem[]> {
    const db = await this.initializeDB();
    const results: ClothingItem[] = [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.ITEMS], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.ITEMS);
      const index = store.index('tags');

      let completed = 0;

      for (const tag of tags) {
        const request = index.getAll(tag);
        request.onsuccess = () => {
          results.push(...request.result);
          completed++;
          if (completed === tags.length) {
            const unique = Array.from(new Map(results.map(item => [item.id, item])).values());
            resolve(unique);
          }
        };
        request.onerror = () => reject(request.error);
      }

      if (tags.length === 0) resolve([]);
    });
  }

  /**
   * Update clothing item
   */
  static async updateItem(id: string, updates: Partial<ClothingItem>): Promise<void> {
    const db = await this.initializeDB();
    const item = await this.getItem(id);

    if (!item) throw new Error('Item not found');

    const updated: ClothingItem = {
      ...item,
      ...updates,
      metadata: {
        ...item.metadata,
        updatedAt: new Date(),
      },
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.ITEMS], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.ITEMS);
      const request = store.put(updated);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete item
   */
  static async deleteItem(id: string): Promise<void> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.ITEMS], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.ITEMS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generate clothing preview as canvas
   */
  static async generatePreview(item: ClothingItem, size: { width: number; height: number } = { width: 256, height: 384 }): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext('2d')!;

    // Draw background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, size.width, size.height);

    // Draw base color
    ctx.fillStyle = item.baseColor;
    this.drawClothingShape(ctx, item.type, size);

    // Draw patterns
    if (item.patterns) {
      for (const pattern of item.patterns) {
        this.drawPattern(ctx, pattern, size);
      }
    }

    return canvas.toDataURL('image/png');
  }

  private static drawClothingShape(ctx: CanvasRenderingContext2D, type: string, size: { width: number; height: number }): void {
    const centerX = size.width / 2;
    const centerY = size.height / 2;

    switch (type) {
      case 'top':
        // Draw shirt shape
        ctx.beginPath();
        ctx.moveTo(centerX - 40, centerY - 60);
        ctx.lineTo(centerX - 50, centerY - 30);
        ctx.lineTo(centerX - 50, centerY + 40);
        ctx.lineTo(centerX + 50, centerY + 40);
        ctx.lineTo(centerX + 50, centerY - 30);
        ctx.lineTo(centerX + 40, centerY - 60);
        ctx.closePath();
        ctx.fill();
        break;

      case 'bottom':
        // Draw pants shape
        ctx.beginPath();
        ctx.moveTo(centerX - 40, centerY - 20);
        ctx.lineTo(centerX - 35, centerY + 80);
        ctx.lineTo(centerX - 15, centerY + 80);
        ctx.lineTo(centerX - 20, centerY - 20);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(centerX + 40, centerY - 20);
        ctx.lineTo(centerX + 35, centerY + 80);
        ctx.lineTo(centerX + 15, centerY + 80);
        ctx.lineTo(centerX + 20, centerY - 20);
        ctx.closePath();
        ctx.fill();
        break;

      case 'dress':
        // Draw dress shape
        ctx.beginPath();
        ctx.moveTo(centerX - 40, centerY - 60);
        ctx.lineTo(centerX - 60, centerY);
        ctx.lineTo(centerX - 50, centerY + 80);
        ctx.lineTo(centerX + 50, centerY + 80);
        ctx.lineTo(centerX + 60, centerY);
        ctx.lineTo(centerX + 40, centerY - 60);
        ctx.closePath();
        ctx.fill();
        break;

      case 'shoes':
        // Draw shoes
        ctx.beginPath();
        ctx.ellipse(centerX - 25, centerY, 20, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + 25, centerY, 20, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'hat':
        // Draw hat
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 40, 35, 15, 0, 0, Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(centerX - 40, centerY - 40);
        ctx.lineTo(centerX - 50, centerY - 50);
        ctx.lineTo(centerX + 50, centerY - 50);
        ctx.lineTo(centerX + 40, centerY - 40);
        ctx.closePath();
        ctx.fill();
        break;

      default:
        ctx.fillRect(centerX - 40, centerY - 60, 80, 120);
    }
  }

  private static drawPattern(ctx: CanvasRenderingContext2D, pattern: ClothingPattern, size: { width: number; height: number }): void {
    ctx.globalAlpha = pattern.opacity;
    ctx.fillStyle = pattern.color;

    const step = 10 / pattern.scale;

    switch (pattern.type) {
      case 'stripes':
        for (let x = 0; x < size.width; x += step) {
          ctx.fillRect(x, 0, step / 2, size.height);
        }
        break;

      case 'checkered':
        for (let y = 0; y < size.height; y += step) {
          for (let x = 0; x < size.width; x += step) {
            if ((x + y) % (step * 2) === 0) {
              ctx.fillRect(x, y, step, step);
            }
          }
        }
        break;

      case 'polka-dots':
        for (let y = 0; y < size.height; y += step) {
          for (let x = 0; x < size.width; x += step) {
            ctx.beginPath();
            ctx.arc(x + step / 2, y + step / 2, step / 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;

      case 'gradient':
        const gradient = ctx.createLinearGradient(0, 0, size.width, size.height);
        gradient.addColorStop(0, pattern.color);
        gradient.addColorStop(1, pattern.secondaryColor || pattern.color);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size.width, size.height);
        break;
    }

    ctx.globalAlpha = 1;
  }

  /**
   * Create a complete outfit from multiple items
   */
  static async createOutfit(
    name: string,
    items: ClothingItem[],
    description?: string
  ): Promise<{
    id: string;
    name: string;
    items: ClothingItem[];
    preview?: string;
  }> {
    const db = await this.initializeDB();
    const outfitId = `outfit-${Date.now()}`;

    // Generate combined preview
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;

    // Draw background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, 256, 384);

    // Draw items in order (bottom to top)
    for (const item of items.sort((a, b) => {
      const order: Record<string, number> = {
        'shoes': 0,
        'bottom': 1,
        'top': 2,
        'coat': 3,
        'accessory': 4,
        'hat': 5,
      };
      return (order[a.type] || 10) - (order[b.type] || 10);
    })) {
      if (item.preview) {
        const img = new Image();
        img.src = item.preview;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 256, 384);
        };
      }
    }

    const outfit = {
      id: outfitId,
      name,
      description,
      items: items.map(i => i.id),
      itemDetails: items,
      preview: canvas.toDataURL('image/png'),
      createdAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.OUTFITS], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.OUTFITS);
      const request = store.add(outfit);

      request.onsuccess = () => resolve({ id: outfit.id, name: outfit.name, items, preview: outfit.preview });
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all outfits
   */
  static async getOutfits(): Promise<any[]> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.OUTFITS], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.OUTFITS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add pattern to item
   */
  static async addPattern(itemId: string, pattern: Omit<ClothingPattern, 'id'>): Promise<void> {
    const item = await this.getItem(itemId);
    if (!item) throw new Error('Item not found');

    const newPattern: ClothingPattern = {
      ...pattern,
      id: `pattern-${Date.now()}`,
    };

    item.patterns = item.patterns || [];
    item.patterns.push(newPattern);

    await this.updateItem(itemId, item);
  }

  /**
   * Remove pattern from item
   */
  static async removePattern(itemId: string, patternId: string): Promise<void> {
    const item = await this.getItem(itemId);
    if (!item) throw new Error('Item not found');

    item.patterns = (item.patterns || []).filter(p => p.id !== patternId);
    await this.updateItem(itemId, item);
  }

  /**
   * Export item as JSON
   */
  static exportAsJSON(item: ClothingItem): Blob {
    const json = JSON.stringify(item, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  /**
   * Export item as SVG (if applicable)
   */
  static exportAsSVG(item: ClothingItem): Blob {
    const svg = `
      <svg width="256" height="384" xmlns="http://www.w3.org/2000/svg">
        <rect width="256" height="384" fill="#f5f5f5"/>
        <!-- Item content would be rendered here -->
        <text x="128" y="190" text-anchor="middle" font-size="16">${item.name}</text>
        <text x="128" y="210" text-anchor="middle" font-size="12" fill="#999">${item.type} - ${item.category}</text>
      </svg>
    `;
    return new Blob([svg], { type: 'image/svg+xml' });
  }

  /**
   * Get all available templates
   */
  static async getTemplates(): Promise<ClothingTemplate[]> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.TEMPLATES], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.TEMPLATES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get templates by type
   */
  static async getTemplatesByType(type: ClothingItem['type']): Promise<ClothingTemplate[]> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.TEMPLATES], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.TEMPLATES);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ============== OUTFIT MANAGEMENT ==============

  /**
   * Get all outfits
   */
  static async getAllOutfits(): Promise<Outfit[]> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.OUTFITS], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.OUTFITS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save a new outfit to storage
   */
  static async saveOutfit(outfit: Outfit): Promise<Outfit> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.OUTFITS], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.OUTFITS);
      const request = store.add(outfit);

      request.onsuccess = () => resolve(outfit);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update an existing outfit
   */
  static async updateOutfit(outfitId: string, updates: Partial<Outfit>): Promise<Outfit> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.OUTFITS], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.OUTFITS);
      const getRequest = store.get(outfitId);

      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        if (!existing) {
          reject(new Error('Outfit not found'));
          return;
        }

        const updated = { ...existing, ...updates, updatedAt: new Date() };
        const putRequest = store.put(updated);

        putRequest.onsuccess = () => resolve(updated);
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Delete an outfit
   */
  static async deleteOutfit(outfitId: string): Promise<void> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.OUTFITS], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.OUTFITS);
      const request = store.delete(outfitId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

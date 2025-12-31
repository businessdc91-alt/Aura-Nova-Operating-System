'use client';

/**
 * Art Library Service
 * Manages saving, organizing, and retrieving all created art pieces
 * Integrates with Firebase for cloud storage
 */

export interface ArtPiece {
  id: string;
  title: string;
  description: string;
  type: 'background' | 'sprite' | 'animation' | 'procedural' | 'clothing' | 'avatar' | 'hand-drawn';
  category: string;
  tags: string[];
  thumbnail: string; // Base64 or URL
  fullImage: string; // Base64 or URL
  metadata: {
    width: number;
    height: number;
    createdAt: Date;
    updatedAt: Date;
    author?: string;
    ai_generated?: boolean;
    model_used?: string;
    frames?: number; // For animations
    fps?: number; // For animations
  };
  layers?: ArtLayer[];
  exportFormats: {
    png?: string;
    svg?: string;
    json?: string;
    code?: string;
  };
  public: boolean;
  featured: boolean;
}

export interface ArtLayer {
  id: string;
  name: string;
  type: 'image' | 'vector' | 'text' | 'shape';
  visible: boolean;
  opacity: number;
  blendMode: string;
  content: string; // Base64 or data
  order: number;
}

export interface ArtGallery {
  id: string;
  userId: string;
  title: string;
  description: string;
  pieces: string[]; // Array of ArtPiece IDs
  public: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ArtLibraryService {
  private static DB_NAME = 'AuraArtStudio';
  private static STORE_NAMES = {
    PIECES: 'artPieces',
    GALLERIES: 'galleries',
    LAYERS: 'layers',
  };

  /**
   * Initialize IndexedDB for local storage
   */
  static async initializeDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains(this.STORE_NAMES.PIECES)) {
          const pieceStore = db.createObjectStore(this.STORE_NAMES.PIECES, { keyPath: 'id' });
          pieceStore.createIndex('type', 'type', { unique: false });
          pieceStore.createIndex('category', 'category', { unique: false });
          pieceStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
          pieceStore.createIndex('public', 'public', { unique: false });
          pieceStore.createIndex('featured', 'featured', { unique: false });
        }

        if (!db.objectStoreNames.contains(this.STORE_NAMES.GALLERIES)) {
          const galleryStore = db.createObjectStore(this.STORE_NAMES.GALLERIES, { keyPath: 'id' });
          galleryStore.createIndex('userId', 'userId', { unique: false });
          galleryStore.createIndex('public', 'public', { unique: false });
        }

        if (!db.objectStoreNames.contains(this.STORE_NAMES.LAYERS)) {
          db.createObjectStore(this.STORE_NAMES.LAYERS, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Save art piece to library
   */
  static async savePiece(piece: Omit<ArtPiece, 'id' | 'metadata'>): Promise<ArtPiece> {
    const db = await this.initializeDB();
    const pieceId = `piece-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const fullPiece: ArtPiece = {
      ...piece,
      id: pieceId,
      metadata: {
        width: 800,
        height: 600,
        createdAt: new Date(),
        updatedAt: new Date(),
        ai_generated: false,
      },
      exportFormats: {},
      public: false,
      featured: false,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.PIECES], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.PIECES);
      const request = store.add(fullPiece);

      request.onsuccess = () => resolve(fullPiece);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get piece by ID
   */
  static async getPiece(id: string): Promise<ArtPiece | null> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.PIECES], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.PIECES);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pieces of a specific type
   */
  static async getPiecesByType(type: ArtPiece['type']): Promise<ArtPiece[]> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.PIECES], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.PIECES);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get public/featured pieces for gallery
   */
  static async getPublicPieces(featured: boolean = false): Promise<ArtPiece[]> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.PIECES], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.PIECES);
      const index = store.index('public');
      const request = index.getAll(true);

      request.onsuccess = () => {
        const pieces = request.result;
        if (featured) {
          resolve(pieces.filter((p) => p.featured));
        } else {
          resolve(pieces);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Search pieces by tag
   */
  static async searchByTags(tags: string[]): Promise<ArtPiece[]> {
    const db = await this.initializeDB();
    const results: ArtPiece[] = [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.PIECES], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.PIECES);
      const index = store.index('tags');

      let completed = 0;

      for (const tag of tags) {
        const request = index.getAll(tag);
        request.onsuccess = () => {
          results.push(...request.result);
          completed++;
          if (completed === tags.length) {
            // Remove duplicates
            const unique = Array.from(new Map(results.map((item) => [item.id, item])).values());
            resolve(unique);
          }
        };
        request.onerror = () => reject(request.error);
      }
    });
  }

  /**
   * Update piece metadata
   */
  static async updatePiece(id: string, updates: Partial<ArtPiece>): Promise<void> {
    const db = await this.initializeDB();
    const piece = await this.getPiece(id);

    if (!piece) throw new Error('Piece not found');

    const updated: ArtPiece = {
      ...piece,
      ...updates,
      metadata: {
        ...piece.metadata,
        updatedAt: new Date(),
      },
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.PIECES], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.PIECES);
      const request = store.put(updated);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete piece
   */
  static async deletePiece(id: string): Promise<void> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.PIECES], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.PIECES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Create gallery
   */
  static async createGallery(gallery: Omit<ArtGallery, 'id' | 'createdAt' | 'updatedAt'>): Promise<ArtGallery> {
    const db = await this.initializeDB();
    const galleryId = `gallery-${Date.now()}`;

    const fullGallery: ArtGallery = {
      ...gallery,
      id: galleryId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.GALLERIES], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.GALLERIES);
      const request = store.add(fullGallery);

      request.onsuccess = () => resolve(fullGallery);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add piece to gallery
   */
  static async addToGallery(galleryId: string, pieceId: string): Promise<void> {
    const db = await this.initializeDB();
    const transaction = db.transaction([this.STORE_NAMES.GALLERIES], 'readwrite');
    const store = transaction.objectStore(this.STORE_NAMES.GALLERIES);
    const request = store.get(galleryId);

    request.onsuccess = () => {
      const gallery = request.result as ArtGallery;
      if (!gallery.pieces.includes(pieceId)) {
        gallery.pieces.push(pieceId);
        gallery.updatedAt = new Date();
        store.put(gallery);
      }
    };
  }

  /**
   * Export piece as PNG
   */
  static async exportAsPNG(piece: ArtPiece): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = piece.metadata.width;
        canvas.height = piece.metadata.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          resolve(blob || new Blob());
        }, 'image/png');
      };
      img.src = piece.fullImage;
    });
  }

  /**
   * Export piece as JSON (for further editing)
   */
  static async exportAsJSON(piece: ArtPiece): Promise<Blob> {
    const json = JSON.stringify(piece, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  /**
   * Get storage statistics
   */
  static async getStorageStats(): Promise<{
    totalPieces: number;
    totalSize: string;
    byType: Record<string, number>;
  }> {
    const db = await this.initializeDB();

    return new Promise((resolve) => {
      const transaction = db.transaction([this.STORE_NAMES.PIECES], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.PIECES);
      const request = store.getAll();

      request.onsuccess = () => {
        const pieces = request.result as ArtPiece[];
        const byType: Record<string, number> = {};
        let totalSize = 0;

        for (const piece of pieces) {
          byType[piece.type] = (byType[piece.type] || 0) + 1;
          // Rough size estimation
          totalSize += new Blob([JSON.stringify(piece)]).size;
        }

        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

        resolve({
          totalPieces: pieces.length,
          totalSize: `${sizeInMB} MB`,
          byType,
        });
      };
    });
  }

  /**
   * Clear all art library data
   */
  static async clearLibrary(): Promise<void> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [this.STORE_NAMES.PIECES, this.STORE_NAMES.GALLERIES, this.STORE_NAMES.LAYERS],
        'readwrite'
      );

      for (const storeName of Object.values(this.STORE_NAMES)) {
        const store = transaction.objectStore(storeName);
        store.clear();
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

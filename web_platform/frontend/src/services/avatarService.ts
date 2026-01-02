'use client';

/**
 * Avatar/Paper Doll Service
 * Manages avatar creation, poses, and clothing composition
 */

export interface AvatarBody {
  id: string;
  name: string;
  baseShape: string; // Canvas drawing or SVG
  skinTone: string;
  headShape: 'round' | 'square' | 'oval' | 'heart';
  bodyType: 'slim' | 'athletic' | 'curvy' | 'broad';
  height: number; // relative scale 0.8-1.2
}

export interface AvatarJoint {
  id: string;
  name: string;
  position: { x: number; y: number };
  rotation: number;
  constraints?: {
    minRotation: number;
    maxRotation: number;
  };
}

export interface AvatarRig {
  id: string;
  name: string;
  bodyPart: string; // 'head', 'torso', 'arm-left', 'arm-right', 'leg-left', 'leg-right'
  joints: AvatarJoint[];
  attachmentPoints: Array<{
    name: string;
    position: { x: number; y: number };
    type: 'clothing' | 'accessory';
  }>;
}

export interface AvatarPose {
  id: string;
  name: string;
  description?: string;
  category: 'idle' | 'action' | 'emote' | 'custom';
  joints: Record<string, { rotation: number; position?: { x: number; y: number } }>;
  thumbnail?: string;
  tags: string[];
}

export interface Avatar {
  id: string;
  name: string;
  body: AvatarBody;
  rigs: AvatarRig[];
  currentPose: AvatarPose;
  clothingLayers: {
    top?: string; // clothing item ID
    bottom?: string;
    shoes?: string;
    coat?: string;
    accessories: string[]; // clothing item IDs
    hat?: string;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    creator?: string;
    tags: string[];
  };
  preview?: string;
  public: boolean;
}

export class AvatarService {
  private static DB_NAME = 'AuraAvatarStudio';
  private static STORE_NAMES = {
    AVATARS: 'avatars',
    POSES: 'poses',
    BODIES: 'bodies',
    RIGS: 'rigs',
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

        if (!db.objectStoreNames.contains(this.STORE_NAMES.AVATARS)) {
          const avatarStore = db.createObjectStore(this.STORE_NAMES.AVATARS, { keyPath: 'id' });
          avatarStore.createIndex('public', 'public', { unique: false });
          avatarStore.createIndex('tags', 'metadata.tags', { unique: false, multiEntry: true });
          avatarStore.createIndex('createdAt', 'metadata.createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(this.STORE_NAMES.POSES)) {
          const poseStore = db.createObjectStore(this.STORE_NAMES.POSES, { keyPath: 'id' });
          poseStore.createIndex('category', 'category', { unique: false });
          poseStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }

        if (!db.objectStoreNames.contains(this.STORE_NAMES.BODIES)) {
          const bodyStore = db.createObjectStore(this.STORE_NAMES.BODIES, { keyPath: 'id' });
          bodyStore.createIndex('bodyType', 'bodyType', { unique: false });
        }

        if (!db.objectStoreNames.contains(this.STORE_NAMES.RIGS)) {
          const rigStore = db.createObjectStore(this.STORE_NAMES.RIGS, { keyPath: 'id' });
          rigStore.createIndex('bodyPart', 'bodyPart', { unique: false });
        }
      };
    });
  }

  /**
   * Create a new avatar
   */
  static async createAvatar(avatar: Omit<Avatar, 'id' | 'metadata' | 'preview'>): Promise<Avatar> {
    const db = await this.initializeDB();
    const avatarId = `avatar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const fullAvatar: Avatar = {
      ...avatar,
      id: avatarId,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
      },
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.AVATARS], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.AVATARS);
      const request = store.add(fullAvatar);

      request.onsuccess = () => resolve(fullAvatar);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get avatar by ID
   */
  static async getAvatar(id: string): Promise<Avatar | null> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.AVATARS], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.AVATARS);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all avatars
   */
  static async getAllAvatars(): Promise<Avatar[]> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.AVATARS], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.AVATARS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get public avatars
   */
  static async getPublicAvatars(): Promise<Avatar[]> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.AVATARS], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.AVATARS);
      const request = store.getAll();

      request.onsuccess = () => {
        const allAvatars = request.result as Avatar[];
        resolve(allAvatars.filter(avatar => avatar.public === true));
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update avatar
   */
  static async updateAvatar(id: string, updates: Partial<Avatar>): Promise<void> {
    const db = await this.initializeDB();
    const avatar = await this.getAvatar(id);

    if (!avatar) throw new Error('Avatar not found');

    const updated: Avatar = {
      ...avatar,
      ...updates,
      metadata: {
        ...avatar.metadata,
        updatedAt: new Date(),
      },
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.AVATARS], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.AVATARS);
      const request = store.put(updated);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete avatar
   */
  static async deleteAvatar(id: string): Promise<void> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.AVATARS], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.AVATARS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Add or update clothing on avatar
   */
  static async addClothing(
    avatarId: string,
    clothingType: string,
    clothingItemId: string
  ): Promise<void> {
    const avatar = await this.getAvatar(avatarId);
    if (!avatar) throw new Error('Avatar not found');

    const validTypes = ['top', 'bottom', 'shoes', 'coat', 'hat'] as const;
    type ClothingKey = 'top' | 'bottom' | 'shoes' | 'coat' | 'hat';
    if (validTypes.includes(clothingType as ClothingKey)) {
      (avatar.clothingLayers as Record<string, string | string[] | undefined>)[clothingType] = clothingItemId;
    } else if (clothingType === 'accessory') {
      avatar.clothingLayers.accessories.push(clothingItemId);
    }

    await this.updateAvatar(avatarId, avatar);
  }

  /**
   * Remove clothing from avatar
   */
  static async removeClothing(
    avatarId: string,
    clothingType: string,
    clothingItemId?: string
  ): Promise<void> {
    const avatar = await this.getAvatar(avatarId);
    if (!avatar) throw new Error('Avatar not found');

    if (clothingType === 'accessory' && clothingItemId) {
      avatar.clothingLayers.accessories = avatar.clothingLayers.accessories.filter(id => id !== clothingItemId);
    } else {
      const validTypes = ['top', 'bottom', 'shoes', 'coat', 'hat'] as const;
      type ClothingKey = 'top' | 'bottom' | 'shoes' | 'coat' | 'hat';
      if (validTypes.includes(clothingType as ClothingKey)) {
        (avatar.clothingLayers as Record<string, string | string[] | undefined>)[clothingType] = undefined;
      }
    }

    await this.updateAvatar(avatarId, avatar);
  }

  /**
   * Apply pose to avatar
   */
  static async applyPose(avatarId: string, poseId: string): Promise<void> {
    const avatar = await this.getAvatar(avatarId);
    const pose = await this.getPose(poseId);

    if (!avatar) throw new Error('Avatar not found');
    if (!pose) throw new Error('Pose not found');

    // Update avatar's current pose
    avatar.currentPose = pose;

    // Update joint rotations
    for (const rig of avatar.rigs) {
      for (const joint of rig.joints) {
        if (pose.joints[joint.id]) {
          joint.rotation = pose.joints[joint.id].rotation;
          if (pose.joints[joint.id].position) {
            joint.position = pose.joints[joint.id].position;
          }
        }
      }
    }

    await this.updateAvatar(avatarId, avatar);
  }

  /**
   * Create a custom pose from current avatar state
   */
  static async createPoseFromAvatar(
    avatarId: string,
    poseName: string,
    category: AvatarPose['category'] = 'custom'
  ): Promise<AvatarPose> {
    const db = await this.initializeDB();
    const avatar = await this.getAvatar(avatarId);

    if (!avatar) throw new Error('Avatar not found');

    const poseId = `pose-${Date.now()}`;
    const jointData: Record<string, { rotation: number; position?: { x: number; y: number } }> = {};

    // Capture current joint states
    for (const rig of avatar.rigs) {
      for (const joint of rig.joints) {
        jointData[joint.id] = {
          rotation: joint.rotation,
          position: { ...joint.position },
        };
      }
    }

    const pose: AvatarPose = {
      id: poseId,
      name: poseName,
      category,
      joints: jointData,
      tags: [],
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.POSES], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.POSES);
      const request = store.add(pose);

      request.onsuccess = () => resolve(pose);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get pose by ID
   */
  static async getPose(id: string): Promise<AvatarPose | null> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.POSES], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.POSES);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get poses by category
   */
  static async getPosesByCategory(category: AvatarPose['category']): Promise<AvatarPose[]> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.POSES], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.POSES);
      const index = store.index('category');
      const request = index.getAll(category);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all poses
   */
  static async getAllPoses(): Promise<AvatarPose[]> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.POSES], 'readonly');
      const store = transaction.objectStore(this.STORE_NAMES.POSES);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete pose
   */
  static async deletePose(id: string): Promise<void> {
    const db = await this.initializeDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.STORE_NAMES.POSES], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAMES.POSES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Render avatar to canvas
   */
  static async renderAvatar(
    avatar: Avatar,
    size: { width: number; height: number } = { width: 512, height: 768 }
  ): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext('2d')!;

    // Draw background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, size.width, size.height);

    // Draw body
    this.drawBody(ctx, avatar.body, size);

    // Draw rigged body parts with current pose
    for (const rig of avatar.rigs) {
      this.drawRiggedPart(ctx, rig, avatar.currentPose, size);
    }

    // Draw clothing layers in proper order (bottom to top)
    await this.drawClothingLayers(ctx, avatar, size);

    return canvas.toDataURL('image/png');
  }

  /**
   * Draw clothing layers on the avatar
   */
  private static async drawClothingLayers(
    ctx: CanvasRenderingContext2D,
    avatar: Avatar,
    size: { width: number; height: number }
  ): Promise<void> {
    const centerX = size.width / 2;
    const centerY = size.height / 3;
    const { clothingLayers, body } = avatar;

    // Layer order: bottom (pants/skirt) -> top (shirt) -> shoes -> coat -> accessories -> hat
    const layerOrder = ['bottom', 'top', 'shoes', 'coat', 'hat'] as const;

    for (const layer of layerOrder) {
      const itemId = clothingLayers[layer];
      if (itemId) {
        await this.drawClothingItem(ctx, layer, itemId, centerX, centerY, body, size);
      }
    }

    // Draw accessories on top
    for (const accessoryId of clothingLayers.accessories) {
      await this.drawAccessory(ctx, accessoryId, centerX, centerY, size);
    }
  }

  /**
   * Draw a single clothing item
   */
  private static async drawClothingItem(
    ctx: CanvasRenderingContext2D,
    type: 'top' | 'bottom' | 'shoes' | 'coat' | 'hat',
    itemId: string,
    centerX: number,
    centerY: number,
    body: AvatarBody,
    size: { width: number; height: number }
  ): Promise<void> {
    // Get body dimensions based on body type
    const torsoWidth = body.bodyType === 'broad' ? 50 : body.bodyType === 'slim' ? 30 : 40;
    
    // Default clothing colors (in production, would be loaded from clothing item data)
    const clothingColors: Record<string, string> = {
      top: '#4a90d9',
      bottom: '#2c3e50',
      shoes: '#1a1a2e',
      coat: '#34495e',
      hat: '#8b4513'
    };

    ctx.save();
    ctx.fillStyle = clothingColors[type] || '#666666';

    switch (type) {
      case 'top':
        // Draw shirt/top
        ctx.beginPath();
        ctx.moveTo(centerX - torsoWidth / 2 - 5, centerY - 5);
        ctx.lineTo(centerX + torsoWidth / 2 + 5, centerY - 5);
        ctx.lineTo(centerX + torsoWidth / 2 + 5, centerY + 60);
        ctx.lineTo(centerX - torsoWidth / 2 - 5, centerY + 60);
        ctx.closePath();
        ctx.fill();
        
        // Sleeves
        ctx.fillRect(centerX - torsoWidth / 2 - 25, centerY + 15, 25, 35);
        ctx.fillRect(centerX + torsoWidth / 2, centerY + 15, 25, 35);
        break;

      case 'bottom':
        // Draw pants/skirt
        ctx.fillRect(centerX - 20, centerY + 80, 18, 90);
        ctx.fillRect(centerX + 2, centerY + 80, 18, 90);
        break;

      case 'shoes':
        // Draw shoes
        ctx.beginPath();
        ctx.ellipse(centerX - 8, centerY + 175, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + 10, centerY + 175, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'coat':
        // Draw coat/jacket overlay
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.moveTo(centerX - torsoWidth / 2 - 10, centerY - 10);
        ctx.lineTo(centerX + torsoWidth / 2 + 10, centerY - 10);
        ctx.lineTo(centerX + torsoWidth / 2 + 10, centerY + 75);
        ctx.lineTo(centerX - torsoWidth / 2 - 10, centerY + 75);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        break;

      case 'hat':
        // Draw hat
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - 70, 35, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, centerY - 80, 25, Math.PI, 0);
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  /**
   * Draw an accessory item
   */
  private static async drawAccessory(
    ctx: CanvasRenderingContext2D,
    accessoryId: string,
    centerX: number,
    centerY: number,
    size: { width: number; height: number }
  ): Promise<void> {
    // Simple accessory rendering - would be expanded with actual accessory data
    ctx.save();
    ctx.fillStyle = '#ffd700';
    
    // Example: necklace
    ctx.beginPath();
    ctx.arc(centerX, centerY + 5, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  private static drawBody(ctx: CanvasRenderingContext2D, body: AvatarBody, size: { width: number; height: number }): void {
    const centerX = size.width / 2;
    const centerY = size.height / 3;

    // Draw head
    ctx.fillStyle = body.skinTone;
    ctx.beginPath();

    switch (body.headShape) {
      case 'round':
        ctx.arc(centerX, centerY - 40, 30, 0, Math.PI * 2);
        break;
      case 'square':
        ctx.fillRect(centerX - 30, centerY - 70, 60, 60);
        break;
      case 'oval':
        ctx.ellipse(centerX, centerY - 40, 25, 35, 0, 0, Math.PI * 2);
        break;
      case 'heart':
        // Simplified heart shape
        ctx.arc(centerX - 15, centerY - 50, 15, 0, Math.PI * 2);
        ctx.arc(centerX + 15, centerY - 50, 15, 0, Math.PI * 2);
        break;
    }

    ctx.fill();

    // Draw torso
    ctx.fillStyle = body.skinTone;
    const torsoWidth = body.bodyType === 'broad' ? 50 : body.bodyType === 'slim' ? 30 : 40;
    ctx.fillRect(centerX - torsoWidth / 2, centerY - 10, torsoWidth, 80);

    // Draw arms
    ctx.fillRect(centerX - torsoWidth / 2 - 20, centerY + 20, 20, 70);
    ctx.fillRect(centerX + torsoWidth / 2, centerY + 20, 20, 70);

    // Draw legs
    ctx.fillRect(centerX - 15, centerY + 80, 15, 100);
    ctx.fillRect(centerX, centerY + 80, 15, 100);
  }

  private static drawRiggedPart(
    ctx: CanvasRenderingContext2D,
    rig: AvatarRig,
    pose: AvatarPose,
    size: { width: number; height: number }
  ): void {
    // This would be implemented with actual body part drawing
    // For now, just a placeholder
    ctx.save();
    for (const joint of rig.joints) {
      if (pose.joints[joint.id]) {
        ctx.rotate((pose.joints[joint.id].rotation * Math.PI) / 180);
        // Draw joint marker
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(joint.position.x - 2, joint.position.y - 2, 4, 4);
      }
    }
    ctx.restore();
  }

  /**
   * Export avatar as JSON
   */
  static exportAsJSON(avatar: Avatar): Blob {
    const json = JSON.stringify(avatar, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  /**
   * Clone avatar
   */
  static async cloneAvatar(avatarId: string, newName: string): Promise<Avatar> {
    const original = await this.getAvatar(avatarId);
    if (!original) throw new Error('Avatar not found');

    const clone = {
      ...original,
      name: newName,
      id: undefined,
      metadata: {
        ...original.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    return this.createAvatar(clone as any);
  }
}

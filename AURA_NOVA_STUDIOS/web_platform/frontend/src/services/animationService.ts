/**
 * Animation & Pose System Service
 * Manages keyframe animations, poses, and transitions
 * Enables dynamic avatar movement and expression
 */

export interface JointKeyframe {
  time: number; // 0-100 (percentage of animation)
  rotation: { x: number; y: number; z: number }; // degrees
  position: { x: number; y: number; z: number }; // relative offset
  scale: { x: number; y: number; z: number };
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';
}

export interface AnimationTrack {
  jointId: string;
  keyframes: JointKeyframe[];
}

export interface Animation {
  id: string;
  name: string;
  category: 'idle' | 'action' | 'emote' | 'transition' | 'dance' | 'custom';
  duration: number; // milliseconds
  description: string;
  loopable: boolean;
  tracks: AnimationTrack[];
  tags: string[];
  complexity: number; // 1-10
  previewEmoji: string;
}

export interface AvatarPose {
  id: string;
  name: string;
  category: 'idle' | 'action' | 'emote' | 'custom';
  description: string;
  duration?: number;
  joints: Record<string, { rotation: { x: number; y: number; z: number }; position: { x: number; y: number; z: number } }>;
  tags: string[];
  difficulty: 'easy' | 'normal' | 'hard';
}

// ============== IDLE ANIMATIONS (5) ==============
const IDLE_ANIMATIONS: Animation[] = [
  {
    id: 'anim-idle-breathe',
    name: 'Breathing',
    category: 'idle',
    duration: 3000,
    description: 'Gentle breathing motion',
    loopable: true,
    tracks: [
      {
        jointId: 'chest',
        keyframes: [
          { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 50, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 2, z: 0 }, scale: { x: 1, y: 1.05, z: 1 }, easing: 'easeInOut' },
          { time: 100, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
        ],
      },
    ],
    tags: ['calm', 'loop', 'relaxed'],
    complexity: 2,
    previewEmoji: '🌬️',
  },
  {
    id: 'anim-idle-sway',
    name: 'Sway',
    category: 'idle',
    duration: 2000,
    description: 'Gentle swaying side to side',
    loopable: true,
    tracks: [
      {
        jointId: 'pelvis',
        keyframes: [
          { time: 0, rotation: { x: 0, y: -2, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 50, rotation: { x: 0, y: 2, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 100, rotation: { x: 0, y: -2, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
        ],
      },
    ],
    tags: ['calm', 'loop', 'feminine'],
    complexity: 2,
    previewEmoji: '〰️',
  },
  {
    id: 'anim-idle-fidget',
    name: 'Fidget',
    category: 'idle',
    duration: 1500,
    description: 'Nervous fidgeting',
    loopable: true,
    tracks: [
      {
        jointId: 'hand_left',
        keyframes: [
          { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 25, rotation: { x: -10, y: 0, z: 0 }, position: { x: -5, y: 5, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeOut' },
          { time: 75, rotation: { x: -10, y: 0, z: 0 }, position: { x: -5, y: 5, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeIn' },
          { time: 100, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
        ],
      },
    ],
    tags: ['nervous', 'loop', 'anxious'],
    complexity: 2,
    previewEmoji: '😰',
  },
  {
    id: 'anim-idle-confident',
    name: 'Confident Stance',
    category: 'idle',
    duration: 2000,
    description: 'Confident ready pose',
    loopable: true,
    tracks: [
      {
        jointId: 'chest',
        keyframes: [
          { time: 0, rotation: { x: -5, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 100, rotation: { x: -5, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
        ],
      },
    ],
    tags: ['confident', 'powerful', 'ready'],
    complexity: 1,
    previewEmoji: '💪',
  },
  {
    id: 'anim-idle-thinking',
    name: 'Thinking',
    category: 'idle',
    duration: 2500,
    description: 'Contemplative pose',
    loopable: true,
    tracks: [
      {
        jointId: 'hand_right',
        keyframes: [
          { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 50, rotation: { x: 45, y: 0, z: 0 }, position: { x: 0, y: 20, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 100, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
        ],
      },
    ],
    tags: ['thoughtful', 'contemplative', 'intelligent'],
    complexity: 3,
    previewEmoji: '🤔',
  },
];

// ============== ACTION ANIMATIONS (5) ==============
const ACTION_ANIMATIONS: Animation[] = [
  {
    id: 'anim-action-wave',
    name: 'Wave',
    category: 'action',
    duration: 1500,
    description: 'Friendly wave gesture',
    loopable: true,
    tracks: [
      {
        jointId: 'hand_right',
        keyframes: [
          { time: 0, rotation: { x: 0, y: -45, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeOut' },
          { time: 25, rotation: { x: -30, y: -45, z: 0 }, position: { x: 5, y: 10, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 75, rotation: { x: -30, y: -45, z: 0 }, position: { x: 5, y: 10, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 100, rotation: { x: 0, y: -45, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeIn' },
        ],
      },
    ],
    tags: ['greeting', 'friendly', 'gesture'],
    complexity: 3,
    previewEmoji: '👋',
  },
  {
    id: 'anim-action-jump',
    name: 'Jump',
    category: 'action',
    duration: 800,
    description: 'Excited jump',
    loopable: false,
    tracks: [
      {
        jointId: 'pelvis',
        keyframes: [
          { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeOut' },
          { time: 40, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 50, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeOut' },
          { time: 100, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeIn' },
        ],
      },
    ],
    tags: ['excited', 'energetic', 'happy'],
    complexity: 4,
    previewEmoji: '⬆️',
  },
  {
    id: 'anim-action-point',
    name: 'Point',
    category: 'action',
    duration: 1200,
    description: 'Pointing gesture',
    loopable: true,
    tracks: [
      {
        jointId: 'hand_right',
        keyframes: [
          { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeOut' },
          { time: 50, rotation: { x: -20, y: 45, z: 0 }, position: { x: 20, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 100, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeIn' },
        ],
      },
    ],
    tags: ['direction', 'gesture', 'attention'],
    complexity: 2,
    previewEmoji: '👉',
  },
  {
    id: 'anim-action-spin',
    name: 'Spin',
    category: 'action',
    duration: 1600,
    description: 'Full body spin',
    loopable: false,
    tracks: [
      {
        jointId: 'pelvis',
        keyframes: [
          { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'linear' },
          { time: 100, rotation: { x: 0, y: 360, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'linear' },
        ],
      },
    ],
    tags: ['dance', 'spin', 'playful'],
    complexity: 2,
    previewEmoji: '🌀',
  },
  {
    id: 'anim-action-bow',
    name: 'Bow',
    category: 'action',
    duration: 2000,
    description: 'Respectful bow',
    loopable: false,
    tracks: [
      {
        jointId: 'chest',
        keyframes: [
          { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeOut' },
          { time: 40, rotation: { x: 45, y: 0, z: 0 }, position: { x: 0, y: -20, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 60, rotation: { x: 45, y: 0, z: 0 }, position: { x: 0, y: -20, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 100, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeIn' },
        ],
      },
    ],
    tags: ['respectful', 'greeting', 'formal'],
    complexity: 3,
    previewEmoji: '🙏',
  },
];

// ============== EMOTE ANIMATIONS (5) ==============
const EMOTE_ANIMATIONS: Animation[] = [
  {
    id: 'anim-emote-laugh',
    name: 'Laugh',
    category: 'emote',
    duration: 2000,
    description: 'Laughing animation',
    loopable: true,
    tracks: [
      {
        jointId: 'chest',
        keyframes: [
          { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 20, rotation: { x: -5, y: 0, z: 0 }, position: { x: 0, y: 5, z: 0 }, scale: { x: 1.05, y: 1, z: 1 }, easing: 'easeOut' },
          { time: 40, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeIn' },
          { time: 60, rotation: { x: -5, y: 0, z: 0 }, position: { x: 0, y: 5, z: 0 }, scale: { x: 1.05, y: 1, z: 1 }, easing: 'easeOut' },
          { time: 80, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeIn' },
          { time: 100, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
        ],
      },
    ],
    tags: ['funny', 'happy', 'joyful'],
    complexity: 3,
    previewEmoji: '😂',
  },
  {
    id: 'anim-emote-sad',
    name: 'Sad',
    category: 'emote',
    duration: 2500,
    description: 'Sad or disappointed',
    loopable: false,
    tracks: [
      {
        jointId: 'chest',
        keyframes: [
          { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeOut' },
          { time: 50, rotation: { x: 10, y: 0, z: 0 }, position: { x: 0, y: -10, z: 0 }, scale: { x: 0.95, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 100, rotation: { x: 10, y: 0, z: 0 }, position: { x: 0, y: -10, z: 0 }, scale: { x: 0.95, y: 1, z: 1 }, easing: 'easeInOut' },
        ],
      },
    ],
    tags: ['sad', 'disappointed', 'emotional'],
    complexity: 2,
    previewEmoji: '😢',
  },
  {
    id: 'anim-emote-angry',
    name: 'Angry',
    category: 'emote',
    duration: 1500,
    description: 'Angry or frustrated',
    loopable: false,
    tracks: [
      {
        jointId: 'chest',
        keyframes: [
          { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeOut' },
          { time: 50, rotation: { x: -15, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1.1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 100, rotation: { x: -15, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1.1, y: 1, z: 1 }, easing: 'easeInOut' },
        ],
      },
    ],
    tags: ['angry', 'frustrated', 'determined'],
    complexity: 2,
    previewEmoji: '😠',
  },
  {
    id: 'anim-emote-love',
    name: 'Love',
    category: 'emote',
    duration: 2000,
    description: 'Love or affection',
    loopable: true,
    tracks: [
      {
        jointId: 'hand_left',
        keyframes: [
          { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeOut' },
          { time: 30, rotation: { x: 0, y: 0, z: -20 }, position: { x: -10, y: 15, z: 0 }, scale: { x: 1.2, y: 1.2, z: 1 }, easing: 'easeInOut' },
          { time: 70, rotation: { x: 0, y: 0, z: -20 }, position: { x: -10, y: 15, z: 0 }, scale: { x: 1.2, y: 1.2, z: 1 }, easing: 'easeInOut' },
          { time: 100, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeIn' },
        ],
      },
    ],
    tags: ['love', 'affection', 'kind'],
    complexity: 3,
    previewEmoji: '❤️',
  },
  {
    id: 'anim-emote-shock',
    name: 'Shocked',
    category: 'emote',
    duration: 1000,
    description: 'Surprised or shocked',
    loopable: false,
    tracks: [
      {
        jointId: 'chest',
        keyframes: [
          { time: 0, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeOut' },
          { time: 30, rotation: { x: -10, y: 0, z: 0 }, position: { x: 0, y: 10, z: 0 }, scale: { x: 1, y: 1.1, z: 1 }, easing: 'easeOut' },
          { time: 100, rotation: { x: 0, y: 0, z: 0 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeIn' },
        ],
      },
    ],
    tags: ['surprised', 'shocked', 'amazed'],
    complexity: 1,
    previewEmoji: '😲',
  },
];

// ============== DANCE ANIMATIONS (3) ==============
const DANCE_ANIMATIONS: Animation[] = [
  {
    id: 'anim-dance-groove',
    name: 'Groove',
    category: 'dance',
    duration: 4000,
    description: 'Groovy hip movement',
    loopable: true,
    tracks: [
      {
        jointId: 'pelvis',
        keyframes: [
          { time: 0, rotation: { x: 0, y: 0, z: -3 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 25, rotation: { x: 0, y: 0, z: 3 }, position: { x: 3, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 50, rotation: { x: 0, y: 0, z: -3 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 75, rotation: { x: 0, y: 0, z: 3 }, position: { x: -3, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
          { time: 100, rotation: { x: 0, y: 0, z: -3 }, position: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, easing: 'easeInOut' },
        ],
      },
    ],
    tags: ['fun', 'groovy', 'rhythmic'],
    complexity: 4,
    previewEmoji: '🕺',
  },
];

export class AnimationService {
  /**
   * Get all idle animations
   */
  static getIdleAnimations(): Animation[] {
    return IDLE_ANIMATIONS;
  }

  /**
   * Get all action animations
   */
  static getActionAnimations(): Animation[] {
    return ACTION_ANIMATIONS;
  }

  /**
   * Get all emote animations
   */
  static getEmoteAnimations(): Animation[] {
    return EMOTE_ANIMATIONS;
  }

  /**
   * Get all dance animations
   */
  static getDanceAnimations(): Animation[] {
    return DANCE_ANIMATIONS;
  }

  /**
   * Get animation by category
   */
  static getAnimationsByCategory(category: Animation['category']): Animation[] {
    const allAnimations = [
      ...IDLE_ANIMATIONS,
      ...ACTION_ANIMATIONS,
      ...EMOTE_ANIMATIONS,
      ...DANCE_ANIMATIONS,
    ];
    return allAnimations.filter(a => a.category === category);
  }

  /**
   * Get animation by ID
   */
  static getAnimation(id: string): Animation | undefined {
    const allAnimations = [
      ...IDLE_ANIMATIONS,
      ...ACTION_ANIMATIONS,
      ...EMOTE_ANIMATIONS,
      ...DANCE_ANIMATIONS,
    ];
    return allAnimations.find(a => a.id === id);
  }

  /**
   * Get all animations
   */
  static getAllAnimations(): Animation[] {
    return [
      ...IDLE_ANIMATIONS,
      ...ACTION_ANIMATIONS,
      ...EMOTE_ANIMATIONS,
      ...DANCE_ANIMATIONS,
    ];
  }

  /**
   * Interpolate keyframes for animation
   */
  static interpolateKeyframes(
    keyframes: JointKeyframe[],
    progress: number // 0-1
  ): JointKeyframe {
    if (keyframes.length === 0) {
      return {
        time: 0,
        rotation: { x: 0, y: 0, z: 0 },
        position: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        easing: 'linear',
      };
    }

    const time = progress * 100;
    let currentFrame = keyframes[0];
    let nextFrame = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (keyframes[i].time <= time && time <= keyframes[i + 1].time) {
        currentFrame = keyframes[i];
        nextFrame = keyframes[i + 1];
        break;
      }
    }

    const frameDuration = nextFrame.time - currentFrame.time;
    const frameProgress = frameDuration === 0 ? 0 : (time - currentFrame.time) / frameDuration;

    // Simple linear interpolation
    return {
      time,
      rotation: {
        x: this.lerp(currentFrame.rotation.x, nextFrame.rotation.x, frameProgress),
        y: this.lerp(currentFrame.rotation.y, nextFrame.rotation.y, frameProgress),
        z: this.lerp(currentFrame.rotation.z, nextFrame.rotation.z, frameProgress),
      },
      position: {
        x: this.lerp(currentFrame.position.x, nextFrame.position.x, frameProgress),
        y: this.lerp(currentFrame.position.y, nextFrame.position.y, frameProgress),
        z: this.lerp(currentFrame.position.z, nextFrame.position.z, frameProgress),
      },
      scale: {
        x: this.lerp(currentFrame.scale.x, nextFrame.scale.x, frameProgress),
        y: this.lerp(currentFrame.scale.y, nextFrame.scale.y, frameProgress),
        z: this.lerp(currentFrame.scale.z, nextFrame.scale.z, frameProgress),
      },
      easing: nextFrame.easing,
    };
  }

  /**
   * Linear interpolation helper
   */
  private static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Apply easing function
   */
  static applyEasing(progress: number, easing: JointKeyframe['easing']): number {
    switch (easing) {
      case 'easeIn':
        return progress * progress;
      case 'easeOut':
        return 1 - (1 - progress) * (1 - progress);
      case 'easeInOut':
        return progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      case 'bounce':
        return progress < 0.5
          ? 8 * progress * progress * progress * progress
          : 1 - 8 * (progress - 1) * (progress - 1) * (progress - 1) * (progress - 1);
      case 'linear':
      default:
        return progress;
    }
  }

  /**
   * Create custom animation
   */
  static createAnimation(
    name: string,
    category: Animation['category'],
    duration: number
  ): Animation {
    return {
      id: `anim-${Date.now()}`,
      name,
      category,
      duration,
      description: 'Custom animation',
      loopable: category === 'idle' || category === 'emote',
      tracks: [],
      tags: [],
      complexity: 5,
      previewEmoji: '🎬',
    };
  }

  /**
   * Clone animation
   */
  static cloneAnimation(animation: Animation): Animation {
    return {
      ...animation,
      id: `anim-${Date.now()}`,
      tracks: animation.tracks.map(track => ({
        jointId: track.jointId,
        keyframes: [...track.keyframes],
      })),
    };
  }
}

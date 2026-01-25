// ============================================================================
// SOCIAL NETWORK SERVICE
// ============================================================================
// Core service for social features: posts, likes, comments, follows, feed
// Uses localStorage for offline-first with Firebase sync when available
// ============================================================================

import { aiService } from './aiService';

// ================== TYPES ==================

// AI Companion preferences shown on profile
export interface AICompanionProfile {
  companionName: string;           // User's AI companion's name
  preferredModelId: string;        // Most used AI model ID
  preferredModelName: string;      // Display name of preferred model
  modelUsageStats: {
    totalInteractions: number;
    hoursUsed: number;
    lastUsed: Date;
  };
  trainingPackets: TrainingPacketInfo[];  // Earned training specializations
  companionPersonality?: string;   // AI companion's personality type
  companionAvatar?: string;        // Custom avatar for companion
  bondLevel: number;               // 0-100 bond with AI
}

export interface TrainingPacketInfo {
  packetId: string;
  name: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  earnedAt: Date;
  knowledgePoints: number;
}

export interface SocialUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  membershipTier: 'free' | 'creator' | 'developer' | 'catalyst' | 'prime';
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  lastSeen?: Date;
  currentActivity?: string;
  // AI Companion fields
  aiCompanion?: AICompanionProfile;
}

export interface Post {
  id: string;
  authorId: string;
  author: SocialUser;
  content: string;
  images?: string[];
  attachments?: PostAttachment[];
  createdAt: Date;
  updatedAt?: Date;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  likedBy: string[]; // user IDs
  isEdited: boolean;
  visibility: 'public' | 'followers' | 'private';
  tags?: string[];
  mentions?: string[]; // user IDs
  repostOf?: string; // original post ID if this is a repost
  pinned?: boolean;
}

export interface PostAttachment {
  type: 'image' | 'link' | 'file' | 'project' | 'card';
  url?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  metadata?: Record<string, any>;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: SocialUser;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  likesCount: number;
  likedBy: string[];
  replyToId?: string; // for nested replies
  replies?: Comment[];
  isEdited: boolean;
}

export interface WallMessage {
  id: string;
  wallOwnerId: string;
  authorId: string;
  author: SocialUser;
  content: string;
  createdAt: Date;
  isPrivate: boolean;
  likesCount: number;
  likedBy: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'wall_message' | 'dm' | 'system';
  title: string;
  message: string;
  fromUser?: SocialUser;
  relatedId?: string; // postId, commentId, etc.
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface ActivityEvent {
  id: string;
  userId: string;
  type: 'post' | 'like' | 'comment' | 'follow' | 'achievement' | 'creation' | 'login';
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// ================== STORAGE KEYS ==================
const STORAGE_KEYS = {
  POSTS: 'aura_social_posts',
  COMMENTS: 'aura_social_comments',
  WALL_MESSAGES: 'aura_social_wall',
  NOTIFICATIONS: 'aura_social_notifications',
  FOLLOWS: 'aura_social_follows',
  ACTIVITY: 'aura_social_activity',
  CURRENT_USER: 'aura_current_user',
  ONLINE_USERS: 'aura_online_users',
};

// ================== DEMO USERS ==================
const DEMO_USERS: SocialUser[] = [
  {
    id: 'user-1',
    username: 'aura_nova',
    displayName: 'Aura Nova ✨',
    avatar: undefined,
    bio: 'Platform creator. Building the future of creative tools.',
    status: 'online',
    membershipTier: 'prime',
    isVerified: true,
    followersCount: 15420,
    followingCount: 127,
    currentActivity: 'Working on new features',
    aiCompanion: {
      companionName: 'Nova Prime',
      preferredModelId: 'aura-gemma3',
      preferredModelName: 'Aura Gemma 3 Pro',
      modelUsageStats: {
        totalInteractions: 45892,
        hoursUsed: 1247,
        lastUsed: new Date(),
      },
      trainingPackets: [
        { packetId: 'ai-local-llm-mastery', name: 'Local LLM Deployment', category: 'ai-ml', rarity: 'legendary', earnedAt: new Date('2024-03-01'), knowledgePoints: 500 },
        { packetId: 'gfx-vulkan-init', name: 'Vulkan Foundations', category: 'graphics', rarity: 'epic', earnedAt: new Date('2024-02-15'), knowledgePoints: 400 },
        { packetId: 'engine-unreal-cpp', name: 'Unreal C++ Architecture', category: 'game-engines', rarity: 'rare', earnedAt: new Date('2024-01-20'), knowledgePoints: 300 },
      ],
      companionPersonality: 'wise',
      bondLevel: 98,
    },
  },
  {
    id: 'user-2',
    username: 'pixel_master',
    displayName: 'PixelMaster 🎨',
    bio: '2D artist and animator. Love creating game assets!',
    status: 'online',
    membershipTier: 'catalyst',
    isVerified: true,
    followersCount: 3240,
    followingCount: 456,
    currentActivity: 'Creating sprites',
    aiCompanion: {
      companionName: 'Artie',
      preferredModelId: 'stable-diffusion-xl',
      preferredModelName: 'Stable Diffusion XL',
      modelUsageStats: {
        totalInteractions: 12450,
        hoursUsed: 389,
        lastUsed: new Date(),
      },
      trainingPackets: [
        { packetId: 'gfx-shader-magic', name: 'Advanced Shader Techniques', category: 'graphics', rarity: 'rare', earnedAt: new Date('2024-04-10'), knowledgePoints: 250 },
        { packetId: 'gfx-threejs-core', name: 'Three.js Mastery', category: 'graphics', rarity: 'uncommon', earnedAt: new Date('2024-03-05'), knowledgePoints: 120 },
      ],
      companionPersonality: 'creative',
      bondLevel: 85,
    },
  },
  {
    id: 'user-3',
    username: 'code_wizard',
    displayName: 'CodeWizard 🧙',
    bio: 'Full-stack developer. Games, tools, and everything in between.',
    status: 'away',
    membershipTier: 'developer',
    isVerified: false,
    followersCount: 1890,
    followingCount: 234,
    currentActivity: 'In the Dojo',
    aiCompanion: {
      companionName: 'Merlin',
      preferredModelId: 'codellama-34b',
      preferredModelName: 'Code Llama 34B',
      modelUsageStats: {
        totalInteractions: 8976,
        hoursUsed: 567,
        lastUsed: new Date(),
      },
      trainingPackets: [
        { packetId: 'sys-rust-ownership', name: 'Rust Ownership Model', category: 'systems', rarity: 'rare', earnedAt: new Date('2024-04-20'), knowledgePoints: 280 },
        { packetId: 'web-nextjs-fullstack', name: 'Next.js Full-Stack', category: 'web-dev', rarity: 'rare', earnedAt: new Date('2024-03-15'), knowledgePoints: 220 },
        { packetId: 'ai-pytorch-basics', name: 'PyTorch Fundamentals', category: 'ai-ml', rarity: 'uncommon', earnedAt: new Date('2024-02-10'), knowledgePoints: 150 },
      ],
      companionPersonality: 'analytical',
      bondLevel: 72,
    },
  },
  {
    id: 'user-4',
    username: 'game_dev_pro',
    displayName: 'GameDevPro 🎮',
    bio: 'Indie game developer. Currently working on my dream RPG!',
    status: 'busy',
    membershipTier: 'creator',
    isVerified: false,
    followersCount: 892,
    followingCount: 567,
    currentActivity: 'Building a game',
    aiCompanion: {
      companionName: 'Quest',
      preferredModelId: 'mistral-7b',
      preferredModelName: 'Mistral 7B Instruct',
      modelUsageStats: {
        totalInteractions: 3420,
        hoursUsed: 156,
        lastUsed: new Date(),
      },
      trainingPackets: [
        { packetId: 'engine-godot-gdscript', name: 'Godot GDScript Fluency', category: 'game-engines', rarity: 'common', earnedAt: new Date('2024-05-01'), knowledgePoints: 55 },
        { packetId: 'engine-unreal-bp', name: 'Unreal Blueprints', category: 'game-engines', rarity: 'common', earnedAt: new Date('2024-04-15'), knowledgePoints: 60 },
      ],
      companionPersonality: 'enthusiastic',
      bondLevel: 45,
    },
  },
  {
    id: 'user-5',
    username: 'music_maker',
    displayName: 'MusicMaker 🎵',
    bio: 'Game audio specialist. Composing epic soundtracks.',
    status: 'online',
    membershipTier: 'creator',
    isVerified: true,
    followersCount: 2456,
    followingCount: 189,
    currentActivity: 'Composing music',
  },
  {
    id: 'user-6',
    username: 'story_weaver',
    displayName: 'StoryWeaver 📖',
    bio: 'Writer and world-builder. Creating immersive narratives.',
    status: 'online',
    membershipTier: 'developer',
    isVerified: false,
    followersCount: 1234,
    followingCount: 321,
    currentActivity: 'Writing lore',
  },
];

// ================== DEMO POSTS ==================
const generateDemoPosts = (): Post[] => {
  const now = Date.now();
  return [
    {
      id: 'post-1',
      authorId: 'user-1',
      author: DEMO_USERS[0],
      content: '🚀 Exciting news! We just launched the new TCG battle system in Aetherium! Come collect cards and battle your friends. What card combos are you trying first?',
      createdAt: new Date(now - 3600000),
      likesCount: 234,
      commentsCount: 45,
      sharesCount: 23,
      likedBy: ['user-2', 'user-3', 'user-4'],
      isEdited: false,
      visibility: 'public',
      tags: ['announcement', 'aetherium', 'tcg'],
      pinned: true,
    },
    {
      id: 'post-2',
      authorId: 'user-2',
      author: DEMO_USERS[1],
      content: 'Just finished this pixel art character! 32x32 with 8-direction walk cycle. Free to use in your projects! 🎨✨\n\nLet me know what characters you want to see next!',
      images: [],
      createdAt: new Date(now - 7200000),
      likesCount: 189,
      commentsCount: 32,
      sharesCount: 56,
      likedBy: ['user-1', 'user-3', 'user-5'],
      isEdited: false,
      visibility: 'public',
      tags: ['pixel-art', 'free-asset', 'character'],
    },
    {
      id: 'post-3',
      authorId: 'user-3',
      author: DEMO_USERS[2],
      content: 'Pro tip: When using the Dojo for Unreal Engine projects, make sure to enable "Hot Reload" in the project settings. Saves SO much time! 🔥\n\n#gamedev #unrealengine #tips',
      createdAt: new Date(now - 14400000),
      likesCount: 145,
      commentsCount: 28,
      sharesCount: 34,
      likedBy: ['user-1', 'user-4'],
      isEdited: false,
      visibility: 'public',
      tags: ['tips', 'unreal', 'gamedev'],
    },
    {
      id: 'post-4',
      authorId: 'user-5',
      author: DEMO_USERS[4],
      content: '🎵 New ambient track for RPG exploration scenes! Used the Music Composer to create this. 3 minutes of atmospheric goodness. Link in bio!\n\nWhat genre should I try next?',
      createdAt: new Date(now - 21600000),
      likesCount: 178,
      commentsCount: 41,
      sharesCount: 29,
      likedBy: ['user-1', 'user-2', 'user-6'],
      isEdited: false,
      visibility: 'public',
      tags: ['music', 'ambient', 'rpg', 'free'],
    },
    {
      id: 'post-5',
      authorId: 'user-6',
      author: DEMO_USERS[5],
      content: 'Working on the lore for my fantasy world. The AI writing assistant in the Literature Zone is incredible for brainstorming!\n\nHere\'s a snippet:\n"In the age before machines, the Aetherborn walked among us..."',
      createdAt: new Date(now - 28800000),
      likesCount: 92,
      commentsCount: 18,
      sharesCount: 12,
      likedBy: ['user-1', 'user-3'],
      isEdited: false,
      visibility: 'public',
      tags: ['writing', 'lore', 'fantasy', 'worldbuilding'],
    },
    {
      id: 'post-6',
      authorId: 'user-4',
      author: DEMO_USERS[3],
      content: 'Looking for collaborators! 🤝\n\nI\'m building an open-world RPG and need:\n• 2D Artists for character sprites\n• Musicians for the soundtrack\n• Writers for quest design\n\nDM me if interested!',
      createdAt: new Date(now - 43200000),
      likesCount: 67,
      commentsCount: 24,
      sharesCount: 45,
      likedBy: ['user-2', 'user-5', 'user-6'],
      isEdited: false,
      visibility: 'public',
      tags: ['collaboration', 'hiring', 'rpg', 'team'],
    },
  ];
};

// ================== HELPER FUNCTIONS ==================
const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
};

const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ================== CURRENT USER ==================
export const getCurrentUser = (): SocialUser | null => {
  const stored = getFromStorage<SocialUser | null>(STORAGE_KEYS.CURRENT_USER, null);
  if (stored) return stored;
  
  // Create a default user for demo purposes
  const defaultUser: SocialUser = {
    id: `user-${Date.now()}`,
    username: 'creator',
    displayName: 'Creative User',
    status: 'online',
    membershipTier: 'free',
    isVerified: false,
    followersCount: 0,
    followingCount: 0,
    currentActivity: 'Exploring the platform',
  };
  saveToStorage(STORAGE_KEYS.CURRENT_USER, defaultUser);
  return defaultUser;
};

export const updateCurrentUser = (updates: Partial<SocialUser>): SocialUser => {
  const current = getCurrentUser();
  if (!current) throw new Error('No current user');
  const updated = { ...current, ...updates };
  saveToStorage(STORAGE_KEYS.CURRENT_USER, updated);
  return updated;
};

export const setUserStatus = (status: SocialUser['status'], activity?: string): void => {
  updateCurrentUser({ status, currentActivity: activity });
};

// ================== ONLINE USERS ==================
export const getOnlineUsers = (): SocialUser[] => {
  // In production, this would come from WebSocket/Firebase presence
  // For now, return demo users with varying online status
  return DEMO_USERS.filter(u => u.status === 'online' || u.status === 'away' || u.status === 'busy');
};

export const getAllUsers = (): SocialUser[] => {
  return DEMO_USERS;
};

export const getUserById = (userId: string): SocialUser | undefined => {
  return DEMO_USERS.find(u => u.id === userId);
};

// ================== POSTS ==================
export const getPosts = (options?: { 
  authorId?: string; 
  tag?: string; 
  limit?: number;
  before?: Date;
}): Post[] => {
  let posts = getFromStorage<Post[]>(STORAGE_KEYS.POSTS, generateDemoPosts());
  
  // Ensure dates are Date objects
  posts = posts.map(p => ({
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
  }));
  
  if (options?.authorId) {
    posts = posts.filter(p => p.authorId === options.authorId);
  }
  
  if (options?.tag) {
    posts = posts.filter(p => p.tags?.includes(options.tag));
  }
  
  if (options?.before) {
    posts = posts.filter(p => new Date(p.createdAt) < options.before!);
  }
  
  // Sort by pinned first, then by date
  posts.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  if (options?.limit) {
    posts = posts.slice(0, options.limit);
  }
  
  return posts;
};

export const getPostById = (postId: string): Post | undefined => {
  const posts = getPosts();
  return posts.find(p => p.id === postId);
};

export const createPost = (content: string, options?: {
  images?: string[];
  attachments?: PostAttachment[];
  visibility?: Post['visibility'];
  tags?: string[];
}): Post => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Must be logged in to post');
  
  const newPost: Post = {
    id: generateId(),
    authorId: currentUser.id,
    author: currentUser,
    content,
    images: options?.images,
    attachments: options?.attachments,
    createdAt: new Date(),
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    likedBy: [],
    isEdited: false,
    visibility: options?.visibility || 'public',
    tags: options?.tags,
    mentions: extractMentions(content),
  };
  
  const posts = getPosts();
  posts.unshift(newPost);
  saveToStorage(STORAGE_KEYS.POSTS, posts);
  
  // Create activity event
  addActivity({
    type: 'post',
    description: 'Created a new post',
    metadata: { postId: newPost.id },
  });
  
  // Notify mentioned users
  newPost.mentions?.forEach(userId => {
    addNotification(userId, {
      type: 'mention',
      title: 'You were mentioned!',
      message: `${currentUser.displayName} mentioned you in a post`,
      fromUser: currentUser,
      relatedId: newPost.id,
      actionUrl: `/post/${newPost.id}`,
    });
  });
  
  return newPost;
};

export const editPost = (postId: string, content: string): Post => {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === postId);
  if (index === -1) throw new Error('Post not found');
  
  posts[index] = {
    ...posts[index],
    content,
    updatedAt: new Date(),
    isEdited: true,
    mentions: extractMentions(content),
  };
  
  saveToStorage(STORAGE_KEYS.POSTS, posts);
  return posts[index];
};

export const deletePost = (postId: string): void => {
  const posts = getPosts();
  const filtered = posts.filter(p => p.id !== postId);
  saveToStorage(STORAGE_KEYS.POSTS, filtered);
  
  // Also delete comments for this post
  const comments = getComments(postId);
  const allComments = getFromStorage<Comment[]>(STORAGE_KEYS.COMMENTS, []);
  const filteredComments = allComments.filter(c => c.postId !== postId);
  saveToStorage(STORAGE_KEYS.COMMENTS, filteredComments);
};

export const likePost = (postId: string): Post => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Must be logged in to like');
  
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === postId);
  if (index === -1) throw new Error('Post not found');
  
  const post = posts[index];
  const alreadyLiked = post.likedBy.includes(currentUser.id);
  
  if (alreadyLiked) {
    post.likedBy = post.likedBy.filter(id => id !== currentUser.id);
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    post.likedBy.push(currentUser.id);
    post.likesCount += 1;
    
    // Notify post author
    if (post.authorId !== currentUser.id) {
      addNotification(post.authorId, {
        type: 'like',
        title: 'Someone liked your post!',
        message: `${currentUser.displayName} liked your post`,
        fromUser: currentUser,
        relatedId: postId,
        actionUrl: `/post/${postId}`,
      });
    }
    
    addActivity({
      type: 'like',
      description: `Liked a post by ${post.author.displayName}`,
      metadata: { postId },
    });
  }
  
  posts[index] = post;
  saveToStorage(STORAGE_KEYS.POSTS, posts);
  return post;
};

export const sharePost = (postId: string): Post => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Must be logged in to share');
  
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === postId);
  if (index === -1) throw new Error('Post not found');
  
  posts[index].sharesCount += 1;
  saveToStorage(STORAGE_KEYS.POSTS, posts);
  
  return posts[index];
};

// ================== COMMENTS ==================
export const getComments = (postId: string): Comment[] => {
  const allComments = getFromStorage<Comment[]>(STORAGE_KEYS.COMMENTS, []);
  return allComments
    .filter(c => c.postId === postId && !c.replyToId)
    .map(c => ({
      ...c,
      createdAt: new Date(c.createdAt),
      replies: allComments
        .filter(r => r.replyToId === c.id)
        .map(r => ({ ...r, createdAt: new Date(r.createdAt) })),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addComment = (postId: string, content: string, replyToId?: string): Comment => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Must be logged in to comment');
  
  const newComment: Comment = {
    id: generateId(),
    postId,
    authorId: currentUser.id,
    author: currentUser,
    content,
    createdAt: new Date(),
    likesCount: 0,
    likedBy: [],
    replyToId,
    isEdited: false,
  };
  
  const allComments = getFromStorage<Comment[]>(STORAGE_KEYS.COMMENTS, []);
  allComments.push(newComment);
  saveToStorage(STORAGE_KEYS.COMMENTS, allComments);
  
  // Update post comment count
  const posts = getPosts();
  const postIndex = posts.findIndex(p => p.id === postId);
  if (postIndex !== -1) {
    posts[postIndex].commentsCount += 1;
    saveToStorage(STORAGE_KEYS.POSTS, posts);
    
    // Notify post author
    if (posts[postIndex].authorId !== currentUser.id) {
      addNotification(posts[postIndex].authorId, {
        type: 'comment',
        title: 'New comment on your post!',
        message: `${currentUser.displayName} commented: "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}"`,
        fromUser: currentUser,
        relatedId: postId,
        actionUrl: `/post/${postId}`,
      });
    }
  }
  
  addActivity({
    type: 'comment',
    description: 'Commented on a post',
    metadata: { postId, commentId: newComment.id },
  });
  
  return newComment;
};

export const likeComment = (commentId: string): Comment => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Must be logged in to like');
  
  const allComments = getFromStorage<Comment[]>(STORAGE_KEYS.COMMENTS, []);
  const index = allComments.findIndex(c => c.id === commentId);
  if (index === -1) throw new Error('Comment not found');
  
  const comment = allComments[index];
  const alreadyLiked = comment.likedBy.includes(currentUser.id);
  
  if (alreadyLiked) {
    comment.likedBy = comment.likedBy.filter(id => id !== currentUser.id);
    comment.likesCount = Math.max(0, comment.likesCount - 1);
  } else {
    comment.likedBy.push(currentUser.id);
    comment.likesCount += 1;
  }
  
  allComments[index] = comment;
  saveToStorage(STORAGE_KEYS.COMMENTS, allComments);
  return comment;
};

// ================== WALL MESSAGES ==================
export const getWallMessages = (wallOwnerId: string): WallMessage[] => {
  const messages = getFromStorage<WallMessage[]>(STORAGE_KEYS.WALL_MESSAGES, []);
  return messages
    .filter(m => m.wallOwnerId === wallOwnerId)
    .map(m => ({ ...m, createdAt: new Date(m.createdAt) }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const postWallMessage = (wallOwnerId: string, content: string, isPrivate = false): WallMessage => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Must be logged in');
  
  const newMessage: WallMessage = {
    id: generateId(),
    wallOwnerId,
    authorId: currentUser.id,
    author: currentUser,
    content,
    createdAt: new Date(),
    isPrivate,
    likesCount: 0,
    likedBy: [],
  };
  
  const messages = getFromStorage<WallMessage[]>(STORAGE_KEYS.WALL_MESSAGES, []);
  messages.unshift(newMessage);
  saveToStorage(STORAGE_KEYS.WALL_MESSAGES, messages);
  
  // Notify wall owner
  if (wallOwnerId !== currentUser.id) {
    addNotification(wallOwnerId, {
      type: 'wall_message',
      title: 'New message on your wall!',
      message: `${currentUser.displayName} left a message: "${content.slice(0, 50)}${content.length > 50 ? '...' : ''}"`,
      fromUser: currentUser,
      relatedId: newMessage.id,
      actionUrl: `/profile/${wallOwnerId}`,
    });
  }
  
  return newMessage;
};

// ================== FOLLOWS ==================
interface FollowData {
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export const getFollowers = (userId: string): string[] => {
  const follows = getFromStorage<FollowData[]>(STORAGE_KEYS.FOLLOWS, []);
  return follows.filter(f => f.followingId === userId).map(f => f.followerId);
};

export const getFollowing = (userId: string): string[] => {
  const follows = getFromStorage<FollowData[]>(STORAGE_KEYS.FOLLOWS, []);
  return follows.filter(f => f.followerId === userId).map(f => f.followingId);
};

export const isFollowing = (targetUserId: string): boolean => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  const following = getFollowing(currentUser.id);
  return following.includes(targetUserId);
};

export const followUser = (targetUserId: string): void => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Must be logged in');
  if (currentUser.id === targetUserId) throw new Error('Cannot follow yourself');
  
  const follows = getFromStorage<FollowData[]>(STORAGE_KEYS.FOLLOWS, []);
  const existing = follows.find(f => f.followerId === currentUser.id && f.followingId === targetUserId);
  
  if (!existing) {
    follows.push({
      followerId: currentUser.id,
      followingId: targetUserId,
      createdAt: new Date(),
    });
    saveToStorage(STORAGE_KEYS.FOLLOWS, follows);
    
    // Notify user
    const targetUser = getUserById(targetUserId);
    addNotification(targetUserId, {
      type: 'follow',
      title: 'New follower!',
      message: `${currentUser.displayName} started following you`,
      fromUser: currentUser,
      actionUrl: `/profile/${currentUser.id}`,
    });
    
    addActivity({
      type: 'follow',
      description: `Started following ${targetUser?.displayName || 'someone'}`,
      metadata: { targetUserId },
    });
  }
};

export const unfollowUser = (targetUserId: string): void => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Must be logged in');
  
  const follows = getFromStorage<FollowData[]>(STORAGE_KEYS.FOLLOWS, []);
  const filtered = follows.filter(f => !(f.followerId === currentUser.id && f.followingId === targetUserId));
  saveToStorage(STORAGE_KEYS.FOLLOWS, filtered);
};

// ================== NOTIFICATIONS ==================
export const getNotifications = (userId?: string): Notification[] => {
  const currentUser = getCurrentUser();
  const targetId = userId || currentUser?.id;
  if (!targetId) return [];
  
  const notifications = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  return notifications
    .filter(n => n.userId === targetId)
    .map(n => ({ ...n, createdAt: new Date(n.createdAt) }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getUnreadNotificationCount = (userId?: string): number => {
  const notifications = getNotifications(userId);
  return notifications.filter(n => !n.read).length;
};

export const addNotification = (userId: string, notification: Omit<Notification, 'id' | 'userId' | 'read' | 'createdAt'>): Notification => {
  const newNotification: Notification = {
    ...notification,
    id: generateId(),
    userId,
    read: false,
    createdAt: new Date(),
  };
  
  const notifications = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  notifications.unshift(newNotification);
  
  // Keep only last 100 notifications per user
  const userNotifications = notifications.filter(n => n.userId === userId);
  if (userNotifications.length > 100) {
    const toRemove = userNotifications.slice(100);
    const toRemoveIds = new Set(toRemove.map(n => n.id));
    const filtered = notifications.filter(n => !toRemoveIds.has(n.id));
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, filtered);
  } else {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
  
  return newNotification;
};

export const markNotificationRead = (notificationId: string): void => {
  const notifications = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  const index = notifications.findIndex(n => n.id === notificationId);
  if (index !== -1) {
    notifications[index].read = true;
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
};

export const markAllNotificationsRead = (): void => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const notifications = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  notifications.forEach(n => {
    if (n.userId === currentUser.id) {
      n.read = true;
    }
  });
  saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
};

// ================== ACTIVITY ==================
export const getActivity = (userId?: string, limit = 50): ActivityEvent[] => {
  const currentUser = getCurrentUser();
  const targetId = userId || currentUser?.id;
  if (!targetId) return [];
  
  const activity = getFromStorage<ActivityEvent[]>(STORAGE_KEYS.ACTIVITY, []);
  return activity
    .filter(a => a.userId === targetId)
    .map(a => ({ ...a, createdAt: new Date(a.createdAt) }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const addActivity = (event: Omit<ActivityEvent, 'id' | 'userId' | 'createdAt'>): ActivityEvent => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('No current user');
  
  const newEvent: ActivityEvent = {
    ...event,
    id: generateId(),
    userId: currentUser.id,
    createdAt: new Date(),
  };
  
  const activity = getFromStorage<ActivityEvent[]>(STORAGE_KEYS.ACTIVITY, []);
  activity.unshift(newEvent);
  
  // Keep only last 500 events
  if (activity.length > 500) {
    activity.splice(500);
  }
  saveToStorage(STORAGE_KEYS.ACTIVITY, activity);
  
  return newEvent;
};

// ================== AI RECAP ==================
export const generateActivityRecap = async (since?: Date): Promise<string> => {
  const currentUser = getCurrentUser();
  if (!currentUser) return 'Please log in to see your activity recap.';
  
  const sinceDate = since || new Date(Date.now() - 24 * 60 * 60 * 1000); // Default: last 24 hours
  
  // Get activity since the date
  const notifications = getNotifications().filter(n => new Date(n.createdAt) > sinceDate);
  const posts = getPosts({ limit: 20 });
  
  const context = `
User: ${currentUser.displayName}
Time away: Since ${sinceDate.toLocaleString()}

Notifications received (${notifications.length}):
${notifications.slice(0, 10).map(n => `- ${n.type}: ${n.message}`).join('\n')}

Recent community posts:
${posts.slice(0, 5).map(p => `- ${p.author.displayName}: ${p.content.slice(0, 100)}...`).join('\n')}
`;

  try {
    const response = await aiService.generate(
      `You are a friendly assistant for a creative platform. Summarize what happened while the user was away. Be concise, friendly, and highlight important things they might want to check out.

${context}

Write a brief, friendly recap (2-3 paragraphs max):`,
      { temperature: 0.7 }
    );
    if (response.success) {
      return response.content;
    }
    // Fall through to fallback if AI failed
  } catch (error) {
    // Fall through to fallback
  }

  // Fallback if AI not available
  const newFollowers = notifications.filter(n => n.type === 'follow').length;
  const newLikes = notifications.filter(n => n.type === 'like').length;
  const newComments = notifications.filter(n => n.type === 'comment').length;
  const newMessages = notifications.filter(n => n.type === 'dm' || n.type === 'wall_message').length;

  let recap = `Welcome back, ${currentUser.displayName}! 👋\n\n`;

  if (notifications.length === 0) {
    recap += "It's been quiet while you were away. Perfect time to create something new!";
  } else {
    recap += `While you were away:\n`;
    if (newFollowers > 0) recap += `• ${newFollowers} new follower${newFollowers > 1 ? 's' : ''}\n`;
    if (newLikes > 0) recap += `• ${newLikes} new like${newLikes > 1 ? 's' : ''} on your posts\n`;
    if (newComments > 0) recap += `• ${newComments} new comment${newComments > 1 ? 's' : ''}\n`;
    if (newMessages > 0) recap += `• ${newMessages} new message${newMessages > 1 ? 's' : ''}\n`;
    recap += `\nCheck your notifications for details!`;
  }

  return recap;
};

// ================== HELPERS ==================
const extractMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const matches = content.match(mentionRegex);
  if (!matches) return [];
  
  const usernames = matches.map(m => m.slice(1).toLowerCase());
  const users = DEMO_USERS.filter(u => usernames.includes(u.username.toLowerCase()));
  return users.map(u => u.id);
};

// ================== EXPORT ==================
export const socialNetworkService = {
  // User
  getCurrentUser,
  updateCurrentUser,
  setUserStatus,
  getOnlineUsers,
  getAllUsers,
  getUserById,
  
  // Posts
  getPosts,
  getPostById,
  createPost,
  editPost,
  deletePost,
  likePost,
  sharePost,
  
  // Comments
  getComments,
  addComment,
  likeComment,
  
  // Wall
  getWallMessages,
  postWallMessage,
  
  // Follows
  getFollowers,
  getFollowing,
  isFollowing,
  followUser,
  unfollowUser,
  
  // Notifications
  getNotifications,
  getUnreadNotificationCount,
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  
  // Activity
  getActivity,
  addActivity,
  generateActivityRecap,
};

export default socialNetworkService;

// ============================================================================
// DIRECT MESSAGING SERVICE
// ============================================================================
// Real-time messaging between users with conversation management
// Integrates with WebSocket for live updates, falls back to polling
// ============================================================================

import { SocialUser, getCurrentUser, getUserById, addNotification, getAllUsers } from './socialNetworkService';
import * as FirebaseDM from './firebaseDMService';

// ================== TYPES ==================
export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  sender: SocialUser;
  content: string;
  attachments?: MessageAttachment[];
  createdAt: Date;
  readAt?: Date;
  isEdited: boolean;
  editedAt?: Date;
  reactions?: MessageReaction[];
  replyToId?: string;
  replyTo?: DirectMessage;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'link' | 'sticker' | 'gif';
  url: string;
  name?: string;
  size?: number;
  thumbnail?: string;
  metadata?: Record<string, any>;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: SocialUser[];
  participantIds: string[];
  type: 'direct' | 'group';
  name?: string; // For group chats
  avatar?: string;
  lastMessage?: DirectMessage;
  lastActivity: Date;
  createdAt: Date;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  timestamp: Date;
}

// ================== STORAGE KEYS ==================
const STORAGE_KEYS = {
  CONVERSATIONS: 'aura_dm_conversations',
  MESSAGES: 'aura_dm_messages',
  TYPING: 'aura_dm_typing',
  READ_RECEIPTS: 'aura_dm_read_receipts',
};

// ================== HELPERS ==================
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

const getConversationId = (userId1: string, userId2: string): string => {
  const sorted = [userId1, userId2].sort();
  return `dm-${sorted[0]}-${sorted[1]}`;
};

// ================== DEMO DATA ==================
const generateDemoConversations = (): Conversation[] => {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  
  const users = getAllUsers().filter(u => u.id !== currentUser.id);
  const now = Date.now();
  
  return users.slice(0, 4).map((user, index) => ({
    id: getConversationId(currentUser.id, user.id),
    participants: [currentUser, user],
    participantIds: [currentUser.id, user.id],
    type: 'direct' as const,
    lastActivity: new Date(now - index * 3600000),
    createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
    unreadCount: index === 0 ? 2 : 0,
    isPinned: index === 0,
    isMuted: false,
    isArchived: false,
    lastMessage: {
      id: `msg-preview-${index}`,
      conversationId: getConversationId(currentUser.id, user.id),
      senderId: user.id,
      sender: user,
      content: [
        'Hey! Did you see the new TCG cards? 🎴',
        'Your latest art piece looks amazing! 🎨',
        'Thanks for the help with my project!',
        'Let me know when you want to collaborate',
      ][index],
      createdAt: new Date(now - index * 3600000),
      isEdited: false,
    },
  }));
};

const generateDemoMessages = (conversationId: string): DirectMessage[] => {
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  
  const parts = conversationId.split('-');
  const otherUserId = parts.find(p => p !== 'dm' && p !== currentUser.id);
  const otherUser = otherUserId ? getUserById(otherUserId) : null;
  if (!otherUser) return [];
  
  const now = Date.now();
  return [
    {
      id: `${conversationId}-1`,
      conversationId,
      senderId: otherUser.id,
      sender: otherUser,
      content: 'Hey! How are you doing? 👋',
      createdAt: new Date(now - 3600000 * 24),
      isEdited: false,
    },
    {
      id: `${conversationId}-2`,
      conversationId,
      senderId: currentUser.id,
      sender: currentUser,
      content: "Hi! I'm doing great, thanks! Just been working on some new projects.",
      createdAt: new Date(now - 3600000 * 23),
      isEdited: false,
    },
    {
      id: `${conversationId}-3`,
      conversationId,
      senderId: otherUser.id,
      sender: otherUser,
      content: 'That sounds awesome! What kind of projects?',
      createdAt: new Date(now - 3600000 * 22),
      isEdited: false,
    },
    {
      id: `${conversationId}-4`,
      conversationId,
      senderId: currentUser.id,
      sender: currentUser,
      content: "I've been playing around with the game development tools here. The Dojo is incredible for prototyping!",
      createdAt: new Date(now - 3600000 * 20),
      isEdited: false,
    },
    {
      id: `${conversationId}-5`,
      conversationId,
      senderId: otherUser.id,
      sender: otherUser,
      content: 'Nice! Let me know if you need any help. I love the collaborative features here.',
      createdAt: new Date(now - 3600000 * 18),
      isEdited: false,
    },
    {
      id: `${conversationId}-6`,
      conversationId,
      senderId: otherUser.id,
      sender: otherUser,
      content: 'By the way, have you tried the new Aetherium TCG? The card mechanics are really fun!',
      createdAt: new Date(now - 3600000),
      isEdited: false,
    },
  ];
};

// ================== CONVERSATIONS ==================
export const getConversations = (options?: {
  includeArchived?: boolean;
  limit?: number;
}): Conversation[] => {
  let conversations = getFromStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  
  // Initialize with demo data if empty
  if (conversations.length === 0) {
    conversations = generateDemoConversations();
    saveToStorage(STORAGE_KEYS.CONVERSATIONS, conversations);
  }
  
  // Parse dates
  conversations = conversations.map(c => ({
    ...c,
    lastActivity: new Date(c.lastActivity),
    createdAt: new Date(c.createdAt),
    lastMessage: c.lastMessage ? {
      ...c.lastMessage,
      createdAt: new Date(c.lastMessage.createdAt),
    } : undefined,
  }));
  
  // Filter
  if (!options?.includeArchived) {
    conversations = conversations.filter(c => !c.isArchived);
  }
  
  // Sort: Pinned first, then by last activity
  conversations.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
  });
  
  if (options?.limit) {
    conversations = conversations.slice(0, options.limit);
  }
  
  return conversations;
};

export const getConversation = (conversationId: string): Conversation | undefined => {
  const conversations = getConversations({ includeArchived: true });
  return conversations.find(c => c.id === conversationId);
};

export const getOrCreateConversation = (targetUserId: string): Conversation => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Must be logged in');
  if (currentUser.id === targetUserId) throw new Error('Cannot message yourself');
  
  const conversationId = getConversationId(currentUser.id, targetUserId);
  const existing = getConversation(conversationId);
  if (existing) return existing;
  
  const targetUser = getUserById(targetUserId);
  if (!targetUser) throw new Error('User not found');
  
  const newConversation: Conversation = {
    id: conversationId,
    participants: [currentUser, targetUser],
    participantIds: [currentUser.id, targetUserId],
    type: 'direct',
    lastActivity: new Date(),
    createdAt: new Date(),
    unreadCount: 0,
    isPinned: false,
    isMuted: false,
    isArchived: false,
  };
  
  const conversations = getFromStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  conversations.unshift(newConversation);
  saveToStorage(STORAGE_KEYS.CONVERSATIONS, conversations);
  
  return newConversation;
};

export const updateConversation = (conversationId: string, updates: Partial<Conversation>): Conversation => {
  const conversations = getFromStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
  const index = conversations.findIndex(c => c.id === conversationId);
  if (index === -1) throw new Error('Conversation not found');
  
  conversations[index] = { ...conversations[index], ...updates };
  saveToStorage(STORAGE_KEYS.CONVERSATIONS, conversations);
  return conversations[index];
};

export const pinConversation = (conversationId: string, pinned: boolean): void => {
  updateConversation(conversationId, { isPinned: pinned });
};

export const muteConversation = (conversationId: string, muted: boolean): void => {
  updateConversation(conversationId, { isMuted: muted });
};

export const archiveConversation = (conversationId: string, archived: boolean): void => {
  updateConversation(conversationId, { isArchived: archived });
};

// ================== MESSAGES ==================
export const getMessages = (conversationId: string, options?: {
  limit?: number;
  before?: Date;
}): DirectMessage[] => {
  const allMessages = getFromStorage<Record<string, DirectMessage[]>>(STORAGE_KEYS.MESSAGES, {});
  let messages = allMessages[conversationId] || [];
  
  // Initialize with demo data if empty
  if (messages.length === 0) {
    messages = generateDemoMessages(conversationId);
    allMessages[conversationId] = messages;
    saveToStorage(STORAGE_KEYS.MESSAGES, allMessages);
  }
  
  // Parse dates and populate sender info
  messages = messages.map(m => ({
    ...m,
    createdAt: new Date(m.createdAt),
    readAt: m.readAt ? new Date(m.readAt) : undefined,
    editedAt: m.editedAt ? new Date(m.editedAt) : undefined,
    sender: m.sender || getUserById(m.senderId) || { id: m.senderId, username: 'unknown', displayName: 'Unknown User', status: 'offline' as const, membershipTier: 'free' as const, isVerified: false, followersCount: 0, followingCount: 0 },
  }));
  
  if (options?.before) {
    messages = messages.filter(m => new Date(m.createdAt) < options.before!);
  }
  
  // Sort oldest first for display
  messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  if (options?.limit) {
    messages = messages.slice(-options.limit);
  }
  
  return messages;
};

export const sendMessage = (conversationId: string, content: string, options?: {
  attachments?: MessageAttachment[];
  replyToId?: string;
}): DirectMessage => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Must be logged in');
  
  const conversation = getConversation(conversationId);
  if (!conversation) throw new Error('Conversation not found');
  
  // Get reply message if replying
  let replyTo: DirectMessage | undefined;
  if (options?.replyToId) {
    const messages = getMessages(conversationId);
    replyTo = messages.find(m => m.id === options.replyToId);
  }
  
  const newMessage: DirectMessage = {
    id: generateId(),
    conversationId,
    senderId: currentUser.id,
    sender: currentUser,
    content,
    attachments: options?.attachments,
    createdAt: new Date(),
    isEdited: false,
    replyToId: options?.replyToId,
    replyTo,
  };
  
  // Save message
  const allMessages = getFromStorage<Record<string, DirectMessage[]>>(STORAGE_KEYS.MESSAGES, {});
  if (!allMessages[conversationId]) {
    allMessages[conversationId] = [];
  }
  allMessages[conversationId].push(newMessage);
  saveToStorage(STORAGE_KEYS.MESSAGES, allMessages);
  
  // Update conversation
  updateConversation(conversationId, {
    lastMessage: newMessage,
    lastActivity: new Date(),
  });
  
  // Notify other participants
  const otherParticipants = conversation.participantIds.filter(id => id !== currentUser.id);
  otherParticipants.forEach(userId => {
    // Increment unread count for the recipient
    const convos = getFromStorage<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
    const convoIndex = convos.findIndex(c => c.id === conversationId);
    if (convoIndex !== -1) {
      convos[convoIndex].unreadCount = (convos[convoIndex].unreadCount || 0) + 1;
      saveToStorage(STORAGE_KEYS.CONVERSATIONS, convos);
    }
    
    // Send notification
    if (!conversation.isMuted) {
      addNotification(userId, {
        type: 'dm',
        title: `Message from ${currentUser.displayName}`,
        message: content.slice(0, 100) + (content.length > 100 ? '...' : ''),
        fromUser: currentUser,
        relatedId: conversationId,
        actionUrl: `/messages/${conversationId}`,
      });
    }
  });
  
  return newMessage;
};

export const editMessage = (conversationId: string, messageId: string, newContent: string): DirectMessage => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Must be logged in');
  
  const allMessages = getFromStorage<Record<string, DirectMessage[]>>(STORAGE_KEYS.MESSAGES, {});
  const messages = allMessages[conversationId] || [];
  const index = messages.findIndex(m => m.id === messageId);
  
  if (index === -1) throw new Error('Message not found');
  if (messages[index].senderId !== currentUser.id) throw new Error('Can only edit your own messages');
  
  messages[index] = {
    ...messages[index],
    content: newContent,
    isEdited: true,
    editedAt: new Date(),
  };
  
  allMessages[conversationId] = messages;
  saveToStorage(STORAGE_KEYS.MESSAGES, allMessages);
  
  return messages[index];
};

export const deleteMessage = (conversationId: string, messageId: string): void => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Must be logged in');
  
  const allMessages = getFromStorage<Record<string, DirectMessage[]>>(STORAGE_KEYS.MESSAGES, {});
  const messages = allMessages[conversationId] || [];
  const message = messages.find(m => m.id === messageId);
  
  if (!message) throw new Error('Message not found');
  if (message.senderId !== currentUser.id) throw new Error('Can only delete your own messages');
  
  allMessages[conversationId] = messages.filter(m => m.id !== messageId);
  saveToStorage(STORAGE_KEYS.MESSAGES, allMessages);
};

export const reactToMessage = (conversationId: string, messageId: string, emoji: string): DirectMessage => {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Must be logged in');
  
  const allMessages = getFromStorage<Record<string, DirectMessage[]>>(STORAGE_KEYS.MESSAGES, {});
  const messages = allMessages[conversationId] || [];
  const index = messages.findIndex(m => m.id === messageId);
  
  if (index === -1) throw new Error('Message not found');
  
  const reactions = messages[index].reactions || [];
  const existingIndex = reactions.findIndex(r => r.userId === currentUser.id && r.emoji === emoji);
  
  if (existingIndex !== -1) {
    // Remove reaction
    reactions.splice(existingIndex, 1);
  } else {
    // Add reaction
    reactions.push({
      emoji,
      userId: currentUser.id,
      createdAt: new Date(),
    });
  }
  
  messages[index].reactions = reactions;
  allMessages[conversationId] = messages;
  saveToStorage(STORAGE_KEYS.MESSAGES, allMessages);
  
  return messages[index];
};

// ================== READ RECEIPTS ==================
export const markConversationRead = (conversationId: string): void => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  // Mark all messages as read
  const allMessages = getFromStorage<Record<string, DirectMessage[]>>(STORAGE_KEYS.MESSAGES, {});
  const messages = allMessages[conversationId] || [];
  
  messages.forEach(m => {
    if (m.senderId !== currentUser.id && !m.readAt) {
      m.readAt = new Date();
    }
  });
  
  allMessages[conversationId] = messages;
  saveToStorage(STORAGE_KEYS.MESSAGES, allMessages);
  
  // Reset unread count
  updateConversation(conversationId, { unreadCount: 0 });
};

export const getTotalUnreadCount = (): number => {
  const conversations = getConversations();
  return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
};

// ================== TYPING INDICATORS ==================
const typingIndicators: Map<string, TypingIndicator[]> = new Map();

export const setTyping = (conversationId: string, isTyping: boolean): void => {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const indicators = typingIndicators.get(conversationId) || [];
  
  if (isTyping) {
    const existing = indicators.find(i => i.userId === currentUser.id);
    if (existing) {
      existing.timestamp = new Date();
    } else {
      indicators.push({
        conversationId,
        userId: currentUser.id,
        timestamp: new Date(),
      });
    }
  } else {
    const filtered = indicators.filter(i => i.userId !== currentUser.id);
    typingIndicators.set(conversationId, filtered);
    return;
  }
  
  typingIndicators.set(conversationId, indicators);
};

export const getTypingUsers = (conversationId: string): SocialUser[] => {
  const currentUser = getCurrentUser();
  const indicators = typingIndicators.get(conversationId) || [];
  const now = Date.now();
  
  // Filter out stale indicators (older than 5 seconds)
  const active = indicators.filter(i => 
    i.userId !== currentUser?.id && 
    now - new Date(i.timestamp).getTime() < 5000
  );
  
  return active
    .map(i => getUserById(i.userId))
    .filter((u): u is SocialUser => u !== undefined);
};

// ================== SEARCH ==================
export const searchMessages = (query: string, conversationId?: string): DirectMessage[] => {
  const allMessages = getFromStorage<Record<string, DirectMessage[]>>(STORAGE_KEYS.MESSAGES, {});
  const queryLower = query.toLowerCase();
  
  let results: DirectMessage[] = [];
  
  if (conversationId) {
    const messages = allMessages[conversationId] || [];
    results = messages.filter(m => m.content.toLowerCase().includes(queryLower));
  } else {
    // Search across all conversations
    Object.values(allMessages).forEach(messages => {
      const matches = messages.filter(m => m.content.toLowerCase().includes(queryLower));
      results.push(...matches);
    });
  }
  
  // Sort by date, newest first
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return results.slice(0, 50); // Limit results
};

// ================== QUICK ACTIONS ==================
export const startConversationWithUser = (userId: string): Conversation => {
  return getOrCreateConversation(userId);
};

export const sendQuickMessage = (userId: string, content: string): DirectMessage => {
  const conversation = getOrCreateConversation(userId);
  return sendMessage(conversation.id, content);
};

// ================== HYBRID EXPORT ==================
export default {
    ...FirebaseDM,
    sendMessage: FirebaseDM.sendMessage,
    startConversationWithUser: FirebaseDM.startConversation,
    getOrCreateConversation: FirebaseDM.getOrCreateConversation,
    getMessages: () => [],
    subscribeToMessages: FirebaseDM.subscribeToMessages,
    subscribeToConversations: FirebaseDM.subscribeToConversations
};



// WebSocket Server for Real-Time Features
// Handles: Chat, Presence, Notifications, Game State

import { Server as SocketIOServer, Socket } from 'socket.io';
import { createServer } from 'http';
import express from 'express';

const app = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ============== TYPES ==============
interface User {
  id: string;
  socketId: string;
  username: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  activity?: string;
  currentChannel?: string;
  lastSeen: Date;
}

interface ChatMessage {
  id: string;
  channelId: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  reactions?: { emoji: string; users: string[] }[];
  edited?: boolean;
  replyTo?: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  members: string[];
  createdBy: string;
  createdAt: Date;
  description?: string;
  icon?: string;
}

interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'mention' | 'sale' | 'collaboration' | 'system';
  title: string;
  content: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

// ============== STATE MANAGEMENT ==============
const connectedUsers: Map<string, User> = new Map();
const channels: Map<string, Channel> = new Map();
const messageHistory: Map<string, ChatMessage[]> = new Map();
const userNotifications: Map<string, Notification[]> = new Map();
const typingUsers: Map<string, Set<string>> = new Map(); // channelId -> Set of userIds

// Default channels
const DEFAULT_CHANNELS: Channel[] = [
  { id: 'general', name: 'General', type: 'public', members: [], createdBy: 'system', createdAt: new Date(), description: 'General discussion', icon: '💬' },
  { id: 'art', name: 'Art & Design', type: 'public', members: [], createdBy: 'system', createdAt: new Date(), description: 'Share your art', icon: '🎨' },
  { id: 'games', name: 'Game Dev', type: 'public', members: [], createdBy: 'system', createdAt: new Date(), description: 'Game development talk', icon: '🎮' },
  { id: 'code', name: 'Programming', type: 'public', members: [], createdBy: 'system', createdAt: new Date(), description: 'Code discussions', icon: '💻' },
  { id: 'aetherium', name: 'Aetherium TCG', type: 'public', members: [], createdBy: 'system', createdAt: new Date(), description: 'Card game discussion', icon: '🃏' },
  { id: 'marketplace', name: 'Marketplace', type: 'public', members: [], createdBy: 'system', createdAt: new Date(), description: 'Buy, sell, trade', icon: '🏪' },
  { id: 'help', name: 'Help & Support', type: 'public', members: [], createdBy: 'system', createdAt: new Date(), description: 'Get help here', icon: '❓' },
];

DEFAULT_CHANNELS.forEach((ch) => {
  channels.set(ch.id, ch);
  messageHistory.set(ch.id, []);
  typingUsers.set(ch.id, new Set());
});

// ============== SOCKET HANDLERS ==============
io.on('connection', (socket: Socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  // ========== AUTHENTICATION ==========
  socket.on('auth:login', (data: { userId: string; username: string; avatar?: string }) => {
    const user: User = {
      id: data.userId,
      socketId: socket.id,
      username: data.username,
      avatar: data.avatar,
      status: 'online',
      lastSeen: new Date(),
    };

    connectedUsers.set(data.userId, user);
    socket.data.userId = data.userId;

    // Notify all users of presence change
    io.emit('presence:update', {
      userId: data.userId,
      username: data.username,
      status: 'online',
    });

    // Send current online users
    socket.emit('presence:list', Array.from(connectedUsers.values()).map((u) => ({
      userId: u.id,
      username: u.username,
      avatar: u.avatar,
      status: u.status,
      activity: u.activity,
    })));

    // Send channel list
    socket.emit('channels:list', Array.from(channels.values()));

    // Send unread notifications
    const notifications = userNotifications.get(data.userId) || [];
    socket.emit('notifications:list', notifications.filter((n) => !n.read));

    console.log(`[WS] User authenticated: ${data.username} (${data.userId})`);
  });

  // ========== PRESENCE ==========
  socket.on('presence:status', (data: { status: 'online' | 'away' | 'busy'; activity?: string }) => {
    const userId = socket.data.userId;
    const user = connectedUsers.get(userId);

    if (user) {
      user.status = data.status;
      user.activity = data.activity;
      connectedUsers.set(userId, user);

      io.emit('presence:update', {
        userId,
        username: user.username,
        status: data.status,
        activity: data.activity,
      });
    }
  });

  // ========== CHANNELS ==========
  socket.on('channel:join', (channelId: string) => {
    const userId = socket.data.userId;
    const channel = channels.get(channelId);

    if (channel) {
      socket.join(channelId);
      
      const user = connectedUsers.get(userId);
      if (user) {
        user.currentChannel = channelId;
        connectedUsers.set(userId, user);
      }

      // Send message history
      const history = messageHistory.get(channelId) || [];
      socket.emit('channel:history', { channelId, messages: history.slice(-100) });

      // Notify channel
      io.to(channelId).emit('channel:userJoined', {
        channelId,
        userId,
        username: user?.username,
      });
    }
  });

  socket.on('channel:leave', (channelId: string) => {
    const userId = socket.data.userId;
    socket.leave(channelId);

    const user = connectedUsers.get(userId);
    if (user && user.currentChannel === channelId) {
      user.currentChannel = undefined;
      connectedUsers.set(userId, user);
    }

    io.to(channelId).emit('channel:userLeft', {
      channelId,
      userId,
      username: user?.username,
    });
  });

  socket.on('channel:create', (data: { name: string; type: 'public' | 'private'; description?: string }) => {
    const userId = socket.data.userId;
    const user = connectedUsers.get(userId);

    const channelId = `ch_${Date.now()}`;
    const channel: Channel = {
      id: channelId,
      name: data.name,
      type: data.type,
      members: [userId],
      createdBy: userId,
      createdAt: new Date(),
      description: data.description,
    };

    channels.set(channelId, channel);
    messageHistory.set(channelId, []);
    typingUsers.set(channelId, new Set());

    io.emit('channels:new', channel);
    socket.emit('channel:created', channel);
  });

  // ========== MESSAGES ==========
  socket.on('message:send', (data: { channelId: string; content: string; type?: 'text' | 'image' | 'file'; replyTo?: string }) => {
    const userId = socket.data.userId;
    const user = connectedUsers.get(userId);

    if (!user) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      channelId: data.channelId,
      userId,
      username: user.username,
      avatar: user.avatar,
      content: data.content,
      timestamp: new Date(),
      type: data.type || 'text',
      reactions: [],
      replyTo: data.replyTo,
    };

    // Store message
    const history = messageHistory.get(data.channelId) || [];
    history.push(message);
    if (history.length > 1000) history.shift(); // Limit history
    messageHistory.set(data.channelId, history);

    // Broadcast to channel
    io.to(data.channelId).emit('message:new', message);

    // Clear typing indicator
    const typing = typingUsers.get(data.channelId);
    if (typing) {
      typing.delete(userId);
      io.to(data.channelId).emit('typing:update', {
        channelId: data.channelId,
        users: Array.from(typing),
      });
    }

    // Check for mentions and send notifications
    const mentions = data.content.match(/@(\w+)/g);
    if (mentions) {
      mentions.forEach((mention) => {
        const mentionedUsername = mention.slice(1);
        const mentionedUser = Array.from(connectedUsers.values()).find(
          (u) => u.username.toLowerCase() === mentionedUsername.toLowerCase()
        );

        if (mentionedUser) {
          const notification: Notification = {
            id: `notif_${Date.now()}`,
            userId: mentionedUser.id,
            type: 'mention',
            title: `${user.username} mentioned you`,
            content: data.content.slice(0, 100),
            link: `/chat?channel=${data.channelId}`,
            read: false,
            createdAt: new Date(),
          };

          const userNotifs = userNotifications.get(mentionedUser.id) || [];
          userNotifs.push(notification);
          userNotifications.set(mentionedUser.id, userNotifs);

          io.to(mentionedUser.socketId).emit('notification:new', notification);
        }
      });
    }
  });

  socket.on('message:edit', (data: { messageId: string; channelId: string; content: string }) => {
    const userId = socket.data.userId;
    const history = messageHistory.get(data.channelId);

    if (history) {
      const message = history.find((m) => m.id === data.messageId);
      if (message && message.userId === userId) {
        message.content = data.content;
        message.edited = true;
        io.to(data.channelId).emit('message:edited', message);
      }
    }
  });

  socket.on('message:delete', (data: { messageId: string; channelId: string }) => {
    const userId = socket.data.userId;
    const history = messageHistory.get(data.channelId);

    if (history) {
      const index = history.findIndex((m) => m.id === data.messageId && m.userId === userId);
      if (index !== -1) {
        history.splice(index, 1);
        io.to(data.channelId).emit('message:deleted', {
          messageId: data.messageId,
          channelId: data.channelId,
        });
      }
    }
  });

  socket.on('message:react', (data: { messageId: string; channelId: string; emoji: string }) => {
    const userId = socket.data.userId;
    const history = messageHistory.get(data.channelId);

    if (history) {
      const message = history.find((m) => m.id === data.messageId);
      if (message) {
        if (!message.reactions) message.reactions = [];
        
        const existing = message.reactions.find((r) => r.emoji === data.emoji);
        if (existing) {
          if (existing.users.includes(userId)) {
            existing.users = existing.users.filter((u) => u !== userId);
            if (existing.users.length === 0) {
              message.reactions = message.reactions.filter((r) => r.emoji !== data.emoji);
            }
          } else {
            existing.users.push(userId);
          }
        } else {
          message.reactions.push({ emoji: data.emoji, users: [userId] });
        }

        io.to(data.channelId).emit('message:reacted', {
          messageId: data.messageId,
          reactions: message.reactions,
        });
      }
    }
  });

  // ========== TYPING INDICATORS ==========
  socket.on('typing:start', (channelId: string) => {
    const userId = socket.data.userId;
    const typing = typingUsers.get(channelId);

    if (typing) {
      typing.add(userId);
      socket.to(channelId).emit('typing:update', {
        channelId,
        users: Array.from(typing).map((uid) => {
          const user = connectedUsers.get(uid);
          return { userId: uid, username: user?.username };
        }),
      });
    }
  });

  socket.on('typing:stop', (channelId: string) => {
    const userId = socket.data.userId;
    const typing = typingUsers.get(channelId);

    if (typing) {
      typing.delete(userId);
      socket.to(channelId).emit('typing:update', {
        channelId,
        users: Array.from(typing).map((uid) => {
          const user = connectedUsers.get(uid);
          return { userId: uid, username: user?.username };
        }),
      });
    }
  });

  // ========== DIRECT MESSAGES ==========
  socket.on('dm:start', (targetUserId: string) => {
    const userId = socket.data.userId;
    const dmChannelId = [userId, targetUserId].sort().join('_dm_');

    if (!channels.has(dmChannelId)) {
      const channel: Channel = {
        id: dmChannelId,
        name: 'Direct Message',
        type: 'dm',
        members: [userId, targetUserId],
        createdBy: userId,
        createdAt: new Date(),
      };
      channels.set(dmChannelId, channel);
      messageHistory.set(dmChannelId, []);
      typingUsers.set(dmChannelId, new Set());
    }

    socket.join(dmChannelId);
    socket.emit('dm:opened', { channelId: dmChannelId, targetUserId });
  });

  // ========== NOTIFICATIONS ==========
  socket.on('notification:read', (notificationId: string) => {
    const userId = socket.data.userId;
    const notifications = userNotifications.get(userId);

    if (notifications) {
      const notif = notifications.find((n) => n.id === notificationId);
      if (notif) {
        notif.read = true;
      }
    }
  });

  socket.on('notification:readAll', () => {
    const userId = socket.data.userId;
    const notifications = userNotifications.get(userId);

    if (notifications) {
      notifications.forEach((n) => (n.read = true));
    }
  });

  // ========== GAME STATE (Aetherium) ==========
  socket.on('game:join', (gameId: string) => {
    socket.join(`game_${gameId}`);
    console.log(`[WS] User joined game: ${gameId}`);
  });

  socket.on('game:action', (data: { gameId: string; action: any }) => {
    io.to(`game_${data.gameId}`).emit('game:update', data.action);
  });

  socket.on('game:leave', (gameId: string) => {
    socket.leave(`game_${gameId}`);
  });

  // ========== COLLABORATION ==========
  socket.on('collab:join', (collabId: string) => {
    socket.join(`collab_${collabId}`);
  });

  socket.on('collab:update', (data: { collabId: string; update: any }) => {
    socket.to(`collab_${data.collabId}`).emit('collab:changed', data.update);
  });

  // ========== DISCONNECT ==========
  socket.on('disconnect', () => {
    const userId = socket.data.userId;

    if (userId) {
      const user = connectedUsers.get(userId);
      if (user) {
        user.status = 'offline';
        user.lastSeen = new Date();

        io.emit('presence:update', {
          userId,
          username: user.username,
          status: 'offline',
          lastSeen: user.lastSeen,
        });

        // Remove from typing indicators
        typingUsers.forEach((typing) => typing.delete(userId));

        connectedUsers.delete(userId);
      }
    }

    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

// ============== HTTP ENDPOINTS ==============
app.get('/health', (req, res) => {
  res.json({ status: 'ok', connections: connectedUsers.size });
});

app.get('/stats', (req, res) => {
  res.json({
    onlineUsers: connectedUsers.size,
    totalChannels: channels.size,
    publicChannels: Array.from(channels.values()).filter((c) => c.type === 'public').length,
  });
});

// ============== SERVER START ==============
const PORT = process.env.WS_PORT || 3002;

httpServer.listen(PORT, () => {
  console.log(`[WS] WebSocket server running on port ${PORT}`);
});

export { io, connectedUsers, channels, messageHistory };

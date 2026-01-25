import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { db, adminApp } from '../config/firebase';
import { FieldValue } from 'firebase-admin/firestore';

let io: SocketIOServer;

// ============== IN-MEMORY TRACKING ==============
// We still keep track of active socket connections for presence,
// but data is persisted to Firestore.
interface ConnectedUser {
  userId: string;
  socketId: string;
  status: 'online' | 'busy' | 'away';
  activity?: string;
  currentChannel?: string;
}

const connectedUsers = new Map<string, ConnectedUser>(); // socketId -> User

export function initWebSocket(httpServer: HttpServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // Authenticate and set presence
    socket.on('user:authenticate', async (userId: string) => {
      try {
        console.log(`[WS] Authenticating user: ${userId}`);
        
        // In a production app, pass the ID token and verify it here too.
        // For now, we trust the client has authenticated via REST API first.
        
        connectedUsers.set(socket.id, {
            userId,
            socketId: socket.id,
            status: 'online'
        });

        socket.data.userId = userId;

        // Update user status in DB
        await db.collection('users').doc(userId).set({
            status: 'online',
            lastSeen: new Date()
        }, { merge: true });

        // Broadcast presence
        io.emit('presence:update', {
            userId,
            status: 'online',
            timestamp: new Date().toISOString()
        });

        // Send online users list (from memory is fastest for ephemeral presence)
        const onlineUsers = Array.from(connectedUsers.values()).map(u => ({
            userId: u.userId,
            status: u.status,
            activity: u.activity
        }));
        socket.emit('presence:online_users', onlineUsers);

      } catch (error) {
        console.error('[WS] Auth error:', error);
      }
    });

    // Update Status
    socket.on('presence:update', async (data: { userId: string; status: string; activity?: string }) => {
        const user = connectedUsers.get(socket.id);
        if (user && user.userId === data.userId) {
            user.status = data.status as any;
            user.activity = data.activity;
            
            await db.collection('users').doc(data.userId).update({
                status: data.status,
                activity: data.activity || null
            });

            io.emit('presence:update', {
                userId: data.userId,
                status: data.status,
                activity: data.activity
            });
        }
    });

    // Chat Events
    socket.on('chat:join', (channelId: string) => {
        socket.join(channelId);
        const user = connectedUsers.get(socket.id);
        if (user) user.currentChannel = channelId;
    });

    socket.on('chat:leave', (channelId: string) => {
        socket.leave(channelId);
        const user = connectedUsers.get(socket.id);
        if (user && user.currentChannel === channelId) user.currentChannel = undefined;
    });

    socket.on('chat:typing', (data: { channelId: string; userId: string; isTyping: boolean }) => {
        socket.to(data.channelId).emit('chat:user_typing', data);
    });

    socket.on('chat:send', async (data: {
        channelId: string;
        userId: string;
        content: string;
        type: 'text' | 'image' | 'file';
        replyTo?: string;
      }) => {
        try {
            // Save to DB
            const messageRef = await db.collection('chatMessages').add({
                channelId: data.channelId,
                userId: data.userId,
                content: data.content,
                type: data.type,
                replyTo: data.replyTo || null,
                edited: false,
                createdAt: new Date(), // Server timestamp
                reactions: {}
            });
    
            const message = {
                id: messageRef.id,
                ...data,
                createdAt: new Date().toISOString()
            };
    
            // Broadcast
            io.to(data.channelId).emit('chat:message', message); // or 'message:new' to match frontend expectation
            io.to(data.channelId).emit('message:new', message); // Redundant emission to cover naming variations
    
            // Update channel metadata
            await db.collection('chatChannels').doc(data.channelId).update({
                lastMessage: {
                    content: data.content,
                    userId: data.userId,
                    timestamp: new Date()
                }
            });

        } catch (error) {
            console.error('[WS] Send message error:', error);
        }
      });

    // Notifications
    socket.on('notification:send', async (data: {
        userId: string;
        type: string;
        title: string;
        content: string;
        link?: string;
      }) => {
        const notificationRef = await db.collection('notifications').add({
            ...data,
            isRead: false,
            createdAt: new Date()
        });

        // Find specific user socket
        const targetSocketId = Array.from(connectedUsers.values())
            .find(u => u.userId === data.userId)?.socketId;

        if (targetSocketId) {
            io.to(targetSocketId).emit('notification:new', {
                id: notificationRef.id,
                ...data,
                createdAt: new Date().toISOString()
            });
        }
      });


    // Disconnect
    socket.on('disconnect', async () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        console.log(`[WS] User disconnected: ${user.userId}`);
        
        await db.collection('users').doc(user.userId).set({
            status: 'offline',
            lastSeen: new Date()
        }, { merge: true });

        io.emit('presence:update', {
            userId: user.userId,
            status: 'offline',
            timestamp: new Date().toISOString()
        });

        connectedUsers.delete(socket.id);
      } else {
        console.log(`[WS] Client disconnected: ${socket.id}`);
      }
    });
  });

  return io;
}

export { io };

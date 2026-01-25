// AuraNova Studios Backend Server
// Orchestrates API routes, WebSocket connections, and external service integrations
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import * as admin from 'firebase-admin';

// Config
import { db, adminApp } from './config/firebase';

// Routes
import artRoutes from './routes/art';
import userSettingsRoutes from './routes/userSettings';
import authRouter from './routes/auth';
import marketplaceRoutes from './routes/marketplace';
import pointsRoutes from './routes/points';
import chatRoutes from './routes/chat';
import notificationRoutes from './routes/notifications';
import paymentsRoutes from './routes/payments';

import { initWebSocket } from './websocket/server';

// Load environment variables
dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ============== MIDDLEWARE ==============

// CORS Configuration
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============== ROUTES ==============

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes from original index.ts
app.use('/api/art', artRoutes);
app.use('/api/settings', userSettingsRoutes);
app.use('/api/auth', authRouter);

// New Routes
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentsRoutes);

// Routes from firebase-integration.ts
app.post('/api/users', async (req, res) => {
    try {
      const { userId, email, name, profile } = req.body;
  
      const userRef = admin.firestore().collection('users').doc(userId);
  
      await userRef.set(
        {
          email,
          name,
          profile: profile || {},
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
  
      res.status(201).json({ success: true, userId });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });
  
  app.get('/api/users/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const doc = await admin.firestore().collection('users').doc(userId).get();
  
      if (!doc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      res.json(doc.data());
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });
  
  app.post('/api/messages', async (req, res) => {
    try {
      const { userId, conversationId, message, timestamp } = req.body;
  
      const messageRef = await admin
        .firestore()
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .add({
          userId,
          message,
          timestamp: timestamp || admin.firestore.FieldValue.serverTimestamp(),
          read: false,
        });
  
      res.status(201).json({
        success: true,
        messageId: messageRef.id,
      });
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).json({ error: 'Failed to save message' });
    }
  });

  app.post('/api/upload', async (req, res) => {
    try {
      // Integrate with multer and Firebase Storage
      const bucket = admin.storage().bucket();
  
      // Your file handling logic here
      res.json({ success: true });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  app.post('/api/analytics', async (req, res) => {
    try {
      const { userId, event, data } = req.body;
  
      await admin.firestore().collection('analytics').add({
        userId,
        event,
        data,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
  
      res.json({ success: true });
    } catch (error) {
      console.error('Error logging event:', error);
      res.status(500).json({ error: 'Failed to log event' });
    }
  });


// ============== WEBSOCKET ==============

// Initialize WebSocket server and attach to the main HTTP server
const io: SocketIOServer = initWebSocket(httpServer);

// ============== ERROR HANDLING ==============

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
  });
});

// ============== SERVER START ==============

// Only start server if run directly (not imported by Firebase Functions)
if (require.main === module) {
    httpServer.listen(PORT, () => {
        console.log(`🚀 AuraNova Backend Server running on port ${PORT}`);
        console.log(`📡 CORS enabled for ${FRONTEND_URL}`);
        console.log(`🔗 WebSocket initialized and ready for connections`);
    });
}

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

// ============== FIREBASE FUNCTIONS EXPORTS ==============

// Export the Express app as a Cloud Function
export const api = onRequest(app);

/**
 * Firestore Trigger: Auto-index popular content
 */
export const onMessageCreated = onDocumentCreated(
    'conversations/{conversationId}/messages/{messageId}',
    async (event) => {
      const snap = event.data;
      if (!snap) return;
      const messageData = snap.data();
      console.log('New message:', event.params.messageId);
  
      // Auto-index, increment counters, trigger notifications, etc.
    }
  );
  
  /**
   * Firestore Trigger: Cleanup old data
   */
  export const cleanupOldData = onSchedule('0 3 * * *', async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
    try {
      const snapshot = await admin
        .firestore()
        .collection('messages')
        .where('timestamp', '<', thirtyDaysAgo)
        .get();
  
      const batch = admin.firestore().batch();
  
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
  
      await batch.commit();
      console.log(`Deleted ${snapshot.docs.length} old messages`);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });
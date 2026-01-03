// AuraNova Studios Backend Server
// Orchestrates API routes, WebSocket connections, and external service integrations

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import artRoutes from './routes/art';
import userSettingsRoutes from './routes/userSettings';

// Conditionally import websocket to avoid auto-start
let wsIO: SocketIOServer | null = null;
let startWebSocketServer: (() => void) | null = null;

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

// API Routes
app.use('/api/art', artRoutes);
app.use('/api/settings', userSettingsRoutes);

// ============== WEBSOCKET ==============

// WebSocket io will be initialized when server starts
let io: SocketIOServer | null = null;

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

// Only start server if not being imported (for Firebase Functions compatibility)
if (require.main === module) {
  // Dynamically import websocket server only when running standalone
  const wsModule = require('./websocket/server');
  io = wsModule.io;
  wsModule.startWebSocketServer();
  
  httpServer.listen(PORT, () => {
    console.log(`🚀 AuraNova Backend Server running on port ${PORT}`);
    console.log(`📡 CORS enabled for ${FRONTEND_URL}`);
    console.log(`🔗 WebSocket ready for connections`);
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

// Export for Firebase Functions
export { app, httpServer, io };

// Re-export Firebase Cloud Functions (onMessageCreated disabled due to trigger type change)
export { api, cleanupOldData } from './firebase-integration';

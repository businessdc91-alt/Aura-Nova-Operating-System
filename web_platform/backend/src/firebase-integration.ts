// Firebase Cloud Functions integration for existing backend
// Add to your src/index.ts or create separate module

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';
import express from 'express';

admin.initializeApp();

const app = express();
const corsHandler = cors({ origin: true });

app.use(corsHandler);

/**
 * Health Check
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'aura-nova-backend',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Firestore User Management
 */
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

/**
 * Real-time Chat/Notifications with Firestore
 */
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

/**
 * File Upload Handler (Storage Integration)
 */
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

/**
 * Analytics Event Logging
 */
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

/**
 * Firestore Trigger: Auto-index popular content
 */
export const onMessageCreated = functions.firestore
  .document('conversations/{conversationId}/messages/{messageId}')
  .onCreate(async (snap, context) => {
    const messageData = snap.data();
    console.log('New message:', context.params.messageId);

    // Auto-index, increment counters, trigger notifications, etc.
  });

/**
 * Firestore Trigger: Cleanup old data
 */
export const cleanupOldData = functions.pubsub
  .schedule('0 3 * * *') // Daily at 3 AM
  .onRun(async (context) => {
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

/**
 * Export the Express app as a Cloud Function
 */
export const api = functions.https.onRequest(app);

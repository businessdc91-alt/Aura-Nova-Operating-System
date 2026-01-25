import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin only if not already initialized
if (!admin.apps.length) {
  try {
    // In production/cloud functions, google-application-credentials will handle auth
    // For local dev, ensure GOOGLE_APPLICATION_CREDENTIALS env var is set
    // or use serviceAccountKey.json if present (optional)
    admin.initializeApp();
    console.log('🔥 Firebase Admin Initialized');
  } catch (error) {
    console.error('❌ Firebase Admin Initialization Error:', error);
  }
}

export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();
export const adminApp = admin;

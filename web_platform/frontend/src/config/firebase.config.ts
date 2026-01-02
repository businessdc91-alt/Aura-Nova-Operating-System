// Firebase configuration
// This file should be imported in your frontend initialization

declare global {
  interface Window {
    __firebaseInitialized?: boolean;
  }
}

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase in your app
export const initializeFirebase = () => {
  if (typeof window !== 'undefined' && !window.__firebaseInitialized) {
    // Firebase initialization code here
    window.__firebaseInitialized = true;
  }
};

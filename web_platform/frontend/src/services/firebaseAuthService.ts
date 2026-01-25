/**
 * FIREBASE AUTHENTICATION SERVICE
 * Handles user sign-up, sign-in, and profile management
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// ================== TYPES ==================
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  avatar?: string;
  bio?: string;
  tier: 'free' | 'creator' | 'developer' | 'catalyst' | 'prime';
  createdAt: Date;
  updatedAt: Date;
  followers: string[];
  following: string[];
  stats: {
    posts: number;
    followers: number;
    following: number;
    creations: number;
  };
  aiCompanion?: {
    name: string;
    modelName: string;
    personality: string;
  };
}

// ================== AUTHENTICATION ==================

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string,
  username: string
): Promise<UserProfile> {
  try {
    // Create auth user
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      username,
      tier: 'free',
      createdAt: new Date(),
      updatedAt: new Date(),
      followers: [],
      following: [],
      stats: {
        posts: 0,
        followers: 0,
        following: 0,
        creations: 0,
      },
    };

    await setDoc(doc(db, 'users', user.uid), {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return userProfile;
  } catch (error: any) {
    console.error('[Auth] Sign up error:', error);
    throw new Error(error.message || 'Failed to sign up');
  }
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<UserProfile> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }

    const data = userDoc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as UserProfile;
  } catch (error: any) {
    console.error('[Auth] Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user profile exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      // Create new profile for first-time Google users
      const username = user.email!.split('@')[0] + '_' + Math.floor(Math.random() * 1000);
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || 'User',
        username,
        avatar: user.photoURL || undefined,
        tier: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
        followers: [],
        following: [],
        stats: {
          posts: 0,
          followers: 0,
          following: 0,
          creations: 0,
        },
      };

      await setDoc(doc(db, 'users', user.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return userProfile;
    }

    const data = userDoc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as UserProfile;
  } catch (error: any) {
    console.error('[Auth] Google sign in error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
}

/**
 * Sign out
 */
export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('[Auth] Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('[Auth] Password reset error:', error);
    throw new Error(error.message || 'Failed to send password reset email');
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return null;

    const data = userDoc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as UserProfile;
  } catch (error) {
    console.error('[Auth] Get profile error:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    console.error('[Auth] Update profile error:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get user profile by UID
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return null;

    const data = userDoc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as UserProfile;
  } catch (error) {
    console.error('[Auth] Get user profile error:', error);
    return null;
  }
}

/**
 * Get user profile by username
 */
export async function getUserByUsername(username: string): Promise<UserProfile | null> {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const data = snapshot.docs[0].data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as UserProfile;
  } catch (error) {
    console.error('[Auth] Get user by username error:', error);
    return null;
  }
}

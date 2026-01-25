import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  onSnapshot,
  setDoc,
  getDoc,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase'; // Assuming centralized firebase config

// ================== TYPES ==================
// ( mirrored from directMessageService for compatibility )

export interface DMConversation {
  id: string;
  participantIds: string[]; // List of User UIDs
  participantsData: { [uid: string]: { displayName: string, avatar?: string } }; // Cache basic user info
  lastMessage?: string;
  lastMessageAt?: Date;
  lastSenderId?: string;
  unreadCounts: { [uid: string]: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface DMMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  readBy: string[];
}

// ================== SERVICE ==================

/**
 * Get or Create a Conversation between the current user and target user
 */
export const getOrCreateConversation = async (targetUserId: string): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Must be logged in');

  const conversationId = getConversationId(currentUser.uid, targetUserId);
  const conversationRef = doc(db, 'conversations', conversationId);
  const conversationSnap = await getDoc(conversationRef);

  if (conversationSnap.exists()) {
    return conversationId;
  }

  // Create new conversation
  // We need to fetch target user details to cache them (optional but good for UI)
  let targetUserName = 'User';
  let targetUserAvatar = undefined;
  
  try {
     const targetUserDoc = await getDoc(doc(db, 'users', targetUserId));
     if(targetUserDoc.exists()) {
         const data = targetUserDoc.data();
         targetUserName = data.displayName || 'User';
         targetUserAvatar = data.avatar;
     }
  } catch (e) {
      console.warn('Could not fetch target user details', e);
  }

  const initialData: DMConversation = {
    id: conversationId,
    participantIds: [currentUser.uid, targetUserId],
    participantsData: {
        [currentUser.uid]: { 
            displayName: currentUser.displayName || 'Me', 
            avatar: currentUser.photoURL || undefined 
        },
        [targetUserId]: { 
            displayName: targetUserName, 
            avatar: targetUserAvatar 
        }
    },
    unreadCounts: {
        [currentUser.uid]: 0,
        [targetUserId]: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // setDoc with merge to avoid race conditions if both users create it efficiently
  await setDoc(conversationRef, {
      ...initialData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessageAt: serverTimestamp()
  }, { merge: true });

  return conversationId;
};

/**
 * Send a Message to a conversation
 */
export const sendMessage = async (conversationId: string, content: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Must be logged in');

  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  
  // 1. Add Message
  await addDoc(messagesRef, {
    senderId: currentUser.uid,
    content: content,
    createdAt: serverTimestamp(),
    readBy: [currentUser.uid]
  });

  // 2. Update Conversation Metadata (Last Message, Unread Counts)
  const conversationRef = doc(db, 'conversations', conversationId);
  
  // We need to atomically increment unread count for the OTHER participant(s)
  // For a 2-person DM, it's simple. 
  // We can't use 'increment' on a map key dynamically easily without knowing the other ID, 
  // but we can fetch and update or use a dot notation if we knew the ID.
  // For simplicity/speed in this demo, we will just update 'lastMessage' and 'updatedAt'.
  // Use Cloud Functions for perfect unread counters if needed later.

  await updateDoc(conversationRef, {
      lastMessage: content,
      lastSenderId: currentUser.uid,
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp()
  });
};

/**
 * Listen to Messages (Real-time)
 */
export const subscribeToMessages = (conversationId: string, callback: (messages: DMMessage[]) => void) => {
  const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
  );

  return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              conversationId,
              senderId: data.senderId,
              content: data.content,
              createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
              readBy: data.readBy || []
          } as DMMessage;
      });
      callback(messages);
  });
};

/**
 * Listen to Conversations List (Real-time)
 */
export const subscribeToConversations = (userId: string, callback: (conversations: DMConversation[]) => void) => {
    // Current user must be in participants
    const q = query(
        collection(db, 'conversations'),
        where('participantIds', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
        const convos = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                // Handle Timestamps
                createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
                updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
                lastMessageAt: (data.lastMessageAt as Timestamp)?.toDate() || new Date(),
            } as DMConversation;
        });
        callback(convos);
    });
};

// Start a conversation helper
export const startConversation = async (targetUserId: string) => {
    return getOrCreateConversation(targetUserId);
}


// Helper: Deterministic Conversation ID
// Ensures userA and userB always end up in the same doc (dm-lowerId-higherId)
const getConversationId = (uid1: string, uid2: string): string => {
    return uid1 < uid2 ? `dm-${uid1}-${uid2}` : `dm-${uid2}-${uid1}`;
};

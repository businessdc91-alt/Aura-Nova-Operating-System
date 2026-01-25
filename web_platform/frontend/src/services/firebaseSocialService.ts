/**
 * FIREBASE SOCIAL NETWORK SERVICE
 * Handles posts, comments, reactions, following, and real-time updates
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebase';

// ================== TYPES ==================

export interface SocialPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorTier: 'free' | 'creator' | 'developer' | 'catalyst' | 'prime';
  content: string;
  images?: string[];
  mediaUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
  likes: string[]; // Array of user IDs who liked
  comments: number;
  shares: number;
  tags?: string[];
  visibility: 'public' | 'followers' | 'private';
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
  likes: string[];
  parentCommentId?: string; // For nested replies
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'share';
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  postId?: string;
  content?: string;
  createdAt: Date;
  read: boolean;
}

// ================== POSTS ==================

/**
 * Create a new post
 */
export async function createPost(
  content: string,
  images?: File[],
  tags?: string[],
  visibility: 'public' | 'followers' | 'private' = 'public'
): Promise<string> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to post');

    // Get user profile for author info
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) throw new Error('User profile not found');
    const userData = userDoc.data();

    // Upload images if provided
    let imageUrls: string[] = [];
    if (images && images.length > 0) {
      imageUrls = await uploadPostImages(user.uid, images);
    }

    // Create post document
    const postRef = doc(collection(db, 'posts'));
    const post: Omit<SocialPost, 'id' | 'createdAt' | 'updatedAt'> = {
      authorId: user.uid,
      authorName: userData.displayName || 'User',
      authorAvatar: userData.avatar,
      authorTier: userData.tier || 'free',
      content,
      images: imageUrls,
      likes: [],
      comments: 0,
      shares: 0,
      tags,
      visibility,
    };

    await setDoc(postRef, {
      ...post,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Update user stats
    await updateDoc(doc(db, 'users', user.uid), {
      'stats.posts': increment(1),
    });

    return postRef.id;
  } catch (error: any) {
    console.error('[Social] Create post error:', error);
    throw new Error(error.message || 'Failed to create post');
  }
}

/**
 * Upload post images to Firebase Storage
 */
async function uploadPostImages(userId: string, images: File[]): Promise<string[]> {
  const uploadPromises = images.map(async (image, index) => {
    const timestamp = Date.now();
    const filename = `${userId}_${timestamp}_${index}.${image.name.split('.').pop()}`;
    const storageRef = ref(storage, `posts/${userId}/${filename}`);

    await uploadBytes(storageRef, image);
    return getDownloadURL(storageRef);
  });

  return Promise.all(uploadPromises);
}

/**
 * Get user's feed (posts from followed users + own posts)
 */
export async function getUserFeed(
  userId: string,
  pageSize: number = 20,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ posts: SocialPost[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    // Get user's following list
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) throw new Error('User not found');
    const following = userDoc.data().following || [];

    // Include user's own posts
    const feedUserIds = [...following, userId];

    // Query posts from followed users
    let q = query(
      collection(db, 'posts'),
      where('authorId', 'in', feedUserIds.length > 0 ? feedUserIds.slice(0, 10) : [userId]), // Firestore 'in' limit is 10
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const posts: SocialPost[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as SocialPost));

    return {
      posts,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error: any) {
    console.error('[Social] Get feed error:', error);
    throw new Error(error.message || 'Failed to load feed');
  }
}

/**
 * Get public posts (discovery feed)
 */
export async function getPublicPosts(
  pageSize: number = 20,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ posts: SocialPost[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  try {
    let q = query(
      collection(db, 'posts'),
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const posts: SocialPost[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as SocialPost));

    return {
      posts,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error: any) {
    console.error('[Social] Get public posts error:', error);
    throw new Error(error.message || 'Failed to load posts');
  }
}

/**
 * Subscribe to real-time feed updates
 */
export function subscribeToFeed(
  userId: string,
  callback: (posts: SocialPost[]) => void
): () => void {
  const q = query(
    collection(db, 'posts'),
    where('visibility', '==', 'public'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const posts: SocialPost[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as SocialPost));
    callback(posts);
  });
}

/**
 * Like a post
 */
export async function likePost(postId: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to like');

    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    if (!postDoc.exists()) throw new Error('Post not found');

    const postData = postDoc.data();
    const isLiked = postData.likes?.includes(user.uid);

    if (isLiked) {
      // Unlike
      await updateDoc(postRef, {
        likes: arrayRemove(user.uid),
      });
    } else {
      // Like
      await updateDoc(postRef, {
        likes: arrayUnion(user.uid),
      });

      // Create notification for post author
      if (postData.authorId !== user.uid) {
        await createNotification({
          userId: postData.authorId,
          type: 'like',
          actorId: user.uid,
          postId,
        });
      }
    }
  } catch (error: any) {
    console.error('[Social] Like post error:', error);
    throw new Error(error.message || 'Failed to like post');
  }
}

/**
 * Delete a post
 */
export async function deletePost(postId: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in');

    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    if (!postDoc.exists()) throw new Error('Post not found');

    const postData = postDoc.data();
    if (postData.authorId !== user.uid) {
      throw new Error('Cannot delete another user\'s post');
    }

    // Delete post images from storage
    if (postData.images && postData.images.length > 0) {
      await Promise.all(
        postData.images.map((url: string) => {
          const imageRef = ref(storage, url);
          return deleteObject(imageRef).catch(() => {}); // Ignore errors
        })
      );
    }

    // Delete all comments
    const commentsQuery = query(collection(db, 'comments'), where('postId', '==', postId));
    const commentsSnapshot = await getDocs(commentsQuery);
    await Promise.all(commentsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

    // Delete post
    await deleteDoc(postRef);

    // Update user stats
    await updateDoc(doc(db, 'users', user.uid), {
      'stats.posts': increment(-1),
    });
  } catch (error: any) {
    console.error('[Social] Delete post error:', error);
    throw new Error(error.message || 'Failed to delete post');
  }
}

// ================== COMMENTS ==================

/**
 * Add a comment to a post
 */
export async function addComment(
  postId: string,
  content: string,
  parentCommentId?: string
): Promise<string> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to comment');

    // Get user profile
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) throw new Error('User profile not found');
    const userData = userDoc.data();

    // Create comment
    const commentRef = doc(collection(db, 'comments'));
    const comment: Omit<Comment, 'id' | 'createdAt'> = {
      postId,
      authorId: user.uid,
      authorName: userData.displayName || 'User',
      authorAvatar: userData.avatar,
      content,
      likes: [],
      parentCommentId,
    };

    await setDoc(commentRef, {
      ...comment,
      createdAt: serverTimestamp(),
    });

    // Update post comment count
    await updateDoc(doc(db, 'posts', postId), {
      comments: increment(1),
    });

    // Create notification for post author
    const postDoc = await getDoc(doc(db, 'posts', postId));
    if (postDoc.exists() && postDoc.data().authorId !== user.uid) {
      await createNotification({
        userId: postDoc.data().authorId,
        type: 'comment',
        actorId: user.uid,
        postId,
        content: content.substring(0, 100),
      });
    }

    return commentRef.id;
  } catch (error: any) {
    console.error('[Social] Add comment error:', error);
    throw new Error(error.message || 'Failed to add comment');
  }
}

/**
 * Get comments for a post
 */
export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    } as Comment));
  } catch (error: any) {
    console.error('[Social] Get comments error:', error);
    throw new Error(error.message || 'Failed to load comments');
  }
}

/**
 * Like a comment
 */
export async function likeComment(commentId: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to like');

    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);
    if (!commentDoc.exists()) throw new Error('Comment not found');

    const commentData = commentDoc.data();
    const isLiked = commentData.likes?.includes(user.uid);

    if (isLiked) {
      await updateDoc(commentRef, {
        likes: arrayRemove(user.uid),
      });
    } else {
      await updateDoc(commentRef, {
        likes: arrayUnion(user.uid),
      });
    }
  } catch (error: any) {
    console.error('[Social] Like comment error:', error);
    throw new Error(error.message || 'Failed to like comment');
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in');

    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);
    if (!commentDoc.exists()) throw new Error('Comment not found');

    const commentData = commentDoc.data();
    if (commentData.authorId !== user.uid) {
      throw new Error('Cannot delete another user\'s comment');
    }

    // Update post comment count
    await updateDoc(doc(db, 'posts', commentData.postId), {
      comments: increment(-1),
    });

    await deleteDoc(commentRef);
  } catch (error: any) {
    console.error('[Social] Delete comment error:', error);
    throw new Error(error.message || 'Failed to delete comment');
  }
}

// ================== FOLLOWING ==================

/**
 * Follow a user
 */
export async function followUser(targetUserId: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to follow');
    if (user.uid === targetUserId) throw new Error('Cannot follow yourself');

    // Update current user's following list
    await updateDoc(doc(db, 'users', user.uid), {
      following: arrayUnion(targetUserId),
      'stats.following': increment(1),
    });

    // Update target user's followers list
    await updateDoc(doc(db, 'users', targetUserId), {
      followers: arrayUnion(user.uid),
      'stats.followers': increment(1),
    });

    // Create notification
    await createNotification({
      userId: targetUserId,
      type: 'follow',
      actorId: user.uid,
    });
  } catch (error: any) {
    console.error('[Social] Follow user error:', error);
    throw new Error(error.message || 'Failed to follow user');
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(targetUserId: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to unfollow');

    // Update current user's following list
    await updateDoc(doc(db, 'users', user.uid), {
      following: arrayRemove(targetUserId),
      'stats.following': increment(-1),
    });

    // Update target user's followers list
    await updateDoc(doc(db, 'users', targetUserId), {
      followers: arrayRemove(user.uid),
      'stats.followers': increment(-1),
    });
  } catch (error: any) {
    console.error('[Social] Unfollow user error:', error);
    throw new Error(error.message || 'Failed to unfollow user');
  }
}

// ================== NOTIFICATIONS ==================

/**
 * Create a notification
 */
async function createNotification(data: {
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'share';
  actorId: string;
  postId?: string;
  content?: string;
}): Promise<void> {
  try {
    // Get actor info
    const actorDoc = await getDoc(doc(db, 'users', data.actorId));
    if (!actorDoc.exists()) return;
    const actorData = actorDoc.data();

    const notificationRef = doc(collection(db, 'notifications'));
    await setDoc(notificationRef, {
      userId: data.userId,
      type: data.type,
      actorId: data.actorId,
      actorName: actorData.displayName || 'User',
      actorAvatar: actorData.avatar,
      postId: data.postId,
      content: data.content,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('[Social] Create notification error:', error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Get user's notifications
 */
export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    } as Notification));
  } catch (error: any) {
    console.error('[Social] Get notifications error:', error);
    throw new Error(error.message || 'Failed to load notifications');
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
    });
  } catch (error) {
    console.error('[Social] Mark notification read error:', error);
  }
}

/**
 * Subscribe to real-time notifications
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
): () => void {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications: Notification[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    } as Notification));
    callback(notifications);
  });
}

/**
 * Dynamic route - not pre-rendered
 */
export const dynamic = 'force-dynamic';

'use client';

import { useEffect, useState} from 'react';
import { auth, db } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';

interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  likes: string[];
  comments: Comment[];
  createdAt: any;
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: any;
}

export default function SocialNetworkTestPage() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [status, setStatus] = useState<string>('Ready to test social features');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setStatus(`Signed in as: ${currentUser.email}`);
        loadPosts();
      } else {
        setStatus('Not signed in - signing in automatically...');
        autoSignIn();
      }
    });

    return () => unsubscribe();
  }, []);

  const autoSignIn = async () => {
    try {
      // Try to sign in with test account
      await signInWithEmailAndPassword(auth, 'test@auranova.test', 'TestPassword123!');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        // Create account if it doesn't exist
        await createUserWithEmailAndPassword(auth, 'test@auranova.test', 'TestPassword123!');
      }
    }
  };

  const loadPosts = async () => {
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const loadedPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(loadedPosts);
    } catch (err: any) {
      console.error('Error loading posts:', err);
    }
  };

  const createPost = async () => {
    if (!user || !newPostContent.trim()) return;

    try {
      setError(null);
      setStatus('Creating post...');

      const postData = {
        content: newPostContent,
        authorId: user.uid,
        authorName: user.email?.split('@')[0] || 'Anonymous',
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'posts'), postData);
      setResults((prev) => [
        ...prev,
        { test: 'Create Post', status: 'SUCCESS', id: docRef.id },
      ]);
      setStatus('✅ Post created!');
      setNewPostContent('');
      await loadPosts();
    } catch (err: any) {
      setError(err.message);
      setResults((prev) => [
        ...prev,
        { test: 'Create Post', status: 'FAILED', error: err.message },
      ]);
      console.error('Create post error:', err);
    }
  };

  const likePost = async (postId: string) => {
    if (!user) return;

    try {
      setError(null);
      const postRef = doc(db, 'posts', postId);
      const post = posts.find((p) => p.id === postId);

      if (post?.likes.includes(user.uid)) {
        // Unlike
        await updateDoc(postRef, {
          likes: arrayRemove(user.uid),
        });
        setResults((prev) => [...prev, { test: 'Unlike Post', status: 'SUCCESS', id: postId }]);
      } else {
        // Like
        await updateDoc(postRef, {
          likes: arrayUnion(user.uid),
        });
        setResults((prev) => [...prev, { test: 'Like Post', status: 'SUCCESS', id: postId }]);
      }

      await loadPosts();
    } catch (err: any) {
      setError(err.message);
      setResults((prev) => [
        ...prev,
        { test: 'Like/Unlike Post', status: 'FAILED', error: err.message },
      ]);
      console.error('Like post error:', err);
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      setError(null);
      const postRef = doc(db, 'posts', postId);

      const newComment = {
        id: Date.now().toString(),
        content,
        authorId: user.uid,
        authorName: user.email?.split('@')[0] || 'Anonymous',
        createdAt: new Date().toISOString(),
      };

      await updateDoc(postRef, {
        comments: arrayUnion(newComment),
      });

      setResults((prev) => [
        ...prev,
        { test: 'Add Comment', status: 'SUCCESS', postId, commentId: newComment.id },
      ]);
      await loadPosts();
    } catch (err: any) {
      setError(err.message);
      setResults((prev) => [
        ...prev,
        { test: 'Add Comment', status: 'FAILED', error: err.message },
      ]);
      console.error('Add comment error:', err);
    }
  };

  const runAllTests = async () => {
    setResults([]);
    setError(null);
    setStatus('Running all social network tests...');

    // Test 1: Create a post
    setNewPostContent('This is a test post from the social network test suite!');
    await new Promise((resolve) => setTimeout(resolve, 500));
    await createPost();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 2: Like the first post
    if (posts.length > 0) {
      await likePost(posts[0].id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Test 3: Add a comment
    if (posts.length > 0) {
      await addComment(posts[0].id, 'This is a test comment!');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setStatus('✅ All social network tests completed!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Social Network Test</h1>

        <div className="bg-slate-800 rounded-lg p-6 border border-cyan-500/30 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Status</h2>
          <p className="text-xl text-cyan-400 mb-4">{status}</p>

          {user && (
            <div className="bg-green-500/20 rounded p-4 border border-green-500/50">
              <p className="text-green-400 font-bold">Signed in as: {user.email}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 rounded-lg p-6 border border-red-500/50 mb-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
            <p className="text-red-300 font-mono text-sm">{error}</p>
          </div>
        )}

        <div className="bg-slate-800 rounded-lg p-6 border border-purple-500/30 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Actions</h2>
          <button
            onClick={runAllTests}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded font-bold hover:opacity-80 mb-4"
          >
            Run All Tests
          </button>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 mb-2">Create a New Post</label>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 mb-2"
                rows={3}
                placeholder="What's on your mind?"
              />
              <button
                onClick={createPost}
                disabled={!user || !newPostContent.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                Create Post
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-purple-500/30 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Posts ({posts.length})</h2>
          {posts.length === 0 ? (
            <p className="text-slate-400">No posts yet. Create one to get started!</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-slate-700 rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-bold">{post.authorName}</p>
                      <p className="text-slate-400 text-sm">
                        {post.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
                      </p>
                    </div>
                  </div>
                  <p className="text-white mb-3">{post.content}</p>

                  <div className="flex items-center gap-4 mb-3">
                    <button
                      onClick={() => likePost(post.id)}
                      className={`px-4 py-1 rounded font-bold ${
                        post.likes.includes(user?.uid || '')
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-600 text-slate-300'
                      }`}
                    >
                      ❤️ {post.likes.length}
                    </button>
                    <span className="text-slate-400">💬 {post.comments?.length || 0}</span>
                  </div>

                  {post.comments && post.comments.length > 0 && (
                    <div className="border-t border-slate-600 pt-3 space-y-2">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="bg-slate-800 rounded p-2">
                          <p className="text-cyan-400 font-bold text-sm">{comment.authorName}</p>
                          <p className="text-white text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      className="w-full bg-slate-600 text-white px-3 py-2 rounded text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addComment(post.id, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-purple-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">Test Results</h2>
          {results.length === 0 ? (
            <p className="text-slate-400">No tests run yet. Click "Run All Tests" to start.</p>
          ) : (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="bg-slate-700 rounded p-4 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white">{result.test} Test</span>
                    {result.id && (
                      <span className="text-slate-400 ml-2 text-xs">ID: {result.id}</span>
                    )}
                    {result.error && (
                      <div className="text-red-400 text-sm mt-1">{result.error}</div>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded font-bold ${
                      result.status === 'SUCCESS'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {result.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

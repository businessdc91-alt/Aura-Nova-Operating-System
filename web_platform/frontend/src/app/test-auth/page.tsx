/**
 * Dynamic route - not pre-rendered
 */
export const dynamic = 'force-dynamic';

'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';

export default function AuthTestPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('test@auranova.test');
  const [password, setPassword] = useState('TestPassword123!');
  const [status, setStatus] = useState<string>('Ready to test authentication');
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setStatus(`Signed in as: ${currentUser.email}`);
      } else {
        setStatus('Not signed in');
      }
    });

    return () => unsubscribe();
  }, []);

  const testSignUp = async () => {
    try {
      setError(null);
      setStatus('Creating test account...');

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setResults((prev) => [
        ...prev,
        { test: 'Sign Up', status: 'SUCCESS', email: userCredential.user.email },
      ]);
      setStatus('✅ Account created successfully!');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Account already exists (this is expected if you ran the test before)');
        setResults((prev) => [
          ...prev,
          { test: 'Sign Up', status: 'SKIPPED', reason: 'Account exists' },
        ]);
      } else {
        setError(err.message);
        setResults((prev) => [...prev, { test: 'Sign Up', status: 'FAILED', error: err.message }]);
      }
      console.error('Sign up error:', err);
    }
  };

  const testSignIn = async () => {
    try {
      setError(null);
      setStatus('Signing in...');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setResults((prev) => [
        ...prev,
        { test: 'Sign In', status: 'SUCCESS', email: userCredential.user.email },
      ]);
      setStatus('✅ Signed in successfully!');
    } catch (err: any) {
      setError(err.message);
      setResults((prev) => [...prev, { test: 'Sign In', status: 'FAILED', error: err.message }]);
      console.error('Sign in error:', err);
    }
  };

  const testSignOut = async () => {
    try {
      setError(null);
      setStatus('Signing out...');

      await signOut(auth);
      setResults((prev) => [...prev, { test: 'Sign Out', status: 'SUCCESS' }]);
      setStatus('✅ Signed out successfully!');
    } catch (err: any) {
      setError(err.message);
      setResults((prev) => [...prev, { test: 'Sign Out', status: 'FAILED', error: err.message }]);
      console.error('Sign out error:', err);
    }
  };

  const runAllTests = async () => {
    setResults([]);
    setError(null);

    // Test 1: Sign up
    await testSignUp();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 2: Sign out
    if (user) {
      await testSignOut();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Test 3: Sign in
    await testSignIn();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 4: Sign out again
    await testSignOut();

    setStatus('✅ All authentication tests completed!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Firebase Authentication Test</h1>

        <div className="bg-slate-800 rounded-lg p-6 border border-cyan-500/30 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Current Status</h2>
          <p className="text-xl text-cyan-400 mb-4">{status}</p>

          {user && (
            <div className="bg-green-500/20 rounded p-4 border border-green-500/50">
              <p className="text-green-400 font-bold">Authenticated User:</p>
              <p className="text-white text-sm mt-2">Email: {user.email}</p>
              <p className="text-white text-sm">UID: {user.uid}</p>
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
          <h2 className="text-2xl font-bold text-white mb-4">Test Credentials</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6 border border-purple-500/30 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={runAllTests}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded font-bold hover:opacity-80"
            >
              Run All Tests
            </button>
            <button
              onClick={testSignUp}
              className="bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700"
            >
              Test Sign Up
            </button>
            <button
              onClick={testSignIn}
              className="bg-green-600 text-white px-6 py-3 rounded font-bold hover:bg-green-700"
            >
              Test Sign In
            </button>
            <button
              onClick={testSignOut}
              className="bg-red-600 text-white px-6 py-3 rounded font-bold hover:bg-red-700"
              disabled={!user}
            >
              Test Sign Out
            </button>
          </div>
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
                    {result.email && (
                      <span className="text-slate-400 ml-2 text-sm">({result.email})</span>
                    )}
                    {result.reason && (
                      <span className="text-yellow-400 ml-2 text-sm">- {result.reason}</span>
                    )}
                    {result.error && (
                      <div className="text-red-400 text-sm mt-1">{result.error}</div>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded font-bold ${
                      result.status === 'SUCCESS'
                        ? 'bg-green-500/20 text-green-400'
                        : result.status === 'SKIPPED'
                        ? 'bg-yellow-500/20 text-yellow-400'
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

        <div className="mt-6 bg-slate-800 rounded-lg p-6 border border-yellow-500/30">
          <h2 className="text-xl font-bold text-white mb-3">Configuration</h2>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Auth Domain:</span>
              <span className="text-white">{process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Project ID:</span>
              <span className="text-white">{process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

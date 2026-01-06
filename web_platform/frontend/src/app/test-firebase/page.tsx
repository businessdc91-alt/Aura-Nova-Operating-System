/**
 * Dynamic route - not pre-rendered
 */
export const dynamic = 'force-dynamic';

'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function FirebaseTestPage() {
  const [status, setStatus] = useState<string>('Testing...');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testFirestore();
  }, []);

  const testFirestore = async () => {
    try {
      setStatus('Step 1: Testing Firestore write...');

      // Test 1: Write a document
      const testData = {
        message: 'Firebase connection test',
        timestamp: new Date().toISOString(),
        platform: 'AuraNova OS',
      };

      const docRef = await addDoc(collection(db, 'connection_tests'), testData);
      setResults(prev => [...prev, { test: 'Write', status: 'SUCCESS', id: docRef.id }]);

      setStatus('Step 2: Testing Firestore read...');

      // Test 2: Read documents
      const querySnapshot = await getDocs(collection(db, 'connection_tests'));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResults(prev => [...prev, { test: 'Read', status: 'SUCCESS', count: docs.length }]);

      setStatus('Step 3: Cleaning up test data...');

      // Test 3: Delete test document
      await deleteDoc(doc(db, 'connection_tests', docRef.id));
      setResults(prev => [...prev, { test: 'Delete', status: 'SUCCESS' }]);

      setStatus('✅ All Firebase tests passed!');
    } catch (err: any) {
      setError(err.message);
      setStatus('❌ Firebase test failed');
      console.error('Firebase test error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Firebase Connection Test</h1>

        <div className="bg-slate-800 rounded-lg p-6 border border-cyan-500/30 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Status</h2>
          <p className="text-xl text-cyan-400">{status}</p>
        </div>

        {error && (
          <div className="bg-red-900/30 rounded-lg p-6 border border-red-500/50 mb-6">
            <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
            <p className="text-red-300 font-mono text-sm">{error}</p>
          </div>
        )}

        <div className="bg-slate-800 rounded-lg p-6 border border-purple-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">Test Results</h2>
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className="bg-slate-700 rounded p-4 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-white">{result.test} Test</span>
                  {result.count && (
                    <span className="text-slate-400 ml-2">({result.count} documents)</span>
                  )}
                  {result.id && (
                    <span className="text-slate-400 ml-2 text-xs">ID: {result.id}</span>
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
        </div>

        <div className="mt-6 bg-slate-800 rounded-lg p-6 border border-yellow-500/30">
          <h2 className="text-xl font-bold text-white mb-3">Configuration</h2>
          <div className="space-y-2 text-sm font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Project ID:</span>
              <span className="text-white">{process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Auth Domain:</span>
              <span className="text-white">{process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Storage Bucket:</span>
              <span className="text-white">{process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

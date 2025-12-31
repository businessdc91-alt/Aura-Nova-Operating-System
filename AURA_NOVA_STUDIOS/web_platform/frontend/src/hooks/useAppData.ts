'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getAppData,
  saveAppData,
  getLocalAppData,
  saveLocalAppData,
} from '@/services/userSettingsService';

/**
 * useAppData – hook for persisting arbitrary app-specific state per user.
 *
 * Usage:
 *   const { data, setData, loading } = useAppData<MyState>('my-app-id', { count: 0 });
 *
 * Changes via setData are debounce-saved to backend (with localStorage fallback).
 */
export function useAppData<T extends Record<string, unknown>>(
  appId: string,
  defaultData: T,
  userId = 'guest',
  debounceMs = 800
) {
  const [data, setDataInternal] = useState<T>(defaultData);
  const [loading, setLoading] = useState(true);

  // Load on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const remote = await getAppData<T>(userId, appId);
        if (!cancelled && remote?.data && Object.keys(remote.data).length) {
          setDataInternal(remote.data);
          saveLocalAppData(appId, remote.data);
        } else {
          const local = getLocalAppData<T>(appId);
          if (!cancelled && local) {
            setDataInternal(local);
          }
        }
      } catch {
        const local = getLocalAppData<T>(appId);
        if (!cancelled && local) {
          setDataInternal(local);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [appId, userId]);

  // Debounced save
  useEffect(() => {
    if (loading) return; // don't save while initially loading
    const timeout = setTimeout(() => {
      saveLocalAppData(appId, data);
      saveAppData(userId, appId, data).catch((err) =>
        console.warn('[useAppData] Backend save failed:', err)
      );
    }, debounceMs);
    return () => clearTimeout(timeout);
  }, [data, appId, userId, debounceMs, loading]);

  const setData = useCallback((update: T | ((prev: T) => T)) => {
    setDataInternal(update);
  }, []);

  return { data, setData, loading };
}

export default useAppData;

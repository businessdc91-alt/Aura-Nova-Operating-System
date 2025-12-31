'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  getUserSettings,
  patchUserSettings,
  getLocalSettings,
  saveLocalSettings,
  WallpaperOption,
  UserSettings,
} from '@/services/userSettingsService';

// ==========================================================
// CONTEXT TYPES
// ==========================================================

interface SettingsContextValue {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateWallpaper: (wallpaper: WallpaperOption) => Promise<void>;
  updateTheme: (theme: 'dark' | 'light') => Promise<void>;
  updateBlurEffects: (enabled: boolean) => Promise<void>;
  updateAnimations: (enabled: boolean) => Promise<void>;
  refresh: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

// ==========================================================
// HOOK
// ==========================================================

export function useUserSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useUserSettings must be used within UserSettingsProvider');
  }
  return ctx;
}

// ==========================================================
// PROVIDER
// ==========================================================

interface ProviderProps {
  userId: string;
  children: ReactNode;
}

export const UserSettingsProvider: React.FC<ProviderProps> = ({
  userId,
  children,
}) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings on mount
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const remote = await getUserSettings(userId);
      setSettings(remote);
      saveLocalSettings(remote); // cache locally
    } catch (err) {
      console.warn('[useUserSettings] Remote fetch failed, using local:', err);
      const local = getLocalSettings();
      if (local) {
        setSettings(local);
      } else {
        setError('Failed to load settings');
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Partial update helper
  const patch = useCallback(
    async (updates: Partial<Omit<UserSettings, 'userId' | 'updatedAt'>>) => {
      try {
        const updated = await patchUserSettings(userId, updates);
        setSettings(updated);
        saveLocalSettings(updated);
      } catch (err) {
        console.error('[useUserSettings] Patch failed:', err);
        // Optimistic local update
        if (settings) {
          const optimistic: UserSettings = {
            ...settings,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          setSettings(optimistic);
          saveLocalSettings(optimistic);
        }
      }
    },
    [userId, settings]
  );

  const updateWallpaper = useCallback(
    (wallpaper: WallpaperOption) => patch({ wallpaper }),
    [patch]
  );

  const updateTheme = useCallback(
    (theme: 'dark' | 'light') => patch({ theme }),
    [patch]
  );

  const updateBlurEffects = useCallback(
    (blurEffects: boolean) => patch({ blurEffects }),
    [patch]
  );

  const updateAnimations = useCallback(
    (animations: boolean) => patch({ animations }),
    [patch]
  );

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        updateWallpaper,
        updateTheme,
        updateBlurEffects,
        updateAnimations,
        refresh: loadSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export default useUserSettings;

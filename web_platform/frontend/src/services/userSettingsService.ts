// User Settings Service
// Client-side service for persisting and loading user settings

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ==========================================================
// TYPES
// ==========================================================

export interface WallpaperOption {
  name: string;
  background: string;
  className?: string;
}

export interface UserSettings {
  userId: string;
  wallpaper: WallpaperOption;
  theme: 'dark' | 'light';
  blurEffects: boolean;
  animations: boolean;
  updatedAt: string;
}

export interface UserAppData<T = Record<string, unknown>> {
  userId: string;
  appId: string;
  data: T;
  updatedAt: string;
}

// ==========================================================
// SETTINGS API
// ==========================================================

/**
 * Fetch user settings from backend
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  const res = await fetch(`${API_BASE}/api/user/settings/${userId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch settings: ${res.status}`);
  }
  return res.json();
}

/**
 * Save (full replace) user settings
 */
export async function saveUserSettings(
  userId: string,
  settings: Partial<Omit<UserSettings, 'userId' | 'updatedAt'>>
): Promise<UserSettings> {
  const res = await fetch(`${API_BASE}/api/user/settings/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    throw new Error(`Failed to save settings: ${res.status}`);
  }
  return res.json();
}

/**
 * Partial update user settings
 */
export async function patchUserSettings(
  userId: string,
  patch: Partial<Omit<UserSettings, 'userId' | 'updatedAt'>>
): Promise<UserSettings> {
  const res = await fetch(`${API_BASE}/api/user/settings/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) {
    throw new Error(`Failed to patch settings: ${res.status}`);
  }
  return res.json();
}

// ==========================================================
// APP DATA API
// ==========================================================

/**
 * Get app-specific data for a user
 */
export async function getAppData<T = Record<string, unknown>>(
  userId: string,
  appId: string
): Promise<UserAppData<T>> {
  const res = await fetch(`${API_BASE}/api/user/app-data/${userId}/${appId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch app data: ${res.status}`);
  }
  return res.json();
}

/**
 * Save app-specific data for a user
 */
export async function saveAppData<T = Record<string, unknown>>(
  userId: string,
  appId: string,
  data: T
): Promise<UserAppData<T>> {
  const res = await fetch(`${API_BASE}/api/user/app-data/${userId}/${appId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    throw new Error(`Failed to save app data: ${res.status}`);
  }
  return res.json();
}

/**
 * Delete app-specific data for a user
 */
export async function deleteAppData(
  userId: string,
  appId: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/api/user/app-data/${userId}/${appId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete app data: ${res.status}`);
  }
  return res.json();
}

/**
 * Get all app data for a user
 */
export async function getAllAppData(
  userId: string
): Promise<{ userId: string; apps: UserAppData[] }> {
  const res = await fetch(`${API_BASE}/api/user/app-data/${userId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch all app data: ${res.status}`);
  }
  return res.json();
}

// ==========================================================
// LOCAL STORAGE FALLBACK (for offline/guest mode)
// ==========================================================

const LOCAL_SETTINGS_KEY = 'auranova_user_settings';
const LOCAL_APP_DATA_KEY = 'auranova_app_data';

export function getLocalSettings(): UserSettings | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(LOCAL_SETTINGS_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveLocalSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
}

export function getLocalAppData<T = Record<string, unknown>>(
  appId: string
): T | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(`${LOCAL_APP_DATA_KEY}_${appId}`);
  return raw ? JSON.parse(raw) : null;
}

export function saveLocalAppData<T = Record<string, unknown>>(
  appId: string,
  data: T
): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${LOCAL_APP_DATA_KEY}_${appId}`, JSON.stringify(data));
}

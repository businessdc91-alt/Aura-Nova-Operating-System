// User Settings & Data Persistence API
// Handles per-user settings storage (wallpaper, theme, app state)

import express from 'express';

const router = express.Router();

// ==============================================================
// TYPES
// ==============================================================

interface UserSettings {
  userId: string;
  wallpaper: {
    name: string;
    background: string;
    className?: string;
  };
  theme: 'dark' | 'light';
  blurEffects: boolean;
  animations: boolean;
  updatedAt: Date;
}

interface UserAppData {
  userId: string;
  appId: string;
  data: Record<string, unknown>;
  updatedAt: Date;
}

// ==============================================================
// IN-MEMORY STORAGE (Replace with database in production)
// ==============================================================

const settingsStore: Map<string, UserSettings> = new Map();
const appDataStore: Map<string, UserAppData[]> = new Map(); // userId -> array of app data

// ==============================================================
// DEFAULT VALUES
// ==============================================================

const defaultSettings: Omit<UserSettings, 'userId' | 'updatedAt'> = {
  wallpaper: {
    name: 'Fusion Flow (Live)',
    background: 'linear-gradient(125deg, #0f172a 0%, #4338ca 35%, #ec4899 70%, #0ea5e9 100%)',
    className: 'live-wallpaper',
  },
  theme: 'dark',
  blurEffects: true,
  animations: true,
};

// ==============================================================
// GET /settings/:userId - Retrieve user settings
// ==============================================================

router.get('/settings/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const settings = settingsStore.get(userId);

    if (!settings) {
      // Return defaults for new users
      return res.json({
        userId,
        ...defaultSettings,
        updatedAt: new Date(),
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('[UserSettings] GET error:', error);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
});

// ==============================================================
// PUT /settings/:userId - Update user settings
// ==============================================================

router.put('/settings/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const existing = settingsStore.get(userId) || {
      userId,
      ...defaultSettings,
      updatedAt: new Date(),
    };

    const updated: UserSettings = {
      ...existing,
      ...updates,
      userId, // ensure userId can't be overwritten
      updatedAt: new Date(),
    };

    settingsStore.set(userId, updated);

    res.json(updated);
  } catch (error) {
    console.error('[UserSettings] PUT error:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// ==============================================================
// PATCH /settings/:userId - Partial update user settings
// ==============================================================

router.patch('/settings/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const patch = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const existing = settingsStore.get(userId) || {
      userId,
      ...defaultSettings,
      updatedAt: new Date(),
    };

    // Deep merge for nested objects like wallpaper
    const updated: UserSettings = {
      ...existing,
      ...patch,
      wallpaper: patch.wallpaper
        ? { ...existing.wallpaper, ...patch.wallpaper }
        : existing.wallpaper,
      userId,
      updatedAt: new Date(),
    };

    settingsStore.set(userId, updated);

    res.json(updated);
  } catch (error) {
    console.error('[UserSettings] PATCH error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ==============================================================
// GET /app-data/:userId/:appId - Retrieve app-specific data
// ==============================================================

router.get('/app-data/:userId/:appId', (req, res) => {
  try {
    const { userId, appId } = req.params;

    if (!userId || !appId) {
      return res.status(400).json({ error: 'User ID and App ID required' });
    }

    const userApps = appDataStore.get(userId) || [];
    const appData = userApps.find((a) => a.appId === appId);

    if (!appData) {
      return res.json({
        userId,
        appId,
        data: {},
        updatedAt: new Date(),
      });
    }

    res.json(appData);
  } catch (error) {
    console.error('[UserSettings] GET app-data error:', error);
    res.status(500).json({ error: 'Failed to retrieve app data' });
  }
});

// ==============================================================
// PUT /app-data/:userId/:appId - Save app-specific data
// ==============================================================

router.put('/app-data/:userId/:appId', (req, res) => {
  try {
    const { userId, appId } = req.params;
    const { data } = req.body;

    if (!userId || !appId) {
      return res.status(400).json({ error: 'User ID and App ID required' });
    }

    const userApps = appDataStore.get(userId) || [];
    const existingIndex = userApps.findIndex((a) => a.appId === appId);

    const appData: UserAppData = {
      userId,
      appId,
      data: data || {},
      updatedAt: new Date(),
    };

    if (existingIndex >= 0) {
      userApps[existingIndex] = appData;
    } else {
      userApps.push(appData);
    }

    appDataStore.set(userId, userApps);

    res.json(appData);
  } catch (error) {
    console.error('[UserSettings] PUT app-data error:', error);
    res.status(500).json({ error: 'Failed to save app data' });
  }
});

// ==============================================================
// GET /app-data/:userId - Retrieve ALL app data for a user
// ==============================================================

router.get('/app-data/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const userApps = appDataStore.get(userId) || [];

    res.json({ userId, apps: userApps });
  } catch (error) {
    console.error('[UserSettings] GET all app-data error:', error);
    res.status(500).json({ error: 'Failed to retrieve app data' });
  }
});

// ==============================================================
// DELETE /app-data/:userId/:appId - Delete app-specific data
// ==============================================================

router.delete('/app-data/:userId/:appId', (req, res) => {
  try {
    const { userId, appId } = req.params;

    if (!userId || !appId) {
      return res.status(400).json({ error: 'User ID and App ID required' });
    }

    const userApps = appDataStore.get(userId) || [];
    const filtered = userApps.filter((a) => a.appId !== appId);
    appDataStore.set(userId, filtered);

    res.json({ success: true, message: `Deleted data for app ${appId}` });
  } catch (error) {
    console.error('[UserSettings] DELETE app-data error:', error);
    res.status(500).json({ error: 'Failed to delete app data' });
  }
});

export default router;

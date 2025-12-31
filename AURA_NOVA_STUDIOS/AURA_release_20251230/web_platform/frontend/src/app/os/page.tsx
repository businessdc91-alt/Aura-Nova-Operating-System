'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { WindowManagerProvider } from '@/components/os/WindowManager';
import { DesktopEnvironment } from '@/components/os/DesktopEnvironment';
import { FileManager } from '@/components/os/FileManager';
import { AITicTacToe } from '@/components/games/AITicTacToe';
import { AICheckers } from '@/components/games/AICheckers';
import { AIChess } from '@/components/games/AIChess';
import { CodingSandbox } from '@/components/sandbox/CodingSandbox';
import {
  FolderOpen, Music, PenTool, Users, Gamepad2, Code, Settings,
  Palette, BookOpen, MessageSquare, Sparkles, Grid3X3, Crown, Brain,
  Mail
} from 'lucide-react';
import {
  getUserSettings,
  patchUserSettings,
  getLocalSettings,
  saveLocalSettings,
  WallpaperOption,
} from '@/services/userSettingsService';
import { MessengerApp } from '@/components/os/MessengerApp';

type WallpaperOption = {
  name: string;
  background: string;
  className?: string;
};

const wallpaperOptions: WallpaperOption[] = [
  {
    name: 'Fusion Flow (Live)',
    background: 'linear-gradient(125deg, #0f172a 0%, #4338ca 35%, #ec4899 70%, #0ea5e9 100%)',
    className: 'live-wallpaper',
  },
  {
    name: 'Deep Space',
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  },
  {
    name: 'Aurora Ridge',
    background: 'linear-gradient(135deg, #0b132b 0%, #1c2541 40%, #3a506b 100%)',
  },
  {
    name: 'Neo Sunset',
    background: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 45%, #f43f5e 100%)',
  },
  {
    name: 'Azure Pulse',
    background: 'linear-gradient(135deg, #0f172a 0%, #0ea5e9 45%, #22d3ee 100%)',
  },
];

// ============================================================================
// AURANOCA OS - MAIN OPERATING SYSTEM ENVIRONMENT
// The complete OS experience: Desktop, Taskbar, Windowed Apps
// ============================================================================

// App wrapper components for embedding existing pages
const MusicComposerApp = () => (
  <iframe src="/suites/art/music-composer" className="w-full h-full border-0" />
);

const PoemsCreatorApp = () => (
  <iframe src="/suites/art/poems-creator" className="w-full h-full border-0" />
);

const CollaborativeWritingApp = () => (
  <iframe src="/suites/art/collaborative-writing" className="w-full h-full border-0" />
);

const ArtStudioApp = () => (
  <iframe src="/art-studio" className="w-full h-full border-0" />
);

const ChatApp = () => (
  <iframe src="/chat" className="w-full h-full border-0" />
);

const ProfileApp = () => (
  <iframe src="/profile/me" className="w-full h-full border-0" />
);

// Settings App Component
const SettingsApp: React.FC<{
  wallpaper: WallpaperOption;
  onWallpaperChange: (option: WallpaperOption) => void;
}> = ({ wallpaper, onWallpaperChange }) => (
  <div className="h-full bg-slate-900 text-white p-6 overflow-auto">
    <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
      <Settings className="w-7 h-7 text-slate-400" />
      System Settings
    </h1>
    
    <div className="space-y-6 max-w-2xl">
      <div className="p-4 glass-panel rounded-xl border border-slate-700/50">
        <h3 className="font-semibold mb-3">Appearance</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Dark Mode</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-purple-500" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Blur Effects</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-purple-500" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Animations</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 accent-purple-500" />
          </label>
        </div>
      </div>

      <div className="p-4 glass-panel rounded-xl border border-slate-700/50">
        <h3 className="font-semibold mb-3">Wallpaper</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {wallpaperOptions.map((bg) => (
            <button
              key={bg.name}
              onClick={() => onWallpaperChange(bg)}
              className={`aspect-video rounded-xl border transition-all duration-150 overflow-hidden ${
                wallpaper.name === bg.name
                  ? 'border-purple-400 shadow-[0_0_0_2px_rgba(139,92,246,0.4)]'
                  : 'border-slate-600 hover:border-purple-400/60'
              }`}
              style={{ background: bg.background }}
            >
              {bg.className ? (
                <div className={`${bg.className} w-full h-full`} />
              ) : (
                <div className="w-full h-full" />
              )}
              <span className="sr-only">{bg.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <h3 className="font-semibold mb-3">Storage</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Used</span>
            <span>156 / 1000 files</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full w-[15.6%] bg-purple-500" />
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <h3 className="font-semibold mb-3">About</h3>
        <div className="space-y-2 text-sm text-slate-400">
          <p><span className="text-white">AuraNova OS</span> v1.0.0</p>
          <p>A creative operating system for artists, developers, and dreamers.</p>
          <p className="text-purple-400">Made with 💜 by Aura Nova Studios</p>
        </div>
      </div>
    </div>
  </div>
);

// Games Hub App
const GamesHubApp = () => (
  <div className="h-full bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 text-white p-6 overflow-auto">
    <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
      <Gamepad2 className="w-7 h-7 text-purple-400" />
      AI Games Arcade
    </h1>
    <p className="text-slate-400 mb-6">Challenge our AI opponents or watch them battle each other!</p>
    
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all">
        <div className="text-4xl mb-3">❌⭕</div>
        <h3 className="font-semibold text-lg mb-1">AI Tic Tac Toe</h3>
        <p className="text-sm text-slate-400 mb-4">Classic game with unbeatable AI</p>
        <div className="flex gap-2">
          <span className="text-xs px-2 py-1 bg-green-900/50 text-green-400 rounded">Beginner</span>
          <span className="text-xs px-2 py-1 bg-purple-900/50 text-purple-400 rounded">AI vs AI</span>
        </div>
      </div>

      <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-amber-500/50 transition-all">
        <div className="text-4xl mb-3">🔴⚫</div>
        <h3 className="font-semibold text-lg mb-1">AI Checkers</h3>
        <p className="text-sm text-slate-400 mb-4">Strategic jumps with king pieces</p>
        <div className="flex gap-2">
          <span className="text-xs px-2 py-1 bg-yellow-900/50 text-yellow-400 rounded">Intermediate</span>
          <span className="text-xs px-2 py-1 bg-purple-900/50 text-purple-400 rounded">AI vs AI</span>
        </div>
      </div>

      <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-emerald-500/50 transition-all">
        <div className="text-4xl mb-3">♛♚</div>
        <h3 className="font-semibold text-lg mb-1">AI Chess</h3>
        <p className="text-sm text-slate-400 mb-4">The ultimate strategic challenge</p>
        <div className="flex gap-2">
          <span className="text-xs px-2 py-1 bg-red-900/50 text-red-400 rounded">Advanced</span>
          <span className="text-xs px-2 py-1 bg-purple-900/50 text-purple-400 rounded">AI vs AI</span>
        </div>
      </div>
    </div>

    <p className="text-center text-slate-500 mt-8 text-sm">
      Double-click the game icons on the desktop to play!
    </p>
  </div>
);

// Define all desktop apps
const desktopApps = [
  {
    id: 'file-manager',
    name: 'Files',
    icon: <FolderOpen className="w-6 h-6" />,
    component: <FileManager />,
    defaultWidth: 900,
    defaultHeight: 600,
  },
  {
    id: 'music-composer',
    name: 'Music',
    icon: <Music className="w-6 h-6" />,
    component: <MusicComposerApp />,
    defaultWidth: 1000,
    defaultHeight: 700,
  },
  {
    id: 'poems-creator',
    name: 'Poems',
    icon: <PenTool className="w-6 h-6" />,
    component: <PoemsCreatorApp />,
    defaultWidth: 800,
    defaultHeight: 600,
  },
  {
    id: 'collaborative-writing',
    name: 'Writing',
    icon: <BookOpen className="w-6 h-6" />,
    component: <CollaborativeWritingApp />,
    defaultWidth: 900,
    defaultHeight: 650,
  },
  {
    id: 'art-studio',
    name: 'Art Studio',
    icon: <Palette className="w-6 h-6" />,
    component: <ArtStudioApp />,
    defaultWidth: 1000,
    defaultHeight: 700,
  },
  {
    id: 'ai-tictactoe',
    name: 'Tic Tac Toe',
    icon: <Grid3X3 className="w-6 h-6" />,
    component: <AITicTacToe />,
    defaultWidth: 500,
    defaultHeight: 600,
  },
  {
    id: 'ai-checkers',
    name: 'Checkers',
    icon: <Gamepad2 className="w-6 h-6" />,
    component: <AICheckers />,
    defaultWidth: 550,
    defaultHeight: 650,
  },
  {
    id: 'ai-chess',
    name: 'Chess',
    icon: <Crown className="w-6 h-6" />,
    component: <AIChess />,
    defaultWidth: 550,
    defaultHeight: 700,
  },
  {
    id: 'coding-sandbox',
    name: 'NovaCode',
    icon: <Code className="w-6 h-6" />,
    component: <CodingSandbox />,
    defaultWidth: 1000,
    defaultHeight: 700,
  },
  {
    id: 'chat',
    name: 'Chat',
    icon: <MessageSquare className="w-6 h-6" />,
    component: <ChatApp />,
    defaultWidth: 400,
    defaultHeight: 600,
  },
  {
    id: 'messenger',
    name: 'Messenger',
    icon: <Mail className="w-6 h-6" />,
    component: <MessengerApp />,
    defaultWidth: 700,
    defaultHeight: 550,
  },
  {
    id: 'games-hub',
    name: 'Games',
    icon: <Gamepad2 className="w-6 h-6" />,
    component: <GamesHubApp />,
    defaultWidth: 700,
    defaultHeight: 500,
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: <Settings className="w-6 h-6" />,
    component: null, // placeholder, replaced in render to inject props
    defaultWidth: 600,
    defaultHeight: 500,
  },
];

// Mobile Detection Hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  
  return isMobile;
};

// Mobile OS View
const MobileOSView: React.FC<{ apps: typeof desktopApps }> = ({ apps }) => {
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [showAppDrawer, setShowAppDrawer] = useState(false);

  const getAppComponent = (id: string) => {
    const app = apps.find(a => a.id === id);
    return app?.component;
  };

  if (activeApp) {
    const AppComponent = getAppComponent(activeApp);
    return (
      <div className="fixed inset-0 bg-slate-900 flex flex-col">
        {/* Status Bar */}
        <div className="h-8 bg-slate-800/90 flex items-center justify-between px-4 text-xs text-white">
          <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
          <div className="flex items-center gap-2">
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>

        {/* App Content */}
        <div className="flex-1 overflow-hidden">
          {AppComponent}
        </div>

        {/* Navigation Bar */}
        <div className="h-14 bg-slate-800/90 flex items-center justify-around px-8">
          <button 
            onClick={() => setActiveApp(null)}
            className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center"
          >
            ◀
          </button>
          <button 
            onClick={() => setActiveApp(null)}
            className="w-12 h-12 rounded-full bg-slate-600/50 flex items-center justify-center"
          >
            ○
          </button>
          <button 
            onClick={() => setShowAppDrawer(true)}
            className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center"
          >
            ▣
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      {/* Status Bar */}
      <div className="h-8 bg-black/30 flex items-center justify-between px-4 text-xs text-white">
        <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
        <div className="flex items-center gap-2">
          <span>📶</span>
          <span>100%</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Clock Widget */}
      <div className="text-center py-8">
        <div className="text-6xl font-thin text-white">
          {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
        </div>
        <div className="text-lg text-white/60 mt-2">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* App Grid */}
      <div className="flex-1 px-6 overflow-auto">
        <div className="grid grid-cols-4 gap-4">
          {apps.slice(0, 12).map((app) => (
            <button
              key={app.id}
              onClick={() => setActiveApp(app.id)}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-lg flex items-center justify-center text-2xl shadow-lg">
                {app.icon}
              </div>
              <span className="text-[10px] text-white/80">{app.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dock */}
      <div className="pb-6 pt-4">
        <div className="mx-6 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-around px-4">
          <button onClick={() => setActiveApp('file-manager')} className="text-2xl">📁</button>
          <button onClick={() => setActiveApp('chat')} className="text-2xl">💬</button>
          <button onClick={() => setActiveApp('coding-sandbox')} className="text-2xl">💻</button>
          <button onClick={() => setActiveApp('games-hub')} className="text-2xl">🎮</button>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="pb-2 flex justify-center">
        <div className="w-32 h-1 bg-white/50 rounded-full" />
      </div>
    </div>
  );
};

// Main OS Page Component
export default function OSPage() {
  const isMobile = useIsMobile();
  const [isLoaded, setIsLoaded] = useState(false);
  const [wallpaper, setWallpaper] = useState<WallpaperOption>(wallpaperOptions[0]);

  // Placeholder user id (replace with auth in production)
  const userId = 'guest';

  // Load saved settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const remote = await getUserSettings(userId);
        if (remote?.wallpaper) {
          setWallpaper(remote.wallpaper);
          saveLocalSettings(remote);
        }
      } catch {
        const local = getLocalSettings();
        if (local?.wallpaper) {
          setWallpaper(local.wallpaper);
        }
      }
    }
    loadSettings();
  }, []);

  // Persist wallpaper changes
  const handleWallpaperChange = useCallback(
    async (option: WallpaperOption) => {
      setWallpaper(option);
      // Save to backend (optimistic local save first)
      const updated = {
        userId,
        wallpaper: option,
        theme: 'dark' as const,
        blurEffects: true,
        animations: true,
        updatedAt: new Date().toISOString(),
      };
      saveLocalSettings(updated);
      try {
        await patchUserSettings(userId, { wallpaper: option });
      } catch (err) {
        console.warn('[OSPage] Failed to save wallpaper to backend:', err);
      }
    },
    [userId]
  );

  const apps = desktopApps.map(app =>
    app.id === 'settings'
      ? { ...app, component: <SettingsApp wallpaper={wallpaper} onWallpaperChange={handleWallpaperChange} /> }
      : app
  );

  useEffect(() => {
    // Boot animation
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Boot Screen
  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6 animate-pulse">✨</div>
          <h1 className="text-3xl font-bold text-white mb-2">AuraNova OS</h1>
          <p className="text-slate-400">Loading your creative workspace...</p>
          <div className="mt-8 w-48 h-1 bg-slate-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 animate-[loading_1s_ease-in-out_infinite]" 
                 style={{ width: '50%' }} />
          </div>
        </div>
      </div>
    );
  }

  // Mobile: Show mobile OS view
  if (isMobile) {
    return <MobileOSView apps={apps} />;
  }

  // Desktop: Show full windowed OS
  return (
    <WindowManagerProvider>
      <DesktopEnvironment 
        apps={apps}
        wallpaper={wallpaper.background}
        wallpaperClass={wallpaper.className}
      />
    </WindowManagerProvider>
  );
}

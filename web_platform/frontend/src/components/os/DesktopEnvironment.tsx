'use client';

import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, Music, PenTool, Users, Gamepad2, Code, Settings, 
  Terminal, FileText, Image, Video, Package, Search, Wifi, 
  Battery, Volume2, Sun, Moon, Bell, User, Power, Grid3X3
} from 'lucide-react';
import { useWindowManager } from './WindowManager';
import { NotificationCenter, NotificationBell } from './NotificationCenter';

// ============================================================================
// DESKTOP ENVIRONMENT - THE VISUAL OS SHELL
// Taskbar, Desktop Icons, Start Menu, System Tray
// ============================================================================

interface DesktopApp {
  id: string;
  name: string;
  icon: string | React.ReactNode;
  component: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
}

interface DesktopEnvironmentProps {
  apps: DesktopApp[];
  wallpaper?: string;
  wallpaperClass?: string;
  children?: React.ReactNode;
}

export const DesktopEnvironment: React.FC<DesktopEnvironmentProps> = ({
  apps,
  wallpaper,
  wallpaperClass,
  children,
}) => {
  const { openWindow, windows, getMinimizedWindows, restoreWindow, focusWindow } = useWindowManager();
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenApp = (app: DesktopApp) => {
    openWindow({
      id: app.id,
      title: app.name,
      icon: app.icon,
      component: app.component,
      x: 100 + Math.random() * 200,
      y: 50 + Math.random() * 100,
      width: app.defaultWidth || 800,
      height: app.defaultHeight || 600,
      minWidth: 400,
      minHeight: 300,
      isMinimized: false,
      isMaximized: false,
    });
    setShowStartMenu(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const minimizedWindows = getMinimizedWindows();

  return (
    <div 
      className={`fixed inset-0 overflow-hidden select-none ${wallpaperClass ?? ''}`}
      style={{
        background: wallpaper 
          ? wallpaper
          : 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      }}
    >
      {/* Desktop Icons Grid */}
      <div className="absolute top-4 left-4 grid grid-cols-1 gap-4">
        {apps.slice(0, 8).map((app) => (
          <button
            key={app.id}
            onDoubleClick={() => handleOpenApp(app)}
            className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-white/10 transition-colors group w-20"
          >
            <div className="text-3xl group-hover:scale-110 transition-transform flex items-center justify-center">
              {app.icon}
            </div>
            <span className="text-xs text-white text-center leading-tight drop-shadow-lg">
              {app.name}
            </span>
          </button>
        ))}
      </div>

      {/* Background content (home panel) */}
      {children && (
        <div className="absolute inset-0 top-0 bottom-12 overflow-hidden pointer-events-none">
          <div className="pointer-events-auto h-full overflow-auto opacity-30">
            {children}
          </div>
        </div>
      )}

      {/* Start Menu */}
      {showStartMenu && (
        <div 
          className="absolute bottom-14 left-2 w-80 bg-slate-900/95 backdrop-blur-xl rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden z-[9999]"
          onMouseLeave={() => setShowStartMenu(false)}
        >
          {/* User Profile */}
          <div className="p-4 border-b border-slate-700/50 bg-gradient-to-r from-purple-900/50 to-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">Creator</p>
                <p className="text-xs text-slate-400">Premium Account</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search apps..."
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 outline-none"
              />
            </div>
          </div>

          {/* Pinned Apps */}
          <div className="p-3">
            <p className="text-xs text-slate-400 mb-2 font-medium">APPLICATIONS</p>
            <div className="grid grid-cols-4 gap-2">
              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleOpenApp(app)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="text-2xl flex items-center justify-center">
                    {app.icon}
                  </div>
                  <span className="text-[10px] text-slate-300 text-center leading-tight truncate w-full">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Power Options */}
          <div className="p-3 border-t border-slate-700/50 flex justify-between">
            <button className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
              <Power className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Taskbar / Dock */}
      <div className="absolute bottom-0 left-0 right-0 h-16 px-3 pb-3 flex items-end justify-between z-[9998]">
        {/* Start Button */}
        <button
          onClick={() => setShowStartMenu(!showStartMenu)}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all glass-panel ${showStartMenu ? 'ring-2 ring-purple-500/60' : 'hover:ring-1 hover:ring-white/20'}`}
        >
          <Grid3X3 className="w-5 h-5 text-white" />
        </button>

        {/* Dock */}
        <div className="flex-1 flex justify-center">
          <div className="dock rounded-3xl px-3 py-2 flex items-center gap-2 max-w-3xl w-full justify-center">
            {apps.slice(0, 8).map(app => {
              const isActive = windows.some(w => w.id === app.id && !w.isMinimized);
              return (
                <button
                  key={app.id}
                  onClick={() => handleOpenApp(app)}
                  className={`dock-item w-12 h-12 rounded-2xl flex items-center justify-center text-lg text-white/90 ${isActive ? 'bg-white/10 glow-edge' : 'bg-white/5'}`}
                >
                  {app.icon}
                </button>
              );
            })}
          </div>
        </div>

        {/* System Tray */}
        <div className="glass-panel rounded-2xl h-11 px-3 flex items-center gap-2 text-slate-200">
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors hidden sm:block">
            <Wifi className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors hidden sm:block">
            <Volume2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors hidden sm:block"
          >
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <NotificationBell userId="guest" onClick={() => setShowNotifications(!showNotifications)} isOpen={showNotifications} />
          <div className="hidden sm:flex items-center gap-1 px-1 text-slate-200">
            <Battery className="w-5 h-5" />
            <span className="text-xs">100%</span>
          </div>
          <div className="flex flex-col items-end px-1 min-w-[70px]">
            <span className="text-xs text-white font-medium">
              {formatTime(currentTime)}
            </span>
            <span className="text-[10px] text-slate-400">
              {formatDate(currentTime)}
            </span>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      <NotificationCenter
        userId="guest"
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

export default DesktopEnvironment;

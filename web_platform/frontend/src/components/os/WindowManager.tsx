'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';

// ============================================================================
// WINDOW MANAGER - THE CORE OF THE OS EXPERIENCE
// Handles windowed applications, dragging, resizing, z-index, minimize/maximize
// ============================================================================

export interface WindowState {
  id: string;
  title: string;
  icon: ReactNode;
  component: ReactNode;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isActive: boolean;
  zIndex: number;
}

interface WindowManagerContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  openWindow: (config: Omit<WindowState, 'zIndex' | 'isActive'>) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, x: number, y: number) => void;
  updateWindowSize: (id: string, width: number, height: number) => void;
  getMinimizedWindows: () => WindowState[];
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(null);

export const useWindowManager = () => {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error('useWindowManager must be used within WindowManagerProvider');
  }
  return context;
};

// ============================================================================
// DRAGGABLE WINDOW COMPONENT
// ============================================================================

interface DraggableWindowProps {
  window: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
}

export const DraggableWindow: React.FC<DraggableWindowProps> = ({
  window: win,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onMove,
  onResize,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    onFocus();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - win.x,
      y: e.clientY - win.y,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      onMove(e.clientX - dragOffset.x, e.clientY - dragOffset.y);
    }
    if (isResizing) {
      const newWidth = Math.max(win.minWidth, e.clientX - win.x);
      const newHeight = Math.max(win.minHeight, e.clientY - win.y);
      onResize(newWidth, newHeight);
    }
  }, [isDragging, isResizing, dragOffset, win, onMove, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  if (win.isMinimized) return null;

  const windowStyle: React.CSSProperties = win.isMaximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 48px)',
        zIndex: win.zIndex,
      }
    : {
        position: 'fixed',
        top: win.y,
        left: win.x,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
      };

  return (
    <div
      style={windowStyle}
      className={`
        flex flex-col rounded-xl overflow-hidden shadow-2xl glass-strong
        ${win.isActive ? 'ring-2 ring-purple-500/50 glow-edge' : 'ring-1 ring-white/5'}
        transition-shadow duration-200
      `}
      onClick={onFocus}
    >
      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        className={`
          flex items-center justify-between px-3 py-2 cursor-move select-none
          ${win.isActive 
            ? 'bg-gradient-to-r from-purple-900/70 via-slate-900/70 to-slate-900/80' 
            : 'bg-slate-800/70'
          }
        `}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg text-white/90 flex items-center justify-center">{win.icon}</span>
          <span className="text-sm font-medium text-white truncate max-w-[220px]">
            {win.title}
          </span>
        </div>

        {/* Window Controls */}
        <div className="window-controls flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-yellow-500/20 text-yellow-400 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={onMaximize}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-green-500/20 text-green-400 transition-colors"
          >
            {win.isMaximized ? <Square className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-500/20 text-red-400 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 bg-slate-950/80 backdrop-blur-xl overflow-auto">
        {win.component}
      </div>

      {/* Resize Handle */}
      {!win.isMaximized && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsResizing(true);
            onFocus();
          }}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          style={{
            background: 'linear-gradient(135deg, transparent 50%, rgba(139, 92, 246, 0.5) 50%)',
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// WINDOW MANAGER PROVIDER
// ============================================================================

export const WindowManagerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextZIndex, setNextZIndex] = useState(100);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);

  const openWindow = useCallback((config: Omit<WindowState, 'zIndex' | 'isActive'>) => {
    // Check if window already exists
    const existing = windows.find(w => w.id === config.id);
    if (existing) {
      // Focus existing window
      focusWindow(config.id);
      if (existing.isMinimized) {
        restoreWindow(config.id);
      }
      return;
    }

    setNextZIndex(prev => prev + 1);
    setWindows(prev => [
      ...prev.map(w => ({ ...w, isActive: false })),
      { ...config, zIndex: nextZIndex, isActive: true },
    ]);
    setActiveWindowId(config.id);
  }, [windows, nextZIndex]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) {
      const remaining = windows.filter(w => w.id !== id);
      if (remaining.length > 0) {
        const topWindow = remaining.reduce((a, b) => a.zIndex > b.zIndex ? a : b);
        setActiveWindowId(topWindow.id);
      } else {
        setActiveWindowId(null);
      }
    }
  }, [activeWindowId, windows]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMinimized: true, isActive: false } : w
    ));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  }, [activeWindowId]);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setNextZIndex(prev => prev + 1);
    setWindows(prev => prev.map(w =>
      w.id === id 
        ? { ...w, isMinimized: false, isActive: true, zIndex: nextZIndex } 
        : { ...w, isActive: false }
    ));
    setActiveWindowId(id);
  }, [nextZIndex]);

  const focusWindow = useCallback((id: string) => {
    setNextZIndex(prev => prev + 1);
    setWindows(prev => prev.map(w =>
      w.id === id
        ? { ...w, isActive: true, zIndex: nextZIndex }
        : { ...w, isActive: false }
    ));
    setActiveWindowId(id);
  }, [nextZIndex]);

  const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, x: Math.max(0, x), y: Math.max(0, y) } : w
    ));
  }, []);

  const updateWindowSize = useCallback((id: string, width: number, height: number) => {
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, width, height } : w
    ));
  }, []);

  const getMinimizedWindows = useCallback(() => {
    return windows.filter(w => w.isMinimized);
  }, [windows]);

  return (
    <WindowManagerContext.Provider
      value={{
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        restoreWindow,
        focusWindow,
        updateWindowPosition,
        updateWindowSize,
        getMinimizedWindows,
      }}
    >
      {children}

      {/* Render all windows */}
      {windows.map(win => (
        <DraggableWindow
          key={win.id}
          window={win}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => minimizeWindow(win.id)}
          onMaximize={() => maximizeWindow(win.id)}
          onFocus={() => focusWindow(win.id)}
          onMove={(x, y) => updateWindowPosition(win.id, x, y)}
          onResize={(w, h) => updateWindowSize(win.id, w, h)}
        />
      ))}
    </WindowManagerContext.Provider>
  );
};

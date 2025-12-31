'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  MessageSquare,
  AtSign,
  ShoppingBag,
  Users,
  Info,
  Trash2,
} from 'lucide-react';

// ==========================================================
// TYPES
// ==========================================================

export interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'mention' | 'sale' | 'collaboration' | 'system';
  title: string;
  content: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

const ICON_MAP: Record<Notification['type'], React.ReactNode> = {
  message: <MessageSquare className="w-4 h-4 text-blue-400" />,
  mention: <AtSign className="w-4 h-4 text-purple-400" />,
  sale: <ShoppingBag className="w-4 h-4 text-green-400" />,
  collaboration: <Users className="w-4 h-4 text-amber-400" />,
  system: <Info className="w-4 h-4 text-slate-400" />,
};

// ==========================================================
// HOOK: useNotifications
// ==========================================================

interface UseNotificationsOptions {
  userId: string;
  wsUrl?: string;
}

export function useNotifications({ userId, wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002' }: UseNotificationsOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const ws = io(wsUrl, { transports: ['websocket', 'polling'] });

    ws.on('connect', () => {
      ws.emit('auth:login', { userId, username: 'User' });
    });

    ws.on('notifications:list', (list: Notification[]) => {
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    });

    ws.on('notification:new', (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    setSocket(ws);
    return () => {
      ws.disconnect();
    };
  }, [userId, wsUrl]);

  const markAsRead = useCallback(
    (notificationId: string) => {
      if (socket) {
        socket.emit('notification:read', notificationId);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    },
    [socket]
  );

  const markAllAsRead = useCallback(() => {
    if (socket) {
      socket.emit('notification:readAll');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  }, [socket]);

  const clearNotification = useCallback(
    (notificationId: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    },
    []
  );

  return { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification };
}

// ==========================================================
// NOTIFICATION CENTER PANEL
// ==========================================================

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick?: (notif: Notification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  isOpen,
  onClose,
  onNotificationClick,
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications({ userId });

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return d.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-16 right-2 w-80 max-h-[28rem] bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden z-[10000] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-purple-400" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-purple-500 rounded-full">{unreadCount}</span>
          )}
        </h3>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white" title="Mark all as read">
              <CheckCheck className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No notifications yet
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex gap-3 px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer ${!notif.read ? 'bg-purple-900/10' : ''}`}
              onClick={() => {
                if (!notif.read) markAsRead(notif.id);
                onNotificationClick?.(notif);
              }}
            >
              <div className="mt-0.5">{ICON_MAP[notif.type]}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${notif.read ? 'text-slate-300' : 'text-white font-medium'}`}>{notif.title}</p>
                <p className="text-xs text-slate-500 truncate">{notif.content}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{formatTime(notif.createdAt)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearNotification(notif.id);
                }}
                className="p-1 hover:bg-slate-700 rounded text-slate-600 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ==========================================================
// NOTIFICATION BELL (for taskbar/tray)
// ==========================================================

interface NotificationBellProps {
  userId: string;
  onClick: () => void;
  isOpen: boolean;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId, onClick, isOpen }) => {
  const { unreadCount } = useNotifications({ userId });

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-xl transition-colors relative ${isOpen ? 'bg-purple-600/30 text-purple-300' : 'hover:bg-white/10 text-slate-200'}`}
    >
      <Bell className="w-4 h-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold bg-purple-500 text-white rounded-full">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationCenter;

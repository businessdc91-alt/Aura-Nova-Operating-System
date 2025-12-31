'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  MessageSquare,
  Heart,
  UserPlus,
  Star,
  Coins,
  ShoppingBag,
  Award,
  Gamepad2,
  AlertCircle,
  Info,
  Filter,
  MoreVertical,
  X,
} from 'lucide-react';
import Link from 'next/link';

// ============== TYPES ==============
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  link?: string;
  image?: string;
  read: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

type NotificationType =
  | 'message'
  | 'like'
  | 'follow'
  | 'mention'
  | 'purchase'
  | 'sale'
  | 'points'
  | 'badge'
  | 'game'
  | 'system'
  | 'alert';

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  categories: {
    messages: boolean;
    social: boolean;
    marketplace: boolean;
    games: boolean;
    system: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const TYPE_ICONS: Record<NotificationType, React.ReactNode> = {
  message: <MessageSquare size={20} />,
  like: <Heart size={20} />,
  follow: <UserPlus size={20} />,
  mention: <MessageSquare size={20} />,
  purchase: <ShoppingBag size={20} />,
  sale: <Coins size={20} />,
  points: <Star size={20} />,
  badge: <Award size={20} />,
  game: <Gamepad2 size={20} />,
  system: <Info size={20} />,
  alert: <AlertCircle size={20} />,
};

const TYPE_COLORS: Record<NotificationType, string> = {
  message: 'bg-blue-500/20 text-blue-400',
  like: 'bg-pink-500/20 text-pink-400',
  follow: 'bg-purple-500/20 text-purple-400',
  mention: 'bg-aura-500/20 text-aura-400',
  purchase: 'bg-green-500/20 text-green-400',
  sale: 'bg-amber-500/20 text-amber-400',
  points: 'bg-yellow-500/20 text-yellow-400',
  badge: 'bg-orange-500/20 text-orange-400',
  game: 'bg-cyan-500/20 text-cyan-400',
  system: 'bg-slate-500/20 text-slate-400',
  alert: 'bg-red-500/20 text-red-400',
};

// Demo notifications
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'follow',
    title: 'New Follower',
    content: 'CreativeArtist started following you',
    link: '/profile/user123',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
  },
  {
    id: 'n2',
    type: 'like',
    title: 'Someone liked your work',
    content: 'PixelMaster liked your "Cyberpunk City" artwork',
    link: '/art-studio',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'n3',
    type: 'sale',
    title: 'Item Sold!',
    content: 'Your "Character Sprite Pack" sold for 500 points',
    link: '/marketplace',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'n4',
    type: 'badge',
    title: 'New Badge Earned!',
    content: 'You earned the "Art Master" badge',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'n5',
    type: 'message',
    title: 'New Message',
    content: 'GameDev123: Hey, love your work!',
    link: '/chat',
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'n6',
    type: 'game',
    title: 'Aetherium Challenge',
    content: 'NovaCatalyst challenged you to a duel!',
    link: '/aetherium',
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'n7',
    type: 'points',
    title: 'Daily Bonus',
    content: 'You received 100 bonus points!',
    read: true,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'n8',
    type: 'system',
    title: 'Platform Update',
    content: 'New features available! Check out the Script Fusion tool.',
    link: '/script-fusion',
    read: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: false,
    categories: {
      messages: true,
      social: true,
      marketplace: true,
      games: true,
      system: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success('Notification deleted');
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success('All notifications cleared');
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const filteredNotifications = notifications
    .filter((n) => (filter === 'unread' ? !n.read : true))
    .filter((n) => (typeFilter === 'all' ? true : n.type === typeFilter));

  const groupedNotifications = {
    today: filteredNotifications.filter(
      (n) => new Date(n.createdAt).toDateString() === new Date().toDateString()
    ),
    earlier: filteredNotifications.filter(
      (n) => new Date(n.createdAt).toDateString() !== new Date().toDateString()
    ),
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell size={28} className="text-aura-500" />
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck size={16} className="mr-1" />
              Mark all read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={16} />
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="bg-slate-900 border-slate-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Notification Settings</span>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Push & Email */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushEnabled}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, pushEnabled: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-slate-600 text-aura-600"
                  />
                  <div>
                    <p className="text-white font-medium">Push Notifications</p>
                    <p className="text-xs text-slate-400">Browser notifications</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailEnabled}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, emailEnabled: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-slate-600 text-aura-600"
                  />
                  <div>
                    <p className="text-white font-medium">Email Notifications</p>
                    <p className="text-xs text-slate-400">Important updates</p>
                  </div>
                </label>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-white font-medium mb-3">Categories</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(settings.categories).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-slate-300 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            categories: { ...prev.categories, [key]: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 rounded border-slate-600 text-aura-600"
                      />
                      <span className="capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="p-4 bg-slate-800 rounded-lg">
                <label className="flex items-center gap-3 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.quietHours.enabled}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, enabled: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 rounded border-slate-600 text-aura-600"
                  />
                  <div>
                    <p className="text-white font-medium">Quiet Hours</p>
                    <p className="text-xs text-slate-400">Mute notifications during specific times</p>
                  </div>
                </label>
                {settings.quietHours.enabled && (
                  <div className="flex gap-4 mt-3">
                    <div>
                      <label className="text-xs text-slate-400">Start</label>
                      <input
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, start: e.target.value },
                          }))
                        }
                        className="block mt-1 bg-slate-700 border-slate-600 rounded text-white px-2 py-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400">End</label>
                      <input
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            quietHours: { ...prev.quietHours, end: e.target.value },
                          }))
                        }
                        className="block mt-1 bg-slate-700 border-slate-600 rounded text-white px-2 py-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-aura-600 hover:bg-aura-700"
                onClick={() => {
                  toast.success('Settings saved');
                  setShowSettings(false);
                }}
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex rounded-lg overflow-hidden border border-slate-800">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm ${
                filter === 'all'
                  ? 'bg-aura-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 text-sm ${
                filter === 'unread'
                  ? 'bg-aura-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as NotificationType | 'all')}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300"
          >
            <option value="all">All Types</option>
            <option value="message">Messages</option>
            <option value="like">Likes</option>
            <option value="follow">Follows</option>
            <option value="sale">Sales</option>
            <option value="points">Points</option>
            <option value="badge">Badges</option>
            <option value="game">Games</option>
            <option value="system">System</option>
          </select>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-6">
            {/* Today */}
            {groupedNotifications.today.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Today</h3>
                <div className="space-y-2">
                  {groupedNotifications.today.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markAsRead}
                      onDelete={deleteNotification}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Earlier */}
            {groupedNotifications.earlier.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase mb-3">Earlier</h3>
                <div className="space-y-2">
                  {groupedNotifications.earlier.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={markAsRead}
                      onDelete={deleteNotification}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="py-12 text-center">
              <BellOff size={48} className="mx-auto mb-4 text-slate-600" />
              <h3 className="text-lg font-semibold text-white mb-2">No notifications</h3>
              <p className="text-slate-400">You're all caught up!</p>
            </CardContent>
          </Card>
        )}

        {/* Clear All */}
        {notifications.length > 0 && (
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={clearAll} className="text-red-400 hover:text-red-300">
              <Trash2 size={16} className="mr-2" />
              Clear All Notifications
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Notification Item Component
function NotificationItem({
  notification,
  onRead,
  onDelete,
  formatTime,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  formatTime: (date: Date) => string;
}) {
  const [showMenu, setShowMenu] = useState(false);

  const content = (
    <div
      className={`group flex items-start gap-4 p-4 rounded-lg border transition ${
        notification.read
          ? 'bg-slate-900/50 border-slate-800/50'
          : 'bg-slate-900 border-slate-700 border-l-4 border-l-aura-500'
      }`}
    >
      {/* Icon */}
      <div className={`p-2 rounded-lg ${TYPE_COLORS[notification.type]}`}>
        {TYPE_ICONS[notification.type]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-semibold ${notification.read ? 'text-slate-300' : 'text-white'}`}>
            {notification.title}
          </h4>
          {!notification.read && (
            <span className="w-2 h-2 rounded-full bg-aura-500" />
          )}
        </div>
        <p className="text-sm text-slate-400 line-clamp-2">{notification.content}</p>
        <p className="text-xs text-slate-500 mt-1">{formatTime(notification.createdAt)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition">
        {!notification.read && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRead(notification.id);
            }}
            className="p-1.5 text-slate-400 hover:text-aura-400 hover:bg-slate-800 rounded"
            title="Mark as read"
          >
            <Check size={16} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  if (notification.link) {
    return (
      <Link href={notification.link} onClick={() => !notification.read && onRead(notification.id)}>
        {content}
      </Link>
    );
  }

  return content;
}

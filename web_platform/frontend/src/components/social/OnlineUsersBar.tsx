'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Circle, 
  MessageSquare,
  Search,
  X,
  Clock,
  Gamepad2,
  Palette,
  Code,
  Music,
  BookOpen,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SocialUser, getOnlineUsers, getCurrentUser } from '@/services/socialNetworkService';
import { startConversationWithUser } from '@/services/directMessageService';
import toast from 'react-hot-toast';

// ================== TYPES ==================
interface OnlineUsersBarProps {
  onUserClick?: (user: SocialUser) => void;
  onMessageClick?: (user: SocialUser) => void;
  className?: string;
  position?: 'top' | 'bottom';
}

// ================== STATUS COLORS ==================
const STATUS_COLORS = {
  online: '#22c55e',
  away: '#f59e0b',
  busy: '#ef4444',
  offline: '#6b7280',
};

const STATUS_LABELS = {
  online: 'Online',
  away: 'Away',
  busy: 'Do Not Disturb',
  offline: 'Offline',
};

// ================== ACTIVITY ICONS ==================
const getActivityIcon = (activity?: string) => {
  if (!activity) return null;
  const lower = activity.toLowerCase();
  if (lower.includes('game') || lower.includes('play')) return <Gamepad2 size={12} className="text-green-400" />;
  if (lower.includes('art') || lower.includes('draw') || lower.includes('sprite')) return <Palette size={12} className="text-pink-400" />;
  if (lower.includes('code') || lower.includes('dev') || lower.includes('dojo')) return <Code size={12} className="text-blue-400" />;
  if (lower.includes('music') || lower.includes('compos')) return <Music size={12} className="text-purple-400" />;
  if (lower.includes('writ') || lower.includes('story') || lower.includes('lore')) return <BookOpen size={12} className="text-amber-400" />;
  return <Circle size={12} className="text-slate-400" />;
};

// ================== MEMBERSHIP BADGES ==================
const TIER_COLORS = {
  free: 'bg-slate-600',
  creator: 'bg-blue-600',
  developer: 'bg-purple-600',
  catalyst: 'bg-orange-600',
  prime: 'bg-amber-500',
};

// ================== ONLINE USERS BAR COMPONENT ==================
export function OnlineUsersBar({ 
  onUserClick, 
  onMessageClick,
  className = '',
  position = 'top',
}: OnlineUsersBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<SocialUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<SocialUser | null>(null);
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const currentUser = getCurrentUser();

  // Refresh online users periodically
  useEffect(() => {
    const refresh = () => {
      const users = getOnlineUsers().filter(u => u.id !== currentUser?.id);
      setOnlineUsers(users);
    };

    refresh();
    const interval = setInterval(refresh, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Filter users by search
  const filteredUsers = onlineUsers.filter(user => 
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by status
  const onlineCount = onlineUsers.filter(u => u.status === 'online').length;
  const awayCount = onlineUsers.filter(u => u.status === 'away').length;
  const busyCount = onlineUsers.filter(u => u.status === 'busy').length;

  const handleUserClick = useCallback((user: SocialUser) => {
    setSelectedUser(user);
    if (onUserClick) {
      onUserClick(user);
    }
  }, [onUserClick]);

  const handleMessageUser = useCallback((user: SocialUser, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMessageClick) {
      onMessageClick(user);
    } else {
      // Default: open conversation
      try {
        startConversationWithUser(user.id);
        toast.success(`Started conversation with ${user.displayName}`);
      } catch (error) {
        toast.error('Could not start conversation');
      }
    }
  }, [onMessageClick]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setSearchQuery('');
    setSelectedUser(null);
  };

  const renderUserAvatar = (user: SocialUser, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
    };

    return (
      <div className="relative">
        <div 
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-aura-500 to-purple-600 flex items-center justify-center text-white font-medium`}
        >
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            user.displayName[0].toUpperCase()
          )}
        </div>
        {/* Status indicator */}
        <div 
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900`}
          style={{ backgroundColor: STATUS_COLORS[user.status] }}
        />
      </div>
    );
  };

  const renderUserCard = (user: SocialUser) => (
    <div
      key={user.id}
      className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
        selectedUser?.id === user.id 
          ? 'bg-aura-600/30 border border-aura-500/50' 
          : 'hover:bg-slate-800/50'
      }`}
      onClick={() => handleUserClick(user)}
      onMouseEnter={() => setHoveredUser(user.id)}
      onMouseLeave={() => setHoveredUser(null)}
    >
      {renderUserAvatar(user, 'md')}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium truncate text-sm">
            {user.displayName}
          </span>
          {user.isVerified && (
            <span className="text-blue-400 text-xs">✓</span>
          )}
          <span className={`px-1.5 py-0.5 rounded text-[10px] ${TIER_COLORS[user.membershipTier]}`}>
            {user.membershipTier.charAt(0).toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span style={{ color: STATUS_COLORS[user.status] }}>
            {STATUS_LABELS[user.status]}
          </span>
          {user.currentActivity && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 truncate">
                {getActivityIcon(user.currentActivity)}
                {user.currentActivity}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Quick actions on hover */}
      <div className={`flex items-center gap-1 transition-opacity ${hoveredUser === user.id ? 'opacity-100' : 'opacity-0'}`}>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-slate-400 hover:text-white hover:bg-aura-600"
          onClick={(e) => handleMessageUser(user, e)}
        >
          <MessageSquare size={14} />
        </Button>
      </div>
    </div>
  );

  // Collapsed view - horizontal bar
  const CollapsedBar = () => (
    <div 
      className={`flex items-center gap-2 px-4 py-2 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 cursor-pointer hover:bg-slate-800/95 transition-colors ${className}`}
      onClick={toggleExpand}
    >
      {/* Online indicator */}
      <div className="flex items-center gap-2">
        <Users size={16} className="text-aura-400" />
        <span className="text-sm font-medium text-white">
          {onlineCount} online
        </span>
        {awayCount > 0 && (
          <span className="text-xs text-amber-400">
            • {awayCount} away
          </span>
        )}
      </div>

      {/* Avatars preview */}
      <div className="flex -space-x-2 ml-2">
        {onlineUsers.slice(0, 5).map((user) => (
          <div 
            key={user.id}
            className="relative"
            title={user.displayName}
          >
            {renderUserAvatar(user, 'sm')}
          </div>
        ))}
        {onlineUsers.length > 5 && (
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white border-2 border-slate-900">
            +{onlineUsers.length - 5}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Expand button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 text-slate-400"
        onClick={(e) => {
          e.stopPropagation();
          toggleExpand();
        }}
      >
        {position === 'top' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </Button>
    </div>
  );

  // Expanded view - dropdown panel
  const ExpandedPanel = () => (
    <div 
      className={`bg-slate-900/98 backdrop-blur-md border-b border-slate-800 shadow-2xl ${className}`}
      style={{
        maxHeight: '400px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-aura-400" />
          <span className="font-semibold text-white">Online Users</span>
          <span className="text-xs text-slate-400">
            ({onlineCount} online, {awayCount} away, {busyCount} busy)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={() => toast('Settings coming soon!')}
          >
            <Settings size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white"
            onClick={toggleExpand}
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-slate-800">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="pl-9 h-8 bg-slate-800 border-slate-700 text-sm"
          />
        </div>
      </div>

      {/* User list */}
      <div className="overflow-y-auto" style={{ maxHeight: '280px' }}>
        {/* Online users */}
        {filteredUsers.filter(u => u.status === 'online').length > 0 && (
          <div className="p-2">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-2">
              Online — {filteredUsers.filter(u => u.status === 'online').length}
            </div>
            <div className="space-y-1">
              {filteredUsers
                .filter(u => u.status === 'online')
                .map(renderUserCard)}
            </div>
          </div>
        )}

        {/* Away users */}
        {filteredUsers.filter(u => u.status === 'away').length > 0 && (
          <div className="p-2">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-2">
              Away — {filteredUsers.filter(u => u.status === 'away').length}
            </div>
            <div className="space-y-1">
              {filteredUsers
                .filter(u => u.status === 'away')
                .map(renderUserCard)}
            </div>
          </div>
        )}

        {/* Busy users */}
        {filteredUsers.filter(u => u.status === 'busy').length > 0 && (
          <div className="p-2">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2 px-2">
              Do Not Disturb — {filteredUsers.filter(u => u.status === 'busy').length}
            </div>
            <div className="space-y-1">
              {filteredUsers
                .filter(u => u.status === 'busy')
                .map(renderUserCard)}
            </div>
          </div>
        )}

        {/* No results */}
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            {searchQuery ? (
              <>
                <Search size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No users found matching "{searchQuery}"</p>
              </>
            ) : (
              <>
                <Users size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No users online right now</p>
                <p className="text-xs mt-1">Check back later!</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          <Clock size={12} className="inline mr-1" />
          Last updated just now
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-xs text-aura-400 hover:text-aura-300"
          onClick={() => {
            const users = getOnlineUsers();
            setOnlineUsers(users.filter(u => u.id !== currentUser?.id));
            toast.success('Refreshed!');
          }}
        >
          Refresh
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50`}>
      {isExpanded ? <ExpandedPanel /> : <CollapsedBar />}
    </div>
  );
}

// ================== MINI VERSION FOR SIDEBAR ==================
export function OnlineUsersSidebar({ className = '' }: { className?: string }) {
  const [onlineUsers, setOnlineUsers] = useState<SocialUser[]>([]);
  const currentUser = getCurrentUser();

  useEffect(() => {
    const refresh = () => {
      const users = getOnlineUsers().filter(u => u.id !== currentUser?.id);
      setOnlineUsers(users);
    };
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const handleMessageUser = (user: SocialUser) => {
    try {
      startConversationWithUser(user.id);
      toast.success(`Started conversation with ${user.displayName}`);
    } catch {
      toast.error('Could not start conversation');
    }
  };

  return (
    <div className={`bg-slate-900/50 rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Users size={16} className="text-aura-400" />
        <span className="text-sm font-medium text-white">Online Now</span>
        <span className="ml-auto text-xs text-slate-400">{onlineUsers.length}</span>
      </div>

      <div className="space-y-2">
        {onlineUsers.slice(0, 8).map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800/50 cursor-pointer group"
            onClick={() => handleMessageUser(user)}
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-aura-500 to-purple-600 flex items-center justify-center text-white text-xs">
                {user.displayName[0].toUpperCase()}
              </div>
              <div 
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900"
                style={{ backgroundColor: STATUS_COLORS[user.status] }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs text-white truncate block">{user.displayName}</span>
            </div>
            <MessageSquare 
              size={12} 
              className="text-slate-500 group-hover:text-aura-400 opacity-0 group-hover:opacity-100 transition-opacity" 
            />
          </div>
        ))}

        {onlineUsers.length > 8 && (
          <div className="text-center text-xs text-slate-500 pt-1">
            +{onlineUsers.length - 8} more online
          </div>
        )}

        {onlineUsers.length === 0 && (
          <div className="text-center text-xs text-slate-500 py-4">
            No one online
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

interface PresenceIndicatorProps {
  status: UserStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showPulse?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

const STATUS_COLORS: Record<UserStatus, string> = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-slate-500',
};

const STATUS_LABELS: Record<UserStatus, string> = {
  online: 'Online',
  away: 'Away',
  busy: 'Do Not Disturb',
  offline: 'Offline',
};

export function PresenceIndicator({
  status,
  size = 'sm',
  showPulse = false,
  className,
}: PresenceIndicatorProps) {
  return (
    <span
      className={cn(
        'relative inline-flex rounded-full',
        SIZE_MAP[size],
        STATUS_COLORS[status],
        className
      )}
      title={STATUS_LABELS[status]}
    >
      {showPulse && status === 'online' && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      )}
    </span>
  );
}

interface UserAvatarProps {
  username: string;
  avatar?: string;
  status?: UserStatus;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  className?: string;
}

const AVATAR_SIZE_MAP = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const STATUS_POSITION_MAP = {
  sm: '-bottom-0.5 -right-0.5',
  md: '-bottom-0.5 -right-0.5',
  lg: '-bottom-1 -right-1',
  xl: '-bottom-1 -right-1',
};

const STATUS_SIZE_MAP = {
  sm: 'xs' as const,
  md: 'sm' as const,
  lg: 'md' as const,
  xl: 'lg' as const,
};

export function UserAvatar({
  username,
  avatar,
  status,
  size = 'md',
  showStatus = true,
  className,
}: UserAvatarProps) {
  const initial = username ? username[0].toUpperCase() : '?';

  return (
    <div className={cn('relative inline-flex', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-semibold bg-aura-600 text-white overflow-hidden',
          AVATAR_SIZE_MAP[size]
        )}
      >
        {avatar ? (
          <img
            src={avatar}
            alt={username}
            className="w-full h-full object-cover"
          />
        ) : (
          initial
        )}
      </div>
      {showStatus && status && (
        <div
          className={cn(
            'absolute border-2 border-slate-900 rounded-full',
            STATUS_POSITION_MAP[size]
          )}
        >
          <PresenceIndicator
            status={status}
            size={STATUS_SIZE_MAP[size]}
          />
        </div>
      )}
    </div>
  );
}

interface OnlineUsersListProps {
  users: Array<{
    userId: string;
    username: string;
    avatar?: string;
    status: UserStatus;
    activity?: string;
  }>;
  onUserClick?: (userId: string) => void;
  maxVisible?: number;
  compact?: boolean;
}

export function OnlineUsersList({
  users,
  onUserClick,
  maxVisible = 10,
  compact = false,
}: OnlineUsersListProps) {
  const onlineUsers = users.filter((u) => u.status === 'online');
  const awayUsers = users.filter((u) => u.status === 'away' || u.status === 'busy');
  const offlineUsers = users.filter((u) => u.status === 'offline');

  const renderUserGroup = (
    groupUsers: typeof users,
    label: string,
    opacity = 1
  ) => {
    if (groupUsers.length === 0) return null;

    const visibleUsers = groupUsers.slice(0, maxVisible);
    const remaining = groupUsers.length - maxVisible;

    return (
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2 px-2">
          {label} — {groupUsers.length}
        </h4>
        <div className={`space-y-1`} style={{ opacity }}>
          {visibleUsers.map((user) => (
            <button
              key={user.userId}
              onClick={() => onUserClick?.(user.userId)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-800 transition text-left',
                compact && 'py-1'
              )}
            >
              <UserAvatar
                username={user.username}
                avatar={user.avatar}
                status={user.status}
                size="sm"
              />
              {!compact && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{user.username}</p>
                  {user.activity && (
                    <p className="text-xs text-slate-500 truncate">{user.activity}</p>
                  )}
                </div>
              )}
            </button>
          ))}
          {remaining > 0 && (
            <p className="text-xs text-slate-500 px-2">+{remaining} more</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="py-2">
      {renderUserGroup(onlineUsers, 'Online')}
      {renderUserGroup(awayUsers, 'Away', 0.6)}
      {renderUserGroup(offlineUsers, 'Offline', 0.4)}
      {users.length === 0 && (
        <p className="text-sm text-slate-500 text-center py-4">No users</p>
      )}
    </div>
  );
}

interface PresenceAvatarStackProps {
  users: Array<{
    userId: string;
    username: string;
    avatar?: string;
    status: UserStatus;
  }>;
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function PresenceAvatarStack({
  users,
  maxVisible = 5,
  size = 'sm',
}: PresenceAvatarStackProps) {
  const visibleUsers = users.slice(0, maxVisible);
  const remaining = users.length - maxVisible;

  const overlapMap = {
    sm: '-ml-2',
    md: '-ml-3',
    lg: '-ml-4',
  };

  return (
    <div className="flex items-center">
      {visibleUsers.map((user, index) => (
        <div
          key={user.userId}
          className={cn(
            'relative ring-2 ring-slate-900 rounded-full',
            index > 0 && overlapMap[size]
          )}
          style={{ zIndex: visibleUsers.length - index }}
        >
          <UserAvatar
            username={user.username}
            avatar={user.avatar}
            status={user.status}
            size={size}
          />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-slate-700 text-white font-medium ring-2 ring-slate-900',
            overlapMap[size],
            AVATAR_SIZE_MAP[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

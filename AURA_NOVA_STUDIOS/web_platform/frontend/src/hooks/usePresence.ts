'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

export interface PresenceUser {
  userId: string;
  username: string;
  avatar?: string;
  status: UserStatus;
  activity?: string;
  lastSeen?: Date;
}

interface UsePresenceOptions {
  userId: string;
  username: string;
  avatar?: string;
  autoConnect?: boolean;
  idleTimeout?: number; // ms before setting status to 'away'
  wsUrl?: string;
}

interface UsePresenceReturn {
  isConnected: boolean;
  currentStatus: UserStatus;
  onlineUsers: PresenceUser[];
  setStatus: (status: UserStatus) => void;
  setActivity: (activity: string) => void;
  connect: () => void;
  disconnect: () => void;
}

export function usePresence({
  userId,
  username,
  avatar,
  autoConnect = true,
  idleTimeout = 5 * 60 * 1000, // 5 minutes
  wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002',
}: UsePresenceOptions): UsePresenceReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<UserStatus>('offline');
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousStatusRef = useRef<UserStatus>('online');

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (currentStatus === 'away' && previousStatusRef.current === 'online') {
      // User is back from being away
      setStatus('online');
    }

    idleTimerRef.current = setTimeout(() => {
      if (currentStatus === 'online') {
        previousStatusRef.current = 'online';
        setStatus('away');
      }
    }, idleTimeout);
  }, [currentStatus, idleTimeout]);

  const setStatus = useCallback(
    (status: UserStatus) => {
      setCurrentStatus(status);
      if (socket?.connected) {
        socket.emit('presence:update', { status });
      }
    },
    [socket]
  );

  const setActivity = useCallback(
    (activity: string) => {
      if (socket?.connected) {
        socket.emit('presence:update', { activity });
      }
    },
    [socket]
  );

  const connect = useCallback(() => {
    if (socket?.connected) return;

    const newSocket = io(wsUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('[Presence] Connected');
      setIsConnected(true);
      setCurrentStatus('online');

      // Authenticate
      newSocket.emit('auth:login', { userId, username, avatar });
    });

    newSocket.on('disconnect', () => {
      console.log('[Presence] Disconnected');
      setIsConnected(false);
      setCurrentStatus('offline');
    });

    newSocket.on('presence:list', (users: PresenceUser[]) => {
      setOnlineUsers(users);
    });

    newSocket.on('presence:update', (user: Partial<PresenceUser> & { userId: string }) => {
      setOnlineUsers((prev) => {
        const existing = prev.find((u) => u.userId === user.userId);
        if (existing) {
          return prev.map((u) =>
            u.userId === user.userId ? { ...u, ...user } : u
          );
        } else if (user.status && user.status !== 'offline') {
          return [...prev, user as PresenceUser];
        }
        return prev.filter((u) => u.userId !== user.userId);
      });
    });

    setSocket(newSocket);
  }, [wsUrl, userId, username, avatar]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setCurrentStatus('offline');
    }
  }, [socket]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]);

  // Idle detection
  useEffect(() => {
    if (!isConnected) return;

    const events = ['mousedown', 'keydown', 'touchstart', 'mousemove', 'scroll'];
    
    const handleActivity = () => {
      resetIdleTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Start initial timer
    resetIdleTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [isConnected, resetIdleTimer]);

  // Handle page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (currentStatus === 'online') {
          previousStatusRef.current = 'online';
          setStatus('away');
        }
      } else {
        if (previousStatusRef.current === 'online') {
          setStatus('online');
        }
        resetIdleTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentStatus, setStatus, resetIdleTimer]);

  // Handle page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket?.connected) {
        socket.emit('presence:update', { status: 'offline' });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [socket]);

  return {
    isConnected,
    currentStatus,
    onlineUsers,
    setStatus,
    setActivity,
    connect,
    disconnect,
  };
}

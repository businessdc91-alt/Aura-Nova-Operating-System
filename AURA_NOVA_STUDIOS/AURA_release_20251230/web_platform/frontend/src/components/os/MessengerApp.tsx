'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  MessageSquare,
  Send,
  Hash,
  Users,
  Plus,
  Search,
  Smile,
  Circle,
  AtSign,
  Reply,
  X,
  User,
  ChevronLeft,
} from 'lucide-react';
import { UserAvatar, PresenceIndicator, UserStatus } from '@/components/presence/PresenceIndicator';

// ==========================================================
// TYPES
// ==========================================================

interface ChatUser {
  userId: string;
  username: string;
  avatar?: string;
  status: UserStatus;
  activity?: string;
}

interface ChatMessage {
  id: string;
  channelId: string;
  userId: string;
  username: string;
  avatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  reactions?: { emoji: string; users: string[] }[];
  edited?: boolean;
  replyTo?: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'dm';
  members: string[];
  createdBy: string;
  description?: string;
  icon?: string;
  unreadCount?: number;
}

interface TypingUser {
  userId: string;
  username: string;
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '💯'];

// ==========================================================
// MESSENGER APP COMPONENT (for OS windowed mode)
// ==========================================================

export const MessengerApp: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'channels' | 'chat' | 'users'>('channels');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Demo user (replace with auth)
  const currentUser = useRef({
    userId: 'user_' + Math.random().toString(36).substr(2, 9),
    username: 'Catalyst_' + Math.floor(Math.random() * 1000),
  }).current;

  // Connect to WebSocket
  useEffect(() => {
    const ws = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002', {
      transports: ['websocket', 'polling'],
    });

    ws.on('connect', () => {
      setIsConnected(true);
      ws.emit('auth:login', currentUser);
    });

    ws.on('disconnect', () => setIsConnected(false));

    ws.on('channels:list', (list: Channel[]) => {
      setChannels(list);
    });

    ws.on('channels:new', (ch: Channel) => {
      setChannels((prev) => [...prev, ch]);
    });

    ws.on('channel:history', (data: { channelId: string; messages: ChatMessage[] }) => {
      if (activeChannel?.id === data.channelId) {
        setMessages(data.messages);
      }
    });

    ws.on('message:new', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    ws.on('message:edited', (msg: ChatMessage) => {
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
    });

    ws.on('message:deleted', ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    });

    ws.on('message:reacted', ({ messageId, reactions }: any) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
      );
    });

    ws.on('presence:list', (users: ChatUser[]) => setOnlineUsers(users));

    ws.on('presence:update', (user: Partial<ChatUser> & { userId: string }) => {
      setOnlineUsers((prev) => {
        const exists = prev.find((u) => u.userId === user.userId);
        if (exists) {
          return prev.map((u) => (u.userId === user.userId ? { ...u, ...user } : u));
        } else if (user.status !== 'offline') {
          return [...prev, user as ChatUser];
        }
        return prev.filter((u) => u.userId !== user.userId);
      });
    });

    ws.on('typing:update', (data: { channelId: string; users: TypingUser[] }) => {
      if (activeChannel?.id === data.channelId) {
        setTypingUsers(data.users.filter((u) => u.userId !== currentUser.userId));
      }
    });

    ws.on('dm:opened', ({ channelId }: { channelId: string }) => {
      const dmChannel = channels.find((c) => c.id === channelId);
      if (dmChannel) {
        setActiveChannel(dmChannel);
        setView('chat');
      }
    });

    setSocket(ws);
    return () => {
      ws.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinChannel = (channel: Channel) => {
    if (socket && activeChannel?.id !== channel.id) {
      if (activeChannel) socket.emit('channel:leave', activeChannel.id);
      socket.emit('channel:join', channel.id);
      setActiveChannel(channel);
      setMessages([]);
      setTypingUsers([]);
      setView('chat');
    }
  };

  const startDM = (targetUserId: string) => {
    if (socket) {
      socket.emit('dm:start', targetUserId);
      setView('chat');
    }
  };

  const sendMessage = () => {
    if (!socket || !activeChannel || !messageInput.trim()) return;
    socket.emit('message:send', {
      channelId: activeChannel.id,
      content: messageInput,
      type: 'text',
      replyTo: replyingTo?.id,
    });
    setReplyingTo(null);
    setMessageInput('');
    socket.emit('typing:stop', activeChannel.id);
  };

  const handleTyping = (value: string) => {
    setMessageInput(value);
    if (!socket || !activeChannel) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (value.trim()) {
      socket.emit('typing:start', activeChannel.id);
      typingTimeoutRef.current = setTimeout(() => socket.emit('typing:stop', activeChannel.id), 2000);
    } else {
      socket.emit('typing:stop', activeChannel.id);
    }
  };

  const reactToMessage = (messageId: string, emoji: string) => {
    if (socket && activeChannel) {
      socket.emit('message:react', { messageId, channelId: activeChannel.id, emoji });
    }
    setShowEmojiPicker(null);
  };

  const formatTime = (date: Date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const publicChannels = channels.filter((c) => c.type === 'public');
  const dmChannels = channels.filter((c) => c.type === 'dm');

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="h-full flex bg-slate-950 text-white overflow-hidden">
      {/* Sidebar */}
      <div className={`w-64 border-r border-slate-800 flex flex-col bg-slate-900 ${view === 'chat' ? 'hidden sm:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            Messenger
          </h2>
          <div className="flex items-center gap-1">
            <Circle className={`w-2 h-2 ${isConnected ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`} />
          </div>
        </div>

        {/* Search */}
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg bg-slate-800 border border-slate-700 focus:border-purple-500 outline-none"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 text-xs">
          <button onClick={() => setView('channels')} className={`flex-1 py-2 ${view === 'channels' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-400'}`}>
            <Hash className="w-4 h-4 mx-auto" />
          </button>
          <button onClick={() => setView('users')} className={`flex-1 py-2 ${view === 'users' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-400'}`}>
            <Users className="w-4 h-4 mx-auto" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex-1 overflow-y-auto">
          {view !== 'chat' && view === 'channels' && (
            <>
              <div className="px-2 py-2">
                <p className="text-[10px] uppercase text-slate-500 px-2 mb-1">Channels</p>
                {publicChannels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => joinChannel(ch)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm ${activeChannel?.id === ch.id ? 'bg-purple-600' : 'hover:bg-slate-800'}`}
                  >
                    <span>{ch.icon || '#'}</span>
                    <span className="truncate">{ch.name}</span>
                  </button>
                ))}
              </div>
              <div className="px-2 py-2 border-t border-slate-800">
                <p className="text-[10px] uppercase text-slate-500 px-2 mb-1">Direct Messages</p>
                {dmChannels.length === 0 && <p className="text-xs text-slate-600 px-2">No DMs yet</p>}
                {dmChannels.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => joinChannel(ch)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm ${activeChannel?.id === ch.id ? 'bg-purple-600' : 'hover:bg-slate-800'}`}
                  >
                    <User className="w-4 h-4" />
                    <span className="truncate">{ch.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {view === 'users' && (
            <div className="px-2 py-2">
              <p className="text-[10px] uppercase text-slate-500 px-2 mb-1">Online Users</p>
              {onlineUsers.map((u) => (
                <button
                  key={u.userId}
                  onClick={() => startDM(u.userId)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm hover:bg-slate-800"
                >
                  <UserAvatar username={u.username} avatar={u.avatar} status={u.status} size="sm" />
                  <span className="truncate">{u.username}</span>
                </button>
              ))}
              {onlineUsers.length === 0 && <p className="text-xs text-slate-600 px-2">No one online</p>}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${view !== 'chat' && 'hidden sm:flex'}`}>
        {activeChannel ? (
          <>
            {/* Chat Header */}
            <div className="h-12 px-3 flex items-center gap-2 border-b border-slate-800 bg-slate-900/50">
              <button onClick={() => setView('channels')} className="sm:hidden p-1 hover:bg-slate-800 rounded">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-lg">{activeChannel.icon || '#'}</span>
              <span className="font-medium">{activeChannel.name}</span>
              {activeChannel.description && <span className="text-xs text-slate-500 hidden sm:inline">— {activeChannel.description}</span>}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-2 group">
                  <UserAvatar username={msg.username} avatar={msg.avatar} size="sm" showStatus={false} />
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-sm">{msg.username}</span>
                      <span className="text-[10px] text-slate-500">{formatTime(msg.timestamp)}</span>
                      {msg.edited && <span className="text-[10px] text-slate-600">(edited)</span>}
                    </div>
                    {msg.replyTo && (
                      <div className="text-xs text-slate-500 italic mb-0.5">↪ replying to a message</div>
                    )}
                    <p className="text-sm text-slate-200">{msg.content}</p>
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {msg.reactions.map((r) => (
                          <button
                            key={r.emoji}
                            onClick={() => reactToMessage(msg.id, r.emoji)}
                            className="text-xs px-1.5 py-0.5 bg-slate-800 rounded-full hover:bg-slate-700"
                          >
                            {r.emoji} {r.users.length}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1 text-slate-500">
                    <button onClick={() => setReplyingTo(msg)} className="p-1 hover:text-white">
                      <Reply className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowEmojiPicker(showEmojiPicker === msg.id ? null : msg.id)} className="p-1 hover:text-white">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                  {showEmojiPicker === msg.id && (
                    <div className="absolute mt-6 bg-slate-800 rounded-lg p-2 flex gap-1 z-50 shadow-xl border border-slate-700">
                      {EMOJI_REACTIONS.map((e) => (
                        <button key={e} onClick={() => reactToMessage(msg.id, e)} className="text-lg hover:scale-125 transition-transform">
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div className="px-3 py-1 text-xs text-slate-400">
                {typingUsers.map((u) => u.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            {/* Reply bar */}
            {replyingTo && (
              <div className="px-3 py-1 bg-slate-800/50 flex items-center justify-between text-xs text-slate-400">
                <span>Replying to {replyingTo.username}</span>
                <button onClick={() => setReplyingTo(null)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input */}
            <div className="p-2 border-t border-slate-800 bg-slate-900/50">
              <div className="flex gap-2">
                <input
                  value={messageInput}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={`Message #${activeChannel.name}`}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 focus:border-purple-500 outline-none text-sm"
                />
                <button onClick={sendMessage} className="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Select a channel or start a DM</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessengerApp;

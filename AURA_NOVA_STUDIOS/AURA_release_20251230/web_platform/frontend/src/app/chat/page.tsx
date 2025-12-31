'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Send,
  Hash,
  Users,
  Settings,
  Plus,
  Search,
  Smile,
  Paperclip,
  MoreVertical,
  AtSign,
  Reply,
  Trash2,
  Edit3,
  Pin,
  Bell,
  BellOff,
  Circle,
  LogOut,
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';

// ============== TYPES ==============
interface User {
  userId: string;
  username: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
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

const STATUS_COLORS = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-slate-500',
};

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '💯'];

export default function ChatPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserList, setShowUserList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Demo user (in production, get from auth)
  const currentUser = {
    userId: 'user_' + Math.random().toString(36).substr(2, 9),
    username: 'Catalyst_' + Math.floor(Math.random() * 1000),
    avatar: undefined,
  };

  useEffect(() => {
    // Connect to WebSocket server
    const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3002', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('[Chat] Connected to WebSocket');
      setIsConnected(true);

      // Authenticate
      newSocket.emit('auth:login', currentUser);
    });

    newSocket.on('disconnect', () => {
      console.log('[Chat] Disconnected from WebSocket');
      setIsConnected(false);
    });

    // Channel events
    newSocket.on('channels:list', (channelList: Channel[]) => {
      setChannels(channelList);
      if (channelList.length > 0 && !activeChannel) {
        const general = channelList.find((c) => c.id === 'general');
        if (general) {
          setActiveChannel(general);
          newSocket.emit('channel:join', general.id);
        }
      }
    });

    newSocket.on('channels:new', (channel: Channel) => {
      setChannels((prev) => [...prev, channel]);
    });

    newSocket.on('channel:history', (data: { channelId: string; messages: ChatMessage[] }) => {
      if (activeChannel?.id === data.channelId) {
        setMessages(data.messages);
      }
    });

    // Message events
    newSocket.on('message:new', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('message:edited', (message: ChatMessage) => {
      setMessages((prev) => prev.map((m) => (m.id === message.id ? message : m)));
    });

    newSocket.on('message:deleted', (data: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
    });

    newSocket.on('message:reacted', (data: { messageId: string; reactions: any[] }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === data.messageId ? { ...m, reactions: data.reactions } : m))
      );
    });

    // Presence events
    newSocket.on('presence:list', (users: User[]) => {
      setOnlineUsers(users);
    });

    newSocket.on('presence:update', (user: Partial<User>) => {
      setOnlineUsers((prev) => {
        const existing = prev.find((u) => u.userId === user.userId);
        if (existing) {
          return prev.map((u) => (u.userId === user.userId ? { ...u, ...user } : u));
        } else if (user.status === 'online') {
          return [...prev, user as User];
        }
        return prev.filter((u) => u.userId !== user.userId);
      });
    });

    // Typing events
    newSocket.on('typing:update', (data: { channelId: string; users: TypingUser[] }) => {
      if (activeChannel?.id === data.channelId) {
        setTypingUsers(data.users.filter((u) => u.userId !== currentUser.userId));
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinChannel = (channel: Channel) => {
    if (socket && activeChannel?.id !== channel.id) {
      if (activeChannel) {
        socket.emit('channel:leave', activeChannel.id);
      }
      socket.emit('channel:join', channel.id);
      setActiveChannel(channel);
      setMessages([]);
      setTypingUsers([]);
    }
  };

  const sendMessage = () => {
    if (!socket || !activeChannel || !messageInput.trim()) return;

    if (editingMessage) {
      socket.emit('message:edit', {
        messageId: editingMessage.id,
        channelId: activeChannel.id,
        content: messageInput,
      });
      setEditingMessage(null);
    } else {
      socket.emit('message:send', {
        channelId: activeChannel.id,
        content: messageInput,
        type: 'text',
        replyTo: replyingTo?.id,
      });
      setReplyingTo(null);
    }

    setMessageInput('');
    socket.emit('typing:stop', activeChannel.id);
  };

  const handleTyping = (value: string) => {
    setMessageInput(value);

    if (!socket || !activeChannel) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.trim()) {
      socket.emit('typing:start', activeChannel.id);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', activeChannel.id);
      }, 2000);
    } else {
      socket.emit('typing:stop', activeChannel.id);
    }
  };

  const deleteMessage = (message: ChatMessage) => {
    if (socket && activeChannel && message.userId === currentUser.userId) {
      socket.emit('message:delete', {
        messageId: message.id,
        channelId: activeChannel.id,
      });
    }
  };

  const reactToMessage = (messageId: string, emoji: string) => {
    if (socket && activeChannel) {
      socket.emit('message:react', {
        messageId,
        channelId: activeChannel.id,
        emoji,
      });
    }
    setShowEmojiPicker(null);
  };

  const createChannel = () => {
    const name = prompt('Channel name:');
    if (name && socket) {
      socket.emit('channel:create', {
        name,
        type: 'public',
        description: 'User-created channel',
      });
    }
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = '';

    messages.forEach((msg) => {
      const date = formatDate(msg.timestamp);
      if (date !== currentDate) {
        currentDate = date;
        groups.push({ date, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  };

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen bg-slate-950 flex overflow-hidden">
      {/* Sidebar - Channels */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare size={24} className="text-aura-500" />
            Chat
          </h1>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search channels..."
              className="pl-9 bg-slate-800 border-slate-700 text-white text-sm"
            />
          </div>
        </div>

        {/* Connection Status */}
        <div className="px-4 py-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Circle
              size={8}
              className={isConnected ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}
            />
            <span className="text-xs text-slate-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-2 py-3">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Channels</span>
              <button onClick={createChannel} className="text-slate-400 hover:text-white">
                <Plus size={16} />
              </button>
            </div>

            {filteredChannels
              .filter((c) => c.type !== 'dm')
              .map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => joinChannel(channel)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition ${
                    activeChannel?.id === channel.id
                      ? 'bg-aura-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">{channel.icon || '#'}</span>
                  <span className="flex-1 truncate">{channel.name}</span>
                  {channel.unreadCount && channel.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {channel.unreadCount}
                    </span>
                  )}
                </button>
              ))}
          </div>

          {/* Direct Messages */}
          <div className="px-2 py-3 border-t border-slate-800">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Direct Messages</span>
            </div>
            {filteredChannels
              .filter((c) => c.type === 'dm')
              .map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => joinChannel(channel)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition ${
                    activeChannel?.id === channel.id
                      ? 'bg-aura-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Circle size={8} className="fill-green-500 text-green-500" />
                  <span className="truncate">{channel.name}</span>
                </button>
              ))}
            {filteredChannels.filter((c) => c.type === 'dm').length === 0 && (
              <p className="text-slate-500 text-xs px-3">No direct messages</p>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-8 h-8 bg-aura-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {currentUser.username[0]}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{currentUser.username}</p>
              <p className="text-xs text-green-400">Online</p>
            </div>
            <button className="text-slate-400 hover:text-white">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChannel ? (
          <>
            {/* Channel Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center gap-3">
                <span className="text-xl">{activeChannel.icon || <Hash size={20} />}</span>
                <div>
                  <h2 className="font-semibold text-white">{activeChannel.name}</h2>
                  {activeChannel.description && (
                    <p className="text-xs text-slate-400">{activeChannel.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowUserList(!showUserList)}
                  className={`p-2 rounded ${showUserList ? 'bg-slate-700' : ''} text-slate-400 hover:text-white`}
                >
                  <Users size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 flex">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {groupMessagesByDate(messages).map((group) => (
                  <div key={group.date}>
                    <div className="flex items-center gap-4 my-4">
                      <div className="flex-1 h-px bg-slate-800" />
                      <span className="text-xs text-slate-500 font-semibold">{group.date}</span>
                      <div className="flex-1 h-px bg-slate-800" />
                    </div>

                    {group.messages.map((message) => (
                      <div
                        key={message.id}
                        className="group flex gap-3 hover:bg-slate-900/50 -mx-2 px-2 py-1 rounded"
                      >
                        <div className="w-10 h-10 bg-aura-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {message.avatar ? (
                            <img src={message.avatar} alt="" className="w-full h-full rounded-full" />
                          ) : (
                            message.username[0].toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{message.username}</span>
                            <span className="text-xs text-slate-500">{formatTime(message.timestamp)}</span>
                            {message.edited && (
                              <span className="text-xs text-slate-500">(edited)</span>
                            )}
                          </div>

                          {message.replyTo && (
                            <div className="text-xs text-slate-400 mb-1 pl-2 border-l-2 border-slate-600">
                              Replying to a message
                            </div>
                          )}

                          <p className="text-slate-200 break-words">{message.content}</p>

                          {/* Reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {message.reactions.map((reaction) => (
                                <button
                                  key={reaction.emoji}
                                  onClick={() => reactToMessage(message.id, reaction.emoji)}
                                  className={`px-2 py-0.5 rounded-full text-sm ${
                                    reaction.users.includes(currentUser.userId)
                                      ? 'bg-aura-600/30 border border-aura-500'
                                      : 'bg-slate-800 border border-slate-700'
                                  }`}
                                >
                                  {reaction.emoji} {reaction.users.length}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Message Actions */}
                        <div className="opacity-0 group-hover:opacity-100 flex items-start gap-1">
                          <button
                            onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                          >
                            <Smile size={16} />
                          </button>
                          <button
                            onClick={() => setReplyingTo(message)}
                            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                          >
                            <Reply size={16} />
                          </button>
                          {message.userId === currentUser.userId && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingMessage(message);
                                  setMessageInput(message.content);
                                }}
                                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => deleteMessage(message)}
                                className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}

                          {/* Emoji Picker */}
                          {showEmojiPicker === message.id && (
                            <div className="absolute mt-6 bg-slate-800 border border-slate-700 rounded-lg p-2 flex gap-1 z-10">
                              {EMOJI_REACTIONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => reactToMessage(message.id, emoji)}
                                  className="p-1 hover:bg-slate-700 rounded text-lg"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}

                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <Hash size={48} className="mb-4 opacity-50" />
                    <p>Welcome to #{activeChannel.name}</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Users Sidebar */}
              {showUserList && (
                <div className="w-60 border-l border-slate-800 bg-slate-900/50 overflow-y-auto">
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">
                      Online — {onlineUsers.filter((u) => u.status === 'online').length}
                    </h3>
                    {onlineUsers
                      .filter((u) => u.status === 'online')
                      .map((user) => (
                        <div
                          key={user.userId}
                          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 cursor-pointer"
                        >
                          <div className="relative">
                            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white text-sm">
                              {user.username[0]}
                            </div>
                            <div
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${STATUS_COLORS[user.status]} rounded-full border-2 border-slate-900`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">{user.username}</p>
                            {user.activity && (
                              <p className="text-xs text-slate-500 truncate">{user.activity}</p>
                            )}
                          </div>
                        </div>
                      ))}

                    {onlineUsers.filter((u) => u.status !== 'online' && u.status !== 'offline').length > 0 && (
                      <>
                        <h3 className="text-xs font-semibold text-slate-400 uppercase mt-4 mb-2">
                          Away
                        </h3>
                        {onlineUsers
                          .filter((u) => u.status !== 'online' && u.status !== 'offline')
                          .map((user) => (
                            <div
                              key={user.userId}
                              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-800 cursor-pointer opacity-60"
                            >
                              <div className="relative">
                                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white text-sm">
                                  {user.username[0]}
                                </div>
                                <div
                                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${STATUS_COLORS[user.status]} rounded-full border-2 border-slate-900`}
                                />
                              </div>
                              <span className="text-sm text-white truncate">{user.username}</span>
                            </div>
                          ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="px-4 py-1 text-sm text-slate-400">
                {typingUsers.map((u) => u.username).join(', ')}{' '}
                {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            {/* Reply/Edit Banner */}
            {(replyingTo || editingMessage) && (
              <div className="px-4 py-2 bg-slate-800 border-t border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  {replyingTo && (
                    <>
                      <Reply size={16} className="text-aura-400" />
                      <span className="text-slate-400">Replying to</span>
                      <span className="text-white font-semibold">{replyingTo.username}</span>
                    </>
                  )}
                  {editingMessage && (
                    <>
                      <Edit3 size={16} className="text-yellow-400" />
                      <span className="text-slate-400">Editing message</span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setEditingMessage(null);
                    setMessageInput('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-4 py-2">
                <button className="text-slate-400 hover:text-white">
                  <Plus size={20} />
                </button>
                <Input
                  value={messageInput}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={`Message #${activeChannel.name}`}
                  className="flex-1 bg-transparent border-none text-white placeholder-slate-500 focus:ring-0"
                />
                <button className="text-slate-400 hover:text-white">
                  <Smile size={20} />
                </button>
                <Button onClick={sendMessage} size="sm" className="bg-aura-600 hover:bg-aura-700">
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a channel to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

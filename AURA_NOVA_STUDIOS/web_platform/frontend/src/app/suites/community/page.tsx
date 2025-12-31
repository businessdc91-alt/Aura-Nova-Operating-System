'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { DailyChallengeWidget, WalletDisplay } from '@/components/challenges/DailyChallengeWidget';
import {
  MessageCircle,
  Users,
  Hash,
  Send,
  Plus,
  Settings,
  Bell,
  Search,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Paperclip,
  Image as ImageIcon,
  Mic,
  AtSign,
  Pin,
  Star,
  UserPlus,
  Shield,
  Crown,
  Circle,
  CheckCircle,
  Clock,
  X,
  ChevronDown,
  Volume2,
  VolumeX,
  Bookmark,
  Flag,
  Copy,
  Trash2,
  Edit,
  Reply,
  Heart,
  ThumbsUp,
  Laugh,
  Frown,
  Angry,
  PartyPopper,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Zap,
  Sparkles,
} from 'lucide-react';

// ============================================================================
// COMMUNITY SUITE - CHAT & SOCIAL FEATURES
// ============================================================================
// Includes:
// - Real-time Chat (channels, DMs, threads)
// - Community Directory (find creators, teams)
// - Forums & Discussions
// - Voice/Video Rooms (UI ready)
// - Events & Announcements
// - Moderation Tools
// ============================================================================

// ================== TYPES ==================
interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  role: 'admin' | 'moderator' | 'member' | 'guest';
  badges: string[];
  bio?: string;
}

interface Message {
  id: string;
  content: string;
  author: User;
  timestamp: Date;
  reactions: { emoji: string; count: number; users: string[] }[];
  attachments?: { type: string; url: string; name: string }[];
  replyTo?: Message;
  isPinned?: boolean;
  isEdited?: boolean;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'voice' | 'announcement' | 'forum';
  isPrivate: boolean;
  unreadCount: number;
  members: number;
  lastMessage?: Message;
}

interface Thread {
  id: string;
  title: string;
  author: User;
  createdAt: Date;
  replies: number;
  views: number;
  isPinned: boolean;
  tags: string[];
  lastActivity: Date;
}

// ================== DEMO DATA ==================
const DEMO_USERS: User[] = [
  { id: '1', username: 'aura_admin', displayName: 'Aura Admin', avatar: '👑', status: 'online', role: 'admin', badges: ['founder', 'verified'], bio: 'Platform creator' },
  { id: '2', username: 'pixel_master', displayName: 'PixelMaster', avatar: '🎨', status: 'online', role: 'moderator', badges: ['artist', 'helper'], bio: '2D artist and animator' },
  { id: '3', username: 'code_wizard', displayName: 'CodeWizard', avatar: '🧙', status: 'away', role: 'member', badges: ['developer'], bio: 'Full-stack developer' },
  { id: '4', username: 'game_dev_pro', displayName: 'GameDevPro', avatar: '🎮', status: 'busy', role: 'member', badges: ['creator'], bio: 'Indie game developer' },
  { id: '5', username: 'music_maker', displayName: 'MusicMaker', avatar: '🎵', status: 'offline', role: 'member', badges: ['composer'], bio: 'Game audio specialist' },
];

const DEMO_CHANNELS: Channel[] = [
  { id: '1', name: 'general', description: 'General discussion for all members', type: 'text', isPrivate: false, unreadCount: 3, members: 1247 },
  { id: '2', name: 'introductions', description: 'Introduce yourself to the community', type: 'text', isPrivate: false, unreadCount: 0, members: 1247 },
  { id: '3', name: 'showcase', description: 'Share your creations and get feedback', type: 'text', isPrivate: false, unreadCount: 12, members: 892 },
  { id: '4', name: 'help-desk', description: 'Get help with tools and projects', type: 'text', isPrivate: false, unreadCount: 5, members: 756 },
  { id: '5', name: 'announcements', description: 'Official platform announcements', type: 'announcement', isPrivate: false, unreadCount: 1, members: 1247 },
  { id: '6', name: 'voice-lounge', description: 'Hang out and chat with voice', type: 'voice', isPrivate: false, unreadCount: 0, members: 23 },
  { id: '7', name: 'dev-talk', description: 'Programming discussions', type: 'forum', isPrivate: false, unreadCount: 8, members: 534 },
  { id: '8', name: 'moderators', description: 'Mod-only channel', type: 'text', isPrivate: true, unreadCount: 2, members: 12 },
];

// ================== CHAT COMPONENT ==================
function ChatArea() {
  const [channels] = useState<Channel[]>(DEMO_CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState<Channel>(DEMO_CHANNELS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showMembers, setShowMembers] = useState(true);
  const [onlineUsers] = useState<User[]>(DEMO_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser: User = DEMO_USERS[0];

  useEffect(() => {
    // Demo messages when channel changes
    setMessages([
      {
        id: '1',
        content: `Welcome to #${selectedChannel.name}! 👋`,
        author: DEMO_USERS[0],
        timestamp: new Date(Date.now() - 3600000),
        reactions: [{ emoji: '👋', count: 5, users: ['2', '3', '4', '5'] }],
      },
      {
        id: '2',
        content: 'Hey everyone! Just finished my new pixel art sprite sheet. Check it out in #showcase!',
        author: DEMO_USERS[1],
        timestamp: new Date(Date.now() - 1800000),
        reactions: [{ emoji: '🔥', count: 3, users: ['1', '3', '4'] }],
      },
      {
        id: '3',
        content: 'Anyone here worked with the Dojo templates for Unreal? I need help with the inventory system.',
        author: DEMO_USERS[3],
        timestamp: new Date(Date.now() - 900000),
        reactions: [],
      },
      {
        id: '4',
        content: 'Yeah I have! The templates are super solid. What specific issue are you running into?',
        author: DEMO_USERS[2],
        timestamp: new Date(Date.now() - 600000),
        reactions: [{ emoji: '👍', count: 1, users: ['4'] }],
      },
    ]);
  }, [selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput,
      author: currentUser,
      timestamp: new Date(),
      reactions: [],
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
    toast.success('Message sent!');
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map((msg) => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
        if (existingReaction) {
          existingReaction.count++;
          existingReaction.users.push(currentUser.id);
        } else {
          msg.reactions.push({ emoji, count: 1, users: [currentUser.id] });
        }
      }
      return msg;
    }));
  };

  const quickEmojis = ['👍', '❤️', '😂', '🔥', '👀', '🎉'];

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="grid grid-cols-[250px_1fr_250px] h-[700px] gap-0 bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
      {/* Channels Sidebar */}
      <div className="bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-3 border-b border-slate-800">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Sparkles size={18} className="text-aura-400" />
            AuraNova Studios
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Text Channels */}
          <div>
            <p className="text-xs text-slate-500 px-2 mb-1 flex items-center justify-between">
              <span>TEXT CHANNELS</span>
              <Plus size={14} className="cursor-pointer hover:text-white" />
            </p>
            {channels.filter(c => c.type === 'text').map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition ${
                  selectedChannel.id === channel.id
                    ? 'bg-aura-600/30 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {channel.isPrivate ? <Lock size={16} /> : <Hash size={16} />}
                <span className="flex-1 text-left truncate">{channel.name}</span>
                {channel.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">
                    {channel.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Voice Channels */}
          <div>
            <p className="text-xs text-slate-500 px-2 mb-1">VOICE CHANNELS</p>
            {channels.filter(c => c.type === 'voice').map((channel) => (
              <button
                key={channel.id}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <Volume2 size={16} />
                <span className="flex-1 text-left">{channel.name}</span>
                <span className="text-xs text-slate-500">{channel.members}</span>
              </button>
            ))}
          </div>

          {/* Forums */}
          <div>
            <p className="text-xs text-slate-500 px-2 mb-1">FORUMS</p>
            {channels.filter(c => c.type === 'forum').map((channel) => (
              <button
                key={channel.id}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <MessageCircle size={16} />
                <span className="flex-1 text-left">{channel.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User Panel */}
        <div className="p-2 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 cursor-pointer">
            <div className="relative">
              <span className="text-2xl">{currentUser.avatar}</span>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${getStatusColor(currentUser.status)}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{currentUser.displayName}</p>
              <p className="text-xs text-slate-400">Online</p>
            </div>
            <Settings size={16} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col">
        {/* Channel Header */}
        <div className="h-12 px-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash size={20} className="text-slate-400" />
            <span className="text-white font-semibold">{selectedChannel.name}</span>
            <span className="text-slate-500 text-sm hidden md:block">|</span>
            <span className="text-slate-400 text-sm hidden md:block truncate max-w-[300px]">
              {selectedChannel.description}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-slate-400">
              <Bell size={18} />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-400">
              <Pin size={18} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400"
              onClick={() => setShowMembers(!showMembers)}
            >
              <Users size={18} />
            </Button>
            <div className="relative">
              <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search"
                className="w-40 h-7 pl-8 bg-slate-800 border-slate-700 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="group flex gap-3 hover:bg-slate-800/50 p-2 rounded -mx-2">
              <div className="relative flex-shrink-0">
                <span className="text-2xl">{message.author.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className={`font-semibold ${
                    message.author.role === 'admin' ? 'text-amber-400' :
                    message.author.role === 'moderator' ? 'text-green-400' : 'text-white'
                  }`}>
                    {message.author.displayName}
                  </span>
                  {message.author.badges.includes('verified') && (
                    <CheckCircle size={14} className="text-blue-400" />
                  )}
                  <span className="text-xs text-slate-500">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.isEdited && (
                    <span className="text-xs text-slate-500">(edited)</span>
                  )}
                </div>
                <p className="text-slate-200 break-words">{message.content}</p>

                {/* Reactions */}
                {message.reactions.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {message.reactions.map((reaction, idx) => (
                      <button
                        key={idx}
                        className="flex items-center gap-1 px-2 py-0.5 bg-slate-700 rounded-full text-sm hover:bg-slate-600"
                      >
                        <span>{reaction.emoji}</span>
                        <span className="text-slate-300">{reaction.count}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => setShowEmojiPicker(true)}
                      className="px-2 py-0.5 bg-slate-700 rounded-full text-sm hover:bg-slate-600 text-slate-400"
                    >
                      +
                    </button>
                  </div>
                )}

                {/* Quick Actions (on hover) */}
                <div className="hidden group-hover:flex items-center gap-1 absolute right-4 -mt-8 bg-slate-800 rounded border border-slate-700 p-1">
                  {quickEmojis.slice(0, 3).map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addReaction(message.id, emoji)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                  <button className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded text-slate-400">
                    <Reply size={14} />
                  </button>
                  <button className="w-7 h-7 flex items-center justify-center hover:bg-slate-700 rounded text-slate-400">
                    <MoreVertical size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-2">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <Plus size={20} />
            </Button>
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={`Message #${selectedChannel.name}`}
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-slate-500"
            />
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <Smile size={20} />
            </Button>
            <Button
              onClick={sendMessage}
              disabled={!messageInput.trim()}
              size="sm"
              className="bg-aura-600 hover:bg-aura-700"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Members Sidebar */}
      {showMembers && (
        <div className="bg-slate-950 border-l border-slate-800 overflow-y-auto">
          <div className="p-3">
            <p className="text-xs text-slate-500 mb-2">ONLINE — {onlineUsers.filter(u => u.status !== 'offline').length}</p>
            {onlineUsers.filter(u => u.status !== 'offline').map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 cursor-pointer"
              >
                <div className="relative">
                  <span className="text-xl">{user.avatar}</span>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${getStatusColor(user.status)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${
                    user.role === 'admin' ? 'text-amber-400' :
                    user.role === 'moderator' ? 'text-green-400' : 'text-white'
                  }`}>
                    {user.displayName}
                  </p>
                  {user.bio && (
                    <p className="text-xs text-slate-500 truncate">{user.bio}</p>
                  )}
                </div>
                {user.role === 'admin' && <Crown size={14} className="text-amber-400" />}
                {user.role === 'moderator' && <Shield size={14} className="text-green-400" />}
              </div>
            ))}

            <p className="text-xs text-slate-500 mt-4 mb-2">OFFLINE — {onlineUsers.filter(u => u.status === 'offline').length}</p>
            {onlineUsers.filter(u => u.status === 'offline').map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 cursor-pointer opacity-50"
              >
                <span className="text-xl">{user.avatar}</span>
                <p className="text-sm text-slate-400 truncate">{user.displayName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ================== COMMUNITY DIRECTORY ==================
function CommunityDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'artists' | 'developers' | 'musicians' | 'teams'>('all');

  const creators = [
    { id: '1', name: 'PixelMaster', avatar: '🎨', role: 'Artist', specialty: '2D Pixel Art & Animation', followers: 1234, projects: 45, badges: ['top-creator', 'verified'] },
    { id: '2', name: 'CodeWizard', avatar: '🧙', role: 'Developer', specialty: 'Full-Stack & Game Dev', followers: 892, projects: 23, badges: ['helper'] },
    { id: '3', name: 'SoundScape', avatar: '🎵', role: 'Musician', specialty: 'Game Audio & SFX', followers: 567, projects: 78, badges: ['verified'] },
    { id: '4', name: 'GameForge', avatar: '⚔️', role: 'Team', specialty: 'Indie Game Studio', followers: 2341, projects: 12, badges: ['featured'] },
    { id: '5', name: '3DBuilder', avatar: '🏗️', role: 'Artist', specialty: '3D Modeling & Texturing', followers: 445, projects: 34, badges: [] },
    { id: '6', name: 'UIDesigner', avatar: '✨', role: 'Artist', specialty: 'UI/UX Design', followers: 678, projects: 56, badges: ['verified'] },
  ];

  const teams = [
    { id: '1', name: 'Aether Games', avatar: '🌟', members: 5, projects: 3, description: 'Creating immersive RPG experiences' },
    { id: '2', name: 'Pixel Collective', avatar: '🎮', members: 8, projects: 7, description: 'Retro-style indie games' },
    { id: '3', name: 'Sound Studio', avatar: '🎧', members: 3, projects: 15, description: 'Audio production for games' },
  ];

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search creators, teams, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'artists', 'developers', 'musicians', 'teams'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className={`capitalize ${filter === f ? 'bg-aura-600' : ''}`}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Creators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creators.map((creator) => (
          <Card key={creator.id} className="bg-slate-900 border-slate-800 hover:border-aura-500 transition cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{creator.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{creator.name}</h3>
                    {creator.badges.includes('verified') && (
                      <CheckCircle size={14} className="text-blue-400" />
                    )}
                    {creator.badges.includes('top-creator') && (
                      <Crown size={14} className="text-amber-400" />
                    )}
                  </div>
                  <p className="text-aura-400 text-sm">{creator.role}</p>
                  <p className="text-slate-400 text-sm mt-1">{creator.specialty}</p>
                </div>
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t border-slate-800 text-sm">
                <div className="text-center">
                  <p className="text-white font-semibold">{creator.followers.toLocaleString()}</p>
                  <p className="text-slate-500 text-xs">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">{creator.projects}</p>
                  <p className="text-slate-500 text-xs">Projects</p>
                </div>
                <Button size="sm" variant="outline" className="text-aura-400 border-aura-600">
                  <UserPlus size={14} className="mr-1" />
                  Follow
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Teams Section */}
      {(filter === 'all' || filter === 'teams') && (
        <>
          <h2 className="text-white text-xl font-semibold mt-8">Teams & Studios</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teams.map((team) => (
              <Card key={team.id} className="bg-slate-900 border-slate-800 hover:border-aura-500 transition cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">{team.avatar}</div>
                    <div>
                      <h3 className="text-white font-semibold">{team.name}</h3>
                      <p className="text-slate-400 text-sm">{team.members} members • {team.projects} projects</p>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm">{team.description}</p>
                  <Button className="w-full mt-4 bg-aura-600">View Team</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ================== FORUMS ==================
function Forums() {
  const [threads] = useState<Thread[]>([
    {
      id: '1',
      title: 'Tips for optimizing Unreal Engine 4.27 performance',
      author: DEMO_USERS[2],
      createdAt: new Date(Date.now() - 86400000),
      replies: 24,
      views: 342,
      isPinned: true,
      tags: ['unreal', 'optimization', 'tutorial'],
      lastActivity: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      title: 'Show off your pixel art! Monthly showcase thread',
      author: DEMO_USERS[1],
      createdAt: new Date(Date.now() - 172800000),
      replies: 156,
      views: 2341,
      isPinned: true,
      tags: ['pixel-art', 'showcase', 'monthly'],
      lastActivity: new Date(Date.now() - 1800000),
    },
    {
      id: '3',
      title: 'Looking for team members - RPG project',
      author: DEMO_USERS[3],
      createdAt: new Date(Date.now() - 43200000),
      replies: 8,
      views: 89,
      isPinned: false,
      tags: ['team', 'rpg', 'looking-for'],
      lastActivity: new Date(Date.now() - 7200000),
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-white text-xl font-semibold">Forum Discussions</h2>
        <Button className="bg-aura-600">
          <Plus size={16} className="mr-2" />
          New Thread
        </Button>
      </div>

      <div className="space-y-2">
        {threads.map((thread) => (
          <Card key={thread.id} className="bg-slate-900 border-slate-800 hover:border-slate-600 transition cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <span className="text-2xl">{thread.author.avatar}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {thread.isPinned && <Pin size={14} className="text-amber-400" />}
                    <h3 className="text-white font-semibold hover:text-aura-400">{thread.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>{thread.author.displayName}</span>
                    <span>•</span>
                    <span>{thread.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {thread.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      {thread.replies}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={14} />
                      {thread.views}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Last activity: {thread.lastActivity.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ================== MAIN COMMUNITY SUITE COMPONENT ==================
export default function CommunitySuitePage() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <Users size={32} className="text-blue-500" />
                Community Hub
              </h1>
              <p className="text-slate-400">
                Connect with creators, join discussions, and collaborate on projects
              </p>
            </div>
            <WalletDisplay userId="demo-user" />
          </div>
        </div>

        {/* Daily Challenge Widget */}
        <div className="mb-8">
          <DailyChallengeWidget section="community" userId="demo-user" compact />
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1">
            <TabsTrigger value="chat" className="data-[state=active]:bg-aura-600">
              <MessageCircle size={16} className="mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="directory" className="data-[state=active]:bg-aura-600">
              <Globe size={16} className="mr-2" />
              Directory
            </TabsTrigger>
            <TabsTrigger value="forums" className="data-[state=active]:bg-aura-600">
              <MessageCircle size={16} className="mr-2" />
              Forums
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <ChatArea />
          </TabsContent>

          <TabsContent value="directory">
            <CommunityDirectory />
          </TabsContent>

          <TabsContent value="forums">
            <Forums />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

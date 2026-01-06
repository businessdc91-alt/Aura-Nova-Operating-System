'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Search, 
  Bell, 
  TrendingUp,
  Hash,
  Settings,
  ArrowLeft,
  Home,
  Bot,
  CalendarDays,
  UsersRound,
  Sparkles,
  Trophy,
  Zap,
  Gift,
  Star,
  PlusCircle,
  Cpu,
  Heart,
  Flame,
  Crown,
  ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SocialFeed } from '@/components/social/SocialFeed';
import { Messenger } from '@/components/social/Messenger';
import { OnlineUsersSidebar } from '@/components/social/OnlineUsersBar';
import { 
  getCurrentUser,
  getNotifications,
  Notification,
  SocialUser,
  AICompanionProfile
} from '@/services/socialNetworkService';
import toast from 'react-hot-toast';

// ================== EXTENDED TYPES ==================
interface CommunityGroup {
  id: string;
  name: string;
  icon: string;
  memberCount: number;
  category: string;
  description: string;
  isJoined: boolean;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  type: 'challenge' | 'workshop' | 'stream' | 'jam' | 'tournament';
  participants: number;
  maxParticipants?: number;
  reward?: string;
  host: string;
}

interface FeaturedCreator {
  id: string;
  displayName: string;
  username: string;
  avatar?: string;
  specialty: string;
  tier: 'free' | 'creator' | 'developer' | 'catalyst' | 'prime';
  aiCompanion?: {
    name: string;
    modelName: string;
  };
  stats: {
    followers: number;
    creations: number;
  };
}

// ================== MOCK DATA ==================
const DEMO_GROUPS: CommunityGroup[] = [
  { id: 'g1', name: 'Pixel Artists United', icon: '🎨', memberCount: 1247, category: 'Art', description: 'For lovers of pixel art', isJoined: true },
  { id: 'g2', name: 'Game Dev Academy', icon: '🎮', memberCount: 892, category: 'Development', description: 'Learn game development together', isJoined: false },
  { id: 'g3', name: 'AI Art Explorers', icon: '🤖', memberCount: 2156, category: 'AI', description: 'Pushing the boundaries of AI art', isJoined: true },
  { id: 'g4', name: 'Music Makers', icon: '🎵', memberCount: 634, category: 'Music', description: 'Compose, share, collaborate', isJoined: false },
  { id: 'g5', name: 'Story Weavers', icon: '📖', memberCount: 445, category: 'Literature', description: 'Writers and storytellers unite', isJoined: false },
  { id: 'g6', name: 'Shader Wizards', icon: '✨', memberCount: 312, category: 'Graphics', description: 'Advanced graphics programming', isJoined: true },
];

const DEMO_EVENTS: CommunityEvent[] = [
  { id: 'e1', title: 'Weekly Pixel Art Challenge', description: 'Create a character in 32x32 pixels', startDate: new Date(Date.now() + 86400000), type: 'challenge', participants: 89, reward: '500 Aura Coins', host: 'Aura Nova' },
  { id: 'e2', title: 'Live Shader Workshop', description: 'Learn post-processing effects', startDate: new Date(Date.now() + 172800000), type: 'workshop', participants: 45, maxParticipants: 100, host: 'ShaderMaster' },
  { id: 'e3', title: 'Game Jam: 48 Hours', description: 'Theme reveal at start!', startDate: new Date(Date.now() + 604800000), endDate: new Date(Date.now() + 777600000), type: 'jam', participants: 156, reward: 'Featured Showcase', host: 'Aura Nova Studios' },
  { id: 'e4', title: 'Aetherium Tournament', description: 'Battle for glory in the TCG arena', startDate: new Date(Date.now() + 259200000), type: 'tournament', participants: 64, maxParticipants: 64, reward: 'Legendary Card Pack', host: 'CardMaster' },
];

const FEATURED_CREATORS: FeaturedCreator[] = [
  { id: 'fc1', displayName: 'PixelQueen 👑', username: 'pixelqueen', specialty: 'Pixel Art', tier: 'catalyst', aiCompanion: { name: 'Sprite', modelName: 'SDXL' }, stats: { followers: 5420, creations: 234 } },
  { id: 'fc2', displayName: 'CodeMaster 🧙', username: 'codemaster', specialty: 'Game Dev', tier: 'developer', aiCompanion: { name: 'Logic', modelName: 'CodeLlama' }, stats: { followers: 3180, creations: 89 } },
  { id: 'fc3', displayName: 'SynthWave 🎹', username: 'synthwave', specialty: 'Music', tier: 'prime', aiCompanion: { name: 'Melody', modelName: 'MusicGen' }, stats: { followers: 8900, creations: 156 } },
  { id: 'fc4', displayName: 'StorySpinner 📚', username: 'storyspinner', specialty: 'Literature', tier: 'creator', aiCompanion: { name: 'Muse', modelName: 'Gemma 3' }, stats: { followers: 2340, creations: 67 } },
];

const TIER_COLORS = {
  free: 'text-slate-400',
  creator: 'text-blue-400',
  developer: 'text-purple-400',
  catalyst: 'text-orange-400',
  prime: 'text-amber-400',
};

const EVENT_TYPE_COLORS = {
  challenge: 'bg-green-500/20 text-green-400 border-green-500/30',
  workshop: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  stream: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  jam: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  tournament: 'bg-red-500/20 text-red-400 border-red-500/30',
};

// ================== SOCIAL HUB PAGE ==================
export default function SocialHubPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'messages' | 'explore' | 'groups' | 'events' | 'creators'>('feed');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [groups, setGroups] = useState(DEMO_GROUPS);
  const currentUser = getCurrentUser();

  // Load notifications
  useEffect(() => {
    const notifs = getNotifications();
    setNotifications(notifs);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleJoinGroup = (groupId: string) => {
    setGroups(groups.map(g => 
      g.id === groupId ? { ...g, isJoined: !g.isJoined, memberCount: g.isJoined ? g.memberCount - 1 : g.memberCount + 1 } : g
    ));
    const group = groups.find(g => g.id === groupId);
    toast.success(group?.isJoined ? `Left ${group.name}` : `Joined ${group?.name}!`);
  };

  const handleJoinEvent = (eventId: string) => {
    toast.success('Registered for event! 🎉');
  };

  const formatEventDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h`;
    return 'Starting soon!';
  };

  // Trending tags (mock data)
  const trendingTags = [
    { name: 'pixelart', count: 234 },
    { name: 'gamedev', count: 189 },
    { name: 'music', count: 156 },
    { name: 'writing', count: 143 },
    { name: 'aura-nova', count: 127 },
    { name: 'sprites', count: 98 },
    { name: 'collaboration', count: 87 },
    { name: 'tutorials', count: 76 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Back & Logo */}
            <div className="flex items-center gap-4">
              <Link href="/os">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <ArrowLeft size={20} />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-aura-400" />
                <span className="text-xl font-bold bg-gradient-to-r from-aura-400 to-purple-400 bg-clip-text text-transparent">
                  AuraNova Social
                </span>
              </div>
            </div>

            {/* Center: Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search posts, users, tags..."
                  className="pl-10 bg-slate-800 border-slate-700"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-white"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                      <span className="font-semibold">Notifications</span>
                      <Button variant="ghost" size="sm" className="text-xs text-aura-400">
                        Mark all read
                      </Button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.slice(0, 10).map(notif => (
                        <div 
                          key={notif.id}
                          className={`p-3 border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer ${
                            !notif.read ? 'bg-aura-900/20' : ''
                          }`}
                        >
                          <p className="text-sm font-medium">{notif.title}</p>
                          <p className="text-sm text-slate-400">{notif.message}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                          <Bell size={24} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <Settings size={20} />
              </Button>

              {/* User Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-aura-500 to-purple-600 flex items-center justify-center text-white font-medium">
                {currentUser?.displayName?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="flex items-center gap-1 mt-3 -mb-px overflow-x-auto">
            {[
              { id: 'feed', label: 'Feed', icon: <TrendingUp size={14} /> },
              { id: 'messages', label: 'Messages', icon: <MessageSquare size={14} /> },
              { id: 'explore', label: 'Explore', icon: <Search size={14} /> },
              { id: 'groups', label: 'Groups', icon: <UsersRound size={14} /> },
              { id: 'events', label: 'Events', icon: <CalendarDays size={14} /> },
              { id: 'creators', label: 'Creators', icon: <Star size={14} /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  setSelectedTag(null);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white border-b-2 border-aura-500'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Online Users */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <OnlineUsersSidebar className="mb-4" />
              
              {/* Quick Links */}
              <div className="bg-slate-900/50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-white mb-3">Quick Access</h3>
                <div className="space-y-1">
                  <Link 
                    href="/os"
                    className="flex items-center gap-2 p-2 rounded hover:bg-slate-800/50 text-slate-400 hover:text-white text-sm"
                  >
                    <Home size={16} />
                    <span>Desktop</span>
                  </Link>
                  <Link 
                    href="/profile"
                    className="flex items-center gap-2 p-2 rounded hover:bg-slate-800/50 text-slate-400 hover:text-white text-sm"
                  >
                    <Users size={16} />
                    <span>My Profile</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Feed Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'feed' && (
              <SocialFeed tag={selectedTag || undefined} />
            )}

            {activeTab === 'messages' && (
              <div className="bg-slate-900/50 rounded-xl overflow-hidden" style={{ height: '600px' }}>
                <Messenger mode="full" />
              </div>
            )}

            {activeTab === 'explore' && (
              <div className="space-y-6">
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="text-aura-400" size={20} />
                    Trending Now
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {trendingTags.map(tag => (
                      <button
                        key={tag.name}
                        onClick={() => {
                          setSelectedTag(tag.name);
                          setActiveTab('feed');
                          toast.success(`Showing posts tagged #${tag.name}`);
                        }}
                        className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-1 text-aura-400 group-hover:text-aura-300">
                          <Hash size={14} />
                          <span className="font-medium">{tag.name}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{tag.count} posts</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Suggested Users */}
                <div className="bg-slate-900/50 rounded-xl p-4">
                  <h2 className="text-lg font-semibold mb-4">Discover Creators</h2>
                  <p className="text-slate-500 text-sm">
                    Connect with artists, musicians, and developers in the AuraNova community.
                  </p>
                </div>
              </div>
            )}

            {/* Groups Tab */}
            {activeTab === 'groups' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <UsersRound className="text-aura-400" size={20} />
                    Community Groups
                  </h2>
                  <Button className="bg-aura-600 hover:bg-aura-700" size="sm">
                    <PlusCircle size={16} className="mr-1" /> Create Group
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groups.map(group => (
                    <Card key={group.id} className="bg-slate-900/80 border-slate-800 hover:border-aura-500/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="text-4xl">{group.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{group.name}</h3>
                            <p className="text-sm text-slate-400">{group.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs text-slate-500">
                                <Users size={12} className="inline mr-1" />
                                {group.memberCount.toLocaleString()} members
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                {group.category}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant={group.isJoined ? 'outline' : 'default'}
                            className={group.isJoined ? '' : 'bg-aura-600 hover:bg-aura-700'}
                            onClick={() => handleJoinGroup(group.id)}
                          >
                            {group.isJoined ? 'Joined' : 'Join'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <CalendarDays className="text-aura-400" size={20} />
                    Upcoming Events
                  </h2>
                  <Button className="bg-aura-600 hover:bg-aura-700" size="sm">
                    <PlusCircle size={16} className="mr-1" /> Host Event
                  </Button>
                </div>

                <div className="space-y-4">
                  {DEMO_EVENTS.map(event => (
                    <Card key={event.id} className="bg-slate-900/80 border-slate-800 hover:border-aura-500/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-aura-500 to-purple-600 flex flex-col items-center justify-center text-white">
                            <span className="text-xs font-medium">
                              {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-xl font-bold">
                              {new Date(event.startDate).getDate()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded border ${EVENT_TYPE_COLORS[event.type]}`}>
                                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                              </span>
                              <span className="text-xs text-aura-400">{formatEventDate(event.startDate)}</span>
                            </div>
                            <h3 className="font-semibold text-white">{event.title}</h3>
                            <p className="text-sm text-slate-400">{event.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span><Users size={12} className="inline mr-1" />{event.participants} joined</span>
                              {event.maxParticipants && (
                                <span className="text-amber-400">
                                  {event.maxParticipants - event.participants} spots left
                                </span>
                              )}
                              {event.reward && (
                                <span className="text-green-400 flex items-center gap-1">
                                  <Gift size={12} /> {event.reward}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            className="bg-aura-600 hover:bg-aura-700"
                            onClick={() => handleJoinEvent(event.id)}
                          >
                            Join
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Creators Tab */}
            {activeTab === 'creators' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Star className="text-amber-400" size={20} />
                    Featured Creators
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FEATURED_CREATORS.map(creator => (
                    <Card key={creator.id} className="bg-slate-900/80 border-slate-800 hover:border-aura-500/50 transition-colors group">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-aura-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
                            {creator.displayName[0]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white group-hover:text-aura-400 transition-colors">
                                {creator.displayName}
                              </h3>
                              <span className={`text-xs ${TIER_COLORS[creator.tier]}`}>
                                {creator.tier === 'prime' && <Crown size={12} className="inline" />}
                                {creator.tier.charAt(0).toUpperCase() + creator.tier.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400">@{creator.username}</p>
                            
                            {/* AI Companion Info */}
                            {creator.aiCompanion && (
                              <div className="flex items-center gap-2 mt-2 p-2 bg-slate-800/50 rounded-lg">
                                <Bot size={14} className="text-aura-400" />
                                <span className="text-xs text-slate-300">
                                  <span className="text-white font-medium">{creator.aiCompanion.name}</span>
                                  <span className="text-slate-500"> • </span>
                                  <span className="text-aura-400">{creator.aiCompanion.modelName}</span>
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span><Users size={12} className="inline mr-1" />{creator.stats.followers.toLocaleString()} followers</span>
                              <span><ImageIcon size={12} className="inline mr-1" />{creator.stats.creations} creations</span>
                              <span className="text-aura-400">{creator.specialty}</span>
                            </div>
                          </div>
                          <Link href={`/profile/${creator.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Leaderboard Preview */}
                <Card className="bg-gradient-to-br from-slate-900 to-amber-900/20 border-amber-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Trophy className="text-amber-400" size={20} />
                      This Week's Top Creators
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { rank: 1, name: 'PixelQueen 👑', points: 12450, icon: '🥇' },
                        { rank: 2, name: 'SynthWave 🎹', points: 11200, icon: '🥈' },
                        { rank: 3, name: 'CodeMaster 🧙', points: 9870, icon: '🥉' },
                      ].map(entry => (
                        <div key={entry.rank} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                          <span className="text-2xl">{entry.icon}</span>
                          <div className="flex-1">
                            <p className="font-medium text-white">{entry.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-amber-400 font-bold">{entry.points.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">points</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      View Full Leaderboard
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Right Sidebar - Trending */}
          <aside className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Upcoming Event Preview */}
              {DEMO_EVENTS[0] && (
                <div className="bg-gradient-to-br from-slate-900 to-aura-900/30 rounded-lg p-4 border border-aura-500/30">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Flame size={16} className="text-orange-400" />
                    Next Event
                  </h3>
                  <p className="text-white font-medium">{DEMO_EVENTS[0].title}</p>
                  <p className="text-xs text-aura-400 mt-1">{formatEventDate(DEMO_EVENTS[0].startDate)}</p>
                  <Button className="w-full mt-3 bg-aura-600 hover:bg-aura-700" size="sm">
                    Join Now
                  </Button>
                </div>
              )}

              {/* Trending Tags */}
              <div className="bg-slate-900/50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <TrendingUp size={16} className="text-aura-400" />
                  Trending Tags
                </h3>
                <div className="space-y-2">
                  {trendingTags.slice(0, 5).map((tag, i) => (
                    <button
                      key={tag.name}
                      onClick={() => {
                        setSelectedTag(tag.name);
                        setActiveTab('feed');
                      }}
                      className="flex items-center gap-3 w-full p-2 rounded hover:bg-slate-800/50 text-left group"
                    >
                      <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                      <div className="flex-1">
                        <span className="text-sm text-white group-hover:text-aura-400">
                          #{tag.name}
                        </span>
                        <p className="text-xs text-slate-500">{tag.count} posts</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Links */}
              <div className="text-xs text-slate-600 px-2">
                <p>© 2025 AuraNova Studios</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <a href="#" className="hover:text-slate-400">Terms</a>
                  <a href="#" className="hover:text-slate-400">Privacy</a>
                  <a href="#" className="hover:text-slate-400">Help</a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

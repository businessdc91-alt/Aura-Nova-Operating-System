'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import {
  User,
  Settings,
  Star,
  Heart,
  MessageSquare,
  Share2,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Award,
  Flame,
  Coins,
  ShoppingBag,
  Image,
  Code,
  Gamepad2,
  BookOpen,
  Users,
  UserPlus,
  UserMinus,
  Flag,
  MoreVertical,
  ExternalLink,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import { UserAvatar, PresenceIndicator, UserStatus } from '@/components/presence/PresenceIndicator';

// ============== TYPES ==============
interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedAt: Date;
  status: UserStatus;
  isVerified: boolean;
  membershipTier: 'free' | 'creator' | 'developer' | 'catalyst' | 'prime';
  stats: {
    followers: number;
    following: number;
    reputation: number;
    points: number;
    totalLikes: number;
    totalViews: number;
  };
  badges: Badge[];
  socialLinks: SocialLink[];
  activity?: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earnedAt: Date;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

interface PortfolioItem {
  id: string;
  type: 'art' | 'code' | 'game' | 'literature' | 'component';
  title: string;
  thumbnail?: string;
  description?: string;
  likes: number;
  views: number;
  createdAt: Date;
}

const MEMBERSHIP_COLORS = {
  free: 'text-slate-400',
  creator: 'text-blue-400',
  developer: 'text-purple-400',
  catalyst: 'text-orange-400',
  prime: 'text-amber-400',
};

const MEMBERSHIP_LABELS = {
  free: 'Free Member',
  creator: 'Creator Pass',
  developer: 'Developer Pass',
  catalyst: 'Catalyst',
  prime: 'Prime Catalyst',
};

const RARITY_COLORS = {
  common: 'border-slate-500 bg-slate-900',
  uncommon: 'border-green-500 bg-green-900/20',
  rare: 'border-blue-500 bg-blue-900/20',
  epic: 'border-purple-500 bg-purple-900/20',
  legendary: 'border-amber-500 bg-amber-900/20',
};

// Demo data
const DEMO_USER: UserProfile = {
  id: 'user_demo123',
  username: 'AuroraCatalyst',
  displayName: 'Aurora ✨',
  avatar: undefined,
  banner: undefined,
  bio: 'Creative developer passionate about game development and AI art. Building the future one pixel at a time. 🎮🎨',
  location: 'Digital Realm',
  website: 'https://auranova.studio',
  joinedAt: new Date('2024-01-15'),
  status: 'online',
  isVerified: true,
  membershipTier: 'catalyst',
  stats: {
    followers: 1247,
    following: 89,
    reputation: 4850,
    points: 12500,
    totalLikes: 8934,
    totalViews: 45621,
  },
  badges: [
    {
      id: 'b1',
      name: 'Early Adopter',
      icon: '🌟',
      description: 'Joined during the beta phase',
      rarity: 'epic',
      earnedAt: new Date('2024-01-15'),
    },
    {
      id: 'b2',
      name: 'Art Master',
      icon: '🎨',
      description: 'Created 100+ art pieces',
      rarity: 'rare',
      earnedAt: new Date('2024-02-20'),
    },
    {
      id: 'b3',
      name: 'Code Ninja',
      icon: '⚡',
      description: 'Generated 50+ code projects',
      rarity: 'rare',
      earnedAt: new Date('2024-03-10'),
    },
    {
      id: 'b4',
      name: 'Community Star',
      icon: '💫',
      description: 'Received 1000+ likes',
      rarity: 'legendary',
      earnedAt: new Date('2024-04-01'),
    },
    {
      id: 'b5',
      name: 'Helpful Hand',
      icon: '🤝',
      description: 'Helped 50+ community members',
      rarity: 'uncommon',
      earnedAt: new Date('2024-02-28'),
    },
  ],
  socialLinks: [
    { platform: 'Twitter', url: 'https://twitter.com/aurora', icon: '𝕏' },
    { platform: 'GitHub', url: 'https://github.com/aurora', icon: '🐙' },
    { platform: 'Discord', url: '#', icon: '💬' },
  ],
  activity: 'Creating art in Art Studio',
};

const DEMO_PORTFOLIO: PortfolioItem[] = [
  { id: 'p1', type: 'art', title: 'Cyberpunk City', likes: 234, views: 1520, createdAt: new Date('2024-05-01') },
  { id: 'p2', type: 'code', title: 'Inventory System', likes: 189, views: 890, createdAt: new Date('2024-04-28') },
  { id: 'p3', type: 'game', title: 'Pixel Dungeon', likes: 412, views: 2340, createdAt: new Date('2024-04-20') },
  { id: 'p4', type: 'art', title: 'Fantasy Character', likes: 567, views: 3200, createdAt: new Date('2024-04-15') },
  { id: 'p5', type: 'component', title: 'Animated Button', likes: 123, views: 670, createdAt: new Date('2024-04-10') },
  { id: 'p6', type: 'literature', title: 'Game Story Arc', likes: 89, views: 450, createdAt: new Date('2024-04-05') },
];

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const [profile, setProfile] = useState<UserProfile>(DEMO_USER);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(DEMO_PORTFOLIO);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [portfolioFilter, setPortfolioFilter] = useState<string>('all');
  const isOwnProfile = false; // In production, compare with auth user

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Unfollowed' : 'Following!');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile link copied!');
  };

  const handleMessage = () => {
    toast('Opening DM...', { icon: '💬' });
    // Navigate to chat with DM
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const filteredPortfolio =
    portfolioFilter === 'all'
      ? portfolio
      : portfolio.filter((item) => item.type === portfolioFilter);

  const typeIcons = {
    art: <Image size={16} />,
    code: <Code size={16} />,
    game: <Gamepad2 size={16} />,
    literature: <BookOpen size={16} />,
    component: <Code size={16} />,
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-aura-600 via-purple-600 to-blue-600">
        {profile.banner && (
          <img
            src={profile.banner}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-aura-600 flex items-center justify-center text-white text-5xl font-bold ring-4 ring-slate-950 overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                profile.username[0].toUpperCase()
              )}
            </div>
            <div className="absolute bottom-2 right-2 p-1 bg-slate-900 rounded-full ring-2 ring-slate-950">
              <PresenceIndicator status={profile.status} size="lg" showPulse />
            </div>
          </div>

          {/* Name & Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {profile.displayName}
              </h1>
              {profile.isVerified && (
                <span className="text-blue-400" title="Verified">
                  ✓
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${MEMBERSHIP_COLORS[profile.membershipTier]}`}
              >
                {MEMBERSHIP_LABELS[profile.membershipTier]}
              </span>
            </div>
            <p className="text-slate-400 mt-1">@{profile.username}</p>
            {profile.activity && (
              <p className="text-sm text-aura-400 mt-1">
                🎮 {profile.activity}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {isOwnProfile ? (
              <Button className="bg-slate-800 hover:bg-slate-700">
                <Settings size={18} className="mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleFollow}
                  className={
                    isFollowing
                      ? 'bg-slate-800 hover:bg-slate-700'
                      : 'bg-aura-600 hover:bg-aura-700'
                  }
                >
                  {isFollowing ? (
                    <>
                      <UserMinus size={18} className="mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} className="mr-2" />
                      Follow
                    </>
                  )}
                </Button>
                <Button onClick={handleMessage} className="bg-slate-800 hover:bg-slate-700">
                  <MessageSquare size={18} className="mr-2" />
                  Message
                </Button>
              </>
            )}
            <Button onClick={handleShare} variant="outline" size="icon">
              <Share2 size={18} />
            </Button>
            <Button variant="outline" size="icon">
              <MoreVertical size={18} />
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap gap-6 mt-6 py-4 border-b border-slate-800">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{formatNumber(profile.stats.followers)}</p>
            <p className="text-sm text-slate-400">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{formatNumber(profile.stats.following)}</p>
            <p className="text-sm text-slate-400">Following</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-aura-400">{formatNumber(profile.stats.reputation)}</p>
            <p className="text-sm text-slate-400">Reputation</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{formatNumber(profile.stats.points)}</p>
            <p className="text-sm text-slate-400">Points</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-400">{formatNumber(profile.stats.totalLikes)}</p>
            <p className="text-sm text-slate-400">Likes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-300">{formatNumber(profile.stats.totalViews)}</p>
            <p className="text-sm text-slate-400">Views</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* About */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.bio && <p className="text-slate-300">{profile.bio}</p>}

                <div className="space-y-2 text-sm">
                  {profile.location && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin size={16} />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <LinkIcon size={16} />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-aura-400 hover:underline"
                      >
                        {profile.website.replace('https://', '')}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar size={16} />
                    <span>Joined {formatDate(profile.joinedAt)}</span>
                  </div>
                </div>

                {/* Social Links */}
                {profile.socialLinks.length > 0 && (
                  <div className="flex gap-2 pt-2">
                    {profile.socialLinks.map((link) => (
                      <a
                        key={link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition"
                        title={link.platform}
                      >
                        <span className="text-lg">{link.icon}</span>
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Award size={20} className="text-amber-400" />
                  Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {profile.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-3 rounded-lg border text-center ${RARITY_COLORS[badge.rarity]}`}
                      title={badge.description}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <p className="text-xs text-slate-300 mt-1 truncate">{badge.name}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-800 mb-4">
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="aetherium">Aetherium</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio">
                {/* Filter */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {['all', 'art', 'code', 'game', 'component', 'literature'].map((filter) => (
                    <Button
                      key={filter}
                      size="sm"
                      variant={portfolioFilter === filter ? 'default' : 'outline'}
                      onClick={() => setPortfolioFilter(filter)}
                      className={portfolioFilter === filter ? 'bg-aura-600' : ''}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </Button>
                  ))}
                </div>

                {/* Portfolio Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPortfolio.map((item) => (
                    <Card key={item.id} className="bg-slate-900 border-slate-800 hover:border-aura-500 transition cursor-pointer">
                      <div className="aspect-video bg-slate-800 flex items-center justify-center">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-slate-600">{typeIcons[item.type]}</div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-aura-400">{typeIcons[item.type]}</span>
                          <h3 className="font-semibold text-white">{item.title}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <Heart size={14} /> {formatNumber(item.likes)}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp size={14} /> {formatNumber(item.views)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredPortfolio.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Image size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No items in this category</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-4 bg-slate-900 rounded-lg border border-slate-800"
                    >
                      <div className="w-10 h-10 bg-aura-600/20 rounded-full flex items-center justify-center text-aura-400">
                        <Star size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-300">
                          <span className="text-white font-semibold">{profile.username}</span> created a new{' '}
                          <span className="text-aura-400">art piece</span>
                        </p>
                        <p className="text-sm text-slate-500 mt-1">{i} days ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="aetherium">
                <Card className="bg-slate-900 border-slate-800">
                  <CardContent className="p-8 text-center">
                    <Gamepad2 size={64} className="mx-auto mb-4 text-aura-400 opacity-50" />
                    <h3 className="text-xl font-semibold text-white mb-2">Aetherium Collection</h3>
                    <p className="text-slate-400 mb-4">View trading card collection and game stats</p>
                    <Button className="bg-aura-600 hover:bg-aura-700">
                      View Collection
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="following">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card
                      key={i}
                      className="bg-slate-900 border-slate-800 p-4 flex items-center gap-4"
                    >
                      <UserAvatar
                        username={`User${i}`}
                        status="online"
                        size="lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-white">Creative User {i}</p>
                        <p className="text-sm text-slate-400">@user{i}</p>
                      </div>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

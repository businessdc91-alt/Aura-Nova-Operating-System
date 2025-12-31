'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { DailyChallengeWidget, WalletDisplay } from '@/components/challenges/DailyChallengeWidget';
import {
  Store,
  Coins,
  ShoppingCart,
  Package,
  Star,
  Heart,
  Download,
  Upload,
  Search,
  Filter,
  TrendingUp,
  Award,
  Gift,
  Zap,
  Crown,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  MessageCircle,
  Share2,
  Bookmark,
  Tag,
  Grid3X3,
  List,
  SlidersHorizontal,
  ChevronRight,
  Plus,
  Minus,
  CreditCard,
  Wallet,
  History,
  Trophy,
  Target,
  Flame,
  Calendar,
  Users,
  ExternalLink,
  Lock,
  Unlock,
} from 'lucide-react';

// ============================================================================
// MARKETPLACE SUITE - GRAND EXCHANGE & POINTS ECONOMY
// ============================================================================
// Includes:
// - The Grand Exchange (marketplace for assets, templates, components)
// - Aurora Points System (earn & spend points)
// - Daily Rewards & Streaks
// - Leaderboards & Achievements
// - Premium Shop
// - Trading System
// ============================================================================

// ================== TYPES ==================
interface MarketItem {
  id: string;
  name: string;
  description: string;
  category: 'template' | 'asset' | 'component' | 'sprite' | 'audio' | 'model' | 'plugin';
  price: number;
  currency: 'points' | 'premium';
  author: { name: string; avatar: string; verified: boolean };
  rating: number;
  reviews: number;
  downloads: number;
  images: string[];
  tags: string[];
  featured?: boolean;
  isNew?: boolean;
}

interface PointsTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  description: string;
  timestamp: Date;
  source: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

interface DailyReward {
  day: number;
  points: number;
  bonus?: string;
  claimed: boolean;
}

// ================== DEMO DATA ==================
const DEMO_ITEMS: MarketItem[] = [
  {
    id: '1',
    name: 'Complete RPG Inventory System',
    description: 'Full-featured inventory system with drag & drop, stacking, equipment slots, and save/load functionality. Works with UE4.27+',
    category: 'template',
    price: 500,
    currency: 'points',
    author: { name: 'CodeWizard', avatar: '🧙', verified: true },
    rating: 4.8,
    reviews: 124,
    downloads: 2341,
    images: ['/placeholder.png'],
    tags: ['inventory', 'rpg', 'unreal', 'ui'],
    featured: true,
  },
  {
    id: '2',
    name: 'Steampunk UI Kit',
    description: '50+ UI elements in steampunk style. Includes buttons, panels, gauges, gears, and more.',
    category: 'asset',
    price: 350,
    currency: 'points',
    author: { name: 'PixelMaster', avatar: '🎨', verified: true },
    rating: 4.9,
    reviews: 89,
    downloads: 1567,
    images: ['/placeholder.png'],
    tags: ['ui', 'steampunk', 'sprites', '2d'],
    isNew: true,
  },
  {
    id: '3',
    name: 'Character Animation Pack',
    description: '8-direction movement, attack, death, and idle animations. 32x32 pixel characters.',
    category: 'sprite',
    price: 200,
    currency: 'points',
    author: { name: 'SpriteForge', avatar: '🎮', verified: false },
    rating: 4.5,
    reviews: 45,
    downloads: 892,
    images: ['/placeholder.png'],
    tags: ['animation', 'sprite', 'character', 'pixel-art'],
  },
  {
    id: '4',
    name: 'AI Combat System',
    description: 'Advanced AI behavior tree for enemy combat. Includes patrol, chase, attack, and flee behaviors.',
    category: 'component',
    price: 750,
    currency: 'points',
    author: { name: 'GameDevPro', avatar: '⚔️', verified: true },
    rating: 4.7,
    reviews: 67,
    downloads: 1234,
    images: ['/placeholder.png'],
    tags: ['ai', 'combat', 'behavior-tree', 'enemy'],
    featured: true,
  },
  {
    id: '5',
    name: 'Ambient Fantasy Music Pack',
    description: '10 loopable ambient tracks perfect for RPG exploration and town scenes.',
    category: 'audio',
    price: 300,
    currency: 'points',
    author: { name: 'SoundScape', avatar: '🎵', verified: true },
    rating: 4.9,
    reviews: 156,
    downloads: 3421,
    images: ['/placeholder.png'],
    tags: ['music', 'ambient', 'fantasy', 'loop'],
  },
  {
    id: '6',
    name: 'Premium Creator Badge',
    description: 'Exclusive badge that shows on your profile. Unlock premium features.',
    category: 'plugin',
    price: 1000,
    currency: 'premium',
    author: { name: 'AuraNova', avatar: '✨', verified: true },
    rating: 5.0,
    reviews: 234,
    downloads: 567,
    images: ['/placeholder.png'],
    tags: ['premium', 'badge', 'exclusive'],
  },
];

const DEMO_ACHIEVEMENTS: Achievement[] = [
  { id: '1', name: 'First Steps', description: 'Complete your profile', icon: '👋', points: 50, progress: 1, maxProgress: 1, unlocked: true, unlockedAt: new Date() },
  { id: '2', name: 'Creator', description: 'Upload your first asset', icon: '🎨', points: 100, progress: 1, maxProgress: 1, unlocked: true, unlockedAt: new Date() },
  { id: '3', name: 'Helpful', description: 'Answer 10 help requests', icon: '🤝', points: 200, progress: 7, maxProgress: 10, unlocked: false },
  { id: '4', name: 'Popular', description: 'Get 100 downloads on an asset', icon: '⭐', points: 500, progress: 45, maxProgress: 100, unlocked: false },
  { id: '5', name: 'Master Coder', description: 'Complete 50 Dojo challenges', icon: '🏆', points: 1000, progress: 23, maxProgress: 50, unlocked: false },
  { id: '6', name: 'Social Butterfly', description: 'Follow 25 creators', icon: '🦋', points: 150, progress: 12, maxProgress: 25, unlocked: false },
  { id: '7', name: 'Weekly Warrior', description: 'Log in 7 days in a row', icon: '🔥', points: 300, progress: 5, maxProgress: 7, unlocked: false },
  { id: '8', name: 'Art Collector', description: 'Download 25 art assets', icon: '🖼️', points: 250, progress: 8, maxProgress: 25, unlocked: false },
];

const DEMO_DAILY_REWARDS: DailyReward[] = [
  { day: 1, points: 10, claimed: true },
  { day: 2, points: 15, claimed: true },
  { day: 3, points: 20, claimed: true },
  { day: 4, points: 25, claimed: true },
  { day: 5, points: 30, claimed: false },
  { day: 6, points: 40, bonus: 'Random Asset', claimed: false },
  { day: 7, points: 100, bonus: 'Premium Item', claimed: false },
];

// ================== MARKETPLACE COMPONENT ==================
function Marketplace() {
  const [items] = useState<MarketItem[]>(DEMO_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'new' | 'price-low' | 'price-high'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [cart, setCart] = useState<MarketItem[]>([]);

  const categories = [
    { id: 'all', name: 'All', icon: <Grid3X3 size={16} /> },
    { id: 'template', name: 'Templates', icon: <Package size={16} /> },
    { id: 'asset', name: 'Assets', icon: <Sparkles size={16} /> },
    { id: 'component', name: 'Components', icon: <Zap size={16} /> },
    { id: 'sprite', name: 'Sprites', icon: <Star size={16} /> },
    { id: 'audio', name: 'Audio', icon: <Award size={16} /> },
  ];

  const addToCart = (item: MarketItem) => {
    if (cart.find(i => i.id === item.id)) {
      toast.error('Already in cart!');
      return;
    }
    setCart([...cart, item]);
    toast.success('Added to cart!');
  };

  const filteredItems = items.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Featured Banner */}
      <Card className="bg-gradient-to-r from-aura-900 to-purple-900 border-aura-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-amber-400 text-sm font-semibold">⭐ FEATURED</span>
              <h2 className="text-2xl font-bold text-white mt-1">Complete RPG Inventory System</h2>
              <p className="text-slate-300 mt-2">Save 20% this week only! Full-featured inventory for your game.</p>
              <Button className="mt-4 bg-amber-500 hover:bg-amber-600 text-black">
                View Details
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
            <div className="text-6xl">📦</div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filters */}
      <div className="flex gap-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search the Grand Exchange..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.id ? 'default' : 'outline'}
              onClick={() => setCategory(cat.id)}
              className={category === cat.id ? 'bg-aura-600' : ''}
              size="sm"
            >
              {cat.icon}
              <span className="ml-1">{cat.name}</span>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="bg-slate-800 border border-slate-700 rounded-md text-white text-sm px-3 py-2"
          >
            <option value="popular">Most Popular</option>
            <option value="new">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>

          <div className="flex border border-slate-700 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-aura-600' : 'bg-slate-800'}`}
            >
              <Grid3X3 size={16} className="text-white" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-aura-600' : 'bg-slate-800'}`}
            >
              <List size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Cart Summary */}
      {cart.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart size={20} className="text-aura-400" />
              <span className="text-white">{cart.length} items in cart</span>
              <span className="text-aura-400 font-semibold">
                {cart.reduce((sum, item) => sum + item.price, 0)} Points
              </span>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              Checkout
              <ChevronRight size={16} className="ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Items Grid */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className={`bg-slate-900 border-slate-800 hover:border-aura-500 transition cursor-pointer ${
              viewMode === 'list' ? 'flex-row' : ''
            }`}
          >
            <CardContent className={`p-4 ${viewMode === 'list' ? 'flex gap-4' : ''}`}>
              {/* Thumbnail */}
              <div className={`bg-slate-800 rounded-lg flex items-center justify-center ${
                viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'h-40 mb-4'
              }`}>
                <span className="text-5xl">
                  {item.category === 'template' ? '📦' :
                   item.category === 'asset' ? '🎨' :
                   item.category === 'sprite' ? '🖼️' :
                   item.category === 'audio' ? '🎵' :
                   item.category === 'component' ? '⚙️' : '📁'}
                </span>
                {item.featured && (
                  <span className="absolute top-2 left-2 bg-amber-500 text-black text-xs px-2 py-0.5 rounded font-semibold">
                    FEATURED
                  </span>
                )}
                {item.isNew && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded font-semibold">
                    NEW
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-semibold">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg">{item.author.avatar}</span>
                      <span className="text-slate-400 text-sm">{item.author.name}</span>
                      {item.author.verified && <CheckCircle size={12} className="text-blue-400" />}
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-red-400">
                    <Heart size={18} />
                  </button>
                </div>

                <p className="text-slate-400 text-sm mt-2 line-clamp-2">{item.description}</p>

                <div className="flex items-center gap-3 mt-3 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    {item.rating}
                  </span>
                  <span>({item.reviews})</span>
                  <span className="flex items-center gap-1">
                    <Download size={14} />
                    {item.downloads.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-1">
                    {item.currency === 'points' ? (
                      <Coins size={18} className="text-amber-400" />
                    ) : (
                      <Crown size={18} className="text-purple-400" />
                    )}
                    <span className="text-white font-bold">{item.price}</span>
                    <span className="text-slate-400 text-sm">
                      {item.currency === 'points' ? 'Points' : 'Premium'}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addToCart(item)}
                    className="bg-aura-600 hover:bg-aura-700"
                  >
                    <ShoppingCart size={14} className="mr-1" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ================== POINTS SYSTEM ==================
function PointsSystem() {
  const [totalPoints] = useState(2450);
  const [premiumPoints] = useState(50);
  const [transactions] = useState<PointsTransaction[]>([
    { id: '1', type: 'earn', amount: 100, description: 'Daily login bonus (7-day streak!)', timestamp: new Date(), source: 'Daily Reward' },
    { id: '2', type: 'earn', amount: 50, description: 'Helped user in #help-desk', timestamp: new Date(Date.now() - 3600000), source: 'Community' },
    { id: '3', type: 'spend', amount: 200, description: 'Purchased: Steampunk UI Kit', timestamp: new Date(Date.now() - 86400000), source: 'Grand Exchange' },
    { id: '4', type: 'earn', amount: 500, description: 'Achievement unlocked: Creator', timestamp: new Date(Date.now() - 172800000), source: 'Achievement' },
    { id: '5', type: 'earn', amount: 25, description: 'Asset review submitted', timestamp: new Date(Date.now() - 259200000), source: 'Contribution' },
  ]);
  const [achievements] = useState<Achievement[]>(DEMO_ACHIEVEMENTS);
  const [dailyRewards] = useState<DailyReward[]>(DEMO_DAILY_REWARDS);
  const [currentStreak] = useState(5);

  const claimDailyReward = (day: number) => {
    if (day !== currentStreak) {
      toast.error(`Complete day ${currentStreak} first!`);
      return;
    }
    toast.success(`+${dailyRewards[day - 1].points} Points claimed!`);
  };

  return (
    <div className="space-y-6">
      {/* Points Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-900/50 to-slate-900 border-amber-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-400 text-sm font-medium">Aurora Points</p>
                <p className="text-4xl font-bold text-white mt-1">{totalPoints.toLocaleString()}</p>
                <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                  <ArrowUpRight size={14} />
                  +150 this week
                </p>
              </div>
              <Coins size={48} className="text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-slate-900 border-purple-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">Premium Gems</p>
                <p className="text-4xl font-bold text-white mt-1">{premiumPoints}</p>
                <Button variant="outline" size="sm" className="mt-2 text-purple-400 border-purple-600">
                  <Plus size={14} className="mr-1" />
                  Get More
                </Button>
              </div>
              <Crown size={48} className="text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-slate-900 border-orange-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-400 text-sm font-medium">Login Streak</p>
                <p className="text-4xl font-bold text-white mt-1">{currentStreak} Days</p>
                <p className="text-slate-400 text-sm mt-2">🔥 Keep it going!</p>
              </div>
              <Flame size={48} className="text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Rewards */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Gift size={20} className="text-pink-400" />
            Daily Rewards
          </CardTitle>
          <CardDescription>Log in every day to earn bonus points!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {dailyRewards.map((reward) => (
              <button
                key={reward.day}
                onClick={() => claimDailyReward(reward.day)}
                disabled={reward.claimed || reward.day > currentStreak}
                className={`p-4 rounded-lg border-2 text-center transition ${
                  reward.claimed
                    ? 'bg-green-900/30 border-green-700'
                    : reward.day === currentStreak
                    ? 'bg-aura-900/30 border-aura-500 hover:bg-aura-800/50'
                    : 'bg-slate-800 border-slate-700 opacity-50'
                }`}
              >
                <p className="text-xs text-slate-400">Day {reward.day}</p>
                <p className="text-lg font-bold text-white mt-1">
                  {reward.claimed ? '✓' : reward.points}
                </p>
                {reward.bonus && (
                  <p className="text-xs text-amber-400 mt-1">+ {reward.bonus}</p>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <History size={20} className="text-blue-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'earn' ? 'bg-green-900/50' : 'bg-red-900/50'
                }`}>
                  {tx.type === 'earn' ? (
                    <ArrowDownRight size={20} className="text-green-400" />
                  ) : (
                    <ArrowUpRight size={20} className="text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{tx.description}</p>
                  <p className="text-xs text-slate-400">{tx.source} • {tx.timestamp.toLocaleTimeString()}</p>
                </div>
                <p className={`font-semibold ${tx.type === 'earn' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy size={20} className="text-amber-400" />
              Achievements
            </CardTitle>
            <CardDescription>
              {achievements.filter(a => a.unlocked).length}/{achievements.length} unlocked
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border ${
                  achievement.unlocked
                    ? 'bg-green-900/20 border-green-700'
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-2xl ${!achievement.unlocked && 'grayscale'}`}>
                    {achievement.icon}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">{achievement.name}</h4>
                      <span className="text-amber-400 text-sm">+{achievement.points}</span>
                    </div>
                    <p className="text-xs text-slate-400">{achievement.description}</p>
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-aura-500 transition-all"
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {achievement.unlocked && (
                    <CheckCircle size={20} className="text-green-400" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Ways to Earn */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles size={20} className="text-aura-400" />
            Ways to Earn Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: <Calendar size={24} />, title: 'Daily Login', points: '10-100', desc: 'Log in every day' },
              { icon: <Upload size={24} />, title: 'Upload Assets', points: '50-500', desc: 'Share creations' },
              { icon: <MessageCircle size={24} />, title: 'Help Others', points: '25-100', desc: 'Answer questions' },
              { icon: <Star size={24} />, title: 'Get Reviews', points: '10/review', desc: 'Earn from feedback' },
            ].map((way, idx) => (
              <div key={idx} className="p-4 bg-slate-800 rounded-lg text-center">
                <div className="text-aura-400 flex justify-center mb-2">{way.icon}</div>
                <h4 className="text-white font-medium">{way.title}</h4>
                <p className="text-amber-400 font-bold">{way.points} pts</p>
                <p className="text-xs text-slate-400 mt-1">{way.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ================== LEADERBOARD ==================
function Leaderboard() {
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');

  const leaders = [
    { rank: 1, name: 'PixelMaster', avatar: '🎨', points: 15420, change: 2, badge: '🥇' },
    { rank: 2, name: 'CodeWizard', avatar: '🧙', points: 12350, change: -1, badge: '🥈' },
    { rank: 3, name: 'GameDevPro', avatar: '🎮', points: 11200, change: 1, badge: '🥉' },
    { rank: 4, name: 'SoundScape', avatar: '🎵', points: 9870, change: 0, badge: null },
    { rank: 5, name: 'SpriteForge', avatar: '⚔️', points: 8540, change: 3, badge: null },
    { rank: 6, name: '3DBuilder', avatar: '🏗️', points: 7230, change: -2, badge: null },
    { rank: 7, name: 'UIDesigner', avatar: '✨', points: 6890, change: 1, badge: null },
    { rank: 8, name: 'MusicMaker', avatar: '🎼', points: 5670, change: 0, badge: null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-white text-xl font-semibold flex items-center gap-2">
          <Trophy size={24} className="text-amber-400" />
          Top Creators
        </h2>
        <div className="flex gap-2">
          {(['weekly', 'monthly', 'alltime'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              onClick={() => setTimeRange(range)}
              className={timeRange === range ? 'bg-aura-600' : ''}
              size="sm"
            >
              {range === 'weekly' ? 'This Week' : range === 'monthly' ? 'This Month' : 'All Time'}
            </Button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="flex justify-center items-end gap-4 py-8">
        {/* 2nd Place */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-slate-700 rounded-full flex items-center justify-center text-4xl mb-2">
            {leaders[1].avatar}
          </div>
          <p className="text-white font-semibold">{leaders[1].name}</p>
          <p className="text-amber-400">{leaders[1].points.toLocaleString()} pts</p>
          <div className="w-20 h-24 bg-slate-600 rounded-t-lg mt-2 flex items-center justify-center text-3xl">
            🥈
          </div>
        </div>

        {/* 1st Place */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto bg-amber-500/30 rounded-full flex items-center justify-center text-5xl mb-2 border-4 border-amber-500">
            {leaders[0].avatar}
          </div>
          <p className="text-white font-bold text-lg">{leaders[0].name}</p>
          <p className="text-amber-400 font-semibold">{leaders[0].points.toLocaleString()} pts</p>
          <div className="w-24 h-32 bg-amber-600 rounded-t-lg mt-2 flex items-center justify-center text-4xl">
            🥇
          </div>
        </div>

        {/* 3rd Place */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-slate-700 rounded-full flex items-center justify-center text-4xl mb-2">
            {leaders[2].avatar}
          </div>
          <p className="text-white font-semibold">{leaders[2].name}</p>
          <p className="text-amber-400">{leaders[2].points.toLocaleString()} pts</p>
          <div className="w-20 h-16 bg-orange-700 rounded-t-lg mt-2 flex items-center justify-center text-3xl">
            🥉
          </div>
        </div>
      </div>

      {/* Full Leaderboard */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-400 text-sm p-4">Rank</th>
                <th className="text-left text-slate-400 text-sm p-4">Creator</th>
                <th className="text-right text-slate-400 text-sm p-4">Points</th>
                <th className="text-right text-slate-400 text-sm p-4">Change</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((leader) => (
                <tr key={leader.rank} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4">
                    <span className={`font-bold ${leader.rank <= 3 ? 'text-amber-400' : 'text-slate-400'}`}>
                      #{leader.rank}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{leader.avatar}</span>
                      <span className="text-white font-medium">{leader.name}</span>
                      {leader.badge && <span>{leader.badge}</span>}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-white font-semibold">{leader.points.toLocaleString()}</span>
                    <span className="text-slate-400 text-sm ml-1">pts</span>
                  </td>
                  <td className="p-4 text-right">
                    {leader.change > 0 ? (
                      <span className="text-green-400 flex items-center justify-end gap-1">
                        <ArrowUpRight size={14} />
                        {leader.change}
                      </span>
                    ) : leader.change < 0 ? (
                      <span className="text-red-400 flex items-center justify-end gap-1">
                        <ArrowDownRight size={14} />
                        {Math.abs(leader.change)}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// ================== MAIN MARKETPLACE SUITE COMPONENT ==================
export default function MarketplaceSuitePage() {
  const [activeTab, setActiveTab] = useState('exchange');

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <Store size={32} className="text-amber-500" />
                The Grand Exchange
              </h1>
              <p className="text-slate-400">
                Trade assets, earn points, and unlock exclusive content
              </p>
            </div>
            <WalletDisplay userId="demo-user" />
          </div>
        </div>

        {/* Daily Challenge Widget */}
        <div className="mb-8">
          <DailyChallengeWidget section="marketplace" userId="demo-user" compact />
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1">
            <TabsTrigger value="exchange" className="data-[state=active]:bg-aura-600">
              <Store size={16} className="mr-2" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="points" className="data-[state=active]:bg-aura-600">
              <Coins size={16} className="mr-2" />
              Points
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-aura-600">
              <Trophy size={16} className="mr-2" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="exchange">
            <Marketplace />
          </TabsContent>

          <TabsContent value="points">
            <PointsSystem />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

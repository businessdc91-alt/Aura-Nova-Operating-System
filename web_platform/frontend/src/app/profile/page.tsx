'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import {
  User,
  Settings,
  LogIn,
  Sparkles,
  Award,
  Palette,
  Code,
  BookOpen,
  Crown,
  ChevronRight,
  Star,
  Users,
  Trophy,
  Flame,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import { DailyChallengeWidget, WalletDisplay } from '@/components/challenges/DailyChallengeWidget';

// Simulated current user - in production this would come from auth
const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return null;
};

const MEMBERSHIP_TIERS = {
  free: { name: 'Free', color: '#6b7280', icon: <User className="w-5 h-5" /> },
  creator: { name: 'Creator', color: '#10b981', icon: <Palette className="w-5 h-5" /> },
  developer: { name: 'Developer', color: '#3b82f6', icon: <Code className="w-5 h-5" /> },
  catalyst: { name: 'Catalyst', color: '#8b5cf6', icon: <Sparkles className="w-5 h-5" /> },
  prime: { name: 'Prime', color: '#f59e0b', icon: <Crown className="w-5 h-5" /> }
};

const FEATURED_CREATORS = [
  { id: 'aura-nova', name: 'Aura Nova', avatar: '🌟', tier: 'prime', specialty: 'Platform Creator' },
  { id: 'pixel-wizard', name: 'Pixel Wizard', avatar: '🧙', tier: 'catalyst', specialty: 'Art & Design' },
  { id: 'code-ninja', name: 'Code Ninja', avatar: '🥷', tier: 'developer', specialty: 'Game Dev' },
  { id: 'story-weaver', name: 'Story Weaver', avatar: '📖', tier: 'creator', specialty: 'Literature' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
    
    // If user is logged in, redirect to their profile
    if (user?.id) {
      router.push(`/profile/${user.id}`);
    }
  }, [router]);

  const handleCreateProfile = () => {
    // In production, this would trigger auth flow
    const newUser = {
      id: `user-${Date.now()}`,
      username: 'new-creator',
      displayName: 'New Creator',
      joinedAt: new Date().toISOString(),
      tier: 'free'
    };
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    toast.success('Profile created! Redirecting...');
    router.push(`/profile/${newUser.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Profile Hub
              </h1>
              <p className="text-gray-400">Create your profile or explore the community</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WalletDisplay userId="demo-user" />
            <DailyChallengeWidget section="community" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {/* Create Profile CTA */}
        <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30 mb-8">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Aura Nova Studios</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Create your profile to start building, sharing, and connecting with the creative community.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={handleCreateProfile}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Create Profile
              </Button>
              <Link href="/onboarding">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <Settings className="w-4 h-4 mr-2" />
                  Setup Wizard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Membership Tiers */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Membership Tiers
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(MEMBERSHIP_TIERS).map(([key, tier]) => (
              <div 
                key={key}
                className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center hover:border-opacity-100 transition-all"
                style={{ borderColor: tier.color + '40' }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2"
                  style={{ backgroundColor: tier.color + '30' }}
                >
                  {React.cloneElement(tier.icon as React.ReactElement, { style: { color: tier.color } })}
                </div>
                <div className="font-medium text-sm">{tier.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Creators */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Featured Creators
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {FEATURED_CREATORS.map((creator) => (
              <Link 
                key={creator.id}
                href={`/profile/${creator.id}`}
                className="group"
              >
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 flex items-center gap-4 hover:border-purple-500/50 transition-all">
                  <div className="text-4xl">{creator.avatar}</div>
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {creator.name}
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{ 
                          backgroundColor: MEMBERSHIP_TIERS[creator.tier as keyof typeof MEMBERSHIP_TIERS].color + '20',
                          color: MEMBERSHIP_TIERS[creator.tier as keyof typeof MEMBERSHIP_TIERS].color
                        }}
                      >
                        {MEMBERSHIP_TIERS[creator.tier as keyof typeof MEMBERSHIP_TIERS].name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">{creator.specialty}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-4">
          <Link href="/community" className="group">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center hover:border-cyan-500/50 transition-all">
              <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <div className="font-medium">Community</div>
              <div className="text-sm text-gray-400">Find creators</div>
            </div>
          </Link>
          <Link href="/challenges" className="group">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center hover:border-orange-500/50 transition-all">
              <Trophy className="w-8 h-8 text-orange-400 mx-auto mb-2" />
              <div className="font-medium">Challenges</div>
              <div className="text-sm text-gray-400">Earn rewards</div>
            </div>
          </Link>
          <Link href="/art-gallery" className="group">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 text-center hover:border-pink-500/50 transition-all">
              <Heart className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <div className="font-medium">Gallery</div>
              <div className="text-sm text-gray-400">Explore art</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

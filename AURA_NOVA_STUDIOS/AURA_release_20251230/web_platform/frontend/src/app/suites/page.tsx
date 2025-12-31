'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Code, 
  Palette, 
  GraduationCap, 
  Users, 
  Gamepad2, 
  Store, 
  Sparkles,
  ArrowRight,
  Star,
  Zap,
  BookOpen,
  Cpu,
  Heart,
  Trophy,
  Coins
} from 'lucide-react';
import { DailyChallengeWidget, WalletDisplay } from '@/components/challenges/DailyChallengeWidget';

interface Suite {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  emoji: string;
  color: string;
  href: string;
  features: string[];
  stats: { label: string; value: string }[];
  popular?: boolean;
  new?: boolean;
}

export default function SuitesPage() {
  const [hoveredSuite, setHoveredSuite] = useState<string | null>(null);

  const suites: Suite[] = [
    {
      id: 'dev',
      name: 'Dev Suite',
      description: 'Complete development toolkit with AI-powered code generation, debugging, game creation, and component building.',
      icon: <Code className="w-8 h-8" />,
      emoji: '💻',
      color: '#10b981',
      href: '/suites/dev',
      features: [
        'The Dojo - Game Code Generator',
        'Component Constructor',
        'Script Fusion',
        'Code Editor with AI',
        'Debugging Tools'
      ],
      stats: [
        { label: 'Engines', value: '5' },
        { label: 'Languages', value: '10+' },
        { label: 'Templates', value: '50+' }
      ],
      popular: true
    },
    {
      id: 'art',
      name: 'Art Suite',
      description: 'Create stunning visual content with AI art generation, avatar building, sprite creation, and image editing.',
      icon: <Palette className="w-8 h-8" />,
      emoji: '🎨',
      color: '#ec4899',
      href: '/suites/art',
      features: [
        'AI Art Generator',
        'Avatar Builder',
        'Sprite Sheet Creator',
        'Background Remover',
        'Image Effects'
      ],
      stats: [
        { label: 'Styles', value: '20+' },
        { label: 'Tools', value: '15' },
        { label: 'Filters', value: '30+' }
      ],
      popular: true
    },
    {
      id: 'academics',
      name: 'Academics Suite',
      description: 'AI-powered learning with tutoring, flashcards, quizzes, and study planning across all subjects.',
      icon: <GraduationCap className="w-8 h-8" />,
      emoji: '📚',
      color: '#8b5cf6',
      href: '/suites/academics',
      features: [
        'AI Tutor Assistant',
        'Smart Flashcards',
        'Quiz Generator',
        'Study Planner',
        'Subject Explanations'
      ],
      stats: [
        { label: 'Subjects', value: '25+' },
        { label: 'Modes', value: '5' },
        { label: 'Levels', value: '6' }
      ]
    },
    {
      id: 'community',
      name: 'Community Suite',
      description: 'Connect with creators through real-time chat, collaborative projects, and social features.',
      icon: <Users className="w-8 h-8" />,
      emoji: '👥',
      color: '#06b6d4',
      href: '/suites/community',
      features: [
        'Real-time Chat',
        'Collaboration Rooms',
        'Project Sharing',
        'User Profiles',
        'Activity Feed'
      ],
      stats: [
        { label: 'Channels', value: '∞' },
        { label: 'Emojis', value: '100+' },
        { label: 'Badges', value: '20' }
      ]
    },
    {
      id: 'games',
      name: 'Games Suite',
      description: 'Fun mini-games and creative challenges to take a break and earn rewards.',
      icon: <Gamepad2 className="w-8 h-8" />,
      emoji: '🎮',
      color: '#f59e0b',
      href: '/suites/games',
      features: [
        'Code Breaker',
        'Word Games',
        'Puzzle Challenges',
        'Daily Quests',
        'Leaderboards'
      ],
      stats: [
        { label: 'Games', value: '10+' },
        { label: 'Levels', value: '50+' },
        { label: 'Rewards', value: '100+' }
      ]
    },
    {
      id: 'marketplace',
      name: 'Grand Exchange',
      description: 'Trade assets, templates, and creations with other users in the marketplace.',
      icon: <Store className="w-8 h-8" />,
      emoji: '🏪',
      color: '#ef4444',
      href: '/suites/marketplace',
      features: [
        'Asset Trading',
        'Template Store',
        'Creator Shop',
        'Auctions',
        'Currency Exchange'
      ],
      stats: [
        { label: 'Items', value: '1000+' },
        { label: 'Categories', value: '15' },
        { label: 'Trades', value: '∞' }
      ],
      new: true
    },
    {
      id: 'aetherium',
      name: 'Aetherium TCG',
      description: 'Collect, trade, and battle with digital trading cards in this immersive card game.',
      icon: <Sparkles className="w-8 h-8" />,
      emoji: '✨',
      color: '#6366f1',
      href: '/suites/aetherium',
      features: [
        'Card Collection',
        'Deck Building',
        'PvP Battles',
        'Daily Rewards',
        'Tournaments'
      ],
      stats: [
        { label: 'Cards', value: '500+' },
        { label: 'Rarities', value: '5' },
        { label: 'Decks', value: '∞' }
      ],
      new: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Creative Suites
              </h1>
              <p className="text-gray-400">Your complete toolkit for creation, learning, and play</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <WalletDisplay userId="demo-user" />
            <DailyChallengeWidget section="dev" />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Zap className="w-5 h-5" />, label: 'Suites', value: '7', color: 'from-yellow-500 to-orange-500' },
            { icon: <Star className="w-5 h-5" />, label: 'Tools', value: '50+', color: 'from-purple-500 to-pink-500' },
            { icon: <Trophy className="w-5 h-5" />, label: 'Challenges', value: 'Daily', color: 'from-green-500 to-emerald-500' },
            { icon: <Coins className="w-5 h-5" />, label: 'Rewards', value: '∞', color: 'from-blue-500 to-cyan-500' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Suites Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suites.map((suite) => (
            <Link
              key={suite.id}
              href={suite.href}
              className="group relative"
              onMouseEnter={() => setHoveredSuite(suite.id)}
              onMouseLeave={() => setHoveredSuite(null)}
            >
              <div 
                className="relative bg-gray-800/70 rounded-2xl p-6 border border-gray-700/50 
                           transition-all duration-300 hover:border-opacity-100 overflow-hidden
                           hover:shadow-xl hover:-translate-y-1"
                style={{ 
                  borderColor: hoveredSuite === suite.id ? suite.color : undefined,
                  boxShadow: hoveredSuite === suite.id ? `0 10px 40px ${suite.color}30` : undefined
                }}
              >
                {/* Badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {suite.popular && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                      <Star className="w-3 h-3" /> Popular
                    </span>
                  )}
                  {suite.new && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> New
                    </span>
                  )}
                </div>

                {/* Icon & Title */}
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="p-3 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${suite.color}20` }}
                  >
                    <span className="text-3xl">{suite.emoji}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-white/90">
                      {suite.name}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{suite.description}</p>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Features</div>
                  <div className="flex flex-wrap gap-2">
                    {suite.features.slice(0, 3).map((feature, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 rounded-lg text-xs bg-gray-700/50 text-gray-300"
                      >
                        {feature}
                      </span>
                    ))}
                    {suite.features.length > 3 && (
                      <span className="px-2 py-1 rounded-lg text-xs bg-gray-700/50 text-gray-400">
                        +{suite.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 pt-4 border-t border-gray-700/50">
                  {suite.stats.map((stat, idx) => (
                    <div key={idx} className="text-center flex-1">
                      <div className="text-lg font-bold" style={{ color: suite.color }}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Hover Arrow */}
                <div 
                  className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all 
                             transform translate-x-2 group-hover:translate-x-0"
                >
                  <ArrowRight className="w-5 h-5" style={{ color: suite.color }} />
                </div>

                {/* Background Glow */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 50%, ${suite.color}, transparent 70%)` }}
                />
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-gray-400">
            <Heart className="w-4 h-4 text-pink-500" />
            <span>More suites coming soon! Have suggestions?</span>
            <Link href="/chat" className="text-purple-400 hover:text-purple-300 underline">
              Let us know
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

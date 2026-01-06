'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import {
  Gamepad2,
  Palette,
  Boxes,
  Combine,
  FolderKanban,
  Code2,
  Sparkles,
  Zap,
  Users,
  Trophy,
  MessageSquare,
  Store,
  FlaskConical,
  BookOpen,
  Rocket,
  ArrowRight,
  Monitor,
  Brain,
  Music,
  PenTool,
  HelpCircle,
  Compass,
  Bot,
  GraduationCap,
  Map,
} from 'lucide-react';

interface ToolCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  color: string;
  status: 'ready' | 'coming-soon' | 'beta';
}

const CREATIVE_TOOLS: ToolCard[] = [
  {
    title: 'OS Mode',
    description: 'Full desktop experience with windowed apps, taskbar, and seamless multitasking',
    href: '/os',
    icon: Monitor,
    color: 'from-purple-600 to-pink-600',
    status: 'ready',
  },
  {
    title: 'The Dojo',
    description: 'Generate game characters, systems, and mechanics with production-ready Unreal & Unity code',
    href: '/dojo',
    icon: Gamepad2,
    color: 'from-red-600 to-orange-600',
    status: 'ready',
  },
  {
    title: 'Art Studio',
    description: 'Background remover, sprite animation creator, and AI model download hub',
    href: '/art-studio',
    icon: Palette,
    color: 'from-cyan-600 to-blue-600',
    status: 'ready',
  },
  {
    title: 'AI Games Arcade',
    description: 'Play Tic Tac Toe, Checkers, and Chess against AI or watch AI vs AI battles',
    href: '/os',
    icon: Brain,
    color: 'from-amber-600 to-orange-600',
    status: 'ready',
  },
  {
    title: 'NovaCode Sandbox',
    description: 'Learn coding with a custom language, complete challenges, and earn rewards',
    href: '/os',
    icon: Code2,
    color: 'from-green-600 to-emerald-600',
    status: 'ready',
  },
  {
    title: 'Literature Zone',
    description: 'Music composer, poetry creator, and collaborative writing tools',
    href: '/literature-zone',
    icon: PenTool,
    color: 'from-indigo-600 to-purple-600',
    status: 'ready',
  },
  {
    title: 'Component Constructor',
    description: 'Build React, Vue, and Svelte components with Storybook stories and tests',
    href: '/constructor',
    icon: Boxes,
    color: 'from-cyan-600 to-blue-600',
    status: 'ready',
  },
  {
    title: 'Script Fusion',
    description: 'Intelligently merge multiple scripts with conflict detection and resolution',
    href: '/script-fusion',
    icon: Combine,
    color: 'from-blue-600 to-indigo-600',
    status: 'ready',
  },
  {
    title: 'Workspace',
    description: 'Central hub for all your created assets, projects, and downloaded content',
    href: '/workspace',
    icon: FolderKanban,
    color: 'from-emerald-600 to-teal-600',
    status: 'ready',
  },
];

const COMMUNITY_FEATURES: ToolCard[] = [
  {
    title: 'Collaboration Hub',
    description: 'Find teammates and collaborate on creative projects together',
    href: '/collaboration',
    icon: Users,
    color: 'from-violet-600 to-purple-600',
    status: 'beta',
  },
  {
    title: 'Social Network',
    description: 'Connect with creators, share work, join groups, and participate in events',
    href: '/social',
    icon: MessageSquare,
    color: 'from-green-600 to-emerald-600',
    status: 'ready',
  },
  {
    title: 'Leaderboards',
    description: 'Compete, earn points, and climb the creator rankings',
    href: '/leaderboards',
    icon: Trophy,
    color: 'from-yellow-600 to-amber-600',
    status: 'coming-soon',
  },
];

const ADVANCED_TOOLS: ToolCard[] = [
  {
    title: 'Grand Exchange',
    description: 'Marketplace for trading digital assets, templates, and creations',
    href: '/exchange',
    icon: Store,
    color: 'from-amber-600 to-orange-600',
    status: 'coming-soon',
  },
  {
    title: 'Chemistry Lab',
    description: 'Experimental AI features and bleeding-edge creative tools',
    href: '/lab',
    icon: FlaskConical,
    color: 'from-lime-600 to-green-600',
    status: 'coming-soon',
  },
  {
    title: 'Aetherium TCG',
    description: '800-card trading card game with procedural generation',
    href: '/suites/aetherium',
    icon: Sparkles,
    color: 'from-pink-600 to-rose-600',
    status: 'ready',
  },
];

function ToolCardComponent({ tool }: { tool: ToolCard }) {
  const Icon = tool.icon;
  const isDisabled = tool.status === 'coming-soon';

  const content = (
    <Card
      className={`relative bg-slate-800 border-slate-700 overflow-hidden transition-all duration-300 ${
        isDisabled
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:border-slate-500 hover:scale-[1.02] cursor-pointer'
      }`}
    >
      {/* Gradient top bar */}
      <div className={`h-1 bg-gradient-to-r ${tool.color}`} />

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center`}>
            <Icon size={24} className="text-white" />
          </div>
          {tool.status !== 'ready' && (
            <span
              className={`text-xs font-semibold px-2 py-1 rounded ${
                tool.status === 'beta'
                  ? 'bg-blue-600/30 text-blue-300'
                  : 'bg-slate-600/30 text-slate-400'
              }`}
            >
              {tool.status === 'beta' ? 'BETA' : 'COMING SOON'}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-white mb-2">{tool.title}</h3>
        <p className="text-slate-400 text-sm mb-4">{tool.description}</p>

        {!isDisabled && (
          <div className="flex items-center text-sm font-semibold text-white">
            Launch <ArrowRight size={16} className="ml-2" />
          </div>
        )}
      </div>
    </Card>
  );

  if (isDisabled) {
    return content;
  }

  return <Link href={tool.href}>{content}</Link>;
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 w-full max-w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-aura-600/20 to-purple-600/20 blur-3xl" />
        <div className="relative px-4 sm:px-6 lg:px-8 py-16 text-center max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Rocket size={48} className="text-aura-400" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">AuraNova Studios</h1>
          </div>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Your all-in-one creative platform. Generate game code, design sprites,
            build components, and collaborate with creators worldwide.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/os"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg transition flex items-center gap-2 shadow-lg shadow-purple-600/30"
            >
              <Monitor size={20} /> Launch OS Mode
            </Link>
            <Link
              href="/dojo"
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-lg transition flex items-center gap-2"
            >
              <Gamepad2 size={20} /> Enter The Dojo
            </Link>
            <Link
              href="/art-studio"
              className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-lg transition flex items-center gap-2"
            >
              <Palette size={20} /> Art Studio
            </Link>
          </div>

          {/* OS Feature Highlight */}
          <div className="mt-8 p-4 bg-purple-900/20 rounded-xl border border-purple-500/30 max-w-2xl mx-auto">
            <p className="text-purple-300 text-sm">
              <Sparkles size={16} className="inline mr-2" />
              <strong>NEW:</strong> Try our OS Mode for a complete desktop experience with windowed apps, 
              AI games, coding sandbox, file manager and more!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16 max-w-7xl mx-auto">
        {/* Creative Tools */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Zap size={28} className="text-aura-400" />
            <h2 className="text-2xl font-bold text-white">Creative Tools</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CREATIVE_TOOLS.map((tool) => (
              <ToolCardComponent key={tool.href} tool={tool} />
            ))}
          </div>
        </section>

        {/* Community Features */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Users size={28} className="text-green-400" />
            <h2 className="text-2xl font-bold text-white">Community</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COMMUNITY_FEATURES.map((tool) => (
              <ToolCardComponent key={tool.href} tool={tool} />
            ))}
          </div>
        </section>

        {/* Advanced Tools */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles size={28} className="text-pink-400" />
            <h2 className="text-2xl font-bold text-white">Advanced</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ADVANCED_TOOLS.map((tool) => (
              <ToolCardComponent key={tool.href} tool={tool} />
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-slate-800 to-slate-800/50 border-slate-700">
            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                  <p className="text-3xl font-bold text-white">6</p>
                  <p className="text-slate-400">Creative Tools</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-aura-400">5</p>
                  <p className="text-slate-400">Game Engines</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-400">3</p>
                  <p className="text-slate-400">UI Frameworks</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-400">4</p>
                  <p className="text-slate-400">AI Models</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Need Help? - Guide Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Compass size={28} className="text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Need Help Getting Started?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ask Aura Card */}
            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer group">
              <Link href="/guide?tab=ask">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Bot size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Ask Aura</h3>
                  <p className="text-purple-200/80 text-sm mb-4">
                    Chat with our AI assistant. Tell Aura what you want to create and get guided to the right tools.
                  </p>
                  <div className="flex items-center text-purple-300 text-sm font-semibold group-hover:text-white transition-colors">
                    Start chatting <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </Link>
            </Card>

            {/* Explore Features Card */}
            <Card className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border-cyan-500/30 hover:border-cyan-400/50 transition-all cursor-pointer group">
              <Link href="/guide?tab=features">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Map size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Explore Features</h3>
                  <p className="text-cyan-200/80 text-sm mb-4">
                    Browse all creative tools, suites, and features. Find exactly what you need.
                  </p>
                  <div className="flex items-center text-cyan-300 text-sm font-semibold group-hover:text-white transition-colors">
                    View all features <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </Link>
            </Card>

            {/* Quick Start Card */}
            <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30 hover:border-green-400/50 transition-all cursor-pointer group">
              <Link href="/guide?tab=quickstart">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <GraduationCap size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Quick Start</h3>
                  <p className="text-green-200/80 text-sm mb-4">
                    5-step guide to get you creating in minutes. Perfect for new users.
                  </p>
                  <div className="flex items-center text-green-300 text-sm font-semibold group-hover:text-white transition-colors">
                    Get started <ArrowRight size={16} className="ml-2" />
                  </div>
                </div>
              </Link>
            </Card>
          </div>

          {/* Floating helper tip */}
          <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700 flex items-center gap-4">
            <div className="p-2 rounded-full bg-purple-500/20">
              <HelpCircle size={20} className="text-purple-400" />
            </div>
            <p className="text-slate-300 text-sm flex-1">
              <strong>Pro tip:</strong> Click the floating <span className="text-purple-400">✨ Aura</span> button 
              in the bottom-right corner anytime you need help. Aura can guide you anywhere!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

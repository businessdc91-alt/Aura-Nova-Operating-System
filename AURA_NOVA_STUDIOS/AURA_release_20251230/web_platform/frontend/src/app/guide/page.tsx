'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import {
  Search,
  Sparkles,
  Code,
  Palette,
  Music,
  BookOpen,
  GraduationCap,
  Gamepad2,
  Users,
  Store,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Compass,
  Lightbulb,
  Zap,
  Star,
  Play,
  Download,
  Share2,
  MessageCircle,
  Map,
  Layers,
  Target,
} from 'lucide-react';
import { AuraGuideChat } from '@/components/guide/AuraGuideChat';
import { auraGuide, PLATFORM_FEATURES, FeatureGuide } from '@/services/auraGuideService';
import { DailyChallengeWidget, WalletDisplay } from '@/components/challenges/DailyChallengeWidget';

// ============================================================================
// GUIDE PAGE - Complete help and navigation hub
// ============================================================================

export default function GuidePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Features', icon: <Layers className="w-4 h-4" /> },
    { id: 'dev', name: 'Development', icon: <Code className="w-4 h-4" /> },
    { id: 'art', name: 'Art & Design', icon: <Palette className="w-4 h-4" /> },
    { id: 'academics', name: 'Learning', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'games', name: 'Games', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'community', name: 'Community', icon: <Users className="w-4 h-4" /> },
    { id: 'marketplace', name: 'Marketplace', icon: <Store className="w-4 h-4" /> },
  ];

  const filteredFeatures = PLATFORM_FEATURES.filter(feature => {
    const matchesSearch = searchQuery === '' || 
      feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.keywords.some(k => k.includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || feature.suite === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const featuresBySuite = auraGuide.getFeaturesBySuite();

  const quickStartSteps = [
    {
      step: 1,
      title: 'Set Up Your AI',
      description: 'Connect a local AI model or use cloud AI',
      icon: '🤖',
      route: '/onboarding',
      time: '5 min',
    },
    {
      step: 2,
      title: 'Explore OS Mode',
      description: 'Try the desktop experience with multiple apps',
      icon: '🖥️',
      route: '/os',
      time: '2 min',
    },
    {
      step: 3,
      title: 'Create Something',
      description: 'Generate game code, art, or music',
      icon: '✨',
      route: '/suites',
      time: '10 min',
    },
    {
      step: 4,
      title: 'Complete a Challenge',
      description: 'Earn your first Aether Coins',
      icon: '🏆',
      route: '/challenges',
      time: '3 min',
    },
    {
      step: 5,
      title: 'Join the Community',
      description: 'Connect with other creators',
      icon: '👥',
      route: '/chat',
      time: '5 min',
    },
  ];

  const externalGuides = [
    {
      title: 'Using Generated Code in Unreal Engine',
      description: 'Learn how to take code from The Dojo and integrate it into your UE5 project',
      icon: '🎮',
      steps: [
        'Generate code in The Dojo with Unreal Engine selected',
        'Copy the .h and .cpp files',
        'In Unreal, create matching files in your Source folder',
        'Paste the code and compile (Ctrl+Alt+F11)',
        'The class will appear in your Content Browser',
      ],
    },
    {
      title: 'Exporting Sprites for Game Development',
      description: 'How to create sprite sheets and use them in game engines',
      icon: '🎨',
      steps: [
        'Create your animation in Art Studio',
        'Export as sprite sheet (PNG with JSON atlas)',
        'Import into your game engine',
        'Use the atlas data to set up animations',
        'Configure animation frames in your engine',
      ],
    },
    {
      title: 'Using AI-Generated Music',
      description: 'Export your compositions for use in videos, games, or streaming',
      icon: '🎵',
      steps: [
        'Compose your track in Music Composer',
        'Export as WAV for direct use',
        'Export as MIDI for DAW editing',
        'Import into your video editor or game',
        'All exports are royalty-free for your projects',
      ],
    },
    {
      title: 'Local AI Model Setup',
      description: 'Run AI locally on your computer for privacy and no API costs',
      icon: '💻',
      steps: [
        'Download LM Studio from lmstudio.ai',
        'Install a model (2-4B recommended for laptops)',
        'Start the local server in LM Studio',
        'Go to AuraNova Setup Wizard',
        'Enter your local endpoint and connect',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600">
                <Compass className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                  Guide & Help Center
                </h1>
                <p className="text-gray-400 mt-1">Everything you need to master AuraNova Studios</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <WalletDisplay userId="demo-user" />
              <DailyChallengeWidget section="dev" compact />
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search features, tools, tutorials..."
                className="w-full pl-12 pr-4 py-6 text-lg bg-gray-800/70 border-gray-700 rounded-xl 
                           focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center gap-2 flex-wrap mb-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${selectedCategory === cat.id 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-gray-800/50">
            <TabsTrigger value="features" className="data-[state=active]:bg-purple-600">
              <Layers className="w-4 h-4 mr-2" />
              All Features
            </TabsTrigger>
            <TabsTrigger value="quickstart" className="data-[state=active]:bg-purple-600">
              <Zap className="w-4 h-4 mr-2" />
              Quick Start
            </TabsTrigger>
            <TabsTrigger value="external" className="data-[state=active]:bg-purple-600">
              <ExternalLink className="w-4 h-4 mr-2" />
              External Use
            </TabsTrigger>
            <TabsTrigger value="ask" className="data-[state=active]:bg-purple-600">
              <MessageCircle className="w-4 h-4 mr-2" />
              Ask Aura
            </TabsTrigger>
          </TabsList>

          {/* Features Tab */}
          <TabsContent value="features">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFeatures.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} />
              ))}
            </div>
            {filteredFeatures.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No features match your search.</p>
                <Button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  variant="outline"
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Quick Start Tab */}
          <TabsContent value="quickstart">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Get Started in 5 Steps</h2>
                <p className="text-gray-400">Follow this path to unlock the full potential of AuraNova Studios</p>
              </div>

              <div className="space-y-4">
                {quickStartSteps.map((step, idx) => (
                  <Link key={step.step} href={step.route}>
                    <div className="group flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 
                                    hover:border-purple-500/50 hover:bg-gray-800 transition-all cursor-pointer">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 
                                      flex items-center justify-center text-2xl">
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-400">STEP {step.step}</span>
                          <span className="text-xs text-gray-500">• {step.time}</span>
                        </div>
                        <h3 className="font-semibold text-white">{step.title}</h3>
                        <p className="text-sm text-gray-400">{step.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/20">
                <div className="flex items-start gap-4">
                  <Lightbulb className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-2">Pro Tip</h4>
                    <p className="text-gray-300 text-sm">
                      Use the floating Aura button (bottom-right corner) anytime you're stuck. 
                      Aura can guide you to the right tool, explain features, and even help you create!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* External Use Tab */}
          <TabsContent value="external">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Use Your Creations Everywhere</h2>
                <p className="text-gray-400">Learn how to export and use your work in external tools</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {externalGuides.map((guide, idx) => (
                  <Card key={idx} className="bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50 transition-all">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{guide.icon}</span>
                        <div>
                          <CardTitle className="text-white text-lg">{guide.title}</CardTitle>
                          <p className="text-sm text-gray-400">{guide.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2">
                        {guide.steps.map((step, stepIdx) => (
                          <li key={stepIdx} className="flex items-start gap-2 text-sm">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-600/30 text-purple-400 
                                           flex items-center justify-center text-xs font-bold">
                              {stepIdx + 1}
                            </span>
                            <span className="text-gray-300">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4">
                <Card className="bg-gray-800/30 border-gray-700/50 p-6 text-center">
                  <Download className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-1">Export Formats</h4>
                  <p className="text-sm text-gray-400">PNG, ZIP, MIDI, WAV, JSON, TXT, PDF</p>
                </Card>
                <Card className="bg-gray-800/30 border-gray-700/50 p-6 text-center">
                  <Share2 className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-1">Share Anywhere</h4>
                  <p className="text-sm text-gray-400">Social media, portfolios, game engines</p>
                </Card>
                <Card className="bg-gray-800/30 border-gray-700/50 p-6 text-center">
                  <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-1">100% Yours</h4>
                  <p className="text-sm text-gray-400">Full ownership of all creations</p>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Ask Aura Tab */}
          <TabsContent value="ask">
            <div className="max-w-3xl mx-auto">
              <div className="h-[600px]">
                <AuraGuideChat variant="embedded" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================================================
// Feature Card Component
// ============================================================================

function FeatureCard({ feature }: { feature: FeatureGuide }) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);

  const suiteColors: Record<string, string> = {
    dev: 'from-green-500 to-emerald-600',
    art: 'from-pink-500 to-rose-600',
    academics: 'from-purple-500 to-violet-600',
    games: 'from-orange-500 to-amber-600',
    community: 'from-cyan-500 to-blue-600',
    marketplace: 'from-red-500 to-rose-600',
    system: 'from-gray-500 to-slate-600',
  };

  const suiteIcons: Record<string, string> = {
    dev: '💻',
    art: '🎨',
    academics: '📚',
    games: '🎮',
    community: '👥',
    marketplace: '🏪',
    system: '⚙️',
  };

  return (
    <Card 
      className="bg-gray-800/50 border-gray-700/50 hover:border-purple-500/50 transition-all cursor-pointer group"
      onClick={() => router.push(feature.route)}
    >
      <CardContent className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${suiteColors[feature.suite] || suiteColors.system} 
                          flex items-center justify-center text-lg`}>
            {suiteIcons[feature.suite] || '⭐'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
              {feature.name}
            </h3>
            <span className="text-xs text-gray-500 uppercase tracking-wider">{feature.suite} suite</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
        </div>

        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{feature.description}</p>

        <div className="flex flex-wrap gap-1">
          {feature.keywords.slice(0, 4).map((keyword, idx) => (
            <span key={idx} className="px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-400">
              {keyword}
            </span>
          ))}
          {feature.keywords.length > 4 && (
            <span className="px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-500">
              +{feature.keywords.length - 4}
            </span>
          )}
        </div>

        {feature.capabilities.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <div className="text-xs text-gray-500 mb-1">Key capabilities:</div>
            <ul className="space-y-1">
              {feature.capabilities.slice(0, 2).map((cap, idx) => (
                <li key={idx} className="text-xs text-gray-400 flex items-center gap-1">
                  <ChevronRight className="w-3 h-3 text-purple-500" />
                  {cap}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

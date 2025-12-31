'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import {
  Trophy,
  Coins,
  Sparkles,
  Star,
  Clock,
  Target,
  Gift,
  Zap,
  Crown,
  ArrowRight,
  CheckCircle,
  Code,
  Palette,
  GraduationCap,
  Gamepad2,
  Store,
  Users,
  BookOpen,
  Atom,
  TrendingUp,
  Calendar,
  Award,
} from 'lucide-react';
import { AllChallengesOverview, WalletDisplay } from '@/components/challenges/DailyChallengeWidget';
import { getWallet, getTransactionHistory, getDailyProgress, type CurrencyTransaction } from '@/services/currencyService';

// Section info for navigation
const SECTION_INFO = [
  { id: 'dev', name: 'Dev Suite', icon: Code, color: 'purple', href: '/suites/dev' },
  { id: 'art', name: 'Art Suite', icon: Palette, color: 'pink', href: '/suites/art' },
  { id: 'academics', name: 'Academics', icon: GraduationCap, color: 'amber', href: '/suites/academics' },
  { id: 'games', name: 'Games Arena', icon: Gamepad2, color: 'green', href: '/suites/games' },
  { id: 'marketplace', name: 'Marketplace', icon: Store, color: 'orange', href: '/suites/marketplace' },
  { id: 'community', name: 'Community', icon: Users, color: 'blue', href: '/suites/community' },
  { id: 'aetherium', name: 'Aetherium TCG', icon: Crown, color: 'amber', href: '/suites/aetherium' },
  { id: 'literature', name: 'Literature', icon: BookOpen, color: 'indigo', href: '/literature-zone' },
];

export default function ChallengesPage() {
  const [wallet, setWallet] = useState<{ coins: number; points: number; lifetime: number } | null>(null);
  const [transactions, setTransactions] = useState<CurrencyTransaction[]>([]);
  const [progress, setProgress] = useState<ReturnType<typeof getDailyProgress> | null>(null);
  
  useEffect(() => {
    const w = getWallet('demo-user');
    setWallet({ coins: w.aetherCoins, points: w.auroraPoints, lifetime: w.lifetimeCoins });
    
    const txs = getTransactionHistory('demo-user', 10);
    setTransactions(txs);
    
    const p = getDailyProgress('demo-user');
    setProgress(p);
  }, []);
  
  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <Trophy size={32} className="text-amber-400" />
                Daily Challenges Hub
              </h1>
              <p className="text-slate-400">
                Complete AI persona challenges across all sections to earn Aether Coins for the Aetherium TCG!
              </p>
            </div>
            <WalletDisplay userId="demo-user" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-amber-900/50 to-slate-900 border-amber-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Coins className="w-8 h-8 text-amber-400" />
                <div>
                  <p className="text-2xl font-bold text-amber-300">{wallet?.coins || 0}</p>
                  <p className="text-xs text-slate-400">Aether Coins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-900/50 to-slate-900 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-purple-300">{wallet?.points || 0}</p>
                  <p className="text-xs text-slate-400">Aurora Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-900/50 to-slate-900 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-green-300">{progress?.challengesCompleted || 0}/8</p>
                  <p className="text-xs text-slate-400">Today's Challenges</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-900/50 to-slate-900 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-blue-300">{wallet?.lifetime || 0}</p>
                  <p className="text-xs text-slate-400">Lifetime Coins</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Challenges Overview */}
        <AllChallengesOverview userId="demo-user" />

        {/* Quick Navigation */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-purple-400" />
            Quick Access to Suites
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SECTION_INFO.map(section => {
              const Icon = section.icon;
              const sectionProgress = progress?.sectionProgress?.[section.id];
              const isComplete = sectionProgress?.earned === sectionProgress?.max;
              
              return (
                <Link key={section.id} href={section.href}>
                  <Card className={`
                    bg-slate-900/80 border-slate-700 cursor-pointer transition-all duration-200
                    hover:border-${section.color}-500/70 hover:scale-102
                    ${isComplete ? 'opacity-75' : ''}
                  `}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center
                          bg-${section.color}-500/20
                        `}>
                          <Icon className={`w-5 h-5 text-${section.color}-400`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white text-sm">{section.name}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            {isComplete ? (
                              <span className="text-green-400 flex items-center gap-1">
                                <CheckCircle size={12} /> Complete
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Coins size={12} className="text-amber-400" />
                                {sectionProgress?.max - (sectionProgress?.earned || 0)} available
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Recent Transactions
          </h2>
          <Card className="bg-slate-900/80 border-slate-700">
            <CardContent className="p-4">
              {transactions.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  No transactions yet. Complete challenges to earn coins!
                </p>
              ) : (
                <div className="space-y-2">
                  {transactions.map(tx => (
                    <div 
                      key={tx.id} 
                      className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          ${tx.type === 'earn' ? 'bg-green-500/20' : 'bg-red-500/20'}
                        `}>
                          {tx.type === 'earn' ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <Store className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm text-white">{tx.description}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(tx.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className={`
                        font-bold
                        ${tx.type === 'earn' ? 'text-green-400' : 'text-red-400'}
                      `}>
                        {tx.type === 'earn' ? '+' : '-'}{tx.amount} {tx.currency === 'coins' ? '🪙' : '✨'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-400" />
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900/80 border-slate-700">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="font-bold text-white mb-2">Complete Challenges</h3>
                <p className="text-sm text-slate-400">
                  Each suite has a unique AI persona with daily challenges. Answer correctly to earn rewards!
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/80 border-slate-700">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="font-bold text-white mb-2">Earn Aether Coins</h3>
                <p className="text-sm text-slate-400">
                  Get 1-2 coins per challenge. Earn up to 12 coins daily across all sections!
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-900/80 border-slate-700">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="font-bold text-white mb-2">Buy Card Packs</h3>
                <p className="text-sm text-slate-400">
                  Spend coins in the Aetherium TCG shop to buy card packs and build your collection!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Daily Reset Timer */}
        <div className="mt-12 text-center pb-8">
          <div className="inline-flex items-center gap-2 bg-slate-900/80 px-6 py-3 rounded-full border border-slate-700">
            <Clock className="w-5 h-5 text-slate-400" />
            <span className="text-slate-400">Challenges reset at midnight</span>
          </div>
        </div>
      </div>
    </div>
  );
}

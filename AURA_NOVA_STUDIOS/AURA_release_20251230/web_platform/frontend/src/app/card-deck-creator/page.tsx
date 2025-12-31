'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Layers, ArrowLeft, Download, Save, Palette, Type, Image, Shuffle,
  Sparkles, Plus, Trash2, Copy, Eye, Wand2, Grid3X3, RotateCw,
  Diamond, Heart, Club, Spade, Crown, Star, Zap, Flame, Snowflake,
  Moon, Sun, Leaf, Skull, Ghost, Cat, Dog, Bird, Fish, Bug,
} from 'lucide-react';
import { DailyChallengeWidget, WalletDisplay } from '@/components/challenges/DailyChallengeWidget';

// ============================================================================
// CUSTOM CARD DECK CREATOR - Design unique playing cards
// ============================================================================

interface PlayingCard {
  id: string;
  suit: string;
  rank: string;
  frontDesign: CardDesign;
  isJoker?: boolean;
  customName?: string;
}

interface CardDesign {
  backgroundColor: string;
  suitColor: string;
  borderColor: string;
  pattern: string;
  artwork?: string;
}

interface DeckTheme {
  id: string;
  name: string;
  description: string;
  suits: { id: string; name: string; symbol: string; color: string }[];
  cardBack: string;
  borderStyle: string;
  preview: string;
}

const STANDARD_SUITS = [
  { id: 'hearts', name: 'Hearts', symbol: '♥', color: '#e74c3c' },
  { id: 'diamonds', name: 'Diamonds', symbol: '♦', color: '#e74c3c' },
  { id: 'clubs', name: 'Clubs', symbol: '♣', color: '#2c3e50' },
  { id: 'spades', name: 'Spades', symbol: '♠', color: '#2c3e50' },
];

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const DECK_THEMES: DeckTheme[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional red & black playing cards',
    suits: STANDARD_SUITS,
    cardBack: 'linear-gradient(135deg, #c0392b 0%, #8e44ad 100%)',
    borderStyle: 'solid',
    preview: '🎴',
  },
  {
    id: 'royal',
    name: 'Royal Gold',
    description: 'Luxurious gold accents on deep purple',
    suits: [
      { id: 'crowns', name: 'Crowns', symbol: '👑', color: '#f1c40f' },
      { id: 'scepters', name: 'Scepters', symbol: '⚜️', color: '#f1c40f' },
      { id: 'shields', name: 'Shields', symbol: '🛡️', color: '#9b59b6' },
      { id: 'swords', name: 'Swords', symbol: '⚔️', color: '#9b59b6' },
    ],
    cardBack: 'linear-gradient(135deg, #2c3e50 0%, #4a0080 50%, #2c3e50 100%)',
    borderStyle: 'double',
    preview: '👑',
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Earth, water, fire, and air elements',
    suits: [
      { id: 'fire', name: 'Fire', symbol: '🔥', color: '#e74c3c' },
      { id: 'water', name: 'Water', symbol: '💧', color: '#3498db' },
      { id: 'earth', name: 'Earth', symbol: '🌿', color: '#27ae60' },
      { id: 'air', name: 'Air', symbol: '💨', color: '#95a5a6' },
    ],
    cardBack: 'linear-gradient(135deg, #1a5276 0%, #196f3d 50%, #7b241c 100%)',
    borderStyle: 'solid',
    preview: '🌿',
  },
  {
    id: 'celestial',
    name: 'Celestial',
    description: 'Stars, moons, suns, and cosmic symbols',
    suits: [
      { id: 'stars', name: 'Stars', symbol: '⭐', color: '#f39c12' },
      { id: 'moons', name: 'Moons', symbol: '🌙', color: '#9b59b6' },
      { id: 'suns', name: 'Suns', symbol: '☀️', color: '#e67e22' },
      { id: 'comets', name: 'Comets', symbol: '☄️', color: '#3498db' },
    ],
    cardBack: 'linear-gradient(135deg, #0c0c1e 0%, #1a1a3e 50%, #2d1b69 100%)',
    borderStyle: 'solid',
    preview: '⭐',
  },
  {
    id: 'animals',
    name: 'Animal Kingdom',
    description: 'Four animal families for card suits',
    suits: [
      { id: 'cats', name: 'Cats', symbol: '🐱', color: '#e67e22' },
      { id: 'dogs', name: 'Dogs', symbol: '🐕', color: '#8b4513' },
      { id: 'birds', name: 'Birds', symbol: '🦅', color: '#3498db' },
      { id: 'fish', name: 'Fish', symbol: '🐟', color: '#1abc9c' },
    ],
    cardBack: 'linear-gradient(135deg, #2ecc71 0%, #16a085 100%)',
    borderStyle: 'solid',
    preview: '🐱',
  },
  {
    id: 'gothic',
    name: 'Gothic',
    description: 'Dark and mysterious aesthetic',
    suits: [
      { id: 'skulls', name: 'Skulls', symbol: '💀', color: '#ecf0f1' },
      { id: 'roses', name: 'Roses', symbol: '🥀', color: '#c0392b' },
      { id: 'bats', name: 'Bats', symbol: '🦇', color: '#8e44ad' },
      { id: 'ghosts', name: 'Ghosts', symbol: '👻', color: '#bdc3c7' },
    ],
    cardBack: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
    borderStyle: 'solid',
    preview: '💀',
  },
  {
    id: 'neon',
    name: 'Neon Nights',
    description: 'Vibrant neon colors on black',
    suits: [
      { id: 'lightning', name: 'Lightning', symbol: '⚡', color: '#f1c40f' },
      { id: 'plasma', name: 'Plasma', symbol: '💜', color: '#9b59b6' },
      { id: 'laser', name: 'Laser', symbol: '💚', color: '#2ecc71' },
      { id: 'cyber', name: 'Cyber', symbol: '💙', color: '#00d4ff' },
    ],
    cardBack: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #000000 100%)',
    borderStyle: 'solid',
    preview: '⚡',
  },
  {
    id: 'tarot',
    name: 'Tarot Inspired',
    description: 'Mystical symbols and arcana',
    suits: [
      { id: 'wands', name: 'Wands', symbol: '🪄', color: '#e67e22' },
      { id: 'cups', name: 'Cups', symbol: '🏆', color: '#3498db' },
      { id: 'swords', name: 'Swords', symbol: '🗡️', color: '#95a5a6' },
      { id: 'pentacles', name: 'Pentacles', symbol: '⭕', color: '#f1c40f' },
    ],
    cardBack: 'linear-gradient(135deg, #4a0080 0%, #1a0033 50%, #4a0080 100%)',
    borderStyle: 'double',
    preview: '🔮',
  },
];

const BACK_PATTERNS = [
  { id: 'solid', name: 'Solid', preview: '▓' },
  { id: 'diamonds', name: 'Diamonds', preview: '◆' },
  { id: 'circles', name: 'Circles', preview: '●' },
  { id: 'stripes', name: 'Stripes', preview: '║' },
  { id: 'crosshatch', name: 'Crosshatch', preview: '╳' },
  { id: 'ornate', name: 'Ornate', preview: '❋' },
  { id: 'geometric', name: 'Geometric', preview: '⬡' },
  { id: 'floral', name: 'Floral', preview: '❀' },
];

export default function CardDeckCreatorPage() {
  const [selectedTheme, setSelectedTheme] = useState<DeckTheme>(DECK_THEMES[0]);
  const [deckName, setDeckName] = useState('My Custom Deck');
  const [includeJokers, setIncludeJokers] = useState(true);
  const [jokerCount, setJokerCount] = useState(2);
  const [selectedCard, setSelectedCard] = useState<{ suit: number; rank: number } | null>(null);
  const [backPattern, setBackPattern] = useState('ornate');
  const [customBackColor, setCustomBackColor] = useState('#8e44ad');
  const [showBack, setShowBack] = useState(false);

  // Generate full deck
  const generateDeck = useCallback((): PlayingCard[] => {
    const cards: PlayingCard[] = [];
    
    selectedTheme.suits.forEach((suit, suitIdx) => {
      RANKS.forEach((rank, rankIdx) => {
        cards.push({
          id: `${suit.id}-${rank}`,
          suit: suit.id,
          rank,
          frontDesign: {
            backgroundColor: '#ffffff',
            suitColor: suit.color,
            borderColor: '#333333',
            pattern: 'none',
          },
        });
      });
    });

    // Add jokers
    if (includeJokers) {
      for (let i = 0; i < jokerCount; i++) {
        cards.push({
          id: `joker-${i + 1}`,
          suit: 'joker',
          rank: 'JOKER',
          isJoker: true,
          frontDesign: {
            backgroundColor: '#1a1a1a',
            suitColor: i === 0 ? '#e74c3c' : '#2c3e50',
            borderColor: '#f1c40f',
            pattern: 'none',
          },
        });
      }
    }

    return cards;
  }, [selectedTheme, includeJokers, jokerCount]);

  const deck = generateDeck();

  const shuffleDeck = useCallback(() => {
    toast.success('Deck shuffled! 🎲');
    // Visual shuffle animation would go here
  }, []);

  const exportDeck = useCallback((format: 'pdf' | 'png' | 'print') => {
    toast.success(`Exporting ${deck.length} cards as ${format.toUpperCase()}...`);
  }, [deck.length]);

  const randomizeTheme = useCallback(() => {
    const randomTheme = DECK_THEMES[Math.floor(Math.random() * DECK_THEMES.length)];
    setSelectedTheme(randomTheme);
    toast.success(`Applied ${randomTheme.name} theme!`);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/literature-zone" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Custom Card Deck Creator</h1>
                    <p className="text-sm text-slate-400">Design unique playing card decks</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WalletDisplay userId="demo-user" />
              <Button variant="outline" size="sm" onClick={shuffleDeck}>
                <Shuffle className="w-4 h-4 mr-2" /> Shuffle
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportDeck('pdf')}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500">
                <Save className="w-4 h-4 mr-2" /> Save Deck
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left - Theme Selection */}
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-400" />
                    Deck Theme
                  </span>
                  <Button size="sm" variant="ghost" onClick={randomizeTheme}>
                    <Shuffle className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {DECK_THEMES.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`w-full p-3 rounded-lg text-left transition border-2 ${
                      selectedTheme.id === theme.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{theme.preview}</span>
                      <div>
                        <div className="font-medium">{theme.name}</div>
                        <div className="text-xs text-slate-400">{theme.description}</div>
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {theme.suits.map(suit => (
                        <span key={suit.id} style={{ color: suit.color }}>{suit.symbol}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Deck Settings */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-indigo-400" />
                  Deck Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Deck Name</label>
                  <Input
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeJokers}
                      onChange={(e) => setIncludeJokers(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Include Jokers</span>
                  </label>
                  {includeJokers && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-slate-400">Count:</span>
                      <Input
                        type="number"
                        min={1}
                        max={4}
                        value={jokerCount}
                        onChange={(e) => setJokerCount(parseInt(e.target.value) || 2)}
                        className="w-16 bg-slate-800 border-slate-700"
                      />
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-sm text-slate-400">
                    Total Cards: <span className="text-white font-bold">{deck.length}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Card Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{deckName}</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={!showBack ? 'default' : 'outline'}
                  onClick={() => setShowBack(false)}
                >
                  <Eye className="w-4 h-4 mr-1" /> Fronts
                </Button>
                <Button
                  size="sm"
                  variant={showBack ? 'default' : 'outline'}
                  onClick={() => setShowBack(true)}
                >
                  <RotateCw className="w-4 h-4 mr-1" /> Backs
                </Button>
              </div>
            </div>

            {/* Cards Display */}
            {!showBack ? (
              <div className="space-y-6">
                {selectedTheme.suits.map((suit, suitIdx) => (
                  <div key={suit.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ color: suit.color }} className="text-xl">{suit.symbol}</span>
                      <span className="text-sm font-medium">{suit.name}</span>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {RANKS.map((rank, rankIdx) => (
                        <button
                          key={`${suit.id}-${rank}`}
                          onClick={() => setSelectedCard({ suit: suitIdx, rank: rankIdx })}
                          className={`aspect-[2.5/3.5] rounded-lg bg-white border-2 flex flex-col items-center justify-center transition hover:scale-105 ${
                            selectedCard?.suit === suitIdx && selectedCard?.rank === rankIdx
                              ? 'border-purple-500 ring-2 ring-purple-500/50'
                              : 'border-slate-300'
                          }`}
                        >
                          <span className="text-xs font-bold" style={{ color: suit.color }}>
                            {rank}
                          </span>
                          <span style={{ color: suit.color }} className="text-lg">
                            {suit.symbol}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Jokers */}
                {includeJokers && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🃏</span>
                      <span className="text-sm font-medium">Jokers</span>
                    </div>
                    <div className="flex gap-2">
                      {Array.from({ length: jokerCount }).map((_, idx) => (
                        <div
                          key={`joker-${idx}`}
                          className="aspect-[2.5/3.5] w-16 rounded-lg bg-gradient-to-br from-red-500 to-purple-600 border-2 border-yellow-400 flex items-center justify-center"
                        >
                          <span className="text-2xl">🃏</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Card Backs
              <div className="grid grid-cols-4 gap-4">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="aspect-[2.5/3.5] rounded-lg border-2 border-slate-600 flex items-center justify-center"
                    style={{ background: selectedTheme.cardBack }}
                  >
                    <span className="text-4xl opacity-50">
                      {BACK_PATTERNS.find(p => p.id === backPattern)?.preview || '❋'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right - Card Back Design */}
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <RotateCw className="w-5 h-5 text-pink-400" />
                  Card Back Design
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview */}
                <div
                  className="aspect-[2.5/3.5] rounded-xl border-4 flex items-center justify-center mx-auto max-w-[150px]"
                  style={{ 
                    background: selectedTheme.cardBack,
                    borderColor: customBackColor,
                    borderStyle: selectedTheme.borderStyle as any,
                  }}
                >
                  <span className="text-5xl opacity-70">
                    {BACK_PATTERNS.find(p => p.id === backPattern)?.preview || '❋'}
                  </span>
                </div>

                {/* Pattern Selection */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Pattern</label>
                  <div className="grid grid-cols-4 gap-2">
                    {BACK_PATTERNS.map(pattern => (
                      <button
                        key={pattern.id}
                        onClick={() => setBackPattern(pattern.id)}
                        className={`p-2 rounded-lg transition text-xl ${
                          backPattern === pattern.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                        title={pattern.name}
                      >
                        {pattern.preview}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border Color */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Border Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={customBackColor}
                      onChange={(e) => setCustomBackColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={customBackColor}
                      onChange={(e) => setCustomBackColor(e.target.value)}
                      className="bg-slate-800 border-slate-700 flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="w-5 h-5 text-green-400" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => exportDeck('pdf')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF (Print Ready)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => exportDeck('png')}
                >
                  <Image className="w-4 h-4 mr-2" />
                  PNG Images (All Cards)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => exportDeck('print')}
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  Print Sheet (9 per page)
                </Button>
                
                <div className="pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-400">
                    All exports include front and back designs. Print sheets are sized for standard poker cards (2.5" × 3.5").
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

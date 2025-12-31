'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Companion,
  TrainingPacket,
  PacketCategory,
  PacketRarity,
  TRAINING_PACKETS,
  COMPANION_TRAITS,
  getCompanion,
  createCompanion,
  saveCompanion,
  getOwnedPackets,
  getPacketById,
  getPacketsByCategory,
  startTraining,
  checkTrainingComplete,
  getTrainingProgress,
  getCompanionStats,
} from '@/services/companionTrainingService';
import { isLocalLLMConfigured, getUserProviderConfig } from '@/services/apiCostService';

// ================== RARITY STYLES ==================
const rarityStyles: Record<PacketRarity, { bg: string; border: string; text: string; glow: string }> = {
  common: {
    bg: 'bg-gray-600/20',
    border: 'border-gray-500',
    text: 'text-gray-300',
    glow: '',
  },
  uncommon: {
    bg: 'bg-green-600/20',
    border: 'border-green-500',
    text: 'text-green-300',
    glow: 'shadow-green-500/20',
  },
  rare: {
    bg: 'bg-blue-600/20',
    border: 'border-blue-500',
    text: 'text-blue-300',
    glow: 'shadow-blue-500/30',
  },
  epic: {
    bg: 'bg-purple-600/20',
    border: 'border-purple-500',
    text: 'text-purple-300',
    glow: 'shadow-purple-500/40',
  },
  legendary: {
    bg: 'bg-orange-600/20',
    border: 'border-orange-500',
    text: 'text-orange-300',
    glow: 'shadow-orange-500/50',
  },
  mythic: {
    bg: 'bg-gradient-to-br from-pink-600/20 to-purple-600/20',
    border: 'border-pink-500',
    text: 'text-pink-300',
    glow: 'shadow-pink-500/60 animate-pulse',
  },
};

const categoryIcons: Record<PacketCategory, string> = {
  'graphics': '🎨',
  'game-engines': '🎮',
  'web-dev': '🌐',
  'ai-ml': '🧠',
  'systems': '⚙️',
  'creative': '✨',
  'blockchain': '⛓️',
  'security': '🔐',
  'data': '📊',
  'mobile': '📱',
  'devops': '🚀',
  'esoteric': '🌟',
};

// ================== SUB-COMPONENTS ==================

interface CompanionCreatorProps {
  onCreated: (companion: Companion) => void;
}

function CompanionCreator({ onCreated }: CompanionCreatorProps) {
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  const handleCreate = () => {
    if (name && personality && selectedTraits.length > 0) {
      const config = getUserProviderConfig();
      const companion = createCompanion(
        name,
        personality,
        selectedTraits,
        config.localModelName,
        config.localEndpoint
      );
      onCreated(companion);
    }
  };

  const toggleTrait = (traitId: string) => {
    if (selectedTraits.includes(traitId)) {
      setSelectedTraits(selectedTraits.filter(t => t !== traitId));
    } else if (selectedTraits.length < 3) {
      setSelectedTraits([...selectedTraits, traitId]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-8 border border-purple-500/30">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4 animate-bounce">🤖</div>
        <h2 className="text-3xl font-bold text-white mb-2">Create Your Companion</h2>
        <p className="text-gray-400">Begin your journey with an AI partner who grows with you</p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center gap-4 mb-8">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
              ${s === step 
                ? 'bg-purple-500 text-white scale-110' 
                : s < step 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-700 text-gray-400'}`}
          >
            {s < step ? '✓' : s}
          </div>
        ))}
      </div>

      {/* Step 1: Name */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white text-center">What shall we call your companion?</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a name..."
            className="w-full bg-gray-800 border border-gray-600 rounded-xl px-6 py-4 text-xl text-white text-center focus:border-purple-500 focus:outline-none"
          />
          <div className="flex justify-center gap-2 flex-wrap">
            {['Nova', 'Echo', 'Sage', 'Aria', 'Cipher', 'Phoenix', 'Orion', 'Luna'].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => setName(suggestion)}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!name}
            className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-purple-500 transition-colors"
          >
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Personality */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white text-center">Describe {name}'s personality</h3>
          <textarea
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            placeholder="e.g., Friendly and encouraging, loves to explain complex concepts with analogies..."
            className="w-full h-32 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white resize-none focus:border-purple-500 focus:outline-none"
          />
          <div className="flex justify-center gap-2 flex-wrap">
            {[
              'Wise mentor who speaks in metaphors',
              'Enthusiastic teacher who loves coding',
              'Calm and patient guide',
              'Playful but knowledgeable friend',
            ].map(suggestion => (
              <button
                key={suggestion}
                onClick={() => setPersonality(suggestion)}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm hover:bg-gray-600"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-4 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!personality}
              className="flex-1 py-4 bg-purple-600 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-purple-500"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Traits */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white text-center">Choose up to 3 traits for {name}</h3>
          <div className="grid grid-cols-2 gap-3">
            {COMPANION_TRAITS.map(trait => (
              <button
                key={trait.id}
                onClick={() => toggleTrait(trait.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all
                  ${selectedTraits.includes(trait.id)
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'}`}
              >
                <div className="font-bold text-white">{trait.name}</div>
                <div className="text-sm text-gray-400">{trait.description}</div>
                <div className="text-xs text-purple-400 mt-1">{trait.effect}</div>
              </button>
            ))}
          </div>
          <div className="text-center text-gray-400 text-sm">
            Selected: {selectedTraits.length}/3
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-4 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600"
            >
              ← Back
            </button>
            <button
              onClick={handleCreate}
              disabled={selectedTraits.length === 0}
              className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold disabled:opacity-50 hover:from-purple-500 hover:to-pink-500"
            >
              ✨ Create Companion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface PacketCardProps {
  packet: TrainingPacket;
  owned: boolean;
  absorbed: boolean;
  onTrain?: () => void;
}

function PacketCard({ packet, owned, absorbed, onTrain }: PacketCardProps) {
  const style = rarityStyles[packet.rarity];
  
  return (
    <div className={`
      relative p-4 rounded-xl border-2 ${style.bg} ${style.border} ${style.glow}
      ${!owned ? 'opacity-50 grayscale' : ''}
      transition-all duration-300 hover:scale-105
    `}>
      {/* Rarity Badge */}
      <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold ${style.text} ${style.bg} border ${style.border}`}>
        {packet.rarity.toUpperCase()}
      </div>

      {/* Category Icon & Name */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{categoryIcons[packet.category]}</span>
        <span className="text-xl">{packet.artPlaceholder}</span>
      </div>
      
      <h3 className={`font-bold ${style.text} mb-1`}>{packet.name}</h3>
      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{packet.description}</p>
      
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
        <div>📚 {packet.codeExamples} examples</div>
        <div>⏱️ {packet.estimatedTrainingTime}min</div>
        <div>💡 {packet.knowledgePoints} KP</div>
        <div>📦 {packet.libraries.length} libs</div>
      </div>
      
      {/* Flavor Text */}
      <p className="text-xs italic text-gray-500 mb-3">"{packet.flavorText}"</p>
      
      {/* Action */}
      {absorbed ? (
        <div className="w-full py-2 bg-green-500/20 text-green-300 text-center rounded-lg text-sm">
          ✅ Absorbed
        </div>
      ) : owned ? (
        <button
          onClick={onTrain}
          className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors text-sm font-bold"
        >
          Train Companion
        </button>
      ) : (
        <div className="w-full py-2 bg-gray-700 text-gray-500 text-center rounded-lg text-sm">
          🔒 Not Owned
        </div>
      )}
    </div>
  );
}

interface TrainingProgressProps {
  companion: Companion;
}

function TrainingProgress({ companion }: TrainingProgressProps) {
  const progress = getTrainingProgress();
  
  if (!progress.isTraining) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
        <div className="text-2xl mb-2">😴</div>
        <p className="text-gray-400">No training in progress</p>
        <p className="text-sm text-gray-500">Select a training packet to begin</p>
      </div>
    );
  }
  
  return (
    <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-white flex items-center gap-2">
          <span className="animate-pulse">📖</span> Training in Progress
        </h3>
        <span className="text-purple-300">{Math.round(progress.percentComplete)}%</span>
      </div>
      
      <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
          style={{ width: `${progress.percentComplete}%` }}
        />
      </div>
      
      <div className="flex justify-between text-sm text-gray-400">
        <span>📦 {progress.packetName}</span>
        <span>⏱️ {progress.minutesRemaining}min remaining</span>
      </div>
    </div>
  );
}

// ================== MAIN COMPONENT ==================

interface CompanionTrainingDashboardProps {
  onOpenLLMSetup?: () => void;
}

export function CompanionTrainingDashboard({ onOpenLLMSetup }: CompanionTrainingDashboardProps) {
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [ownedPackets, setOwnedPackets] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PacketCategory | 'all'>('all');
  const [showCreator, setShowCreator] = useState(false);
  const [stats, setStats] = useState(getCompanionStats());
  const [isLocalConfigured, setIsLocalConfigured] = useState(false);

  const loadData = useCallback(() => {
    setCompanion(getCompanion());
    setOwnedPackets(getOwnedPackets());
    setStats(getCompanionStats());
    setIsLocalConfigured(isLocalLLMConfigured());
  }, []);

  useEffect(() => {
    loadData();
    
    // Check for completed training periodically
    const interval = setInterval(() => {
      const result = checkTrainingComplete();
      if (result.completed) {
        loadData();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [loadData]);

  const handleStartTraining = (packetId: string) => {
    const result = startTraining(packetId);
    if (result.success) {
      loadData();
    } else {
      alert(result.message);
    }
  };

  const getAbsorbedPackets = (): string[] => {
    if (!companion) return [];
    return companion.knowledge.flatMap(k => k.packetsAbsorbed);
  };

  const filteredPackets = selectedCategory === 'all'
    ? TRAINING_PACKETS
    : getPacketsByCategory(selectedCategory);

  // No companion yet - show creator
  if (!companion || showCreator) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          {!isLocalConfigured && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-bold text-yellow-300">Set Up Local LLM First!</h3>
                  <p className="text-sm text-yellow-200/80">
                    For the best experience, configure a local LLM before creating your companion.
                  </p>
                </div>
                <button
                  onClick={onOpenLLMSetup}
                  className="ml-auto px-4 py-2 bg-yellow-500 text-black rounded-lg font-bold hover:bg-yellow-400"
                >
                  Setup
                </button>
              </div>
            </div>
          )}
          
          <CompanionCreator onCreated={(c) => {
            setCompanion(c);
            setShowCreator(false);
            loadData();
          }} />
        </div>
      </div>
    );
  }

  const absorbedPackets = getAbsorbedPackets();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Companion Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/30 mb-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-4xl shadow-lg shadow-purple-500/30">
              {companion.appearance.avatar}
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{companion.name}</h1>
                {companion.hostedLocally && (
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-300 text-sm">
                    🏠 Local LLM
                  </span>
                )}
              </div>
              <p className="text-gray-400 mb-2">{companion.personality}</p>
              <div className="flex gap-2">
                {companion.traits.map(trait => (
                  <span key={trait.id} className="px-2 py-1 bg-purple-500/20 rounded-full text-purple-300 text-xs">
                    {trait.name}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-300">{stats.totalKnowledge}</div>
                <div className="text-xs text-gray-500">Knowledge Points</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-pink-300">{stats.packetsAbsorbed}</div>
                <div className="text-xs text-gray-500">Packets Trained</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-cyan-300">{stats.specialAbilities}</div>
                <div className="text-xs text-gray-500">Abilities</div>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-300">{stats.bondLevel}</div>
                <div className="text-xs text-gray-500">Bond Level</div>
              </div>
            </div>
          </div>
          
          {/* Bond Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>💕 Bond Level</span>
              <span>{stats.bondLevel}/100</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-red-500"
                style={{ width: `${stats.bondLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Training Progress */}
        <TrainingProgress companion={companion} />

        {/* Special Abilities */}
        {companion.specialAbilities.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 my-6">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <span>⚡</span> Unlocked Abilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {companion.specialAbilities.map((ability, i) => (
                <span key={i} className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full text-cyan-300 text-sm">
                  {ability}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4">📚 Training Library</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg transition-colors
                ${selectedCategory === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            >
              All
            </button>
            {(Object.keys(categoryIcons) as PacketCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2
                  ${selectedCategory === cat 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >
                <span>{categoryIcons[cat]}</span>
                <span className="capitalize">{cat.replace('-', ' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700">
            <div className="text-xl font-bold text-white">{ownedPackets.length}</div>
            <div className="text-xs text-gray-500">Owned Packets</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3 text-center border border-green-500/30">
            <div className="text-xl font-bold text-green-300">{absorbedPackets.length}</div>
            <div className="text-xs text-gray-500">Absorbed</div>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-3 text-center border border-purple-500/30">
            <div className="text-xl font-bold text-purple-300">{ownedPackets.length - absorbedPackets.length}</div>
            <div className="text-xs text-gray-500">Ready to Train</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center border border-gray-700">
            <div className="text-xl font-bold text-gray-300">{TRAINING_PACKETS.length - ownedPackets.length}</div>
            <div className="text-xs text-gray-500">Undiscovered</div>
          </div>
        </div>

        {/* Packet Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPackets.map(packet => (
            <PacketCard
              key={packet.id}
              packet={packet}
              owned={ownedPackets.includes(packet.id)}
              absorbed={absorbedPackets.includes(packet.id)}
              onTrain={() => handleStartTraining(packet.id)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredPackets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-gray-400">No packets in this category yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanionTrainingDashboard;

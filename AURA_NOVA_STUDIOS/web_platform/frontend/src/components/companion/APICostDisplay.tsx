'use client';

import React, { useState, useEffect } from 'react';
import {
  canUseFunction,
  executeFunction,
  getFunctionStatus,
  getDailyAPIStats,
  getUserProviderConfig,
  isLocalLLMConfigured,
  API_FUNCTIONS,
  APIFunction,
  CLOUD_API_COST,
} from '@/services/apiCostService';
import { getWallet } from '@/services/currencyService';

// ================== COST INDICATOR WIDGET ==================
// Shows the cost before executing any AI function

interface APICostIndicatorProps {
  functionId: string;
  onExecute?: () => void;
  showExecuteButton?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function APICostIndicator({ 
  functionId, 
  onExecute, 
  showExecuteButton = false,
  size = 'medium' 
}: APICostIndicatorProps) {
  const [status, setStatus] = useState(getFunctionStatus(functionId));
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    setStatus(getFunctionStatus(functionId));
  }, [functionId]);

  const handleExecute = async () => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    const result = executeFunction(functionId);
    
    if (result.success) {
      onExecute?.();
      setStatus(getFunctionStatus(functionId));
    } else {
      alert(result.message);
    }
    
    setIsExecuting(false);
  };

  const { function: func, isLocalAvailable, remainingFreeUses, nextCost } = status;

  if (!func) return null;

  const sizeClasses = {
    small: 'text-xs p-1',
    medium: 'text-sm p-2',
    large: 'text-base p-3',
  };

  return (
    <div className={`rounded-lg bg-gray-800/50 border border-gray-700 ${sizeClasses[size]}`}>
      <div className="flex items-center justify-between gap-3">
        {/* Status */}
        <div className="flex items-center gap-2">
          {isLocalAvailable ? (
            <span className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full text-xs font-medium">
              🏠 FREE
            </span>
          ) : remainingFreeUses > 0 ? (
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
              🎁 {remainingFreeUses} free left
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium">
              💰 {nextCost} coins
            </span>
          )}
          
          <span className="text-gray-400 text-xs">{func.name}</span>
        </div>

        {/* Execute Button */}
        {showExecuteButton && (
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className={`px-3 py-1 rounded-lg text-white text-xs font-medium transition-colors
              ${isLocalAvailable 
                ? 'bg-green-600 hover:bg-green-500' 
                : remainingFreeUses > 0 
                  ? 'bg-blue-600 hover:bg-blue-500'
                  : 'bg-yellow-600 hover:bg-yellow-500'}`}
          >
            {isExecuting ? '...' : 'Use'}
          </button>
        )}
      </div>
    </div>
  );
}

// ================== DAILY STATS CARD ==================

export function APIDailyStatsCard() {
  const [stats, setStats] = useState(getDailyAPIStats());
  const [wallet, setWallet] = useState(getWallet());
  const [isLocalConfigured, setIsLocalConfigured] = useState(false);

  useEffect(() => {
    setStats(getDailyAPIStats());
    setWallet(getWallet());
    setIsLocalConfigured(isLocalLLMConfigured());
    
    const interval = setInterval(() => {
      setStats(getDailyAPIStats());
      setWallet(getWallet());
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <span>📊</span> Today's API Usage
      </h3>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-500/10 rounded-lg p-3 text-center border border-green-500/30">
          <div className="text-xl font-bold text-green-300">{stats.totalLocalCalls}</div>
          <div className="text-xs text-gray-500">Local (Free)</div>
        </div>
        <div className="bg-blue-500/10 rounded-lg p-3 text-center border border-blue-500/30">
          <div className="text-xl font-bold text-blue-300">{stats.totalCloudCalls}</div>
          <div className="text-xs text-gray-500">Cloud API</div>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-3 text-center border border-yellow-500/30">
          <div className="text-xl font-bold text-yellow-300">{stats.totalCoinsSpent}</div>
          <div className="text-xs text-gray-500">Coins Spent</div>
        </div>
        <div className="bg-purple-500/10 rounded-lg p-3 text-center border border-purple-500/30">
          <div className="text-xl font-bold text-purple-300">{stats.savingsFromLocal}</div>
          <div className="text-xs text-gray-500">Coins Saved</div>
        </div>
      </div>

      {/* Wallet */}
      <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">💰 Wallet Balance</span>
          <span className="text-xl font-bold text-yellow-300">{wallet.aetherCoins} coins</span>
        </div>
      </div>

      {/* Local LLM Status */}
      {isLocalConfigured ? (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <div>
              <div className="font-bold text-green-300">Local LLM Active</div>
              <div className="text-xs text-green-200/60">All supported functions are FREE</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <div>
              <div className="font-bold text-yellow-300">Set Up Local LLM</div>
              <div className="text-xs text-yellow-200/60">Get unlimited free API calls!</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================== FUNCTION LIST ==================

export function APIFunctionList() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statuses, setStatuses] = useState<Map<string, ReturnType<typeof getFunctionStatus>>>(new Map());

  useEffect(() => {
    const newStatuses = new Map();
    API_FUNCTIONS.forEach(func => {
      newStatuses.set(func.id, getFunctionStatus(func.id));
    });
    setStatuses(newStatuses);
  }, []);

  const categories = ['all', ...new Set(API_FUNCTIONS.map(f => f.category))];
  
  const filteredFunctions = selectedCategory === 'all'
    ? API_FUNCTIONS
    : API_FUNCTIONS.filter(f => f.category === selectedCategory);

  const categoryLabels: Record<string, string> = {
    'all': '📋 All',
    'chat': '💬 Chat',
    'code-gen': '💻 Code Gen',
    'code-review': '🔍 Code Review',
    'image-gen': '🎨 Image Gen',
    'image-edit': '✏️ Image Edit',
    'music-gen': '🎵 Music',
    'voice-synth': '🎙️ Voice',
    'translation': '🌍 Translation',
    'summarization': '📝 Summary',
    'analysis': '📊 Analysis',
    'embedding': '🔢 Embedding',
    'game-ai': '🎮 Game AI',
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
        <span>⚡</span> Available Functions
      </h3>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap mb-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors
              ${selectedCategory === cat
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      {/* Function List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredFunctions.map(func => {
          const status = statuses.get(func.id);
          
          return (
            <div 
              key={func.id}
              className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">{func.name}</div>
                  <div className="text-xs text-gray-500">{func.description}</div>
                </div>
                
                <div className="text-right">
                  {status?.isLocalAvailable ? (
                    <span className="text-green-300 text-sm font-bold">FREE 🏠</span>
                  ) : status?.remainingFreeUses && status.remainingFreeUses > 0 ? (
                    <div>
                      <div className="text-blue-300 text-sm">{status.remainingFreeUses} free</div>
                      <div className="text-xs text-gray-500">then {func.costPerUse} coins</div>
                    </div>
                  ) : (
                    <span className="text-yellow-300 text-sm font-bold">{func.costPerUse} 💰</span>
                  )}
                </div>
              </div>
              
              {/* Daily Limit Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Daily Free Uses</span>
                  <span>{status?.remainingFreeUses || 0}/{func.freeUsesPerDay}</span>
                </div>
                <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ 
                      width: `${((status?.remainingFreeUses || 0) / func.freeUsesPerDay) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================== COMPACT COST BADGE ==================
// Use this inline with action buttons

interface CostBadgeProps {
  functionId: string;
  className?: string;
}

export function CostBadge({ functionId, className = '' }: CostBadgeProps) {
  const status = getFunctionStatus(functionId);
  
  if (!status.function) return null;
  
  if (status.isLocalAvailable) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full text-xs ${className}`}>
        🏠 Free
      </span>
    );
  }
  
  if (status.remainingFreeUses > 0) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-xs ${className}`}>
        🎁 Free ({status.remainingFreeUses})
      </span>
    );
  }
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded-full text-xs ${className}`}>
      💰 {status.nextCost}
    </span>
  );
}

// ================== EXPORTS ==================
export default {
  APICostIndicator,
  APIDailyStatsCard,
  APIFunctionList,
  CostBadge,
};

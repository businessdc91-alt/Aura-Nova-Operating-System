'use client';

import React, { useState, useEffect } from 'react';
import {
  LOCAL_LLM_PROVIDERS,
  LocalLLMProvider,
  getUserProviderConfig,
  setUserProviderConfig,
  isLocalLLMConfigured,
  getRecommendedProvider,
} from '@/services/apiCostService';

// ================== SUB-COMPONENTS ==================

interface ProviderCardProps {
  provider: LocalLLMProvider;
  isSelected: boolean;
  isConfigured: boolean;
  onSelect: () => void;
}

function ProviderCard({ provider, isSelected, isConfigured, onSelect }: ProviderCardProps) {
  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    advanced: 'bg-red-500',
  };

  const difficultyLabels = {
    easy: '🌱 Beginner Friendly',
    medium: '🔧 Some Setup Required',
    advanced: '⚙️ For Power Users',
  };

  return (
    <div
      onClick={onSelect}
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
        ${isSelected 
          ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/20' 
          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'}
      `}
    >
      {isConfigured && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          ✓ Active
        </div>
      )}
      
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-bold text-white">{provider.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full text-white ${difficultyColors[provider.difficulty]}`}>
          {provider.difficulty}
        </span>
      </div>
      
      <p className="text-sm text-gray-400 mb-3">{provider.description}</p>
      
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{difficultyLabels[provider.difficulty]}</span>
      </div>
      
      <div className="mt-2 flex gap-1">
        {provider.platforms.map(p => (
          <span key={p} className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">
            {p === 'windows' ? '🪟' : p === 'mac' ? '🍎' : '🐧'} {p}
          </span>
        ))}
      </div>
    </div>
  );
}

interface SetupStepsProps {
  provider: LocalLLMProvider;
  onComplete: (endpoint: string, modelName: string) => void;
}

function SetupSteps({ provider, onComplete }: SetupStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [endpoint, setEndpoint] = useState(provider.defaultEndpoint);
  const [modelName, setModelName] = useState(provider.recommendedModels[0] || '');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const handleTest = async () => {
    setTestStatus('testing');
    
    // Simulate testing the connection
    // In a real implementation, this would actually call the endpoint
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo, randomly succeed or fail
    const success = Math.random() > 0.3;
    setTestStatus(success ? 'success' : 'error');
    
    if (success) {
      setTimeout(() => onComplete(endpoint, modelName), 1000);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🛠️</span> Setup {provider.name}
        </h3>
        <a 
          href={provider.website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
        >
          Visit Website ↗
        </a>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Progress</span>
          <span>{currentStep + 1} / {provider.setupSteps.length}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / provider.setupSteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3 mb-6">
        {provider.setupSteps.map((step, index) => (
          <div 
            key={index}
            className={`
              flex items-start gap-3 p-3 rounded-lg transition-all duration-300
              ${index === currentStep 
                ? 'bg-purple-500/20 border border-purple-500/50' 
                : index < currentStep 
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-gray-700/30 border border-gray-700'}
            `}
          >
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
              ${index < currentStep 
                ? 'bg-green-500 text-white' 
                : index === currentStep 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-600 text-gray-400'}
            `}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <p className={`text-sm ${index <= currentStep ? 'text-white' : 'text-gray-500'}`}>
              {step}
            </p>
          </div>
        ))}
      </div>

      {/* Step Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(provider.setupSteps.length - 1, currentStep + 1))}
          disabled={currentStep === provider.setupSteps.length - 1}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
        >
          Next →
        </button>
        <button
          onClick={() => setCurrentStep(provider.setupSteps.length - 1)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors ml-auto"
        >
          Mark All Complete
        </button>
      </div>

      {/* Configuration */}
      {currentStep === provider.setupSteps.length - 1 && (
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
          <h4 className="font-bold text-white mb-4">🔌 Connect to Aura Nova</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">API Endpoint</label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
                placeholder="http://localhost:1234/v1"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Model Name</label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
              >
                {provider.recommendedModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
                <option value="custom">Custom Model...</option>
              </select>
            </div>

            <button
              onClick={handleTest}
              disabled={testStatus === 'testing'}
              className={`
                w-full py-3 rounded-lg font-bold transition-all duration-300
                ${testStatus === 'testing' 
                  ? 'bg-gray-600 text-gray-400 cursor-wait' 
                  : testStatus === 'success'
                    ? 'bg-green-600 text-white'
                    : testStatus === 'error'
                      ? 'bg-red-600 text-white hover:bg-red-500'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'}
              `}
            >
              {testStatus === 'testing' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Testing Connection...
                </span>
              ) : testStatus === 'success' ? (
                <span className="flex items-center justify-center gap-2">
                  ✅ Connected! Saving...
                </span>
              ) : testStatus === 'error' ? (
                <span className="flex items-center justify-center gap-2">
                  ❌ Failed - Click to Retry
                </span>
              ) : (
                'Test Connection & Save'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ================== MAIN COMPONENT ==================

interface LocalLLMSetupGuideProps {
  onClose?: () => void;
  onSetupComplete?: () => void;
}

export function LocalLLMSetupGuide({ onClose, onSetupComplete }: LocalLLMSetupGuideProps) {
  const [selectedProvider, setSelectedProvider] = useState<LocalLLMProvider | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<ReturnType<typeof getUserProviderConfig> | null>(null);

  useEffect(() => {
    setIsConfigured(isLocalLLMConfigured());
    setCurrentConfig(getUserProviderConfig());
    
    if (!selectedProvider) {
      setSelectedProvider(getRecommendedProvider());
    }
  }, [selectedProvider]);

  const handleSetupComplete = (endpoint: string, modelName: string) => {
    setUserProviderConfig({
      preferLocal: true,
      localEndpoint: endpoint,
      localModelName: modelName,
    });
    setIsConfigured(true);
    onSetupComplete?.();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/50 rounded-full px-4 py-2 mb-4">
            <span className="text-green-400">💰</span>
            <span className="text-green-300 text-sm font-medium">Free Unlimited Access with Local LLM</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            🏠 Local LLM Setup Guide
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Run AI locally on your machine. <span className="text-green-400 font-semibold">No cloud costs, no limits, complete privacy.</span>
          </p>
        </div>

        {/* Benefits Banner */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/30 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🌟</span> Why Run Local?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl mb-2">💸</div>
              <h3 className="font-bold text-white">Free Forever</h3>
              <p className="text-sm text-gray-400">No API costs - every function is free when using your own LLM</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl mb-2">🔒</div>
              <h3 className="font-bold text-white">Complete Privacy</h3>
              <p className="text-sm text-gray-400">Your code and data never leave your machine</p>
            </div>
            <div className="bg-black/30 rounded-lg p-4">
              <div className="text-2xl mb-2">🎓</div>
              <h3 className="font-bold text-white">Train Your Companion</h3>
              <p className="text-sm text-gray-400">Use Training Packets to enhance your AI's knowledge</p>
            </div>
          </div>
        </div>

        {/* Current Status */}
        {isConfigured && currentConfig && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <div>
                  <h3 className="font-bold text-green-300">Local LLM Active!</h3>
                  <p className="text-sm text-green-400/80">
                    Connected to: {currentConfig.localEndpoint} ({currentConfig.localModelName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigured(false)}
                className="text-sm text-green-400 hover:text-green-300"
              >
                Change Provider
              </button>
            </div>
          </div>
        )}

        {/* Provider Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">1️⃣ Choose Your Provider</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LOCAL_LLM_PROVIDERS.map(provider => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                isSelected={selectedProvider?.id === provider.id}
                isConfigured={currentConfig?.localEndpoint === provider.defaultEndpoint}
                onSelect={() => setSelectedProvider(provider)}
              />
            ))}
          </div>
        </div>

        {/* Setup Steps */}
        {selectedProvider && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">2️⃣ Follow Setup Steps</h2>
            <SetupSteps 
              provider={selectedProvider} 
              onComplete={handleSetupComplete}
            />
          </div>
        )}

        {/* Hardware Recommendations */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>💻</span> Hardware Recommendations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h3 className="font-bold text-green-300 mb-2">🌱 Entry Level</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• 8GB RAM</li>
                <li>• Any GPU (optional)</li>
                <li>• Models: TinyLlama, Phi-2</li>
                <li>• Speed: Slower but works!</li>
              </ul>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <h3 className="font-bold text-yellow-300 mb-2">⚡ Recommended</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• 16GB RAM</li>
                <li>• 8GB+ VRAM GPU</li>
                <li>• Models: Mistral 7B, CodeLlama</li>
                <li>• Speed: Great experience</li>
              </ul>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h3 className="font-bold text-purple-300 mb-2">🚀 Power User</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• 32GB+ RAM</li>
                <li>• 12GB+ VRAM GPU</li>
                <li>• Models: 13B-70B models</li>
                <li>• Speed: Near-instant</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-xl p-6 border border-cyan-500/30">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>🤝</span> The Companion Philosophy
          </h2>
          <div className="text-gray-300 space-y-3">
            <p>
              At Aura Nova, we believe AI should be a <span className="text-purple-300 font-semibold">partner, not a tool</span>. 
              When you run your own local LLM, you're not just saving coins — you're <span className="text-cyan-300 font-semibold">raising your own AI companion</span>.
            </p>
            <p>
              Use <span className="text-yellow-300 font-semibold">Training Packets</span> earned through gameplay to teach your companion new skills. 
              Watch it grow from a basic assistant into a specialized expert in the fields you choose.
            </p>
            <p className="text-purple-200 font-medium">
              "We're building a metropolis of underground hackers and creators — 
              and every creator deserves an AI partner who grows with them."
            </p>
          </div>
        </div>

        {/* Close Button */}
        {onClose && (
          <div className="text-center mt-8">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close Guide
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default LocalLLMSetupGuide;

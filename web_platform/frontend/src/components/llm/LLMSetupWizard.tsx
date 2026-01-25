'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Cpu,
  HardDrive,
  Zap,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';

// ================== TYPES ==================
interface SystemSpecs {
  ram: number; // GB
  gpu: string | null;
  os: string;
  browserSupportsWebGPU: boolean;
}

interface RecommendedModel {
  name: string;
  size: string;
  ramRequired: number;
  description: string;
  capabilities: ModelCapability[];
  downloadUrl?: string;
  huggingFaceId?: string;
}

type ModelCapability =
  | 'chat'              // Basic conversation
  | 'code'              // Code generation/assistance
  | 'vision'            // Image understanding (multimodal)
  | 'image-gen'         // Image generation (SDXL, Flux, etc.)
  | 'creative'          // Creative writing, stories, poems
  | 'reasoning'         // Complex logic and analysis
  | 'tools'             // Function calling/tool use
  | 'analysis'          // Data analysis
  | 'music'             // Music generation (requires special model)
  | 'voice';            // Voice synthesis/TTS

// ================== MODEL RECOMMENDATIONS ==================
const MODEL_CATALOG: Record<string, RecommendedModel[]> = {
  micro: [
    {
      name: 'Gemma 300M',
      size: '300M parameters',
      ramRequired: 1,
      description: 'Ultra-lightweight model for low-resource devices',
      capabilities: ['chat', 'reasoning'],
      huggingFaceId: 'google/gemma-300m',
    },
    {
      name: 'Qwen 2.5 0.5B',
      size: '500M parameters',
      ramRequired: 1.5,
      description: 'Coding guru of mini power - excellent for coding tasks',
      capabilities: ['chat', 'code', 'reasoning'],
      huggingFaceId: 'Qwen/Qwen2.5-0.5B-Instruct',
    },
  ],
  small: [
    {
      name: 'Gemma 2 2B',
      size: '2B parameters',
      ramRequired: 2,
      description: 'Compact but capable - great balance',
      capabilities: ['chat', 'code', 'creative'],
      huggingFaceId: 'google/gemma-2-2b-it',
    },
    {
      name: 'Gemma 3 4B',
      size: '4B parameters',
      ramRequired: 3,
      description: '⭐ Great for coding with excellent results',
      capabilities: ['chat', 'code', 'creative', 'analysis'],
      huggingFaceId: 'google/gemma-2-4b-it',
    },
  ],
  medium: [
    {
      name: 'Gemma 3n e4bit',
      size: '9B parameters (quantized)',
      ramRequired: 6,
      description: '🎨 Multimodal - can handle images! Tool-using variant',
      capabilities: ['chat', 'code', 'vision', 'tools', 'creative'],
      huggingFaceId: 'google/gemma-2-9b-it',
    },
  ],
  large: [
    {
      name: 'Qwen 2.5 7B',
      size: '7B parameters',
      ramRequired: 8,
      description: 'Powerhouse recent release - top tier performance',
      capabilities: ['chat', 'code', 'reasoning', 'creative', 'analysis'],
      huggingFaceId: 'Qwen/Qwen2.5-7B-Instruct',
    },
    {
      name: 'Mistral 7B',
      size: '7B parameters',
      ramRequired: 8,
      description: 'Solid all-around performer',
      capabilities: ['chat', 'code', 'reasoning', 'creative'],
      huggingFaceId: 'mistralai/Mistral-7B-Instruct-v0.3',
    },
    {
      name: 'Llama 3.1 8B',
      size: '8B parameters',
      ramRequired: 10,
      description: 'Popular choice with strong performance',
      capabilities: ['chat', 'code', 'reasoning', 'creative', 'analysis'],
      huggingFaceId: 'meta-llama/Llama-3.1-8B-Instruct',
    },
  ],
  xlarge: [
    {
      name: 'Qwen 2.5 14B',
      size: '14B parameters',
      ramRequired: 16,
      description: 'Top-tier performance for demanding tasks',
      capabilities: ['chat', 'code', 'reasoning', 'creative', 'analysis', 'tools'],
      huggingFaceId: 'Qwen/Qwen2.5-14B-Instruct',
    },
    {
      name: 'Mixtral 8x7B',
      size: '47B parameters (MoE)',
      ramRequired: 20,
      description: 'Enterprise-grade mixture of experts',
      capabilities: ['chat', 'code', 'reasoning', 'creative', 'analysis', 'tools'],
      huggingFaceId: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    },
  ],
};

// ================== WIZARD STEPS ==================
type WizardStep = 'welcome' | 'detect' | 'choose-method' | 'select-model' | 'connect' | 'complete' | 'cloud-setup';

interface LLMSetupWizardProps {
  onComplete: (config: { method: string; model: string }) => void;
  onSkip?: () => void;
}

export function LLMSetupWizard({ onComplete, onSkip }: LLMSetupWizardProps) {
  const [step, setStep] = useState<WizardStep>('welcome');
  const [systemSpecs, setSystemSpecs] = useState<SystemSpecs | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'lmstudio' | 'ollama' | 'cloud' | null>(null);
  const [selectedModel, setSelectedModel] = useState<RecommendedModel | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [selectedCloudProvider, setSelectedCloudProvider] = useState<'gemini' | 'claude' | 'vertex' | null>(null);
  const [cloudApiKey, setCloudApiKey] = useState<string>('');
  const [cloudTier, setCloudTier] = useState<'free' | 'pro' | 'enterprise'>('free');

  // Detect system specs
  useEffect(() => {
    if (step === 'detect') {
      detectSystemSpecs();
    }
  }, [step]);

  const detectSystemSpecs = async () => {
    setProgress(0);

    // Simulate detection process
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Detect actual specs
    const ram = (navigator as any).deviceMemory || 4; // GB (rough estimate)
    const gpu = await detectGPU();
    const os = detectOS();
    const browserSupportsWebGPU = 'gpu' in navigator;

    setTimeout(() => {
      setSystemSpecs({ ram, gpu, os, browserSupportsWebGPU });
      setStep('choose-method');
    }, 2000);
  };

  const detectGPU = async (): Promise<string | null> => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return null;

      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return null;

      return (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    } catch {
      return null;
    }
  };

  const detectOS = (): string => {
    const userAgent = window.navigator.userAgent;
    if (userAgent.indexOf('Win') !== -1) return 'Windows';
    if (userAgent.indexOf('Mac') !== -1) return 'macOS';
    if (userAgent.indexOf('Linux') !== -1) return 'Linux';
    return 'Unknown';
  };

  const getRecommendedModels = (): RecommendedModel[] => {
    if (!systemSpecs) return [];

    const { ram } = systemSpecs;

    if (ram <= 2) return MODEL_CATALOG.micro;
    if (ram <= 4) return [...MODEL_CATALOG.micro, ...MODEL_CATALOG.small];
    if (ram <= 8) return [...MODEL_CATALOG.small, ...MODEL_CATALOG.medium];
    if (ram <= 16) return [...MODEL_CATALOG.medium, ...MODEL_CATALOG.large];
    return [...MODEL_CATALOG.large, ...MODEL_CATALOG.xlarge];
  };

  const testConnection = async () => {
    setConnectionStatus('testing');

    try {
      const url = selectedMethod === 'lmstudio'
        ? 'http://localhost:1234/v1/models'
        : 'http://localhost:11434/api/tags';

      const response = await fetch(url);

      if (response.ok) {
        setConnectionStatus('success');
        setTimeout(() => setStep('complete'), 1500);
      } else {
        setConnectionStatus('failed');
      }
    } catch (error) {
      setConnectionStatus('failed');
    }
  };

  const handleComplete = () => {
    onComplete({
      method: selectedMethod || 'cloud',
      model: selectedMethod === 'cloud'
        ? `${selectedCloudProvider}-${cloudTier}`
        : selectedModel?.name || 'none',
    });
  };

  // ================== RENDER STEPS ==================

  const renderWelcome = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <Sparkles className="w-16 h-16 mx-auto text-purple-400" />
        <h2 className="text-3xl font-bold text-white">Welcome to AuraNova OS</h2>
        <p className="text-slate-300 max-w-lg mx-auto">
          To unlock the full power of this platform, let's set up your AI assistant.
          You can use a local LLM (free, private, fast) or cloud AI (easy setup).
        </p>
      </div>

      <div className="grid gap-4">
        <Button
          onClick={() => setStep('detect')}
          className="w-full h-16 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Cpu className="mr-2" />
          Let's Get Started
        </Button>

        {onSkip && (
          <Button
            onClick={onSkip}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            Skip for now (limited features)
          </Button>
        )}
      </div>
    </div>
  );

  const renderDetect = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <Zap className="w-16 h-16 mx-auto text-yellow-400 animate-pulse" />
        <h2 className="text-2xl font-bold text-white">Detecting Your System</h2>
        <p className="text-slate-300">
          Analyzing your hardware to recommend the best AI models...
        </p>
      </div>

      <Progress value={progress} className="w-full" />

      {systemSpecs && (
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <HardDrive className="w-8 h-8 text-blue-400 mb-2" />
              <div className="text-sm text-slate-400">RAM</div>
              <div className="text-2xl font-bold text-white">{systemSpecs.ram} GB</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <Cpu className="w-8 h-8 text-green-400 mb-2" />
              <div className="text-sm text-slate-400">OS</div>
              <div className="text-lg font-bold text-white">{systemSpecs.os}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const renderChooseMethod = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Choose Your AI Setup</h2>
        <p className="text-slate-300">How would you like to run your AI?</p>
      </div>

      <div className="grid gap-4">
        <Card
          className={`cursor-pointer transition-all ${
            selectedMethod === 'lmstudio'
              ? 'bg-purple-900/50 border-purple-500'
              : 'bg-slate-800 border-slate-700 hover:border-slate-600'
          }`}
          onClick={() => setSelectedMethod('lmstudio')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Download className="w-5 h-5" />
              LM Studio (Recommended)
            </CardTitle>
            <CardDescription>
              Free, runs on your computer, completely private
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-slate-300">
              <div>✓ No internet required</div>
              <div>✓ Unlimited usage</div>
              <div>✓ Your data stays on your device</div>
              <div className="pt-2">
                <a
                  href="https://lmstudio.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  Download LM Studio <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            selectedMethod === 'ollama'
              ? 'bg-purple-900/50 border-purple-500'
              : 'bg-slate-800 border-slate-700 hover:border-slate-600'
          }`}
          onClick={() => setSelectedMethod('ollama')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Download className="w-5 h-5" />
              Ollama
            </CardTitle>
            <CardDescription>
              Command-line LLM runner for developers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-slate-300">
              <div>✓ Lightweight and fast</div>
              <div>✓ Terminal-based</div>
              <div>✓ Great for developers</div>
              <div className="pt-2">
                <a
                  href="https://ollama.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  Download Ollama <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            selectedMethod === 'cloud'
              ? 'bg-purple-900/50 border-purple-500'
              : 'bg-slate-800 border-slate-700 hover:border-slate-600'
          }`}
          onClick={() => setSelectedMethod('cloud')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Wifi className="w-5 h-5" />
              Cloud AI (Gemini)
            </CardTitle>
            <CardDescription>
              Easy setup, no installation required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-slate-300">
              <div>✓ Works immediately</div>
              <div>✓ No download needed</div>
              <div>⚠ Requires internet & API key</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button
        onClick={() => setStep(selectedMethod === 'cloud' ? 'cloud-setup' : 'select-model')}
        disabled={!selectedMethod}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        Continue
      </Button>
    </div>
  );

  const renderCloudSetup = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Choose Your Cloud AI Provider</h2>
        <p className="text-slate-300">
          Select your preferred AI service and configure access
        </p>
      </div>

      <div className="grid gap-4">
        <Card
          className={`cursor-pointer transition-all ${
            selectedCloudProvider === 'gemini'
              ? 'bg-purple-900/50 border-purple-500'
              : 'bg-slate-800 border-slate-700 hover:border-slate-600'
          }`}
          onClick={() => setSelectedCloudProvider('gemini')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5" />
              Google Gemini
            </CardTitle>
            <CardDescription>
              Fast, powerful, and free tier available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-slate-300">
              <div>✓ Free tier: 60 requests/min</div>
              <div>✓ Pro tier: Higher limits</div>
              <div>✓ Multimodal (vision, code, text)</div>
              <div className="pt-2">
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  Get API Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            selectedCloudProvider === 'claude'
              ? 'bg-purple-900/50 border-purple-500'
              : 'bg-slate-800 border-slate-700 hover:border-slate-600'
          }`}
          onClick={() => setSelectedCloudProvider('claude')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5" />
              Anthropic Claude
            </CardTitle>
            <CardDescription>
              Advanced reasoning and coding capabilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-slate-300">
              <div>✓ Claude 3.5 Sonnet/Haiku</div>
              <div>✓ Superior code generation</div>
              <div>✓ 200K context window</div>
              <div>⚠ Requires paid API access</div>
              <div className="pt-2">
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  Get API Key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all ${
            selectedCloudProvider === 'vertex'
              ? 'bg-purple-900/50 border-purple-500'
              : 'bg-slate-800 border-slate-700 hover:border-slate-600'
          }`}
          onClick={() => setSelectedCloudProvider('vertex')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Cpu className="w-5 h-5" />
              Google Vertex AI
            </CardTitle>
            <CardDescription>
              Enterprise-grade AI with multiple models
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-slate-300">
              <div>✓ Access to Gemini, PaLM, Codey</div>
              <div>✓ Enterprise security & compliance</div>
              <div>✓ Custom model fine-tuning</div>
              <div>⚠ Requires Google Cloud project</div>
              <div className="pt-2">
                <a
                  href="https://console.cloud.google.com/vertex-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  Setup Vertex AI <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedCloudProvider && (
        <div className="space-y-4 bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="space-y-2">
            <label className="block text-white font-medium">
              API Key
            </label>
            <input
              type="password"
              value={cloudApiKey}
              onChange={(e) => setCloudApiKey(e.target.value)}
              placeholder={`Enter your ${selectedCloudProvider === 'gemini' ? 'Gemini' : selectedCloudProvider === 'claude' ? 'Anthropic' : 'Google Cloud'} API key`}
              className="w-full bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
            />
            <p className="text-xs text-slate-400">
              Your API key is stored locally and never shared
            </p>
          </div>

          {selectedCloudProvider === 'gemini' && (
            <div className="space-y-2">
              <label className="block text-white font-medium">
                Access Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setCloudTier('free')}
                  className={`px-4 py-2 rounded font-medium transition-all ${
                    cloudTier === 'free'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Free
                </button>
                <button
                  onClick={() => setCloudTier('pro')}
                  className={`px-4 py-2 rounded font-medium transition-all ${
                    cloudTier === 'pro'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Pro
                </button>
                <button
                  onClick={() => setCloudTier('enterprise')}
                  className={`px-4 py-2 rounded font-medium transition-all ${
                    cloudTier === 'enterprise'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Enterprise
                </button>
              </div>
              <div className="text-xs text-slate-400">
                {cloudTier === 'free' && '60 requests/min, 32K context'}
                {cloudTier === 'pro' && '360 requests/min, 1M context'}
                {cloudTier === 'enterprise' && 'Custom limits, priority support'}
              </div>
            </div>
          )}

          {selectedCloudProvider === 'claude' && (
            <div className="space-y-2">
              <label className="block text-white font-medium">
                Model Selection
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCloudTier('free')}
                  className={`px-4 py-2 rounded font-medium transition-all ${
                    cloudTier === 'free'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Haiku (Fast)
                </button>
                <button
                  onClick={() => setCloudTier('pro')}
                  className={`px-4 py-2 rounded font-medium transition-all ${
                    cloudTier === 'pro'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Sonnet (Balanced)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={() => setStep('choose-method')}
          variant="outline"
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={() => {
            // Save cloud config to localStorage
            if (selectedCloudProvider && cloudApiKey) {
              localStorage.setItem(`${selectedCloudProvider}_api_key`, cloudApiKey);
              localStorage.setItem(`${selectedCloudProvider}_tier`, cloudTier);
            }
            setStep('complete');
          }}
          disabled={!selectedCloudProvider || !cloudApiKey}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderSelectModel = () => {
    const recommended = getRecommendedModels();

    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Choose Your AI Model</h2>
          <p className="text-slate-300">
            Based on your {systemSpecs?.ram}GB RAM, here are the best options:
          </p>
        </div>

        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {recommended.map((model) => (
            <Card
              key={model.name}
              className={`cursor-pointer transition-all ${
                selectedModel?.name === model.name
                  ? 'bg-purple-900/50 border-purple-500'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => setSelectedModel(model)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">{model.name}</CardTitle>
                <CardDescription>{model.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                    {model.size}
                  </span>
                  <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded">
                    {model.ramRequired}GB RAM
                  </span>
                  {model.capabilities.map(cap => (
                    <span key={cap} className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                      {cap}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => setStep('choose-method')}
            variant="outline"
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={() => setStep('connect')}
            disabled={!selectedModel}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            Connect Model
          </Button>
        </div>
      </div>
    );
  };

  const renderConnect = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Connect to {selectedMethod === 'lmstudio' ? 'LM Studio' : 'Ollama'}</h2>
        <p className="text-slate-300">
          Make sure {selectedMethod === 'lmstudio' ? 'LM Studio' : 'Ollama'} is running with your selected model
        </p>
      </div>

      {selectedModel && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="text-sm text-slate-400 mb-2">Selected Model:</div>
            <div className="text-xl font-bold text-white mb-4">{selectedModel.name}</div>

            <div className="bg-slate-900 p-4 rounded-lg text-sm font-mono text-slate-300">
              {selectedMethod === 'lmstudio' ? (
                <>1. Open LM Studio<br />
                2. Load: {selectedModel.name}<br />
                3. Start server (default: localhost:1234)</>
              ) : (
                <>1. Run: ollama pull {selectedModel.huggingFaceId?.split('/')[1]}<br />
                2. Run: ollama serve<br />
                3. Server runs on localhost:11434</>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={testConnection}
        disabled={connectionStatus === 'testing'}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {connectionStatus === 'testing' && <Zap className="mr-2 animate-spin" />}
        {connectionStatus === 'idle' && <Wifi className="mr-2" />}
        {connectionStatus === 'success' && <CheckCircle2 className="mr-2" />}
        {connectionStatus === 'failed' && <WifiOff className="mr-2" />}

        {connectionStatus === 'idle' && 'Test Connection'}
        {connectionStatus === 'testing' && 'Testing...'}
        {connectionStatus === 'success' && 'Connected!'}
        {connectionStatus === 'failed' && 'Connection Failed - Retry'}
      </Button>

      {connectionStatus === 'failed' && (
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="text-sm text-slate-300">
                <div className="font-bold text-red-400 mb-1">Connection failed</div>
                <div>Make sure {selectedMethod === 'lmstudio' ? 'LM Studio' : 'Ollama'} is running and the server is started.</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderComplete = () => (
    <div className="space-y-6 text-center">
      <CheckCircle2 className="w-20 h-20 mx-auto text-green-400" />
      <h2 className="text-3xl font-bold text-white">All Set!</h2>
      <p className="text-slate-300 max-w-md mx-auto">
        Your AI assistant is ready. Now let's claim your starter deck and begin your journey!
      </p>

      <Button
        onClick={handleComplete}
        className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
      >
        <Sparkles className="mr-2" />
        Claim Starter Deck
      </Button>
    </div>
  );

  // ================== MAIN RENDER ==================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-slate-900/95 border-slate-700 shadow-2xl">
        <CardContent className="p-8">
          {step === 'welcome' && renderWelcome()}
          {step === 'detect' && renderDetect()}
          {step === 'choose-method' && renderChooseMethod()}
          {step === 'cloud-setup' && renderCloudSetup()}
          {step === 'select-model' && renderSelectModel()}
          {step === 'connect' && renderConnect()}
          {step === 'complete' && renderComplete()}
        </CardContent>
      </Card>
    </div>
  );
}

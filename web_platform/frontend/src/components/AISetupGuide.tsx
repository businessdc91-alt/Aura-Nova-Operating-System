'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bot,
  Download,
  CheckCircle,
  XCircle,
  ExternalLink,
  Sparkles,
  Cpu,
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Rocket,
} from 'lucide-react';
import { aiService } from '@/services/aiService';
import { LLMSetupWizard } from './llm/LLMSetupWizard';

interface AISetupGuideProps {
  compact?: boolean;
  onStatusChange?: (connected: boolean) => void;
}

export function AISetupGuide({ compact = false, onStatusChange }: AISetupGuideProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [connectedModel, setConnectedModel] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const result = await aiService.generate('Say "Connected!" in one word.', {
        maxTokens: 10,
        temperature: 0,
      });
      setIsConnected(result.success);
      setConnectedModel(result.success ? result.model : null);
      onStatusChange?.(result.success);
    } catch {
      setIsConnected(false);
      setConnectedModel(null);
      onStatusChange?.(false);
    }
    setIsChecking(false);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isChecking ? (
          <RefreshCw size={16} className="animate-spin text-slate-400" />
        ) : isConnected ? (
          <>
            <Wifi size={16} className="text-green-400" />
            <span className="text-xs text-green-400">AI Connected</span>
          </>
        ) : (
          <button
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
          >
            <WifiOff size={16} />
            <span>Setup AI</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/20 border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-500/20' : 'bg-amber-500/20'}`}>
              <Bot size={24} className={isConnected ? 'text-green-400' : 'text-amber-400'} />
            </div>
            <div>
              <CardTitle className="text-white text-lg">
                {isConnected ? '🎉 Your AI is Ready!' : '🤖 Connect Your Own AI'}
              </CardTitle>
              <CardDescription>
                {isConnected
                  ? `Connected to ${connectedModel}`
                  : 'Learn AI by running your own - it\'s easier than you think!'}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkConnection}
            disabled={isChecking}
          >
            <RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className={`flex items-center gap-3 p-3 rounded-lg ${
          isConnected ? 'bg-green-500/10 border border-green-500/30' : 'bg-amber-500/10 border border-amber-500/30'
        }`}>
          {isConnected ? (
            <>
              <CheckCircle size={20} className="text-green-400" />
              <div>
                <p className="text-sm text-green-300 font-medium">AI Connected & Working!</p>
                <p className="text-xs text-slate-400">All features are fully powered by AI</p>
              </div>
            </>
          ) : (
            <>
              <Lightbulb size={20} className="text-amber-400" />
              <div>
                <p className="text-sm text-amber-300 font-medium">No AI Connected Yet</p>
                <p className="text-xs text-slate-400">Features work with demos - connect AI to unlock everything!</p>
              </div>
            </>
          )}
        </div>

        {/* Setup Guide Toggle */}
        {!isConnected && (
          <Button
            variant="outline"
            className="w-full justify-between"
            onClick={() => setShowGuide(!showGuide)}
          >
            <span className="flex items-center gap-2">
              <Rocket size={16} />
              How to Set Up Your Own AI (Free!)
            </span>
            {showGuide ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        )}

        {/* Setup Instructions / Wizard */}
        {showGuide && !isConnected && (
          <div className="pt-2">
            <LLMSetupWizard 
              onComplete={(config) => {
                checkConnection();
                setShowGuide(false);
              }}
            />
          </div>
        )}

        {/* Connected State */}
        {isConnected && (
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-4">
            <h4 className="text-green-300 font-semibold flex items-center gap-2 mb-2">
              <Sparkles size={16} />
              You're All Set!
            </h4>
            <p className="text-sm text-slate-300">
              Your AI is powering all features. Create art, write stories, build games, and learn - all with YOUR AI running on YOUR computer! 🚀
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact status indicator for headers/nav
export function AIStatusBadge() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const result = await aiService.generate('Hi', { maxTokens: 5 });
        setIsConnected(result.success);
      } catch {
        setIsConnected(false);
      }
    };
    check();
  }, []);

  if (isConnected === null) return null;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${
      isConnected 
        ? 'bg-green-500/20 text-green-400' 
        : 'bg-amber-500/20 text-amber-400'
    }`}>
      {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
      <span>{isConnected ? 'AI Ready' : 'Setup AI'}</span>
    </div>
  );
}

export default AISetupGuide;

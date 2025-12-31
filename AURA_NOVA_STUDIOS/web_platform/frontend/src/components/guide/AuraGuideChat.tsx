'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import {
  Sparkles,
  Send,
  ArrowRight,
  MessageCircle,
  X,
  Minimize2,
  Maximize2,
  HelpCircle,
  Compass,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  Lightbulb,
  Bot,
  User,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { 
  auraGuide, 
  GuideResponse, 
  GuidedAction, 
  ConversationMessage,
  TutorialStep,
} from '@/services/auraGuideService';

// ============================================================================
// AURA GUIDE CHAT COMPONENT
// ============================================================================

interface AuraGuideChatProps {
  variant?: 'floating' | 'embedded' | 'fullscreen';
  initialOpen?: boolean;
  currentRoute?: string;
  userId?: string;
}

export function AuraGuideChat({
  variant = 'floating',
  initialOpen = false,
  currentRoute = '/',
  userId = 'anonymous',
}: AuraGuideChatProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<GuidedAction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize guide context
  useEffect(() => {
    auraGuide.setContext({
      userId,
      currentRoute,
      sessionId: `session-${Date.now()}`,
    });

    // Show welcome message
    if (messages.length === 0) {
      const welcome = auraGuide.getQuickStartGuide();
      setMessages([{
        role: 'aura',
        content: welcome.message,
        timestamp: new Date(),
        suggestions: welcome.suggestions,
      }]);
      setSuggestions(welcome.suggestions);
    }
  }, [userId, currentRoute]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage: ConversationMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await auraGuide.processMessage(input);
      
      // Simulate typing delay for natural feel
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

      const auraMessage: ConversationMessage = {
        role: 'aura',
        content: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };

      setMessages(prev => [...prev, auraMessage]);
      setSuggestions(response.suggestions);
    } catch (error) {
      toast.error('Aura had a moment. Please try again!');
    } finally {
      setIsTyping(false);
    }
  }, [input]);

  const handleQuickAction = (action: GuidedAction) => {
    router.push(action.route);
    toast.success(`Opening ${action.title}...`);
    if (variant === 'floating') {
      setIsMinimized(true);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const QUICK_PROMPTS = [
    "What can I create here?",
    "How do I make a game?",
    "I want to create art",
    "Help me learn something new",
    "How do I earn coins?",
    "Take me on a tour",
  ];

  // ============== RENDER FLOATING BUBBLE ==============
  if (variant === 'floating' && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 
                   shadow-lg shadow-purple-500/30 flex items-center justify-center hover:scale-110 
                   transition-transform duration-200 group"
        aria-label="Open Aura Guide"
      >
        <Sparkles className="w-8 h-8 text-white" />
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
          ?
        </span>
        <div className="absolute right-full mr-3 whitespace-nowrap bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg
                        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Ask Aura for help!
        </div>
      </button>
    );
  }

  // ============== RENDER MINIMIZED ==============
  if (variant === 'floating' && isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-72 bg-gray-900 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
        <div 
          className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 cursor-pointer"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="font-semibold text-white">Aura Guide</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <Maximize2 className="w-4 h-4 text-gray-400" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============== MAIN CHAT INTERFACE ==============
  const chatContent = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gradient-to-r from-purple-600/10 to-pink-600/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Aura</h3>
            <p className="text-xs text-gray-400">Your Creative Guide</p>
          </div>
        </div>
        {variant === 'floating' && (
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-gray-400" />
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
              {/* Avatar */}
              <div className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-600'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                
                {/* Message Bubble */}
                <div className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-2' : ''}>
                        {line.split('**').map((part, j) => 
                          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {msg.suggestions && msg.suggestions.length > 0 && msg.role === 'aura' && (
                <div className="mt-3 ml-10 space-y-2">
                  {msg.suggestions.slice(0, 4).map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action)}
                      className="w-full flex items-center gap-3 p-3 bg-gray-800/50 hover:bg-gray-700/50 
                                 rounded-xl border border-gray-700/50 hover:border-purple-500/50 
                                 transition-all text-left group"
                    >
                      <span className="text-xl">{action.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm">{action.title}</div>
                        <div className="text-xs text-gray-400 truncate">{action.description}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span className="text-xs text-gray-400">Try asking:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestedQuestion(prompt)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-300 
                           border border-gray-700 hover:border-purple-500/50 transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-900/50">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Ask Aura anything..."
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );

  // ============== VARIANT WRAPPERS ==============
  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-gray-900 rounded-2xl border border-gray-700 
                      shadow-2xl shadow-purple-500/10 flex flex-col overflow-hidden">
        {chatContent}
      </div>
    );
  }

  if (variant === 'embedded') {
    return (
      <div className="w-full h-full bg-gray-900 rounded-xl border border-gray-700 flex flex-col overflow-hidden">
        {chatContent}
      </div>
    );
  }

  // Fullscreen
  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      {chatContent}
    </div>
  );
}

// ============================================================================
// QUICK HELP BUTTON COMPONENT
// ============================================================================

interface QuickHelpButtonProps {
  context?: string;
  className?: string;
}

export function QuickHelpButton({ context, className = '' }: QuickHelpButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    // Find and open the Aura chat
    const event = new CustomEvent('openAuraGuide', { detail: { context } });
    window.dispatchEvent(event);
    toast.success('Opening Aura Guide...', { icon: '✨' });
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`relative p-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 
                  border border-purple-500/30 hover:border-purple-500/50 transition-all ${className}`}
      aria-label="Get help from Aura"
    >
      <HelpCircle className="w-5 h-5 text-purple-400" />
      {showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap 
                        bg-gray-900 text-white text-xs px-2 py-1 rounded border border-gray-700">
          Ask Aura for help
        </div>
      )}
    </button>
  );
}

// ============================================================================
// FEATURE SPOTLIGHT COMPONENT
// ============================================================================

interface FeatureSpotlightProps {
  featureId: string;
  onDismiss?: () => void;
}

export function FeatureSpotlight({ featureId, onDismiss }: FeatureSpotlightProps) {
  const [feature, setFeature] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const features = auraGuide.searchFeatures(featureId);
    if (features.length > 0) {
      setFeature(features[0]);
    }
  }, [featureId]);

  if (!feature) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{feature.name}</h3>
              <p className="text-sm text-gray-400">{feature.suite} suite</p>
            </div>
          </div>
          {onDismiss && (
            <button onClick={onDismiss} className="text-gray-500 hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <p className="text-gray-300 mb-4">{feature.description}</p>

        <div className="mb-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Capabilities</div>
          <div className="flex flex-wrap gap-2">
            {feature.capabilities.slice(0, 4).map((cap: string, idx: number) => (
              <span key={idx} className="px-2 py-1 bg-gray-800/50 rounded-lg text-xs text-gray-300">
                {cap}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => router.push(feature.route)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Launch
          </Button>
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Tutorial
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// NAVIGATION BREADCRUMB WITH CONTEXT
// ============================================================================

interface SmartBreadcrumbProps {
  currentRoute: string;
}

export function SmartBreadcrumb({ currentRoute }: SmartBreadcrumbProps) {
  const segments = currentRoute.split('/').filter(Boolean);
  
  const getRelatedFeatures = () => {
    const features = auraGuide.searchFeatures(segments[segments.length - 1] || '');
    return features.slice(0, 3);
  };

  const relatedFeatures = getRelatedFeatures();

  return (
    <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
      <div className="flex items-center gap-2 text-sm">
        <Link href="/" className="text-gray-400 hover:text-white">Home</Link>
        {segments.map((segment, idx) => (
          <React.Fragment key={idx}>
            <span className="text-gray-600">/</span>
            <Link 
              href={'/' + segments.slice(0, idx + 1).join('/')}
              className={idx === segments.length - 1 ? 'text-white font-medium' : 'text-gray-400 hover:text-white'}
            >
              {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')}
            </Link>
          </React.Fragment>
        ))}
      </div>

      {relatedFeatures.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Related:</span>
          {relatedFeatures.map((f) => (
            <Link
              key={f.id}
              href={f.route}
              className="text-xs text-purple-400 hover:text-purple-300"
            >
              {f.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuraGuideChat;

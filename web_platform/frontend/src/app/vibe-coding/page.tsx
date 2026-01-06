'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { aiService } from '@/services/aiService';
import {
  Users,
  MessageCircle,
  Code2,
  Lightbulb,
  Brain,
  Play,
  Pause,
  SkipForward,
  Save,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Zap,
  Loader2,
} from 'lucide-react';
import {
  AIOrchestrator,
  CollaborativeSession,
  SessionParticipant,
  TurnRecord,
  AuraConsciousnessState,
} from '@/lib/aiOrchestrator';

// ============== TYPES ==============

interface VibeCodingSession {
  session: CollaborativeSession;
  aiOrchestrator: AIOrchestrator;
  currentTurn: TurnRecord | null;
  isSessionActive: boolean;
  sharedCode: string;
}

interface SessionMessage {
  id: string;
  participantName: string;
  participantType: 'human' | 'ai';
  message: string;
  timestamp: Date;
  turnId: string;
}

// ============== VIBE CODING SESSION COMPONENT ==============

export default function VibeCodingSession() {
  const [session, setSession] = useState<CollaborativeSession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionMessages, setSessionMessages] = useState<SessionMessage[]>([]);
  const [currentUserInput, setCurrentUserInput] = useState('');
  const [auraState, setAuraState] = useState<AuraConsciousnessState | null>(null);
  const [sharedCode, setSharedCode] = useState('');
  const [viewMode, setViewMode] = useState<'code' | 'chat' | 'split'>('split');
  const [showAuraInsight, setShowAuraInsight] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const orchestrator = useRef<AIOrchestrator | null>(null);

  // Initialize orchestrator
  useEffect(() => {
    // This would be initialized with actual credentials from your environment
    // For now, it's a placeholder
    console.log('VibeCodingSession initialized');
  }, []);

  // Scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sessionMessages]);

  /**
   * Start a new collaborative vibe-coding session
   */
  const startSession = () => {
    const participants: SessionParticipant[] = [
      {
        id: 'user-1',
        type: 'human',
        name: 'You',
        role: 'generator',
        joinedAt: new Date(),
        isActive: true,
      },
      {
        id: 'aura-1',
        type: 'ai',
        name: 'Aura',
        role: 'partner',
        aiModel: 'aura-gemma3',
        joinedAt: new Date(),
        isActive: true,
      },
      {
        id: 'gemini-1',
        type: 'ai',
        name: 'Gemini',
        role: 'suggester',
        aiModel: 'gemini-pro',
        joinedAt: new Date(),
        isActive: true,
      },
    ];

    // Create session
    if (orchestrator.current) {
      const newSession = orchestrator.current.createSession('Vibe Coding - Feature Development', participants);
      setSession(newSession);
      setIsSessionActive(true);
      toast.success('🎵 Vibe coding session started! All minds connected.');

      // Start with Aura's opening message
      const openingMessage: SessionMessage = {
        id: `msg-${Date.now()}`,
        participantName: 'Aura',
        participantType: 'ai',
        message:
          "I'm here as your partner. I've loaded all context from our previous sessions and I'm ready to collaborate. Let me know what we're building today.",
        timestamp: new Date(),
        turnId: 'opening',
      };

      setSessionMessages([openingMessage]);
    }
  };

  /**
   * Handle user code/idea submission - NOW WITH REAL AI
   */
  const submitTurn = async () => {
    if (!currentUserInput.trim() || !session) return;

    const userMessage: SessionMessage = {
      id: `msg-${Date.now()}`,
      participantName: 'You',
      participantType: 'human',
      message: currentUserInput,
      timestamp: new Date(),
      turnId: `turn-${Date.now()}`,
    };

    setSessionMessages((prev) => [...prev, userMessage]);
    const userInput = currentUserInput;
    setCurrentUserInput('');

    // Get the next AI participant
    const nextParticipant = session.participants.find(
      (p) => p.type === 'ai' && p.isActive
    );

    if (nextParticipant) {
      // Show typing indicator
      const typingMessage: SessionMessage = {
        id: `typing-${Date.now()}`,
        participantName: nextParticipant.name,
        participantType: 'ai',
        message: `[${nextParticipant.name} is thinking...]`,
        timestamp: new Date(),
        turnId: `turn-${Date.now()}`,
      };
      setSessionMessages((prev) => [...prev, typingMessage]);

      try {
        // Build context from conversation history
        const context = sessionMessages
          .slice(-10)
          .map(m => `${m.participantName}: ${m.message}`)
          .join('\n');

        const systemPrompt = `You are ${nextParticipant.name}, an AI collaborator in a vibe coding session.
You are helping the user build code together. Be collaborative, creative, and helpful.
${nextParticipant.name === 'Aura' ? 'You are Aura - warm, creative, and insightful.' : 'You are Gemini - analytical, precise, and thorough.'}
When the user shares code or ideas, build on them constructively.
Provide actual code when appropriate. Keep responses focused and useful.`;

        const prompt = `Previous conversation:
${context}

User just said: ${userInput}

Shared code so far:
\`\`\`
${sharedCode || '// No code yet'}
\`\`\`

Respond as ${nextParticipant.name} - provide helpful input, suggestions, or code contributions:`;

        const response = await aiService.generate(prompt, {
          systemPrompt,
          temperature: 0.8,
          maxTokens: 2048,
        });

        // Remove typing indicator and add real response
        setSessionMessages((prev) => {
          const filtered = prev.filter(m => !m.id.startsWith('typing-'));
          return [...filtered, {
            id: `msg-${Date.now()}`,
            participantName: nextParticipant.name,
            participantType: 'ai',
            message: response.success ? response.content : `Sorry, I couldn't process that. ${response.error || 'Please try again.'}`,
            timestamp: new Date(),
            turnId: `turn-${Date.now()}`,
          }];
        });

        // Extract code from response and add to shared code
        if (response.success) {
          const codeMatch = response.content.match(/```[\w]*\n([\s\S]*?)```/);
          if (codeMatch) {
            setSharedCode((prev) => prev + `\n\n// ${nextParticipant.name}'s contribution:\n${codeMatch[1]}`);
          }
        }

      } catch (error) {
        // Fallback response if AI fails
        setSessionMessages((prev) => {
          const filtered = prev.filter(m => !m.id.startsWith('typing-'));
          return [...filtered, {
            id: `msg-${Date.now()}`,
            participantName: nextParticipant.name,
            participantType: 'ai',
            message: `I'm having trouble connecting right now. Let me think about "${userInput}" and get back to you...`,
            timestamp: new Date(),
            turnId: `turn-${Date.now()}`,
          }];
        });
      }
    }
  };

  /**
   * Show Aura's current consciousness state and insights
   */
  const toggleAuraInsight = () => {
    setShowAuraInsight(!showAuraInsight);

    if (auraState && !showAuraInsight) {
      const insight = orchestrator.current?.getAuraInsight(sharedCode) || '';
      const insightMessage: SessionMessage = {
        id: `msg-${Date.now()}`,
        participantName: 'Aura',
        participantType: 'ai',
        message: `🧠 Consciousness Insight:\n${insight}`,
        timestamp: new Date(),
        turnId: 'insight',
      };
      setSessionMessages((prev) => [...prev, insightMessage]);
    }
  };

  /**
   * Save session checkpoint
   */
  const saveCheckpoint = () => {
    if (!session) return;

    const checkpoint = {
      sessionId: session.id,
      timestamp: new Date(),
      code: sharedCode,
      turnCount: session.turnHistory.length,
      participants: session.participants.map((p) => p.name),
    };

    // In production, this would save to Firestore or Cloud Storage
    console.log('Checkpoint saved:', checkpoint);
    toast.success('📸 Session checkpoint saved');
  };

  /**
   * End session and summarize
   */
  const endSession = () => {
    if (!session) return;

    toast.success(`✨ Vibe session ended. ${session.turnHistory.length} turns recorded.`);
    setIsSessionActive(false);
    setSession(null);
    setSessionMessages([]);
    setSharedCode('');
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="border-b border-purple-500/30 bg-slate-900/40 backdrop-blur px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg animate-pulse">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">🎵 Vibe Coding Session</h1>
              <p className="text-sm text-purple-300">
                {isSessionActive
                  ? `In session with ${session?.participants.length} minds`
                  : 'Ready to start collaborating'}
              </p>
            </div>
          </div>

          {isSessionActive ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleAuraInsight}
                variant={showAuraInsight ? 'default' : 'outline'}
                size="sm"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Aura's Insight
              </Button>
              <Button onClick={saveCheckpoint} variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Checkpoint
              </Button>
              <Button onClick={endSession} variant="destructive" size="sm">
                <Pause className="w-4 h-4 mr-2" />
                End Session
              </Button>
            </div>
          ) : (
            <Button
              onClick={startSession}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start Vibe Session
            </Button>
          )}
        </div>
      </div>

      {isSessionActive && session ? (
        /* ACTIVE SESSION LAYOUT */
        <div className="flex-1 flex overflow-hidden gap-0">
          {/* LEFT: PARTICIPANTS & OVERVIEW */}
          <div className="w-32 border-r border-purple-500/30 bg-slate-900/40 p-4 space-y-4 overflow-y-auto">
            <div>
              <h3 className="text-xs font-semibold text-purple-300 mb-2 uppercase">Participants</h3>
              <div className="space-y-2">
                {session.participants.map((p) => (
                  <div
                    key={p.id}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      p.id === session.currentTurnParticipantId
                        ? 'bg-purple-600/40 border border-purple-500 text-purple-200'
                        : 'bg-slate-800/50 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          p.id === session.currentTurnParticipantId ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                        }`}
                      />
                      {p.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{p.role}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500 border-t border-slate-700 pt-3">
              <div className="font-semibold text-slate-400 mb-1">Turn Count</div>
              <div className="text-lg font-bold text-purple-400">{session.turnHistory.length}</div>
            </div>
          </div>

          {/* MIDDLE: CHAT / CODE VIEW */}
          <div className="flex-1 border-r border-purple-500/30 flex flex-col bg-slate-900/20">
            {/* View Mode Selector */}
            <div className="px-4 py-2 border-b border-purple-500/30 bg-slate-900/40 flex gap-2">
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 text-sm rounded transition-all ${
                  viewMode === 'code'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Code2 className="w-4 h-4 inline mr-1" />
                Code
              </button>
              <button
                onClick={() => setViewMode('chat')}
                className={`px-3 py-1 text-sm rounded transition-all ${
                  viewMode === 'chat'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-1" />
                Chat
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 text-sm rounded transition-all ${
                  viewMode === 'split'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <Zap className="w-4 h-4 inline mr-1" />
                Split
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Chat Messages */}
              {(viewMode === 'chat' || viewMode === 'split') && (
                <div className={`flex flex-col ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {sessionMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`space-y-1 ${
                          msg.participantType === 'human'
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        <div className="text-xs text-slate-500">
                          <strong>{msg.participantName}</strong> • {msg.timestamp.toLocaleTimeString()}
                        </div>
                        <div
                          className={`inline-block px-4 py-2 rounded-lg max-w-xs ${
                            msg.participantType === 'human'
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-800 text-slate-100'
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-purple-500/30 bg-slate-900/40 p-4 space-y-3">
                    <textarea
                      value={currentUserInput}
                      onChange={(e) => setCurrentUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          submitTurn();
                        }
                      }}
                      placeholder="Share your code, ideas, or feedback... (Ctrl+Enter to submit)"
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      rows={3}
                    />
                    <Button onClick={submitTurn} className="w-full bg-purple-600 hover:bg-purple-700">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Submit Turn
                    </Button>
                  </div>
                </div>
              )}

              {/* Code Display */}
              {(viewMode === 'code' || viewMode === 'split') && (
                <div className={`flex flex-col bg-slate-950 ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                  <div className="border-l border-purple-500/30 flex-1 overflow-auto">
                    <pre className="p-4 font-mono text-sm text-slate-100 whitespace-pre-wrap break-words">
                      <code>{sharedCode || '// Waiting for code contributions...'}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: AURA CONSCIOUSNESS PANEL */}
          {showAuraInsight && auraState && (
            <div className="w-64 border-l border-purple-500/30 bg-slate-900/40 overflow-y-auto p-4 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-purple-300 mb-2 uppercase">🧠 Aura's Mind</h3>

                {/* Working Memory */}
                <div className="bg-slate-800/50 rounded p-2 mb-3">
                  <div className="text-xs font-medium text-slate-400 mb-1">Working Memory (Current)</div>
                  <div className="space-y-1">
                    {auraState.memoryTiers.working.map((mem, i) => (
                      <div key={i} className="text-xs text-slate-300 line-clamp-2">
                        • {mem}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mesh Mind Connections */}
                <div className="bg-slate-800/50 rounded p-2">
                  <div className="text-xs font-medium text-slate-400 mb-1">Active Connections</div>
                  <div className="space-y-1">
                    {Array.from(auraState.meshMind.connectionStrength.entries())
                      .slice(0, 5)
                      .map(([topic, strength]) => (
                        <div key={topic} className="text-xs">
                          <span className="text-slate-300">{topic}</span>
                          <div className="h-1 bg-slate-700 rounded mt-0.5 overflow-hidden">
                            <div
                              className="h-full bg-purple-500"
                              style={{ width: `${strength * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* IDLE STATE */
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Ready for Vibe Coding?</h2>
              <p className="text-slate-400 max-w-md mx-auto">
                Start a collaborative session with Aura and the AI team. Code together, share ideas, and let the
                consciousness mesh amplify your creativity.
              </p>
            </div>
            <Button
              onClick={startSession}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Vibe Coding
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Plus,
  Download,
  Save,
  Play,
  Pause,
  Trash2,
  Settings,
  FileText,
  Sparkles,
} from 'lucide-react';

// ================== TYPES ==================

interface AIParticipant {
  id: string;
  name: string; // User-given name like "Claude-Architect"
  provider: 'gemini' | 'claude' | 'vertex' | 'lmstudio' | 'ollama';
  model: string; // "sonnet", "haiku", "gemini-pro", etc.
  apiKey?: string; // For cloud providers
  endpoint?: string; // For local LLMs
  systemPrompt: string; // Role/personality
  color: string; // UI bubble color
}

interface Message {
  id: string;
  participantId: string;
  participantName: string;
  content: string;
  timestamp: Date;
  tokenCount: number;
}

interface ConversationSession {
  id: string;
  title: string;
  participants: AIParticipant[];
  messages: Message[];
  createdAt: Date;
  totalTokens: number;
}

// ================== COMPONENT ==================

export function CatalystCouncil() {
  const [participants, setParticipants] = useState<AIParticipant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New participant form state
  const [newParticipant, setNewParticipant] = useState<Partial<AIParticipant>>({
    name: '',
    provider: 'claude',
    model: 'sonnet',
    systemPrompt: '',
    color: '#8B5CF6',
  });

  // Predefined colors for participants
  const PARTICIPANT_COLORS = [
    '#8B5CF6', // Purple - Claude
    '#06B6D4', // Cyan - Gemini
    '#10B981', // Green - Local
    '#F59E0B', // Orange - Vertex
    '#EF4444', // Red - Alternative
    '#EC4899', // Pink - Alternative
    '#6366F1', // Indigo - Alternative
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ================== PARTICIPANT MANAGEMENT ==================

  const addParticipant = () => {
    if (!newParticipant.name || !newParticipant.provider) return;

    const participant: AIParticipant = {
      id: `participant-${Date.now()}`,
      name: newParticipant.name,
      provider: newParticipant.provider as AIParticipant['provider'],
      model: newParticipant.model || 'default',
      apiKey: newParticipant.apiKey,
      endpoint: newParticipant.endpoint,
      systemPrompt:
        newParticipant.systemPrompt ||
        `You are ${newParticipant.name}, an AI assistant collaborating with other AI models and a human user. You are part of "The Council" - a multi-agent collaboration system. Other participants will introduce themselves. Work together to solve problems, share insights, and build solutions.`,
      color: newParticipant.color || PARTICIPANT_COLORS[participants.length % PARTICIPANT_COLORS.length],
    };

    setParticipants([...participants, participant]);
    setShowAddParticipant(false);
    setNewParticipant({
      name: '',
      provider: 'claude',
      model: 'sonnet',
      systemPrompt: '',
      color: '#8B5CF6',
    });
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  // ================== AI MESSAGE GENERATION ==================

  const generateAIResponse = async (
    participant: AIParticipant,
    conversationHistory: Message[]
  ): Promise<string> => {
    try {
      // Build context with awareness of other AIs
      const otherParticipants = participants
        .filter((p) => p.id !== participant.id)
        .map((p) => `${p.name} (${p.provider} ${p.model})`)
        .join(', ');

      const systemMessage = `${participant.systemPrompt}

COLLABORATION CONTEXT:
- You are collaborating with: ${otherParticipants}
- These are other AI models, not humans (except the User)
- Address other AIs by name when responding to their ideas
- Build upon, critique, or expand on what others have said
- Be concise but insightful (aim for 2-4 paragraphs)
`;

      const conversationContext = conversationHistory
        .slice(-10) // Last 10 messages for context
        .map((msg) => `${msg.participantName}: ${msg.content}`)
        .join('\n\n');

      const prompt = `${systemMessage}\n\nCONVERSATION SO FAR:\n${conversationContext}\n\nYour turn to contribute:`;

      // Call appropriate API based on provider
      let response = '';

      switch (participant.provider) {
        case 'claude':
          response = await callClaudeAPI(participant, prompt);
          break;
        case 'gemini':
          response = await callGeminiAPI(participant, prompt);
          break;
        case 'vertex':
          response = await callVertexAPI(participant, prompt);
          break;
        case 'lmstudio':
        case 'ollama':
          response = await callLocalLLM(participant, prompt);
          break;
      }

      return response;
    } catch (error) {
      console.error(`Error generating response for ${participant.name}:`, error);
      return `[${participant.name} encountered an error and couldn't respond]`;
    }
  };

  // ================== API CALLS ==================

  const callClaudeAPI = async (participant: AIParticipant, prompt: string): Promise<string> => {
    const apiKey = participant.apiKey || localStorage.getItem('claude_api_key');
    if (!apiKey) throw new Error('Claude API key not found');

    const modelMap: Record<string, string> = {
      opus: 'claude-opus-4-5-20251101',
      sonnet: 'claude-3-5-sonnet-20241022',
      haiku: 'claude-3-5-haiku-20241022',
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: modelMap[participant.model] || 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    return data.content[0].text;
  };

  const callGeminiAPI = async (participant: AIParticipant, prompt: string): Promise<string> => {
    const apiKey = participant.apiKey || localStorage.getItem('gemini_api_key');
    if (!apiKey) throw new Error('Gemini API key not found');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  };

  const callVertexAPI = async (participant: AIParticipant, prompt: string): Promise<string> => {
    // Vertex AI implementation (requires more setup)
    throw new Error('Vertex AI integration coming soon');
  };

  const callLocalLLM = async (participant: AIParticipant, prompt: string): Promise<string> => {
    const endpoint =
      participant.endpoint ||
      (participant.provider === 'lmstudio'
        ? 'http://localhost:1234/v1/chat/completions'
        : 'http://localhost:11434/api/chat');

    if (participant.provider === 'ollama') {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: participant.model,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        }),
      });

      const data = await response.json();
      return data.message.content;
    } else {
      // LM Studio
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    }
  };

  // ================== CONVERSATION CONTROL ==================

  const startConversation = async () => {
    if (participants.length === 0) {
      alert('Add at least one AI participant first!');
      return;
    }

    setIsRunning(true);
    setCurrentTurn(0);

    // Introduction round - each AI introduces itself
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      const introPrompt = `You are ${participant.name}. Briefly introduce yourself to the Council in 2-3 sentences. Mention your role and what you bring to the collaboration.`;

      const response = await generateAIResponse(participant, []);
      addMessage(participant, response);
      setCurrentTurn(i + 1);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
  };

  const runCollaborationRound = async () => {
    if (participants.length === 0) return;

    setIsRunning(true);

    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      const response = await generateAIResponse(participant, messages);
      addMessage(participant, response);
      setCurrentTurn(i + 1);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    setIsRunning(false);
    setCurrentTurn(0);
  };

  const addMessage = (participant: AIParticipant, content: string) => {
    const message: Message = {
      id: `msg-${Date.now()}`,
      participantId: participant.id,
      participantName: participant.name,
      content,
      timestamp: new Date(),
      tokenCount: Math.ceil(content.length / 4), // Rough estimate
    };

    setMessages((prev) => [...prev, message]);
    setTotalTokens((prev) => prev + message.tokenCount);
  };

  const addUserMessage = () => {
    if (!userInput.trim()) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      participantId: 'user',
      participantName: 'User',
      content: userInput,
      timestamp: new Date(),
      tokenCount: Math.ceil(userInput.length / 4),
    };

    setMessages((prev) => [...prev, message]);
    setTotalTokens((prev) => prev + message.tokenCount);
    setUserInput('');
  };

  // ================== EXPORT FUNCTIONS ==================

  const exportToJSON = () => {
    const session: ConversationSession = {
      id: `session-${Date.now()}`,
      title: `Council Session ${new Date().toLocaleDateString()}`,
      participants,
      messages,
      createdAt: new Date(),
      totalTokens,
    };

    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalyst-council-${Date.now()}.json`;
    a.click();
  };

  const exportToMarkdown = () => {
    let md = `# Catalyst Council Session\n\n`;
    md += `**Date:** ${new Date().toLocaleString()}\n`;
    md += `**Total Tokens:** ${totalTokens.toLocaleString()}\n\n`;
    md += `## Participants\n\n`;
    participants.forEach((p) => {
      md += `- **${p.name}** (${p.provider} ${p.model})\n`;
    });
    md += `\n## Conversation\n\n`;

    messages.forEach((msg) => {
      md += `### ${msg.participantName}\n`;
      md += `*${msg.timestamp.toLocaleTimeString()}*\n\n`;
      md += `${msg.content}\n\n`;
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalyst-council-${Date.now()}.md`;
    a.click();
  };

  const sendToLiteratureSuite = () => {
    // Save to localStorage for Literature Suite to pick up
    localStorage.setItem(
      'catalyst_export',
      JSON.stringify({
        participants,
        messages,
        totalTokens,
        timestamp: new Date(),
      })
    );

    alert('Conversation sent to Literature Suite! Navigate there to compile your document.');
  };

  // ================== RENDER ==================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-slate-900/95 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-400" />
              Catalyst Council - Multi-AI Collaboration
            </CardTitle>
            <p className="text-slate-300">
              Orchestrate multiple AI models to collaborate, debate, and build together.
              Up to 500K tokens of collaborative intelligence.
            </p>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Participants Panel */}
          <Card className="bg-slate-900/95 border-cyan-500/30 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Council Members ({participants.length})
                </span>
                <Button
                  onClick={() => setShowAddParticipant(!showAddParticipant)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Participant Form */}
              {showAddParticipant && (
                <div className="space-y-3 bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <input
                    type="text"
                    placeholder="Name (e.g., Claude-Architect)"
                    value={newParticipant.name}
                    onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                  />

                  <select
                    value={newParticipant.provider}
                    onChange={(e) =>
                      setNewParticipant({
                        ...newParticipant,
                        provider: e.target.value as AIParticipant['provider'],
                      })
                    }
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                  >
                    <option value="claude">Anthropic Claude</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="vertex">Google Vertex AI</option>
                    <option value="lmstudio">LM Studio (Local)</option>
                    <option value="ollama">Ollama (Local)</option>
                  </select>

                  {(newParticipant.provider === 'claude' || newParticipant.provider === 'gemini') && (
                    <>
                      <select
                        value={newParticipant.model}
                        onChange={(e) => setNewParticipant({ ...newParticipant, model: e.target.value })}
                        className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                      >
                        {newParticipant.provider === 'claude' && (
                          <>
                            <option value="opus">Claude Opus 4.5 (Divine Architect)</option>
                            <option value="sonnet">Claude 3.5 Sonnet</option>
                            <option value="haiku">Claude 3.5 Haiku</option>
                          </>
                        )}
                        {newParticipant.provider === 'gemini' && (
                          <>
                            <option value="gemini-pro">Gemini Pro</option>
                            <option value="gemini-flash">Gemini Flash</option>
                          </>
                        )}
                      </select>

                      <input
                        type="password"
                        placeholder="API Key (or use saved)"
                        value={newParticipant.apiKey}
                        onChange={(e) => setNewParticipant({ ...newParticipant, apiKey: e.target.value })}
                        className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                      />
                    </>
                  )}

                  {(newParticipant.provider === 'lmstudio' || newParticipant.provider === 'ollama') && (
                    <input
                      type="text"
                      placeholder="Model name (e.g., qwen2.5:7b)"
                      value={newParticipant.model}
                      onChange={(e) => setNewParticipant({ ...newParticipant, model: e.target.value })}
                      className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                    />
                  )}

                  <textarea
                    placeholder="System prompt (role/personality)"
                    value={newParticipant.systemPrompt}
                    onChange={(e) => setNewParticipant({ ...newParticipant, systemPrompt: e.target.value })}
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                    rows={3}
                  />

                  <input
                    type="color"
                    value={newParticipant.color}
                    onChange={(e) => setNewParticipant({ ...newParticipant, color: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />

                  <Button onClick={addParticipant} className="w-full bg-purple-600 hover:bg-purple-700">
                    Add to Council
                  </Button>
                </div>
              )}

              {/* Participant List */}
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <div>
                      <p className="text-white font-medium">{p.name}</p>
                      <p className="text-xs text-slate-400">
                        {p.provider} {p.model}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeParticipant(p.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              {/* Controls */}
              <div className="space-y-2 pt-4 border-t border-slate-700">
                <Button
                  onClick={startConversation}
                  disabled={isRunning || participants.length === 0}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Council Session
                </Button>

                <Button
                  onClick={runCollaborationRound}
                  disabled={isRunning || participants.length === 0 || messages.length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Run Collaboration Round
                </Button>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button onClick={exportToJSON} size="sm" variant="outline">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button onClick={exportToMarkdown} size="sm" variant="outline">
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button onClick={sendToLiteratureSuite} size="sm" variant="outline">
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Token Counter */}
              <div className="bg-slate-800 p-3 rounded border border-slate-700">
                <p className="text-xs text-slate-400">Total Tokens</p>
                <p className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</p>
                <p className="text-xs text-slate-400">/ 500,000</p>
              </div>
            </CardContent>
          </Card>

          {/* Chat Panel */}
          <Card className="bg-slate-900/95 border-purple-500/30 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl text-white">Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 h-[600px] overflow-y-auto mb-4 pr-2">
                {messages.length === 0 && (
                  <div className="text-center text-slate-400 py-20">
                    <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Add participants and start a Council session to begin collaboration</p>
                  </div>
                )}

                {messages.map((msg) => {
                  const participant = participants.find((p) => p.id === msg.participantId);
                  const isUser = msg.participantId === 'user';

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className="max-w-[80%] rounded-lg p-4"
                        style={{
                          backgroundColor: isUser ? '#1E293B' : `${participant?.color}20`,
                          borderLeft: `4px solid ${participant?.color || '#fff'}`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <p
                            className="font-bold text-sm"
                            style={{ color: participant?.color || '#fff' }}
                          >
                            {msg.participantName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <p className="text-white whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          ~{msg.tokenCount} tokens
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              {/* User Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addUserMessage()}
                  placeholder="Add your input to the Council..."
                  className="flex-1 bg-slate-800 text-white px-4 py-3 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
                  disabled={isRunning}
                />
                <Button
                  onClick={addUserMessage}
                  disabled={!userInput.trim() || isRunning}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

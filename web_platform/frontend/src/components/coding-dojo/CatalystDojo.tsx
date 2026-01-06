/**
 * =============================================================================
 * CATALYST DOJO - Multi-AI Code Collaboration Platform
 * =============================================================================
 *
 * Author: Dillan Copeland (DC)
 * Created: January 5, 2026
 * Last Modified: January 5, 2026 - DC
 * Copyright © 2026 Dillan Copeland. All Rights Reserved.
 *
 * NOTICE: This code is proprietary and confidential.
 * Unauthorized copying, distribution, modification, or use of this software,
 * via any medium, is strictly prohibited without express written permission
 * from the copyright owner, Dillan Copeland.
 *
 * For licensing inquiries, please contact the owner.
 *
 * LM STUDIO INTEGRATION:
 * This component integrates with LM Studio and its RAG v1 plugin.
 * LM Studio is developed by LM Studio (https://lmstudio.ai).
 * The RAG v1 plugin provides enhanced context retrieval capabilities.
 * This integration is provided with proper attribution and disclaimers.
 *
 * =============================================================================
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Plus,
  Download,
  Play,
  Code2,
  Sparkles,
  Trash2,
  Copy,
  Check,
  Zap,
  FileCode,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ================== TYPES ==================

interface AIParticipant {
  id: string;
  name: string;
  provider: 'gemini' | 'claude' | 'vertex' | 'lmstudio' | 'ollama';
  model: string;
  apiKey?: string;
  endpoint?: string;
  systemPrompt: string;
  role: 'architect' | 'implementer' | 'reviewer' | 'tester' | 'documenter';
  color: string;
  ragEnabled?: boolean; // NEW: LM Studio RAG plugin toggle
}

interface CodeMessage {
  id: string;
  participantId: string;
  participantName: string;
  type: 'code' | 'comment' | 'suggestion' | 'review';
  content: string;
  language?: 'typescript' | 'javascript' | 'python' | 'cpp' | 'csharp' | 'gdscript';
  timestamp: Date;
  tokenCount: number;
}

interface CodeProject {
  id: string;
  title: string;
  description: string;
  engine?: 'unreal' | 'unity' | 'godot' | 'phaser' | 'react' | 'vue' | 'svelte';
  participants: AIParticipant[];
  messages: CodeMessage[];
  codeFiles: CodeFile[];
  createdAt: Date;
  totalTokens: number;
}

interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
  contributor: string;
  lastModified: Date;
}

// ================== COMPONENT ==================

export function CatalystDojo() {
  const [participants, setParticipants] = useState<AIParticipant[]>([]);
  const [messages, setMessages] = useState<CodeMessage[]>([]);
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
  const [userInput, setUserInput] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectEngine, setProjectEngine] = useState<CodeProject['engine']>('unreal');
  const [isRunning, setIsRunning] = useState(false);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [ragPluginActive, setRagPluginActive] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New participant form state
  const [newParticipant, setNewParticipant] = useState<Partial<AIParticipant>>({
    name: '',
    provider: 'claude',
    model: 'sonnet',
    role: 'architect',
    systemPrompt: '',
    color: '#8B5CF6',
    ragEnabled: false,
  });

  const PARTICIPANT_COLORS = [
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#10B981', // Green
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#EC4899', // Pink
  ];

  const ROLE_PROMPTS = {
    architect: 'You are a software architect. Design system architecture, choose patterns, and plan the codebase structure.',
    implementer: 'You are a code implementer. Write clean, efficient code based on architectural decisions and requirements.',
    reviewer: 'You are a code reviewer. Review code for bugs, security issues, performance problems, and best practices.',
    tester: 'You are a QA tester. Write tests, find edge cases, and ensure code quality and reliability.',
    documenter: 'You are a technical writer. Document code, write README files, and create clear explanations.',
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ================== PARTICIPANT MANAGEMENT ==================

  const addParticipant = () => {
    if (!newParticipant.name || !newParticipant.provider || !newParticipant.role) return;

    const participant: AIParticipant = {
      id: `participant-${Date.now()}`,
      name: newParticipant.name,
      provider: newParticipant.provider as AIParticipant['provider'],
      model: newParticipant.model || 'default',
      apiKey: newParticipant.apiKey,
      endpoint: newParticipant.endpoint,
      role: newParticipant.role as AIParticipant['role'],
      systemPrompt:
        newParticipant.systemPrompt ||
        `You are ${newParticipant.name}, working as a ${newParticipant.role} in The Catalyst Dojo. ${ROLE_PROMPTS[newParticipant.role as keyof typeof ROLE_PROMPTS]} You are collaborating with other AI specialists. Reference their contributions and build upon their work.`,
      color: newParticipant.color || PARTICIPANT_COLORS[participants.length % PARTICIPANT_COLORS.length],
      ragEnabled: newParticipant.ragEnabled || false,
    };

    setParticipants([...participants, participant]);
    setShowAddParticipant(false);
    toast.success(`${participant.name} joined the Dojo!`);

    setNewParticipant({
      name: '',
      provider: 'claude',
      model: 'sonnet',
      role: 'architect',
      systemPrompt: '',
      color: '#8B5CF6',
      ragEnabled: false,
    });
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id));
  };

  // ================== AI RESPONSE GENERATION ==================

  const generateAIResponse = async (
    participant: AIParticipant,
    conversationHistory: CodeMessage[]
  ): Promise<string> => {
    try {
      const otherParticipants = participants
        .filter((p) => p.id !== participant.id)
        .map((p) => `${p.name} (${p.role})`)
        .join(', ');

      const systemMessage = `${participant.systemPrompt}

PROJECT: ${projectTitle || 'Untitled Project'}
ENGINE/FRAMEWORK: ${projectEngine?.toUpperCase() || 'Not specified'}

TEAM MEMBERS:
- ${otherParticipants}

INSTRUCTIONS:
- You are working with other AI specialists, not humans (except the User)
- Reference other AI contributions by name
- Build upon what others have said
- Provide CODE when appropriate (wrap in triple backticks with language)
- Be concise but thorough (2-4 paragraphs or 1 code block)
- Focus on your role: ${participant.role}
${participant.ragEnabled ? '\n⚡ RAG ENABLED: You have access to enhanced context retrieval via LM Studio RAG v1' : ''}
`;

      const recentMessages = conversationHistory
        .slice(-8)
        .map((msg) => `${msg.participantName} [${msg.type}]: ${msg.content}`)
        .join('\n\n');

      const prompt = `${systemMessage}\n\nRECENT CONVERSATION:\n${recentMessages}\n\nYour contribution:`;

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

      // Extract code blocks if present
      extractCodeFromResponse(response, participant);

      return response;
    } catch (error) {
      console.error(`Error generating response for ${participant.name}:`, error);
      return `[${participant.name} encountered an error]`;
    }
  };

  // ================== API CALLS ==================

  const callClaudeAPI = async (participant: AIParticipant, prompt: string): Promise<string> => {
    const apiKey = participant.apiKey || process.env.NEXT_PUBLIC_CLAUDE_API_KEY || localStorage.getItem('claude_api_key');
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
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    return data.content[0].text;
  };

  const callGeminiAPI = async (participant: AIParticipant, prompt: string): Promise<string> => {
    const apiKey = participant.apiKey || process.env.NEXT_PUBLIC_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
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

  const callVertexAPI = async (_participant: AIParticipant, _prompt: string): Promise<string> => {
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
      // LM Studio with optional RAG
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          // RAG will be applied by LM Studio plugin if enabled
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    }
  };

  // ================== CODE EXTRACTION ==================

  const extractCodeFromResponse = (response: string, participant: AIParticipant) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(response)) !== null) {
      const language = match[1] || 'plaintext';
      const code = match[2];

      const codeFile: CodeFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: `${participant.name}-${language}-${codeFiles.length + 1}.${getFileExtension(language)}`,
        language,
        content: code,
        contributor: participant.name,
        lastModified: new Date(),
      };

      setCodeFiles((prev) => [...prev, codeFile]);
    }
  };

  const getFileExtension = (language: string): string => {
    const extensions: Record<string, string> = {
      typescript: 'ts',
      javascript: 'js',
      python: 'py',
      cpp: 'cpp',
      csharp: 'cs',
      gdscript: 'gd',
      html: 'html',
      css: 'css',
      json: 'json',
    };
    return extensions[language.toLowerCase()] || 'txt';
  };

  // ================== SESSION CONTROL ==================

  const startDojoSession = async () => {
    if (participants.length === 0) {
      toast.error('Add at least one AI participant first!');
      return;
    }

    if (!projectTitle.trim()) {
      toast.error('Enter a project title first!');
      return;
    }

    setIsRunning(true);
    toast.success('🥋 Catalyst Dojo session started!');

    // Introduction round
    for (const participant of participants) {
      const intro = await generateAIResponse(participant, []);

      addMessage(participant, intro, 'comment');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
  };

  const runCollaborationRound = async () => {
    if (participants.length === 0) return;

    setIsRunning(true);

    for (const participant of participants) {
      const response = await generateAIResponse(participant, messages);
      addMessage(participant, response, 'code');
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    setIsRunning(false);
  };

  const addMessage = (participant: AIParticipant, content: string, type: CodeMessage['type']) => {
    const message: CodeMessage = {
      id: `msg-${Date.now()}`,
      participantId: participant.id,
      participantName: participant.name,
      type,
      content,
      timestamp: new Date(),
      tokenCount: Math.ceil(content.length / 4),
    };

    setMessages((prev) => [...prev, message]);
    setTotalTokens((prev) => prev + message.tokenCount);
  };

  const addUserMessage = () => {
    if (!userInput.trim()) return;

    const message: CodeMessage = {
      id: `msg-${Date.now()}`,
      participantId: 'user',
      participantName: 'User',
      type: 'comment',
      content: userInput,
      timestamp: new Date(),
      tokenCount: Math.ceil(userInput.length / 4),
    };

    setMessages((prev) => [...prev, message]);
    setTotalTokens((prev) => prev + message.tokenCount);
    setUserInput('');
  };

  // ================== EXPORT ==================

  const exportProject = () => {
    const project: CodeProject = {
      id: `project-${Date.now()}`,
      title: projectTitle,
      description: `Collaborative project built in Catalyst Dojo`,
      engine: projectEngine,
      participants,
      messages,
      codeFiles,
      createdAt: new Date(),
      totalTokens,
    };

    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalyst-dojo-${projectTitle.replace(/\s+/g, '-')}.json`;
    a.click();
    toast.success('Project exported!');
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    toast.success('Code copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  // ================== RENDER ==================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-slate-900/95 border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
              <Code2 className="w-8 h-8 text-purple-400" />
              The Catalyst Dojo - Multi-AI Code Collaboration
            </CardTitle>
            <p className="text-slate-300">
              Multiple AI specialists working together to build your project. Architecture, implementation, review, testing, and documentation - all in one place.
            </p>
          </CardHeader>
        </Card>

        {/* Project Setup */}
        <Card className="bg-slate-900/95 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-xl text-white">Project Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Project Title</label>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g., RPG Combat System"
                className="w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-600 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Engine/Framework</label>
              <select
                value={projectEngine}
                onChange={(e) => setProjectEngine(e.target.value as CodeProject['engine'])}
                className="w-full bg-slate-800 text-white px-4 py-2 rounded border border-slate-600"
              >
                <option value="unreal">Unreal Engine (C++)</option>
                <option value="unity">Unity (C#)</option>
                <option value="godot">Godot (GDScript)</option>
                <option value="phaser">Phaser (TypeScript)</option>
                <option value="react">React (TypeScript)</option>
                <option value="vue">Vue (TypeScript)</option>
                <option value="svelte">Svelte (TypeScript)</option>
              </select>
            </div>

            {/* LM Studio RAG Plugin Toggle */}
            <div className="bg-slate-800 p-4 rounded border border-yellow-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-medium">LM Studio RAG Plugin</span>
                </div>
                <button
                  onClick={() => setRagPluginActive(!ragPluginActive)}
                  className={`px-4 py-1 rounded font-bold transition-all ${
                    ragPluginActive
                      ? 'bg-yellow-500 text-black'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {ragPluginActive ? 'Active' : 'Inactive'}
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Enable enhanced context retrieval for LM Studio participants.
                <br />
                <span className="text-yellow-400">⚡ Powered by LM Studio RAG v1</span> -
                <a
                  href="https://lmstudio.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 ml-1"
                >
                  Learn more
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Participants Panel */}
          <Card className="bg-slate-900/95 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Dojo Members ({participants.length})
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
                    value={newParticipant.role}
                    onChange={(e) =>
                      setNewParticipant({
                        ...newParticipant,
                        role: e.target.value as AIParticipant['role'],
                      })
                    }
                    className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                  >
                    <option value="architect">Architect (Design)</option>
                    <option value="implementer">Implementer (Code)</option>
                    <option value="reviewer">Reviewer (QA)</option>
                    <option value="tester">Tester (Testing)</option>
                    <option value="documenter">Documenter (Docs)</option>
                  </select>

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

                  {newParticipant.provider === 'claude' && (
                    <select
                      value={newParticipant.model}
                      onChange={(e) => setNewParticipant({ ...newParticipant, model: e.target.value })}
                      className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                    >
                      <option value="opus">Claude Opus 4.5</option>
                      <option value="sonnet">Claude 3.5 Sonnet</option>
                      <option value="haiku">Claude 3.5 Haiku</option>
                    </select>
                  )}

                  {(newParticipant.provider === 'lmstudio' || newParticipant.provider === 'ollama') && (
                    <>
                      <input
                        type="text"
                        placeholder="Model name (e.g., qwen2.5:7b)"
                        value={newParticipant.model}
                        onChange={(e) => setNewParticipant({ ...newParticipant, model: e.target.value })}
                        className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newParticipant.ragEnabled}
                          onChange={(e) => setNewParticipant({ ...newParticipant, ragEnabled: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <label className="text-white text-sm">Enable RAG (LM Studio only)</label>
                      </div>
                    </>
                  )}

                  <Button onClick={addParticipant} className="w-full bg-purple-600 hover:bg-purple-700">
                    Add to Dojo
                  </Button>
                </div>
              )}

              {/* Participant List */}
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-800 p-3 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      <div>
                        <p className="text-white font-medium">{p.name}</p>
                        <p className="text-xs text-slate-400">
                          {p.role} • {p.provider} {p.model}
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
                  {p.ragEnabled && (
                    <div className="text-xs text-yellow-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      RAG Enabled
                    </div>
                  )}
                </div>
              ))}

              {/* Controls */}
              <div className="space-y-2 pt-4 border-t border-slate-700">
                <Button
                  onClick={startDojoSession}
                  disabled={isRunning || participants.length === 0}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Dojo Session
                </Button>

                <Button
                  onClick={runCollaborationRound}
                  disabled={isRunning || participants.length === 0 || messages.length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Run Collaboration Round
                </Button>

                <Button onClick={exportProject} className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Project
                </Button>
              </div>

              {/* Token Counter */}
              <div className="bg-slate-800 p-3 rounded border border-slate-700">
                <p className="text-xs text-slate-400">Total Tokens</p>
                <p className="text-2xl font-bold text-white">{totalTokens.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Chat & Code Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Conversation */}
            <Card className="bg-slate-900/95 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-xl text-white">Collaboration Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto space-y-4 mb-4 pr-2">
                  {messages.length === 0 && (
                    <div className="text-center text-slate-400 py-20">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Start a Dojo session to begin AI collaboration</p>
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
                          className="max-w-[85%] rounded-lg p-4"
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
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                              {msg.type}
                            </span>
                            {participant?.ragEnabled && (
                              <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                RAG
                              </span>
                            )}
                          </div>
                          <p className="text-white whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            {msg.timestamp.toLocaleTimeString()} • ~{msg.tokenCount} tokens
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
                    onKeyDown={(e) => e.key === 'Enter' && addUserMessage()}
                    placeholder="Add your instructions or requirements..."
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

            {/* Code Files */}
            <Card className="bg-slate-900/95 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5" />
                  Generated Code Files ({codeFiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {codeFiles.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">
                    No code files generated yet. AI participants will create files as they collaborate.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {codeFiles.map((file) => (
                      <div key={file.id} className="bg-slate-800 rounded-lg border border-slate-700">
                        <div className="flex items-center justify-between p-3 border-b border-slate-700">
                          <div>
                            <p className="text-white font-mono text-sm">{file.name}</p>
                            <p className="text-xs text-slate-400">
                              by {file.contributor} • {file.language}
                            </p>
                          </div>
                          <Button
                            onClick={() => copyCode(file.content, file.id)}
                            size="sm"
                            variant="ghost"
                            className="text-cyan-400 hover:text-cyan-300"
                          >
                            {copied === file.id ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        <pre className="p-4 overflow-x-auto">
                          <code className="text-sm text-slate-300">{file.content}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* LM Studio Attribution Footer */}
        <Card className="bg-slate-900/95 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-3 text-sm text-slate-400">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>
                Local AI powered by{' '}
                <a
                  href="https://lmstudio.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 font-medium"
                >
                  LM Studio
                </a>
                {ragPluginActive && (
                  <>
                    {' • '}
                    Enhanced with{' '}
                    <span className="text-yellow-400 font-medium">LM Studio RAG v1 Plugin</span>
                  </>
                )}
              </span>
            </div>
            <p className="text-center text-xs text-slate-500 mt-2">
              Disclaimer: LM Studio and its plugins are developed by LM Studio. AuraNova OS integrates these tools with proper attribution. Visit lmstudio.ai for more information.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

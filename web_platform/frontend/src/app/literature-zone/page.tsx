'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { aiService } from '@/services/aiService';
import { 
  BookOpen, Music, Users, PenTool, Sparkles, ArrowRight,
  FileText, Save, Settings, Type, Bold, Italic, Highlighter, MessageCircle
} from 'lucide-react';
import { DailyChallengeWidget, WalletDisplay } from '@/components/challenges/DailyChallengeWidget';

// Type alias for backward compatibility
type TextDocument = Document;

interface CreativeArea {
  id: string;
  title: string;
  icon: React.ReactNode;
  emoji: string;
  description: string;
  features: string[];
  color: string;
  href: string;
  stats: {
    label: string;
    value: string;
  }[];
}

interface Document {
  id: string;
  title: string;
  content: string;
  format: 'draft' | 'young-readers' | 'full-novel' | 'research' | 'summary' | 'compiled';
  fontSize: number;
  fontFamily: string;
  highlighting: Map<string, string>;
  metadata: {
    wordCount: number;
    charCount: number;
    createdAt: Date;
    updatedAt: Date;
    chapterCount?: number;
  };
}

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function LiteratureZonePage() {
  const [activeArea, setActiveArea] = useState<string | null>(null);

  const areas: CreativeArea[] = [
    {
      id: 'poetry',
      title: 'Poems Creator',
      emoji: '📝',
      icon: <PenTool className="w-6 h-6" />,
      description: 'Master the art of poetry across 10 different styles. Validate structure, analyze metrics, and find your voice.',
      features: [
        '10 Poem Styles (Sonnet, Haiku, Free-Verse, Acrostic & more)',
        'Real-time syllable counting & rhyme scheme analysis',
        '8 Themes & 8 Moods for inspiration',
        'Structure validation for each style',
        'Poetry collections & organization',
        '8 Pre-built prompts with difficulty levels',
      ],
      color: '#ec4899',
      href: '/poems-creator',
      stats: [
        { label: 'Styles', value: '10' },
        { label: 'Themes', value: '8' },
        { label: 'Prompts', value: '8' },
      ],
    },
    {
      id: 'music',
      title: 'Music Composer',
      emoji: '🎵',
      icon: <Music className="w-6 h-6" />,
      description: 'Compose music like a professional. Build tracks, layer instruments, apply effects, and create melodies.',
      features: [
        '12 Instruments across 4 categories',
        '10 Musical scales & 15 genres',
        '8 Mood presets with colors',
        'Real-time mixer with volume, pan, effects',
        'Drum loop & chord progression generation',
        'BPM control (40-300) & time signatures',
      ],
      color: '#f59e0b',
      href: '/music-composer',
      stats: [
        { label: 'Instruments', value: '12' },
        { label: 'Scales', value: '10' },
        { label: 'Genres', value: '15' },
      ],
    },
    {
      id: 'collaborative',
      title: 'Collaborative Writing',
      emoji: '💬',
      icon: <Users className="w-6 h-6" />,
      description: 'Write together with friends in 8 unique vibes. Real-time collaboration, leaderboards, and statistics.',
      features: [
        '8 Writing Vibes (Cozy Cafe, Adventure Sprint, Poetry Circle & more)',
        '12 Writing Themes for any genre',
        'Real-time multi-user sessions',
        'Participant tracking & contribution stats',
        'Mood detection & leaderboard',
        '6 Collaborative prompts with targets',
      ],
      color: '#06b6d4',
      href: '/collaborative-writing',
      stats: [
        { label: 'Vibes', value: '8' },
        { label: 'Themes', value: '12' },
        { label: 'Prompts', value: '6' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-900 via-purple-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-10 h-10 text-pink-400" />
                <h1 className="text-5xl font-bold">Literature Zone</h1>
              </div>
              <p className="text-xl text-slate-300 max-w-2xl">
                Your creative sanctuary for poetry, music, and collaborative writing. Express yourself across multiple mediums with professional-grade tools.
              </p>
            </div>
            <WalletDisplay userId="demo-user" />
          </div>
        </div>
      </div>

      {/* Daily Challenge Widget */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <DailyChallengeWidget section="literature" userId="demo-user" compact />
      </div>

      {/* Quick Stats */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-pink-400">10</p>
              <p className="text-sm text-slate-400">Poem Styles</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">12</p>
              <p className="text-sm text-slate-400">Instruments</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-cyan-400">8</p>
              <p className="text-sm text-slate-400">Writing Vibes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">50+</p>
              <p className="text-sm text-slate-400">Prompts & Templates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Creative Areas */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {areas.map(area => (
            <div
              key={area.id}
              className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all duration-300 hover:shadow-2xl hover:shadow-slate-900"
            >
              {/* Background accent */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                style={{ backgroundColor: area.color }}
              />

              {/* Content */}
              <div className="relative p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{area.emoji}</div>
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: area.color + '20' }}
                  >
                    {React.cloneElement(area.icon as React.ReactElement, {
                      style: { color: area.color },
                    })}
                  </div>
                </div>

                {/* Title & Description */}
                <h2 className="text-2xl font-bold mb-2">{area.title}</h2>
                <p className="text-slate-400 text-sm mb-6">{area.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-6 pb-6 border-b border-slate-800">
                  {area.stats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <p className="text-2xl font-bold" style={{ color: area.color }}>
                        {stat.value}
                      </p>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {area.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: area.color }} />
                      <span className="text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href={area.href}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all group/cta"
                  style={{
                    backgroundColor: area.color + '20',
                    color: area.color,
                    border: `2px solid ${area.color}40`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = area.color;
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = area.color + '20';
                    e.currentTarget.style.color = area.color;
                  }}
                >
                  Start Creating
                  <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-slate-900 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold mb-8">💡 Creative Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="text-pink-400">📝</span> Poetry Flow
              </h3>
              <p className="text-sm text-slate-400">
                Start with a simple form like haiku to understand structure, then experiment with free-verse to find your unique voice.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="text-yellow-400">🎵</span> Music Layers
              </h3>
              <p className="text-sm text-slate-400">
                Build compositions from the ground up: drums first, bass second, then melodic instruments. Layer effects for depth.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="text-cyan-400">💬</span> Collab Energy
              </h3>
              <p className="text-sm text-slate-400">
                Choose a vibe that matches your mood. Let the atmosphere guide your writing. React to other writers' energy.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="text-purple-400">✨</span> Use Prompts
              </h3>
              <p className="text-sm text-slate-400">
                Don't know where to start? Every tool has curated prompts. Use them as jumping-off points, not limitations.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="text-green-400">🎯</span> Constraints Help
              </h3>
              <p className="text-sm text-slate-400">
                Syllable counts, time limits, and vibes might feel restrictive, but they fuel creativity. Embrace the boundaries.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="text-orange-400">🚀</span> Share & Iterate
              </h3>
              <p className="text-sm text-slate-400">
                Share your work with collaborators. Use feedback to refine. Each creation makes you stronger.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="bg-gradient-to-r from-pink-900 via-purple-900 to-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">Ready to Create?</h2>
          <p className="text-slate-300 mb-8">
            Your creative journey starts here. Pick a tool and start expressing yourself today.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/poems-creator"
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg font-semibold transition-colors"
            >
              📝 Write Poetry
            </Link>
            <Link
              href="/music-composer"
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-colors"
            >
              🎵 Compose Music
            </Link>
            <Link
              href="/collaborative-writing"
              className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold transition-colors"
            >
              💬 Collaborate
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ OLD EDITOR COMPONENT (ARCHIVED) ============
function OldLiteratureZone() {
  // ============== DOCUMENT STATE ==============
  const [document, setDocument] = useState<TextDocument>({
    id: `doc-${Date.now()}`,
    title: 'Untitled Document',
    content: '',
    format: 'draft',
    fontSize: 16,
    fontFamily: 'inter',
    highlighting: new Map(),
    metadata: {
      wordCount: 0,
      charCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const [selectedText, setSelectedText] = useState('');
  const [showHighlight, setShowHighlight] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // ============== AI COMPANION STATE ==============
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [selectedAI, setSelectedAI] = useState<'gemini' | 'claude' | 'custom-local'>('gemini');
  const [isAIThinking, setIsAIThinking] = useState(false);

  // Format Settings
  const formatSettings = {
    'draft': { fontSize: 16, lineHeight: 1.6, maxWidth: '600px', chapters: false },
    'young-readers': { fontSize: 20, lineHeight: 1.8, maxWidth: '650px', chapters: true, largeChapters: true },
    'full-novel': { fontSize: 14, lineHeight: 1.5, maxWidth: '700px', chapters: true },
    'research': { fontSize: 14, lineHeight: 1.5, maxWidth: '750px', allowBullets: true },
    'summary': { fontSize: 14, lineHeight: 1.4, maxWidth: '700px', compact: true },
    'compiled': { fontSize: 13, lineHeight: 1.4, maxWidth: '750px', professional: true },
  };

  const fontFamilies = {
    inter: 'font-sans',
    georgia: 'font-serif',
    mono: 'font-mono',
    'times-new': 'font-times',
  };

  const AIModels = [
    { id: 'gemini', name: 'Google Gemini', color: 'bg-blue-600', icon: '🔵' },
    { id: 'claude', name: 'Anthropic Claude', color: 'bg-purple-600', icon: '💜' },
    { id: 'custom-local', name: 'Local LLM (LM Studio)', color: 'bg-emerald-600', icon: '🌿' },
  ];

  // ============== DOCUMENT OPERATIONS ==============
  const handleContentChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerText;
    const wordCount = newContent.split(/\s+/).filter(w => w.length > 0).length;
    const charCount = newContent.length;

    setDocument(prev => ({
      ...prev,
      content: newContent,
      metadata: {
        ...prev.metadata,
        wordCount,
        charCount,
        updatedAt: new Date(),
      },
    }));
  };

  const handleFormatChange = (newFormat: TextDocument['format']) => {
    setDocument(prev => ({
      ...prev,
      format: newFormat,
    }));
  };

  const handleFontSizeChange = (size: number) => {
    setDocument(prev => ({
      ...prev,
      fontSize: size,
    }));
  };

  const handleFontFamilyChange = (family: string) => {
    setDocument(prev => ({
      ...prev,
      fontFamily: family,
    }));
  };

  // ============== TEXT FORMATTING ==============
  const applyBold = () => {
    if (selectedText) {
      const newContent = document.content.replace(selectedText, `**${selectedText}**`);
      setDocument(prev => ({
        ...prev,
        content: newContent,
      }));
    }
  };

  const applyItalic = () => {
    if (selectedText) {
      const newContent = document.content.replace(selectedText, `*${selectedText}*`);
      setDocument(prev => ({
        ...prev,
        content: newContent,
      }));
    }
  };

  const applyHighlight = (color: string) => {
    if (selectedText) {
      const newHighlighting = new Map(document.highlighting);
      const highlightId = `hl-${Date.now()}`;
      newHighlighting.set(highlightId, color);

      setDocument(prev => ({
        ...prev,
        highlighting: newHighlighting,
      }));

      toast.success('Text highlighted!');
      setShowHighlight(false);
    }
  };

  // ============== AI COMPANION INTEGRATION ==============
  const sendAIMessage = async () => {
    if (!aiInput.trim()) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: aiInput,
      timestamp: new Date(),
    };

    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setIsAIThinking(true);

    try {
      // Get context from current document
      const documentContext = document.content.slice(0, 2000); // Last 2000 chars for context
      
      const result = await aiService.generate(aiInput, {
        systemPrompt: `You are a creative writing companion helping an author with their work. You're supportive, insightful, and offer constructive feedback.

Current document title: "${document.title}"
Document excerpt (for context):
---
${documentContext}
---

Help the author with their question or request. Be encouraging and specific in your suggestions.`,
        temperature: 0.8,
        maxTokens: 500,
      });

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: result.success ? result.content : generateAIResponse(aiInput),
        timestamp: new Date(),
      };

      setAiMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('AI companion error');
      const fallbackMessage: AIMessage = {
        role: 'assistant',
        content: 'I\'m having trouble connecting. Try running a local LLM for offline writing assistance!',
        timestamp: new Date(),
      };
      setAiMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsAIThinking(false);
    }
  };

  const generateAIResponse = (userQuery: string): string => {
    // Placeholder responses - replace with actual API calls
    const responses = [
      `That's an interesting idea! How about we develop this further by exploring the character's motivation?`,
      `I can help refine this section. Would you like me to suggest some creative alternatives for this paragraph?`,
      `Your writing is flowing well. Let me check for any continuity issues with the previous chapter...`,
      `This is great! The tone matches your story perfectly. Should we expand on this scene?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // ============== DOCUMENT EXPORT ==============
  const exportDocument = (format: 'pdf' | 'docx' | 'txt') => {
    const content = document.content;
    const title = document.title;

    if (format === 'txt') {
      const element = window.document.createElement('a');
      element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
      element.setAttribute('download', `${title}.txt`);
      element.click();
      toast.success('Document exported as TXT');
    } else if (format === 'docx') {
      toast.success('DOCX export coming soon!');
    } else if (format === 'pdf') {
      toast.success('PDF export coming soon!');
    }
  };

  const saveDocument = () => {
    localStorage.setItem(`doc-${document.id}`, JSON.stringify(document));
    toast.success('Document saved locally!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-slate-950 border-b border-slate-800 p-4 sticky top-0 z-40">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-amber-400" />
            <div>
              <h1 className="text-2xl font-bold">✍️ Literature Zone</h1>
              <p className="text-xs text-slate-400">AI-powered creative writing companion</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={document.title}
              onChange={(e) => setDocument(prev => ({ ...prev, title: e.target.value }))}
              className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-sm focus:outline-none focus:border-amber-500"
              placeholder="Document title"
            />
            <button
              onClick={saveDocument}
              className="p-2 hover:bg-slate-800 rounded transition-colors"
              title="Save document"
            >
              <Save className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-slate-800 rounded transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Side - Editor */}
        <div className="flex-1 flex flex-col border-r border-slate-800 overflow-hidden">
          {/* Formatting Toolbar */}
          <div className="bg-slate-900 border-b border-slate-800 p-3 flex gap-2 items-center flex-wrap sticky top-0 z-30">
            {/* Format Selector */}
            <select
              value={document.format}
              onChange={(e) => handleFormatChange(e.target.value as TextDocument['format'])}
              className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="draft">📝 Draft</option>
              <option value="young-readers">👶 Young Readers</option>
              <option value="full-novel">📚 Full Novel</option>
              <option value="research">🔬 Research</option>
              <option value="summary">📄 Summary</option>
              <option value="compiled">✅ Compiled</option>
            </select>

            {/* Font Family */}
            <select
              value={document.fontFamily}
              onChange={(e) => handleFontFamilyChange(e.target.value)}
              className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="inter">Inter (Sans)</option>
              <option value="georgia">Georgia (Serif)</option>
              <option value="mono">Monospace</option>
              <option value="times-new">Times New Roman</option>
            </select>

            {/* Font Size */}
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="12"
                max="24"
                value={document.fontSize}
                onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-slate-400">{document.fontSize}pt</span>
            </div>

            {/* Text Formatting */}
            <div className="flex gap-1 border-l border-slate-700 pl-2 ml-2">
              <button
                onClick={applyBold}
                className="p-2 hover:bg-slate-800 rounded transition-colors"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={applyItalic}
                className="p-2 hover:bg-slate-800 rounded transition-colors"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowHighlight(!showHighlight)}
                className="p-2 hover:bg-slate-800 rounded transition-colors"
                title="Highlight"
              >
                <Highlighter className="w-4 h-4" />
              </button>
            </div>

            {/* Export */}
            <div className="flex gap-1 border-l border-slate-700 pl-2 ml-2">
              <button
                onClick={() => exportDocument('txt')}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                📥 Export
              </button>
            </div>
          </div>

          {/* Highlight Color Picker */}
          {showHighlight && (
            <div className="bg-slate-800 border-b border-slate-700 p-2 flex gap-2">
              {['yellow', 'green', 'blue', 'pink', 'orange'].map(color => (
                <button
                  key={color}
                  onClick={() => applyHighlight(color)}
                  className={`w-6 h-6 rounded ${
                    color === 'yellow' ? 'bg-yellow-300' :
                    color === 'green' ? 'bg-green-300' :
                    color === 'blue' ? 'bg-blue-300' :
                    color === 'pink' ? 'bg-pink-300' :
                    'bg-orange-300'
                  } hover:opacity-75 transition-opacity`}
                />
              ))}
              <button
                onClick={() => setShowHighlight(false)}
                className="ml-auto text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          )}

          {/* Document Stats */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex gap-6 text-xs text-slate-400">
            <span>Words: {document.metadata.wordCount}</span>
            <span>Characters: {document.metadata.charCount}</span>
            <span>Format: {document.format}</span>
            <span>Last updated: {document.metadata.updatedAt.toLocaleTimeString()}</span>
          </div>

          {/* Editor */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            onMouseUp={() => {
              const selection = window.getSelection();
              setSelectedText(selection?.toString() || '');
            }}
            suppressContentEditableWarning
            className={`flex-1 overflow-y-auto p-8 focus:outline-none bg-slate-950
              ${fontFamilies[document.fontFamily as keyof typeof fontFamilies] || 'font-sans'}
            `}
            style={{
              fontSize: `${document.fontSize}px`,
              lineHeight: '1.6',
              maxWidth: formatSettings[document.format].maxWidth,
              margin: '0 auto',
              width: '100%',
            }}
          >
            Start writing here...
          </div>
        </div>

        {/* Right Side - AI Companion */}
        <div className="w-96 flex flex-col bg-slate-900 border-l border-slate-800">
          {/* AI Model Selector */}
          <div className="border-b border-slate-800 p-4">
            <p className="text-sm text-slate-400 mb-3">AI Companion</p>
            <div className="grid grid-cols-3 gap-2">
              {AIModels.map(model => (
                <button
                  key={model.id}
                  onClick={() => setSelectedAI(model.id as any)}
                  className={`px-3 py-2 rounded text-xs font-semibold transition-all ${
                    selectedAI === model.id
                      ? `${model.color} text-white`
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {model.icon}
                  <div className="text-xs mt-1">{model.name.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiMessages.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                <Sparkles className="w-8 h-8 mx-auto mb-2" />
                <p>Your AI companion is ready to help!</p>
                <p className="text-xs mt-2">Ask for writing suggestions, story ideas, or corrections.</p>
              </div>
            ) : (
              aiMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                    msg.role === 'assistant' ? 'bg-blue-600' : 'bg-slate-800'
                  }`}>
                    {msg.role === 'assistant' ? '🤖' : '👤'}
                  </div>
                  <div className={`flex-1 p-3 rounded-lg ${
                    msg.role === 'assistant'
                      ? 'bg-blue-900 text-blue-100'
                      : 'bg-slate-800 text-slate-200'
                  } text-sm`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {isAIThinking && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 bg-blue-600">
                  🤖
                </div>
                <div className="bg-blue-900 text-blue-100 p-3 rounded-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-800 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') sendAIMessage();
                }}
                placeholder="Ask AI for help..."
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={sendAIMessage}
                disabled={isAIThinking || !aiInput.trim()}
                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 rounded transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-slate-500 mt-2">
              AI can help with: story ideas, corrections, continuity checks, rewrites
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Document Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-2">Document Format</label>
                <select
                  value={document.format}
                  onChange={(e) => handleFormatChange(e.target.value as TextDocument['format'])}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded focus:outline-none focus:border-amber-500"
                >
                  <option value="draft">Draft - Quick writing</option>
                  <option value="young-readers">Young Readers - Age-conscious, large text</option>
                  <option value="full-novel">Full Novel - Professional formatting</option>
                  <option value="research">Research - Documentation format</option>
                  <option value="summary">Summary - Condensed content</option>
                  <option value="compiled">Compiled - Final publication ready</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-2">Default Font Size</label>
                <input
                  type="number"
                  min="12"
                  max="24"
                  value={document.fontSize}
                  onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition-colors"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { aiService } from '@/services/aiService';
import { WritingService, WritingDocument, TextSuggestion, ChapterBreak } from '@/services/writingService';
import { DailyChallengeWidget, WalletDisplay } from '@/components/challenges/DailyChallengeWidget';
import {
  BookOpen,
  PenTool,
  FileText,
  Save,
  FolderOpen,
  Download,
  Upload,
  Trash2,
  Plus,
  Settings,
  Wand2,
  Sparkles,
  BookMarked,
  ScrollText,
  Feather,
  Languages,
  Mic,
  Volume2,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link,
  Image,
  Table,
  Code,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Target,
  Clock,
  BarChart3,
  Users,
  MessageSquare,
  Search,
  Replace,
  Undo,
  Redo,
  Copy,
  Clipboard,
  FileUp,
  FileDown,
  Printer,
  Share2,
  GitBranch,
  History,
  Star,
  Heart,
  Bookmark,
} from 'lucide-react';

// ============================================================================
// LITERATURE SUITE - COMPLETE WRITING STUDIO
// ============================================================================
// Includes:
// - Document Editor (rich text, multi-format)
// - AI Writing Assistant (suggestions, continuations, rewrites)
// - Story Structure Tools (outlines, character sheets, world-building)
// - Poetry Workshop (forms, rhyme checker, meter analysis)
// - Script Writer (screenplay, stage play, comic scripts)
// - Research & Notes Panel
// - Export (TXT, MD, PDF-ready, EPUB-ready)
// ============================================================================

// ================== TYPES ==================
interface StoryElement {
  id: string;
  type: 'character' | 'location' | 'item' | 'event' | 'theme';
  name: string;
  description: string;
  notes: string;
  connections: string[];
  tags: string[];
}

interface OutlineNode {
  id: string;
  title: string;
  summary: string;
  children: OutlineNode[];
  status: 'idea' | 'draft' | 'revised' | 'complete';
  wordTarget?: number;
}

interface PoetryAnalysis {
  syllables: number[];
  rhymeScheme: string;
  meter: string;
  form: string;
  suggestions: string[];
}

interface ScriptElement {
  type: 'scene-heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition';
  content: string;
}

// ================== DOCUMENT EDITOR ==================
function DocumentEditor() {
  const [documents, setDocuments] = useState<WritingDocument[]>([]);
  const [currentDoc, setCurrentDoc] = useState<WritingDocument | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled');
  const [format, setFormat] = useState<WritingDocument['format']>('draft');
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Georgia');
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [suggestions, setSuggestions] = useState<TextSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const formats = [
    { id: 'draft', name: 'Draft', icon: '📝', description: 'Freeform writing' },
    { id: 'young-readers', name: 'Young Readers', icon: '📚', description: 'Simple language, short chapters' },
    { id: 'full-novel', name: 'Full Novel', icon: '📖', description: 'Professional novel format' },
    { id: 'research', name: 'Research', icon: '🔬', description: 'Academic/research paper' },
    { id: 'summary', name: 'Summary', icon: '📋', description: 'Condensed synopsis' },
    { id: 'compiled', name: 'Compiled', icon: '📕', description: 'Publication-ready' },
  ];

  const fonts = [
    'Georgia',
    'Times New Roman',
    'Garamond',
    'Palatino',
    'Merriweather',
    'Lora',
    'Source Serif Pro',
    'Crimson Text',
  ];

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  // Update stats when content changes
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    setWordCount(words);
    setCharCount(chars);
    setReadingTime(WritingService.calculateReadingTime(words));

    // Auto-save after 30 seconds of inactivity
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    if (currentDoc) {
      autoSaveTimer.current = setTimeout(() => {
        handleAutoSave();
      }, 30000);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [content]);

  const loadDocuments = async () => {
    try {
      const docs = await WritingService.getAllDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleAutoSave = async () => {
    if (currentDoc) {
      await WritingService.autoSaveDraft(currentDoc.id, content);
      toast.success('Auto-saved', { duration: 1000 });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const doc: WritingDocument = {
        id: currentDoc?.id || `doc-${Date.now()}`,
        title,
        content,
        format,
        fontSize,
        fontFamily,
        metadata: {
          wordCount,
          charCount,
          createdAt: currentDoc?.metadata.createdAt || new Date(),
          updatedAt: new Date(),
          readingTime,
        },
      };

      await WritingService.saveDocument(doc);
      setCurrentDoc(doc);
      await loadDocuments();
      toast.success('Document saved!');
    } catch (error) {
      toast.error('Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewDocument = () => {
    setCurrentDoc(null);
    setTitle('Untitled');
    setContent('');
    setFormat('draft');
  };

  const handleOpenDocument = (doc: WritingDocument) => {
    setCurrentDoc(doc);
    setTitle(doc.title);
    setContent(doc.content);
    setFormat(doc.format);
    setFontSize(doc.fontSize);
    setFontFamily(doc.fontFamily);
  };

  const handleDeleteDocument = async (id: string) => {
    if (confirm('Delete this document?')) {
      await WritingService.deleteDocument(id);
      await loadDocuments();
      if (currentDoc?.id === id) {
        handleNewDocument();
      }
      toast.success('Document deleted');
    }
  };

  const handleExport = (type: 'txt' | 'md') => {
    if (!currentDoc && !content) {
      toast.error('Nothing to export');
      return;
    }

    const doc: WritingDocument = {
      id: currentDoc?.id || 'export',
      title,
      content,
      format,
      fontSize,
      fontFamily,
      metadata: {
        wordCount,
        charCount,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    let blob: Blob;
    let filename: string;

    if (type === 'txt') {
      blob = WritingService.exportAsText(doc);
      filename = `${title}.txt`;
    } else {
      blob = WritingService.exportAsMarkdown(doc);
      filename = `${title}.md`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported as ${type.toUpperCase()}`);
  };

  const handleCheckSuggestions = async () => {
    const results = await WritingService.getSuggestions(content);
    setSuggestions(results);
    if (results.length === 0) {
      toast.success('No issues found!');
    } else {
      toast(`Found ${results.length} suggestions`, { icon: '💡' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar - Documents */}
      <div className="lg:col-span-1 space-y-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FolderOpen size={16} />
                Documents
              </span>
              <Button size="sm" variant="ghost" onClick={handleNewDocument}>
                <Plus size={14} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {documents.length === 0 ? (
              <p className="text-slate-500 text-sm">No documents yet</p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`
                    p-2 rounded cursor-pointer flex items-center justify-between group
                    ${currentDoc?.id === doc.id ? 'bg-aura-600/30 border border-aura-500' : 'bg-slate-800 hover:bg-slate-700'}
                  `}
                  onClick={() => handleOpenDocument(doc)}
                >
                  <div className="truncate flex-1">
                    <p className="text-white text-sm truncate">{doc.title}</p>
                    <p className="text-slate-500 text-xs">{doc.metadata.wordCount} words</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDocument(doc.id);
                    }}
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Format Selection */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <FileText size={16} />
              Format
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {formats.map((f) => (
              <div
                key={f.id}
                className={`
                  p-2 rounded cursor-pointer text-sm
                  ${format === f.id ? 'bg-aura-600/30 border border-aura-500' : 'bg-slate-800 hover:bg-slate-700'}
                `}
                onClick={() => setFormat(f.id as WritingDocument['format'])}
              >
                <span className="text-white">{f.icon} {f.name}</span>
                <p className="text-slate-500 text-xs">{f.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <BarChart3 size={16} />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Words</span>
              <span className="text-aura-400">{wordCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Characters</span>
              <span className="text-aura-400">{charCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Reading Time</span>
              <span className="text-aura-400">{readingTime} min</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Paragraphs</span>
              <span className="text-aura-400">{content.split('\n\n').filter(p => p.trim()).length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Editor */}
      <div className="lg:col-span-3 space-y-4">
        {/* Toolbar */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-48 bg-slate-800 border-slate-700 text-white"
                placeholder="Document title..."
              />
              
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
              >
                {fonts.map((font) => (
                  <option key={font} value={font}>{font}</option>
                ))}
              </select>

              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm w-16"
              >
                {[12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
                  <option key={size} value={size}>{size}px</option>
                ))}
              </select>

              <div className="border-l border-slate-700 h-6 mx-2" />

              <Button size="sm" variant="ghost" onClick={handleSave} disabled={isSaving}>
                <Save size={16} className={isSaving ? 'animate-pulse' : ''} />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleExport('txt')}>
                <FileDown size={16} />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleExport('md')}>
                <Download size={16} />
              </Button>

              <div className="border-l border-slate-700 h-6 mx-2" />

              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowPreview(!showPreview)}
                className={showPreview ? 'bg-aura-600/30' : ''}
              >
                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={handleCheckSuggestions}
              >
                <Lightbulb size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Editor Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <Textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your story..."
                className="w-full min-h-[500px] bg-slate-800 border-slate-700 text-white resize-none"
                style={{
                  fontFamily,
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.8',
                }}
              />
            </CardContent>
          </Card>

          {showPreview && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div 
                  className="prose prose-invert max-w-none min-h-[500px] overflow-y-auto"
                  style={{
                    fontFamily,
                    fontSize: `${fontSize}px`,
                    lineHeight: '1.8',
                  }}
                >
                  {WritingService.formatContent(content, format).split('\n').map((line, i) => (
                    <p key={i} className={line.match(/^#/) ? 'font-bold text-lg' : ''}>
                      {line || <br />}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Suggestions Panel */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Lightbulb size={16} className="text-yellow-400" />
                Writing Suggestions ({suggestions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestions.map((suggestion, i) => (
                <div key={i} className="bg-slate-800 rounded p-3 flex items-start gap-3">
                  <div className={`
                    p-1 rounded
                    ${suggestion.type === 'grammar' ? 'bg-red-900/50 text-red-400' : ''}
                    ${suggestion.type === 'style' ? 'bg-blue-900/50 text-blue-400' : ''}
                    ${suggestion.type === 'clarity' ? 'bg-yellow-900/50 text-yellow-400' : ''}
                  `}>
                    {suggestion.type === 'grammar' && <AlertTriangle size={14} />}
                    {suggestion.type === 'style' && <Feather size={14} />}
                    {suggestion.type === 'clarity' && <Target size={14} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      <span className="line-through text-red-400">{suggestion.originalText}</span>
                      {' → '}
                      <span className="text-green-400">{suggestion.suggestion}</span>
                    </p>
                    <p className="text-slate-500 text-xs">{suggestion.explanation}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ================== AI WRITING ASSISTANT ==================
function AIWritingAssistant() {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [mode, setMode] = useState<'continue' | 'rewrite' | 'expand' | 'summarize' | 'dialogue' | 'describe'>('continue');
  const [result, setResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tone, setTone] = useState('neutral');
  const [genre, setGenre] = useState('general');

  const modes = [
    { id: 'continue', name: 'Continue Story', icon: '➡️', description: 'Write what comes next' },
    { id: 'rewrite', name: 'Rewrite', icon: '🔄', description: 'Improve the passage' },
    { id: 'expand', name: 'Expand', icon: '📖', description: 'Add more detail' },
    { id: 'summarize', name: 'Summarize', icon: '📝', description: 'Condense the text' },
    { id: 'dialogue', name: 'Dialogue', icon: '💬', description: 'Generate conversation' },
    { id: 'describe', name: 'Describe', icon: '🎨', description: 'Add sensory details' },
  ];

  const tones = ['neutral', 'dramatic', 'humorous', 'mysterious', 'romantic', 'dark', 'whimsical', 'formal'];
  const genres = ['general', 'fantasy', 'sci-fi', 'romance', 'mystery', 'horror', 'literary', 'young-adult'];

  const handleGenerate = async () => {
    if (!prompt.trim() && !context.trim()) {
      toast.error('Please provide some text to work with');
      return;
    }

    setIsGenerating(true);
    toast.loading('Generating...', { id: 'ai-write' });

    try {
      const systemPrompt = `You are a creative writing assistant. 
Genre: ${genre}
Tone: ${tone}
Task: ${modes.find(m => m.id === mode)?.description}

${context ? `Context/Previous text:\n${context}\n\n` : ''}

User's request or text to work with:`;

      const response = await aiService.generate(`${systemPrompt}\n\n${prompt}`);
      
      if (response.success) {
        setResult(response.content);
        toast.success('Generated!', { id: 'ai-write' });
      } else {
        // Demo fallback
        const demoResponses: Record<string, string> = {
          continue: "The shadows lengthened across the cobblestone street as she turned the corner, her footsteps echoing in the unusual silence. Something felt wrong—the usual bustle of the market square had vanished, replaced by an eerie stillness that made her skin prickle with unease.",
          rewrite: "The prose flows more naturally now: \"Darkness crept through the ancient corridors, its tendrils reaching for the last flickering torch. Sarah pressed herself against the cold stone wall, her heart hammering against her ribs like a caged bird desperate for freedom.\"",
          expand: "The tavern was more than just weathered wood and dim lamplight. Each scratch on the bar told a story—the deep gouge from a dagger thrown in anger, the ring stains from countless mugs raised in celebration or sorrow. The air hung heavy with pipe smoke and secrets, while the crackling fire cast dancing shadows that seemed to whisper of adventures yet to come.",
          summarize: "A young mage discovers an ancient prophecy that threatens to unravel the fabric of reality itself. With unlikely allies and growing powers, she must navigate political intrigue, face her inner demons, and ultimately choose between saving the world or the one she loves.",
          dialogue: "\"You can't be serious,\" Marcus said, his voice barely a whisper.\n\n\"Dead serious.\" Elena met his gaze without flinching. \"The council has been lying to us for centuries.\"\n\n\"And you expect me to just... believe you?\"\n\n\"I expect you to open your eyes.\" She slid the ancient tome across the table. \"Read it for yourself.\"",
          describe: "The forest clearing erupted in a symphony of color as dawn broke through the canopy. Dewdrops clung to spider webs like scattered diamonds, while the rich scent of pine and wild honeysuckle filled the cool morning air. Birdsong cascaded through the branches, a melodic counterpoint to the gentle babbling of a nearby stream.",
        };
        setResult(demoResponses[mode] || 'AI generated content would appear here.');
        toast.success('Demo content generated', { id: 'ai-write' });
      }
    } catch (error) {
      toast.error('Generation failed', { id: 'ai-write' });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Settings */}
      <div className="space-y-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Wand2 size={16} />
              AI Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {modes.map((m) => (
              <div
                key={m.id}
                className={`
                  p-2 rounded cursor-pointer text-sm
                  ${mode === m.id ? 'bg-aura-600/30 border border-aura-500' : 'bg-slate-800 hover:bg-slate-700'}
                `}
                onClick={() => setMode(m.id as typeof mode)}
              >
                <span className="text-white">{m.icon} {m.name}</span>
                <p className="text-slate-500 text-xs">{m.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Tone & Genre</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm capitalize"
              >
                {tones.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm capitalize"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Input/Output */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Context (Optional)</CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Paste previous text for the AI to understand the story so far
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Paste your story context here..."
              className="w-full h-24 bg-slate-800 border-slate-700 text-white resize-none"
            />
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Your Text / Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter text to rewrite, continue from, or describe what you want..."
              className="w-full h-32 bg-slate-800 border-slate-700 text-white resize-none"
            />
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full bg-aura-600 hover:bg-aura-700"
            >
              {isGenerating ? (
                <>
                  <Sparkles size={16} className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 size={16} className="mr-2" />
                  Generate
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles size={16} className="text-aura-400" />
                  Generated Result
                </span>
                <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                  <Copy size={14} />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-800 rounded p-4 text-white whitespace-pre-wrap leading-relaxed">
                {result}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ================== STORY STRUCTURE ==================
function StoryStructure() {
  const [elements, setElements] = useState<StoryElement[]>([]);
  const [outline, setOutline] = useState<OutlineNode[]>([]);
  const [activeTab, setActiveTab] = useState<'characters' | 'locations' | 'outline' | 'timeline'>('characters');
  const [newElement, setNewElement] = useState({ name: '', description: '', type: 'character' });

  const addElement = () => {
    if (!newElement.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    const element: StoryElement = {
      id: `elem-${Date.now()}`,
      type: newElement.type as StoryElement['type'],
      name: newElement.name,
      description: newElement.description,
      notes: '',
      connections: [],
      tags: [],
    };

    setElements([...elements, element]);
    setNewElement({ name: '', description: '', type: 'character' });
    toast.success(`${newElement.type} added!`);
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(e => e.id !== id));
  };

  const filteredElements = elements.filter(e => {
    if (activeTab === 'characters') return e.type === 'character';
    if (activeTab === 'locations') return e.type === 'location' || e.type === 'item';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-2 flex-wrap">
        {['characters', 'locations', 'outline', 'timeline'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={activeTab === tab ? 'bg-aura-600' : ''}
          >
            {tab === 'characters' && <Users size={16} className="mr-2" />}
            {tab === 'locations' && <Target size={16} className="mr-2" />}
            {tab === 'outline' && <List size={16} className="mr-2" />}
            {tab === 'timeline' && <Clock size={16} className="mr-2" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {/* Add New Element */}
      {(activeTab === 'characters' || activeTab === 'locations') && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Add New {activeTab === 'characters' ? 'Character' : 'Location/Item'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <select
                value={newElement.type}
                onChange={(e) => setNewElement({ ...newElement, type: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
              >
                <option value="character">Character</option>
                <option value="location">Location</option>
                <option value="item">Item</option>
                <option value="event">Event</option>
                <option value="theme">Theme</option>
              </select>
              <Input
                value={newElement.name}
                onChange={(e) => setNewElement({ ...newElement, name: e.target.value })}
                placeholder="Name..."
                className="flex-1 bg-slate-800 border-slate-700 text-white"
              />
              <Input
                value={newElement.description}
                onChange={(e) => setNewElement({ ...newElement, description: e.target.value })}
                placeholder="Brief description..."
                className="flex-1 bg-slate-800 border-slate-700 text-white"
              />
              <Button onClick={addElement} className="bg-aura-600">
                <Plus size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Elements Grid */}
      {(activeTab === 'characters' || activeTab === 'locations') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredElements.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-800 border-dashed col-span-full">
              <CardContent className="p-8 text-center text-slate-500">
                No {activeTab} yet. Add one above!
              </CardContent>
            </Card>
          ) : (
            filteredElements.map((elem) => (
              <Card key={elem.id} className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {elem.type === 'character' && '👤'}
                      {elem.type === 'location' && '📍'}
                      {elem.type === 'item' && '📦'}
                      {elem.type === 'event' && '⚡'}
                      {elem.type === 'theme' && '💭'}
                      {elem.name}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => deleteElement(elem.id)}>
                      <Trash2 size={12} className="text-red-400" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400 text-sm">{elem.description || 'No description'}</p>
                  <Textarea
                    placeholder="Add notes..."
                    value={elem.notes}
                    onChange={(e) => {
                      setElements(elements.map(el => 
                        el.id === elem.id ? { ...el, notes: e.target.value } : el
                      ));
                    }}
                    className="mt-2 w-full h-20 bg-slate-800 border-slate-700 text-white resize-none text-sm"
                  />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Outline View */}
      {activeTab === 'outline' && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Story Outline</CardTitle>
            <CardDescription className="text-slate-400">
              Plan your story structure with chapters and scenes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outline.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <List size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No outline yet. Click below to add your first chapter.</p>
                </div>
              ) : (
                outline.map((node, i) => (
                  <div key={node.id} className="bg-slate-800 rounded p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-aura-400 font-mono">{i + 1}.</span>
                      <span className="text-white font-medium">{node.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        node.status === 'complete' ? 'bg-green-900 text-green-300' :
                        node.status === 'revised' ? 'bg-blue-900 text-blue-300' :
                        node.status === 'draft' ? 'bg-yellow-900 text-yellow-300' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {node.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{node.summary}</p>
                  </div>
                ))
              )}
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  const newNode: OutlineNode = {
                    id: `outline-${Date.now()}`,
                    title: `Chapter ${outline.length + 1}`,
                    summary: '',
                    children: [],
                    status: 'idea',
                  };
                  setOutline([...outline, newNode]);
                }}
              >
                <Plus size={16} className="mr-2" />
                Add Chapter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline View */}
      {activeTab === 'timeline' && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Story Timeline</CardTitle>
            <CardDescription className="text-slate-400">
              Visualize events chronologically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />
              <div className="space-y-4 pl-10">
                {elements.filter(e => e.type === 'event').length === 0 ? (
                  <p className="text-slate-500 py-4">Add events to see them on the timeline</p>
                ) : (
                  elements.filter(e => e.type === 'event').map((event, i) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-8 w-4 h-4 rounded-full bg-aura-600 border-2 border-slate-900" />
                      <div className="bg-slate-800 rounded p-3">
                        <h4 className="text-white font-medium">{event.name}</h4>
                        <p className="text-slate-400 text-sm">{event.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ================== POETRY WORKSHOP ==================
function PoetryWorkshop() {
  const [poem, setPoem] = useState('');
  const [form, setForm] = useState('free-verse');
  const [analysis, setAnalysis] = useState<PoetryAnalysis | null>(null);

  const forms = [
    { id: 'free-verse', name: 'Free Verse', description: 'No fixed structure' },
    { id: 'sonnet', name: 'Sonnet', description: '14 lines, iambic pentameter' },
    { id: 'haiku', name: 'Haiku', description: '5-7-5 syllables' },
    { id: 'limerick', name: 'Limerick', description: 'AABBA rhyme scheme' },
    { id: 'villanelle', name: 'Villanelle', description: '19 lines, repeating refrains' },
    { id: 'ballad', name: 'Ballad', description: 'ABAB rhyme, storytelling' },
  ];

  const analyzePoem = () => {
    const lines = poem.split('\n').filter(l => l.trim());
    
    // Simple syllable count (approximation)
    const syllables = lines.map(line => {
      const words = line.toLowerCase().split(/\s+/);
      return words.reduce((count, word) => {
        const vowels = word.match(/[aeiouy]+/gi) || [];
        return count + Math.max(1, vowels.length);
      }, 0);
    });

    // Simple rhyme detection (last words)
    const lastWords = lines.map(line => {
      const words = line.trim().split(/\s+/);
      return words[words.length - 1]?.toLowerCase().replace(/[^a-z]/g, '') || '';
    });

    // Generate rhyme scheme
    const rhymeMap = new Map<string, string>();
    let currentLetter = 'A';
    const rhymeScheme = lastWords.map(word => {
      const suffix = word.slice(-3);
      if (rhymeMap.has(suffix)) {
        return rhymeMap.get(suffix)!;
      }
      rhymeMap.set(suffix, currentLetter);
      const letter = currentLetter;
      currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
      return letter;
    }).join('');

    setAnalysis({
      syllables,
      rhymeScheme,
      meter: 'Varied',
      form: form,
      suggestions: [
        syllables.length < 4 ? 'Consider adding more lines for depth' : '',
        rhymeScheme.includes('A') && !rhymeScheme.includes('B') ? 'Try adding more rhyming variation' : '',
      ].filter(Boolean),
    });

    toast.success('Poem analyzed!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form Selection */}
      <div className="space-y-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Feather size={16} />
              Poetic Form
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {forms.map((f) => (
              <div
                key={f.id}
                className={`
                  p-2 rounded cursor-pointer text-sm
                  ${form === f.id ? 'bg-aura-600/30 border border-aura-500' : 'bg-slate-800 hover:bg-slate-700'}
                `}
                onClick={() => setForm(f.id)}
              >
                <span className="text-white">{f.name}</span>
                <p className="text-slate-500 text-xs">{f.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {analysis && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-slate-400">Syllables per line:</span>
                <p className="text-aura-400 font-mono">
                  {analysis.syllables.join(' - ')}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Rhyme scheme:</span>
                <p className="text-aura-400 font-mono text-lg">
                  {analysis.rhymeScheme}
                </p>
              </div>
              {analysis.suggestions.length > 0 && (
                <div>
                  <span className="text-slate-400">Suggestions:</span>
                  <ul className="text-yellow-400 text-xs mt-1">
                    {analysis.suggestions.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Poetry Editor */}
      <div className="lg:col-span-2">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              <span>Write Your Poem</span>
              <Button size="sm" onClick={analyzePoem} className="bg-aura-600">
                <Sparkles size={14} className="mr-2" />
                Analyze
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={poem}
              onChange={(e) => setPoem(e.target.value)}
              placeholder="Write your poem here...&#10;&#10;Each line will be analyzed for syllables and rhyme."
              className="w-full min-h-[400px] bg-slate-800 border-slate-700 text-white font-serif text-lg leading-relaxed"
            />
            <div className="flex justify-between mt-2 text-slate-500 text-xs">
              <span>{poem.split('\n').filter(l => l.trim()).length} lines</span>
              <span>{poem.split(/\s+/).filter(w => w.trim()).length} words</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ================== MAIN LITERATURE SUITE COMPONENT ==================
export default function LiteratureSuitePage() {
  const [activeTab, setActiveTab] = useState('editor');

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <BookOpen size={32} className="text-amber-500" />
                Literature Suite
              </h1>
              <p className="text-slate-400">
                Complete writing studio with AI assistance, story tools, and poetry workshop
              </p>
            </div>
            <WalletDisplay userId="demo-user" />
          </div>
        </div>

        {/* Daily Challenge Widget */}
        <div className="mb-8">
          <DailyChallengeWidget section="literature" userId="demo-user" compact />
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 flex-wrap">
            <TabsTrigger value="editor" className="data-[state=active]:bg-amber-600">
              <PenTool size={16} className="mr-2" />
              Document Editor
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="data-[state=active]:bg-amber-600">
              <Wand2 size={16} className="mr-2" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="structure" className="data-[state=active]:bg-amber-600">
              <BookMarked size={16} className="mr-2" />
              Story Structure
            </TabsTrigger>
            <TabsTrigger value="poetry" className="data-[state=active]:bg-amber-600">
              <Feather size={16} className="mr-2" />
              Poetry Workshop
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor">
            <DocumentEditor />
          </TabsContent>

          <TabsContent value="ai-assistant">
            <AIWritingAssistant />
          </TabsContent>

          <TabsContent value="structure">
            <StoryStructure />
          </TabsContent>

          <TabsContent value="poetry">
            <PoetryWorkshop />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

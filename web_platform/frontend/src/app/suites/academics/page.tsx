'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { aiService } from '@/services/aiService';
import { DailyChallengeWidget, WalletDisplay } from '@/components/challenges/DailyChallengeWidget';
import {
  GraduationCap,
  Languages,
  Calculator,
  FlaskConical,
  BookOpen,
  Brain,
  MessageCircle,
  Send,
  Lightbulb,
  CheckCircle,
  XCircle,
  Target,
  Trophy,
  Star,
  RefreshCw,
  Play,
  Volume2,
  Copy,
  Sparkles,
  Atom,
  Dna,
  Beaker,
  PenTool,
  MicVocal,
  Globe,
  Sigma,
  Pi,
  Divide,
  Plus,
  Minus,
  X,
  ChevronRight,
  ArrowRight,
  History,
  Bookmark,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';

// ============================================================================
// ACADEMICS SUITE - AI-POWERED COMPREHENSIVE TUTOR
// ============================================================================
// A fully AI-infused academic assistant covering:
// - Language Learning (Spanish, French, German, Japanese, Chinese, etc.)
// - Mathematics (Arithmetic, Algebra, Geometry, Trigonometry, Calculus)
// - Science (Biology, Chemistry, Physics, Anatomy)
// - Word Problem Solver (step-by-step solutions)
// - Study Assistant (notes, flashcards, summaries)
// - Essay Helper (writing assistance, grammar, structure)
// ============================================================================

// ================== TYPES ==================
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface FlashCard {
  id: string;
  front: string;
  back: string;
  category: string;
  mastered: boolean;
}

interface LanguagePhrase {
  id: string;
  original: string;
  translation: string;
  pronunciation: string;
  category: string;
}

interface MathProblem {
  id: string;
  problem: string;
  type: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  solution: string[];
  answer: string;
}

interface ScienceTopic {
  id: string;
  title: string;
  subject: 'biology' | 'chemistry' | 'physics' | 'anatomy';
  content: string;
  keyTerms: { term: string; definition: string }[];
}

// ================== LANGUAGE LEARNING ==================
function LanguageLearning() {
  const [selectedLanguage, setSelectedLanguage] = useState('spanish');
  const [mode, setMode] = useState<'vocabulary' | 'conversation' | 'grammar' | 'practice'>('vocabulary');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const languages = [
    { id: 'spanish', name: 'Spanish', flag: '🇪🇸' },
    { id: 'french', name: 'French', flag: '🇫🇷' },
    { id: 'german', name: 'German', flag: '🇩🇪' },
    { id: 'japanese', name: 'Japanese', flag: '🇯🇵' },
    { id: 'chinese', name: 'Chinese', flag: '🇨🇳' },
    { id: 'korean', name: 'Korean', flag: '🇰🇷' },
    { id: 'italian', name: 'Italian', flag: '🇮🇹' },
    { id: 'portuguese', name: 'Portuguese', flag: '🇵🇹' },
  ];

  const vocabularyCategories = [
    'Greetings & Introductions',
    'Numbers & Counting',
    'Colors & Shapes',
    'Food & Dining',
    'Travel & Directions',
    'Family & Relationships',
    'Work & Professions',
    'Time & Calendar',
  ];

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const langName = languages.find(l => l.id === selectedLanguage)?.name || 'the language';
      const response = await aiService.generate(input, {
        systemPrompt: `You are a friendly ${langName} language tutor. Help the user learn ${langName} by providing translations, pronunciation guides, grammar tips, and example sentences. Use occasional ${langName} phrases in your response. Keep responses helpful and encouraging.`,
        temperature: 0.8,
        maxTokens: 1024,
      });

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.success ? response.content : `🌟 I'd love to help you learn "${input}" in ${langName}! To unlock AI tutoring, try setting up your own AI - it's free! Download LM Studio or Ollama from the AI Setup app.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      toast.error('AI tutor temporarily unavailable');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Language Selector & Modes */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="py-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Globe size={16} className="text-blue-400" />
            Language
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`p-2 rounded-lg text-sm flex items-center gap-2 transition ${
                  selectedLanguage === lang.id
                    ? 'bg-aura-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-xs">{lang.name}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-500 mb-2">Learning Mode</p>
            {[
              { id: 'vocabulary', label: 'Vocabulary', icon: <BookOpen size={14} /> },
              { id: 'conversation', label: 'Conversation', icon: <MessageCircle size={14} /> },
              { id: 'grammar', label: 'Grammar', icon: <PenTool size={14} /> },
              { id: 'practice', label: 'Practice', icon: <Target size={14} /> },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as typeof mode)}
                className={`w-full p-2 rounded-lg text-sm flex items-center gap-2 mb-1 transition ${
                  mode === m.id
                    ? 'bg-aura-600/30 text-aura-300 border border-aura-600'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-4">
            <p className="text-xs text-slate-500 mb-2">Quick Topics</p>
            {vocabularyCategories.slice(0, 4).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setInput(`Teach me ${cat.toLowerCase()} in ${languages.find(l => l.id === selectedLanguage)?.name}`);
                }}
                className="w-full text-left p-2 text-xs text-slate-400 hover:bg-slate-800 rounded transition"
              >
                {cat}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="lg:col-span-3 bg-slate-900 border-slate-800 flex flex-col h-[600px]">
        <CardHeader className="py-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{languages.find(l => l.id === selectedLanguage)?.flag}</span>
              <div>
                <CardTitle className="text-white text-sm">
                  {languages.find(l => l.id === selectedLanguage)?.name} Tutor
                </CardTitle>
                <CardDescription className="text-xs">AI Language Learning Assistant</CardDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setMessages([])}>
              <RotateCcw size={14} className="mr-1" />
              Clear
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Languages size={48} className="text-aura-400 mb-4" />
              <h3 className="text-white font-semibold mb-2">
                Start Learning {languages.find(l => l.id === selectedLanguage)?.name}!
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Ask me anything about vocabulary, grammar, pronunciation, or have a conversation practice.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['How do I say "Hello"?', 'Teach me numbers 1-10', 'Basic phrases for travel'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300 hover:bg-aura-600 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-aura-600 text-white'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 p-3 rounded-lg">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-aura-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-aura-400 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-aura-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </CardContent>

        <div className="p-4 border-t border-slate-800">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={`Ask about ${languages.find(l => l.id === selectedLanguage)?.name}...`}
              className="flex-1 bg-slate-800 border-slate-700 text-white"
            />
            <Button onClick={sendMessage} disabled={!input.trim() || isLoading} className="bg-aura-600">
              <Send size={18} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ================== MATH TUTOR ==================
function MathTutor() {
  const [topic, setTopic] = useState('algebra');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const topics = [
    { id: 'arithmetic', name: 'Arithmetic', icon: <Calculator size={16} />, desc: 'Basic operations, fractions, decimals' },
    { id: 'algebra', name: 'Algebra', icon: <X size={16} />, desc: 'Equations, variables, expressions' },
    { id: 'geometry', name: 'Geometry', icon: <Target size={16} />, desc: 'Shapes, areas, volumes' },
    { id: 'trigonometry', name: 'Trigonometry', icon: <Pi size={16} />, desc: 'Sin, cos, tan, identities' },
    { id: 'calculus', name: 'Calculus', icon: <Sigma size={16} />, desc: 'Derivatives, integrals, limits' },
    { id: 'statistics', name: 'Statistics', icon: <ChevronDown size={16} />, desc: 'Mean, median, probability' },
  ];

  const exampleProblems: Record<string, string[]> = {
    arithmetic: ['What is 3/4 + 2/5?', 'Calculate 15% of 240', 'Simplify 48/72'],
    algebra: ['Solve for x: 2x + 5 = 13', 'Factor x² - 5x + 6', 'Solve: 3(x-2) = 2(x+4)'],
    geometry: ['Find the area of a circle with radius 7', 'Calculate the volume of a cube with side 5', 'What is the Pythagorean theorem?'],
    trigonometry: ['Find sin(30°)', 'Solve: cos(x) = 0.5 for 0° ≤ x ≤ 360°', 'Prove sin²θ + cos²θ = 1'],
    calculus: ['Find the derivative of x³ + 2x²', 'Calculate ∫ 2x dx', 'Find the limit as x→0 of sin(x)/x'],
    statistics: ['Find the mean of: 4, 8, 6, 5, 7', 'Calculate probability of rolling a 6', 'What is standard deviation?'],
  };

  const solveProblem = async () => {
    if (!problem.trim()) return;

    setIsLoading(true);
    setSolution([]);
    setShowSteps(false);

    try {
      const response = await aiService.generate(problem, {
        systemPrompt: `You are a ${topic} tutor. Solve the following problem step-by-step.
Format your response as numbered steps, like:
Step 1: [explanation]
Step 2: [calculation]
...
Final Answer: [result]

Be clear, educational, and show all work.`,
        temperature: 0.3,
        maxTokens: 1024,
      });

      if (response.success) {
        // Parse steps from response
        const steps = response.content.split('\n').filter(line => line.trim());
        setSolution(steps);
      } else {
        setSolution([
          'Step 1: Analyze the problem: ' + problem,
          'Step 2: AI tutor unavailable - try running a local LLM',
          'Step 3: Or check your API configuration',
        ]);
      }
    } catch (error) {
      setSolution(['Error: Could not solve problem. Please try again.']);
    }
    setIsLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Topics Sidebar */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="py-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Calculator size={16} className="text-green-400" />
            Math Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTopic(t.id);
                setProblem('');
                setSolution([]);
              }}
              className={`w-full p-3 rounded-lg text-left transition ${
                topic === t.id
                  ? 'bg-aura-600/30 border border-aura-600'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 text-white">
                {t.icon}
                <span className="font-medium text-sm">{t.name}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{t.desc}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Problem Solver */}
      <Card className="lg:col-span-3 bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {topics.find(t => t.id === topic)?.icon}
            {topics.find(t => t.id === topic)?.name} Tutor
          </CardTitle>
          <CardDescription>Enter a problem and get step-by-step solutions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Problem Input */}
          <div className="space-y-3">
            <Textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="Enter your math problem here... (e.g., Solve for x: 2x + 5 = 13)"
              className="bg-slate-800 border-slate-700 text-white min-h-[100px]"
            />
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-slate-500">Examples:</span>
              {exampleProblems[topic]?.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setProblem(ex)}
                  className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 hover:bg-aura-600 transition"
                >
                  {ex}
                </button>
              ))}
            </div>
            <Button
              onClick={solveProblem}
              disabled={!problem.trim() || isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {isLoading ? (
                <>
                  <RefreshCw size={18} className="mr-2 animate-spin" />
                  Solving...
                </>
              ) : (
                <>
                  <Lightbulb size={18} className="mr-2" />
                  Solve Problem
                </>
              )}
            </Button>
          </div>

          {/* Solution */}
          {solution.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-400" />
                  Step-by-Step Solution
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(solution.join('\n'));
                    toast.success('Copied to clipboard!');
                  }}
                >
                  <Copy size={14} className="mr-1" />
                  Copy
                </Button>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 space-y-3">
                {solution.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      step.startsWith('Final') || step.startsWith('✓')
                        ? 'bg-green-900/30 border border-green-700'
                        : 'bg-slate-700/50'
                    }`}
                  >
                    <p className={`text-sm ${
                      step.startsWith('Final') || step.startsWith('✓')
                        ? 'text-green-300 font-semibold'
                        : 'text-slate-200'
                    }`}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ================== SCIENCE LAB ==================
function ScienceLab() {
  const [subject, setSubject] = useState<'biology' | 'chemistry' | 'physics' | 'anatomy'>('biology');
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const subjects = [
    { id: 'biology', name: 'Biology', icon: <Dna size={20} />, color: 'text-green-400' },
    { id: 'chemistry', name: 'Chemistry', icon: <Beaker size={20} />, color: 'text-blue-400' },
    { id: 'physics', name: 'Physics', icon: <Atom size={20} />, color: 'text-purple-400' },
    { id: 'anatomy', name: 'Anatomy', icon: <FlaskConical size={20} />, color: 'text-red-400' },
  ];

  const topicsBySubject: Record<string, string[]> = {
    biology: ['Cell Structure', 'DNA & Genetics', 'Evolution', 'Ecosystems', 'Photosynthesis', 'Human Body Systems'],
    chemistry: ['Periodic Table', 'Chemical Bonds', 'Reactions', 'Acids & Bases', 'Organic Chemistry', 'Stoichiometry'],
    physics: ['Motion & Forces', 'Energy', 'Waves', 'Electricity', 'Magnetism', 'Quantum Basics'],
    anatomy: ['Skeletal System', 'Muscular System', 'Nervous System', 'Cardiovascular', 'Respiratory', 'Digestive System'],
  };

  const askQuestion = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse('');

    try {
      const subjectName = subjects.find(s => s.id === subject)?.name || subject;
      const result = await aiService.generate(query, {
        systemPrompt: `You are an expert ${subjectName} tutor. Explain concepts clearly and thoroughly.
Format your response with:
- A clear title
- Key points as bullet points
- Detailed explanation
- Real-world applications or examples
- End with an engaging question to encourage further learning

Use markdown formatting for readability.`,
        temperature: 0.7,
        maxTokens: 1500,
      });

      if (result.success) {
        setResponse(result.content);
      } else {
        setResponse(`**Exploring: ${query}**\n\n🔬 Great question about ${subjectName}! To get AI-powered explanations, set up your own AI - it's easier than you think!\n\n**Quick Setup:**\n1. Download LM Studio (lmstudio.ai) - it's free!\n2. Download any model (Llama 3 is great)\n3. Click 'Start Server'\n4. Come back here and ask again!\n\nYou'll be learning with your own personal AI tutor! 🚀`);
      }
    } catch (error) {
      setResponse('Error connecting to AI tutor. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Subject Tabs */}
      <div className="grid grid-cols-4 gap-4">
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setSubject(s.id as typeof subject);
              setQuery('');
              setResponse('');
            }}
            className={`p-4 rounded-lg transition flex flex-col items-center gap-2 ${
              subject === s.id
                ? 'bg-aura-600/30 border-2 border-aura-500'
                : 'bg-slate-800 border-2 border-transparent hover:border-slate-600'
            }`}
          >
            <span className={s.color}>{s.icon}</span>
            <span className="text-white font-medium">{s.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Topics */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="py-3">
            <CardTitle className="text-white text-sm">Quick Topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topicsBySubject[subject]?.map((topic) => (
              <button
                key={topic}
                onClick={() => setQuery(`Explain ${topic}`)}
                className="w-full text-left p-3 bg-slate-800 rounded-lg text-sm text-slate-300 hover:bg-aura-600 transition"
              >
                {topic}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Q&A Area */}
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {subjects.find(s => s.id === subject)?.icon}
              {subjects.find(s => s.id === subject)?.name} Tutor
            </CardTitle>
            <CardDescription>Ask any question about {subject}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
                placeholder={`Ask about ${subject}...`}
                className="flex-1 bg-slate-800 border-slate-700 text-white"
              />
              <Button onClick={askQuestion} disabled={!query.trim() || isLoading} className="bg-aura-600">
                {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
              </Button>
            </div>

            {response && (
              <div className="bg-slate-800 rounded-lg p-4">
                <div className="prose prose-invert prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-slate-200 text-sm">{response}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ================== WORD PROBLEM SOLVER ==================
function WordProblemSolver() {
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState<{
    understanding: string;
    variables: { name: string; value: string }[];
    equation: string;
    steps: string[];
    answer: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const exampleProblems = [
    'A train travels 120 miles in 2 hours. What is its average speed?',
    'Sarah has 3 times as many apples as John. Together they have 24 apples. How many does each have?',
    'A rectangle has a length that is 4 more than its width. If the perimeter is 28, find the dimensions.',
    'If 5 workers can complete a job in 12 days, how long will it take 3 workers?',
  ];

  const solveProblem = async () => {
    if (!problem.trim()) return;

    setIsLoading(true);
    setSolution(null);

    await new Promise((r) => setTimeout(r, 2000));

    // Demo solution
    setSolution({
      understanding: 'This is a rate/distance problem. We need to find the speed given distance and time.',
      variables: [
        { name: 'd', value: '120 miles (distance)' },
        { name: 't', value: '2 hours (time)' },
        { name: 's', value: '? (speed we need to find)' },
      ],
      equation: 'Speed = Distance ÷ Time → s = d/t',
      steps: [
        'Step 1: Identify what we know - Distance = 120 miles, Time = 2 hours',
        'Step 2: Recall the formula: Speed = Distance ÷ Time',
        'Step 3: Substitute values: Speed = 120 ÷ 2',
        'Step 4: Calculate: Speed = 60',
        'Step 5: Add units: Speed = 60 miles per hour (mph)',
      ],
      answer: 'The average speed of the train is 60 miles per hour (mph).',
    });
    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="text-center">
          <Brain size={48} className="mx-auto mb-4 text-amber-400" />
          <CardTitle className="text-white text-2xl">Word Problem Solver</CardTitle>
          <CardDescription>
            Paste any word problem and get a step-by-step solution with explanations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Type or paste your word problem here..."
            className="bg-slate-800 border-slate-700 text-white min-h-[120px]"
          />

          <div>
            <p className="text-xs text-slate-500 mb-2">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {exampleProblems.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => setProblem(ex)}
                  className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-300 hover:bg-aura-600 transition"
                >
                  Example {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={solveProblem}
            disabled={!problem.trim() || isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
          >
            {isLoading ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" />
                Analyzing Problem...
              </>
            ) : (
              <>
                <Sparkles size={18} className="mr-2" />
                Solve Problem
              </>
            )}
          </Button>

          {solution && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              {/* Understanding */}
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <h4 className="text-blue-300 font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb size={16} />
                  Understanding the Problem
                </h4>
                <p className="text-slate-300 text-sm">{solution.understanding}</p>
              </div>

              {/* Variables */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Variables Identified</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {solution.variables.map((v, idx) => (
                    <div key={idx} className="bg-slate-700 rounded p-2">
                      <span className="text-aura-400 font-mono">{v.name}</span>
                      <span className="text-slate-400"> = </span>
                      <span className="text-slate-300 text-sm">{v.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equation */}
              <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                <h4 className="text-purple-300 font-semibold mb-2">Key Equation</h4>
                <p className="text-white font-mono text-lg">{solution.equation}</p>
              </div>

              {/* Steps */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3">Solution Steps</h4>
                <div className="space-y-2">
                  {solution.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-aura-600 text-white text-xs flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-slate-300 text-sm">{step.replace(/^Step \d+: /, '')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Answer */}
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <h4 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle size={16} />
                  Final Answer
                </h4>
                <p className="text-white text-lg font-semibold">{solution.answer}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ================== STUDY ASSISTANT ==================
function StudyAssistant() {
  const [mode, setMode] = useState<'flashcards' | 'notes' | 'quiz'>('flashcards');
  const [flashcards, setFlashcards] = useState<FlashCard[]>([
    { id: '1', front: 'What is photosynthesis?', back: 'The process by which plants convert sunlight, water, and CO2 into glucose and oxygen.', category: 'Biology', mastered: false },
    { id: '2', front: 'Define velocity', back: 'The rate of change of displacement with respect to time. It is a vector quantity.', category: 'Physics', mastered: false },
    { id: '3', front: 'What is the Pythagorean theorem?', back: 'a² + b² = c², where c is the hypotenuse of a right triangle.', category: 'Math', mastered: true },
  ]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [notesSummary, setNotesSummary] = useState('');
  const [quizTopic, setQuizTopic] = useState('');
  const [quizType, setQuizType] = useState('Multiple Choice');
  const [quizCount, setQuizCount] = useState(5);
  const [quizQuestions, setQuizQuestions] = useState<{question: string; options?: string[]; answer: string}[]>([]);

  const addFlashcard = () => {
    if (!newFront.trim() || !newBack.trim()) return;

    setFlashcards([
      ...flashcards,
      {
        id: Date.now().toString(),
        front: newFront,
        back: newBack,
        category: 'Custom',
        mastered: false,
      },
    ]);
    setNewFront('');
    setNewBack('');
    toast.success('Flashcard added!');
  };

  const generateFlashcardsAI = async () => {
    if (!aiTopic.trim()) return;
    setIsGenerating(true);
    
    try {
      const result = await aiService.generate(
        `Generate 5 flashcards for studying: ${aiTopic}`,
        {
          systemPrompt: `You are an educational flashcard generator. Create flashcards in this exact JSON format:
[
  {"front": "question text", "back": "answer text"},
  ...
]
Only output the JSON array, nothing else. Make questions clear and answers concise but complete.`,
          temperature: 0.7,
          maxTokens: 1000,
        }
      );

      if (result.success) {
        try {
          const parsed = JSON.parse(result.content.replace(/```json?|```/g, '').trim());
          const newCards = parsed.map((card: {front: string; back: string}, idx: number) => ({
            id: `ai-${Date.now()}-${idx}`,
            front: card.front,
            back: card.back,
            category: aiTopic,
            mastered: false,
          }));
          setFlashcards([...flashcards, ...newCards]);
          toast.success(`Generated ${newCards.length} flashcards!`);
          setAiTopic('');
        } catch {
          toast.error('Failed to parse AI response. Try again.');
        }
      } else {
        toast.error('AI unavailable. Try running a local LLM!');
      }
    } catch {
      toast.error('Error generating flashcards.');
    }
    setIsGenerating(false);
  };

  const summarizeNotes = async () => {
    if (!notesInput.trim()) return;
    setIsGenerating(true);
    setNotesSummary('');

    try {
      const result = await aiService.generate(notesInput, {
        systemPrompt: `You are an expert study assistant. Analyze these notes and provide:

## Summary
A concise 2-3 sentence summary of the main topic.

## Key Points
• List the most important concepts as bullet points

## Important Terms
• Define any technical terms or vocabulary

## Study Tips
• Suggest how to remember this material

Use markdown formatting for readability.`,
        temperature: 0.6,
        maxTokens: 1200,
      });

      if (result.success) {
        setNotesSummary(result.content);
      } else {
        setNotesSummary('**📚 Ready to Summarize Your Notes!**\n\nTo unlock AI-powered summaries, set up your own AI:\n\n1. **Download LM Studio** from lmstudio.ai (free!)\n2. **Get a model** like Llama 3 or Mistral\n3. **Start the server** and return here\n\nYour notes will be summarized instantly - and it all runs on your computer! 🎓');
      }
    } catch {
      setNotesSummary('Error generating summary. Please try again.');
    }
    setIsGenerating(false);
  };

  const generateQuiz = async () => {
    if (!quizTopic.trim()) return;
    setIsGenerating(true);
    setQuizQuestions([]);

    try {
      const result = await aiService.generate(
        `Create a ${quizType} quiz about: ${quizTopic}`,
        {
          systemPrompt: `Generate ${quizCount} ${quizType} questions. Return ONLY a JSON array:
[
  {"question": "question text", "options": ["A", "B", "C", "D"], "answer": "correct answer explanation"}
]
For True/False, options should be ["True", "False"].
For Short Answer, omit options field.
Make questions educational and appropriate difficulty.`,
          temperature: 0.7,
          maxTokens: 1500,
        }
      );

      if (result.success) {
        try {
          const parsed = JSON.parse(result.content.replace(/```json?|```/g, '').trim());
          setQuizQuestions(parsed);
          toast.success(`Generated ${parsed.length} quiz questions!`);
        } catch {
          toast.error('Failed to parse quiz. Try again.');
        }
      } else {
        toast.error('AI unavailable. Try a local LLM!');
      }
    } catch {
      toast.error('Error generating quiz.');
    }
    setIsGenerating(false);
  };

  const toggleMastered = (id: string) => {
    setFlashcards(flashcards.map((fc) =>
      fc.id === id ? { ...fc, mastered: !fc.mastered } : fc
    ));
  };

  const nextCard = () => {
    setShowBack(false);
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    setShowBack(false);
    setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-2 justify-center">
        {[
          { id: 'flashcards', label: 'Flashcards', icon: <BookOpen size={16} /> },
          { id: 'notes', label: 'Notes', icon: <PenTool size={16} /> },
          { id: 'quiz', label: 'Quiz Me', icon: <Target size={16} /> },
        ].map((m) => (
          <Button
            key={m.id}
            variant={mode === m.id ? 'default' : 'outline'}
            onClick={() => setMode(m.id as typeof mode)}
            className={mode === m.id ? 'bg-aura-600' : ''}
          >
            {m.icon}
            <span className="ml-2">{m.label}</span>
          </Button>
        ))}
      </div>

      {mode === 'flashcards' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Display */}
          <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
            <CardContent className="py-8">
              {flashcards.length > 0 ? (
                <div className="space-y-6">
                  <div className="text-center text-sm text-slate-400">
                    Card {currentCardIndex + 1} of {flashcards.length}
                  </div>

                  <button
                    onClick={() => setShowBack(!showBack)}
                    className="w-full min-h-[200px] p-8 bg-slate-800 rounded-xl border-2 border-slate-700 hover:border-aura-500 transition cursor-pointer"
                  >
                    <p className="text-white text-xl">
                      {showBack ? flashcards[currentCardIndex].back : flashcards[currentCardIndex].front}
                    </p>
                    <p className="text-xs text-slate-500 mt-4">
                      {showBack ? 'Click to see question' : 'Click to reveal answer'}
                    </p>
                  </button>

                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={prevCard}>
                      ← Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleMastered(flashcards[currentCardIndex].id)}
                      className={flashcards[currentCardIndex].mastered ? 'text-green-400' : ''}
                    >
                      {flashcards[currentCardIndex].mastered ? '✓ Mastered' : 'Mark Mastered'}
                    </Button>
                    <Button variant="outline" onClick={nextCard}>
                      Next →
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  No flashcards yet. Add some to get started!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add New Card */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="py-3">
              <CardTitle className="text-white text-sm">Add Flashcard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Generation */}
              <div className="bg-aura-900/30 border border-aura-600/30 rounded-lg p-3 space-y-2">
                <p className="text-xs text-aura-400 font-medium">✨ AI Generate</p>
                <Input
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Topic (e.g., World War 2, Calculus)"
                  className="bg-slate-800 border-slate-700 text-white text-sm"
                />
                <Button 
                  onClick={generateFlashcardsAI}
                  disabled={!aiTopic.trim() || isGenerating}
                  size="sm"
                  className="w-full bg-gradient-to-r from-aura-500 to-purple-500"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={14} className="mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} className="mr-1" />
                      Generate 5 Cards
                    </>
                  )}
                </Button>
              </div>

              <div className="border-t border-slate-800 pt-4">
                <p className="text-xs text-slate-500 mb-2">Or add manually:</p>
                <Textarea
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="Question / Front"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <Textarea
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                placeholder="Answer / Back"
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Button onClick={addFlashcard} className="w-full bg-aura-600">
                Add Card
              </Button>

              <div className="border-t border-slate-800 pt-4">
                <p className="text-xs text-slate-500 mb-2">All Cards ({flashcards.length})</p>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {flashcards.map((fc, idx) => (
                    <div
                      key={fc.id}
                      onClick={() => {
                        setCurrentCardIndex(idx);
                        setShowBack(false);
                      }}
                      className={`p-2 rounded text-xs cursor-pointer ${
                        idx === currentCardIndex ? 'bg-aura-600' : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    >
                      <p className="text-white truncate">{fc.front}</p>
                      {fc.mastered && <span className="text-green-400 text-xs">✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {mode === 'notes' && (
        <Card className="bg-slate-900 border-slate-800 max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white">AI Note Summarizer</CardTitle>
            <CardDescription>Paste your notes and get AI-generated summaries and key points</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="Paste your notes, lecture content, or textbook excerpts here..."
              className="bg-slate-800 border-slate-700 text-white min-h-[200px]"
            />
            <Button 
              onClick={summarizeNotes}
              disabled={!notesInput.trim() || isGenerating}
              className="w-full bg-aura-600"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={18} className="mr-2 animate-spin" />
                  Analyzing Notes...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  Generate Summary
                </>
              )}
            </Button>
            {notesSummary && (
              <div className="bg-slate-800 rounded-lg p-4 prose prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: notesSummary.replace(/\n/g, '<br/>').replace(/##\s*(.+)/g, '<h3 class="text-aura-400">$1</h3>').replace(/•\s*(.+)/g, '<li>$1</li>') }} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {mode === 'quiz' && (
        <Card className="bg-slate-900 border-slate-800 max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-white">AI Quiz Generator</CardTitle>
            <CardDescription>Generate practice questions from any topic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={quizTopic}
              onChange={(e) => setQuizTopic(e.target.value)}
              placeholder="Enter a topic to generate quiz questions..."
              className="bg-slate-800 border-slate-700 text-white"
            />
            <div className="flex gap-2">
              <select 
                value={quizType}
                onChange={(e) => setQuizType(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-md text-white px-3 py-2"
              >
                <option>Multiple Choice</option>
                <option>True/False</option>
                <option>Short Answer</option>
                <option>Mixed</option>
              </select>
              <select 
                value={quizCount}
                onChange={(e) => setQuizCount(Number(e.target.value))}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-md text-white px-3 py-2"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>
            <Button 
              onClick={generateQuiz}
              disabled={!quizTopic.trim() || isGenerating}
              className="w-full bg-aura-600"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={18} className="mr-2 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Target size={18} className="mr-2" />
                  Generate Quiz
                </>
              )}
            </Button>

            {quizQuestions.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h4 className="text-white font-semibold">Generated Questions:</h4>
                {quizQuestions.map((q, idx) => (
                  <div key={idx} className="bg-slate-800 rounded-lg p-4 space-y-2">
                    <p className="text-white font-medium">{idx + 1}. {q.question}</p>
                    {q.options && (
                      <div className="grid grid-cols-2 gap-2 pl-4">
                        {q.options.map((opt, oidx) => (
                          <button key={oidx} className="text-left text-sm text-slate-300 hover:text-aura-400 transition">
                            {String.fromCharCode(65 + oidx)}. {opt}
                          </button>
                        ))}
                      </div>
                    )}
                    <details className="text-xs text-slate-500">
                      <summary className="cursor-pointer hover:text-aura-400">Show Answer</summary>
                      <p className="mt-1 text-green-400">{q.answer}</p>
                    </details>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ================== MAIN ACADEMICS SUITE COMPONENT ==================
export default function AcademicsSuitePage() {
  const [activeTab, setActiveTab] = useState('languages');

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <GraduationCap size={32} className="text-amber-500" />
                Academics Suite
              </h1>
              <p className="text-slate-400">
                Your AI-powered comprehensive tutor for languages, math, science, and more
              </p>
            </div>
            <WalletDisplay userId="demo-user" />
          </div>
        </div>

        {/* Daily Challenge Widget */}
        <div className="mb-8">
          <DailyChallengeWidget section="academics" userId="demo-user" compact />
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 flex-wrap">
            <TabsTrigger value="languages" className="data-[state=active]:bg-aura-600">
              <Languages size={16} className="mr-2" />
              Languages
            </TabsTrigger>
            <TabsTrigger value="math" className="data-[state=active]:bg-aura-600">
              <Calculator size={16} className="mr-2" />
              Math
            </TabsTrigger>
            <TabsTrigger value="science" className="data-[state=active]:bg-aura-600">
              <FlaskConical size={16} className="mr-2" />
              Science
            </TabsTrigger>
            <TabsTrigger value="wordproblems" className="data-[state=active]:bg-aura-600">
              <Brain size={16} className="mr-2" />
              Word Problems
            </TabsTrigger>
            <TabsTrigger value="study" className="data-[state=active]:bg-aura-600">
              <BookOpen size={16} className="mr-2" />
              Study Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="languages">
            <LanguageLearning />
          </TabsContent>

          <TabsContent value="math">
            <MathTutor />
          </TabsContent>

          <TabsContent value="science">
            <ScienceLab />
          </TabsContent>

          <TabsContent value="wordproblems">
            <WordProblemSolver />
          </TabsContent>

          <TabsContent value="study">
            <StudyAssistant />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

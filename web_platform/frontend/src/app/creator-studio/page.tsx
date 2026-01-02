'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { ErrorScanner, CodeError, ScanResult, detectLanguage } from '@/lib/errorScanner';
import { useModelRegistry, useModelHealth, useActiveModel } from '@/lib/useModelManagement';
import { useCodeGeneration } from '@/hooks/useCodeGeneration';
import { CodeBlock, highlightCode } from '@/components/CodeBlock';
import {
  InstructionTemplate,
  InstructionStyle,
  INSTRUCTION_TEMPLATES,
  generateInstruction,
} from '@/lib/instructionTemplates';
import {
  Code2,
  Play,
  Save,
  Download,
  Copy,
  Plus,
  X,
  FileCode,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Terminal,
  Wand2,
  Zap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Sparkles,
  ArrowRight,
  Monitor,
  CheckCircle,
  AlertCircle,
  Gamepad2,
  Palette,
} from 'lucide-react';

// ============== TYPES ==============
interface GeneratedFile {
  id: string;
  filename: string;
  content: string;
  language: string;
  description: string;
}

interface InstructionSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  expanded: boolean;
}

interface NextStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface CreatorStudioState {
  projectName: string;
  description: string;
  framework: 'react' | 'vue' | 'svelte' | 'unreal' | 'unity';
  targetType: 'component' | 'game-asset' | 'full-system' | 'utility';
  generatedFiles: GeneratedFile[];
  activeFileId: string | null;
  isGenerating: boolean;
  showInstructions: boolean;
  instructionSections: InstructionSection[];
  characterCount: number;
  maxCharacters: number;
}

// ============== TEMPLATES ==============
const FRAMEWORK_OPTIONS = [
  { value: 'react', label: '⚛️ React' },
  { value: 'vue', label: '💚 Vue' },
  { value: 'svelte', label: '🔥 Svelte' },
  { value: 'unreal', label: '🎮 Unreal Engine' },
  { value: 'unity', label: '🎯 Unity' },
];

const TARGET_TYPE_OPTIONS = [
  { value: 'component', label: '🧩 Component/Module' },
  { value: 'game-asset', label: '🎨 Game Asset' },
  { value: 'full-system', label: '🏗️ Full System' },
  { value: 'utility', label: '🔧 Utility/Helper' },
];

// ============== MOCK INSTRUCTION DATA ==============
const MOCK_REASONING = {
  why: `Your specification describes a complex user authentication and profile management system. We've structured this using:

• Repository Pattern for data access (separation of concerns)
• Service Layer for business logic (reusability)
• Factory Pattern for object creation (flexibility)
• Dependency Injection for testability

This architecture scales from a single server to microservices without refactoring the core logic.`,

  bestPractices: [
    'Implemented async/await for non-blocking operations',
    'Added comprehensive input validation and sanitization',
    'Used TypeScript generics for type-safe collections',
    'Included detailed JSDoc comments for IDE intellisense',
    'Structured error handling with custom exception types',
    'Added logging hooks at critical decision points',
  ],

  nextSteps: [
    {
      id: 'add-tests',
      label: '🧪 Generate Jest Test Suite',
      description: 'Create comprehensive unit & integration tests with 95%+ coverage',
      icon: <FileCode className="w-4 h-4" />,
    },
    {
      id: 'add-docs',
      label: '📚 Generate API Documentation',
      description: 'Auto-generate OpenAPI/Swagger specs and markdown docs',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'add-database',
      label: '🗄️ Generate Database Schema',
      description: 'Create Prisma migrations, SQL schemas, and seed files',
      icon: <Terminal className="w-4 h-4" />,
    },
    {
      id: 'add-frontend',
      label: '🎨 Generate Frontend Components',
      description: 'Create React/Vue UI components that consume this API',
      icon: <Wand2 className="w-4 h-4" />,
    },
    {
      id: 'optimize',
      label: '⚡ Performance Optimization',
      description: 'Add caching, compression, and scalability improvements',
      icon: <Zap className="w-4 h-4" />,
    },
    {
      id: 'refine',
      label: '✨ Refine & Customize',
      description: 'Tell me what to change and I\'ll iterate in real-time',
      icon: <Sparkles className="w-4 h-4" />,
    },
  ] as NextStep[],
};

// ============== HEADER COMPONENT ==============
function CreatorStudioHeader() {
  const { models, activeModel, switchModel } = useModelRegistry();
  const { health } = useModelHealth(activeModel?.id);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const getHealthColor = () => {
    if (!health) return 'text-slate-500';
    return health.status === 'healthy' ? 'text-green-500' : 'text-red-500';
  };

  const getHealthIcon = () => {
    if (!health) return '⊘';
    return health.status === 'healthy' ? '●' : '○';
  };

  return (
    <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Wand2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Creator Studio</h1>
            <p className="text-sm text-slate-400">AI-powered code generation with real-time reasoning</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Active Model Display */}
          {activeModel && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700">
              <Monitor className="w-4 h-4 text-purple-400" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">{activeModel.name}</span>
                <span className={`text-xs flex items-center gap-1 ${getHealthColor()}`}>
                  <span>{getHealthIcon()}</span>
                  {health ? (
                    health.status === 'healthy' ? `${health.latency}ms` : 'Offline'
                  ) : (
                    'Checking...'
                  )}
                </span>
              </div>
            </div>
          )}

          {/* Model Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="flex items-center gap-2"
            >
              <Palette className="w-4 h-4" />
              Switch Model
              <ChevronDown className="w-4 h-4" />
            </Button>

            {showModelDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
                <div className="p-2 max-h-64 overflow-y-auto">
                  {models.length > 0 ? (
                    models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          switchModel(model.id);
                          setShowModelDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeModel?.id === model.id
                            ? 'bg-purple-500/20 border border-purple-500/50'
                            : 'hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{model.name}</span>
                          {activeModel?.id === model.id && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{model.modelName}</p>
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 p-3">No models registered</p>
                  )}
                </div>
                <div className="border-t border-slate-700 p-2">
                  <Link href="/onboarding">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Model
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/models">
              <Button variant="outline" size="sm">
                <Monitor className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== MAIN COMPONENT ==============
export default function CreatorStudioPage() {
  const { activeModel } = useModelRegistry();
  const { generate: generateCode, loading: codeGenerating } = useCodeGeneration();

  const [state, setState] = useState<CreatorStudioState>({
    projectName: 'MyProject',
    description: '',
    framework: 'react',
    targetType: 'component',
    generatedFiles: [],
    activeFileId: null,
    isGenerating: false,
    showInstructions: false,
    instructionSections: [
      {
        id: 'why',
        title: '💡 Why This Structure',
        icon: <Lightbulb className="w-5 h-5" />,
        content: MOCK_REASONING.why,
        expanded: true,
      },
      {
        id: 'practices',
        title: '✅ Best Practices Applied',
        icon: <Target className="w-5 h-5" />,
        content: MOCK_REASONING.bestPractices.map((p) => `• ${p}`).join('\n'),
        expanded: true,
      },
    ],
    characterCount: 0,
    maxCharacters: 50000,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle textarea changes
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= state.maxCharacters) {
      setState((prev) => ({
        ...prev,
        description: newText,
        characterCount: newText.length,
      }));
    }
  };

  // Toggle instruction section
  const toggleInstructionSection = (id: string) => {
    setState((prev) => ({
      ...prev,
      instructionSections: prev.instructionSections.map((section) =>
        section.id === id ? { ...section, expanded: !section.expanded } : section
      ),
    }));
  };

  // Real code generation with model selection
  const handleGenerate = async () => {
    if (!state.description.trim()) {
      toast.error('Please describe what you want to build');
      return;
    }

    if (!activeModel) {
      toast.error('Please register and select a model first');
      return;
    }

    setState((prev) => ({ ...prev, isGenerating: true }));
    
    const generatingToast = toast.loading(
      `Generating code with ${activeModel.name}...`
    );

    try {
      const response = await generateCode({
        projectName: state.projectName,
        description: state.description,
        framework: state.framework,
        targetType: state.targetType,
        activeModel,
      });

      if (response && response.success) {
        setState((prev) => ({
          ...prev,
          generatedFiles: response.files as GeneratedFile[],
          activeFileId: response.files[0]?.id || null,
          isGenerating: false,
          showInstructions: true,
        }));

        toast.dismiss(generatingToast);
        toast.success(
          `Code generated in ${Math.round(response.latency)}ms using ${response.modelUsed}`
        );
      } else {
        throw new Error(response?.error || 'Generation failed');
      }
    } catch (err: any) {
      setState((prev) => ({ ...prev, isGenerating: false }));
      toast.dismiss(generatingToast);
      toast.error(err.message || 'Code generation failed');
      console.error('Generation error:', err);
    }
  };

  const mockFiles: GeneratedFile[] = [
      {
        id: '1',
        filename: `${state.projectName}.${state.framework === 'react' ? 'tsx' : state.framework === 'unreal' ? 'h' : 'cs'}`,
        language: state.framework === 'react' ? 'typescript' : state.framework === 'unreal' ? 'cpp' : 'csharp',
        description: 'Main component/class file',
        content: `// Generated ${state.framework} ${state.targetType}\n// Created: ${new Date().toLocaleString()}\n\n${'// Your brilliant code here!\n'.repeat(30)}`,
      },
      {
        id: '2',
        filename: `${state.projectName}.test.${state.framework === 'react' ? 'tsx' : 'cs'}`,
        language: state.framework === 'react' ? 'typescript' : 'csharp',
        description: 'Test suite with 95%+ coverage',
        content: `// Test file for ${state.projectName}\n// Comprehensive test coverage\n\n${'// Test case here\n'.repeat(25)}`,
      },
      {
        id: '3',
        filename: `${state.projectName}.types.ts`,
        language: 'typescript',
        description: 'TypeScript type definitions',
        content: `// Type definitions\nexport interface ${state.projectName}Props {\n  // Your types here\n}\n\n${'// More types\n'.repeat(20)}`,
      },
    ];

  const activeFile = state.generatedFiles.find((f) => f.id === state.activeFileId);

  const characterPercentage = (state.characterCount / state.maxCharacters) * 100;
  const percentageColor =
    characterPercentage > 90 ? 'bg-red-500' : characterPercentage > 70 ? 'bg-yellow-500' : 'bg-emerald-500';

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* HEADER */}
      <CreatorStudioHeader />

      {/* MAIN CONTENT - 3 PANES */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANE: GENERATOR */}
        <div className="w-2/5 border-r border-slate-800 flex flex-col overflow-hidden bg-slate-950">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Project Name</label>
                <Input
                  value={state.projectName}
                  onChange={(e) => setState((prev) => ({ ...prev, projectName: e.target.value }))}
                  placeholder="MyProject"
                  className="bg-slate-900 border-slate-700"
                />
              </div>

              {/* Framework Selection */}
              <div>
                <label className="block text-sm font-medium mb-3 text-slate-300">Framework</label>
                <div className="grid grid-cols-2 gap-2">
                  {FRAMEWORK_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setState((prev) => ({ ...prev, framework: option.value as any }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        state.framework === option.value
                          ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Type */}
              <div>
                <label className="block text-sm font-medium mb-3 text-slate-300">What to Build</label>
                <div className="space-y-2">
                  {TARGET_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setState((prev) => ({ ...prev, targetType: option.value as any }))}
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                        state.targetType === option.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Large Textarea */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-300">Your Specification</label>
                  <span className="text-xs text-slate-400">
                    {state.characterCount.toLocaleString()} / {state.maxCharacters.toLocaleString()}
                  </span>
                </div>
                <div className="mb-2 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${percentageColor} transition-all duration-300`} style={{ width: `${characterPercentage}%` }} />
                </div>
                <textarea
                  ref={textareaRef}
                  value={state.description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe what you want to build in as much detail as you want (up to 50,000 characters)...

Examples:
• Full architectural specifications with design patterns
• Multi-feature system descriptions
• Complex game mechanics and character systems
• UI component requirements with animations
• Database schema and API endpoint specifications
• Integration requirements and third-party services

Be as detailed as you want. The more context, the better the generated code."
                  className="w-full h-96 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Advanced Options */}
              <details className="group">
                <summary className="cursor-pointer flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-slate-100">
                  <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                  Advanced Options
                </summary>
                <div className="mt-4 space-y-3 pl-6 border-l border-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-700 border-slate-600" />
                    <span className="text-sm text-slate-300">Add TypeScript types</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-700 border-slate-600" />
                    <span className="text-sm text-slate-300">Include tests & documentation</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded bg-slate-700 border-slate-600" />
                    <span className="text-sm text-slate-300">Add accessibility (ARIA)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded bg-slate-700 border-slate-600" />
                    <span className="text-sm text-slate-300">Performance optimization</span>
                  </label>
                </div>
              </details>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleGenerate}
                  disabled={state.isGenerating}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  {state.isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
                <Button variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE PANE: CODE EDITOR */}
        <div className="flex-1 border-r border-slate-800 flex flex-col bg-slate-900/30">
          {state.generatedFiles.length > 0 ? (
            <>
              {/* File Tabs */}
              <div className="border-b border-slate-800 px-4 py-2 bg-slate-900/50 overflow-x-auto">
                <div className="flex gap-2">
                  {state.generatedFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => setState((prev) => ({ ...prev, activeFileId: file.id }))}
                      className={`px-3 py-1 text-sm rounded-t-lg transition-all whitespace-nowrap ${
                        state.activeFileId === file.id
                          ? 'bg-slate-800 text-slate-100 border-b-2 border-purple-500'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      {file.filename}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Content */}
              {activeFile && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                    <div>
                      <h3 className="font-medium text-slate-100">{activeFile.filename}</h3>
                      <p className="text-xs text-slate-400">{activeFile.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(activeFile.content);
                          toast.success('Copied to clipboard');
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Code Editor Area with Semantic Syntax Highlighting */}
                  <div className="flex-1 overflow-hidden bg-slate-950">
                    <CodeBlock
                      code={activeFile.content}
                      language={activeFile.language}
                      theme="dark"
                      showLineNumbers={true}
                      maxHeight="100%"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <FileCode className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Generate code to see it here</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANE: INSTRUCTIONS (COLLAPSIBLE) */}
        {state.showInstructions && (
          <div className="w-96 border-l border-slate-800 flex flex-col bg-slate-900/50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <h2 className="font-semibold text-slate-100 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                AI Reasoning
              </h2>
              <button
                onClick={() => setState((prev) => ({ ...prev, showInstructions: false }))}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Instruction Sections */}
              <div className="p-4 space-y-3">
                {state.instructionSections.map((section) => (
                  <div key={section.id} className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
                    <button
                      onClick={() => toggleInstructionSection(section.id)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                    >
                      <span className="flex items-center gap-2 text-slate-200 font-medium text-sm">
                        {section.icon}
                        {section.title}
                      </span>
                      {section.expanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {section.expanded && (
                      <div className="px-4 py-3 border-t border-slate-700 bg-slate-950/50 text-xs text-slate-400 whitespace-pre-wrap">
                        {section.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Next Steps */}
              <div className="px-4 pb-4">
                <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  What's Next?
                </h3>
                <div className="space-y-2">
                  {MOCK_REASONING.nextSteps.map((step) => (
                    <button
                      key={step.id}
                      className="w-full text-left px-3 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors group"
                    >
                      <div className="flex items-start gap-2">
                        <div className="text-slate-400 mt-0.5">{step.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-200 group-hover:text-slate-100">
                            {step.label}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">{step.description}</div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 mt-0.5 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STATUS BAR */}
      <div className="border-t border-slate-800 bg-slate-900/50 px-6 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>Framework: {state.framework.toUpperCase()}</span>
          <span>Type: {state.targetType}</span>
          <span>Files: {state.generatedFiles.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
}

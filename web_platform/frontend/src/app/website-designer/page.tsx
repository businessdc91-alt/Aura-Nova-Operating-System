'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AudioReactiveBorder } from '@/components/ui/AudioReactiveBorder';
import {
  Globe,
  Palette,
  MessageSquare,
  FileCode,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Download,
  Send,
  Bot,
  User,
  Layout,
  Type,
  Image,
  Zap,
  Settings,
  ExternalLink,
  Music,
} from 'lucide-react';

// ============== TYPES ==============

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface Typography {
  headingFont: string;
  bodyFont: string;
  scale: 'compact' | 'normal' | 'spacious';
}

interface DesignSection {
  id: string;
  type: string;
  title: string;
  content: string;
  userNotes: string;
}

interface WebsiteDesignSpec {
  // Deployment
  domainUrl: string;
  projectName: string;
  
  // Meta
  purpose: string;
  targetAudience: string;
  
  // Visual
  colorScheme: ColorScheme;
  typography: Typography;
  style: string;
  
  // Structure
  sections: DesignSection[];
  
  // Features
  features: {
    darkMode: boolean;
    animations: boolean;
    responsive: boolean;
    accessibility: boolean;
  };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ============== CONSTANTS ==============

const PHASES = [
  { id: 'setup', label: 'Setup', icon: Globe },
  { id: 'chat', label: 'Design Chat', icon: MessageSquare },
  { id: 'spec', label: 'Design Spec', icon: Palette },
  { id: 'prompt', label: 'Edit Prompt', icon: FileCode },
  { id: 'deploy', label: 'Deploy', icon: Rocket },
];

const STYLE_PRESETS = [
  { id: 'minimal', label: 'Minimal', description: 'Clean, whitespace-focused, simple' },
  { id: 'modern', label: 'Modern', description: 'Bold gradients, glassmorphism, dynamic' },
  { id: 'playful', label: 'Playful', description: 'Bright colors, rounded shapes, fun' },
  { id: 'corporate', label: 'Corporate', description: 'Professional, trustworthy, structured' },
  { id: 'artistic', label: 'Artistic', description: 'Creative, unique layouts, expressive' },
  { id: 'dark', label: 'Dark Mode', description: 'Dark backgrounds, neon accents, sleek' },
];

const SECTION_TYPES = [
  { id: 'header', label: 'Header/Navigation' },
  { id: 'hero', label: 'Hero Section' },
  { id: 'features', label: 'Features Grid' },
  { id: 'about', label: 'About Section' },
  { id: 'gallery', label: 'Image Gallery' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'pricing', label: 'Pricing Table' },
  { id: 'cta', label: 'Call to Action' },
  { id: 'contact', label: 'Contact Form' },
  { id: 'footer', label: 'Footer' },
];

const DESIGN_QUESTIONS = [
  "What is the main purpose of your website? (e.g., portfolio, business, e-commerce, blog)",
  "Who is your target audience? Describe them briefly.",
  "What feeling or vibe should visitors get? (e.g., professional, creative, friendly)",
  "Do you have any color preferences or brand colors?",
  "What are the key sections you need? (e.g., hero, about, services, contact)",
  "Any specific features you need? (dark mode, animations, forms)",
];

const DEFAULT_SPEC: WebsiteDesignSpec = {
  domainUrl: '',
  projectName: 'My Website',
  purpose: '',
  targetAudience: '',
  colorScheme: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#f472b6',
    background: '#0f172a',
    text: '#f8fafc',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    scale: 'normal',
  },
  style: 'modern',
  sections: [
    { id: '1', type: 'header', title: 'Navigation', content: 'Logo, nav links, CTA button', userNotes: '' },
    { id: '2', type: 'hero', title: 'Hero Section', content: 'Main headline and value proposition', userNotes: '' },
    { id: '3', type: 'features', title: 'Features', content: '3-4 key features of your product/service', userNotes: '' },
    { id: '4', type: 'footer', title: 'Footer', content: 'Links, social icons, copyright', userNotes: '' },
  ],
  features: {
    darkMode: true,
    animations: true,
    responsive: true,
    accessibility: true,
  },
};

// ============== MAIN COMPONENT ==============

export default function WebsiteDesignerPage() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [designSpec, setDesignSpec] = useState<WebsiteDesignSpec>(DEFAULT_SPEC);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [promptComments, setPromptComments] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Initialize chat with first question
  useEffect(() => {
    if (chatMessages.length === 0 && currentPhase === 1) {
      addAssistantMessage(DESIGN_QUESTIONS[0]);
    }
  }, [currentPhase]);

  // Generate prompt when entering prompt phase
  useEffect(() => {
    if (currentPhase === 3) {
      setGeneratedPrompt(generatePromptFromSpec(designSpec));
    }
  }, [currentPhase, designSpec]);

  const addAssistantMessage = (content: string) => {
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    }]);
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    // Add user message
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    }]);

    // Process response and update spec based on question
    processUserResponse(chatInput, currentQuestion);

    // Move to next question or finish
    const nextQ = currentQuestion + 1;
    if (nextQ < DESIGN_QUESTIONS.length) {
      setCurrentQuestion(nextQ);
      setTimeout(() => addAssistantMessage(DESIGN_QUESTIONS[nextQ]), 500);
    } else {
      setTimeout(() => {
        addAssistantMessage("Great! I've captured your design requirements. Let's review and refine the design specification. Click 'Next' to continue.");
      }, 500);
    }

    setChatInput('');
  };

  const processUserResponse = (response: string, questionIndex: number) => {
    const lowerResponse = response.toLowerCase();
    
    setDesignSpec(prev => {
      const updated = { ...prev };
      
      switch (questionIndex) {
        case 0: // Purpose
          updated.purpose = response;
          break;
        case 1: // Target audience
          updated.targetAudience = response;
          break;
        case 2: // Style/vibe
          if (lowerResponse.includes('professional') || lowerResponse.includes('corporate')) {
            updated.style = 'corporate';
          } else if (lowerResponse.includes('creative') || lowerResponse.includes('artistic')) {
            updated.style = 'artistic';
          } else if (lowerResponse.includes('playful') || lowerResponse.includes('fun')) {
            updated.style = 'playful';
          } else if (lowerResponse.includes('minimal') || lowerResponse.includes('clean')) {
            updated.style = 'minimal';
          } else if (lowerResponse.includes('dark') || lowerResponse.includes('sleek')) {
            updated.style = 'dark';
          } else {
            updated.style = 'modern';
          }
          break;
        case 3: // Colors - extract hex codes or set based on keywords
          if (lowerResponse.includes('blue')) {
            updated.colorScheme.primary = '#3b82f6';
          } else if (lowerResponse.includes('green')) {
            updated.colorScheme.primary = '#22c55e';
          } else if (lowerResponse.includes('red') || lowerResponse.includes('warm')) {
            updated.colorScheme.primary = '#ef4444';
          } else if (lowerResponse.includes('purple')) {
            updated.colorScheme.primary = '#8b5cf6';
          }
          break;
        case 4: // Sections
          // Parse mentioned sections
          const mentionedSections: DesignSection[] = [];
          SECTION_TYPES.forEach((sectionType, idx) => {
            if (lowerResponse.includes(sectionType.id) || lowerResponse.includes(sectionType.label.toLowerCase())) {
              mentionedSections.push({
                id: (idx + 1).toString(),
                type: sectionType.id,
                title: sectionType.label,
                content: '',
                userNotes: '',
              });
            }
          });
          if (mentionedSections.length > 0) {
            updated.sections = mentionedSections;
          }
          break;
        case 5: // Features
          updated.features.darkMode = lowerResponse.includes('dark');
          updated.features.animations = lowerResponse.includes('animation') || lowerResponse.includes('motion');
          break;
      }
      
      return updated;
    });
  };

  const generatePromptFromSpec = (spec: WebsiteDesignSpec): string => {
    return `# Website Design Specification

## Deployment Target
- **Domain/URL**: ${spec.domainUrl || '[To be specified]'}
- **Project Name**: ${spec.projectName}

## Project Overview
- **Purpose**: ${spec.purpose || 'Not specified'}
- **Target Audience**: ${spec.targetAudience || 'Not specified'}
- **Style Direction**: ${spec.style}

## Visual Identity

### Color Palette
\`\`\`
Primary:    ${spec.colorScheme.primary}
Secondary:  ${spec.colorScheme.secondary}
Accent:     ${spec.colorScheme.accent}
Background: ${spec.colorScheme.background}
Text:       ${spec.colorScheme.text}
\`\`\`

### Typography
- **Headings**: ${spec.typography.headingFont}
- **Body**: ${spec.typography.bodyFont}
- **Scale**: ${spec.typography.scale}

## Page Structure

${spec.sections.map((section, idx) => `### Section ${idx + 1}: ${section.title} (${section.type})
${section.content || 'Content to be defined'}
${section.userNotes ? `**Notes**: ${section.userNotes}` : ''}
`).join('\n')}

## Features
- Dark Mode: ${spec.features.darkMode ? '✅ Yes' : '❌ No'}
- Animations: ${spec.features.animations ? '✅ Yes' : '❌ No'}
- Responsive: ${spec.features.responsive ? '✅ Yes' : '❌ No'}
- Accessibility: ${spec.features.accessibility ? '✅ Yes' : '❌ No'}

---

## AI Generation Instructions

Generate a complete, production-ready website using the above specification.

**Technical Requirements:**
- Use semantic HTML5 elements
- Modern CSS with CSS Grid and Flexbox
- Mobile-first responsive design
- Smooth transitions and hover states
- ARIA labels for accessibility
- Optimized for performance

**Available Tools:**
- \`generateSection(type, content)\` - Generate HTML/CSS for a section
- \`applyColorScheme(palette)\` - Apply the color palette to CSS variables
- \`addComponent(sectionId, type, props)\` - Add interactive components
- \`modifySection(sectionId, changes)\` - Make changes to existing sections
- \`exportToFormat('html' | 'nextjs' | 'react')\` - Export final code

**Output Format:**
Provide complete HTML with inline CSS, or separate component files for React/Next.js export.
`;
  };

  const updateSection = (id: string, field: keyof DesignSection, value: string) => {
    setDesignSpec(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
  };

  const addSection = () => {
    const newId = Date.now().toString();
    setDesignSpec(prev => ({
      ...prev,
      sections: [...prev.sections, {
        id: newId,
        type: 'custom',
        title: 'New Section',
        content: '',
        userNotes: '',
      }],
    }));
  };

  const removeSection = (id: string) => {
    setDesignSpec(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== id),
    }));
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nextPhase = () => {
    if (currentPhase < PHASES.length - 1) {
      setCurrentPhase(prev => prev + 1);
    }
  };

  const prevPhase = () => {
    if (currentPhase > 0) {
      setCurrentPhase(prev => prev - 1);
    }
  };

  // ============== RENDER PHASES ==============

  const renderSetupPhase = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Let's Build Your Website</h2>
        <p className="text-slate-400">Start by entering your domain and project details</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6 space-y-6">
          {/* Domain URL Input */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <Globe className="inline w-4 h-4 mr-2" />
              Website Domain/URL
            </label>
            <Input
              value={designSpec.domainUrl}
              onChange={(e) => setDesignSpec(prev => ({ ...prev, domainUrl: e.target.value }))}
              placeholder="https://yourdomain.com"
              className="bg-slate-900 border-slate-700 text-white"
            />
            <p className="text-xs text-slate-500 mt-1">
              Enter your domain where the website will be deployed
            </p>
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <Edit3 className="inline w-4 h-4 mr-2" />
              Project Name
            </label>
            <Input
              value={designSpec.projectName}
              onChange={(e) => setDesignSpec(prev => ({ ...prev, projectName: e.target.value }))}
              placeholder="My Awesome Website"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          {/* Quick Style Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              <Palette className="inline w-4 h-4 mr-2" />
              Quick Style (optional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {STYLE_PRESETS.map(style => (
                <button
                  key={style.id}
                  onClick={() => setDesignSpec(prev => ({ ...prev, style: style.id }))}
                  className={`p-3 rounded-lg border text-left transition ${
                    designSpec.style === style.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <p className="font-medium text-white text-sm">{style.label}</p>
                  <p className="text-xs text-slate-400">{style.description}</p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderChatPhase = () => (
    <div className="flex flex-col h-[600px]">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white">Design Discussion</h2>
        <p className="text-slate-400 text-sm">Chat with the AI to refine your design requirements</p>
      </div>

      {/* Chat Messages */}
      <Card className="flex-1 bg-slate-800/50 border-slate-700 overflow-hidden">
        <CardContent className="h-full flex flex-col p-4">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-purple-600' : 'bg-slate-700'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[70%] p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-200'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
              placeholder="Type your response..."
              className="bg-slate-900 border-slate-700 text-white"
            />
            <Button onClick={handleChatSubmit} className="bg-purple-600 hover:bg-purple-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSpecPhase = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white">Design Specification</h2>
        <p className="text-slate-400 text-sm">Review and edit your website structure</p>
      </div>

      {/* Color Scheme */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Palette className="w-5 h-5" /> Color Scheme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(designSpec.colorScheme).map(([key, color]) => (
              <div key={key} className="text-center">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setDesignSpec(prev => ({
                    ...prev,
                    colorScheme: { ...prev.colorScheme, [key]: e.target.value }
                  }))}
                  className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-600"
                />
                <p className="text-xs text-slate-400 mt-1 capitalize">{key}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Layout className="w-5 h-5" /> Page Sections
            </CardTitle>
            <Button onClick={addSection} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" /> Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {designSpec.sections.map((section, idx) => (
            <div key={section.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-slate-500 text-sm">#{idx + 1}</span>
                <select
                  value={section.type}
                  onChange={(e) => updateSection(section.id, 'type', e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-sm"
                >
                  {SECTION_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                  <option value="custom">Custom</option>
                </select>
                <Input
                  value={section.title}
                  onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                  className="flex-1 bg-slate-800 border-slate-700 text-white text-sm h-8"
                  placeholder="Section title"
                />
                <Button
                  onClick={() => removeSection(section.id)}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                value={section.content}
                onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                placeholder="Describe the content for this section..."
                className="bg-slate-800 border-slate-700 text-white text-sm mb-2"
                rows={2}
              />
              <Input
                value={section.userNotes}
                onChange={(e) => updateSection(section.id, 'userNotes', e.target.value)}
                placeholder="Add notes or comments for the AI..."
                className="bg-slate-800/50 border-slate-600 text-slate-300 text-xs"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Features Toggle */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" /> Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(designSpec.features).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setDesignSpec(prev => ({
                  ...prev,
                  features: { ...prev.features, [key]: !value }
                }))}
                className={`p-3 rounded-lg border text-center transition ${
                  value
                    ? 'border-green-500 bg-green-500/20 text-green-300'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400'
                }`}
              >
                <p className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPromptPhase = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white">Generated Prompt</h2>
        <p className="text-slate-400 text-sm">Edit the prompt before sending to AI</p>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg">AI Generation Prompt</CardTitle>
            <Button onClick={copyPrompt} size="sm" variant="outline">
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={generatedPrompt}
            onChange={(e) => setGeneratedPrompt(e.target.value)}
            className="bg-slate-900 border-slate-700 text-slate-300 font-mono text-sm"
            rows={20}
          />
          <p className="text-xs text-slate-500 mt-2">
            Edit the prompt above to add specific instructions, then use it with your AI to generate the website.
          </p>
        </CardContent>
      </Card>

      {/* Quick Additions */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Add Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              'Add smooth scroll animations',
              'Include loading states',
              'Add SEO meta tags',
              'Include social sharing buttons',
              'Add newsletter signup form',
              'Include cookie consent banner',
            ].map(instruction => (
              <button
                key={instruction}
                onClick={() => setGeneratedPrompt(prev => prev + `\n\n**Additional Instruction**: ${instruction}`)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-xs text-slate-300 transition"
              >
                + {instruction}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDeployPhase = () => (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white">Deploy Your Website</h2>
        <p className="text-slate-400 text-sm">Preview and export your design</p>
      </div>

      {/* Deployment Target */}
      <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Globe className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-400">Deployment Target</p>
              <p className="text-xl font-bold text-white">
                {designSpec.domainUrl || 'No domain specified'}
              </p>
            </div>
            {designSpec.domainUrl && (
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" /> Visit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition cursor-pointer">
          <CardContent className="pt-6 text-center">
            <FileCode className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-1">Export HTML</h3>
            <p className="text-xs text-slate-400">Single HTML file with inline CSS</p>
            <Button className="mt-4 w-full" variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" /> Download
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500/50 transition cursor-pointer">
          <CardContent className="pt-6 text-center">
            <Zap className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-1">Export Next.js</h3>
            <p className="text-xs text-slate-400">Full Next.js project structure</p>
            <Button className="mt-4 w-full" variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" /> Download
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition cursor-pointer">
          <CardContent className="pt-6 text-center">
            <Rocket className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-1">Deploy Live</h3>
            <p className="text-xs text-slate-400">Deploy directly to your domain</p>
            <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-700" size="sm">
              <Rocket className="w-4 h-4 mr-1" /> Deploy
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Design Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <p className="text-2xl font-bold text-purple-400">{designSpec.sections.length}</p>
              <p className="text-xs text-slate-400">Sections</p>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <p className="text-2xl font-bold text-blue-400">{designSpec.style}</p>
              <p className="text-xs text-slate-400">Style</p>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <p className="text-2xl font-bold text-green-400">
                {Object.values(designSpec.features).filter(Boolean).length}
              </p>
              <p className="text-xs text-slate-400">Features</p>
            </div>
            <div className="p-3 bg-slate-900/50 rounded-lg">
              <div className="flex justify-center gap-1 mb-1">
                {Object.values(designSpec.colorScheme).slice(0, 3).map((color, i) => (
                  <div key={i} className="w-6 h-6 rounded" style={{ backgroundColor: color }} />
                ))}
              </div>
              <p className="text-xs text-slate-400">Colors</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPhaseContent = () => {
    switch (PHASES[currentPhase].id) {
      case 'setup': return renderSetupPhase();
      case 'chat': return renderChatPhase();
      case 'spec': return renderSpecPhase();
      case 'prompt': return renderPromptPhase();
      case 'deploy': return renderDeployPhase();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 p-6">
      <AudioReactiveBorder 
        enabled={audioEnabled} 
        borderWidth={4}
        sensitivity={1.8}
        className="max-w-4xl mx-auto rounded-2xl"
      >
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-800/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">
                Website Designer Vibe Session
              </h1>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-2 rounded-full transition-all ${
                  audioEnabled 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' 
                    : 'bg-slate-800 text-slate-400'
                }`}
                title={audioEnabled ? 'RGB Border: Dancing to Music 🎵' : 'RGB Border: Ambient Mode'}
              >
                <Music className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-400">
              Collaborate with AI to design and deploy your perfect website
            </p>
            {audioEnabled && (
              <p className="text-xs text-purple-400 mt-1 animate-pulse">
                ✨ RGB border dancing to your music ✨
              </p>
            )}
          </div>

          {/* Phase Navigation */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-xl">
              {PHASES.map((phase, idx) => {
                const Icon = phase.icon;
                const isActive = idx === currentPhase;
                const isComplete = idx < currentPhase;
                
                return (
                  <React.Fragment key={phase.id}>
                    <button
                      onClick={() => setCurrentPhase(idx)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        isActive
                          ? 'bg-purple-600 text-white'
                          : isComplete
                          ? 'bg-green-600/20 text-green-400'
                          : 'text-slate-400 hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm hidden md:inline">{phase.label}</span>
                    </button>
                    {idx < PHASES.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Phase Content */}
          <div className="mb-8">
            {renderPhaseContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              onClick={prevPhase}
              disabled={currentPhase === 0}
              variant="outline"
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button
              onClick={nextPhase}
              disabled={currentPhase === PHASES.length - 1}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </AudioReactiveBorder>
    </div>
  );
}


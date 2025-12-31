'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CreditCard, ArrowLeft, Download, Save, Palette, Type, Image,
  Layers, Grid3X3, AlignLeft, AlignCenter, AlignRight, Bold, Italic,
  Underline, Phone, Mail, Globe, MapPin, Linkedin, Twitter, Instagram,
  Github, Briefcase, User, Building2, Sparkles, Plus, Trash2, Move,
  RotateCw, Copy, Eye, Wand2, QrCode, Printer,
} from 'lucide-react';
import { DailyChallengeWidget, WalletDisplay } from '@/components/challenges/DailyChallengeWidget';

// ============================================================================
// BUSINESS CARD MAKER - Professional card design studio
// ============================================================================

interface BusinessCardData {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  github: string;
  tagline: string;
  logoUrl: string;
}

interface CardStyle {
  id: string;
  name: string;
  category: 'professional' | 'creative' | 'minimal' | 'bold' | 'elegant';
  frontBg: string;
  backBg: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  layout: 'left' | 'center' | 'right' | 'split';
  preview: string;
}

const CARD_TEMPLATES: CardStyle[] = [
  // Professional
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    category: 'professional',
    frontBg: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    backBg: '#ffffff',
    textColor: '#ffffff',
    accentColor: '#4da6ff',
    fontFamily: 'Arial, sans-serif',
    layout: 'left',
    preview: '🏢',
  },
  {
    id: 'executive-dark',
    name: 'Executive Dark',
    category: 'professional',
    frontBg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    backBg: '#0f0f23',
    textColor: '#ffffff',
    accentColor: '#e94560',
    fontFamily: 'Georgia, serif',
    layout: 'center',
    preview: '💼',
  },
  {
    id: 'law-firm',
    name: 'Law & Finance',
    category: 'professional',
    frontBg: '#1a1a1a',
    backBg: '#f5f5f5',
    textColor: '#d4af37',
    accentColor: '#d4af37',
    fontFamily: 'Times New Roman, serif',
    layout: 'left',
    preview: '⚖️',
  },
  // Creative
  {
    id: 'gradient-sunset',
    name: 'Sunset Gradient',
    category: 'creative',
    frontBg: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)',
    backBg: '#fff5f5',
    textColor: '#ffffff',
    accentColor: '#ffffff',
    fontFamily: 'Poppins, sans-serif',
    layout: 'center',
    preview: '🌅',
  },
  {
    id: 'neon-cyber',
    name: 'Neon Cyber',
    category: 'creative',
    frontBg: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    backBg: '#0f0c29',
    textColor: '#00ff88',
    accentColor: '#ff00ff',
    fontFamily: 'Courier New, monospace',
    layout: 'left',
    preview: '💜',
  },
  {
    id: 'artist-splash',
    name: 'Artist Splash',
    category: 'creative',
    frontBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    backBg: '#fff0f5',
    textColor: '#ffffff',
    accentColor: '#ffd700',
    fontFamily: 'Comic Sans MS, cursive',
    layout: 'right',
    preview: '🎨',
  },
  // Minimal
  {
    id: 'clean-white',
    name: 'Clean White',
    category: 'minimal',
    frontBg: '#ffffff',
    backBg: '#fafafa',
    textColor: '#333333',
    accentColor: '#000000',
    fontFamily: 'Helvetica, sans-serif',
    layout: 'left',
    preview: '⬜',
  },
  {
    id: 'simple-black',
    name: 'Simple Black',
    category: 'minimal',
    frontBg: '#000000',
    backBg: '#1a1a1a',
    textColor: '#ffffff',
    accentColor: '#ffffff',
    fontFamily: 'Helvetica, sans-serif',
    layout: 'center',
    preview: '⬛',
  },
  {
    id: 'soft-gray',
    name: 'Soft Gray',
    category: 'minimal',
    frontBg: '#f8f9fa',
    backBg: '#ffffff',
    textColor: '#495057',
    accentColor: '#6c757d',
    fontFamily: 'Roboto, sans-serif',
    layout: 'left',
    preview: '🔘',
  },
  // Bold
  {
    id: 'electric-blue',
    name: 'Electric Blue',
    category: 'bold',
    frontBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backBg: '#2d1b69',
    textColor: '#ffffff',
    accentColor: '#00d4ff',
    fontFamily: 'Impact, sans-serif',
    layout: 'center',
    preview: '⚡',
  },
  {
    id: 'fire-red',
    name: 'Fire Red',
    category: 'bold',
    frontBg: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
    backBg: '#1a0a00',
    textColor: '#ffffff',
    accentColor: '#ffff00',
    fontFamily: 'Arial Black, sans-serif',
    layout: 'right',
    preview: '🔥',
  },
  // Elegant
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    category: 'elegant',
    frontBg: 'linear-gradient(135deg, #f4e2d8 0%, #e8c4b8 100%)',
    backBg: '#fdf8f5',
    textColor: '#8b6f61',
    accentColor: '#d4a574',
    fontFamily: 'Playfair Display, serif',
    layout: 'center',
    preview: '🌹',
  },
  {
    id: 'midnight-gold',
    name: 'Midnight Gold',
    category: 'elegant',
    frontBg: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 100%)',
    backBg: '#0a0a0a',
    textColor: '#d4af37',
    accentColor: '#ffd700',
    fontFamily: 'Cinzel, serif',
    layout: 'center',
    preview: '✨',
  },
];

const INDUSTRIES = [
  { id: 'tech', name: 'Technology', icon: '💻' },
  { id: 'creative', name: 'Creative/Design', icon: '🎨' },
  { id: 'finance', name: 'Finance/Legal', icon: '💰' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'realestate', name: 'Real Estate', icon: '🏠' },
  { id: 'food', name: 'Food & Hospitality', icon: '🍽️' },
  { id: 'fitness', name: 'Fitness/Wellness', icon: '💪' },
  { id: 'music', name: 'Music/Entertainment', icon: '🎵' },
  { id: 'photography', name: 'Photography', icon: '📷' },
];

export default function BusinessCardMakerPage() {
  const [cardData, setCardData] = useState<BusinessCardData>({
    name: 'Alex Johnson',
    title: 'Senior Developer',
    company: 'TechCorp Inc.',
    email: 'alex@techcorp.com',
    phone: '+1 (555) 123-4567',
    website: 'www.alexjohnson.dev',
    address: 'San Francisco, CA',
    linkedin: 'alexjohnson',
    twitter: 'alexjdev',
    instagram: '',
    github: 'alexjohnson',
    tagline: 'Building the future, one line at a time',
    logoUrl: '',
  });

  const [selectedTemplate, setSelectedTemplate] = useState<CardStyle>(CARD_TEMPLATES[0]);
  const [showBack, setShowBack] = useState(false);
  const [showQR, setShowQR] = useState(true);
  const [customColors, setCustomColors] = useState({
    frontBg: '',
    textColor: '',
    accentColor: '',
  });

  const cardRef = useRef<HTMLDivElement>(null);

  const updateField = useCallback((field: keyof BusinessCardData, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  }, []);

  const exportCard = useCallback((format: 'png' | 'pdf' | 'svg') => {
    toast.success(`Exporting as ${format.toUpperCase()}...`);
    // Production would use html2canvas or similar
  }, []);

  const printCards = useCallback(() => {
    toast.success('Opening print dialog...');
    window.print();
  }, []);

  const generateAIDesign = useCallback((industry: string) => {
    const industryTemplates: Record<string, string> = {
      tech: 'neon-cyber',
      creative: 'artist-splash',
      finance: 'law-firm',
      healthcare: 'clean-white',
      education: 'corporate-blue',
      realestate: 'executive-dark',
      food: 'gradient-sunset',
      fitness: 'electric-blue',
      music: 'fire-red',
      photography: 'simple-black',
    };

    const templateId = industryTemplates[industry] || 'clean-white';
    const template = CARD_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      toast.success(`Applied ${template.name} template for ${industry}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/literature-zone" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Business Card Maker</h1>
                    <p className="text-sm text-slate-400">Design professional cards in minutes</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WalletDisplay userId="demo-user" />
              <Button variant="outline" size="sm" onClick={printCards}>
                <Printer className="w-4 h-4 mr-2" /> Print
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportCard('png')}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500">
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Form */}
          <div className="space-y-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-400" />
                  Personal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Full Name</label>
                  <Input
                    value={cardData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Job Title</label>
                  <Input
                    value={cardData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Company</label>
                  <Input
                    value={cardData.company}
                    onChange={(e) => updateField('company', e.target.value)}
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Tagline</label>
                  <Input
                    value={cardData.tagline}
                    onChange={(e) => updateField('tagline', e.target.value)}
                    placeholder="Your motto or specialty"
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-400" />
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      value={cardData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      value={cardData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      value={cardData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      value={cardData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-400" />
                  Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">LinkedIn</label>
                    <Input
                      value={cardData.linkedin}
                      onChange={(e) => updateField('linkedin', e.target.value)}
                      placeholder="username"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Twitter</label>
                    <Input
                      value={cardData.twitter}
                      onChange={(e) => updateField('twitter', e.target.value)}
                      placeholder="username"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">GitHub</label>
                    <Input
                      value={cardData.github}
                      onChange={(e) => updateField('github', e.target.value)}
                      placeholder="username"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Instagram</label>
                    <Input
                      value={cardData.instagram}
                      onChange={(e) => updateField('instagram', e.target.value)}
                      placeholder="username"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Preview</h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={!showBack ? 'default' : 'outline'}
                    onClick={() => setShowBack(false)}
                  >
                    Front
                  </Button>
                  <Button
                    size="sm"
                    variant={showBack ? 'default' : 'outline'}
                    onClick={() => setShowBack(true)}
                  >
                    Back
                  </Button>
                </div>
              </div>

              {/* Card Preview */}
              <div
                ref={cardRef}
                className="aspect-[1.75/1] rounded-xl shadow-2xl overflow-hidden transition-all duration-500 transform hover:scale-105"
                style={{
                  background: showBack ? selectedTemplate.backBg : selectedTemplate.frontBg,
                  fontFamily: selectedTemplate.fontFamily,
                }}
              >
                {!showBack ? (
                  // Front of card
                  <div className="h-full p-6 flex flex-col justify-between" style={{ color: selectedTemplate.textColor }}>
                    <div>
                      <h2 className="text-2xl font-bold">{cardData.name}</h2>
                      <p className="text-sm opacity-80">{cardData.title}</p>
                      <p className="text-sm font-medium" style={{ color: selectedTemplate.accentColor }}>
                        {cardData.company}
                      </p>
                    </div>
                    {cardData.tagline && (
                      <p className="text-xs italic opacity-70">"{cardData.tagline}"</p>
                    )}
                    <div className="space-y-1 text-xs">
                      {cardData.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" /> {cardData.email}
                        </div>
                      )}
                      {cardData.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" /> {cardData.phone}
                        </div>
                      )}
                      {cardData.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-3 h-3" /> {cardData.website}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Back of card
                  <div 
                    className="h-full p-6 flex flex-col items-center justify-center text-center"
                    style={{ 
                      color: selectedTemplate.textColor === '#ffffff' ? '#333333' : selectedTemplate.textColor 
                    }}
                  >
                    <div className="mb-4">
                      <Building2 className="w-12 h-12 mx-auto mb-2" style={{ color: selectedTemplate.accentColor }} />
                      <h3 className="text-xl font-bold">{cardData.company}</h3>
                    </div>
                    <div className="flex gap-4">
                      {cardData.linkedin && <Linkedin className="w-5 h-5" />}
                      {cardData.twitter && <Twitter className="w-5 h-5" />}
                      {cardData.github && <Github className="w-5 h-5" />}
                      {cardData.instagram && <Instagram className="w-5 h-5" />}
                    </div>
                    {showQR && (
                      <div className="mt-4 p-2 bg-white rounded">
                        <QrCode className="w-16 h-16 text-black" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="mt-6 space-y-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showQR}
                    onChange={(e) => setShowQR(e.target.checked)}
                    className="rounded"
                  />
                  Show QR Code on back
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => exportCard('png')}>
                    PNG
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportCard('pdf')}>
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportCard('svg')}>
                    SVG
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Templates */}
          <div className="space-y-6">
            {/* AI Suggestion */}
            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-400" />
                  AI Design Suggestion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 mb-4">
                  Select your industry and we'll suggest the perfect template:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {INDUSTRIES.map(industry => (
                    <button
                      key={industry.id}
                      onClick={() => generateAIDesign(industry.id)}
                      className="p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition text-left flex items-center gap-2"
                    >
                      <span>{industry.icon}</span>
                      <span className="text-xs">{industry.name}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Templates */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Palette className="w-5 h-5 text-emerald-400" />
                  Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="professional">
                  <TabsList className="grid grid-cols-3 mb-4 bg-slate-800">
                    <TabsTrigger value="professional" className="text-xs">Pro</TabsTrigger>
                    <TabsTrigger value="creative" className="text-xs">Creative</TabsTrigger>
                    <TabsTrigger value="minimal" className="text-xs">Minimal</TabsTrigger>
                  </TabsList>

                  {['professional', 'creative', 'minimal', 'bold', 'elegant'].map(category => (
                    <TabsContent key={category} value={category}>
                      <div className="grid grid-cols-2 gap-3">
                        {CARD_TEMPLATES.filter(t => t.category === category).map(template => (
                          <button
                            key={template.id}
                            onClick={() => setSelectedTemplate(template)}
                            className={`p-3 rounded-lg transition border-2 ${
                              selectedTemplate.id === template.id
                                ? 'border-emerald-500 bg-emerald-500/10'
                                : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                            }`}
                          >
                            <div
                              className="aspect-[1.75/1] rounded mb-2"
                              style={{ background: template.frontBg }}
                            />
                            <div className="flex items-center gap-1">
                              <span>{template.preview}</span>
                              <span className="text-xs">{template.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

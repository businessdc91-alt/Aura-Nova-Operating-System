'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen, Layers, Square, MessageCircle, Type, Image, Palette,
  Download, Save, Undo, Redo, ZoomIn, ZoomOut, Grid3X3, Layout,
  User, Users, Sparkles, ArrowLeft, ChevronRight, Plus, Trash2,
  Move, RotateCw, FlipHorizontal, FlipVertical, Settings, Eye,
  Wand2, PenTool, Circle, Triangle, Star, Heart, Zap, Cloud,
  Sun, Moon, Flame, Droplets, Wind, Mountain, TreeDeciduous,
} from 'lucide-react';
import { DailyChallengeWidget, WalletDisplay } from '@/components/challenges/DailyChallengeWidget';

// ============================================================================
// COMIC BOOK CREATOR - Full comic creation studio
// ============================================================================

interface Panel {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
  elements: PanelElement[];
}

interface PanelElement {
  id: string;
  type: 'speech-bubble' | 'thought-bubble' | 'narration' | 'sfx' | 'character' | 'prop' | 'background';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string;
  style: Record<string, string | number>;
}

interface ComicPage {
  id: string;
  panels: Panel[];
  backgroundColor: string;
  pageNumber: number;
}

interface ComicProject {
  id: string;
  title: string;
  author: string;
  pages: ComicPage[];
  style: ComicStyle;
  createdAt: Date;
  updatedAt: Date;
}

type ComicStyle = 'manga' | 'american' | 'european' | 'webcomic' | 'indie' | 'kids';

const COMIC_STYLES: { id: ComicStyle; name: string; description: string; preview: string }[] = [
  { id: 'manga', name: 'Manga', description: 'Japanese style with speed lines, dynamic panels', preview: '📖' },
  { id: 'american', name: 'American', description: 'Bold colors, classic superhero layouts', preview: '🦸' },
  { id: 'european', name: 'European (BD)', description: 'Detailed art, larger panels', preview: '🎨' },
  { id: 'webcomic', name: 'Webcomic', description: 'Vertical scrolling, modern style', preview: '📱' },
  { id: 'indie', name: 'Indie/Art', description: 'Experimental layouts, unique aesthetics', preview: '✨' },
  { id: 'kids', name: 'Kids/Fun', description: 'Bright colors, rounded shapes', preview: '🎈' },
];

const PANEL_LAYOUTS = [
  { id: 'single', name: 'Single Panel', grid: [[1]], icon: '⬜' },
  { id: 'two-horizontal', name: '2 Horizontal', grid: [[1, 1]], icon: '▫️▫️' },
  { id: 'two-vertical', name: '2 Vertical', grid: [[1], [1]], icon: '🔲' },
  { id: 'three-row', name: '3 Row', grid: [[1, 1, 1]], icon: '▫️▫️▫️' },
  { id: 'three-col', name: '3 Column', grid: [[1], [1], [1]], icon: '📊' },
  { id: 'four-grid', name: '4 Grid', grid: [[1, 1], [1, 1]], icon: '⊞' },
  { id: 'manga-action', name: 'Manga Action', grid: [[2, 1], [1, 1, 1]], icon: '💥' },
  { id: 'splash', name: 'Splash Page', grid: [[1]], icon: '🖼️' },
  { id: 'six-grid', name: '6 Grid', grid: [[1, 1], [1, 1], [1, 1]], icon: '▦' },
  { id: 'dynamic', name: 'Dynamic', grid: [[1, 2], [2, 1]], icon: '⚡' },
];

const SPEECH_BUBBLE_STYLES = [
  { id: 'normal', name: 'Normal', shape: 'ellipse', tail: 'pointed' },
  { id: 'thought', name: 'Thought', shape: 'cloud', tail: 'bubbles' },
  { id: 'shout', name: 'Shout', shape: 'burst', tail: 'pointed' },
  { id: 'whisper', name: 'Whisper', shape: 'dashed-ellipse', tail: 'pointed' },
  { id: 'narration', name: 'Narration', shape: 'rectangle', tail: 'none' },
  { id: 'robot', name: 'Robot/Digital', shape: 'hexagon', tail: 'zigzag' },
  { id: 'telepathy', name: 'Telepathy', shape: 'wavy', tail: 'waves' },
  { id: 'singing', name: 'Singing', shape: 'music-notes', tail: 'pointed' },
];

const SFX_PRESETS = [
  { text: 'BOOM!', style: 'explosive', color: '#ff4444' },
  { text: 'POW!', style: 'impact', color: '#ff8800' },
  { text: 'CRASH!', style: 'destructive', color: '#ff0000' },
  { text: 'WHOOSH!', style: 'speed', color: '#00aaff' },
  { text: 'ZAP!', style: 'electric', color: '#ffff00' },
  { text: 'SPLASH!', style: 'water', color: '#0088ff' },
  { text: 'THWACK!', style: 'hit', color: '#ff00ff' },
  { text: 'SIZZLE', style: 'heat', color: '#ff6600' },
  { text: '...', style: 'silence', color: '#888888' },
  { text: '?!', style: 'confusion', color: '#ffffff' },
  { text: '♪♫', style: 'music', color: '#ff88ff' },
  { text: 'SNIKT!', style: 'blade', color: '#cccccc' },
];

const CHARACTER_POSES = [
  { id: 'standing', name: 'Standing', emoji: '🧍' },
  { id: 'walking', name: 'Walking', emoji: '🚶' },
  { id: 'running', name: 'Running', emoji: '🏃' },
  { id: 'jumping', name: 'Jumping', emoji: '⬆️' },
  { id: 'sitting', name: 'Sitting', emoji: '🪑' },
  { id: 'fighting', name: 'Fighting', emoji: '🥊' },
  { id: 'flying', name: 'Flying', emoji: '🦸' },
  { id: 'falling', name: 'Falling', emoji: '⬇️' },
  { id: 'thinking', name: 'Thinking', emoji: '🤔' },
  { id: 'celebrating', name: 'Celebrating', emoji: '🎉' },
  { id: 'sad', name: 'Sad', emoji: '😢' },
  { id: 'angry', name: 'Angry', emoji: '😠' },
];

const BACKGROUND_PRESETS = [
  { id: 'city', name: 'City Skyline', emoji: '🏙️' },
  { id: 'space', name: 'Outer Space', emoji: '🌌' },
  { id: 'forest', name: 'Forest', emoji: '🌲' },
  { id: 'ocean', name: 'Ocean', emoji: '🌊' },
  { id: 'desert', name: 'Desert', emoji: '🏜️' },
  { id: 'mountain', name: 'Mountains', emoji: '🏔️' },
  { id: 'interior', name: 'Interior', emoji: '🏠' },
  { id: 'abstract', name: 'Abstract', emoji: '🎨' },
  { id: 'action-lines', name: 'Action Lines', emoji: '💨' },
  { id: 'gradient', name: 'Gradient', emoji: '🌈' },
];

export default function ComicCreatorPage() {
  const [project, setProject] = useState<ComicProject>({
    id: 'new-comic',
    title: 'My Comic',
    author: 'Creator',
    pages: [{
      id: 'page-1',
      panels: [],
      backgroundColor: '#ffffff',
      pageNumber: 1,
    }],
    style: 'american',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('panels');
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);

  const canvasRef = useRef<HTMLDivElement>(null);
  const currentPage = project.pages[currentPageIndex];

  // Add a new panel with layout
  const addPanelLayout = useCallback((layoutId: string) => {
    const layout = PANEL_LAYOUTS.find(l => l.id === layoutId);
    if (!layout) return;

    const canvasWidth = 800;
    const canvasHeight = 1100;
    const padding = 20;
    const gap = 10;

    const newPanels: Panel[] = [];
    let panelId = Date.now();

    const rows = layout.grid.length;
    const panelHeight = (canvasHeight - padding * 2 - gap * (rows - 1)) / rows;

    layout.grid.forEach((row, rowIndex) => {
      const cols = row.reduce((a, b) => a + b, 0);
      const panelWidth = (canvasWidth - padding * 2 - gap * (row.length - 1)) / cols;
      
      let xOffset = padding;
      row.forEach((span, colIndex) => {
        const width = panelWidth * span + (span > 1 ? gap * (span - 1) : 0);
        newPanels.push({
          id: `panel-${panelId++}`,
          x: xOffset,
          y: padding + rowIndex * (panelHeight + gap),
          width,
          height: panelHeight,
          backgroundColor: '#ffffff',
          borderWidth: 2,
          borderColor: '#000000',
          elements: [],
        });
        xOffset += width + gap;
      });
    });

    setProject(prev => ({
      ...prev,
      pages: prev.pages.map((page, idx) => 
        idx === currentPageIndex 
          ? { ...page, panels: [...page.panels, ...newPanels] }
          : page
      ),
      updatedAt: new Date(),
    }));

    toast.success(`Added ${newPanels.length} panel(s)`);
  }, [currentPageIndex]);

  // Add element to selected panel
  const addElement = useCallback((type: PanelElement['type'], preset?: any) => {
    if (!selectedPanel) {
      toast.error('Select a panel first');
      return;
    }

    const element: PanelElement = {
      id: `element-${Date.now()}`,
      type,
      x: 50,
      y: 50,
      width: type === 'speech-bubble' ? 150 : type === 'sfx' ? 100 : 80,
      height: type === 'speech-bubble' ? 80 : type === 'sfx' ? 60 : 120,
      rotation: 0,
      content: preset?.text || (type === 'speech-bubble' ? 'Hello!' : ''),
      style: preset?.style ? { preset: preset.style, color: preset.color } : {},
    };

    setProject(prev => ({
      ...prev,
      pages: prev.pages.map((page, idx) => 
        idx === currentPageIndex 
          ? {
              ...page,
              panels: page.panels.map(panel =>
                panel.id === selectedPanel
                  ? { ...panel, elements: [...panel.elements, element] }
                  : panel
              ),
            }
          : page
      ),
      updatedAt: new Date(),
    }));

    setSelectedElement(element.id);
    toast.success(`Added ${type}`);
  }, [selectedPanel, currentPageIndex]);

  // Add new page
  const addPage = useCallback(() => {
    const newPage: ComicPage = {
      id: `page-${Date.now()}`,
      panels: [],
      backgroundColor: '#ffffff',
      pageNumber: project.pages.length + 1,
    };

    setProject(prev => ({
      ...prev,
      pages: [...prev.pages, newPage],
      updatedAt: new Date(),
    }));

    setCurrentPageIndex(project.pages.length);
    toast.success('New page added');
  }, [project.pages.length]);

  // Export comic
  const exportComic = useCallback((format: 'pdf' | 'png' | 'cbz') => {
    toast.success(`Exporting as ${format.toUpperCase()}...`);
    // In production, this would generate actual files
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-900 via-orange-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/literature-zone" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Comic Book Creator</h1>
                    <p className="text-sm text-slate-400">Create comics, manga, and graphic novels</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WalletDisplay userId="demo-user" />
              <Button variant="outline" size="sm" onClick={() => exportComic('pdf')}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-rose-500 to-orange-500">
                <Save className="w-4 h-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Panel - Tools */}
        <div className="w-80 bg-slate-900 border-r border-slate-800 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-slate-800 p-1 grid grid-cols-4">
              <TabsTrigger value="panels" className="text-xs">Panels</TabsTrigger>
              <TabsTrigger value="bubbles" className="text-xs">Bubbles</TabsTrigger>
              <TabsTrigger value="sfx" className="text-xs">SFX</TabsTrigger>
              <TabsTrigger value="assets" className="text-xs">Assets</TabsTrigger>
            </TabsList>

            <TabsContent value="panels" className="p-4">
              <h3 className="font-semibold mb-3 text-sm">Panel Layouts</h3>
              <div className="grid grid-cols-2 gap-2">
                {PANEL_LAYOUTS.map(layout => (
                  <button
                    key={layout.id}
                    onClick={() => addPanelLayout(layout.id)}
                    className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition text-center"
                  >
                    <span className="text-2xl block mb-1">{layout.icon}</span>
                    <span className="text-xs text-slate-400">{layout.name}</span>
                  </button>
                ))}
              </div>

              <h3 className="font-semibold mt-6 mb-3 text-sm">Comic Style</h3>
              <div className="space-y-2">
                {COMIC_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setProject(prev => ({ ...prev, style: style.id }))}
                    className={`w-full p-3 rounded-lg text-left transition flex items-center gap-3
                      ${project.style === style.id 
                        ? 'bg-rose-600/30 border border-rose-500' 
                        : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                  >
                    <span className="text-xl">{style.preview}</span>
                    <div>
                      <div className="font-medium text-sm">{style.name}</div>
                      <div className="text-xs text-slate-400">{style.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bubbles" className="p-4">
              <h3 className="font-semibold mb-3 text-sm">Speech Bubbles</h3>
              <div className="grid grid-cols-2 gap-2">
                {SPEECH_BUBBLE_STYLES.map(bubble => (
                  <button
                    key={bubble.id}
                    onClick={() => addElement('speech-bubble', bubble)}
                    className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition"
                  >
                    <MessageCircle className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-xs text-slate-400 block">{bubble.name}</span>
                  </button>
                ))}
              </div>

              <h3 className="font-semibold mt-6 mb-3 text-sm">Quick Add</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => addElement('narration')}
                >
                  <Square className="w-4 h-4 mr-2" /> Narration Box
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => addElement('thought-bubble')}
                >
                  <Cloud className="w-4 h-4 mr-2" /> Thought Bubble
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="sfx" className="p-4">
              <h3 className="font-semibold mb-3 text-sm">Sound Effects</h3>
              <div className="grid grid-cols-2 gap-2">
                {SFX_PRESETS.map((sfx, idx) => (
                  <button
                    key={idx}
                    onClick={() => addElement('sfx', sfx)}
                    className="p-3 rounded-lg hover:scale-105 transition font-bold text-lg"
                    style={{ 
                      backgroundColor: sfx.color + '30',
                      color: sfx.color,
                      border: `2px solid ${sfx.color}50`,
                    }}
                  >
                    {sfx.text}
                  </button>
                ))}
              </div>

              <h3 className="font-semibold mt-6 mb-3 text-sm">Custom SFX</h3>
              <div className="flex gap-2">
                <Input placeholder="Enter text..." className="bg-slate-800 border-slate-700" />
                <Button size="sm" onClick={() => addElement('sfx', { text: 'CUSTOM!', color: '#ffffff' })}>
                  Add
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="assets" className="p-4">
              <h3 className="font-semibold mb-3 text-sm">Character Poses</h3>
              <div className="grid grid-cols-3 gap-2">
                {CHARACTER_POSES.map(pose => (
                  <button
                    key={pose.id}
                    onClick={() => addElement('character', pose)}
                    className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition text-center"
                  >
                    <span className="text-xl block">{pose.emoji}</span>
                    <span className="text-xs text-slate-400">{pose.name}</span>
                  </button>
                ))}
              </div>

              <h3 className="font-semibold mt-6 mb-3 text-sm">Backgrounds</h3>
              <div className="grid grid-cols-2 gap-2">
                {BACKGROUND_PRESETS.map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => addElement('background', bg)}
                    className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition text-center"
                  >
                    <span className="text-xl block">{bg.emoji}</span>
                    <span className="text-xs text-slate-400">{bg.name}</span>
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-slate-800 overflow-auto flex items-center justify-center p-8">
          <div
            ref={canvasRef}
            className="bg-white rounded-lg shadow-2xl relative"
            style={{
              width: 800 * (zoom / 100),
              height: 1100 * (zoom / 100),
              backgroundImage: showGrid ? 'linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)' : 'none',
              backgroundSize: '20px 20px',
            }}
          >
            {/* Render panels */}
            {currentPage.panels.map(panel => (
              <div
                key={panel.id}
                onClick={() => setSelectedPanel(panel.id)}
                className={`absolute cursor-pointer transition-all ${
                  selectedPanel === panel.id ? 'ring-2 ring-rose-500' : ''
                }`}
                style={{
                  left: panel.x * (zoom / 100),
                  top: panel.y * (zoom / 100),
                  width: panel.width * (zoom / 100),
                  height: panel.height * (zoom / 100),
                  backgroundColor: panel.backgroundColor,
                  border: `${panel.borderWidth}px solid ${panel.borderColor}`,
                }}
              >
                {/* Render elements inside panel */}
                {panel.elements.map(element => (
                  <div
                    key={element.id}
                    onClick={(e) => { e.stopPropagation(); setSelectedElement(element.id); }}
                    className={`absolute ${selectedElement === element.id ? 'ring-2 ring-blue-500' : ''}`}
                    style={{
                      left: element.x * (zoom / 100),
                      top: element.y * (zoom / 100),
                      transform: `rotate(${element.rotation}deg)`,
                    }}
                  >
                    {element.type === 'speech-bubble' && (
                      <div className="bg-white border-2 border-black rounded-full px-4 py-2 text-black text-sm">
                        {element.content}
                      </div>
                    )}
                    {element.type === 'sfx' && (
                      <div 
                        className="font-bold text-2xl"
                        style={{ color: (element.style.color as string) || '#ff0000' }}
                      >
                        {element.content}
                      </div>
                    )}
                    {element.type === 'character' && (
                      <div className="text-6xl">{element.content}</div>
                    )}
                  </div>
                ))}
              </div>
            ))}

            {/* Empty state */}
            {currentPage.panels.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <Layers className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select a panel layout to start</p>
                  <p className="text-sm">Choose from the Panels tab on the left</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Pages & Properties */}
        <div className="w-64 bg-slate-900 border-l border-slate-800 overflow-y-auto">
          {/* Page Navigator */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Pages</h3>
              <Button size="sm" variant="ghost" onClick={addPage}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {project.pages.map((page, idx) => (
                <button
                  key={page.id}
                  onClick={() => setCurrentPageIndex(idx)}
                  className={`aspect-[3/4] rounded border-2 transition flex items-center justify-center text-xs
                    ${currentPageIndex === idx 
                      ? 'border-rose-500 bg-rose-500/20' 
                      : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                >
                  {page.pageNumber}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-semibold text-sm mb-3">View</h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.max(25, z - 25))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm flex-1 text-center">{zoom}%</span>
              <Button size="sm" variant="outline" onClick={() => setZoom(z => Math.min(200, z + 25))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            <label className="flex items-center gap-2 mt-3 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                checked={showGrid} 
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded"
              />
              Show Grid
            </label>
          </div>

          {/* Properties */}
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-3">Properties</h3>
            {selectedPanel ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400">Background</label>
                  <input 
                    type="color" 
                    className="w-full h-8 rounded cursor-pointer"
                    defaultValue="#ffffff"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400">Border</label>
                  <div className="flex gap-2">
                    <Input type="number" defaultValue="2" className="w-16 bg-slate-800 border-slate-700" />
                    <input type="color" defaultValue="#000000" className="h-9 rounded cursor-pointer" />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full text-red-400 border-red-400/30">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Panel
                </Button>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Select a panel to edit properties</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

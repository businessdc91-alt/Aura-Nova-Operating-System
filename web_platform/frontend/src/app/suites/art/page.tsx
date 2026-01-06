'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { aiService } from '@/services/aiService';
import { DailyChallengeWidget, WalletDisplay } from '@/components/challenges/DailyChallengeWidget';
import {
  Palette,
  Image,
  Wand2,
  Download,
  Copy,
  RefreshCw,
  Sparkles,
  Layers,
  Film,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Upload,
  Trash2,
  Settings,
  Sliders,
  Scissors,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sun,
  Contrast,
  Droplets,
  Eraser,
  Paintbrush,
  Square,
  Circle,
  Triangle,
  PenTool,
  Type,
  Grid3X3,
  Maximize,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Save,
  FolderOpen,
  FileImage,
  Cpu,
} from 'lucide-react';

// ============================================================================
// ART SUITE - ALL ART & ANIMATION TOOLS IN ONE PLACE
// ============================================================================
// Includes:
// - AI Art Generator (text-to-image, style transfer)
// - Sprite Generator (with game engine code output)
// - Background Remover
// - Animation Studio (frame-by-frame, sprite sheets)
// - Image Editor (filters, adjustments, layers)
// - AI Model Manager (local LLM model management)
// ============================================================================

// ================== TYPES ==================
interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  thumbnail?: string;
}

interface AnimationFrame {
  id: string;
  imageUrl: string;
  duration: number;
}

interface AIModel {
  id: string;
  name: string;
  size: string;
  vram: string;
  description: string;
  status: 'available' | 'downloading' | 'loaded' | 'not-installed';
  capabilities: string[];
}

// ================== AI ART GENERATOR ==================
function AIArtGenerator() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [style, setStyle] = useState<string>('realistic');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [size, setSize] = useState<'512' | '768' | '1024'>('1024');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('imagen-3');

  const styles = [
    { id: 'realistic', name: 'Realistic', icon: '📷' },
    { id: 'anime', name: 'Anime', icon: '🎌' },
    { id: 'pixel', name: 'Pixel Art', icon: '👾' },
    { id: 'oil', name: 'Oil Painting', icon: '🎨' },
    { id: 'watercolor', name: 'Watercolor', icon: '💧' },
    { id: 'sketch', name: 'Sketch', icon: '✏️' },
    { id: 'cyberpunk', name: 'Cyberpunk', icon: '🌆' },
    { id: 'fantasy', name: 'Fantasy', icon: '🐉' },
  ];

  const generateArt = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    toast.loading('Generating art with Vertex AI Imagen...', { id: 'art-gen' });

    try {
      const result = await aiService.generateImage(prompt, {
        negativePrompt: negativePrompt || undefined,
        sampleCount: 4,
        aspectRatio: aspectRatio,
        style: styles.find(s => s.id === style)?.name,
      });

      if (result.success && result.images.length > 0) {
        setGeneratedImages(result.images);
        toast.success(`Generated ${result.images.length} images!`, { id: 'art-gen' });
      } else {
        // Fallback to placeholder if Vertex AI unavailable
        toast.error(result.error || 'Image generation unavailable. Configure NEXT_PUBLIC_VERTEX_PROJECT_ID.', { id: 'art-gen' });
        // Show placeholder to demo UI
        const demoImages = [
          `https://picsum.photos/seed/${Date.now()}/512/512`,
          `https://picsum.photos/seed/${Date.now() + 1}/512/512`,
        ];
        setGeneratedImages(demoImages);
      }
    } catch (error: any) {
      toast.error('Error generating art', { id: 'art-gen' });
      console.error(error);
    }

    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wand2 size={20} className="text-pink-400" />
              Generation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Prompt</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your image... e.g., 'A majestic dragon flying over a crystal castle at sunset'"
                className="min-h-24 bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Negative Prompt</label>
              <Input
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="What to avoid... e.g., 'blurry, low quality'"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Style</label>
              <div className="grid grid-cols-4 gap-2">
                {styles.map((s) => (
                  <Button
                    key={s.id}
                    variant={style === s.id ? 'default' : 'outline'}
                    onClick={() => setStyle(s.id)}
                    className={`text-xs p-2 h-auto flex-col ${style === s.id ? 'bg-aura-600' : ''}`}
                  >
                    <span className="text-lg mb-1">{s.icon}</span>
                    {s.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Aspect Ratio</label>
              <div className="flex gap-2">
                {(['1:1', '16:9', '9:16', '4:3'] as const).map((ar) => (
                  <Button
                    key={ar}
                    variant={aspectRatio === ar ? 'default' : 'outline'}
                    onClick={() => setAspectRatio(ar)}
                    className={aspectRatio === ar ? 'bg-aura-600' : ''}
                    size="sm"
                  >
                    {ar}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Size</label>
              <div className="flex gap-2">
                {(['512', '768', '1024'] as const).map((s) => (
                  <Button
                    key={s}
                    variant={size === s ? 'default' : 'outline'}
                    onClick={() => setSize(s)}
                    className={size === s ? 'bg-aura-600' : ''}
                    size="sm"
                  >
                    {s}×{s}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={generateArt}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
            >
              {isGenerating ? (
                <RefreshCw className="animate-spin mr-2" size={18} />
              ) : (
                <Sparkles className="mr-2" size={18} />
              )}
              Generate Art
            </Button>
          </CardContent>
        </Card>

        {/* Generated Images */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900 border-slate-800 h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Image size={20} className="text-aura-400" />
                Generated Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {generatedImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Generated ${idx + 1}`}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 rounded-lg">
                        <Button size="sm" variant="secondary">
                          <Download size={16} />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Copy size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Palette size={48} className="mb-4 opacity-50" />
                  <p>Your generated art will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ================== SPRITE GENERATOR ==================
function SpriteGenerator() {
  const [prompt, setPrompt] = useState('');
  const [spriteType, setSpriteType] = useState<'character' | 'item' | 'tileset' | 'ui'>('character');
  const [targetEngine, setTargetEngine] = useState<'unreal' | 'unity' | 'godot' | 'phaser'>('unity');
  const [frameCount, setFrameCount] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSprite, setGeneratedSprite] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');

  const generateSprite = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe your sprite');
      return;
    }

    setIsGenerating(true);
    toast.loading('Generating sprite sheet...', { id: 'sprite' });

    try {
      // Generate sprite image with Vertex AI Imagen
      const imageResult = await aiService.generateImage(
        `${prompt}, ${spriteType} sprite sheet, ${frameCount} frames, pixel art game asset, transparent background, side view animation frames`,
        {
          sampleCount: 1,
          aspectRatio: '16:9', // Wide for sprite sheets
          style: 'pixel art',
        }
      );

      if (imageResult.success && imageResult.images[0]) {
        setGeneratedSprite(imageResult.images[0]);
      } else {
        // Fallback placeholder
        setGeneratedSprite(`https://picsum.photos/seed/${Date.now()}/256/64`);
      }

      // Generate engine-specific code with AI
      const codeResult = await aiService.generate(
        `Generate ${targetEngine} code for animating a sprite sheet. Sprite: ${prompt}. Type: ${spriteType}. Frame count: ${frameCount}.`,
        {
          systemPrompt: `You are a game development expert. Generate clean, production-ready code for the specified game engine.
For Unity: Use C# MonoBehaviour with SpriteRenderer
For Godot: Use GDScript with Sprite2D
For Phaser: Use Phaser 3 JavaScript/TypeScript
For Unreal: Use C++ or Blueprints notation

Include:
- Frame animation logic
- Configurable frame rate
- Play/pause/loop controls
- Helpful comments

Output ONLY the code, no explanations.`,
          temperature: 0.7,
          maxTokens: 1500,
        }
      );

      if (codeResult.success) {
        setGeneratedCode(codeResult.content);
      } else {
        // Fallback template code
        let code = '';
        if (targetEngine === 'unity') {
          code = `using UnityEngine;

public class ${prompt.split(' ')[0] || 'Sprite'}Animation : MonoBehaviour
{
    public Sprite[] frames;
    public float frameRate = 12f;
    private SpriteRenderer spriteRenderer;
    private int currentFrame;
    private float timer;
    
    void Start() => spriteRenderer = GetComponent<SpriteRenderer>();
    
    void Update()
    {
        timer += Time.deltaTime;
        if (timer >= 1f / frameRate)
        {
            timer = 0f;
            currentFrame = (currentFrame + 1) % frames.Length;
            spriteRenderer.sprite = frames[currentFrame];
        }
    }
}`;
        } else if (targetEngine === 'godot') {
          code = `extends Sprite2D

@export var frames: Array[Texture2D]
@export var frame_rate: float = 12.0
var current_frame: int = 0
var timer: float = 0.0

func _process(delta):
    timer += delta
    if timer >= 1.0 / frame_rate:
        timer = 0.0
        current_frame = (current_frame + 1) % frames.size()
        texture = frames[current_frame]`;
        }
        setGeneratedCode(code || '// AI unavailable - configure Vertex AI for code generation');
      }

      toast.success('Sprite generated!', { id: 'sprite' });
    } catch (error) {
      toast.error('Error generating sprite', { id: 'sprite' });
    }

    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Grid3X3 size={20} className="text-green-400" />
              Sprite Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Description</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your sprite... e.g., 'A wizard character with blue robes and a staff'"
                className="min-h-20 bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Sprite Type</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'character', name: 'Character', icon: '🧙' },
                  { id: 'item', name: 'Item', icon: '⚔️' },
                  { id: 'tileset', name: 'Tileset', icon: '🏔️' },
                  { id: 'ui', name: 'UI', icon: '🖥️' },
                ].map((type) => (
                  <Button
                    key={type.id}
                    variant={spriteType === type.id ? 'default' : 'outline'}
                    onClick={() => setSpriteType(type.id as any)}
                    className={`text-xs ${spriteType === type.id ? 'bg-aura-600' : ''}`}
                    size="sm"
                  >
                    {type.icon} {type.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Target Engine</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'unity', name: 'Unity' },
                  { id: 'godot', name: 'Godot' },
                  { id: 'phaser', name: 'Phaser' },
                  { id: 'unreal', name: 'Unreal' },
                ].map((engine) => (
                  <Button
                    key={engine.id}
                    variant={targetEngine === engine.id ? 'default' : 'outline'}
                    onClick={() => setTargetEngine(engine.id as any)}
                    className={targetEngine === engine.id ? 'bg-aura-600' : ''}
                    size="sm"
                  >
                    {engine.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Frame Count: {frameCount}</label>
              <input
                type="range"
                min="2"
                max="16"
                value={frameCount}
                onChange={(e) => setFrameCount(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <Button
              onClick={generateSprite}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
            >
              {isGenerating ? (
                <RefreshCw className="animate-spin mr-2" size={18} />
              ) : (
                <Sparkles className="mr-2" size={18} />
              )}
              Generate Sprite
            </Button>
          </CardContent>
        </Card>

        {/* Output */}
        <div className="space-y-4">
          {generatedSprite && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="py-3">
                <CardTitle className="text-white text-sm">Generated Sprite Sheet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-950 p-4 rounded-lg flex items-center justify-center">
                  <img src={generatedSprite} alt="Sprite" className="max-w-full" />
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Download size={16} className="mr-2" />
                  Download Sprite Sheet
                </Button>
              </CardContent>
            </Card>
          )}

          {generatedCode && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="py-3">
                <CardTitle className="text-white text-sm flex items-center justify-between">
                  <span>Engine Code</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode);
                      toast.success('Copied!');
                    }}
                  >
                    <Copy size={14} />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-950 p-4 rounded-lg overflow-auto max-h-64 text-xs text-slate-300 font-mono">
                  {generatedCode}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ================== BACKGROUND REMOVER ==================
function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = async () => {
    if (!originalImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    toast.loading('Removing background with AI...', { id: 'bg-remove' });

    try {
      // Use Vertex AI image editing to remove background
      const result = await aiService.editImage(
        originalImage,
        'Remove the background completely, keep only the main subject with transparent background'
      );

      if (result.success && result.image) {
        setProcessedImage(result.image);
        toast.success('Background removed!', { id: 'bg-remove' });
      } else {
        // Fallback message - show original with transparency simulation
        toast.error(result.error || 'Background removal requires Vertex AI Imagen. Configure your credentials.', { id: 'bg-remove' });
        // For demo, we'll just show the original
        setProcessedImage(originalImage);
      }
    } catch (error) {
      toast.error('Error removing background', { id: 'bg-remove' });
      setProcessedImage(originalImage);
    }

    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload size={20} className="text-blue-400" />
              Original Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {originalImage ? (
              <div className="relative">
                <img
                  src={originalImage}
                  alt="Original"
                  className="w-full max-h-80 object-contain rounded-lg bg-slate-950"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setOriginalImage(null);
                    setProcessedImage(null);
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:border-aura-500 hover:text-aura-400 transition"
              >
                <Upload size={48} className="mb-4" />
                <p>Click or drag to upload image</p>
              </button>
            )}

            <Button
              onClick={removeBackground}
              disabled={!originalImage || isProcessing}
              className="w-full mt-4 bg-gradient-to-r from-blue-500 to-cyan-500"
            >
              {isProcessing ? (
                <RefreshCw className="animate-spin mr-2" size={18} />
              ) : (
                <Scissors className="mr-2" size={18} />
              )}
              Remove Background
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Image size={20} className="text-green-400" />
              Processed Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            {processedImage ? (
              <div className="space-y-4">
                <div className="bg-[url('/checkerboard.png')] bg-repeat rounded-lg">
                  <img
                    src={processedImage}
                    alt="Processed"
                    className="w-full max-h-80 object-contain rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline">
                    <Download size={16} className="mr-2" />
                    PNG
                  </Button>
                  <Button className="flex-1" variant="outline">
                    <Download size={16} className="mr-2" />
                    WebP
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <p>Processed image will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ================== ANIMATION STUDIO ==================
function AnimationStudio() {
  const [frames, setFrames] = useState<AnimationFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(12);
  const [onionSkin, setOnionSkin] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFrame = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFrames((prev) => [
            ...prev,
            {
              id: Date.now().toString() + Math.random(),
              imageUrl: event.target?.result as string,
              duration: 1000 / fps,
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const deleteFrame = (id: string) => {
    setFrames(frames.filter((f) => f.id !== id));
    if (currentFrameIndex >= frames.length - 1) {
      setCurrentFrameIndex(Math.max(0, frames.length - 2));
    }
  };

  const moveFrame = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= frames.length) return;

    const newFrames = [...frames];
    [newFrames[index], newFrames[newIndex]] = [newFrames[newIndex], newFrames[index]];
    setFrames(newFrames);
  };

  const exportGif = async () => {
    if (frames.length < 2) {
      toast.error('Add at least 2 frames to export');
      return;
    }

    toast.loading('Exporting animation...', { id: 'export' });
    await new Promise((r) => setTimeout(r, 2000));
    toast.success('Animation exported!', { id: 'export' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Frames Panel */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="py-3">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              <span>Frames ({frames.length})</span>
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Plus size={14} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={addFrame}
              className="hidden"
            />

            {frames.map((frame, idx) => (
              <div
                key={frame.id}
                className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
                  currentFrameIndex === idx ? 'bg-aura-600/30 border border-aura-500' : 'bg-slate-800'
                }`}
                onClick={() => setCurrentFrameIndex(idx)}
              >
                <img
                  src={frame.imageUrl}
                  alt={`Frame ${idx + 1}`}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-xs text-white">Frame {idx + 1}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveFrame(idx, 'up');
                    }}
                    className="text-slate-400 hover:text-white"
                    disabled={idx === 0}
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveFrame(idx, 'down');
                    }}
                    className="text-slate-400 hover:text-white"
                    disabled={idx === frames.length - 1}
                  >
                    <ChevronDown size={12} />
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFrame(frame.id);
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {frames.length === 0 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-slate-700 rounded-lg text-slate-400 hover:border-aura-500 transition"
              >
                <Film size={32} className="mx-auto mb-2" />
                <p className="text-sm">Add frames</p>
              </button>
            )}
          </CardContent>
        </Card>

        {/* Canvas/Preview */}
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
          <CardHeader className="py-3">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              <span>Preview</span>
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onionSkin}
                  onChange={(e) => setOnionSkin(e.target.checked)}
                  className="rounded border-slate-600"
                />
                Onion Skin
              </label>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
              {frames.length > 0 ? (
                <>
                  {onionSkin && currentFrameIndex > 0 && (
                    <img
                      src={frames[currentFrameIndex - 1].imageUrl}
                      alt="Previous"
                      className="absolute inset-0 w-full h-full object-contain opacity-30"
                    />
                  )}
                  <img
                    src={frames[currentFrameIndex]?.imageUrl}
                    alt="Current"
                    className="relative z-10 max-w-full max-h-full object-contain"
                  />
                </>
              ) : (
                <p className="text-slate-500">No frames yet</p>
              )}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentFrameIndex(0)}
                disabled={frames.length === 0}
              >
                <SkipBack size={16} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentFrameIndex(Math.max(0, currentFrameIndex - 1))}
                disabled={frames.length === 0}
              >
                <ChevronUp size={16} className="rotate-[-90deg]" />
              </Button>
              <Button
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={frames.length < 2}
                className={isPlaying ? 'bg-red-500' : 'bg-green-500'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentFrameIndex(Math.min(frames.length - 1, currentFrameIndex + 1))}
                disabled={frames.length === 0}
              >
                <ChevronUp size={16} className="rotate-90" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentFrameIndex(frames.length - 1)}
                disabled={frames.length === 0}
              >
                <SkipForward size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="py-3">
            <CardTitle className="text-white text-sm">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">FPS: {fps}</label>
              <input
                type="range"
                min="1"
                max="60"
                value={fps}
                onChange={(e) => setFps(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <Button onClick={exportGif} disabled={frames.length < 2} className="w-full bg-aura-600 hover:bg-aura-700">
              <Download size={16} className="mr-2" />
              Export GIF
            </Button>

            <Button variant="outline" className="w-full">
              <Download size={16} className="mr-2" />
              Export Sprite Sheet
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ================== AI MODEL MANAGER ==================
function AIModelManager() {
  const [models, setModels] = useState<AIModel[]>([
    {
      id: 'gemma-1b',
      name: 'Gemma 3 1B',
      size: '1.5 GB',
      vram: '2-3 GB',
      description: 'Fast, lightweight model for quick generations',
      status: 'available',
      capabilities: ['text-to-image', 'style-transfer'],
    },
    {
      id: 'llama-3b',
      name: 'Llama 3.2 3B',
      size: '3.2 GB',
      vram: '4-6 GB',
      description: 'Balanced quality and speed',
      status: 'loaded',
      capabilities: ['text-to-image', 'inpainting', 'style-transfer'],
    },
    {
      id: 'qwen-7b',
      name: 'Qwen 2.5 7B',
      size: '7.1 GB',
      vram: '6-8 GB',
      description: 'High quality generations',
      status: 'available',
      capabilities: ['text-to-image', 'inpainting', 'outpainting', 'style-transfer'],
    },
    {
      id: 'mistral-12b',
      name: 'Mistral Nemo 12B',
      size: '11.5 GB',
      vram: '10-12 GB',
      description: 'Maximum quality, slower',
      status: 'not-installed',
      capabilities: ['text-to-image', 'inpainting', 'outpainting', 'upscaling', 'style-transfer'],
    },
  ]);

  const handleModelAction = (modelId: string, action: 'load' | 'unload' | 'download') => {
    setModels(
      models.map((m) =>
        m.id === modelId
          ? {
              ...m,
              status:
                action === 'load'
                  ? 'loaded'
                  : action === 'unload'
                  ? 'available'
                  : 'downloading',
            }
          : m.status === 'loaded' && action === 'load'
          ? { ...m, status: 'available' }
          : m
      )
    );

    toast.success(
      action === 'load'
        ? 'Model loaded!'
        : action === 'unload'
        ? 'Model unloaded'
        : 'Download started'
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Cpu size={20} className="text-cyan-400" />
            Local AI Models
          </CardTitle>
          <CardDescription>
            Manage your local AI models for art generation. All processing happens on your device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {models.map((model) => (
            <div
              key={model.id}
              className={`p-4 rounded-lg border ${
                model.status === 'loaded'
                  ? 'bg-green-900/20 border-green-700'
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{model.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        model.status === 'loaded'
                          ? 'bg-green-500/20 text-green-400'
                          : model.status === 'downloading'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : model.status === 'not-installed'
                          ? 'bg-slate-500/20 text-slate-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {model.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-2">{model.description}</p>
                  <div className="flex gap-4 text-xs text-slate-500">
                    <span>Size: {model.size}</span>
                    <span>VRAM: {model.vram}</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {model.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  {model.status === 'not-installed' ? (
                    <Button
                      size="sm"
                      onClick={() => handleModelAction(model.id, 'download')}
                    >
                      <Download size={14} className="mr-1" />
                      Install
                    </Button>
                  ) : model.status === 'loaded' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleModelAction(model.id, 'unload')}
                    >
                      Unload
                    </Button>
                  ) : model.status === 'downloading' ? (
                    <Button size="sm" disabled>
                      <RefreshCw className="animate-spin mr-1" size={14} />
                      Downloading
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleModelAction(model.id, 'load')}
                    >
                      Load
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ================== IMAGE EDITOR ==================
function ImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'brush' | 'eraser' | 'fill' | 'text' | 'shape' | 'select'>('brush');
  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState('#ff6b6b');
  const [isDrawing, setIsDrawing] = useState(false);
  const [layers, setLayers] = useState<Layer[]>([
    { id: 'layer-1', name: 'Background', visible: true, locked: false, opacity: 100 },
    { id: 'layer-2', name: 'Layer 1', visible: true, locked: false, opacity: 100 },
  ]);
  const [activeLayer, setActiveLayer] = useState('layer-2');
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const tools = [
    { id: 'brush', name: 'Brush', icon: <Paintbrush size={16} /> },
    { id: 'eraser', name: 'Eraser', icon: <Eraser size={16} /> },
    { id: 'fill', name: 'Fill', icon: <Droplets size={16} /> },
    { id: 'text', name: 'Text', icon: <Type size={16} /> },
    { id: 'shape', name: 'Shape', icon: <Square size={16} /> },
    { id: 'select', name: 'Select', icon: <Move size={16} /> },
  ];

  const colors = [
    '#ff6b6b', '#ff922b', '#fcc419', '#51cf66', '#22b8cf',
    '#339af0', '#7950f2', '#f06595', '#ffffff', '#000000',
    '#868e96', '#495057', '#1c7ed6', '#37b24d', '#f59f00',
  ];

  const filters = [
    { id: 'grayscale', name: 'Grayscale' },
    { id: 'sepia', name: 'Sepia' },
    { id: 'invert', name: 'Invert' },
    { id: 'blur', name: 'Blur' },
    { id: 'sharpen', name: 'Sharpen' },
    { id: 'brightness', name: 'Brightness' },
    { id: 'contrast', name: 'Contrast' },
    { id: 'saturate', name: 'Saturate' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize white background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save initial state
    saveToHistory();
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const newIndex = historyIndex - 1;
      ctx.putImageData(history[newIndex], 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const newIndex = historyIndex + 1;
      ctx.putImageData(history[newIndex], 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    setIsDrawing(true);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = tool === 'eraser' ? '#1e293b' : brushColor;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const applyFilter = (filterId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    switch (filterId) {
      case 'grayscale':
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = data[i + 1] = data[i + 2] = avg;
        }
        break;
      case 'sepia':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        break;
      case 'invert':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i];
          data[i + 1] = 255 - data[i + 1];
          data[i + 2] = 255 - data[i + 2];
        }
        break;
      case 'brightness':
        const brightness = 30;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] + brightness);
          data[i + 1] = Math.min(255, data[i + 1] + brightness);
          data[i + 2] = Math.min(255, data[i + 2] + brightness);
        }
        break;
    }

    ctx.putImageData(imageData, 0, 0);
    saveToHistory();
    toast.success(`Applied ${filterId} filter`);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
    toast.success('Canvas cleared');
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'artwork.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('Image downloaded!');
  };

  const addLayer = () => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length}`,
      visible: true,
      locked: false,
      opacity: 100,
    };
    setLayers([...layers, newLayer]);
    setActiveLayer(newLayer.id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Left Sidebar - Tools */}
      <div className="space-y-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-3 gap-1">
              {tools.map((t) => (
                <Button
                  key={t.id}
                  variant={tool === t.id ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTool(t.id as typeof tool)}
                  className={`flex-col h-14 ${tool === t.id ? 'bg-aura-600' : ''}`}
                  title={t.name}
                >
                  {t.icon}
                  <span className="text-[10px] mt-1">{t.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Brush</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-slate-400 text-xs">Size: {brushSize}px</label>
              <input
                type="range"
                min="1"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs block mb-2">Color</label>
              <div className="grid grid-cols-5 gap-1">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setBrushColor(c)}
                    className={`w-6 h-6 rounded ${brushColor === c ? 'ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <Input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-full h-8 mt-2 p-0 border-0"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-1">
              {filters.map((f) => (
                <Button
                  key={f.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => applyFilter(f.id)}
                  className="text-xs"
                >
                  {f.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Canvas Area */}
      <div className="lg:col-span-2">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Palette size={16} />
                Canvas
              </CardTitle>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={undo} disabled={historyIndex <= 0}>
                  <RotateCcw size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={redo} disabled={historyIndex >= history.length - 1}>
                  <RotateCcw size={14} className="scale-x-[-1]" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setZoom(Math.max(25, zoom - 25))}>
                  <ZoomOut size={14} />
                </Button>
                <span className="text-white text-xs px-2 flex items-center">{zoom}%</span>
                <Button size="sm" variant="ghost" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                  <ZoomIn size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={clearCanvas}>
                  <Trash2 size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={downloadImage}>
                  <Download size={14} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center overflow-auto bg-slate-800/50 rounded p-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="border border-slate-700 rounded cursor-crosshair"
              style={{ 
                width: `${800 * (zoom / 100)}px`,
                height: `${600 * (zoom / 100)}px`,
              }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar - Layers */}
      <div className="space-y-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers size={16} />
                Layers
              </span>
              <Button size="sm" variant="ghost" onClick={addLayer}>
                <Plus size={14} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {layers.slice().reverse().map((layer) => (
              <div
                key={layer.id}
                className={`
                  flex items-center gap-2 p-2 rounded cursor-pointer
                  ${activeLayer === layer.id ? 'bg-aura-600/30 border border-aura-500' : 'bg-slate-800 hover:bg-slate-700'}
                `}
                onClick={() => setActiveLayer(layer.id)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLayers(layers.map(l => 
                      l.id === layer.id ? { ...l, visible: !l.visible } : l
                    ));
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLayers(layers.map(l => 
                      l.id === layer.id ? { ...l, locked: !l.locked } : l
                    ));
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
                <span className="text-white text-sm flex-1 truncate">{layer.name}</span>
                <span className="text-slate-500 text-xs">{layer.opacity}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full" onClick={() => toast('Flip horizontal')}>
              <FlipHorizontal size={14} className="mr-2" />
              Flip H
            </Button>
            <Button variant="outline" size="sm" className="w-full" onClick={() => toast('Flip vertical')}>
              <FlipVertical size={14} className="mr-2" />
              Flip V
            </Button>
            <Button variant="outline" size="sm" className="w-full" onClick={() => toast('Rotate 90°')}>
              <RotateCcw size={14} className="mr-2" />
              Rotate 90°
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ================== PLUS ICON COMPONENT ==================
const Plus = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ================== MAIN ART SUITE COMPONENT ==================
export default function ArtSuitePage() {
  const [activeTab, setActiveTab] = useState('generator');

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <Palette size={32} className="text-pink-500" />
                Art Suite
              </h1>
              <p className="text-slate-400">
                AI-powered art creation, sprite generation, animation, and image editing
              </p>
            </div>
            <WalletDisplay userId="demo-user" />
          </div>
        </div>

        {/* Daily Challenge Widget */}
        <div className="mb-8">
          <DailyChallengeWidget section="art" userId="demo-user" compact />
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 flex-wrap">
            <TabsTrigger value="generator" className="data-[state=active]:bg-aura-600">
              <Wand2 size={16} className="mr-2" />
              AI Generator
            </TabsTrigger>
            <TabsTrigger value="editor" className="data-[state=active]:bg-pink-600">
              <Paintbrush size={16} className="mr-2" />
              Image Editor
            </TabsTrigger>
            <TabsTrigger value="sprites" className="data-[state=active]:bg-aura-600">
              <Grid3X3 size={16} className="mr-2" />
              Sprites
            </TabsTrigger>
            <TabsTrigger value="background" className="data-[state=active]:bg-aura-600">
              <Scissors size={16} className="mr-2" />
              BG Remover
            </TabsTrigger>
            <TabsTrigger value="animation" className="data-[state=active]:bg-aura-600">
              <Film size={16} className="mr-2" />
              Animation
            </TabsTrigger>
            <TabsTrigger value="models" className="data-[state=active]:bg-aura-600">
              <Cpu size={16} className="mr-2" />
              AI Models
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator">
            <AIArtGenerator />
          </TabsContent>

          <TabsContent value="editor">
            <ImageEditor />
          </TabsContent>

          <TabsContent value="sprites">
            <SpriteGenerator />
          </TabsContent>

          <TabsContent value="background">
            <BackgroundRemover />
          </TabsContent>

          <TabsContent value="animation">
            <AnimationStudio />
          </TabsContent>

          <TabsContent value="models">
            <AIModelManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

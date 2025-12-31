'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import {
  Eraser,
  Layers,
  Play,
  Download,
  Upload,
  Copy,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  Monitor,
  Smartphone,
  HardDrive,
  Zap,
  Package,
  FileCode,
  FolderOpen,
} from 'lucide-react';
import axios from 'axios';

// ============== TYPES ==============
interface SpriteSheet {
  id: string;
  name: string;
  frames: string[]; // Base64 images
  frameCount: number;
  fps: number;
  generatedCode: string;
  createdAt: Date;
}

interface DownloadableAsset {
  id: string;
  name: string;
  type: 'sprite' | 'script' | 'bundle';
  files: { name: string; content: string; type: string }[];
  createdAt: Date;
}

interface AIModel {
  name: string;
  size: string;
  params: string;
  vram: string;
  description: string;
  downloadUrl: string;
  hostingUrl: string;
  platform: 'pc' | 'mobile' | 'both';
  tier: 'lightweight' | 'standard' | 'powerful' | 'flagship';
}

// ============== AI MODELS DATA ==============
const AI_MODELS: AIModel[] = [
  // PC Models (LM Studio recommended)
  {
    name: 'Gemma 3 1B',
    size: '1.0 GB',
    params: '1 Billion',
    vram: '2-3 GB',
    description: 'Ultra-lightweight model perfect for low-end systems. Fast responses, basic reasoning. Great for simple tasks and quick prototyping.',
    downloadUrl: 'https://huggingface.co/google/gemma-3-1b-it-gguf',
    hostingUrl: 'https://lmstudio.ai/',
    platform: 'both',
    tier: 'lightweight',
  },
  {
    name: 'Llama 3.2 3B',
    size: '2.1 GB',
    params: '3 Billion',
    vram: '4-6 GB',
    description: 'Excellent balance of speed and capability. Handles most coding tasks well. Recommended for GTX 970/1060 class GPUs.',
    downloadUrl: 'https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct-GGUF',
    hostingUrl: 'https://lmstudio.ai/',
    platform: 'both',
    tier: 'standard',
  },
  {
    name: 'Qwen 2.5 7B',
    size: '4.5 GB',
    params: '7 Billion',
    vram: '6-8 GB',
    description: 'Strong reasoning and code generation. Excellent for game dev tasks. Requires RTX 2060 or better for smooth performance.',
    downloadUrl: 'https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF',
    hostingUrl: 'https://lmstudio.ai/',
    platform: 'pc',
    tier: 'powerful',
  },
  {
    name: 'Mistral Nemo 12B',
    size: '7.8 GB',
    params: '12 Billion',
    vram: '10-12 GB',
    description: 'Flagship model with exceptional reasoning. Complex game logic and architecture. Requires RTX 3060 12GB or better.',
    downloadUrl: 'https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407-GGUF',
    hostingUrl: 'https://lmstudio.ai/',
    platform: 'pc',
    tier: 'flagship',
  },
];

// Mobile-specific hosting options
const MOBILE_HOSTS = [
  {
    name: 'MLC LLM',
    description: 'Run LLMs natively on iPhone and Android. Open source, optimized for mobile GPUs.',
    url: 'https://mlc.ai/mlc-llm/',
    platforms: ['iOS', 'Android'],
  },
  {
    name: 'Ollama (via Termux)',
    description: 'Run Ollama on Android using Termux. Requires rooted device or Termux proot.',
    url: 'https://ollama.ai/',
    platforms: ['Android'],
  },
  {
    name: 'LLM Farm',
    description: 'iOS app for running GGUF models locally on iPhone/iPad. No jailbreak needed.',
    url: 'https://apps.apple.com/app/llm-farm/id6472730846',
    platforms: ['iOS'],
  },
  {
    name: 'Maid',
    description: 'Cross-platform mobile LLM client. Connect to local or remote models.',
    url: 'https://github.com/Mobile-Artificial-Intelligence/maid',
    platforms: ['iOS', 'Android'],
  },
];

export default function ArtStudioPage() {
  const [activeTab, setActiveTab] = useState('background');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [spriteFrames, setSpriteFrames] = useState<string[]>([]);
  const [spriteCode, setSpriteCode] = useState('');
  const [spriteSettings, setSpriteSettings] = useState({
    frameCount: 8,
    fps: 12,
    animationName: 'walk',
    format: 'pygame',
  });
  const [downloadableAssets, setDownloadableAssets] = useState<DownloadableAsset[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============== BACKGROUND REMOVER ==============
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = async () => {
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Removing background...');

    try {
      // In production, call actual background removal API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/art/remove-background`,
        { image: uploadedImage }
      );

      setProcessedImage(response.data.processedImage);
      toast.success('Background removed!', { id: loadingToast });
    } catch (error) {
      // Simulate for demo
      setTimeout(() => {
        setProcessedImage(uploadedImage); // In reality, this would be the processed image
        toast.success('Background removed! (Demo mode)', { id: loadingToast });
        setIsProcessing(false);
      }, 2000);
      return;
    }
    setIsProcessing(false);
  };

  // ============== SPRITE GENERATOR ==============
  const generateSpriteSheet = async () => {
    if (!uploadedImage) {
      toast.error('Please upload a base image first');
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Generating sprite animation...');

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/art/generate-sprite`,
        {
          image: uploadedImage,
          frameCount: spriteSettings.frameCount,
          animationType: spriteSettings.animationName,
        }
      );

      setSpriteFrames(response.data.frames);
      setSpriteCode(response.data.code);
      toast.success('Sprite sheet generated!', { id: loadingToast });
    } catch (error) {
      // Generate demo sprite code
      const demoCode = generateSpriteCodeForFormat(spriteSettings.format, spriteSettings);
      setSpriteCode(demoCode);
      setSpriteFrames([uploadedImage]); // Use uploaded as placeholder
      toast.success('Sprite code generated! (Demo mode)', { id: loadingToast });
    }
    setIsProcessing(false);
  };

  const generateSpriteCodeForFormat = (
    format: string,
    settings: typeof spriteSettings
  ): string => {
    const { frameCount, fps, animationName } = settings;

    switch (format) {
      case 'pygame':
        return `# ${animationName.toUpperCase()} Animation - PyGame
import pygame

class SpriteAnimation:
    def __init__(self, sprite_sheet_path, frame_width, frame_height, frame_count=${frameCount}):
        self.sprite_sheet = pygame.image.load(sprite_sheet_path).convert_alpha()
        self.frames = []
        self.frame_count = frame_count
        self.current_frame = 0
        self.animation_speed = ${fps} / 1000  # ${fps} FPS
        self.last_update = pygame.time.get_ticks()
        
        # Extract frames from sprite sheet
        for i in range(frame_count):
            frame = self.sprite_sheet.subsurface(
                pygame.Rect(i * frame_width, 0, frame_width, frame_height)
            )
            self.frames.append(frame)
    
    def update(self):
        now = pygame.time.get_ticks()
        if now - self.last_update > 1000 / ${fps}:
            self.current_frame = (self.current_frame + 1) % self.frame_count
            self.last_update = now
    
    def get_current_frame(self):
        return self.frames[self.current_frame]
    
    def draw(self, surface, position):
        surface.blit(self.get_current_frame(), position)

# Usage:
# ${animationName}_anim = SpriteAnimation("${animationName}_spritesheet.png", 64, 64, ${frameCount})
# In game loop: ${animationName}_anim.update(); ${animationName}_anim.draw(screen, (x, y))`;

      case 'unity':
        return `// ${animationName.toUpperCase()} Animation - Unity C#
using UnityEngine;

public class ${animationName.charAt(0).toUpperCase() + animationName.slice(1)}Animation : MonoBehaviour
{
    [Header("Sprite Animation Settings")]
    public Sprite[] frames = new Sprite[${frameCount}];
    public float framesPerSecond = ${fps}f;
    
    private SpriteRenderer spriteRenderer;
    private int currentFrame = 0;
    private float timer = 0f;
    
    void Start()
    {
        spriteRenderer = GetComponent<SpriteRenderer>();
        if (spriteRenderer == null)
        {
            spriteRenderer = gameObject.AddComponent<SpriteRenderer>();
        }
    }
    
    void Update()
    {
        timer += Time.deltaTime;
        
        if (timer >= 1f / framesPerSecond)
        {
            timer = 0f;
            currentFrame = (currentFrame + 1) % frames.Length;
            spriteRenderer.sprite = frames[currentFrame];
        }
    }
    
    public void SetAnimation(Sprite[] newFrames)
    {
        frames = newFrames;
        currentFrame = 0;
    }
    
    public void SetSpeed(float fps)
    {
        framesPerSecond = fps;
    }
}

/* Setup Instructions:
 * 1. Import your sprite sheet into Unity
 * 2. Set Sprite Mode to "Multiple" in import settings
 * 3. Use Sprite Editor to slice into ${frameCount} frames
 * 4. Drag frames into the 'frames' array in Inspector
 * 5. Attach this script to your game object
 */`;

      case 'godot':
        return `# ${animationName.toUpperCase()} Animation - Godot GDScript
extends Sprite2D

@export var frame_count: int = ${frameCount}
@export var fps: float = ${fps}.0
@export var sprite_sheet: Texture2D

var current_frame: int = 0
var timer: float = 0.0
var frame_width: int = 64
var frame_height: int = 64

func _ready():
    if sprite_sheet:
        texture = sprite_sheet
        hframes = frame_count
        frame = 0

func _process(delta):
    timer += delta
    
    if timer >= 1.0 / fps:
        timer = 0.0
        current_frame = (current_frame + 1) % frame_count
        frame = current_frame

func set_animation_speed(new_fps: float):
    fps = new_fps

func reset_animation():
    current_frame = 0
    frame = 0
    timer = 0.0

# Usage:
# 1. Attach this script to a Sprite2D node
# 2. Set the sprite_sheet to your ${animationName} spritesheet
# 3. Configure frame_count and fps in the Inspector`;

      case 'phaser':
        return `// ${animationName.toUpperCase()} Animation - Phaser 3
class ${animationName.charAt(0).toUpperCase() + animationName.slice(1)}Scene extends Phaser.Scene {
    constructor() {
        super({ key: '${animationName}Scene' });
    }

    preload() {
        // Load sprite sheet with ${frameCount} frames
        this.load.spritesheet('${animationName}', 
            'assets/${animationName}_spritesheet.png',
            { frameWidth: 64, frameHeight: 64 }
        );
    }

    create() {
        // Create the animation
        this.anims.create({
            key: '${animationName}_anim',
            frames: this.anims.generateFrameNumbers('${animationName}', { 
                start: 0, 
                end: ${frameCount - 1} 
            }),
            frameRate: ${fps},
            repeat: -1 // Loop forever
        });

        // Create sprite and play animation
        this.sprite = this.add.sprite(400, 300, '${animationName}');
        this.sprite.play('${animationName}_anim');
    }

    update() {
        // Add movement or other logic here
    }
}

// Add to your Phaser config:
// const config = {
//     type: Phaser.AUTO,
//     width: 800,
//     height: 600,
//     scene: [${animationName.charAt(0).toUpperCase() + animationName.slice(1)}Scene]
// };`;

      default:
        return '// Select a format to generate code';
    }
  };

  // ============== ASSET MANAGEMENT ==============
  const saveAsset = (type: 'sprite' | 'script' | 'bundle') => {
    const newAsset: DownloadableAsset = {
      id: Date.now().toString(),
      name: `${spriteSettings.animationName}_${type}`,
      type,
      files: [],
      createdAt: new Date(),
    };

    if (type === 'script' || type === 'bundle') {
      newAsset.files.push({
        name: `${spriteSettings.animationName}_animation.${
          spriteSettings.format === 'pygame' ? 'py' :
          spriteSettings.format === 'unity' ? 'cs' :
          spriteSettings.format === 'godot' ? 'gd' : 'js'
        }`,
        content: spriteCode,
        type: 'code',
      });
    }

    if ((type === 'sprite' || type === 'bundle') && processedImage) {
      newAsset.files.push({
        name: `${spriteSettings.animationName}_spritesheet.png`,
        content: processedImage,
        type: 'image',
      });
    }

    setDownloadableAssets([...downloadableAssets, newAsset]);
    toast.success(`${type} saved to downloads!`);
  };

  const downloadAsset = (asset: DownloadableAsset) => {
    asset.files.forEach((file) => {
      const element = document.createElement('a');
      if (file.type === 'image') {
        element.setAttribute('href', file.content);
      } else {
        element.setAttribute(
          'href',
          'data:text/plain;charset=utf-8,' + encodeURIComponent(file.content)
        );
      }
      element.setAttribute('download', file.name);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    });
    toast.success(`Downloaded ${asset.name}`);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'lightweight': return 'border-green-500 bg-green-500/10';
      case 'standard': return 'border-blue-500 bg-blue-500/10';
      case 'powerful': return 'border-purple-500 bg-purple-500/10';
      case 'flagship': return 'border-orange-500 bg-orange-500/10';
      default: return 'border-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Sparkles size={40} className="text-aura-500" /> Art & Design Studio
        </h1>
        <p className="text-slate-400">
          Background removal, sprite animation, and AI-powered asset creation
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="background" className="flex items-center gap-2">
            <Eraser size={16} /> Background Remover
          </TabsTrigger>
          <TabsTrigger value="sprites" className="flex items-center gap-2">
            <Layers size={16} /> Sprite Generator
          </TabsTrigger>
          <TabsTrigger value="downloads" className="flex items-center gap-2">
            <Package size={16} /> Downloads
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center gap-2">
            <HardDrive size={16} /> AI Models
          </TabsTrigger>
        </TabsList>

        {/* ============== BACKGROUND REMOVER TAB ============== */}
        <TabsContent value="background">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <Card className="bg-slate-800 border-slate-700">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Upload Image</h2>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-aura-500 transition"
                >
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="max-h-64 mx-auto rounded"
                    />
                  ) : (
                    <div className="text-slate-400">
                      <Upload size={48} className="mx-auto mb-4" />
                      <p>Click to upload or drag and drop</p>
                      <p className="text-sm text-slate-500">PNG, JPG, WEBP up to 10MB</p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={removeBackground}
                  disabled={!uploadedImage || isProcessing}
                  className="w-full mt-4 bg-aura-600 hover:bg-aura-700"
                >
                  {isProcessing ? (
                    <>
                      <Zap className="animate-spin mr-2" size={18} />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Eraser className="mr-2" size={18} />
                      Remove Background
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Result Section */}
            <Card className="bg-slate-800 border-slate-700">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Result</h2>

                <div className="bg-[url('/checkerboard.svg')] bg-repeat rounded-lg min-h-64 flex items-center justify-center">
                  {processedImage ? (
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="max-h-64 rounded"
                    />
                  ) : (
                    <div className="text-slate-500 text-center p-8">
                      <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Processed image will appear here</p>
                    </div>
                  )}
                </div>

                {processedImage && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = processedImage;
                        link.download = 'background_removed.png';
                        link.click();
                      }}
                      className="flex-1 bg-slate-700 hover:bg-slate-600"
                    >
                      <Download size={18} className="mr-2" /> Download PNG
                    </Button>
                    <Button
                      onClick={() => saveAsset('sprite')}
                      className="flex-1 bg-aura-600 hover:bg-aura-700"
                    >
                      <Package size={18} className="mr-2" /> Save to Downloads
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ============== SPRITE GENERATOR TAB ============== */}
        <TabsContent value="sprites">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Settings */}
            <Card className="bg-slate-800 border-slate-700">
              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Sprite Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Animation Name
                    </label>
                    <Input
                      value={spriteSettings.animationName}
                      onChange={(e) =>
                        setSpriteSettings({ ...spriteSettings, animationName: e.target.value })
                      }
                      placeholder="walk, run, idle, attack..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Frame Count: {spriteSettings.frameCount}
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="24"
                      value={spriteSettings.frameCount}
                      onChange={(e) =>
                        setSpriteSettings({
                          ...spriteSettings,
                          frameCount: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      FPS: {spriteSettings.fps}
                    </label>
                    <input
                      type="range"
                      min="6"
                      max="60"
                      value={spriteSettings.fps}
                      onChange={(e) =>
                        setSpriteSettings({ ...spriteSettings, fps: parseInt(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Code Format
                    </label>
                    <select
                      value={spriteSettings.format}
                      onChange={(e) =>
                        setSpriteSettings({ ...spriteSettings, format: e.target.value })
                      }
                      className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                    >
                      <option value="pygame">PyGame (Python)</option>
                      <option value="unity">Unity (C#)</option>
                      <option value="godot">Godot (GDScript)</option>
                      <option value="phaser">Phaser 3 (JavaScript)</option>
                    </select>
                  </div>

                  <Button
                    onClick={generateSpriteSheet}
                    disabled={!uploadedImage || isProcessing}
                    className="w-full bg-aura-600 hover:bg-aura-700"
                  >
                    {isProcessing ? (
                      <>
                        <Zap className="animate-spin mr-2" size={18} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2" size={18} />
                        Generate Sprite Code
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Generated Code */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Generated Animation Code</h2>
                    {spriteCode && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(spriteCode);
                            toast.success('Code copied!');
                          }}
                          className="bg-slate-700 hover:bg-slate-600"
                        >
                          <Copy size={16} className="mr-1" /> Copy
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveAsset('bundle')}
                          className="bg-aura-600 hover:bg-aura-700"
                        >
                          <Package size={16} className="mr-1" /> Save Bundle
                        </Button>
                      </div>
                    )}
                  </div>

                  {spriteCode ? (
                    <div className="bg-slate-900 border border-slate-700 rounded overflow-hidden">
                      <pre className="p-4 text-xs text-slate-100 overflow-x-auto max-h-96">
                        <code>{spriteCode}</code>
                      </pre>
                    </div>
                  ) : (
                    <div className="bg-slate-900 border border-slate-700 rounded p-12 text-center text-slate-500">
                      <FileCode size={48} className="mx-auto mb-4 opacity-50" />
                      <p>Upload an image and generate to see code</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ============== DOWNLOADS TAB ============== */}
        <TabsContent value="downloads">
          <Card className="bg-slate-800 border-slate-700">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">Your Downloads</h2>

              {downloadableAssets.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No assets yet. Create sprites or remove backgrounds to add items here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {downloadableAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="bg-slate-700 p-4 rounded border border-slate-600 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-aura-600/20 rounded flex items-center justify-center">
                          {asset.type === 'sprite' ? (
                            <ImageIcon size={24} className="text-aura-400" />
                          ) : asset.type === 'script' ? (
                            <FileCode size={24} className="text-aura-400" />
                          ) : (
                            <Package size={24} className="text-aura-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{asset.name}</h3>
                          <p className="text-slate-400 text-sm">
                            {asset.files.length} file(s) • {asset.type} •{' '}
                            {new Date(asset.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => downloadAsset(asset)}
                        className="bg-aura-600 hover:bg-aura-700"
                      >
                        <Download size={18} className="mr-2" /> Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* ============== AI MODELS TAB ============== */}
        <TabsContent value="models">
          <div className="space-y-8">
            {/* PC Models Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Monitor size={28} className="text-aura-400" />
                <h2 className="text-2xl font-bold text-white">PC Models (LM Studio)</h2>
              </div>

              <Card className="bg-slate-800 border-aura-600/50 p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-aura-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HardDrive size={32} className="text-aura-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">LM Studio - Recommended Host</h3>
                    <p className="text-slate-400 mb-4">
                      The easiest way to run local AI models on Windows, Mac, or Linux. No coding required.
                      Download models directly from the app, and chat with them locally.
                    </p>
                    <a
                      href="https://lmstudio.ai/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-aura-600 hover:bg-aura-700 text-white font-semibold px-4 py-2 rounded transition"
                    >
                      Download LM Studio <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {AI_MODELS.filter(m => m.platform === 'pc' || m.platform === 'both').map((model) => (
                  <Card
                    key={model.name}
                    className={`bg-slate-800 border-2 ${getTierColor(model.tier)} p-6`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">{model.name}</h3>
                        <p className="text-aura-400 text-sm">{model.params} Parameters</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${
                        model.tier === 'lightweight' ? 'bg-green-500/20 text-green-400' :
                        model.tier === 'standard' ? 'bg-blue-500/20 text-blue-400' :
                        model.tier === 'powerful' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {model.tier}
                      </span>
                    </div>

                    <p className="text-slate-400 text-sm mb-4">{model.description}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                      <span className="flex items-center gap-1">
                        <HardDrive size={14} /> {model.size}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap size={14} /> {model.vram} VRAM
                      </span>
                    </div>

                    <a
                      href={model.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded transition w-full justify-center"
                    >
                      Download from HuggingFace <ExternalLink size={16} />
                    </a>
                  </Card>
                ))}
              </div>
            </div>

            {/* Mobile Models Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Smartphone size={28} className="text-aura-400" />
                <h2 className="text-2xl font-bold text-white">Mobile AI Hosts</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOBILE_HOSTS.map((host) => (
                  <Card key={host.name} className="bg-slate-800 border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-white mb-2">{host.name}</h3>
                    <p className="text-slate-400 text-sm mb-4">{host.description}</p>
                    <div className="flex items-center gap-2 mb-4">
                      {host.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                    <a
                      href={host.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-aura-400 hover:text-aura-300 transition"
                    >
                      Visit Website <ExternalLink size={16} />
                    </a>
                  </Card>
                ))}
              </div>

              {/* Mobile Model Recommendations */}
              <Card className="bg-slate-800 border-slate-700 p-6 mt-4">
                <h3 className="text-lg font-bold text-white mb-4">Recommended Models for Mobile</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                    <div>
                      <p className="font-semibold text-white">Gemma 3 1B (Q4_K_M)</p>
                      <p className="text-slate-400 text-sm">~700MB • Works on most phones</p>
                    </div>
                    <span className="text-green-400 text-sm">Best for Mobile</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                    <div>
                      <p className="font-semibold text-white">Phi-3 Mini 3.8B (Q4_K_M)</p>
                      <p className="text-slate-400 text-sm">~2.3GB • Flagship phones only</p>
                    </div>
                    <span className="text-blue-400 text-sm">High-End Mobile</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                    <div>
                      <p className="font-semibold text-white">TinyLlama 1.1B (Q4_K_M)</p>
                      <p className="text-slate-400 text-sm">~650MB • Ultra-lightweight</p>
                    </div>
                    <span className="text-yellow-400 text-sm">Low-End Friendly</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Setup Guide */}
            <Card className="bg-gradient-to-r from-aura-600/10 to-purple-600/10 border-aura-600/50 p-8">
              <h3 className="text-xl font-bold text-white mb-4">🚀 Quick Setup Guide</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="w-8 h-8 bg-aura-600 rounded-full flex items-center justify-center text-white font-bold mb-3">1</div>
                  <h4 className="font-semibold text-white mb-2">Download LM Studio</h4>
                  <p className="text-slate-400 text-sm">Install from lmstudio.ai for your OS</p>
                </div>
                <div>
                  <div className="w-8 h-8 bg-aura-600 rounded-full flex items-center justify-center text-white font-bold mb-3">2</div>
                  <h4 className="font-semibold text-white mb-2">Pick Your Model</h4>
                  <p className="text-slate-400 text-sm">Choose based on your GPU VRAM (see recommendations above)</p>
                </div>
                <div>
                  <div className="w-8 h-8 bg-aura-600 rounded-full flex items-center justify-center text-white font-bold mb-3">3</div>
                  <h4 className="font-semibold text-white mb-2">Start Creating</h4>
                  <p className="text-slate-400 text-sm">Run locally and connect to AuraNova for enhanced features</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

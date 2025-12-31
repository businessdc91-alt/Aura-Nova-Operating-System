'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import {
  Download,
  Upload,
  Sparkles,
  Image as ImageIcon,
  Zap,
  Save,
  Share2,
  RotateCcw,
  Settings,
} from 'lucide-react';
import { ArtLibraryService, ArtPiece } from '@/services/artLibraryService';
import { BackgroundRemoverService } from '@/services/artStudioServices';
import { MotionCreatorService } from '@/services/artStudioServices';
import { ProceduralGeneratorService } from '@/services/artStudioServices';

export default function IntegratedArtStudio() {
  // ============== STATE ==============
  const [activeTab, setActiveTab] = useState('background-remover');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Background Remover State
  const [bgRemovalSettings, setBgRemovalSettings] = useState({
    threshold: 50,
    featherEdges: true,
    featherRadius: 5,
    preserveHardEdges: false,
  });

  // Motion Creator State
  const [motionKeyframes, setMotionKeyframes] = useState<Array<{ frame: number; x: number; y: number; scale: number; rotation: number }>>([]);
  const [motionSettings, setMotionSettings] = useState({
    duration: 2,
    fps: 24,
    loop: true,
    easing: 'ease-in-out' as const,
    motionName: 'CustomAnimation',
  });

  // Procedural Generator State
  const [proceduralSettings, setProceduralSettings] = useState({
    style: 'geometric' as const,
    width: 800,
    height: 600,
    complexity: 5,
    colorScheme: 'vibrant',
    seed: Math.random(),
  });

  // Library State
  const [savedPieces, setSavedPieces] = useState<ArtPiece[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);

  // ============== BACKGROUND REMOVER ==============
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImage(dataUrl);
      setProcessedImage(null);
    };
    reader.readAsDataURL(file);
  };

  const removeBackground = async () => {
    if (!uploadedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsProcessing(true);
    const loadingToast = toast.loading('Removing background...');

    try {
      const result = await BackgroundRemoverService.removeBackground(uploadedImage, {
        tolerance: bgRemovalSettings.threshold,
        featherEdges: bgRemovalSettings.featherEdges,
        edgeDetection: true,
      });

      setProcessedImage(result.processedImage);
      toast.success('Background removed!', { id: loadingToast });
    } catch (error) {
      toast.error('Failed to remove background', { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  // ============== MOTION CREATOR ==============
  const addKeyframe = () => {
    const newKeyframe = {
      frame: motionKeyframes.length,
      x: Math.random() * 200,
      y: Math.random() * 200,
      scale: 1,
      rotation: Math.random() * 360,
    };
    setMotionKeyframes([...motionKeyframes, newKeyframe]);
  };

  const updateKeyframe = (index: number, updates: Partial<typeof motionKeyframes[0]>) => {
    const updated = [...motionKeyframes];
    updated[index] = { ...updated[index], ...updates };
    setMotionKeyframes(updated);
  };

  const removeKeyframe = (index: number) => {
    setMotionKeyframes(motionKeyframes.filter((_, i) => i !== index));
  };

  const generateMotionAnimation = async () => {
    if (!processedImage && !uploadedImage) {
      toast.error('Please upload or process an image first');
      return;
    }

    const loadingToast = toast.loading('Creating motion animation...');

    try {
      const sequence = await MotionCreatorService.createMotionSequence(
        motionSettings.motionName,
        motionKeyframes.map((kf) => ({
          time: (kf.frame / motionSettings.fps) * motionSettings.duration,
          transform: {
            position: { x: kf.x, y: kf.y },
            scale: { x: kf.scale, y: kf.scale },
            rotation: kf.rotation,
          },
        }))
      );

      const cssCode = MotionCreatorService.generateCSSAnimation(sequence);
      const jsCode = cssCode; // For now, use CSS code for JS export

      // Save animation to library
      await ArtLibraryService.savePiece({
        title: `${motionSettings.motionName} Animation`,
        description: `Motion animation with ${motionKeyframes.length} keyframes`,
        type: 'animation',
        category: 'motion',
        tags: ['animation', 'motion', motionSettings.motionName.toLowerCase()],
        thumbnail: processedImage || uploadedImage || '',
        fullImage: processedImage || uploadedImage || '',
        public: false,
        featured: false,
        exportFormats: {
          code: jsCode,
        },
      });

      toast.success('Animation created and saved!', { id: loadingToast });
    } catch (error) {
      toast.error('Failed to create animation', { id: loadingToast });
    }
  };

  // ============== PROCEDURAL GENERATOR ==============
  const generateProceduralArt = async () => {
    const loadingToast = toast.loading('Generating procedural art...');
    setIsProcessing(true);

    try {
      const imageData = await ProceduralGeneratorService.generateArt({
        style: proceduralSettings.style,
        width: proceduralSettings.width,
        height: proceduralSettings.height,
        complexity: proceduralSettings.complexity,
        colorScheme: proceduralSettings.colorScheme,
        seed: proceduralSettings.seed,
      });

      setProcessedImage(imageData);

      // Save to library
      await ArtLibraryService.savePiece({
        title: `${proceduralSettings.style.charAt(0).toUpperCase() + proceduralSettings.style.slice(1)} Art`,
        description: `Auto-generated ${proceduralSettings.style} art`,
        type: 'procedural',
        category: 'generative',
        tags: [proceduralSettings.style, 'procedural', proceduralSettings.colorScheme],
        thumbnail: imageData,
        fullImage: imageData,
      });

      toast.success('Procedural art generated!', { id: loadingToast });
    } catch (error) {
      toast.error('Failed to generate art', { id: loadingToast });
    } finally {
      setIsProcessing(false);
    }
  };

  // ============== LIBRARY MANAGEMENT ==============
  const loadSavedPieces = async () => {
    try {
      const pieces = await ArtLibraryService.getPublicPieces();
      setSavedPieces(pieces);
      setShowLibrary(true);
    } catch (error) {
      toast.error('Failed to load library');
    }
  };

  const saveCurrentArt = async () => {
    if (!processedImage && !uploadedImage) {
      toast.error('No art to save');
      return;
    }

    const title = prompt('Enter title for this artwork:');
    if (!title) return;

    const loadingToast = toast.loading('Saving artwork...');

    try {
      await ArtLibraryService.savePiece({
        title,
        description: prompt('Add a description (optional):') || '',
        type: 'hand-drawn',
        category: 'user-created',
        tags: prompt('Add tags (comma-separated):')?.split(',').map(t => t.trim()) || [],
        thumbnail: processedImage || uploadedImage || '',
        fullImage: processedImage || uploadedImage || '',
      });

      toast.success('Artwork saved to library!', { id: loadingToast });
    } catch (error) {
      toast.error('Failed to save artwork', { id: loadingToast });
    }
  };

  const downloadImage = () => {
    if (!processedImage && !uploadedImage) {
      toast.error('No image to download');
      return;
    }

    const link = document.createElement('a');
    link.href = processedImage || uploadedImage || '';
    link.download = `aura-art-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-950 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">✨ Integrated Art Studio</h1>
          <p className="text-slate-400">Background removal • Motion creation • Procedural generation • Gallery</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-slate-900 border border-slate-800">
            <TabsTrigger value="background-remover">🎯 Background</TabsTrigger>
            <TabsTrigger value="motion-creator">🎬 Motion</TabsTrigger>
            <TabsTrigger value="procedural">🎨 Procedural</TabsTrigger>
            <TabsTrigger value="library">📚 Library</TabsTrigger>
          </TabsList>

          {/* BACKGROUND REMOVER TAB */}
          <TabsContent value="background-remover" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Upload & Settings */}
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Upload Image</h2>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-4 py-8 border-2 border-dashed border-slate-700 rounded-lg hover:border-blue-500 transition-colors text-center text-slate-400 hover:text-blue-400"
                  >
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    Click to upload or drag and drop
                  </button>
                </div>

                {/* Background Removal Settings */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Removal Settings
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400 block mb-2">
                        Threshold: {bgRemovalSettings.threshold}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={bgRemovalSettings.threshold}
                        onChange={(e) => setBgRemovalSettings({ ...bgRemovalSettings, threshold: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <p className="text-xs text-slate-500 mt-1">Higher = more aggressive removal</p>
                    </div>

                    <div>
                      <label className="text-sm text-slate-400 block mb-2">
                        Feather Radius: {bgRemovalSettings.featherRadius}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={bgRemovalSettings.featherRadius}
                        onChange={(e) => setBgRemovalSettings({ ...bgRemovalSettings, featherRadius: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bgRemovalSettings.featherEdges}
                        onChange={(e) => setBgRemovalSettings({ ...bgRemovalSettings, featherEdges: e.target.checked })}
                      />
                      <span>Feather Edges</span>
                    </label>

                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bgRemovalSettings.preserveHardEdges}
                        onChange={(e) => setBgRemovalSettings({ ...bgRemovalSettings, preserveHardEdges: e.target.checked })}
                      />
                      <span>Preserve Hard Edges</span>
                    </label>
                  </div>

                  <button
                    onClick={removeBackground}
                    disabled={!uploadedImage || isProcessing}
                    className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                  >
                    {isProcessing ? 'Processing...' : '✨ Remove Background'}
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                {uploadedImage && (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Original</h3>
                    <img src={uploadedImage} alt="Original" className="w-full rounded-lg" />
                  </div>
                )}

                {processedImage && (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Processed</h3>
                    <img src={processedImage} alt="Processed" className="w-full rounded-lg bg-slate-950" />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {(uploadedImage || processedImage) && (
              <div className="flex gap-4 bg-slate-900 border border-slate-800 rounded-lg p-6">
                <button
                  onClick={downloadImage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={saveCurrentArt}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save to Library
                </button>
                <button
                  onClick={() => {
                    setUploadedImage(null);
                    setProcessedImage(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            )}
          </TabsContent>

          {/* MOTION CREATOR TAB */}
          <TabsContent value="motion-creator" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Keyframe Editor */}
              <div className="col-span-2">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Keyframe Timeline</h2>

                  {motionKeyframes.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      No keyframes yet. Add one to get started!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {motionKeyframes.map((kf, idx) => (
                        <div key={idx} className="bg-slate-800 p-4 rounded-lg flex items-center gap-4">
                          <div className="flex-shrink-0 w-12">
                            <span className="text-blue-400 font-bold">#{idx + 1}</span>
                          </div>

                          <div className="grid grid-cols-4 gap-2 flex-1">
                            <div>
                              <label className="text-xs text-slate-400">Frame</label>
                              <input
                                type="number"
                                value={kf.frame}
                                onChange={(e) => updateKeyframe(idx, { frame: parseInt(e.target.value) })}
                                className="w-full px-2 py-1 bg-slate-700 rounded border border-slate-600 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">X</label>
                              <input
                                type="number"
                                value={kf.x}
                                onChange={(e) => updateKeyframe(idx, { x: parseInt(e.target.value) })}
                                className="w-full px-2 py-1 bg-slate-700 rounded border border-slate-600 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">Y</label>
                              <input
                                type="number"
                                value={kf.y}
                                onChange={(e) => updateKeyframe(idx, { y: parseInt(e.target.value) })}
                                className="w-full px-2 py-1 bg-slate-700 rounded border border-slate-600 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400">Rotation</label>
                              <input
                                type="number"
                                value={kf.rotation}
                                onChange={(e) => updateKeyframe(idx, { rotation: parseInt(e.target.value) })}
                                className="w-full px-2 py-1 bg-slate-700 rounded border border-slate-600 text-white text-sm"
                              />
                            </div>
                          </div>

                          <button
                            onClick={() => removeKeyframe(idx)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={addKeyframe}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                  >
                    + Add Keyframe
                  </button>
                </div>
              </div>

              {/* Settings & Controls */}
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Animation Settings</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-400 block mb-1">Name</label>
                      <input
                        type="text"
                        value={motionSettings.motionName}
                        onChange={(e) => setMotionSettings({ ...motionSettings, motionName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 text-white text-sm"
                        placeholder="e.g., FlyingBird"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-400 block mb-1">Duration (seconds)</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={motionSettings.duration}
                        onChange={(e) => setMotionSettings({ ...motionSettings, duration: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-slate-400 block mb-1">FPS</label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={motionSettings.fps}
                        onChange={(e) => setMotionSettings({ ...motionSettings, fps: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 text-white text-sm"
                      />
                    </div>

                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={motionSettings.loop}
                        onChange={(e) => setMotionSettings({ ...motionSettings, loop: e.target.checked })}
                      />
                      <span>Loop Animation</span>
                    </label>

                    <button
                      onClick={generateMotionAnimation}
                      disabled={motionKeyframes.length === 0 || isProcessing}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 rounded-lg font-semibold transition-colors"
                    >
                      🎬 Generate Animation
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* PROCEDURAL GENERATOR TAB */}
          <TabsContent value="procedural" className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Settings */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-6">Generator Settings</h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Style</label>
                    <select
                      value={proceduralSettings.style}
                      onChange={(e) => setProcedural Settings({ ...proceduralSettings, style: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 text-white"
                    >
                      <option value="geometric">Geometric</option>
                      <option value="organic">Organic</option>
                      <option value="fractal">Fractal</option>
                      <option value="cellular">Cellular</option>
                      <option value="perlin">Perlin Noise</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Color Scheme</label>
                    <select
                      value={proceduralSettings.colorScheme}
                      onChange={(e) => setProcedural Settings({ ...proceduralSettings, colorScheme: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 text-white"
                    >
                      <option value="vibrant">Vibrant</option>
                      <option value="pastel">Pastel</option>
                      <option value="monochrome">Monochrome</option>
                      <option value="neon">Neon</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Complexity: {proceduralSettings.complexity}</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={proceduralSettings.complexity}
                      onChange={(e) => setProcedural Settings({ ...proceduralSettings, complexity: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-sm text-slate-400 block mb-1">Width</label>
                      <input
                        type="number"
                        value={proceduralSettings.width}
                        onChange={(e) => setProcedural Settings({ ...proceduralSettings, width: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 block mb-1">Height</label>
                      <input
                        type="number"
                        value={proceduralSettings.height}
                        onChange={(e) => setProcedural Settings({ ...proceduralSettings, height: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-800 rounded border border-slate-700 text-white text-sm"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setProcedural Settings({ ...proceduralSettings, seed: Math.random() })}
                    className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition-colors text-sm"
                  >
                    🎲 Randomize
                  </button>

                  <button
                    onClick={generateProceduralArt}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 rounded-lg font-semibold transition-colors"
                  >
                    {isProcessing ? 'Generating...' : '🎨 Generate Art'}
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="col-span-2">
                {processedImage ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Preview</h3>
                    <img src={processedImage} alt="Generated art" className="w-full rounded-lg" />
                    <div className="flex gap-4 mt-4">
                      <button onClick={downloadImage} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">
                        Download
                      </button>
                      <button onClick={saveCurrentArt} className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold">
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-dashed border-slate-800 rounded-lg p-12 flex items-center justify-center text-slate-500">
                    Configure settings and click "Generate Art" to create something amazing!
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* LIBRARY TAB */}
          <TabsContent value="library" className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">My Art Library</h2>
                <button
                  onClick={loadSavedPieces}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                >
                  📚 Refresh Library
                </button>
              </div>

              {savedPieces.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>Your library is empty. Create some art to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {savedPieces.map((piece) => (
                    <div key={piece.id} className="bg-slate-800 rounded-lg overflow-hidden hover:border border-blue-500 transition-colors cursor-pointer">
                      <div className="w-full h-32 bg-slate-700 flex items-center justify-center overflow-hidden">
                        {piece.thumbnail ? (
                          <img src={piece.thumbnail} alt={piece.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-slate-600">No preview</div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold line-clamp-2 text-sm">{piece.title}</h4>
                        <p className="text-xs text-slate-500 capitalize">{piece.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

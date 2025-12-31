'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, Save, Settings, Trash2, Share2, Wand2, Palette, Film } from 'lucide-react';
import { AvatarService, Avatar, AvatarBody, AvatarPose } from '@/services/avatarService';
import { ClothingCreatorService, ClothingItem } from '@/services/clothingCreatorService';
import { HairService } from '@/services/hairService';
import { FacialFeaturesService, FacialFeatures, Eyes, Lips } from '@/services/facialFeaturesService';
import { AnimationService } from '@/services/animationService';
import HairMakeupEditor from '@/components/avatar/HairMakeupEditor';
import PoseEditor from '@/components/avatar/PoseEditor';
import AnimationPreview from '@/components/avatar/AnimationPreview';
import toast from 'react-hot-toast';

export default function AvatarBuilderPage() {
  // ============== STATE ==============
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [currentAvatar, setCurrentAvatar] = useState<Avatar | null>(null);
  const [allClothing, setAllClothing] = useState<ClothingItem[]>([]);
  const [allPoses, setAllPoses] = useState<AvatarPose[]>([]);
  const [showBodySettings, setShowBodySettings] = useState(false);
  const [showClothingPanel, setShowClothingPanel] = useState(false);
  const [showPosePanel, setShowPosePanel] = useState(false);
  const [showHairMakeup, setShowHairMakeup] = useState(false);
  const [showPoseEditor, setShowPoseEditor] = useState(false);
  const [showAnimationPreview, setShowAnimationPreview] = useState(false);
  const [selectedClothingType, setSelectedClothingType] = useState<string>('top');
  const [selectedPoseCategory, setSelectedPoseCategory] = useState<string>('idle');
  const [selectedAnimation, setSelectedAnimation] = useState(AnimationService.getIdleAnimations()[0]);

  // Avatar customization
  const [facialFeatures, setFacialFeatures] = useState<FacialFeatures>(FacialFeaturesService.createDefaultFeatures());
  const [avatarHair, setAvatarHair] = useState(HairService.createHair('long-straight', '#8B4513'));

  // Body Customization
  const [bodySettings, setBodySettings] = useState<Partial<AvatarBody>>({
    skinTone: '#E8B5A6',
    headShape: 'round',
    bodyType: 'athletic',
    height: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (currentAvatar) {
      renderAvatar();
    }
  }, [currentAvatar]);

  const loadData = async () => {
    try {
      const savedAvatars = await AvatarService.getAllAvatars();
      const savedClothing = await ClothingCreatorService.getPublicItems();
      const savedPoses = await AvatarService.getAllPoses();

      setAvatars(savedAvatars);
      setAllClothing(savedClothing);
      setAllPoses(savedPoses);

      if (savedAvatars.length > 0) {
        setCurrentAvatar(savedAvatars[0]);
      }
    } catch (error) {
      console.error('Failed to load data');
    }
  };

  // ============== AVATAR RENDERING ==============
  const renderAvatar = async () => {
    if (!currentAvatar || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d')!;

    // Background with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw body
    drawAvatarBody(ctx, currentAvatar.body, canvas);

    // Draw facial features (eyes, nose, lips)
    drawFacialFeatures(ctx, facialFeatures, canvas);

    // Draw hair
    drawHair(ctx, avatarHair, currentAvatar.body, canvas);

    // Draw clothing layers
    if (currentAvatar.clothingLayers.bottom) {
      ctx.fillStyle = '#333333';
      ctx.fillRect(140, 300, 232, 120);
    }

    if (currentAvatar.clothingLayers.top) {
      ctx.fillStyle = '#4ECDC4';
      ctx.fillRect(120, 200, 272, 120);
    }

    if (currentAvatar.clothingLayers.shoes) {
      ctx.fillStyle = '#2C3E50';
      ctx.fillRect(150, 420, 100, 50);
      ctx.fillRect(262, 420, 100, 50);
    }
  };

  const drawFacialFeatures = (
    ctx: CanvasRenderingContext2D,
    features: FacialFeatures,
    canvas: HTMLCanvasElement
  ) => {
    const centerX = canvas.width / 2;
    const headY = 100;

    // Draw eyes
    const eyeYOffset = -10;
    const eyeSpacing = 30;

    // Left eye
    ctx.fillStyle = features.eyes.primaryColor;
    ctx.beginPath();
    ctx.ellipse(centerX - eyeSpacing, headY + eyeYOffset, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.beginPath();
    ctx.ellipse(centerX + eyeSpacing, headY + eyeYOffset, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = features.eyes.pupilColor;
    const pupilRadius = 3 * (features.eyes.pupilSize || 1);
    ctx.beginPath();
    ctx.arc(centerX - eyeSpacing, headY + eyeYOffset, pupilRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeSpacing, headY + eyeYOffset, pupilRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw eyebrows
    ctx.strokeStyle = features.eyes.eyebrowColor;
    ctx.lineWidth = 2 * (features.eyes.eyebrowThickness || 1);
    ctx.beginPath();
    ctx.moveTo(centerX - eyeSpacing - 8, headY + eyeYOffset - 15);
    ctx.lineTo(centerX - eyeSpacing + 8, headY + eyeYOffset - 15);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + eyeSpacing - 8, headY + eyeYOffset - 15);
    ctx.lineTo(centerX + eyeSpacing + 8, headY + eyeYOffset - 15);
    ctx.stroke();

    // Draw lips
    ctx.fillStyle = features.lips.color;
    const lipWidth = 20;
    const lipHeight = 8;
    ctx.beginPath();
    ctx.ellipse(centerX, headY + 20, lipWidth, lipHeight, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lip outline
    if (features.lips.outline) {
      ctx.strokeStyle = features.lips.outlineColor || '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centerX, headY + 20, lipWidth, lipHeight, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const drawHair = (
    ctx: CanvasRenderingContext2D,
    hair: any,
    body: AvatarBody,
    canvas: HTMLCanvasElement
  ) => {
    const centerX = canvas.width / 2;
    const headY = 100;
    const headRadius = 40;

    ctx.fillStyle = hair.primaryColor;

    // Draw simplified hair based on style
    switch (hair.styleId) {
      case 'long-straight':
        // Long hair down sides
        ctx.beginPath();
        ctx.moveTo(centerX - headRadius, headY);
        ctx.bezierCurveTo(
          centerX - headRadius - 15, headY + 30,
          centerX - headRadius - 15, headY + 80,
          centerX - headRadius - 5, headY + 140
        );
        ctx.lineTo(centerX - headRadius + 5, headY + 140);
        ctx.bezierCurveTo(
          centerX - headRadius + 15, headY + 80,
          centerX - headRadius + 15, headY + 30,
          centerX - headRadius, headY
        );
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(centerX + headRadius, headY);
        ctx.bezierCurveTo(
          centerX + headRadius + 15, headY + 30,
          centerX + headRadius + 15, headY + 80,
          centerX + headRadius + 5, headY + 140
        );
        ctx.lineTo(centerX + headRadius - 5, headY + 140);
        ctx.bezierCurveTo(
          centerX + headRadius - 15, headY + 80,
          centerX + headRadius - 15, headY + 30,
          centerX + headRadius, headY
        );
        ctx.fill();
        break;

      case 'short-pixie':
        // Short hair on top
        ctx.beginPath();
        ctx.arc(centerX, headY - 10, headRadius + 8, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'curly-medium':
        // Curly hair effect with multiple circles
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * (headRadius + 10);
          const y = headY + Math.sin(angle) * (headRadius + 10);
          ctx.beginPath();
          ctx.arc(x, y, 18, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      default:
        // Default wavy hair
        ctx.beginPath();
        ctx.arc(centerX, headY - 5, headRadius + 5, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw hair highlights if supported
    if (HairService.supportsHighlights(hair.styleId)) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = hair.secondaryColor || '#FFFFFF';

      const highlightAngle = Math.PI / 3;
      ctx.beginPath();
      ctx.arc(
        centerX - headRadius * 0.4,
        headY - headRadius * 0.3,
        headRadius * 0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.globalAlpha = 1;
    }
  };

  const drawAvatarBody = (
    ctx: CanvasRenderingContext2D,
    body: AvatarBody,
    canvas: HTMLCanvasElement
  ) => {
    const centerX = canvas.width / 2;
    const headY = 100;
    const torsoY = 200;
    const legY = 350;

    ctx.fillStyle = body.skinTone;

    // Draw head
    switch (body.headShape) {
      case 'round':
        ctx.beginPath();
        ctx.arc(centerX, headY, 40, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(centerX - 40, headY - 40, 80, 80);
        break;
      case 'oval':
        ctx.beginPath();
        ctx.ellipse(centerX, headY, 35, 45, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'heart':
        ctx.beginPath();
        ctx.arc(centerX - 20, headY - 20, 20, 0, Math.PI * 2);
        ctx.arc(centerX + 20, headY - 20, 20, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    // Draw torso
    const torsoWidth = body.bodyType === 'broad' ? 80 : body.bodyType === 'slim' ? 50 : 65;
    ctx.fillRect(centerX - torsoWidth / 2, torsoY, torsoWidth, 120);

    // Draw arms
    ctx.fillRect(centerX - torsoWidth / 2 - 30, torsoY + 20, 30, 100);
    ctx.fillRect(centerX + torsoWidth / 2, torsoY + 20, 30, 100);

    // Draw legs
    ctx.fillRect(centerX - 25, legY, 25, 140);
    ctx.fillRect(centerX, legY, 25, 140);

    // Draw eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX - 15, headY - 10, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 15, headY - 10, 5, 0, Math.PI * 2);
    ctx.fill();
  };

  // ============== AVATAR MANAGEMENT ==============
  const createNewAvatar = async () => {
    const name = prompt('Enter avatar name:');
    if (!name) return;

    try {
      const newAvatar: any = {
        name,
        body: {
          id: `body-${Date.now()}`,
          name: `${name}'s Body`,
          skinTone: bodySettings.skinTone || '#E8B5A6',
          headShape: bodySettings.headShape || 'round',
          bodyType: bodySettings.bodyType || 'athletic',
          height: bodySettings.height || 1,
          baseShape: '',
        },
        rigs: [],
        currentPose: {
          id: 'pose-idle',
          name: 'Idle',
          category: 'idle' as const,
          joints: {},
          tags: [],
        },
        clothingLayers: {
          accessories: [],
        },
      };

      const created = await AvatarService.createAvatar(newAvatar);
      setAvatars([...avatars, created]);
      setCurrentAvatar(created);
      toast.success('Avatar created!');
    } catch (error) {
      toast.error('Failed to create avatar');
    }
  };

  const saveCurrentAvatar = async () => {
    if (!currentAvatar) return;

    try {
      await AvatarService.updateAvatar(currentAvatar.id, currentAvatar);
      toast.success('Avatar saved!');
    } catch (error) {
      toast.error('Failed to save avatar');
    }
  };

  const deleteAvatar = async (avatarId: string) => {
    if (confirm('Delete this avatar permanently?')) {
      try {
        await AvatarService.deleteAvatar(avatarId);
        const newAvatars = avatars.filter(a => a.id !== avatarId);
        setAvatars(newAvatars);
        setCurrentAvatar(newAvatars[0] || null);
        toast.success('Avatar deleted');
      } catch (error) {
        toast.error('Failed to delete avatar');
      }
    }
  };

  // ============== CLOTHING MANAGEMENT ==============
  const addClothingToAvatar = async (clothingId: string) => {
    if (!currentAvatar) return;

    try {
      await AvatarService.addClothing(currentAvatar.id, selectedClothingType, clothingId);
      const updated = await AvatarService.getAvatar(currentAvatar.id);
      if (updated) {
        setCurrentAvatar(updated);
        toast.success('Clothing added!');
      }
    } catch (error) {
      toast.error('Failed to add clothing');
    }
  };

  const removeClothing = async (clothingType: string, clothingId?: string) => {
    if (!currentAvatar) return;

    try {
      await AvatarService.removeClothing(currentAvatar.id, clothingType, clothingId);
      const updated = await AvatarService.getAvatar(currentAvatar.id);
      if (updated) {
        setCurrentAvatar(updated);
        toast.success('Clothing removed!');
      }
    } catch (error) {
      toast.error('Failed to remove clothing');
    }
  };

  // ============== POSE MANAGEMENT ==============
  const applyPose = async (poseId: string) => {
    if (!currentAvatar) return;

    try {
      await AvatarService.applyPose(currentAvatar.id, poseId);
      const updated = await AvatarService.getAvatar(currentAvatar.id);
      if (updated) {
        setCurrentAvatar(updated);
        toast.success('Pose applied!');
      }
    } catch (error) {
      toast.error('Failed to apply pose');
    }
  };

  const createPoseFromCurrent = async () => {
    if (!currentAvatar) return;

    const poseName = prompt('Enter pose name:');
    if (!poseName) return;

    try {
      await AvatarService.createPoseFromAvatar(currentAvatar.id, poseName, 'custom');
      const updatedPoses = await AvatarService.getAllPoses();
      setAllPoses(updatedPoses);
      toast.success('Pose saved!');
    } catch (error) {
      toast.error('Failed to create pose');
    }
  };

  const clothingByType = allClothing.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, ClothingItem[]>);

  const posesByCategory = allPoses.reduce((acc, pose) => {
    if (!acc[pose.category]) acc[pose.category] = [];
    acc[pose.category].push(pose);
    return acc;
  }, {} as Record<string, AvatarPose[]>);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-slate-950 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">🧑 Avatar Builder</h1>
          <p className="text-slate-400">Create and customize your unique avatars</p>
        </div>
      </div>

      <div className="max-w-full mx-auto p-6 grid grid-cols-12 gap-4">
        {/* Left Sidebar - Avatar List & Settings */}
        <div className="col-span-2 space-y-4">
          {/* Avatars */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h2 className="font-bold mb-4">My Avatars</h2>

            {avatars.length === 0 ? (
              <p className="text-xs text-slate-500 mb-4">No avatars yet</p>
            ) : (
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {avatars.map(avatar => (
                  <div
                    key={avatar.id}
                    onClick={() => setCurrentAvatar(avatar)}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      currentAvatar?.id === avatar.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <p className="text-xs font-semibold">{avatar.name}</p>
                    <p className="text-xs text-slate-500">{avatar.body.bodyType}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={createNewAvatar}
              className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Avatar
            </button>
          </div>

          {/* Body Settings */}
          {currentAvatar && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Body
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Head Shape</label>
                  <select
                    value={currentAvatar.body.headShape}
                    onChange={(e) =>
                      setCurrentAvatar(prev =>
                        prev
                          ? {
                              ...prev,
                              body: { ...prev.body, headShape: e.target.value as any },
                            }
                          : null
                      )
                    }
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white"
                  >
                    <option value="round">Round</option>
                    <option value="square">Square</option>
                    <option value="oval">Oval</option>
                    <option value="heart">Heart</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Body Type</label>
                  <select
                    value={currentAvatar.body.bodyType}
                    onChange={(e) =>
                      setCurrentAvatar(prev =>
                        prev
                          ? {
                              ...prev,
                              body: { ...prev.body, bodyType: e.target.value as any },
                            }
                          : null
                      )
                    }
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white"
                  >
                    <option value="slim">Slim</option>
                    <option value="athletic">Athletic</option>
                    <option value="curvy">Curvy</option>
                    <option value="broad">Broad</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Skin Tone</label>
                  <input
                    type="color"
                    value={currentAvatar.body.skinTone}
                    onChange={(e) =>
                      setCurrentAvatar(prev =>
                        prev
                          ? {
                              ...prev,
                              body: { ...prev.body, skinTone: e.target.value },
                            }
                          : null
                      )
                    }
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {currentAvatar && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
              <button
                onClick={saveCurrentAvatar}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Avatar
              </button>
              <button
                onClick={() => deleteAvatar(currentAvatar.id)}
                className="w-full px-3 py-2 bg-red-900 hover:bg-red-800 rounded text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Center - Canvas & Preview */}
        <div className="col-span-5">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h2 className="font-bold mb-4">Avatar Preview</h2>
            <canvas
              ref={canvasRef}
              className="w-full border border-slate-700 rounded-lg bg-slate-950"
            />
            <div className="mt-4 text-xs text-slate-500 text-center">
              {currentAvatar
                ? `${currentAvatar.name} - ${currentAvatar.body.bodyType} body`
                : 'Create or select an avatar'}
            </div>
          </div>

          {/* Animation Preview */}
          {showAnimationPreview && (
            <div className="mt-4">
              <AnimationPreview animation={selectedAnimation} />
            </div>
          )}

          {/* Pose Editor */}
          {showPoseEditor && (
            <div className="mt-4">
              <PoseEditor
                onSavePose={(pose) => {
                  toast.success('Pose saved!');
                  setShowPoseEditor(false);
                }}
              />
            </div>
          )}
        </div>

        {/* Right Sidebar - Customization Panels */}
        <div className="col-span-5 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Hair & Makeup Editor */}
          {currentAvatar && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <button
                onClick={() => setShowHairMakeup(!showHairMakeup)}
                className="w-full flex items-center justify-between font-bold mb-3"
              >
                <span className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Hair & Makeup
                </span>
                <span>{showHairMakeup ? '−' : '+'}</span>
              </button>

              {showHairMakeup && (
                <HairMakeupEditor
                  hair={avatarHair}
                  eyes={facialFeatures.eyes}
                  lips={facialFeatures.lips}
                  makeup={facialFeatures.makeup}
                  onChange={{
                    hair: setAvatarHair,
                    eyes: (eyes) => setFacialFeatures({ ...facialFeatures, eyes }),
                    lips: (lips) => setFacialFeatures({ ...facialFeatures, lips }),
                    makeup: (makeup) => setFacialFeatures({ ...facialFeatures, makeup }),
                  }}
                />
              )}
            </div>
          )}

          {/* Pose Editor Toggle */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <button
              onClick={() => setShowPoseEditor(!showPoseEditor)}
              className="w-full flex items-center justify-between font-bold"
            >
              <span>Advanced Pose Editor</span>
              <span>{showPoseEditor ? '−' : '+'}</span>
            </button>
          </div>

          {/* Animation Preview Toggle */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <button
              onClick={() => setShowAnimationPreview(!showAnimationPreview)}
              className="w-full flex items-center justify-between font-bold mb-3"
            >
              <span className="flex items-center gap-2">
                <Film className="w-4 h-4" />
                Animation Preview
              </span>
              <span>{showAnimationPreview ? '−' : '+'}</span>
            </button>

            {showAnimationPreview && (
              <div className="mt-3">
                <label className="text-xs text-slate-400 block mb-2">Select Animation</label>
                <select
                  value={selectedAnimation.id}
                  onChange={(e) => {
                    const anim = AnimationService.getAnimation(e.target.value);
                    if (anim) setSelectedAnimation(anim);
                  }}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs mb-3"
                >
                  {AnimationService.getAllAnimations().map((anim) => (
                    <option key={anim.id} value={anim.id}>
                      {anim.name} ({anim.category})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Clothing */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="font-bold mb-3">👔 Clothing</h3>

            <div className="mb-3">
              <label className="text-xs text-slate-400 block mb-1">Type</label>
              <select
                value={selectedClothingType}
                onChange={(e) => setSelectedClothingType(e.target.value)}
                className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="shoes">Shoes</option>
                <option value="coat">Coat</option>
                <option value="hat">Hat</option>
                <option value="accessory">Accessory</option>
              </select>
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto mb-3">
              {clothingByType[selectedClothingType]?.map(item => (
                <button
                  key={item.id}
                  onClick={() => addClothingToAvatar(item.id)}
                  className="w-full text-left px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                  {item.name}
                </button>
              ))}
              {!clothingByType[selectedClothingType] ||
                (clothingByType[selectedClothingType].length === 0 && (
                  <p className="text-xs text-slate-600 py-2">No items in this category</p>
                ))}
            </div>

            <a
              href="/clothing-creator"
              className="block w-full px-3 py-2 bg-pink-600 hover:bg-pink-700 rounded text-xs font-semibold text-center transition-colors"
            >
              Design Clothing
            </a>
          </div>

          {/* Poses */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="font-bold mb-3">💃 Poses</h3>

            <div className="mb-3">
              <label className="text-xs text-slate-400 block mb-1">Category</label>
              <select
                value={selectedPoseCategory}
                onChange={(e) => setSelectedPoseCategory(e.target.value)}
                className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              >
                <option value="idle">Idle</option>
                <option value="action">Action</option>
                <option value="emote">Emote</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto mb-3">
              {posesByCategory[selectedPoseCategory]?.map(pose => (
                <button
                  key={pose.id}
                  onClick={() => applyPose(pose.id)}
                  className="w-full text-left px-2 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                  {pose.name}
                </button>
              ))}
              {!posesByCategory[selectedPoseCategory] ||
                (posesByCategory[selectedPoseCategory].length === 0 && (
                  <p className="text-xs text-slate-600 py-2">No poses in this category</p>
                ))}
            </div>

            <button
              onClick={createPoseFromCurrent}
              className="w-full px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Wand2 className="w-3 h-3" />
              Save Pose
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

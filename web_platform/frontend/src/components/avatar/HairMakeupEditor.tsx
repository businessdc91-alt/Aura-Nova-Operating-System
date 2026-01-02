'use client';

import React, { useState } from 'react';
import { Plus, X, Palette } from 'lucide-react';
import { AvatarHair } from '@/services/hairService';
import { HairService } from '@/services/hairService';
import { FacialFeaturesService, Eyes, Lips, Makeup } from '@/services/facialFeaturesService';
import toast from 'react-hot-toast';

interface HairMakeupEditorProps {
  hair: AvatarHair;
  eyes: Eyes;
  lips: Lips;
  makeup: Makeup;
  onChange?: {
    hair?: (hair: AvatarHair) => void;
    eyes?: (eyes: Eyes) => void;
    lips?: (lips: Lips) => void;
    makeup?: (makeup: Makeup) => void;
  };
}

export const HairMakeupEditor: React.FC<HairMakeupEditorProps> = ({
  hair,
  eyes,
  lips,
  makeup,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'hair' | 'eyes' | 'makeup'>('hair');
  const [showAccessories, setShowAccessories] = useState(false);

  const hairStyle = HairService.getStyle(hair.styleId);
  const colorPresets = HairService.getColorPresets();
  const eyeType = FacialFeaturesService.getEyeType(eyes.type);
  const eyeColorPresets = FacialFeaturesService.getColorPresets().eyeColors;
  const lipColorPresets = FacialFeaturesService.getColorPresets().lipColors;

  const updateHair = (newHair: AvatarHair) => {
    onChange?.hair?.(newHair);
  };

  const updateEyes = (newEyes: Eyes) => {
    onChange?.eyes?.(newEyes);
  };

  const updateLips = (newLips: Lips) => {
    onChange?.lips?.(newLips);
  };

  const updateMakeup = (newMakeup: Makeup) => {
    onChange?.makeup?.(newMakeup);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('hair')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'hair'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          💇 Hair
        </button>
        <button
          onClick={() => setActiveTab('eyes')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'eyes'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          👁️ Eyes
        </button>
        <button
          onClick={() => setActiveTab('makeup')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'makeup'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          💄 Makeup
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* HAIR TAB */}
        {activeTab === 'hair' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-2">STYLE</h3>
              <p className="text-sm font-semibold">{hairStyle?.name || 'Unknown'}</p>
              <p className="text-xs text-slate-500">{hairStyle?.category}</p>
            </div>

            {/* Color */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-2">PRIMARY COLOR</h3>
              <div className="flex gap-2 flex-wrap">
                {colorPresets.map(color => (
                  <button
                    key={color}
                    onClick={() => updateHair(HairService.setPrimaryColor(hair, color))}
                    className={`w-6 h-6 rounded border-2 transition-all ${
                      hair.primaryColor === color
                        ? 'border-white scale-110'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="mt-2">
                <label className="text-xs text-slate-400 block mb-1">Custom Color</label>
                <input
                  type="color"
                  value={hair.primaryColor}
                  onChange={(e) => updateHair(HairService.setPrimaryColor(hair, e.target.value))}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Highlights */}
            {hairStyle?.canAddHighlights && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 mb-2">HIGHLIGHTS</h3>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={hair.highlights}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateHair(HairService.setHighlightColor(hair, '#FFD700', 50));
                      } else {
                        updateHair(HairService.removeHighlights(hair));
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-xs">Add Highlights</span>
                </label>

                {hair.highlights && (
                  <div className="space-y-2 pl-6">
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Color</label>
                      <input
                        type="color"
                        value={hair.secondaryColor || '#FFD700'}
                        onChange={(e) =>
                          updateHair(
                            HairService.setHighlightColor(hair, e.target.value, hair.highlightIntensity)
                          )
                        }
                        className="w-full h-8 rounded"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">
                        Intensity: {hair.highlightIntensity}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={hair.highlightIntensity}
                        onChange={(e) =>
                          updateHair(
                            HairService.setHighlightColor(
                              hair,
                              hair.secondaryColor || '#FFD700',
                              parseInt(e.target.value)
                            )
                          )
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Styling */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-2">STYLING</h3>

              <div className="space-y-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Texture</label>
                  <select
                    value={hair.texture}
                    onChange={(e) =>
                      updateHair(HairService.setTexture(hair, e.target.value as any))
                    }
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                  >
                    <option value="straight">Straight</option>
                    <option value="wavy">Wavy</option>
                    <option value="curly">Curly</option>
                    <option value="coily">Coily</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Length: {hair.length.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.1"
                    value={hair.length}
                    onChange={(e) => updateHair(HairService.setLength(hair, parseFloat(e.target.value)))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Volume: {hair.volume.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.7"
                    max="1.3"
                    step="0.1"
                    value={hair.volume}
                    onChange={(e) => updateHair(HairService.setVolume(hair, parseFloat(e.target.value)))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Shine: {hair.shine}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hair.shine}
                    onChange={(e) => updateHair(HairService.setShine(hair, parseInt(e.target.value)))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Accessories */}
            {hairStyle?.canAddAccessories && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 mb-2">ACCESSORIES</h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  {hair.accessories.map((acc, i) => (
                    <div
                      key={i}
                      className="px-2 py-1 bg-slate-800 rounded text-xs flex items-center gap-1"
                    >
                      <span className="w-3 h-3 rounded" style={{ backgroundColor: acc.color }} />
                      {acc.name}
                      <button
                        onClick={() => updateHair(HairService.removeAccessory(hair, i))}
                        className="text-slate-500 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowAccessories(!showAccessories)}
                  className="w-full px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Accessory
                </button>

                {showAccessories && (
                  <div className="mt-2 space-y-1 p-2 bg-slate-800 rounded">
                    {HairService.getAccessories().map(acc => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          updateHair(HairService.addAccessory(hair, acc.id));
                          setShowAccessories(false);
                        }}
                        className="w-full text-left px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-colors flex items-center gap-2"
                      >
                        <span className="w-3 h-3 rounded" style={{ backgroundColor: acc.color }} />
                        {acc.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* EYES TAB */}
        {activeTab === 'eyes' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-2">EYE TYPE</h3>
              <p className="text-sm font-semibold">{eyeType?.name || 'Unknown'}</p>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-2">COLOR</h3>
              <div className="flex gap-2 flex-wrap">
                {eyeColorPresets.map(color => (
                  <button
                    key={color}
                    onClick={() => updateEyes(FacialFeaturesService.setEyeColor(eyes, color))}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      eyes.primaryColor === color
                        ? 'border-white scale-110'
                        : 'border-slate-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-2">PUPILS</h3>
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Size: {eyes.pupilSize.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={eyes.pupilSize}
                  onChange={(e) =>
                    updateEyes(FacialFeaturesService.setPupilSize(eyes, parseFloat(e.target.value)))
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-2">EYEBROWS</h3>
              <select
                value={eyes.eyebrowStyle}
                onChange={(e) =>
                  updateEyes(FacialFeaturesService.setEyebrowStyle(eyes, e.target.value))
                }
                className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white mb-2"
              >
                {FacialFeaturesService.getEyebrowStyles().map(style => (
                  <option key={style.id} value={style.id}>
                    {style.name}
                  </option>
                ))}
              </select>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Thickness: {eyes.eyebrowThickness.toFixed(1)}x</label>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.1"
                  value={eyes.eyebrowThickness}
                  onChange={(e) =>
                    updateEyes(
                      FacialFeaturesService.setEyebrowThickness(eyes, parseFloat(e.target.value))
                    )
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* MAKEUP TAB */}
        {activeTab === 'makeup' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-2">LIPSTICK</h3>
              <div className="flex gap-2 flex-wrap mb-2">
                {lipColorPresets.map(color => (
                  <button
                    key={color}
                    onClick={() => updateLips(FacialFeaturesService.setLipstickColor(lips, color))}
                    className={`w-6 h-6 rounded border-2 transition-all ${
                      lips.color === color ? 'border-white scale-110' : 'border-slate-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Finish</label>
                  <select
                    value={lips.lipstickFinish}
                    onChange={(e) =>
                      updateLips(
                        FacialFeaturesService.setLipstickFinish(lips, e.target.value as any)
                      )
                    }
                    className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white"
                  >
                    <option value="matte">Matte</option>
                    <option value="satin">Satin</option>
                    <option value="glossy">Glossy</option>
                    <option value="metallic">Metallic</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Gloss: {lips.gloss}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lips.gloss}
                    onChange={(e) =>
                      updateLips(FacialFeaturesService.setLipGloss(lips, parseInt(e.target.value)))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-2">PRESETS</h3>
              <div className="space-y-1">
                {FacialFeaturesService.getMakeupPresets().map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      updateMakeup(preset.makeup as Makeup);
                      if (preset.makeup.lipstick) {
                        updateLips(preset.makeup.lipstick as Lips);
                      }
                    }}
                    className="w-full px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs text-left transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HairMakeupEditor;

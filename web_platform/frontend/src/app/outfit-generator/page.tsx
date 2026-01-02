'use client';

import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { OutfitGeneratorService, OutfitSuggestion } from '@/services/outfitGeneratorService';
import { ClothingCreatorService } from '@/services/clothingCreatorService';
import toast from 'react-hot-toast';

export default function OutfitGeneratorPage() {
  const [selectedOccasion, setSelectedOccasion] = useState<string>('casual-hangout');
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<OutfitSuggestion | null>(null);

  const occasions = OutfitGeneratorService.getAllOccasions();
  const occasions_tips = {
    'office-work': 'Professional and polished. Choose structured pieces in neutral colors.',
    'casual-hangout': 'Comfortable and relaxed. Mix and match your favorite casual pieces.',
    'date-night': 'Stylish and confident. Show off your personality with carefully chosen pieces.',
    'gym-exercise': 'Functional and flexible. Prioritize comfort and movement.',
    'beach-day': 'Light and refreshing. Bright colors and breathable fabrics are your friend.',
    'party-celebration': 'Bold and fun. Don\'t be afraid to take fashion risks and stand out.',
    'fantasy-cosplay': 'Creative and imaginative. Express your favorite characters and universes.',
    'gothic-night': 'Dark and dramatic. Deep colors and statement pieces create mystery.',
  };

  const generateOutfits = async () => {
    setLoading(true);
    try {
      const generated = OutfitGeneratorService.generateMultipleSuggestions(
        selectedOccasion,
        [], // Available clothing items (empty for now, can be populated from wardrobe)
        3
      );
      setSuggestions(generated);
      setSelectedSuggestion(generated[0]);
      toast.success('Outfits generated!');
    } catch (error) {
      toast.error('Failed to generate outfits');
    } finally {
      setLoading(false);
    }
  };

  const applyOutfit = async () => {
    if (!selectedSuggestion) return;

    try {
      // In a real scenario, this would apply the outfit to the current avatar
      toast.success(`Applied outfit: ${selectedSuggestion.name}`);
    } catch (error) {
      toast.error('Failed to apply outfit');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-slate-950 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8" />
            AI Outfit Generator
          </h1>
          <p className="text-slate-400">
            Get personalized outfit suggestions powered by AI styling
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-3 gap-6">
        {/* Left - Occasion Selector */}
        <div className="col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h2 className="font-bold mb-4">Choose Occasion</h2>

            <div className="space-y-2 mb-4">
              {occasions.map((occ) => (
                <button
                  key={occ}
                  onClick={() => setSelectedOccasion(occ)}
                  className={`w-full px-4 py-3 rounded text-left transition-colors ${
                    selectedOccasion === occ
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <p className="font-semibold">{occ.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
                  <p className="text-xs opacity-75">{occasions_tips[occ as keyof typeof occasions_tips] || 'Perfect for any style!'}</p>
                </button>
              ))}
            </div>

            {/* Tips */}
            <div className="bg-slate-950 border border-slate-700 rounded p-3 mb-4">
              <h3 className="text-sm font-semibold mb-2">💡 Styling Tips</h3>
              <p className="text-xs text-slate-400">
                {occasions_tips[selectedOccasion as keyof typeof occasions_tips] ||
                  'Choose pieces that match your personal style.'}
              </p>
            </div>

            <button
              onClick={generateOutfits}
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Outfits
                </>
              )}
            </button>
          </div>

          {/* Occasion Info */}
          {selectedOccasion && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h3 className="font-bold mb-3">📋 Occasion Details</h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-400">
                  This occasion calls for pieces that balance
                  <span className="text-purple-400 font-semibold">
                    {' '}
                    style and comfort
                  </span>
                  . Consider factors like:
                </p>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                  <li>Color coordination</li>
                  <li>Mood and atmosphere</li>
                  <li>Dress code expectations</li>
                  <li>Personal comfort</li>
                  <li>Weather and season</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Center & Right - Suggestions */}
        <div className="col-span-2">
          {suggestions.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <h3 className="text-xl font-bold mb-2">Ready to Style?</h3>
              <p className="text-slate-400">
                Select an occasion and click "Generate Outfits" to get AI-powered styling suggestions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => setSelectedSuggestion(suggestion)}
                  className={`bg-slate-900 border rounded-lg p-6 cursor-pointer transition-all ${
                    selectedSuggestion?.id === suggestion.id
                      ? 'border-purple-500 bg-slate-800'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">
                        Suggestion {index + 1}: {suggestion.name}
                      </h3>
                      <p className="text-sm text-slate-400">{suggestion.occasion}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400">
                        {suggestion.confidence}%
                      </div>
                      <p className="text-xs text-slate-400">Confidence</p>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Color Harmony */}
                    <div className="bg-slate-950 rounded p-3">
                      <p className="text-xs text-slate-400 mb-1">Color Harmony</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded"
                            style={{
                              width: `${suggestion.colorHarmony}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {suggestion.colorHarmony}
                        </span>
                      </div>
                    </div>

                    {/* Style Coherence */}
                    <div className="bg-slate-950 rounded p-3">
                      <p className="text-xs text-slate-400 mb-1">Style Coherence</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded h-2">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-rose-500 h-2 rounded"
                            style={{
                              width: `${suggestion.styleCoherence}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {suggestion.styleCoherence}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-sm">Outfit Items</h4>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.items.map((item, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs"
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="mb-4 p-3 bg-slate-950 rounded">
                    <h4 className="font-semibold mb-2 text-sm">Why This Works</h4>
                    <ul className="space-y-1 text-xs text-slate-400">
                      {suggestion.reasoning?.slice(0, 3).map((reason, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-400 mt-0.5">→</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mood Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-purple-600 bg-opacity-20 border border-purple-600 border-opacity-30 rounded-full text-xs text-purple-300">
                      {suggestion.mood}
                    </span>
                    {selectedSuggestion?.id === suggestion.id && (
                      <button
                        onClick={applyOutfit}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded font-semibold text-sm transition-colors"
                      >
                        Apply Outfit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Style Guide Section */}
      <div className="bg-slate-900 border-t border-slate-800 mt-12 p-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">✨ Style Matching Algorithm</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs">
                  1
                </span>
                Color Harmony
              </h3>
              <p className="text-sm text-slate-400">
                We analyze RGB values to ensure colors complement each other and create a cohesive
                palette.
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center text-xs">
                  2
                </span>
                Style Coherence
              </h3>
              <p className="text-sm text-slate-400">
                We match clothing styles to occasion profiles for a unified look that fits the
                context.
              </p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs">
                  3
                </span>
                Confidence Score
              </h3>
              <p className="text-sm text-slate-400">
                We calculate overall confidence by combining harmony and coherence to rate outfit
                quality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

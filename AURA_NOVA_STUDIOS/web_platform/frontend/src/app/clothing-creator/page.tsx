'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Download, Save, Palette, Grid, Settings, Trash2, Eye, Share2 } from 'lucide-react';
import { ClothingCreatorService, ClothingItem, ClothingPattern } from '@/services/clothingCreatorService';
import toast from 'react-hot-toast';

export default function ClothingCreatorPage() {
  // ============== STATE ==============
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentItem, setCurrentItem] = useState<Partial<ClothingItem>>({
    name: 'New Clothing Item',
    type: 'top',
    category: 'casual',
    baseColor: '#FF6B6B',
    fit: 'fitted',
    layers: [],
    patterns: [],
    public: false,
  });

  const [savedItems, setSavedItems] = useState<ClothingItem[]>([]);
  const [itemPreview, setItemPreview] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPatternEditor, setShowPatternEditor] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<number | null>(null);

  useEffect(() => {
    loadSavedItems();
    generatePreview();
  }, []);

  useEffect(() => {
    generatePreview();
  }, [currentItem]);

  const loadSavedItems = async () => {
    try {
      const items = await ClothingCreatorService.getPublicItems();
      setSavedItems(items);
    } catch (error) {
      console.error('Failed to load items');
    }
  };

  // ============== PREVIEW ==============
  const generatePreview = async () => {
    if (!canvasRef.current) return;

    try {
      const preview = await ClothingCreatorService.generatePreview(
        currentItem as ClothingItem,
        { width: 256, height: 384 }
      );
      setItemPreview(preview);
    } catch (error) {
      console.error('Failed to generate preview');
    }
  };

  // ============== ITEM MANAGEMENT ==============
  const saveItem = async () => {
    if (!currentItem.name?.trim()) {
      toast.error('Please enter a name');
      return;
    }

    const loadingToast = toast.loading('Saving clothing item...');

    try {
      const savedItem = await ClothingCreatorService.createItem({
        name: currentItem.name || 'Untitled',
        type: currentItem.type || 'top',
        category: currentItem.category || 'casual',
        baseColor: currentItem.baseColor || '#FF6B6B',
        fit: currentItem.fit || 'fitted',
        layers: currentItem.layers || [],
        patterns: currentItem.patterns || [],
        public: currentItem.public || false,
        preview: itemPreview,
      });

      setSavedItems([...savedItems, savedItem]);
      toast.success('Clothing item saved!', { id: loadingToast });
    } catch (error) {
      toast.error('Failed to save item', { id: loadingToast });
    }
  };

  const loadItem = (item: ClothingItem) => {
    setCurrentItem(item);
    setItemPreview(item.preview || null);
    toast.success(`Loaded: ${item.name}`);
  };

  const deleteItem = async (itemId: string) => {
    if (confirm('Delete this item permanently?')) {
      try {
        await ClothingCreatorService.deleteItem(itemId);
        setSavedItems(savedItems.filter(i => i.id !== itemId));
        toast.success('Item deleted');
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  // ============== PATTERN MANAGEMENT ==============
  const addPattern = () => {
    const newPattern: ClothingPattern = {
      id: `pattern-${Date.now()}`,
      name: 'Pattern',
      type: 'stripes',
      opacity: 0.5,
      color: '#000000',
      scale: 1,
    };

    setCurrentItem(prev => ({
      ...prev,
      patterns: [...(prev.patterns || []), newPattern],
    }));
    setShowPatternEditor(true);
  };

  const updatePattern = (index: number, updates: Partial<ClothingPattern>) => {
    const patterns = [...(currentItem.patterns || [])];
    patterns[index] = { ...patterns[index], ...updates };
    setCurrentItem(prev => ({
      ...prev,
      patterns,
    }));
  };

  const removePattern = (index: number) => {
    setCurrentItem(prev => ({
      ...prev,
      patterns: (prev.patterns || []).filter((_, i) => i !== index),
    }));
  };

  // ============== UI HELPERS ==============
  const clothingTypes = ['top', 'bottom', 'shoes', 'accessory', 'hat', 'coat', 'dress', 'full-body'];
  const categories = ['casual', 'formal', 'sport', 'fantasy', 'historical', 'futuristic', 'custom'];
  const fits = ['loose', 'fitted', 'oversized', 'slim', 'relaxed'];
  const patternTypes = ['stripes', 'checkered', 'polka-dots', 'floral', 'geometric', 'gradient'];
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-900 via-slate-900 to-slate-950 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">👔 Clothing Creator</h1>
          <p className="text-slate-400">Design custom clothing items for your avatars</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-4 gap-6">
        {/* Left - Controls */}
        <div className="col-span-1 space-y-4">
          {/* Item Info */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Item Details
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Name</label>
                <input
                  type="text"
                  value={currentItem.name || ''}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-pink-500"
                  placeholder="Clothing name"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Type</label>
                <select
                  value={currentItem.type || 'top'}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-pink-500"
                >
                  {clothingTypes.map(t => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Category</label>
                <select
                  value={currentItem.category || 'casual'}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-pink-500"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Fit</label>
                <select
                  value={currentItem.fit || 'fitted'}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, fit: e.target.value as any }))}
                  className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:border-pink-500"
                >
                  {fits.map(f => (
                    <option key={f} value={f}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentItem.public || false}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, public: e.target.checked }))}
                />
                <span>Make Public</span>
              </label>
            </div>
          </div>

          {/* Color Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Base Color
            </h3>

            <div className="flex flex-wrap gap-2 mb-3">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => setCurrentItem(prev => ({ ...prev, baseColor: color }))}
                  className={`w-8 h-8 rounded border-2 transition-all ${
                    currentItem.baseColor === color
                      ? 'border-white scale-110'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <input
              type="color"
              value={currentItem.baseColor || '#FF6B6B'}
              onChange={(e) => setCurrentItem(prev => ({ ...prev, baseColor: e.target.value }))}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>

          {/* Patterns */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Grid className="w-4 h-4" />
              Patterns
            </h3>

            {(currentItem.patterns || []).length === 0 ? (
              <p className="text-xs text-slate-500 mb-3">No patterns yet</p>
            ) : (
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {(currentItem.patterns || []).map((pattern, idx) => (
                  <div key={idx} className="bg-slate-800 p-2 rounded flex items-center justify-between">
                    <span className="text-xs text-slate-300">{pattern.name}</span>
                    <button
                      onClick={() => removePattern(idx)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={addPattern}
              className="w-full px-3 py-2 bg-pink-600 hover:bg-pink-700 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Pattern
            </button>
          </div>

          {/* Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
            <button
              onClick={saveItem}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Item
            </button>
            <button
              onClick={() => setItemPreview(null)}
              className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded font-semibold transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Center - Preview & Pattern Editor */}
        <div className="col-span-2 space-y-4">
          {/* Main Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h2 className="font-bold mb-4">Preview</h2>
            {itemPreview ? (
              <img src={itemPreview} alt={currentItem.name} className="w-full rounded-lg bg-slate-950" />
            ) : (
              <div className="w-full h-96 bg-slate-950 rounded-lg flex items-center justify-center text-slate-500">
                Configure item to see preview
              </div>
            )}
          </div>

          {/* Pattern Editor */}
          {showPatternEditor && selectedPattern !== null && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
              <h3 className="font-bold mb-3">Edit Pattern</h3>
              {(currentItem.patterns || []).length > selectedPattern && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Pattern Type</label>
                    <select
                      value={(currentItem.patterns || [])[selectedPattern]?.type || 'stripes'}
                      onChange={(e) =>
                        updatePattern(selectedPattern, { type: e.target.value as any })
                      }
                      className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm"
                    >
                      {patternTypes.map(t => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Opacity: {((currentItem.patterns || [])[selectedPattern]?.opacity || 0.5 * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={(currentItem.patterns || [])[selectedPattern]?.opacity || 0.5}
                      onChange={(e) =>
                        updatePattern(selectedPattern, { opacity: parseFloat(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Scale: {((currentItem.patterns || [])[selectedPattern]?.scale || 1).toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={(currentItem.patterns || [])[selectedPattern]?.scale || 1}
                      onChange={(e) =>
                        updatePattern(selectedPattern, { scale: parseFloat(e.target.value) })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Color</label>
                    <input
                      type="color"
                      value={(currentItem.patterns || [])[selectedPattern]?.color || '#000000'}
                      onChange={(e) =>
                        updatePattern(selectedPattern, { color: e.target.value })
                      }
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setShowPatternEditor(false);
                      setSelectedPattern(null);
                    }}
                    className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right - Library */}
        <div className="col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 sticky top-6">
            <h2 className="font-bold mb-4">Saved Items</h2>

            {savedItems.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No items saved yet</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {savedItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-slate-800 rounded p-2 hover:bg-slate-700 transition-colors group"
                  >
                    <div className="flex gap-2">
                      <div className="flex-1 cursor-pointer" onClick={() => loadItem(item)}>
                        <p className="text-xs font-semibold line-clamp-1">{item.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{item.type}</p>
                      </div>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

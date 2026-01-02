'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Share2, Copy } from 'lucide-react';
import { ClothingCreatorService, ClothingItem, Outfit } from '@/services/clothingCreatorService';
import toast from 'react-hot-toast';

interface OutfitWithClothing extends Outfit {
  items?: ClothingItem[];
}

export default function OutfitManagerPage() {
  // ============== STATE ==============
  const [outfits, setOutfits] = useState<OutfitWithClothing[]>([]);
  const [currentOutfit, setCurrentOutfit] = useState<OutfitWithClothing | null>(null);
  const [allClothing, setAllClothing] = useState<ClothingItem[]>([]);
  const [outfitName, setOutfitName] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState('all');
  const [showNewOutfitModal, setShowNewOutfitModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedOutfits, savedClothing] = await Promise.all([
        ClothingCreatorService.getAllOutfits(),
        ClothingCreatorService.getPublicItems(),
      ]);

      setOutfits(savedOutfits as OutfitWithClothing[]);
      setAllClothing(savedClothing);

      if (savedOutfits.length > 0) {
        setCurrentOutfit(savedOutfits[0] as OutfitWithClothing);
        setSelectedItems(new Set(savedOutfits[0].itemIds || []));
      }
    } catch (error) {
      console.error('Failed to load data');
      toast.error('Failed to load outfits');
    }
  };

  // ============== OUTFIT MANAGEMENT ==============
  const createNewOutfit = async () => {
    if (!outfitName.trim()) {
      toast.error('Please enter an outfit name');
      return;
    }

    try {
      const newOutfit: Outfit = {
        id: `outfit-${Date.now()}`,
        name: outfitName,
        itemIds: Array.from(selectedItems),
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
      };

      const created = await ClothingCreatorService.createOutfit(newOutfit);
      setOutfits([...outfits, created as OutfitWithClothing]);
      setCurrentOutfit(created as OutfitWithClothing);
      setOutfitName('');
      setSelectedItems(new Set());
      setShowNewOutfitModal(false);
      toast.success('Outfit created!');
    } catch (error) {
      toast.error('Failed to create outfit');
    }
  };

  const saveCurrentOutfit = async () => {
    if (!currentOutfit) return;

    try {
      const updated = {
        ...currentOutfit,
        itemIds: Array.from(selectedItems),
        updatedAt: new Date(),
      };

      await ClothingCreatorService.updateOutfit(currentOutfit.id, updated);
      setCurrentOutfit(updated);
      toast.success('Outfit saved!');
    } catch (error) {
      toast.error('Failed to save outfit');
    }
  };

  const deleteOutfit = async (outfitId: string) => {
    if (!confirm('Delete this outfit permanently?')) return;

    try {
      await ClothingCreatorService.deleteOutfit(outfitId);
      const newOutfits = outfits.filter(o => o.id !== outfitId);
      setOutfits(newOutfits);
      setCurrentOutfit(newOutfits[0] || null);
      setSelectedItems(new Set());
      toast.success('Outfit deleted');
    } catch (error) {
      toast.error('Failed to delete outfit');
    }
  };

  const duplicateOutfit = async (outfit: OutfitWithClothing) => {
    const newName = prompt('New outfit name:', `${outfit.name} (Copy)`);
    if (!newName) return;

    try {
      const duplicate: Outfit = {
        id: `outfit-${Date.now()}`,
        name: newName,
        itemIds: [...outfit.itemIds],
        tags: outfit.tags,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
      };

      const created = await ClothingCreatorService.createOutfit(duplicate);
      setOutfits([...outfits, created as OutfitWithClothing]);
      toast.success('Outfit duplicated!');
    } catch (error) {
      toast.error('Failed to duplicate outfit');
    }
  };

  const publishOutfit = async (outfitId: string) => {
    try {
      const outfit = outfits.find(o => o.id === outfitId);
      if (!outfit) return;

      await ClothingCreatorService.updateOutfit(outfitId, {
        ...outfit,
        isPublic: true,
      });

      const updated = outfits.map(o =>
        o.id === outfitId ? { ...o, isPublic: true } : o
      );
      setOutfits(updated);
      if (currentOutfit?.id === outfitId) {
        setCurrentOutfit({ ...currentOutfit, isPublic: true });
      }
      toast.success('Outfit published!');
    } catch (error) {
      toast.error('Failed to publish outfit');
    }
  };

  // ============== ITEM SELECTION ==============
  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const clearItems = () => {
    setSelectedItems(new Set());
  };

  // ============== FILTERING ==============
  const filteredClothing = allClothing.filter(item =>
    filterCategory === 'all' ? true : item.type === filterCategory
  );

  const selectedClothingItems = allClothing.filter(item =>
    selectedItems.has(item.id)
  );

  const clothingByType = filteredClothing.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, ClothingItem[]>);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-900 via-slate-900 to-slate-950 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">👗 Outfit Manager</h1>
          <p className="text-slate-400">Create and manage outfit combinations</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 grid grid-cols-4 gap-6">
        {/* Left - Outfit List */}
        <div className="col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h2 className="font-bold mb-4">My Outfits</h2>

            {outfits.length === 0 ? (
              <p className="text-xs text-slate-500 mb-4">No outfits yet</p>
            ) : (
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {outfits.map(outfit => (
                  <div
                    key={outfit.id}
                    onClick={() => {
                      setCurrentOutfit(outfit);
                      setSelectedItems(new Set(outfit.itemIds || []));
                    }}
                    className={`p-2 rounded cursor-pointer transition-colors group ${
                      currentOutfit?.id === outfit.id
                        ? 'bg-pink-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-semibold">{outfit.name}</p>
                        <p className="text-xs text-slate-500">{outfit.itemIds?.length || 0} items</p>
                      </div>
                      {outfit.isPublic && (
                        <span className="text-xs px-2 py-0.5 bg-cyan-600 rounded">
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowNewOutfitModal(true)}
              className="w-full px-3 py-2 bg-pink-600 hover:bg-pink-700 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Outfit
            </button>
          </div>

          {/* Actions */}
          {currentOutfit && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
              <button
                onClick={saveCurrentOutfit}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>

              <button
                onClick={() => duplicateOutfit(currentOutfit)}
                className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>

              <button
                onClick={() => publishOutfit(currentOutfit.id)}
                className="w-full px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-sm font-semibold flex items-center justify-center gap-2"
                disabled={currentOutfit.isPublic}
              >
                <Share2 className="w-4 h-4" />
                {currentOutfit.isPublic ? 'Published' : 'Publish'}
              </button>

              <button
                onClick={() => deleteOutfit(currentOutfit.id)}
                className="w-full px-3 py-2 bg-red-900 hover:bg-red-800 rounded text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Center - Selected Items Preview */}
        <div className="col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h2 className="font-bold mb-4">
              Outfit Preview ({selectedItems.size} items selected)
            </h2>

            {selectedItems.size === 0 ? (
              <div className="bg-slate-950 rounded-lg h-96 flex items-center justify-center border border-slate-700">
                <div className="text-center">
                  <p className="text-3xl mb-2">👗</p>
                  <p className="text-slate-400">Select clothing items to preview outfit</p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 rounded-lg p-6 min-h-96">
                <div className="grid grid-cols-2 gap-4">
                  {selectedClothingItems.map(item => (
                    <div
                      key={item.id}
                      className="bg-slate-800 rounded-lg p-3 border border-slate-700"
                    >
                      <div
                        className="w-full h-24 rounded mb-2 border border-slate-600"
                        style={{
                          backgroundColor: item.baseColor || '#333333',
                          backgroundImage: item.patterns && item.patterns.length > 0
                            ? `repeating-linear-gradient(45deg, transparent, transparent 10px, ${item.patterns[0]?.color || '#444444'} 10px, ${item.patterns[0]?.color || '#444444'} 20px)`
                            : 'none',
                        }}
                      />
                      <h3 className="text-xs font-semibold">{item.name}</h3>
                      <p className="text-xs text-slate-500">{item.type}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={clearItems}
                  className="mt-4 w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm font-semibold transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right - Clothing Selection */}
        <div className="col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <h3 className="font-bold mb-3">Select Items</h3>

            <div className="mb-3">
              <label className="text-xs text-slate-400 block mb-1">Type</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs"
              >
                <option value="all">All Types</option>
                <option value="top">Tops</option>
                <option value="bottom">Bottoms</option>
                <option value="shoes">Shoes</option>
                <option value="coat">Coats</option>
                <option value="hat">Hats</option>
                <option value="accessory">Accessories</option>
              </select>
            </div>

            <div className="space-y-1 max-h-96 overflow-y-auto">
              {Object.entries(clothingByType).map(([type, items]) => (
                <div key={type}>
                  <p className="text-xs font-semibold text-slate-400 mt-2 mb-1 uppercase">
                    {type}
                  </p>
                  {items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`w-full text-left px-2 py-1 text-xs rounded transition-colors mb-1 ${
                        selectedItems.has(item.id)
                          ? 'bg-pink-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.baseColor || '#666666' }}
                        />
                        <span>{item.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ))}

              {filteredClothing.length === 0 && (
                <p className="text-xs text-slate-600 py-2">No items in this category</p>
              )}
            </div>

            <a
              href="/clothing-creator"
              className="block w-full mt-4 px-3 py-2 bg-pink-600 hover:bg-pink-700 rounded text-xs font-semibold text-center transition-colors"
            >
              Design Clothing
            </a>
          </div>
        </div>
      </div>

      {/* New Outfit Modal */}
      {showNewOutfitModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowNewOutfitModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Create New Outfit</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs text-slate-400 block mb-2">Outfit Name</label>
                <input
                  type="text"
                  value={outfitName}
                  onChange={(e) => setOutfitName(e.target.value)}
                  placeholder="e.g., Summer Casual"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                  autoFocus
                />
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">
                  Selected items: {selectedItems.size}
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedClothingItems.map(item => (
                    <div
                      key={item.id}
                      className="text-xs px-2 py-1 bg-slate-800 rounded flex items-center justify-between"
                    >
                      <span>{item.name}</span>
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="text-slate-500 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNewOutfitModal(false)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewOutfit}
                className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded font-semibold transition-colors"
              >
                Create Outfit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

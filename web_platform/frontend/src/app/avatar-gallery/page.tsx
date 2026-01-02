'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Download, Eye } from 'lucide-react';
import { AvatarService, Avatar } from '@/services/avatarService';
import { AvatarPreview } from '@/components/avatar/AvatarPreview';
import toast from 'react-hot-toast';

export default function AvatarGalleryPage() {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [filteredAvatars, setFilteredAvatars] = useState<Avatar[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('all');
  const [selectedHeadShape, setSelectedHeadShape] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar | null>(null);

  useEffect(() => {
    loadAvatars();
  }, []);

  useEffect(() => {
    filterAndSortAvatars();
  }, [avatars, searchQuery, selectedBodyType, selectedHeadShape, sortBy]);

  const loadAvatars = async () => {
    try {
      const allAvatars = await AvatarService.getAllAvatars();
      // Filter to public avatars
      const publicAvatars = allAvatars.filter((a: any) => a.isPublic !== false);
      setAvatars(publicAvatars);

      // Load favorites from localStorage
      const saved = localStorage.getItem('avatarFavorites');
      if (saved) {
        setFavorites(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Failed to load avatars');
      toast.error('Failed to load avatars');
    }
  };

  const filterAndSortAvatars = () => {
    let filtered = avatars.filter(avatar => {
      const matchesSearch =
        avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        avatar.body.bodyType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBodyType = selectedBodyType === 'all' || avatar.body.bodyType === selectedBodyType;

      const matchesHeadShape = selectedHeadShape === 'all' || avatar.body.headShape === selectedHeadShape;

      return matchesSearch && matchesBodyType && matchesHeadShape;
    });

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => (b.metadata?.createdAt?.getTime() || 0) - (a.metadata?.createdAt?.getTime() || 0));
        break;
      case 'popular':
        // Views not implemented yet, sort by name for now
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredAvatars(filtered);
  };

  const toggleFavorite = (avatarId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(avatarId)) {
      newFavorites.delete(avatarId);
    } else {
      newFavorites.add(avatarId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('avatarFavorites', JSON.stringify(Array.from(newFavorites)));
  };

  const cloneAvatar = async (avatar: Avatar) => {
    const newName = prompt('New avatar name:', `${avatar.name} (Copy)`);
    if (!newName) return;

    try {
      const cloned = await AvatarService.cloneAvatar(avatar.id, newName);
      toast.success('Avatar cloned! Go to builder to customize it.');
    } catch (error) {
      toast.error('Failed to clone avatar');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900 via-slate-900 to-slate-950 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">🎨 Avatar Gallery</h1>
          <p className="text-slate-400">Discover and customize community avatars</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Search & Filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-xs text-slate-400 block mb-2">Search</label>
              <input
                type="text"
                placeholder="Search avatars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-2">Body Type</label>
              <select
                value={selectedBodyType}
                onChange={(e) => setSelectedBodyType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              >
                <option value="all">All Types</option>
                <option value="slim">Slim</option>
                <option value="athletic">Athletic</option>
                <option value="curvy">Curvy</option>
                <option value="broad">Broad</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-2">Head Shape</label>
              <select
                value={selectedHeadShape}
                onChange={(e) => setSelectedHeadShape(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              >
                <option value="all">All Shapes</option>
                <option value="round">Round</option>
                <option value="square">Square</option>
                <option value="oval">Oval</option>
                <option value="heart">Heart</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          <p className="text-xs text-slate-500">{filteredAvatars.length} avatars found</p>
        </div>

        {/* Avatar Grid */}
        {filteredAvatars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No avatars found</p>
            <p className="text-slate-600 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAvatars.map(avatar => (
              <div
                key={avatar.id}
                className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden hover:border-cyan-600 transition-colors group cursor-pointer"
              >
                {/* Preview */}
                <div className="bg-slate-950 p-3 aspect-square flex items-center justify-center relative overflow-hidden">
                  {/* Canvas preview would go here */}
                  <div className="text-center">
                    <div className="text-4xl mb-2">🧑</div>
                    <p className="text-xs text-slate-500">{avatar.name}</p>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedAvatar(avatar)}
                      className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => cloneAvatar(avatar)}
                      className="p-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
                      title="Clone Avatar"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(avatar.id)}
                      className={`p-2 rounded transition-colors ${
                        favorites.has(avatar.id)
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      title="Add to Favorites"
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={favorites.has(avatar.id) ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">{avatar.name}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{avatar.body.bodyType}</span>
                    <span className="text-slate-600">{avatar.public ? 'Public' : 'Private'}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 flex gap-1 text-xs">
                    <span className="px-2 py-1 bg-slate-800 rounded">
                      {avatar.body.headShape}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAvatar && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedAvatar(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedAvatar.name}</h2>
                  <p className="text-slate-400">@{selectedAvatar.id.slice(0, 8)}</p>
                </div>
                <button
                  onClick={() => setSelectedAvatar(null)}
                  className="text-slate-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Preview */}
                <div className="bg-slate-950 rounded-lg p-4 aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🧑</div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs text-slate-400 mb-1">Body Type</h3>
                    <p className="font-semibold">{selectedAvatar.body.bodyType}</p>
                  </div>

                  <div>
                    <h3 className="text-xs text-slate-400 mb-1">Head Shape</h3>
                    <p className="font-semibold">{selectedAvatar.body.headShape}</p>
                  </div>

                  <div>
                    <h3 className="text-xs text-slate-400 mb-1">Skin Tone</h3>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border border-slate-700"
                        style={{ backgroundColor: selectedAvatar.body.skinTone }}
                      />
                      <p className="font-semibold">{selectedAvatar.body.skinTone}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs text-slate-400 mb-1">Status</h3>
                    <p className="font-semibold">{selectedAvatar.public ? 'Public' : 'Private'}</p>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      onClick={() => {
                        cloneAvatar(selectedAvatar);
                        setSelectedAvatar(null);
                      }}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold transition-colors"
                    >
                      Clone Avatar
                    </button>
                    <button
                      onClick={() => toggleFavorite(selectedAvatar.id)}
                      className={`px-4 py-2 rounded font-semibold transition-colors ${
                        favorites.has(selectedAvatar.id)
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={favorites.has(selectedAvatar.id) ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { ArtLibraryService, ArtPiece } from '@/services/artLibraryService';
import Image from 'next/image';

export default function ArtGalleryPage() {
  const [pieces, setPieces] = useState<ArtPiece[]>([]);
  const [filteredPieces, setFilteredPieces] = useState<ArtPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'trending' | 'popular'>('newest');
  const [selectedPiece, setSelectedPiece] = useState<ArtPiece | null>(null);
  const [stats, setStats] = useState<{ total: number; featured: number }>({ total: 0, featured: 0 });

  const artTypes: ArtPiece['type'][] = ['background', 'sprite', 'animation', 'procedural', 'clothing', 'avatar', 'hand-drawn'];

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const publicPieces = await ArtLibraryService.getPublicPieces();
      setPieces(publicPieces);
      setFilteredPieces(publicPieces);
      setStats({
        total: publicPieces.length,
        featured: publicPieces.filter((p) => p.featured).length,
      });
    } catch (error) {
      console.error('Failed to load gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...pieces];

    // Type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter((p) => p.type === selectedFilter);
    }

    // Featured only
    if (selectedFilter === 'featured') {
      filtered = filtered.filter((p) => p.featured);
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((p) => selectedTags.some((tag) => p.tags.includes(tag)));
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.metadata.createdAt).getTime() - new Date(a.metadata.createdAt).getTime());
    }

    setFilteredPieces(filtered);
  }, [pieces, selectedFilter, searchQuery, selectedTags, sortBy]);

  const allTags = Array.from(new Set(pieces.flatMap((p) => p.tags))).sort();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const useInStudio = async (piece: ArtPiece) => {
    // Store selected piece for use in art studio
    localStorage.setItem('selectedArtLibraryPiece', JSON.stringify(piece));
    window.location.href = '/art-studio';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold mb-2">Art Gallery</h1>
        <p className="text-slate-400 mb-4">Explore and use creations from the community</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <p className="text-slate-400 text-sm">Total Pieces</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
            <p className="text-slate-400 text-sm">Featured</p>
            <p className="text-2xl font-bold">{stats.featured}</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto mb-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search gallery..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Type</label>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                All Types
              </button>
              <button
                onClick={() => setSelectedFilter('featured')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  selectedFilter === 'featured'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                }`}
              >
                ⭐ Featured
              </button>
              {artTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFilter(type)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors capitalize ${
                    selectedFilter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'trending' | 'popular')}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="trending">Trending</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">Tags</label>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 6).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading gallery...</p>
          </div>
        ) : filteredPieces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400 mb-4">No pieces found</p>
            <button
              onClick={() => {
                setSelectedFilter('all');
                setSearchQuery('');
                setSelectedTags([]);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredPieces.map((piece) => (
              <div
                key={piece.id}
                onClick={() => setSelectedPiece(piece)}
                className="bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-blue-500 transition-colors cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className="relative w-full h-48 bg-slate-800 overflow-hidden">
                  {piece.thumbnail ? (
                    <img
                      src={piece.thumbnail}
                      alt={piece.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">No preview</div>
                  )}
                  {piece.featured && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                      ⭐ Featured
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-white line-clamp-2">{piece.title}</h3>
                  <p className="text-sm text-slate-400 mb-2 line-clamp-2">{piece.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 capitalize">{piece.type}</span>
                    <span className="text-slate-500">{piece.metadata.width}x{piece.metadata.height}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedPiece && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPiece(null)}
        >
          <div
            className="bg-slate-900 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="w-full h-96 bg-slate-800 flex items-center justify-center overflow-hidden">
              {selectedPiece.fullImage ? (
                <img src={selectedPiece.fullImage} alt={selectedPiece.title} className="w-full h-full object-contain" />
              ) : (
                <div className="text-slate-500">No preview available</div>
              )}
            </div>

            {/* Details */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{selectedPiece.title}</h2>
              <p className="text-slate-400 mb-4">{selectedPiece.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                  <p className="text-slate-500">Type</p>
                  <p className="text-white capitalize">{selectedPiece.type}</p>
                </div>
                <div>
                  <p className="text-slate-500">Dimensions</p>
                  <p className="text-white">{selectedPiece.metadata.width}x{selectedPiece.metadata.height}</p>
                </div>
                <div>
                  <p className="text-slate-500">Created</p>
                  <p className="text-white">{new Date(selectedPiece.metadata.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Author</p>
                  <p className="text-white">{selectedPiece.metadata.author || 'Anonymous'}</p>
                </div>
              </div>

              {/* Tags */}
              {selectedPiece.tags.length > 0 && (
                <div className="mb-6">
                  <p className="text-slate-500 text-sm mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPiece.tags.map((tag) => (
                      <span key={tag} className="bg-blue-900 text-blue-100 px-3 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => useInStudio(selectedPiece)}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                >
                  Use in Studio
                </button>
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = selectedPiece.fullImage;
                    a.download = `${selectedPiece.title}.png`;
                    a.click();
                  }}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={() => setSelectedPiece(null)}
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

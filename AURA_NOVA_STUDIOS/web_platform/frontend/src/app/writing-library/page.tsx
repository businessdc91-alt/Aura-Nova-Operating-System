'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Download, Edit, Plus, Search, Calendar, Eye } from 'lucide-react';
import { WritingService, WritingDocument } from '@/services/writingService';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function WritingLibraryPage() {
  const [documents, setDocuments] = useState<WritingDocument[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<WritingDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'alphabetical'>('recent');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await WritingService.getAllDocuments();
      setDocuments(docs);
      setFilteredDocs(docs);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...documents];

    // Format filter
    if (selectedFormat !== 'all') {
      filtered = filtered.filter(doc => doc.format === selectedFormat);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(query) ||
        doc.content.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.metadata.updatedAt).getTime() - new Date(b.metadata.updatedAt).getTime());
    } else if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredDocs(filtered);
  }, [documents, searchQuery, selectedFormat, sortBy]);

  const deleteDocument = async (id: string) => {
    if (confirm('Delete this document permanently?')) {
      try {
        await WritingService.deleteDocument(id);
        setDocuments(docs => docs.filter(d => d.id !== id));
        toast.success('Document deleted');
      } catch (error) {
        toast.error('Failed to delete document');
      }
    }
  };

  const exportDocument = async (doc: WritingDocument, format: 'txt' | 'md') => {
    try {
      const blob = format === 'txt' 
        ? WritingService.exportAsText(doc)
        : WritingService.exportAsMarkdown(doc);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title}.${format === 'txt' ? 'txt' : 'md'}`;
      a.click();
      toast.success('Document exported!');
    } catch (error) {
      toast.error('Failed to export document');
    }
  };

  const getFormatColor = (format: WritingDocument['format']) => {
    const colors: Record<string, string> = {
      'draft': 'bg-blue-900',
      'young-readers': 'bg-pink-900',
      'full-novel': 'bg-purple-900',
      'research': 'bg-amber-900',
      'summary': 'bg-emerald-900',
      'compiled': 'bg-slate-800',
    };
    return colors[format] || 'bg-slate-800';
  };

  const getFormatLabel = (format: WritingDocument['format']) => {
    const labels: Record<string, string> = {
      'draft': '📝 Draft',
      'young-readers': '👶 Young Readers',
      'full-novel': '📚 Full Novel',
      'research': '🔬 Research',
      'summary': '📄 Summary',
      'compiled': '✅ Compiled',
    };
    return labels[format] || format;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-slate-950 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">✍️ My Writing Projects</h1>
              <p className="text-slate-400">Organize and manage all your literary works</p>
            </div>
            <Link
              href="/literature-zone"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Document
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <p className="text-slate-400 text-sm">Total Documents</p>
              <p className="text-2xl font-bold">{documents.length}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <p className="text-slate-400 text-sm">Total Words</p>
              <p className="text-2xl font-bold">{documents.reduce((sum, d) => sum + d.metadata.wordCount, 0).toLocaleString()}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <p className="text-slate-400 text-sm">Reading Time</p>
              <p className="text-2xl font-bold">{documents.reduce((sum, d) => sum + (d.metadata.readingTime || 0), 0)}h</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <p className="text-slate-400 text-sm">Recent Update</p>
              <p className="text-sm font-bold">
                {documents.length > 0 
                  ? new Date(documents[0].metadata.updatedAt).toLocaleDateString()
                  : 'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto p-6 mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-3 gap-4">
          {/* Format Filter */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Format</label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Formats</option>
              <option value="draft">📝 Draft</option>
              <option value="young-readers">👶 Young Readers</option>
              <option value="full-novel">📚 Full Novel</option>
              <option value="research">🔬 Research</option>
              <option value="summary">📄 Summary</option>
              <option value="compiled">✅ Compiled</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          {/* Info */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Results</label>
            <div className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg flex items-center">
              <span className="text-white font-semibold">{filteredDocs.length}</span>
              <span className="text-slate-500 ml-2">document{filteredDocs.length !== 1 ? 's' : ''} found</span>
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading your documents...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-slate-900 border border-dashed border-slate-800 rounded-lg p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 mb-4">No documents found</p>
            <Link
              href="/literature-zone"
              className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Create Your First Document
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden hover:border-blue-500 transition-colors group"
              >
                {/* Header */}
                <div className={`${getFormatColor(doc.format)} p-4 border-b border-slate-800`}>
                  <div className="flex items-start justify-between mb-2">
                    <FileText className="w-5 h-5 text-slate-300" />
                    <span className={`text-xs px-2 py-1 rounded-full ${getFormatColor(doc.format)} text-white border border-slate-700`}>
                      {getFormatLabel(doc.format)}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg line-clamp-2">{doc.title}</h3>
                </div>

                {/* Content Preview */}
                <div className="p-4 bg-slate-950">
                  <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                    {doc.content.substring(0, 150)}...
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-800">
                    <div>
                      <p className="text-slate-600">Words</p>
                      <p className="font-semibold text-white">{doc.metadata.wordCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Reading</p>
                      <p className="font-semibold text-white">{doc.metadata.readingTime || 1}m</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Updated</p>
                      <p className="font-semibold text-white text-xs">
                        {new Date(doc.metadata.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/literature-zone?docId=${doc.id}`}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => exportDocument(doc, 'txt')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm transition-colors"
                      title="Export as TXT"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="px-3 py-2 bg-red-900 hover:bg-red-800 rounded text-sm transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

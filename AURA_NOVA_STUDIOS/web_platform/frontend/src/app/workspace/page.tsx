'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import {
  FolderKanban,
  Search,
  Filter,
  Download,
  Trash2,
  Copy,
  Eye,
  FileCode,
  FileImage,
  FileText,
  Folder,
  Plus,
  MoreVertical,
  Clock,
  SortAsc,
  Grid3X3,
  List,
  Gamepad2,
  Palette,
  Boxes,
  Combine,
  ExternalLink,
} from 'lucide-react';

// ============== TYPES ==============
interface Asset {
  id: string;
  name: string;
  type: 'code' | 'image' | 'sprite' | 'component' | 'project';
  source: 'dojo' | 'art-studio' | 'constructor' | 'script-fusion' | 'upload';
  content?: string;
  url?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
  id: string;
  name: string;
  description: string;
  assets: string[];
  engine?: 'unreal' | 'unity' | 'godot' | 'phaser';
  createdAt: Date;
  updatedAt: Date;
}

const SOURCE_ICONS = {
  dojo: Gamepad2,
  'art-studio': Palette,
  constructor: Boxes,
  'script-fusion': Combine,
  upload: Folder,
};

const SOURCE_COLORS = {
  dojo: 'text-red-400',
  'art-studio': 'text-purple-400',
  constructor: 'text-cyan-400',
  'script-fusion': 'text-blue-400',
  upload: 'text-slate-400',
};

const TYPE_ICONS = {
  code: FileCode,
  image: FileImage,
  sprite: FileImage,
  component: Boxes,
  project: Folder,
};

export default function WorkspacePage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState('assets');

  useEffect(() => {
    // Load assets and projects from localStorage
    const savedAssets = localStorage.getItem('workspace_assets');
    const savedProjects = localStorage.getItem('dojo_projects');

    if (savedAssets) {
      setAssets(JSON.parse(savedAssets));
    } else {
      // Demo assets
      setAssets([
        {
          id: '1',
          name: 'PlayerCharacter.h',
          type: 'code',
          source: 'dojo',
          content: '// Unreal Engine Player Character Header',
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(Date.now() - 86400000),
        },
        {
          id: '2',
          name: 'PlayerCharacter.cpp',
          type: 'code',
          source: 'dojo',
          content: '// Unreal Engine Player Character Implementation',
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(Date.now() - 86400000),
        },
        {
          id: '3',
          name: 'hero_sprite.png',
          type: 'sprite',
          source: 'art-studio',
          metadata: { frames: 8, fps: 12 },
          createdAt: new Date(Date.now() - 43200000),
          updatedAt: new Date(Date.now() - 43200000),
        },
        {
          id: '4',
          name: 'ActionButton.tsx',
          type: 'component',
          source: 'constructor',
          content: '// React component with variants',
          createdAt: new Date(Date.now() - 21600000),
          updatedAt: new Date(Date.now() - 21600000),
        },
        {
          id: '5',
          name: 'merged_utils.ts',
          type: 'code',
          source: 'script-fusion',
          content: '// Merged utility functions',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  const saveAssets = (updated: Asset[]) => {
    setAssets(updated);
    localStorage.setItem('workspace_assets', JSON.stringify(updated));
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesSource = filterSource === 'all' || asset.source === filterSource;
    return matchesSearch && matchesType && matchesSource;
  });

  const deleteAsset = (id: string) => {
    if (!confirm('Delete this asset?')) return;
    const updated = assets.filter((a) => a.id !== id);
    saveAssets(updated);
    toast.success('Asset deleted');
    if (selectedAsset?.id === id) setSelectedAsset(null);
  };

  const copyAsset = (asset: Asset) => {
    if (asset.content) {
      navigator.clipboard.writeText(asset.content);
      toast.success('Copied to clipboard');
    }
  };

  const downloadAsset = (asset: Asset) => {
    if (!asset.content) {
      toast.error('No content to download');
      return;
    }
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(asset.content));
    element.setAttribute('download', asset.name);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded ${asset.name}`);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <FolderKanban size={40} className="text-emerald-500" /> Workspace
        </h1>
        <p className="text-slate-400">
          Your central hub for all created assets, projects, and downloads
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <FileCode size={16} /> Assets ({assets.length})
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Folder size={16} /> Projects ({projects.length})
          </TabsTrigger>
          <TabsTrigger value="quick-links" className="flex items-center gap-2">
            <ExternalLink size={16} /> Quick Links
          </TabsTrigger>
        </TabsList>

        {/* ============== ASSETS TAB ============== */}
        <TabsContent value="assets">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="code">Code</option>
              <option value="image">Images</option>
              <option value="sprite">Sprites</option>
              <option value="component">Components</option>
            </select>

            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm"
            >
              <option value="all">All Sources</option>
              <option value="dojo">The Dojo</option>
              <option value="art-studio">Art Studio</option>
              <option value="constructor">Constructor</option>
              <option value="script-fusion">Script Fusion</option>
            </select>

            <div className="flex gap-1 bg-slate-800 rounded p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition ${
                  viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400'
                }`}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition ${
                  viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Assets Grid/List */}
          {filteredAssets.length === 0 ? (
            <Card className="bg-slate-800 border-slate-700 p-12 text-center">
              <FolderKanban size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No assets found</p>
              <p className="text-slate-500 text-sm">
                Create assets in The Dojo, Art Studio, or other tools
              </p>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => {
                const TypeIcon = TYPE_ICONS[asset.type];
                const SourceIcon = SOURCE_ICONS[asset.source];
                const sourceColor = SOURCE_COLORS[asset.source];

                return (
                  <Card
                    key={asset.id}
                    className="bg-slate-800 border-slate-700 hover:border-slate-500 cursor-pointer transition"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center">
                          <TypeIcon size={20} className="text-slate-300" />
                        </div>
                        <div className={`flex items-center gap-1 ${sourceColor}`}>
                          <SourceIcon size={14} />
                          <span className="text-xs capitalize">{asset.source.replace('-', ' ')}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-white truncate mb-1">{asset.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} /> {formatDate(asset.updatedAt)}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-slate-800 border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Name</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Source</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-slate-300">Updated</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.map((asset) => {
                    const TypeIcon = TYPE_ICONS[asset.type];
                    const SourceIcon = SOURCE_ICONS[asset.source];
                    const sourceColor = SOURCE_COLORS[asset.source];

                    return (
                      <tr
                        key={asset.id}
                        className="border-t border-slate-700 hover:bg-slate-700/50 cursor-pointer"
                        onClick={() => setSelectedAsset(asset)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <TypeIcon size={18} className="text-slate-400" />
                            <span className="text-white">{asset.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400 capitalize">{asset.type}</td>
                        <td className="px-4 py-3">
                          <div className={`flex items-center gap-1 ${sourceColor}`}>
                            <SourceIcon size={14} />
                            <span className="capitalize">{asset.source.replace('-', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(asset.updatedAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyAsset(asset);
                              }}
                              className="text-slate-400 hover:text-white"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadAsset(asset);
                              }}
                              className="text-slate-400 hover:text-white"
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteAsset(asset.id);
                              }}
                              className="text-slate-400 hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}

          {/* Asset Preview Modal */}
          {selectedAsset && (
            <div
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-8"
              onClick={() => setSelectedAsset(null)}
            >
              <Card
                className="bg-slate-800 border-slate-700 w-full max-w-2xl max-h-[80vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{selectedAsset.name}</h3>
                    <button
                      onClick={() => setSelectedAsset(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>

                  {selectedAsset.content && (
                    <pre className="bg-slate-900 p-4 rounded border border-slate-700 text-xs text-slate-100 overflow-auto max-h-96 font-mono mb-4">
                      <code>{selectedAsset.content}</code>
                    </pre>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={() => copyAsset(selectedAsset)} className="bg-slate-700 hover:bg-slate-600">
                      <Copy size={16} className="mr-2" /> Copy
                    </Button>
                    <Button onClick={() => downloadAsset(selectedAsset)} className="bg-emerald-600 hover:bg-emerald-700">
                      <Download size={16} className="mr-2" /> Download
                    </Button>
                    <Button
                      onClick={() => deleteAsset(selectedAsset.id)}
                      variant="outline"
                      className="text-red-400 ml-auto"
                    >
                      <Trash2 size={16} className="mr-2" /> Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ============== PROJECTS TAB ============== */}
        <TabsContent value="projects">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700 p-12 text-center col-span-full">
                <Folder size={48} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No projects yet</p>
                <Link href="/dojo">
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Plus size={18} className="mr-2" /> Create in The Dojo
                  </Button>
                </Link>
              </Card>
            ) : (
              projects.map((project) => (
                <Card key={project.id} className="bg-slate-800 border-slate-700">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">{project.name}</h3>
                      {project.engine && (
                        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300 uppercase">
                          {project.engine}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mb-4">
                      {project.assets?.length || 0} files
                    </p>
                    <p className="text-xs text-slate-500">
                      Updated: {formatDate(new Date(project.updatedAt))}
                    </p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* ============== QUICK LINKS TAB ============== */}
        <TabsContent value="quick-links">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/dojo">
              <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-600/50 hover:border-red-500 cursor-pointer transition">
                <div className="p-6 text-center">
                  <Gamepad2 size={40} className="text-red-400 mx-auto mb-4" />
                  <h3 className="font-bold text-white">The Dojo</h3>
                  <p className="text-sm text-slate-400">Generate game code</p>
                </div>
              </Card>
            </Link>
            <Link href="/art-studio">
              <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-600/50 hover:border-purple-500 cursor-pointer transition">
                <div className="p-6 text-center">
                  <Palette size={40} className="text-purple-400 mx-auto mb-4" />
                  <h3 className="font-bold text-white">Art Studio</h3>
                  <p className="text-sm text-slate-400">Create sprites & art</p>
                </div>
              </Card>
            </Link>
            <Link href="/constructor">
              <Card className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-600/50 hover:border-cyan-500 cursor-pointer transition">
                <div className="p-6 text-center">
                  <Boxes size={40} className="text-cyan-400 mx-auto mb-4" />
                  <h3 className="font-bold text-white">Constructor</h3>
                  <p className="text-sm text-slate-400">Build UI components</p>
                </div>
              </Card>
            </Link>
            <Link href="/script-fusion">
              <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-600/50 hover:border-blue-500 cursor-pointer transition">
                <div className="p-6 text-center">
                  <Combine size={40} className="text-blue-400 mx-auto mb-4" />
                  <h3 className="font-bold text-white">Script Fusion</h3>
                  <p className="text-sm text-slate-400">Merge scripts</p>
                </div>
              </Card>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

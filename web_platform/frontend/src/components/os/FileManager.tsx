'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Folder, File, Upload, Download, Trash2, Plus, Search, Grid,
  List, ChevronRight, Home, ArrowUp, RefreshCw, MoreHorizontal,
  Image, Music, Video, FileText, Code, Archive, X, Check,
  FolderPlus, Edit2, Copy, Scissors, Clipboard, HardDrive
} from 'lucide-react';

// ============================================================================
// FILE MANAGER - FULL FEATURED FILE SYSTEM
// Upload up to 50 files at a time, max 1000 per account
// Download, organize, and manage all your work
// ============================================================================

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  createdAt: Date;
  modifiedAt: Date;
  parentId: string | null;
  path: string;
  thumbnail?: string;
}

interface FileSystemState {
  files: FileItem[];
  currentPath: string;
  currentFolderId: string | null;
  selectedItems: string[];
  clipboard: { items: FileItem[]; operation: 'copy' | 'cut' } | null;
}

const MAX_FILES_PER_UPLOAD = 50;
const MAX_FILES_PER_ACCOUNT = 1000;

// File type icon mapping
const getFileIcon = (mimeType?: string, name?: string) => {
  if (!mimeType && name) {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
      return <Image className="w-6 h-6 text-green-400" />;
    }
    if (['mp3', 'wav', 'ogg', 'flac'].includes(ext || '')) {
      return <Music className="w-6 h-6 text-purple-400" />;
    }
    if (['mp4', 'webm', 'avi', 'mov'].includes(ext || '')) {
      return <Video className="w-6 h-6 text-red-400" />;
    }
    if (['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css'].includes(ext || '')) {
      return <Code className="w-6 h-6 text-blue-400" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
      return <Archive className="w-6 h-6 text-yellow-400" />;
    }
  }
  return <FileText className="w-6 h-6 text-slate-400" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const FileManager: React.FC = () => {
  const [state, setState] = useState<FileSystemState>({
    files: [
      // Demo files
      { id: '1', name: 'Documents', type: 'folder', createdAt: new Date(), modifiedAt: new Date(), parentId: null, path: '/Documents' },
      { id: '2', name: 'Music', type: 'folder', createdAt: new Date(), modifiedAt: new Date(), parentId: null, path: '/Music' },
      { id: '3', name: 'Images', type: 'folder', createdAt: new Date(), modifiedAt: new Date(), parentId: null, path: '/Images' },
      { id: '4', name: 'Projects', type: 'folder', createdAt: new Date(), modifiedAt: new Date(), parentId: null, path: '/Projects' },
      { id: '5', name: 'welcome.txt', type: 'file', size: 1024, createdAt: new Date(), modifiedAt: new Date(), parentId: null, path: '/welcome.txt' },
      { id: '6', name: 'demo_song.mp3', type: 'file', size: 3500000, mimeType: 'audio/mp3', createdAt: new Date(), modifiedAt: new Date(), parentId: '2', path: '/Music/demo_song.mp3' },
    ],
    currentPath: '/',
    currentFolderId: null,
    selectedItems: [],
    clipboard: null,
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameItem, setRenameItem] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const totalFiles = state.files.length;
  const remainingSlots = MAX_FILES_PER_ACCOUNT - totalFiles;

  // Get current folder contents
  const currentItems = state.files.filter(f => 
    f.parentId === state.currentFolderId &&
    (searchQuery === '' || f.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Breadcrumb path segments
  const pathSegments = state.currentPath.split('/').filter(Boolean);

  const navigateToFolder = useCallback((folderId: string | null, path: string) => {
    setState(prev => ({
      ...prev,
      currentFolderId: folderId,
      currentPath: path,
      selectedItems: [],
    }));
  }, []);

  const navigateUp = useCallback(() => {
    if (state.currentFolderId) {
      const currentFolder = state.files.find(f => f.id === state.currentFolderId);
      if (currentFolder) {
        const parentPath = currentFolder.path.split('/').slice(0, -1).join('/') || '/';
        navigateToFolder(currentFolder.parentId, parentPath);
      }
    }
  }, [state.currentFolderId, state.files, navigateToFolder]);

  const handleItemClick = useCallback((item: FileItem, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      setState(prev => ({
        ...prev,
        selectedItems: prev.selectedItems.includes(item.id)
          ? prev.selectedItems.filter(id => id !== item.id)
          : [...prev.selectedItems, item.id],
      }));
    } else {
      setState(prev => ({ ...prev, selectedItems: [item.id] }));
    }
  }, []);

  const handleItemDoubleClick = useCallback((item: FileItem) => {
    if (item.type === 'folder') {
      navigateToFolder(item.id, item.path);
    } else {
      // Open file preview or download
      handleDownload([item.id]);
    }
  }, [navigateToFolder]);

  const handleUpload = useCallback(async (files: FileList) => {
    if (files.length > MAX_FILES_PER_UPLOAD) {
      alert(`Maximum ${MAX_FILES_PER_UPLOAD} files per upload`);
      return;
    }

    if (totalFiles + files.length > MAX_FILES_PER_ACCOUNT) {
      alert(`Account limit: ${MAX_FILES_PER_ACCOUNT} files. You have ${remainingSlots} slots remaining.`);
      return;
    }

    setIsUploading(true);
    const newFiles: FileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(((i + 1) / files.length) * 100);

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 100));

      const newFile: FileItem = {
        id: `file_${Date.now()}_${i}`,
        name: file.name,
        type: 'file',
        size: file.size,
        mimeType: file.type,
        createdAt: new Date(),
        modifiedAt: new Date(),
        parentId: state.currentFolderId,
        path: `${state.currentPath === '/' ? '' : state.currentPath}/${file.name}`,
      };

      newFiles.push(newFile);
    }

    setState(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles],
    }));

    setIsUploading(false);
    setUploadProgress(0);
  }, [state.currentFolderId, state.currentPath, totalFiles, remainingSlots]);

  const handleDownload = useCallback((itemIds: string[]) => {
    itemIds.forEach(id => {
      const item = state.files.find(f => f.id === id);
      if (item && item.type === 'file') {
        // Create a blob URL for download simulation
        const blob = new Blob([`Content of ${item.name}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }, [state.files]);

  const handleDelete = useCallback((itemIds: string[]) => {
    if (confirm(`Delete ${itemIds.length} item(s)?`)) {
      // Also delete all children if folder
      const idsToDelete = new Set(itemIds);
      
      const addChildren = (parentId: string) => {
        state.files.filter(f => f.parentId === parentId).forEach(child => {
          idsToDelete.add(child.id);
          if (child.type === 'folder') addChildren(child.id);
        });
      };

      itemIds.forEach(id => {
        const item = state.files.find(f => f.id === id);
        if (item?.type === 'folder') addChildren(id);
      });

      setState(prev => ({
        ...prev,
        files: prev.files.filter(f => !idsToDelete.has(f.id)),
        selectedItems: [],
      }));
    }
  }, [state.files]);

  const handleCreateFolder = useCallback(() => {
    if (!newFolderName.trim()) return;

    const newFolder: FileItem = {
      id: `folder_${Date.now()}`,
      name: newFolderName.trim(),
      type: 'folder',
      createdAt: new Date(),
      modifiedAt: new Date(),
      parentId: state.currentFolderId,
      path: `${state.currentPath === '/' ? '' : state.currentPath}/${newFolderName.trim()}`,
    };

    setState(prev => ({
      ...prev,
      files: [...prev.files, newFolder],
    }));

    setNewFolderName('');
    setShowNewFolderDialog(false);
  }, [newFolderName, state.currentFolderId, state.currentPath]);

  const handleRename = useCallback((itemId: string) => {
    if (!renameValue.trim()) return;

    setState(prev => ({
      ...prev,
      files: prev.files.map(f => 
        f.id === itemId 
          ? { 
              ...f, 
              name: renameValue.trim(),
              path: f.path.replace(/\/[^/]+$/, `/${renameValue.trim()}`),
              modifiedAt: new Date(),
            }
          : f
      ),
    }));

    setRenameItem(null);
    setRenameValue('');
  }, [renameValue]);

  const handleCopy = useCallback(() => {
    const items = state.files.filter(f => state.selectedItems.includes(f.id));
    setState(prev => ({
      ...prev,
      clipboard: { items, operation: 'copy' },
    }));
  }, [state.files, state.selectedItems]);

  const handleCut = useCallback(() => {
    const items = state.files.filter(f => state.selectedItems.includes(f.id));
    setState(prev => ({
      ...prev,
      clipboard: { items, operation: 'cut' },
    }));
  }, [state.files, state.selectedItems]);

  const handlePaste = useCallback(() => {
    if (!state.clipboard) return;

    const newFiles = state.clipboard.items.map(item => ({
      ...item,
      id: `${item.id}_${Date.now()}`,
      parentId: state.currentFolderId,
      path: `${state.currentPath === '/' ? '' : state.currentPath}/${item.name}`,
      createdAt: new Date(),
      modifiedAt: new Date(),
    }));

    if (state.clipboard.operation === 'cut') {
      const cutIds = new Set(state.clipboard.items.map(i => i.id));
      setState(prev => ({
        ...prev,
        files: [...prev.files.filter(f => !cutIds.has(f.id)), ...newFiles],
        clipboard: null,
        selectedItems: [],
      }));
    } else {
      setState(prev => ({
        ...prev,
        files: [...prev.files, ...newFiles],
        selectedItems: [],
      }));
    }
  }, [state.clipboard, state.currentFolderId, state.currentPath]);

  // Context menu handler
  const handleContextMenu = useCallback((e: React.MouseEvent, itemId?: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, itemId });
    if (itemId && !state.selectedItems.includes(itemId)) {
      setState(prev => ({ ...prev, selectedItems: [itemId] }));
    }
  }, [state.selectedItems]);

  return (
    <div 
      className="h-full flex flex-col bg-slate-900 text-white"
      onClick={() => setContextMenu(null)}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-slate-700/50 bg-slate-800/50">
        <button
          onClick={navigateUp}
          disabled={!state.currentFolderId}
          className="p-2 hover:bg-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigateToFolder(null, '/')}
          className="p-2 hover:bg-white/10 rounded-lg"
        >
          <Home className="w-4 h-4" />
        </button>
        <button className="p-2 hover:bg-white/10 rounded-lg">
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 flex-1 text-sm overflow-x-auto">
          <button
            onClick={() => navigateToFolder(null, '/')}
            className="px-2 py-1 hover:bg-white/10 rounded text-slate-300 hover:text-white"
          >
            <HardDrive className="w-4 h-4" />
          </button>
          {pathSegments.map((segment, i) => {
            const path = '/' + pathSegments.slice(0, i + 1).join('/');
            const folder = state.files.find(f => f.path === path && f.type === 'folder');
            return (
              <React.Fragment key={path}>
                <ChevronRight className="w-4 h-4 text-slate-500" />
                <button
                  onClick={() => folder && navigateToFolder(folder.id, path)}
                  className="px-2 py-1 hover:bg-white/10 rounded text-slate-300 hover:text-white"
                >
                  {segment}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm outline-none w-32"
          />
        </div>

        {/* View Mode */}
        <div className="flex items-center border border-slate-600 rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-purple-600' : 'hover:bg-white/10'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-purple-600' : 'hover:bg-white/10'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2 p-2 border-b border-slate-700/50 bg-slate-800/30">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={e => e.target.files && handleUpload(e.target.files)}
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory=""
          multiple
          className="hidden"
          onChange={e => e.target.files && handleUpload(e.target.files)}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={remainingSlots <= 0}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
        <button
          onClick={() => setShowNewFolderDialog(true)}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg text-sm"
        >
          <FolderPlus className="w-4 h-4" />
          New Folder
        </button>

        {state.selectedItems.length > 0 && (
          <>
            <div className="w-px h-6 bg-slate-600" />
            <button
              onClick={() => handleDownload(state.selectedItems)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-white/10 rounded-lg"
              title="Copy"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleCut}
              className="p-2 hover:bg-white/10 rounded-lg"
              title="Cut"
            >
              <Scissors className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(state.selectedItems)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-500/20 text-red-400 rounded-lg text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </>
        )}

        {state.clipboard && (
          <button
            onClick={handlePaste}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-lg text-sm"
          >
            <Clipboard className="w-4 h-4" />
            Paste
          </button>
        )}

        <div className="flex-1" />

        {/* Storage Info */}
        <div className="text-xs text-slate-400">
          {totalFiles} / {MAX_FILES_PER_ACCOUNT} files
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="px-4 py-2 bg-purple-900/30 border-b border-purple-500/30">
          <div className="flex items-center gap-3">
            <span className="text-sm">Uploading...</span>
            <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-sm">{Math.round(uploadProgress)}%</span>
          </div>
        </div>
      )}

      {/* File Grid/List */}
      <div 
        className="flex-1 overflow-auto p-4"
        onContextMenu={e => handleContextMenu(e)}
      >
        {currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Folder className="w-16 h-16 mb-4 opacity-50" />
            <p>This folder is empty</p>
            <p className="text-sm mt-2">Drop files here or click Upload</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {currentItems.map(item => (
              <div
                key={item.id}
                onClick={e => handleItemClick(item, e)}
                onDoubleClick={() => handleItemDoubleClick(item)}
                onContextMenu={e => handleContextMenu(e, item.id)}
                className={`
                  flex flex-col items-center gap-2 p-3 rounded-lg cursor-pointer transition-all
                  ${state.selectedItems.includes(item.id) 
                    ? 'bg-purple-600/30 ring-2 ring-purple-500' 
                    : 'hover:bg-white/10'
                  }
                `}
              >
                {item.type === 'folder' ? (
                  <Folder className="w-12 h-12 text-yellow-400" />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center">
                    {getFileIcon(item.mimeType, item.name)}
                  </div>
                )}
                {renameItem === item.id ? (
                  <input
                    type="text"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    onBlur={() => handleRename(item.id)}
                    onKeyDown={e => e.key === 'Enter' && handleRename(item.id)}
                    className="w-full text-xs text-center bg-slate-700 rounded px-1 py-0.5 outline-none ring-2 ring-purple-500"
                    autoFocus
                  />
                ) : (
                  <span className="text-xs text-center break-all line-clamp-2">
                    {item.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {/* List header */}
            <div className="grid grid-cols-12 gap-4 px-3 py-2 text-xs text-slate-400 font-medium border-b border-slate-700/50">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Modified</div>
              <div className="col-span-2">Type</div>
            </div>
            {currentItems.map(item => (
              <div
                key={item.id}
                onClick={e => handleItemClick(item, e)}
                onDoubleClick={() => handleItemDoubleClick(item)}
                onContextMenu={e => handleContextMenu(e, item.id)}
                className={`
                  grid grid-cols-12 gap-4 px-3 py-2 rounded-lg cursor-pointer transition-all
                  ${state.selectedItems.includes(item.id) 
                    ? 'bg-purple-600/30 ring-1 ring-purple-500' 
                    : 'hover:bg-white/10'
                  }
                `}
              >
                <div className="col-span-6 flex items-center gap-3">
                  {item.type === 'folder' ? (
                    <Folder className="w-5 h-5 text-yellow-400" />
                  ) : (
                    getFileIcon(item.mimeType, item.name)
                  )}
                  {renameItem === item.id ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={() => handleRename(item.id)}
                      onKeyDown={e => e.key === 'Enter' && handleRename(item.id)}
                      className="flex-1 text-sm bg-slate-700 rounded px-2 py-0.5 outline-none ring-2 ring-purple-500"
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm truncate">{item.name}</span>
                  )}
                </div>
                <div className="col-span-2 text-sm text-slate-400">
                  {item.size ? formatFileSize(item.size) : '—'}
                </div>
                <div className="col-span-2 text-sm text-slate-400">
                  {item.modifiedAt.toLocaleDateString()}
                </div>
                <div className="col-span-2 text-sm text-slate-400">
                  {item.type === 'folder' ? 'Folder' : item.mimeType?.split('/')[1] || 'File'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Folder Dialog */}
      {showNewFolderDialog && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-80 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4">New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-4 py-2 bg-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewFolderDialog(false)}
                className="px-4 py-2 hover:bg-white/10 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-slate-800 rounded-lg shadow-2xl border border-slate-700 py-1 z-50 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.itemId ? (
            <>
              <button
                onClick={() => {
                  handleDownload([contextMenu.itemId!]);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download
              </button>
              <button
                onClick={() => {
                  const item = state.files.find(f => f.id === contextMenu.itemId);
                  if (item) {
                    setRenameItem(item.id);
                    setRenameValue(item.name);
                  }
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" /> Rename
              </button>
              <button
                onClick={() => {
                  handleCopy();
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
              <button
                onClick={() => {
                  handleCut();
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2"
              >
                <Scissors className="w-4 h-4" /> Cut
              </button>
              <div className="h-px bg-slate-700 my-1" />
              <button
                onClick={() => {
                  handleDelete([contextMenu.itemId!]);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-red-500/20 text-red-400 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Upload Files
              </button>
              <button
                onClick={() => {
                  setShowNewFolderDialog(true);
                  setContextMenu(null);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2"
              >
                <FolderPlus className="w-4 h-4" /> New Folder
              </button>
              {state.clipboard && (
                <button
                  onClick={() => {
                    handlePaste();
                    setContextMenu(null);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-white/10 flex items-center gap-2"
                >
                  <Clipboard className="w-4 h-4" /> Paste
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FileManager;

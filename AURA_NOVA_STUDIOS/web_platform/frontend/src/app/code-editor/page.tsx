'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import {
  Code2,
  Play,
  Save,
  Download,
  Copy,
  Plus,
  X,
  FileCode,
  FolderOpen,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Terminal,
} from 'lucide-react';

// ============== TYPES ==============
interface EditorFile {
  id: string;
  name: string;
  content: string;
  language: string;
  saved: boolean;
}

interface EditorSettings {
  fontSize: number;
  tabSize: number;
  theme: 'dark' | 'light';
  wordWrap: boolean;
  showLineNumbers: boolean;
}

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  typescript: '.ts',
  javascript: '.js',
  python: '.py',
  csharp: '.cs',
  cpp: '.cpp',
  html: '.html',
  css: '.css',
  json: '.json',
  gdscript: '.gd',
  lua: '.lua',
};

const DEFAULT_TEMPLATES: Record<string, string> = {
  typescript: `// TypeScript Template
interface GameEntity {
  id: string;
  name: string;
  position: { x: number; y: number };
  health: number;
}

class Player implements GameEntity {
  id: string;
  name: string;
  position = { x: 0, y: 0 };
  health = 100;

  constructor(name: string) {
    this.id = crypto.randomUUID();
    this.name = name;
  }

  move(dx: number, dy: number) {
    this.position.x += dx;
    this.position.y += dy;
  }

  takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount);
    return this.health > 0;
  }
}

const player = new Player("Hero");
console.log(player);`,
  javascript: `// JavaScript Template
class GameManager {
  constructor() {
    this.entities = [];
    this.isRunning = false;
  }

  addEntity(entity) {
    this.entities.push(entity);
    return entity;
  }

  update(deltaTime) {
    for (const entity of this.entities) {
      if (entity.update) {
        entity.update(deltaTime);
      }
    }
  }

  start() {
    this.isRunning = true;
    this.gameLoop();
  }

  gameLoop() {
    if (!this.isRunning) return;
    
    const now = performance.now();
    this.update(16.67); // ~60 FPS
    
    requestAnimationFrame(() => this.gameLoop());
  }
}

const game = new GameManager();
console.log("Game Manager initialized");`,
  python: `# Python Template
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Vector2:
    x: float = 0.0
    y: float = 0.0
    
    def __add__(self, other: 'Vector2') -> 'Vector2':
        return Vector2(self.x + other.x, self.y + other.y)
    
    def __mul__(self, scalar: float) -> 'Vector2':
        return Vector2(self.x * scalar, self.y * scalar)

@dataclass
class Entity:
    name: str
    position: Vector2
    velocity: Vector2 = None
    health: int = 100
    
    def __post_init__(self):
        if self.velocity is None:
            self.velocity = Vector2()
    
    def update(self, delta_time: float):
        self.position = self.position + self.velocity * delta_time
    
    def take_damage(self, amount: int) -> bool:
        self.health = max(0, self.health - amount)
        return self.health > 0

# Example usage
player = Entity("Hero", Vector2(100, 100))
print(f"Created: {player}")`,
  csharp: `// C# Template
using System;
using System.Collections.Generic;

public class GameController
{
    private List<IEntity> entities = new List<IEntity>();
    private bool isRunning = false;

    public void AddEntity(IEntity entity)
    {
        entities.Add(entity);
    }

    public void Start()
    {
        isRunning = true;
        Console.WriteLine("Game Started!");
    }

    public void Update(float deltaTime)
    {
        foreach (var entity in entities)
        {
            entity.Update(deltaTime);
        }
    }

    public void Stop()
    {
        isRunning = false;
        Console.WriteLine("Game Stopped!");
    }
}

public interface IEntity
{
    string Name { get; }
    void Update(float deltaTime);
}`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AuraNova Game</title>
    <style>
        body { margin: 0; background: #1a1a2e; }
        canvas { display: block; margin: auto; }
    </style>
</head>
<body>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <script>
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        function gameLoop() {
            ctx.fillStyle = '#16213e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw player
            ctx.fillStyle = '#e94560';
            ctx.beginPath();
            ctx.arc(400, 300, 30, 0, Math.PI * 2);
            ctx.fill();
            
            requestAnimationFrame(gameLoop);
        }
        
        gameLoop();
    </script>
</body>
</html>`,
};

export default function CodeEditorPage() {
  const [files, setFiles] = useState<EditorFile[]>([
    {
      id: '1',
      name: 'main.ts',
      content: DEFAULT_TEMPLATES.typescript,
      language: 'typescript',
      saved: true,
    },
  ]);
  const [activeFileId, setActiveFileId] = useState('1');
  const [showPreview, setShowPreview] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settings, setSettings] = useState<EditorSettings>({
    fontSize: 14,
    tabSize: 2,
    theme: 'dark',
    wordWrap: true,
    showLineNumbers: true,
  });
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const activeFile = files.find((f) => f.id === activeFileId);

  useEffect(() => {
    // Load files from localStorage
    const saved = localStorage.getItem('code_editor_files');
    if (saved) {
      setFiles(JSON.parse(saved));
    }
  }, []);

  const saveFiles = (updated: EditorFile[]) => {
    setFiles(updated);
    localStorage.setItem('code_editor_files', JSON.stringify(updated));
  };

  const updateFileContent = (content: string) => {
    const updated = files.map((f) =>
      f.id === activeFileId ? { ...f, content, saved: false } : f
    );
    setFiles(updated);
  };

  const saveCurrentFile = () => {
    const updated = files.map((f) =>
      f.id === activeFileId ? { ...f, saved: true } : f
    );
    saveFiles(updated);
    toast.success(`Saved ${activeFile?.name}`);
  };

  const createNewFile = () => {
    const name = prompt('File name (e.g., script.ts):');
    if (!name) return;

    const ext = name.includes('.') ? '.' + name.split('.').pop() : '.ts';
    const language = Object.entries(LANGUAGE_EXTENSIONS).find(
      ([_, e]) => e === ext
    )?.[0] || 'typescript';

    const newFile: EditorFile = {
      id: Date.now().toString(),
      name,
      content: DEFAULT_TEMPLATES[language] || `// ${name}\n\n`,
      language,
      saved: true,
    };

    const updated = [...files, newFile];
    saveFiles(updated);
    setActiveFileId(newFile.id);
  };

  const closeFile = (id: string) => {
    if (files.length <= 1) {
      toast.error('Cannot close the last file');
      return;
    }

    const file = files.find((f) => f.id === id);
    if (file && !file.saved) {
      if (!confirm(`${file.name} has unsaved changes. Close anyway?`)) {
        return;
      }
    }

    const updated = files.filter((f) => f.id !== id);
    saveFiles(updated);

    if (activeFileId === id) {
      setActiveFileId(updated[0].id);
    }
  };

  const runCode = () => {
    if (!activeFile) return;

    setOutput([]);
    const logs: string[] = [];

    // Capture console.log
    const originalLog = console.log;
    console.log = (...args) => {
      logs.push(args.map((a) => JSON.stringify(a, null, 2)).join(' '));
    };

    try {
      if (activeFile.language === 'javascript' || activeFile.language === 'typescript') {
        // eslint-disable-next-line no-eval
        eval(activeFile.content);
        logs.push('✓ Execution complete');
      } else {
        logs.push(`⚠ Direct execution not supported for ${activeFile.language}`);
        logs.push('Copy code and run in appropriate environment');
      }
    } catch (error: any) {
      logs.push(`✗ Error: ${error.message}`);
    }

    console.log = originalLog;
    setOutput(logs);
  };

  const copyCode = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    toast.success('Copied to clipboard');
  };

  const downloadFile = () => {
    if (!activeFile) return;
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(activeFile.content)
    );
    element.setAttribute('download', activeFile.name);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded ${activeFile.name}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save shortcut
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveCurrentFile();
    }

    // Tab handling
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = ' '.repeat(settings.tabSize);
      const newContent =
        activeFile!.content.substring(0, start) +
        spaces +
        activeFile!.content.substring(end);
      updateFileContent(newContent);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + settings.tabSize;
      }, 0);
    }
  };

  const getLineNumbers = () => {
    if (!activeFile) return '';
    const lines = activeFile.content.split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1).join('\n');
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 ${
        isFullscreen ? 'fixed inset-0 z-50' : 'p-8'
      }`}
    >
      {/* Header */}
      {!isFullscreen && (
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Code2 size={40} className="text-slate-400" /> Code Editor
          </h1>
          <p className="text-slate-400">
            Write, edit, and test your code in the browser
          </p>
        </div>
      )}

      <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          {/* Toolbar */}
          <div className="bg-slate-900 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={createNewFile} className="bg-slate-700 hover:bg-slate-600">
                <Plus size={16} className="mr-1" /> New
              </Button>
              <Button
                size="sm"
                onClick={saveCurrentFile}
                className="bg-green-600 hover:bg-green-700"
                disabled={activeFile?.saved}
              >
                <Save size={16} className="mr-1" /> Save
              </Button>
              <Button size="sm" onClick={runCode} className="bg-blue-600 hover:bg-blue-700">
                <Play size={16} className="mr-1" /> Run
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={copyCode} className="bg-slate-700 hover:bg-slate-600">
                <Copy size={16} />
              </Button>
              <Button size="sm" onClick={downloadFile} className="bg-slate-700 hover:bg-slate-600">
                <Download size={16} />
              </Button>
              <Button
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="bg-slate-700 hover:bg-slate-600"
              >
                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
              <Button
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="bg-slate-700 hover:bg-slate-600"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </Button>
            </div>
          </div>

          {/* File Tabs */}
          <div className="bg-slate-900/50 border-b border-slate-700 px-2 py-1 flex gap-1 overflow-x-auto">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition ${
                  activeFileId === file.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <FileCode size={14} />
                <span className={!file.saved ? 'italic' : ''}>
                  {file.name}
                  {!file.saved && '*'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(file.id);
                  }}
                  className="hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </button>
            ))}
          </div>

          {/* Editor Area */}
          <div className="flex" style={{ height: isFullscreen ? 'calc(100vh - 140px)' : '500px' }}>
            {/* Line Numbers */}
            {settings.showLineNumbers && (
              <div className="bg-slate-900 text-slate-500 text-right px-3 py-4 font-mono text-sm select-none border-r border-slate-700 overflow-hidden">
                <pre style={{ fontSize: settings.fontSize }}>{getLineNumbers()}</pre>
              </div>
            )}

            {/* Code Area */}
            <textarea
              ref={editorRef}
              value={activeFile?.content || ''}
              onChange={(e) => updateFileContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 bg-slate-900 text-slate-100 p-4 font-mono resize-none outline-none ${
                settings.wordWrap ? '' : 'whitespace-pre overflow-x-auto'
              }`}
              style={{ fontSize: settings.fontSize, tabSize: settings.tabSize }}
              spellCheck={false}
            />
          </div>

          {/* Output Console */}
          {output.length > 0 && (
            <div className="bg-slate-950 border-t border-slate-700 p-4 max-h-48 overflow-y-auto">
              <div className="flex items-center gap-2 mb-2 text-slate-400 text-sm">
                <Terminal size={14} /> Output
              </div>
              <pre className="text-xs text-slate-300 font-mono">
                {output.map((line, i) => (
                  <div key={i} className={line.startsWith('✗') ? 'text-red-400' : ''}>
                    {line}
                  </div>
                ))}
              </pre>
            </div>
          )}
        </Card>

        {/* Preview Panel */}
        {showPreview && activeFile?.language === 'html' && (
          <Card className="bg-white border-slate-700 overflow-hidden">
            <div className="bg-slate-800 px-4 py-2 border-b border-slate-700">
              <span className="text-sm text-slate-300">Preview</span>
            </div>
            <iframe
              srcDoc={activeFile.content}
              className="w-full h-full bg-white"
              style={{ height: isFullscreen ? 'calc(100vh - 100px)' : '500px' }}
              sandbox="allow-scripts"
            />
          </Card>
        )}
      </div>

      {/* Quick Templates */}
      {!isFullscreen && (
        <Card className="bg-slate-800 border-slate-700 mt-6">
          <div className="p-4">
            <h3 className="font-bold text-white mb-3">Quick Templates</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(DEFAULT_TEMPLATES).map((lang) => (
                <Button
                  key={lang}
                  size="sm"
                  onClick={() => {
                    const newFile: EditorFile = {
                      id: Date.now().toString(),
                      name: `template${LANGUAGE_EXTENSIONS[lang]}`,
                      content: DEFAULT_TEMPLATES[lang],
                      language: lang,
                      saved: true,
                    };
                    const updated = [...files, newFile];
                    saveFiles(updated);
                    setActiveFileId(newFile.id);
                  }}
                  className="bg-slate-700 hover:bg-slate-600 capitalize"
                >
                  {lang}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/**
 * =============================================================================
 * MODERN DOJO IDE - Professional VSCode-style Coding Environment
 * =============================================================================
 *
 * Features:
 * - Monaco Code Editor (VSCode's editor)
 * - File tree & project explorer
 * - Multi-tab editing
 * - Terminal/console output
 * - AI chat sidebar for code generation
 * - Resizable panels
 *
 * =============================================================================
 */

'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import {
  FileText,
  Folder,
  FolderOpen,
  Code2,
  Play,
  Terminal as TerminalIcon,
  MessageSquare,
  Sparkles,
  Save,
  Download,
  ChevronRight,
  ChevronDown,
  X,
  Send,
  File,
} from 'lucide-react';

// Dynamically import Monaco to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

// ============================================================================
// TYPES
// ============================================================================

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileNode[];
  isOpen?: boolean;
  path: string;
}

interface EditorTab {
  id: string;
  filename: string;
  content: string;
  language: string;
  path: string;
  isDirty: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ============================================================================
// UTILITIES
// ============================================================================

const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
  };
  return map[ext || ''] || 'plaintext';
};

const getFileIcon = (filename: string, type: 'file' | 'folder', isOpen?: boolean) => {
  if (type === 'folder') {
    return isOpen ? (
      <FolderOpen className="w-4 h-4 text-yellow-400" />
    ) : (
      <Folder className="w-4 h-4 text-yellow-400" />
    );
  }
  return <File className="w-4 h-4 text-blue-400" />;
};

// ============================================================================
// FILE TREE NODE COMPONENT
// ============================================================================

interface FileTreeNodeProps {
  node: FileNode;
  level: number;
  onSelect: (node: FileNode) => void;
  onToggle: (nodeId: string) => void;
  selectedId?: string;
}

function FileTreeNode({ node, level, onSelect, onToggle, selectedId }: FileTreeNodeProps) {
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-slate-700 transition ${
          isSelected ? 'bg-slate-700 border-l-2 border-aura-500' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (node.type === 'folder') {
            onToggle(node.id);
          } else {
            onSelect(node);
          }
        }}
      >
        {node.type === 'folder' && (
          <button className="p-0 m-0">
            {node.isOpen ? (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-slate-400" />
            )}
          </button>
        )}
        {getFileIcon(node.name, node.type, node.isOpen)}
        <span className="text-sm text-slate-200">{node.name}</span>
      </div>
      {node.type === 'folder' && node.isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              onToggle={onToggle}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN IDE COMPONENT
// ============================================================================

export function ModernDojoIDE() {
  // Demo file tree
  const [fileTree, setFileTree] = useState<FileNode[]>([
    {
      id: 'project',
      name: 'My Project',
      type: 'folder',
      isOpen: true,
      path: '/My Project',
      children: [
        {
          id: 'index',
          name: 'index.html',
          type: 'file',
          content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Game</title>\n</head>\n<body>\n  <h1>Welcome to The Dojo!</h1>\n  <canvas id="game"></canvas>\n  <script src="game.js"></script>\n</body>\n</html>',
          language: 'html',
          path: '/My Project/index.html',
        },
        {
          id: 'game',
          name: 'game.js',
          type: 'file',
          content: '// Game code here\nconsole.log("Game starting...");\n\nconst canvas = document.getElementById("game");\nconst ctx = canvas.getContext("2d");\n\n// Your game loop\nfunction gameLoop() {\n  // Update and render\n  requestAnimationFrame(gameLoop);\n}\n\ngameLoop();',
          language: 'javascript',
          path: '/My Project/game.js',
        },
      ],
    },
  ]);

  const [openTabs, setOpenTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // AI Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Hi! I\'m your AI coding assistant. I can help you generate code, debug, and build amazing projects!',
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Terminal
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    'Welcome to Dojo IDE Terminal',
    'Type "help" for available commands',
  ]);
  const [terminalInput, setTerminalInput] = useState('');

  // File operations
  const openFile = (node: FileNode) => {
    if (node.type !== 'file') return;

    const existingTab = openTabs.find((tab) => tab.id === node.id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    const newTab: EditorTab = {
      id: node.id,
      filename: node.name,
      content: node.content || '',
      language: getLanguageFromFilename(node.name),
      path: node.path,
      isDirty: false,
    };

    setOpenTabs([...openTabs, newTab]);
    setActiveTabId(newTab.id);
    setSelectedFileId(node.id);
  };

  const closeTab = (tabId: string) => {
    const newTabs = openTabs.filter((t) => t.id !== tabId);
    setOpenTabs(newTabs);

    if (activeTabId === tabId) {
      setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
    }
  };

  const updateTabContent = (tabId: string, newContent: string) => {
    setOpenTabs(
      openTabs.map((tab) => (tab.id === tabId ? { ...tab, content: newContent, isDirty: true } : tab))
    );
  };

  const saveFile = (tabId: string) => {
    const tab = openTabs.find((t) => t.id === tabId);
    if (!tab) return;

    setOpenTabs(openTabs.map((t) => (t.id === tabId ? { ...t, isDirty: false } : t)));
    toast.success(`Saved ${tab.filename}`);
    addTerminalLine(`File saved: ${tab.filename}`);
  };

  const toggleFolder = (nodeId: string) => {
    const toggle = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
          return { ...node, children: toggle(node.children) };
        }
        return node;
      });
    };

    setFileTree(toggle(fileTree));
  };

  // Terminal operations
  const addTerminalLine = (line: string) => {
    setTerminalOutput((prev) => [...prev, line]);
  };

  const runTerminalCommand = () => {
    if (!terminalInput.trim()) return;

    addTerminalLine(`$ ${terminalInput}`);

    const cmd = terminalInput.toLowerCase().trim();

    if (cmd === 'help') {
      addTerminalLine('Available commands: help, clear, run, ls');
    } else if (cmd === 'clear') {
      setTerminalOutput([]);
    } else if (cmd === 'ls') {
      addTerminalLine('index.html  game.js');
    } else if (cmd === 'run') {
      addTerminalLine('Running code...');
      setTimeout(() => addTerminalLine('✓ Code executed successfully!'), 500);
    } else {
      addTerminalLine(`Command not found: ${terminalInput}`);
    }

    setTerminalInput('');
  };

  // AI Chat
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, userMessage]);
    setChatInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I can help you with: "${chatInput}"\n\nHere's a code example:\n\`\`\`javascript\nfunction example() {\n  console.log("AI-generated code!");\n}\n\`\`\``,
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const activeTab = openTabs.find((tab) => tab.id === activeTabId);

  return (
    <div className="flex h-[calc(100vh-80px)]">
      {/* Left Sidebar - File Explorer */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">EXPLORER</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {fileTree.map((node) => (
            <FileTreeNode
              key={node.id}
              node={node}
              level={0}
              onSelect={openFile}
              onToggle={toggleFolder}
              selectedId={selectedFileId}
            />
          ))}
        </div>
      </div>

      {/* Center - Editor */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        {openTabs.length > 0 && (
          <div className="flex items-center bg-slate-900 border-b border-slate-800 overflow-x-auto">
            {openTabs.map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-r border-slate-800 ${
                  activeTabId === tab.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
                onClick={() => setActiveTabId(tab.id)}
              >
                <span className="text-sm">{tab.filename}</span>
                {tab.isDirty && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="hover:bg-slate-700 rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Editor */}
        <div className="flex-1">
          {activeTab ? (
            <Editor
              height="100%"
              language={activeTab.language}
              value={activeTab.content}
              onChange={(value) => updateTabContent(activeTab.id, value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              <div className="text-center">
                <Code2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Open a file to start coding</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Terminal */}
        <div className="h-48 bg-slate-950 border-t border-slate-800 flex flex-col">
          <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2">
            <TerminalIcon className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-white">TERMINAL</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 font-mono text-sm text-slate-300">
            {terminalOutput.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
          <div className="px-2 py-2 border-t border-slate-800 flex items-center gap-2">
            <span className="text-green-400">$</span>
            <Input
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runTerminalCommand()}
              placeholder="Type command..."
              className="flex-1 bg-transparent border-none text-slate-300"
            />
          </div>
        </div>
      </div>

      {/* Right Sidebar - AI Chat */}
      <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-aura-400" />
          <span className="font-semibold text-white">AI ASSISTANT</span>
          <Sparkles className="w-4 h-4 text-yellow-400 ml-auto" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  msg.role === 'user' ? 'bg-aura-600 text-white' : 'bg-slate-800 text-slate-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
              placeholder="Ask AI for help..."
              className="flex-1 bg-slate-800 border-slate-700 text-white"
            />
            <Button onClick={sendChatMessage} className="bg-aura-600 hover:bg-aura-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

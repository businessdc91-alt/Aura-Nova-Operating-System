'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { aiService } from '@/services/aiService';
import {
  Combine,
  Plus,
  Trash2,
  Play,
  Copy,
  Download,
  AlertTriangle,
  CheckCircle,
  Code,
  FileCode,
  Zap,
  Eye,
  RefreshCw,
  Loader2,
} from 'lucide-react';

// ============== TYPES ==============
interface ScriptInput {
  id: string;
  name: string;
  content: string;
  language: string;
}

interface MergeResult {
  mergedCode: string;
  conflicts: ConflictInfo[];
  summary: MergeSummary;
}

interface ConflictInfo {
  type: 'import' | 'function' | 'variable' | 'class';
  name: string;
  sources: string[];
  resolution: string;
}

interface MergeSummary {
  totalLines: number;
  importsCount: number;
  functionsCount: number;
  classesCount: number;
  variablesCount: number;
}

const LANGUAGES = [
  { id: 'typescript', name: 'TypeScript', ext: '.ts' },
  { id: 'javascript', name: 'JavaScript', ext: '.js' },
  { id: 'python', name: 'Python', ext: '.py' },
  { id: 'csharp', name: 'C#', ext: '.cs' },
  { id: 'cpp', name: 'C++', ext: '.cpp' },
  { id: 'gdscript', name: 'GDScript', ext: '.gd' },
];

export default function ScriptFusionPage() {
  const [scripts, setScripts] = useState<ScriptInput[]>([
    { id: '1', name: 'Script 1', content: '', language: 'typescript' },
    { id: '2', name: 'Script 2', content: '', language: 'typescript' },
  ]);
  const [outputLanguage, setOutputLanguage] = useState('typescript');
  const [isMerging, setIsMerging] = useState(false);
  const [result, setResult] = useState<MergeResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const addScript = () => {
    const newId = Date.now().toString();
    setScripts([
      ...scripts,
      { id: newId, name: `Script ${scripts.length + 1}`, content: '', language: outputLanguage },
    ]);
  };

  const removeScript = (id: string) => {
    if (scripts.length <= 2) {
      toast.error('Need at least 2 scripts to merge');
      return;
    }
    setScripts(scripts.filter((s) => s.id !== id));
  };

  const updateScript = (id: string, updates: Partial<ScriptInput>) => {
    setScripts(scripts.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleMerge = async () => {
    const filledScripts = scripts.filter((s) => s.content.trim());
    if (filledScripts.length < 2) {
      toast.error('Please fill in at least 2 scripts to merge');
      return;
    }

    setIsMerging(true);
    const loadingToast = toast.loading('AI is merging scripts...');

    try {
      // Use real AI service for intelligent merging
      const scriptsToMerge = filledScripts.map(s => ({
        name: s.name,
        content: s.content,
      }));
      
      const response = await aiService.fuseScripts(scriptsToMerge);
      
      if (response.success && response.content) {
        // Clean up markdown code blocks if present
        let mergedCode = response.content;
        mergedCode = mergedCode.replace(/```[\w]*\n?/g, '').replace(/```$/g, '').trim();
        
        // Build result object
        const mergeResult: MergeResult = {
          mergedCode,
          conflicts: [], // AI handles conflicts internally
          summary: {
            totalLines: mergedCode.split('\n').length,
            importsCount: (mergedCode.match(/^import |^from |^using |^#include/gm) || []).length,
            functionsCount: (mergedCode.match(/function |def |public .* \(/gm) || []).length,
            classesCount: (mergedCode.match(/class /gm) || []).length,
            variablesCount: 0,
          },
        };
        
        setResult(mergeResult);
        setShowPreview(true);
        toast.success('Scripts merged with AI!', { id: loadingToast });
      } else {
        // Fallback to algorithmic merge if AI fails
        console.warn('AI merge failed, using fallback:', response.error);
        const mergeResult = performMerge(filledScripts, outputLanguage);
        setResult(mergeResult);
        setShowPreview(true);
        toast.success('Scripts merged (fallback mode)', { id: loadingToast });
      }
    } catch (error) {
      console.error('Merge error:', error);
      // Try fallback
      try {
        const mergeResult = performMerge(filledScripts, outputLanguage);
        setResult(mergeResult);
        setShowPreview(true);
        toast.success('Scripts merged (fallback mode)', { id: loadingToast });
      } catch (e) {
        toast.error('Merge failed', { id: loadingToast });
      }
    }

    setIsMerging(false);
  };

  const performMerge = (scripts: ScriptInput[], language: string): MergeResult => {
    // Extract and deduplicate imports
    const allImports: Set<string> = new Set();
    const allFunctions: Map<string, { code: string; source: string }> = new Map();
    const allClasses: Map<string, { code: string; source: string }> = new Map();
    const mainCode: string[] = [];
    const conflicts: ConflictInfo[] = [];

    scripts.forEach((script) => {
      const lines = script.content.split('\n');
      let inClass = false;
      let classBuffer = '';
      let className = '';
      let braceCount = 0;

      lines.forEach((line) => {
        const trimmed = line.trim();

        // Handle imports
        if (
          trimmed.startsWith('import ') ||
          trimmed.startsWith('from ') ||
          trimmed.startsWith('using ') ||
          trimmed.startsWith('#include')
        ) {
          allImports.add(line);
          return;
        }

        // Track classes
        if (
          trimmed.startsWith('class ') ||
          trimmed.startsWith('public class ') ||
          trimmed.startsWith('export class ')
        ) {
          inClass = true;
          className = trimmed.match(/class\s+(\w+)/)?.[1] || 'Unknown';
          classBuffer = line + '\n';
          braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
          return;
        }

        if (inClass) {
          classBuffer += line + '\n';
          braceCount += (line.match(/{/g) || []).length;
          braceCount -= (line.match(/}/g) || []).length;

          if (braceCount <= 0) {
            if (allClasses.has(className)) {
              conflicts.push({
                type: 'class',
                name: className,
                sources: [allClasses.get(className)!.source, script.name],
                resolution: `Kept version from ${script.name}`,
              });
            }
            allClasses.set(className, { code: classBuffer, source: script.name });
            inClass = false;
            classBuffer = '';
          }
          return;
        }

        // Track standalone functions
        if (
          trimmed.startsWith('function ') ||
          trimmed.startsWith('export function ') ||
          trimmed.startsWith('def ') ||
          trimmed.match(/^(public|private|protected)?\s*(static)?\s*(async)?\s*\w+\s*\(/)
        ) {
          const funcName = trimmed.match(/(?:function|def)\s+(\w+)/)?.[1] || 
                          trimmed.match(/(\w+)\s*\(/)?.[1] || 'unknown';
          
          if (allFunctions.has(funcName)) {
            conflicts.push({
              type: 'function',
              name: funcName,
              sources: [allFunctions.get(funcName)!.source, script.name],
              resolution: `Merged from ${script.name}`,
            });
          }
          allFunctions.set(funcName, { code: line, source: script.name });
        }

        mainCode.push(line);
      });
    });

    // Build merged output
    let mergedCode = '';

    // Add imports
    if (allImports.size > 0) {
      mergedCode += '// ==================== IMPORTS ====================\n';
      mergedCode += Array.from(allImports).join('\n');
      mergedCode += '\n\n';
    }

    // Add classes
    if (allClasses.size > 0) {
      mergedCode += '// ==================== CLASSES ====================\n';
      Array.from(allClasses.values()).forEach((c) => {
        mergedCode += c.code + '\n';
      });
      mergedCode += '\n';
    }

    // Add remaining code
    mergedCode += '// ==================== MAIN CODE ====================\n';
    mergedCode += mainCode.join('\n');

    const summary: MergeSummary = {
      totalLines: mergedCode.split('\n').length,
      importsCount: allImports.size,
      functionsCount: allFunctions.size,
      classesCount: allClasses.size,
      variablesCount: 0, // Would need more sophisticated parsing
    };

    return {
      mergedCode,
      conflicts,
      summary,
    };
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.mergedCode);
    toast.success('Copied to clipboard');
  };

  const downloadMerged = () => {
    if (!result) return;
    const lang = LANGUAGES.find((l) => l.id === outputLanguage);
    const filename = `merged${lang?.ext || '.txt'}`;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(result.mergedCode));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Combine size={40} className="text-blue-500" /> Script Fusion
        </h1>
        <p className="text-slate-400">
          Intelligently merge multiple scripts into a single cohesive file with conflict detection
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Input Scripts */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Input Scripts</h2>
            <div className="flex gap-2">
              <select
                value={outputLanguage}
                onChange={(e) => setOutputLanguage(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <Button onClick={addScript} className="bg-slate-700 hover:bg-slate-600">
                <Plus size={18} className="mr-1" /> Add Script
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scripts.map((script, index) => (
              <Card key={script.id} className="bg-slate-800 border-slate-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Input
                      value={script.name}
                      onChange={(e) => updateScript(script.id, { name: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white w-40 text-sm"
                    />
                    <button
                      onClick={() => removeScript(script.id)}
                      className="text-slate-400 hover:text-red-400 transition"
                      title="Remove script"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <Textarea
                    value={script.content}
                    onChange={(e) => updateScript(script.id, { content: e.target.value })}
                    placeholder={`Paste ${script.name} code here...`}
                    className="w-full bg-slate-900 border-slate-600 text-slate-100 font-mono text-xs min-h-48 placeholder-slate-500"
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Merge Button */}
          <Button
            onClick={handleMerge}
            disabled={isMerging}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-4"
          >
            {isMerging ? (
              <>
                <RefreshCw className="animate-spin mr-2" size={20} />
                Merging Scripts...
              </>
            ) : (
              <>
                <Combine className="mr-2" size={20} />
                Fuse Scripts
              </>
            )}
          </Button>
        </div>

        {/* Output Panel */}
        <div className="space-y-6">
          {result ? (
            <>
              {/* Summary Card */}
              <Card className="bg-slate-800 border-slate-700">
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-4">Merge Summary</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-700 p-3 rounded">
                      <p className="text-xs text-slate-400">Total Lines</p>
                      <p className="text-xl font-bold text-white">{result.summary.totalLines}</p>
                    </div>
                    <div className="bg-slate-700 p-3 rounded">
                      <p className="text-xs text-slate-400">Imports</p>
                      <p className="text-xl font-bold text-blue-400">{result.summary.importsCount}</p>
                    </div>
                    <div className="bg-slate-700 p-3 rounded">
                      <p className="text-xs text-slate-400">Classes</p>
                      <p className="text-xl font-bold text-green-400">{result.summary.classesCount}</p>
                    </div>
                    <div className="bg-slate-700 p-3 rounded">
                      <p className="text-xs text-slate-400">Functions</p>
                      <p className="text-xl font-bold text-purple-400">{result.summary.functionsCount}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Conflicts Card */}
              {result.conflicts.length > 0 && (
                <Card className="bg-slate-800 border-yellow-600/50">
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                      <AlertTriangle size={20} /> Conflicts Detected
                    </h3>
                    <div className="space-y-2">
                      {result.conflicts.map((conflict, i) => (
                        <div key={i} className="bg-slate-700/50 p-3 rounded border border-slate-600">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-yellow-600 px-2 py-0.5 rounded text-white">
                              {conflict.type}
                            </span>
                            <span className="text-sm font-mono text-white">{conflict.name}</span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Found in: {conflict.sources.join(', ')}
                          </p>
                          <p className="text-xs text-green-400 mt-1">
                            <CheckCircle size={12} className="inline mr-1" />
                            {conflict.resolution}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600"
                >
                  <Eye size={18} className="mr-2" /> {showPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </div>
              <div className="flex gap-2">
                <Button onClick={copyToClipboard} className="flex-1 bg-slate-700 hover:bg-slate-600">
                  <Copy size={18} className="mr-2" /> Copy
                </Button>
                <Button onClick={downloadMerged} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Download size={18} className="mr-2" /> Download
                </Button>
              </div>

              {/* Preview */}
              {showPreview && (
                <Card className="bg-slate-800 border-slate-700">
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-3">Merged Output</h3>
                    <pre className="bg-slate-900 p-4 rounded text-xs text-slate-100 overflow-x-auto max-h-96 font-mono border border-slate-700">
                      <code>{result.mergedCode}</code>
                    </pre>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-slate-800 border-slate-700 h-96 flex items-center justify-center">
              <div className="text-center">
                <Combine size={48} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">
                  Add your scripts and click Fuse to merge them
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

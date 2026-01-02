'use client';

import React, { useState } from 'react';
import { BookOpen, Sparkles, Save, Download, Share2, Plus, Trash2, Eye } from 'lucide-react';
import { PoemsCreatorService, Poem, PoemStyle, PoemCollection } from '@/services/poemsCreatorService';
import toast from 'react-hot-toast';

export default function PoemsCreatorPage() {
  const [activeSection, setActiveSection] = useState<'create' | 'library' | 'prompts'>('create');
  const [poem, setPoem] = useState<Poem>(
    PoemsCreatorService.createPoem(
      'Untitled Poem',
      'You',
      '',
      'free-verse',
      'nature',
      'Peaceful'
    )
  );

  const [poems, setPoems] = useState<Poem[]>([]);
  const [collections, setCollections] = useState<PoemCollection[]>([]);
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const allStyles = PoemsCreatorService.getStyles();
  const allThemes = PoemsCreatorService.getThemes();
  const allMoods = PoemsCreatorService.getMoods();
  const prompts = PoemsCreatorService.getPrompts();

  const handleSavePoem = () => {
    const updated = PoemsCreatorService.createPoem(
      poem.title,
      poem.author,
      poem.content,
      poem.style,
      poem.theme,
      poem.mood
    );
    setPoems([...poems, updated]);
    toast.success(`"${poem.title}" saved!`);
    setPoem(
      PoemsCreatorService.createPoem(
        'Untitled Poem',
        'You',
        '',
        'free-verse',
        'nature',
        'Peaceful'
      )
    );
  };

  const handleLoadPrompt = (promptId: string) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt) return;

    setPoem({
      ...poem,
      style: prompt.style as PoemStyle,
      theme: prompt.themes[0],
      content: prompt.starter,
    });
    toast.success(`Prompt loaded: ${prompt.title}`);
  };

  const validation = PoemsCreatorService.validatePoemStructure(poem);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-slate-950 border-b border-slate-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-400" />
            📝 Poems Creator
          </h1>
          <p className="text-slate-400">Express yourself through poetry in multiple styles</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 flex gap-4">
          <button
            onClick={() => setActiveSection('create')}
            className={`px-4 py-3 border-b-2 transition-colors ${
              activeSection === 'create'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            ✍️ Create
          </button>
          <button
            onClick={() => setActiveSection('library')}
            className={`px-4 py-3 border-b-2 transition-colors ${
              activeSection === 'library'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            📚 Library ({poems.length})
          </button>
          <button
            onClick={() => setActiveSection('prompts')}
            className={`px-4 py-3 border-b-2 transition-colors ${
              activeSection === 'prompts'
                ? 'border-purple-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            💡 Prompts
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* CREATE SECTION */}
        {activeSection === 'create' && (
          <div className="grid grid-cols-3 gap-6">
            {/* Left - Settings */}
            <div className="col-span-1 space-y-4">
              {/* Basic Info */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <h2 className="font-bold mb-4">📋 Poem Details</h2>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="text-slate-400 block mb-1">Title</label>
                    <input
                      type="text"
                      value={poem.title}
                      onChange={(e) => setPoem({ ...poem, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Author</label>
                    <input
                      type="text"
                      value={poem.author}
                      onChange={(e) => setPoem({ ...poem, author: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Style</label>
                    <select
                      value={poem.style}
                      onChange={(e) => setPoem({ ...poem, style: e.target.value as PoemStyle })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-xs"
                    >
                      {Object.entries(allStyles).map(([key, style]) => (
                        <option key={key} value={key}>
                          {style.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Theme</label>
                    <select
                      value={poem.theme}
                      onChange={(e) => setPoem({ ...poem, theme: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-xs"
                    >
                      {Object.keys(allThemes).map(theme => (
                        <option key={theme} value={theme}>
                          {theme}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Mood</label>
                    <div className="flex flex-wrap gap-2">
                      {allMoods.map(mood => (
                        <button
                          key={mood.name}
                          onClick={() => setPoem({ ...poem, mood: mood.name })}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                            poem.mood === mood.name
                              ? 'text-white'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                          style={{
                            backgroundColor:
                              poem.mood === mood.name
                                ? mood.color
                                : 'transparent',
                          }}
                        >
                          {mood.emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Style Guide */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
                <h3 className="font-bold mb-3">📖 Style Guide</h3>
                <div className="bg-slate-950 rounded p-3 text-xs space-y-2">
                  <p className="font-semibold text-white">
                    {allStyles[poem.style].name}
                  </p>
                  <p className="text-slate-400">
                    {allStyles[poem.style].description}
                  </p>
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="font-semibold mb-1">Rules:</p>
                    <ul className="space-y-1 text-slate-400">
                      {allStyles[poem.style].rules.map((rule, i) => (
                        <li key={i}>• {rule}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Validation */}
              {!validation.isValid && (
                <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-3">
                  <p className="text-red-300 font-semibold mb-2">⚠️ Issues Found</p>
                  <ul className="text-xs text-red-200 space-y-1">
                    {validation.issues.map((issue, i) => (
                      <li key={i}>• {issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleSavePoem}
                  className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Poem
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              </div>
            </div>

            {/* Center - Editor */}
            <div className="col-span-2">
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
                <textarea
                  value={poem.content}
                  onChange={(e) => setPoem({ ...poem, content: e.target.value })}
                  placeholder="Start writing your poem here..."
                  className="w-full h-96 px-4 py-3 bg-slate-950 border border-slate-700 rounded text-white font-serif text-lg leading-relaxed resize-none focus:outline-none focus:border-purple-500"
                />

                {/* Stats */}
                <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-4 gap-4 text-center text-xs">
                  <div>
                    <p className="text-slate-400">Lines</p>
                    <p className="font-bold text-lg">{poem.lineCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Words</p>
                    <p className="font-bold text-lg">{poem.wordCount}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Syllables</p>
                    <p className="font-bold text-lg">{poem.metrics.syllables}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Rhyme</p>
                    <p className="font-bold text-lg">{poem.metrics.rhymeScheme || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="mt-4 bg-slate-900 border border-slate-800 rounded-lg p-6">
                  <h3 className="font-bold mb-4">Preview</h3>
                  <div className="prose prose-invert max-w-none">
                    <h2 className="text-2xl font-serif mb-2">{poem.title}</h2>
                    <p className="text-slate-400 mb-4">by {poem.author}</p>
                    <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed">
                      {poem.content}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LIBRARY SECTION */}
        {activeSection === 'library' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {poems.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">No poems yet. Create your first one!</p>
              </div>
            ) : (
              poems.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPoem(p)}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-purple-500 transition-colors cursor-pointer"
                >
                  <h3 className="font-bold mb-1">{p.title}</h3>
                  <p className="text-xs text-slate-400 mb-3">by {p.author}</p>
                  <p className="text-xs text-slate-500 mb-3">{p.content.substring(0, 100)}...</p>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                      {allStyles[p.style as PoemStyle]?.name || p.style}
                    </span>
                    <span className="text-xs text-slate-400">{p.wordCount} words</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PROMPTS SECTION */}
        {activeSection === 'prompts' && (
          <div className="space-y-4">
            {prompts.map(prompt => (
              <div
                key={prompt.id}
                className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-purple-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{prompt.title}</h3>
                    <p className="text-slate-400 text-sm mb-2">{prompt.description}</p>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                        {allStyles[prompt.style as PoemStyle]?.name}
                      </span>
                      <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                        {prompt.difficulty}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleLoadPrompt(prompt.id)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded font-semibold flex items-center gap-2 transition-colors text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    Start
                  </button>
                </div>
                <div className="bg-slate-950 rounded p-3 text-sm italic text-slate-300">
                  "{prompt.starter}"
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

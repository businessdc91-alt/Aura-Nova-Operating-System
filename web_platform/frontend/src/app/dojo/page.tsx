/**
 * =============================================================================
 * THE DOJO - AI-Powered Game Generation & Multi-AI Collaboration
 * =============================================================================
 *
 * Author: Dillan Copeland (DC)
 * Created: January 5, 2026
 * Last Modified: January 5, 2026 - DC
 * Copyright © 2026 Dillan Copeland. All Rights Reserved.
 *
 * NOTICE: This code is proprietary and confidential.
 * Unauthorized copying, distribution, modification, or use of this software,
 * via any medium, is strictly prohibited without express written permission
 * from the copyright owner, Dillan Copeland.
 *
 * For licensing inquiries, please contact the owner.
 *
 * =============================================================================
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGameGeneration, useGameProject, useGameExport } from '@/hooks/useGameGeneration';
import { useActiveModel } from '@/hooks/useModelManagement';
import { Wand2, Code2, Download, Zap, BookOpen, Users } from 'lucide-react';
import { CatalystDojo } from '@/components/coding-dojo/CatalystDojo';

export default function DojoPage() {
  const [tab, setTab] = useState<'generator' | 'viewer' | 'catalyst'>('generator');
  const { model } = useActiveModel();
  const { generateGame, generating, gameProject, reset } = useGameGeneration();
  const { viewingSection, setViewingSection } = useGameProject(gameProject);
  const { exportAsZip, exporting, exported } = useGameExport(gameProject);

  const [formData, setFormData] = useState({
    title: '',
    prompt: '',
    complexity: 'adventure' as any,
    engine: 'web' as any,
    graphicsStyle: 'pixel-art' as any,
  });

  const handleGenerate = async () => {
    if (!formData.title || !formData.prompt) {
      alert('Please fill in title and description');
      return;
    }

    await generateGame({
      title: formData.title,
      prompt: formData.prompt,
      complexity: formData.complexity,
      engine: formData.engine,
      graphicsStyle: formData.graphicsStyle,
    });

    setTab('viewer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">The Dojo</h1>
              <p className="text-slate-400">
                Create full games with your AI partner. From puzzle games to Zelda-like adventures.
              </p>
            </div>
            {model && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <p className="text-sm text-slate-400">Working with</p>
                <p className="text-lg font-bold text-white">{model.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={tab === 'generator' ? 'default' : 'outline'}
            onClick={() => setTab('generator')}
            className="flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            Create Game
          </Button>
          <Button
            variant={tab === 'catalyst' ? 'default' : 'outline'}
            onClick={() => setTab('catalyst')}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
          >
            <Users className="w-4 h-4" />
            Multi-AI Catalyst
          </Button>
          {gameProject && (
            <Button
              variant={tab === 'viewer' ? 'default' : 'outline'}
              onClick={() => setTab('viewer')}
              className="flex items-center gap-2"
            >
              <Code2 className="w-4 h-4" />
              View Project
            </Button>
          )}
        </div>

        {/* Generator Tab */}
        {tab === 'generator' && (
          <GeneratorTab
            formData={formData}
            setFormData={setFormData}
            generating={generating}
            onGenerate={handleGenerate}
          />
        )}

        {/* Catalyst Multi-AI Tab */}
        {tab === 'catalyst' && <CatalystDojo />}

        {/* Viewer Tab */}
        {tab === 'viewer' && gameProject && (
          <ViewerTab
            project={gameProject}
            viewingSection={viewingSection}
            setViewingSection={setViewingSection}
            onExport={exportAsZip}
            exporting={exporting}
            exported={exported}
          />
        )}
      </div>
    </div>
  );
}

function GeneratorTab({ formData, setFormData, generating, onGenerate }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Describe Your Game</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Game Title</label>
              <Input
                placeholder="e.g., Crystal Quest, Dragon's Realm"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Your Vision</label>
              <textarea
                placeholder="Describe your game idea in detail. The AI will create the story, mechanics, levels, and code..."
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                className="w-full h-32 bg-slate-900 border border-slate-700 rounded text-white p-3 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Scope</label>
              <select
                value={formData.complexity}
                onChange={(e) => setFormData({ ...formData, complexity: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded text-white p-2"
              >
                <option value="puzzle">Puzzle Game (4 hours)</option>
                <option value="arcade">Arcade Game (6 hours)</option>
                <option value="adventure">Adventure Game (12 hours)</option>
                <option value="rpg">RPG (24 hours)</option>
                <option value="zelda-like">Zelda-like (30 hours)</option>
                <option value="epic">Epic Adventure (60+ hours)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Engine</label>
              <select
                value={formData.engine}
                onChange={(e) => setFormData({ ...formData, engine: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded text-white p-2"
              >
                <option value="web">Web (Phaser 3)</option>
                <option value="unity">Unity</option>
                <option value="godot">Godot</option>
                <option value="unreal">Unreal Engine 5</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Art Style</label>
              <select
                value={formData.graphicsStyle}
                onChange={(e) => setFormData({ ...formData, graphicsStyle: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded text-white p-2"
              >
                <option value="pixel-art">Pixel Art</option>
                <option value="retro-3d">Retro 3D</option>
                <option value="modern-3d">Modern 3D</option>
                <option value="hand-drawn">Hand Drawn</option>
                <option value="zelda-oot">Zelda OoT Style</option>
              </select>
            </div>

            <Button
              onClick={onGenerate}
              disabled={generating || !formData.title || !formData.prompt}
              size="lg"
              className="w-full"
            >
              {generating ? 'Creating...' : <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Game
              </>}
            </Button>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            How It Works
          </h3>
          <ol className="space-y-2 text-sm text-slate-300">
            <li>1. Describe your game</li>
            <li>2. AI generates everything</li>
            <li>3. Review the project</li>
            <li>4. Export & develop</li>
          </ol>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <h3 className="font-bold text-white mb-3">Examples</h3>
          <ul className="space-y-1 text-sm text-slate-400">
            <li>"Zelda-style RPG with time travel"</li>
            <li>"Pixel art dungeon crawler"</li>
            <li>"Puzzle game about gravity"</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function ViewerTab({ project, viewingSection, setViewingSection, onExport, exporting, exported }: any) {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-blue-700/50 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{project.title}</h2>
            <p className="text-slate-300">{project.description}</p>
          </div>
          <Button onClick={() => onExport(project.engine)} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            {exported ? 'Downloaded!' : 'Export'}
          </Button>
        </div>
      </Card>

      <div className="flex gap-2 flex-wrap">
        {['overview', 'story', 'mechanics', 'characters', 'levels', 'code'].map((section) => (
          <Button
            key={section}
            variant={viewingSection === section ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewingSection(section)}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </Button>
        ))}
      </div>

      <Card className="bg-slate-800/50 border-slate-700 p-6">
        {viewingSection === 'overview' && <OverviewSection project={project} />}
        {viewingSection === 'story' && <StorySection story={project.story} />}
        {viewingSection === 'mechanics' && <MechanicsSection mechanics={project.mechanics} />}
        {viewingSection === 'characters' && <CharactersSection characters={project.characters} />}
        {viewingSection === 'levels' && <LevelsSection levels={project.levels} />}
        {viewingSection === 'code' && <CodeSection code={project.mainGameCode} />}
      </Card>
    </div>
  );
}

function OverviewSection({ project }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
      <StatBadge label="Engine" value={project.engine} />
      <StatBadge label="Style" value={project.graphicsStyle} />
      <StatBadge label="Complexity" value={project.complexity} />
      <StatBadge label="Hours" value={project.estimatedHours} />
      <StatBadge label="Levels" value={project.levels.length} />
      <StatBadge label="Characters" value={project.characters.length} />
    </div>
  );
}

function StorySection({ story }: any) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-white text-lg">{story.title}</h3>
      <p className="text-slate-300">{story.premise}</p>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-slate-400 font-medium">Act 1: Setup</p>
          <p className="text-white">{story.act1}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400 font-medium">Act 2: Conflict</p>
          <p className="text-white">{story.act2}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400 font-medium">Act 3: Resolution</p>
          <p className="text-white">{story.act3}</p>
        </div>
      </div>
    </div>
  );
}

function MechanicsSection({ mechanics }: any) {
  return (
    <div className="space-y-3">
      {mechanics.map((m: any, i: number) => (
        <div key={i} className="bg-slate-900/30 p-4 rounded border border-slate-700">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-bold text-white">{m.name}</h4>
            <span className="text-xs bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded capitalize">
              {m.difficulty}
            </span>
          </div>
          <p className="text-sm text-slate-300">{m.description}</p>
        </div>
      ))}
    </div>
  );
}

function CharactersSection({ characters }: any) {
  return (
    <div className="space-y-3">
      {characters.map((c: any, i: number) => (
        <div key={i} className="bg-slate-900/30 p-4 rounded border border-slate-700">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-bold text-white">{c.name}</h4>
            <span className="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded capitalize">
              {c.role}
            </span>
          </div>
          <p className="text-sm text-slate-300">{c.appearance}</p>
        </div>
      ))}
    </div>
  );
}

function LevelsSection({ levels }: any) {
  return (
    <div className="space-y-2">
      {levels.map((l: any) => (
        <div key={l.number} className="bg-slate-900/30 p-3 rounded border border-slate-700 text-sm">
          <p className="font-bold text-white">Level {l.number}: {l.name}</p>
          <p className="text-slate-300">{l.description}</p>
        </div>
      ))}
    </div>
  );
}

function CodeSection({ code }: any) {
  return (
    <div>
      <pre className="bg-slate-900 p-4 rounded overflow-x-auto text-xs text-slate-300 max-h-96">
        {code}
      </pre>
      <Button size="sm" className="mt-4" onClick={() => navigator.clipboard.writeText(code)}>
        Copy Code
      </Button>
    </div>
  );
}

function StatBadge({ label, value }: any) {
  return (
    <div className="bg-slate-900/50 rounded p-3 text-center">
      <p className="text-xs text-slate-500 uppercase">{label}</p>
      <p className="text-sm font-bold text-white capitalize">{value}</p>
    </div>
  );
}

/**
 * React hooks for game generation and Dojo workflows
 */

import { useState, useCallback } from 'react';
import { gameScaffoldService, type GameGenerationRequest, type GameProject } from '@/lib/gameScaffold';

export function useGameGeneration() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameProject, setGameProject] = useState<GameProject | null>(null);

  const generateGame = useCallback(async (request: GameGenerationRequest) => {
    setGenerating(true);
    setError(null);

    try {
      const project = await gameScaffoldService.generateGameProject(request);
      setGameProject(project);
      return project;
    } catch (err: any) {
      const errMsg = err.message || 'Failed to generate game';
      setError(errMsg);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setGameProject(null);
    setError(null);
  }, []);

  return {
    generateGame,
    generating,
    error,
    gameProject,
    reset,
  };
}

export function useGameProject(project: GameProject | null) {
  const [viewingSection, setViewingSection] = useState<
    'overview' | 'story' | 'mechanics' | 'characters' | 'levels' | 'code' | 'instructions'
  >('overview');

  const getProjectStats = useCallback(() => {
    if (!project) return null;

    return {
      totalFiles: countFiles(project.projectStructure),
      totalCharacters: project.characters.length,
      totalLevels: project.levels.length,
      estimatedHours: project.estimatedHours,
      graphicsStyle: project.graphicsStyle,
      engine: project.engine,
    };
  }, [project]);

  return {
    viewingSection,
    setViewingSection,
    getProjectStats,
  };
}

function countFiles(files: any[], count = 0): number {
  for (const file of files) {
    if (!file.isFolder) count++;
    if (file.children) count = countFiles(file.children, count);
  }
  return count;
}

export function useGameExport(project: GameProject | null) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const exportAsZip = useCallback(async (format: 'web' | 'unity' | 'godot' | 'unreal') => {
    if (!project) return;

    setExporting(true);

    try {
      // In production, this would create a zip file
      const projectName = project.title.toLowerCase().replace(/\s+/g, '-');
      const filename = `${projectName}-${format}.zip`;

      // Simulate download
      const blob = new Blob([JSON.stringify(project, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      setExported(true);

      // Reset exported status after 3 seconds
      setTimeout(() => setExported(false), 3000);
    } finally {
      setExporting(false);
    }
  }, [project]);

  return {
    exportAsZip,
    exporting,
    exported,
  };
}

export function useDojoSession(userId: string) {
  const [sessionActive, setSessionActive] = useState(false);
  const [currentGame, setCurrentGame] = useState<GameProject | null>(null);
  const [turns, setTurns] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<Array<{ type: 'human' | 'ai'; name: string }>>(
    []
  );

  const startSession = useCallback(async (game: GameProject, aiPartners: string[]) => {
    setCurrentGame(game);
    setCollaborators([
      { type: 'human', name: 'You' },
      ...aiPartners.map((name) => ({ type: 'ai' as const, name })),
    ]);
    setSessionActive(true);
    setTurns([]);
  }, []);

  const submitTurn = useCallback(
    (content: string, author: string) => {
      const turn = {
        id: `turn-${Date.now()}`,
        author,
        content,
        timestamp: new Date(),
        type: author === 'You' ? 'user' : 'ai',
      };

      setTurns((prev) => [...prev, turn]);
      return turn;
    },
    []
  );

  const endSession = useCallback(() => {
    setSessionActive(false);
    setCurrentGame(null);
    setTurns([]);
  }, []);

  return {
    sessionActive,
    currentGame,
    turns,
    collaborators,
    startSession,
    submitTurn,
    endSession,
  };
}

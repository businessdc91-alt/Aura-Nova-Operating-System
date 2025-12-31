'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { RotateCcw, Trophy, Zap, Brain, Users, Bot, Sparkles } from 'lucide-react';

// ============================================================================
// AI TIC TAC TOE - PLAYER VS AI OR AI VS AI
// Minimax algorithm with adjustable difficulty
// ============================================================================

type Player = 'X' | 'O' | null;
type Board = Player[];
type Difficulty = 'easy' | 'medium' | 'hard' | 'impossible';
type GameMode = 'pvai' | 'aivai';

interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  winningLine: number[] | null;
  isGameOver: boolean;
  scores: { X: number; O: number; draws: number };
}

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6], // Diagonals
];

const checkWinner = (board: Board): { winner: Player | 'draw'; line: number[] | null } => {
  for (const combo of WINNING_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combo };
    }
  }
  if (board.every(cell => cell !== null)) {
    return { winner: 'draw', line: null };
  }
  return { winner: null, line: null };
};

// Minimax algorithm for AI
const minimax = (
  board: Board,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: Player,
  humanPlayer: Player
): number => {
  const { winner } = checkWinner(board);
  
  if (winner === aiPlayer) return 10 - depth;
  if (winner === humanPlayer) return depth - 10;
  if (winner === 'draw') return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = aiPlayer;
        const evaluation = minimax(board, depth + 1, false, alpha, beta, aiPlayer, humanPlayer);
        board[i] = null;
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = humanPlayer;
        const evaluation = minimax(board, depth + 1, true, alpha, beta, aiPlayer, humanPlayer);
        board[i] = null;
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }
};

const getAIMove = (board: Board, difficulty: Difficulty, aiPlayer: Player): number => {
  const emptyCells = board.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1);
  
  if (emptyCells.length === 0) return -1;

  // Easy: Random move
  if (difficulty === 'easy') {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  // Medium: 50% optimal, 50% random
  if (difficulty === 'medium' && Math.random() < 0.5) {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  // Hard & Impossible: Minimax (hard has small random factor)
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';
  let bestMove = -1;
  let bestScore = -Infinity;

  for (const i of emptyCells) {
    const newBoard = [...board];
    newBoard[i] = aiPlayer;
    const score = minimax(newBoard, 0, false, -Infinity, Infinity, aiPlayer, humanPlayer);
    
    // Hard: Add small randomness to make it beatable
    const adjustedScore = difficulty === 'hard' ? score + (Math.random() * 0.5 - 0.25) : score;
    
    if (adjustedScore > bestScore) {
      bestScore = adjustedScore;
      bestMove = i;
    }
  }

  return bestMove;
};

export const AITicTacToe: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('pvai');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerSymbol, setPlayerSymbol] = useState<'X' | 'O'>('X');
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    winningLine: null,
    isGameOver: false,
    scores: { X: 0, O: 0, draws: 0 },
  });
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const aiPlayer = gameMode === 'pvai' ? (playerSymbol === 'X' ? 'O' : 'X') : null;

  // Handle AI moves
  useEffect(() => {
    if (gameState.isGameOver || isAIThinking) return;

    const currentIsAI = gameMode === 'aivai' || 
      (gameMode === 'pvai' && gameState.currentPlayer === aiPlayer);

    if (currentIsAI) {
      setIsAIThinking(true);
      
      // Add delay for visual effect
      const delay = gameMode === 'aivai' ? 500 : 300;
      aiTimeoutRef.current = setTimeout(() => {
        const move = getAIMove(gameState.board, difficulty, gameState.currentPlayer!);
        if (move !== -1) {
          makeMove(move);
        }
        setIsAIThinking(false);
      }, delay);
    }

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [gameState.currentPlayer, gameState.isGameOver, gameMode, aiPlayer, difficulty]);

  const makeMove = useCallback((index: number) => {
    if (gameState.board[index] !== null || gameState.isGameOver) return;

    const newBoard = [...gameState.board];
    newBoard[index] = gameState.currentPlayer;

    const { winner, line } = checkWinner(newBoard);
    const isGameOver = winner !== null;

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: prev.currentPlayer === 'X' ? 'O' : 'X',
      winner,
      winningLine: line,
      isGameOver,
      scores: isGameOver ? {
        X: winner === 'X' ? prev.scores.X + 1 : prev.scores.X,
        O: winner === 'O' ? prev.scores.O + 1 : prev.scores.O,
        draws: winner === 'draw' ? prev.scores.draws + 1 : prev.scores.draws,
      } : prev.scores,
    }));
  }, [gameState]);

  const handleCellClick = (index: number) => {
    if (gameMode === 'aivai') return; // No player input in AI vs AI
    if (gameMode === 'pvai' && gameState.currentPlayer !== playerSymbol) return; // Not player's turn
    if (isAIThinking) return;
    
    makeMove(index);
  };

  const resetGame = () => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    setIsAIThinking(false);
    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      winningLine: null,
      isGameOver: false,
    }));
  };

  const resetAll = () => {
    resetGame();
    setGameState(prev => ({
      ...prev,
      scores: { X: 0, O: 0, draws: 0 },
    }));
    setShowSettings(true);
  };

  const startGame = () => {
    resetGame();
    setShowSettings(false);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6 overflow-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Brain className="w-7 h-7 text-purple-400" />
          AI Tic Tac Toe
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {gameMode === 'pvai' ? 'Challenge the AI' : 'Watch AI vs AI battle'}
        </p>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="max-w-md mx-auto w-full bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Game Settings</h2>
          
          {/* Game Mode */}
          <div className="mb-4">
            <label className="text-sm text-slate-400 mb-2 block">Game Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setGameMode('pvai')}
                className={`
                  p-3 rounded-lg flex items-center justify-center gap-2 transition-all
                  ${gameMode === 'pvai' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }
                `}
              >
                <Users className="w-5 h-5" />
                Player vs AI
              </button>
              <button
                onClick={() => setGameMode('aivai')}
                className={`
                  p-3 rounded-lg flex items-center justify-center gap-2 transition-all
                  ${gameMode === 'aivai' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  }
                `}
              >
                <Bot className="w-5 h-5" />
                AI vs AI
              </button>
            </div>
          </div>

          {/* Player Symbol (only for PvAI) */}
          {gameMode === 'pvai' && (
            <div className="mb-4">
              <label className="text-sm text-slate-400 mb-2 block">Play as</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPlayerSymbol('X')}
                  className={`
                    p-3 rounded-lg text-2xl font-bold transition-all
                    ${playerSymbol === 'X' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }
                  `}
                >
                  X
                </button>
                <button
                  onClick={() => setPlayerSymbol('O')}
                  className={`
                    p-3 rounded-lg text-2xl font-bold transition-all
                    ${playerSymbol === 'O' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }
                  `}
                >
                  O
                </button>
              </div>
            </div>
          )}

          {/* Difficulty */}
          <div className="mb-6">
            <label className="text-sm text-slate-400 mb-2 block">AI Difficulty</label>
            <div className="grid grid-cols-4 gap-2">
              {(['easy', 'medium', 'hard', 'impossible'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`
                    p-2 rounded-lg text-sm capitalize transition-all
                    ${difficulty === d 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                    }
                  `}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all"
          >
            <Zap className="w-5 h-5" />
            Start Game
          </button>
        </div>
      )}

      {/* Game Board */}
      {!showSettings && (
        <>
          {/* Score Board */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{gameState.scores.X}</div>
              <div className="text-xs text-slate-400">X Wins</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-400">{gameState.scores.draws}</div>
              <div className="text-xs text-slate-400">Draws</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">{gameState.scores.O}</div>
              <div className="text-xs text-slate-400">O Wins</div>
            </div>
          </div>

          {/* Status */}
          <div className="text-center mb-4">
            {gameState.isGameOver ? (
              <div className="flex items-center justify-center gap-2 text-xl font-bold">
                {gameState.winner === 'draw' ? (
                  <span className="text-slate-400">It's a Draw!</span>
                ) : (
                  <>
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <span className={gameState.winner === 'X' ? 'text-blue-400' : 'text-red-400'}>
                      {gameState.winner} Wins!
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-lg">
                {isAIThinking && (
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                )}
                <span className={gameState.currentPlayer === 'X' ? 'text-blue-400' : 'text-red-400'}>
                  {isAIThinking 
                    ? 'AI is thinking...' 
                    : gameMode === 'pvai' && gameState.currentPlayer === playerSymbol
                      ? 'Your turn'
                      : `${gameState.currentPlayer}'s turn`
                  }
                </span>
              </div>
            )}
          </div>

          {/* Board */}
          <div className="flex justify-center mb-6">
            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-800/50 rounded-xl">
              {gameState.board.map((cell, index) => {
                const isWinningCell = gameState.winningLine?.includes(index);
                return (
                  <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={cell !== null || gameState.isGameOver || isAIThinking}
                    className={`
                      w-20 h-20 rounded-lg text-4xl font-bold transition-all duration-200
                      flex items-center justify-center
                      ${cell === null && !gameState.isGameOver && !isAIThinking
                        ? 'bg-slate-700/50 hover:bg-slate-600/50 cursor-pointer' 
                        : 'bg-slate-700/30'
                      }
                      ${isWinningCell ? 'ring-2 ring-yellow-400 bg-yellow-400/20' : ''}
                      ${cell === 'X' ? 'text-blue-400' : 'text-red-400'}
                    `}
                  >
                    {cell}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium text-white flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              New Game
            </button>
            <button
              onClick={resetAll}
              className="px-6 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              Settings
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AITicTacToe;

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { RotateCcw, Trophy, Zap, Brain, Users, Bot, Sparkles, Crown } from 'lucide-react';

// ============================================================================
// AI CHECKERS - PLAYER VS AI OR AI VS AI
// Full checkers implementation with king pieces and AI opponent
// ============================================================================

type PieceType = 'red' | 'black' | 'red-king' | 'black-king' | null;
type Difficulty = 'easy' | 'medium' | 'hard';
type GameMode = 'pvai' | 'aivai';

interface Position {
  row: number;
  col: number;
}

interface Move {
  from: Position;
  to: Position;
  captures: Position[];
  isJump: boolean;
}

interface GameState {
  board: PieceType[][];
  currentPlayer: 'red' | 'black';
  selectedPiece: Position | null;
  validMoves: Move[];
  winner: 'red' | 'black' | 'draw' | null;
  isGameOver: boolean;
  mustJump: boolean;
  scores: { red: number; black: number; draws: number };
  redCount: number;
  blackCount: number;
}

const BOARD_SIZE = 8;

const createInitialBoard = (): PieceType[][] => {
  const board: PieceType[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place black pieces (top 3 rows)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = 'black';
      }
    }
  }
  
  // Place red pieces (bottom 3 rows)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = 'red';
      }
    }
  }
  
  return board;
};

const countPieces = (board: PieceType[][]): { red: number; black: number } => {
  let red = 0, black = 0;
  for (const row of board) {
    for (const piece of row) {
      if (piece?.startsWith('red')) red++;
      if (piece?.startsWith('black')) black++;
    }
  }
  return { red, black };
};

const getPieceColor = (piece: PieceType): 'red' | 'black' | null => {
  if (!piece) return null;
  return piece.startsWith('red') ? 'red' : 'black';
};

const isKing = (piece: PieceType): boolean => {
  return piece?.endsWith('-king') || false;
};

const getValidMoves = (board: PieceType[][], row: number, col: number): Move[] => {
  const piece = board[row][col];
  if (!piece) return [];

  const color = getPieceColor(piece);
  const king = isKing(piece);
  const moves: Move[] = [];
  const jumps: Move[] = [];

  // Directions based on piece type
  const directions: number[][] = [];
  if (color === 'red' || king) directions.push([-1, -1], [-1, 1]); // Up
  if (color === 'black' || king) directions.push([1, -1], [1, 1]); // Down

  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;

    // Simple move
    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
      if (board[newRow][newCol] === null) {
        moves.push({
          from: { row, col },
          to: { row: newRow, col: newCol },
          captures: [],
          isJump: false,
        });
      } else if (getPieceColor(board[newRow][newCol]) !== color) {
        // Jump move
        const jumpRow = newRow + dRow;
        const jumpCol = newCol + dCol;
        if (jumpRow >= 0 && jumpRow < 8 && jumpCol >= 0 && jumpCol < 8) {
          if (board[jumpRow][jumpCol] === null) {
            jumps.push({
              from: { row, col },
              to: { row: jumpRow, col: jumpCol },
              captures: [{ row: newRow, col: newCol }],
              isJump: true,
            });
          }
        }
      }
    }
  }

  // If there are jumps, only return jumps (forced capture rule)
  return jumps.length > 0 ? jumps : moves;
};

const getAllMovesForPlayer = (board: PieceType[][], player: 'red' | 'black'): Move[] => {
  const allMoves: Move[] = [];
  const allJumps: Move[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (getPieceColor(board[row][col]) === player) {
        const moves = getValidMoves(board, row, col);
        for (const move of moves) {
          if (move.isJump) {
            allJumps.push(move);
          } else {
            allMoves.push(move);
          }
        }
      }
    }
  }

  // Forced capture rule
  return allJumps.length > 0 ? allJumps : allMoves;
};

const applyMove = (board: PieceType[][], move: Move): PieceType[][] => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[move.from.row][move.from.col];
  
  newBoard[move.from.row][move.from.col] = null;
  
  // Remove captured pieces
  for (const capture of move.captures) {
    newBoard[capture.row][capture.col] = null;
  }
  
  // Check for king promotion
  let finalPiece = piece;
  if (piece === 'red' && move.to.row === 0) finalPiece = 'red-king';
  if (piece === 'black' && move.to.row === 7) finalPiece = 'black-king';
  
  newBoard[move.to.row][move.to.col] = finalPiece;
  
  return newBoard;
};

// Simple AI evaluation
const evaluateBoard = (board: PieceType[][], forPlayer: 'red' | 'black'): number => {
  let score = 0;
  const opponent = forPlayer === 'red' ? 'black' : 'red';
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      const color = getPieceColor(piece);
      
      if (color === forPlayer) {
        score += isKing(piece) ? 3 : 1;
        // Positional bonus for advancement
        if (color === 'red') score += (7 - row) * 0.1;
        else score += row * 0.1;
      } else if (color === opponent) {
        score -= isKing(piece) ? 3 : 1;
        if (color === 'red') score -= (7 - row) * 0.1;
        else score -= row * 0.1;
      }
    }
  }
  
  return score;
};

const getAIMove = (board: PieceType[][], player: 'red' | 'black', difficulty: Difficulty): Move | null => {
  const moves = getAllMovesForPlayer(board, player);
  if (moves.length === 0) return null;

  if (difficulty === 'easy') {
    // Random move
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Evaluate all moves
  const evaluatedMoves = moves.map(move => {
    const newBoard = applyMove(board, move);
    return {
      move,
      score: evaluateBoard(newBoard, player),
    };
  });

  // Sort by score
  evaluatedMoves.sort((a, b) => b.score - a.score);

  if (difficulty === 'medium') {
    // Pick from top 3 moves randomly
    const topMoves = evaluatedMoves.slice(0, Math.min(3, evaluatedMoves.length));
    return topMoves[Math.floor(Math.random() * topMoves.length)].move;
  }

  // Hard: Always pick best move
  return evaluatedMoves[0].move;
};

export const AICheckers: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('pvai');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerColor, setPlayerColor] = useState<'red' | 'black'>('red');
  const [gameState, setGameState] = useState<GameState>(() => {
    const board = createInitialBoard();
    const counts = countPieces(board);
    return {
      board,
      currentPlayer: 'black',
      selectedPiece: null,
      validMoves: [],
      winner: null,
      isGameOver: false,
      mustJump: false,
      scores: { red: 0, black: 0, draws: 0 },
      ...counts,
    };
  });
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [highlightedMoves, setHighlightedMoves] = useState<Move[]>([]);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const aiColor = gameMode === 'pvai' ? (playerColor === 'red' ? 'black' : 'red') : null;

  // Handle AI moves
  useEffect(() => {
    if (gameState.isGameOver || isAIThinking) return;

    const currentIsAI = gameMode === 'aivai' || 
      (gameMode === 'pvai' && gameState.currentPlayer === aiColor);

    if (currentIsAI) {
      setIsAIThinking(true);
      
      const delay = gameMode === 'aivai' ? 800 : 500;
      aiTimeoutRef.current = setTimeout(() => {
        const move = getAIMove(gameState.board, gameState.currentPlayer, difficulty);
        if (move) {
          executeMove(move);
        }
        setIsAIThinking(false);
      }, delay);
    }

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [gameState.currentPlayer, gameState.isGameOver, gameMode, aiColor, difficulty]);

  const executeMove = useCallback((move: Move) => {
    setGameState(prev => {
      const newBoard = applyMove(prev.board, move);
      const counts = countPieces(newBoard);
      
      // Check for additional jumps (multi-jump)
      let nextPlayer = prev.currentPlayer === 'red' ? 'black' : 'red';
      let additionalJumps: Move[] = [];
      
      if (move.isJump) {
        additionalJumps = getValidMoves(newBoard, move.to.row, move.to.col)
          .filter(m => m.isJump);
        
        if (additionalJumps.length > 0) {
          // Must continue jumping
          nextPlayer = prev.currentPlayer;
        }
      }

      // Check for winner
      let winner: 'red' | 'black' | 'draw' | null = null;
      let isGameOver = false;

      if (counts.red === 0) {
        winner = 'black';
        isGameOver = true;
      } else if (counts.black === 0) {
        winner = 'red';
        isGameOver = true;
      } else {
        const nextMoves = getAllMovesForPlayer(newBoard, nextPlayer);
        if (nextMoves.length === 0) {
          winner = prev.currentPlayer;
          isGameOver = true;
        }
      }

      return {
        ...prev,
        board: newBoard,
        currentPlayer: nextPlayer,
        selectedPiece: additionalJumps.length > 0 ? move.to : null,
        validMoves: additionalJumps,
        winner,
        isGameOver,
        mustJump: additionalJumps.length > 0,
        scores: isGameOver ? {
          red: winner === 'red' ? prev.scores.red + 1 : prev.scores.red,
          black: winner === 'black' ? prev.scores.black + 1 : prev.scores.black,
          draws: winner === 'draw' ? prev.scores.draws + 1 : prev.scores.draws,
        } : prev.scores,
        ...counts,
      };
    });
    setHighlightedMoves([]);
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (gameMode === 'aivai') return;
    if (gameMode === 'pvai' && gameState.currentPlayer !== playerColor) return;
    if (isAIThinking || gameState.isGameOver) return;

    const clickedPiece = gameState.board[row][col];
    const clickedColor = getPieceColor(clickedPiece);

    // If must continue jumping
    if (gameState.mustJump) {
      const jumpMove = gameState.validMoves.find(
        m => m.to.row === row && m.to.col === col
      );
      if (jumpMove) {
        executeMove(jumpMove);
      }
      return;
    }

    // Select own piece
    if (clickedColor === gameState.currentPlayer) {
      const allPlayerMoves = getAllMovesForPlayer(gameState.board, gameState.currentPlayer);
      const pieceMoves = allPlayerMoves.filter(m => m.from.row === row && m.from.col === col);
      
      if (pieceMoves.length > 0) {
        setGameState(prev => ({
          ...prev,
          selectedPiece: { row, col },
          validMoves: pieceMoves,
        }));
        setHighlightedMoves(pieceMoves);
      }
      return;
    }

    // Move to empty cell
    if (gameState.selectedPiece && clickedPiece === null) {
      const move = gameState.validMoves.find(
        m => m.to.row === row && m.to.col === col
      );
      if (move) {
        executeMove(move);
      }
    }
  };

  const resetGame = () => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    setIsAIThinking(false);
    const board = createInitialBoard();
    const counts = countPieces(board);
    setGameState(prev => ({
      ...prev,
      board,
      currentPlayer: 'black',
      selectedPiece: null,
      validMoves: [],
      winner: null,
      isGameOver: false,
      mustJump: false,
      ...counts,
    }));
    setHighlightedMoves([]);
  };

  const resetAll = () => {
    resetGame();
    setGameState(prev => ({
      ...prev,
      scores: { red: 0, black: 0, draws: 0 },
    }));
    setShowSettings(true);
  };

  const startGame = () => {
    resetGame();
    setShowSettings(false);
  };

  const isMoveTarget = (row: number, col: number) => {
    return highlightedMoves.some(m => m.to.row === row && m.to.col === col);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-amber-900/10 to-slate-900 p-4 overflow-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Crown className="w-7 h-7 text-amber-400" />
          AI Checkers
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {gameMode === 'pvai' ? 'Challenge the AI' : 'Watch AI vs AI battle'}
        </p>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="max-w-md mx-auto w-full bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-4">
          <h2 className="text-lg font-semibold text-white mb-4">Game Settings</h2>
          
          {/* Game Mode */}
          <div className="mb-4">
            <label className="text-sm text-slate-400 mb-2 block">Game Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setGameMode('pvai')}
                className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-all
                  ${gameMode === 'pvai' ? 'bg-amber-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
              >
                <Users className="w-5 h-5" />
                Player vs AI
              </button>
              <button
                onClick={() => setGameMode('aivai')}
                className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-all
                  ${gameMode === 'aivai' ? 'bg-amber-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
              >
                <Bot className="w-5 h-5" />
                AI vs AI
              </button>
            </div>
          </div>

          {/* Player Color */}
          {gameMode === 'pvai' && (
            <div className="mb-4">
              <label className="text-sm text-slate-400 mb-2 block">Play as</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPlayerColor('red')}
                  className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-all
                    ${playerColor === 'red' ? 'bg-red-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
                >
                  <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-red-300" />
                  Red
                </button>
                <button
                  onClick={() => setPlayerColor('black')}
                  className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-all
                    ${playerColor === 'black' ? 'bg-slate-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
                >
                  <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600" />
                  Black
                </button>
              </div>
            </div>
          )}

          {/* Difficulty */}
          <div className="mb-6">
            <label className="text-sm text-slate-400 mb-2 block">AI Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`p-2 rounded-lg text-sm capitalize transition-all
                    ${difficulty === d ? 'bg-amber-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all"
          >
            <Zap className="w-5 h-5" />
            Start Game
          </button>
        </div>
      )}

      {/* Game Board */}
      {!showSettings && (
        <>
          {/* Score & Status */}
          <div className="flex justify-between items-center mb-4 max-w-lg mx-auto w-full px-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-red-300" />
              <span className="text-white font-bold">{gameState.redCount}</span>
              <span className="text-xs text-slate-400">({gameState.scores.red}W)</span>
            </div>
            <div className="text-center">
              {gameState.isGameOver ? (
                <div className="flex items-center gap-2 text-lg font-bold">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className={gameState.winner === 'red' ? 'text-red-400' : 'text-slate-300'}>
                    {gameState.winner === 'red' ? 'Red' : 'Black'} Wins!
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  {isAIThinking && <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />}
                  <span className={gameState.currentPlayer === 'red' ? 'text-red-400' : 'text-slate-300'}>
                    {isAIThinking ? 'AI thinking...' : `${gameState.currentPlayer}'s turn`}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">({gameState.scores.black}W)</span>
              <span className="text-white font-bold">{gameState.blackCount}</span>
              <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600" />
            </div>
          </div>

          {/* Board */}
          <div className="flex justify-center mb-4">
            <div className="p-2 bg-amber-900/50 rounded-lg shadow-2xl">
              <div className="grid grid-cols-8 gap-0.5">
                {gameState.board.map((row, rowIdx) =>
                  row.map((cell, colIdx) => {
                    const isDark = (rowIdx + colIdx) % 2 === 1;
                    const isSelected = gameState.selectedPiece?.row === rowIdx && 
                                       gameState.selectedPiece?.col === colIdx;
                    const isMoveCell = isMoveTarget(rowIdx, colIdx);
                    const piece = cell;

                    return (
                      <button
                        key={`${rowIdx}-${colIdx}`}
                        onClick={() => handleCellClick(rowIdx, colIdx)}
                        className={`
                          w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all relative
                          ${isDark ? 'bg-amber-800' : 'bg-amber-100'}
                          ${isSelected ? 'ring-2 ring-yellow-400' : ''}
                          ${isMoveCell ? 'ring-2 ring-green-400' : ''}
                        `}
                      >
                        {piece && (
                          <div className={`
                            w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center
                            ${piece.startsWith('red') 
                              ? 'bg-gradient-to-br from-red-400 to-red-600 border-red-300' 
                              : 'bg-gradient-to-br from-slate-600 to-slate-800 border-slate-500'
                            }
                            shadow-lg
                          `}>
                            {isKing(piece) && (
                              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                            )}
                          </div>
                        )}
                        {isMoveCell && !piece && (
                          <div className="absolute w-4 h-4 rounded-full bg-green-400/50" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
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
              className="px-6 py-2 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              Settings
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AICheckers;

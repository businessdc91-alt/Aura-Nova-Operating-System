'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { RotateCcw, Trophy, Zap, Brain, Users, Bot, Sparkles, Crown } from 'lucide-react';

// ============================================================================
// AI CHESS - PLAYER VS AI OR AI VS AI
// Full chess implementation with all piece movements and AI opponent
// ============================================================================

type PieceColor = 'white' | 'black';
type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
type Difficulty = 'easy' | 'medium' | 'hard';
type GameMode = 'pvai' | 'aivai';

interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

interface Position {
  row: number;
  col: number;
}

interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  isPromotion?: boolean;
  isCastling?: 'kingside' | 'queenside';
  isEnPassant?: boolean;
}

interface GameState {
  board: (Piece | null)[][];
  currentPlayer: PieceColor;
  selectedPiece: Position | null;
  validMoves: Position[];
  winner: PieceColor | 'draw' | null;
  isGameOver: boolean;
  isCheck: boolean;
  scores: { white: number; black: number; draws: number };
  moveHistory: Move[];
  lastMove: Move | null;
}

const PIECE_SYMBOLS: Record<PieceType, Record<PieceColor, string>> = {
  king: { white: '♔', black: '♚' },
  queen: { white: '♕', black: '♛' },
  rook: { white: '♖', black: '♜' },
  bishop: { white: '♗', black: '♝' },
  knight: { white: '♘', black: '♞' },
  pawn: { white: '♙', black: '♟' },
};

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 100,
};

const createInitialBoard = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Black pieces (top)
  const backRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRow[col], color: 'black' };
    board[1][col] = { type: 'pawn', color: 'black' };
  }
  
  // White pieces (bottom)
  for (let col = 0; col < 8; col++) {
    board[7][col] = { type: backRow[col], color: 'white' };
    board[6][col] = { type: 'pawn', color: 'white' };
  }
  
  return board;
};

const isInBounds = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

const findKing = (board: (Piece | null)[][], color: PieceColor): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

const isSquareAttacked = (
  board: (Piece | null)[][],
  row: number,
  col: number,
  byColor: PieceColor
): boolean => {
  // Check all pieces of the attacking color
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === byColor) {
        const moves = getRawMoves(board, r, c, piece, null, true);
        if (moves.some(m => m.row === row && m.col === col)) {
          return true;
        }
      }
    }
  }
  return false;
};

const getRawMoves = (
  board: (Piece | null)[][],
  row: number,
  col: number,
  piece: Piece,
  lastMove: Move | null,
  skipCastling = false
): Position[] => {
  const moves: Position[] = [];
  const { type, color } = piece;
  const direction = color === 'white' ? -1 : 1;

  const addMove = (r: number, c: number) => {
    if (isInBounds(r, c)) {
      const target = board[r][c];
      if (!target || target.color !== color) {
        moves.push({ row: r, col: c });
      }
    }
  };

  const addSliding = (directions: [number, number][]) => {
    for (const [dr, dc] of directions) {
      for (let i = 1; i < 8; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        if (!isInBounds(r, c)) break;
        const target = board[r][c];
        if (!target) {
          moves.push({ row: r, col: c });
        } else {
          if (target.color !== color) moves.push({ row: r, col: c });
          break;
        }
      }
    }
  };

  switch (type) {
    case 'pawn':
      // Forward move
      if (!board[row + direction]?.[col]) {
        moves.push({ row: row + direction, col });
        // Double move from start
        if (!piece.hasMoved && !board[row + 2 * direction]?.[col]) {
          moves.push({ row: row + 2 * direction, col });
        }
      }
      // Captures
      for (const dc of [-1, 1]) {
        const c = col + dc;
        if (isInBounds(row + direction, c)) {
          const target = board[row + direction][c];
          if (target && target.color !== color) {
            moves.push({ row: row + direction, col: c });
          }
          // En passant
          if (lastMove?.piece.type === 'pawn' &&
              Math.abs(lastMove.from.row - lastMove.to.row) === 2 &&
              lastMove.to.row === row &&
              lastMove.to.col === c) {
            moves.push({ row: row + direction, col: c });
          }
        }
      }
      break;

    case 'knight':
      for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
        addMove(row + dr, col + dc);
      }
      break;

    case 'bishop':
      addSliding([[-1,-1],[-1,1],[1,-1],[1,1]]);
      break;

    case 'rook':
      addSliding([[-1,0],[1,0],[0,-1],[0,1]]);
      break;

    case 'queen':
      addSliding([[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]);
      break;

    case 'king':
      for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
        addMove(row + dr, col + dc);
      }
      // Castling
      if (!skipCastling && !piece.hasMoved) {
        const opponent = color === 'white' ? 'black' : 'white';
        const baseRow = color === 'white' ? 7 : 0;
        
        // Kingside
        const kRook = board[baseRow][7];
        if (kRook?.type === 'rook' && !kRook.hasMoved &&
            !board[baseRow][5] && !board[baseRow][6] &&
            !isSquareAttacked(board, baseRow, 4, opponent) &&
            !isSquareAttacked(board, baseRow, 5, opponent) &&
            !isSquareAttacked(board, baseRow, 6, opponent)) {
          moves.push({ row: baseRow, col: 6 });
        }
        
        // Queenside
        const qRook = board[baseRow][0];
        if (qRook?.type === 'rook' && !qRook.hasMoved &&
            !board[baseRow][1] && !board[baseRow][2] && !board[baseRow][3] &&
            !isSquareAttacked(board, baseRow, 2, opponent) &&
            !isSquareAttacked(board, baseRow, 3, opponent) &&
            !isSquareAttacked(board, baseRow, 4, opponent)) {
          moves.push({ row: baseRow, col: 2 });
        }
      }
      break;
  }

  return moves;
};

const getValidMoves = (
  board: (Piece | null)[][],
  row: number,
  col: number,
  lastMove: Move | null
): Position[] => {
  const piece = board[row][col];
  if (!piece) return [];

  const rawMoves = getRawMoves(board, row, col, piece, lastMove);
  const validMoves: Position[] = [];
  const opponent = piece.color === 'white' ? 'black' : 'white';

  for (const move of rawMoves) {
    // Simulate move
    const newBoard = board.map(r => [...r]);
    newBoard[move.row][move.col] = { ...piece, hasMoved: true };
    newBoard[row][col] = null;

    // Handle castling rook
    if (piece.type === 'king' && Math.abs(move.col - col) === 2) {
      if (move.col === 6) {
        newBoard[row][5] = newBoard[row][7];
        newBoard[row][7] = null;
      } else {
        newBoard[row][3] = newBoard[row][0];
        newBoard[row][0] = null;
      }
    }

    // Check if king is in check after move
    const kingPos = findKing(newBoard, piece.color);
    if (kingPos && !isSquareAttacked(newBoard, kingPos.row, kingPos.col, opponent)) {
      validMoves.push(move);
    }
  }

  return validMoves;
};

const getAllMoves = (
  board: (Piece | null)[][],
  color: PieceColor,
  lastMove: Move | null
): Move[] => {
  const moves: Move[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const validMoves = getValidMoves(board, row, col, lastMove);
        for (const to of validMoves) {
          moves.push({
            from: { row, col },
            to,
            piece,
            captured: board[to.row][to.col] || undefined,
          });
        }
      }
    }
  }
  
  return moves;
};

const evaluateBoard = (board: (Piece | null)[][], forColor: PieceColor): number => {
  let score = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = PIECE_VALUES[piece.type];
        const positionBonus = piece.type === 'pawn' 
          ? (piece.color === 'white' ? (6 - row) * 0.1 : row * 0.1)
          : 0;
        
        if (piece.color === forColor) {
          score += value + positionBonus;
        } else {
          score -= value + positionBonus;
        }
      }
    }
  }
  
  return score;
};

const getAIMove = (
  board: (Piece | null)[][],
  color: PieceColor,
  difficulty: Difficulty,
  lastMove: Move | null
): Move | null => {
  const moves = getAllMoves(board, color, lastMove);
  if (moves.length === 0) return null;

  if (difficulty === 'easy') {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const evaluatedMoves = moves.map(move => {
    const newBoard = board.map(r => [...r]);
    newBoard[move.to.row][move.to.col] = { ...move.piece, hasMoved: true };
    newBoard[move.from.row][move.from.col] = null;
    
    return {
      move,
      score: evaluateBoard(newBoard, color) + (move.captured ? PIECE_VALUES[move.captured.type] * 2 : 0),
    };
  });

  evaluatedMoves.sort((a, b) => b.score - a.score);

  if (difficulty === 'medium') {
    const topMoves = evaluatedMoves.slice(0, Math.min(5, evaluatedMoves.length));
    return topMoves[Math.floor(Math.random() * topMoves.length)].move;
  }

  return evaluatedMoves[0].move;
};

export const AIChess: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('pvai');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerColor, setPlayerColor] = useState<PieceColor>('white');
  const [gameState, setGameState] = useState<GameState>({
    board: createInitialBoard(),
    currentPlayer: 'white',
    selectedPiece: null,
    validMoves: [],
    winner: null,
    isGameOver: false,
    isCheck: false,
    scores: { white: 0, black: 0, draws: 0 },
    moveHistory: [],
    lastMove: null,
  });
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [promotionSquare, setPromotionSquare] = useState<Position | null>(null);
  const aiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const aiColor = gameMode === 'pvai' ? (playerColor === 'white' ? 'black' : 'white') : null;

  // Handle AI moves
  useEffect(() => {
    if (gameState.isGameOver || isAIThinking || promotionSquare) return;

    const currentIsAI = gameMode === 'aivai' || 
      (gameMode === 'pvai' && gameState.currentPlayer === aiColor);

    if (currentIsAI) {
      setIsAIThinking(true);
      
      const delay = gameMode === 'aivai' ? 1000 : 600;
      aiTimeoutRef.current = setTimeout(() => {
        const move = getAIMove(gameState.board, gameState.currentPlayer, difficulty, gameState.lastMove);
        if (move) {
          executeMove(move);
        }
        setIsAIThinking(false);
      }, delay);
    }

    return () => {
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [gameState.currentPlayer, gameState.isGameOver, gameMode, aiColor, difficulty, promotionSquare]);

  const executeMove = useCallback((move: Move, promoteTo?: PieceType) => {
    setGameState(prev => {
      const newBoard = prev.board.map(r => [...r]);
      let piece = { ...move.piece, hasMoved: true };

      // Pawn promotion
      if (piece.type === 'pawn' && (move.to.row === 0 || move.to.row === 7)) {
        if (promoteTo) {
          piece = { ...piece, type: promoteTo };
        } else {
          // Auto-promote to queen for AI
          piece = { ...piece, type: 'queen' };
        }
      }

      // Handle castling
      if (piece.type === 'king' && Math.abs(move.to.col - move.from.col) === 2) {
        if (move.to.col === 6) {
          newBoard[move.from.row][5] = { ...newBoard[move.from.row][7]!, hasMoved: true };
          newBoard[move.from.row][7] = null;
        } else {
          newBoard[move.from.row][3] = { ...newBoard[move.from.row][0]!, hasMoved: true };
          newBoard[move.from.row][0] = null;
        }
      }

      // Handle en passant
      if (piece.type === 'pawn' && 
          move.from.col !== move.to.col && 
          !prev.board[move.to.row][move.to.col]) {
        newBoard[move.from.row][move.to.col] = null;
      }

      newBoard[move.to.row][move.to.col] = piece;
      newBoard[move.from.row][move.from.col] = null;

      const nextPlayer = prev.currentPlayer === 'white' ? 'black' : 'white';
      const kingPos = findKing(newBoard, nextPlayer);
      const isCheck = kingPos ? isSquareAttacked(newBoard, kingPos.row, kingPos.col, prev.currentPlayer) : false;
      const nextMoves = getAllMoves(newBoard, nextPlayer, move);
      
      let winner: PieceColor | 'draw' | null = null;
      let isGameOver = false;

      if (nextMoves.length === 0) {
        isGameOver = true;
        winner = isCheck ? prev.currentPlayer : 'draw';
      }

      return {
        ...prev,
        board: newBoard,
        currentPlayer: nextPlayer,
        selectedPiece: null,
        validMoves: [],
        winner,
        isGameOver,
        isCheck,
        scores: isGameOver ? {
          white: winner === 'white' ? prev.scores.white + 1 : prev.scores.white,
          black: winner === 'black' ? prev.scores.black + 1 : prev.scores.black,
          draws: winner === 'draw' ? prev.scores.draws + 1 : prev.scores.draws,
        } : prev.scores,
        moveHistory: [...prev.moveHistory, move],
        lastMove: move,
      };
    });
    setPromotionSquare(null);
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (gameMode === 'aivai') return;
    if (gameMode === 'pvai' && gameState.currentPlayer !== playerColor) return;
    if (isAIThinking || gameState.isGameOver || promotionSquare) return;

    const clickedPiece = gameState.board[row][col];

    // Select own piece
    if (clickedPiece && clickedPiece.color === gameState.currentPlayer) {
      const validMoves = getValidMoves(gameState.board, row, col, gameState.lastMove);
      setGameState(prev => ({
        ...prev,
        selectedPiece: { row, col },
        validMoves,
      }));
      return;
    }

    // Move to valid square
    if (gameState.selectedPiece) {
      const isValidMove = gameState.validMoves.some(m => m.row === row && m.col === col);
      if (isValidMove) {
        const piece = gameState.board[gameState.selectedPiece.row][gameState.selectedPiece.col]!;
        
        // Check for pawn promotion
        if (piece.type === 'pawn' && (row === 0 || row === 7)) {
          setPromotionSquare({ row, col });
          return;
        }

        const move: Move = {
          from: gameState.selectedPiece,
          to: { row, col },
          piece,
          captured: gameState.board[row][col] || undefined,
        };
        executeMove(move);
      }
    }
  };

  const handlePromotion = (type: PieceType) => {
    if (!promotionSquare || !gameState.selectedPiece) return;
    
    const piece = gameState.board[gameState.selectedPiece.row][gameState.selectedPiece.col]!;
    const move: Move = {
      from: gameState.selectedPiece,
      to: promotionSquare,
      piece,
      captured: gameState.board[promotionSquare.row][promotionSquare.col] || undefined,
      isPromotion: true,
    };
    executeMove(move, type);
  };

  const resetGame = () => {
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    setIsAIThinking(false);
    setPromotionSquare(null);
    setGameState(prev => ({
      ...prev,
      board: createInitialBoard(),
      currentPlayer: 'white',
      selectedPiece: null,
      validMoves: [],
      winner: null,
      isGameOver: false,
      isCheck: false,
      moveHistory: [],
      lastMove: null,
    }));
  };

  const resetAll = () => {
    resetGame();
    setGameState(prev => ({
      ...prev,
      scores: { white: 0, black: 0, draws: 0 },
    }));
    setShowSettings(true);
  };

  const startGame = () => {
    resetGame();
    setShowSettings(false);
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-emerald-900/10 to-slate-900 p-4 overflow-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Crown className="w-7 h-7 text-emerald-400" />
          AI Chess
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
                  ${gameMode === 'pvai' ? 'bg-emerald-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
              >
                <Users className="w-5 h-5" />
                Player vs AI
              </button>
              <button
                onClick={() => setGameMode('aivai')}
                className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-all
                  ${gameMode === 'aivai' ? 'bg-emerald-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
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
                  onClick={() => setPlayerColor('white')}
                  className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-all
                    ${playerColor === 'white' ? 'bg-slate-200 text-slate-900' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
                >
                  <span className="text-2xl">♔</span>
                  White
                </button>
                <button
                  onClick={() => setPlayerColor('black')}
                  className={`p-3 rounded-lg flex items-center justify-center gap-2 transition-all
                    ${playerColor === 'black' ? 'bg-slate-800 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
                >
                  <span className="text-2xl">♚</span>
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
                    ${difficulty === d ? 'bg-emerald-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all"
          >
            <Zap className="w-5 h-5" />
            Start Game
          </button>
        </div>
      )}

      {/* Game Board */}
      {!showSettings && (
        <>
          {/* Status */}
          <div className="flex justify-between items-center mb-4 max-w-lg mx-auto w-full px-4">
            <div className="text-sm">
              <span className="text-slate-400">White: </span>
              <span className="text-white font-bold">{gameState.scores.white}</span>
            </div>
            <div className="text-center">
              {gameState.isGameOver ? (
                <div className="flex items-center gap-2 text-lg font-bold">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">
                    {gameState.winner === 'draw' ? 'Stalemate!' : `${gameState.winner} Wins!`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  {isAIThinking && <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />}
                  {gameState.isCheck && <span className="text-red-400 font-bold">Check! </span>}
                  <span className="text-white">
                    {isAIThinking ? 'AI thinking...' : `${gameState.currentPlayer}'s turn`}
                  </span>
                </div>
              )}
            </div>
            <div className="text-sm">
              <span className="text-slate-400">Black: </span>
              <span className="text-white font-bold">{gameState.scores.black}</span>
            </div>
          </div>

          {/* Board */}
          <div className="flex justify-center mb-4">
            <div className="p-2 bg-slate-800 rounded-lg shadow-2xl">
              <div className="grid grid-cols-8 gap-0">
                {gameState.board.map((row, rowIdx) =>
                  row.map((piece, colIdx) => {
                    const isDark = (rowIdx + colIdx) % 2 === 1;
                    const isSelected = gameState.selectedPiece?.row === rowIdx && 
                                       gameState.selectedPiece?.col === colIdx;
                    const isValidMove = gameState.validMoves.some(m => m.row === rowIdx && m.col === colIdx);
                    const isLastMove = gameState.lastMove && 
                      ((gameState.lastMove.from.row === rowIdx && gameState.lastMove.from.col === colIdx) ||
                       (gameState.lastMove.to.row === rowIdx && gameState.lastMove.to.col === colIdx));

                    return (
                      <button
                        key={`${rowIdx}-${colIdx}`}
                        onClick={() => handleCellClick(rowIdx, colIdx)}
                        className={`
                          w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-3xl sm:text-4xl transition-all relative
                          ${isDark ? 'bg-emerald-800' : 'bg-emerald-200'}
                          ${isSelected ? 'ring-2 ring-yellow-400 ring-inset' : ''}
                          ${isLastMove ? 'bg-yellow-500/30' : ''}
                        `}
                      >
                        {piece && (
                          <span className={piece.color === 'white' ? 'text-white drop-shadow-lg' : 'text-slate-900'}>
                            {PIECE_SYMBOLS[piece.type][piece.color]}
                          </span>
                        )}
                        {isValidMove && (
                          <div className={`absolute inset-0 flex items-center justify-center ${piece ? '' : ''}`}>
                            {piece ? (
                              <div className="absolute inset-0 ring-2 ring-red-400 ring-inset opacity-70" />
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Promotion Dialog */}
          {promotionSquare && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-slate-800 rounded-xl p-4 shadow-2xl">
                <p className="text-white mb-3 text-center">Choose promotion:</p>
                <div className="flex gap-2">
                  {(['queen', 'rook', 'bishop', 'knight'] as PieceType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => handlePromotion(type)}
                      className="w-14 h-14 bg-slate-700 hover:bg-slate-600 rounded-lg text-4xl flex items-center justify-center"
                    >
                      {PIECE_SYMBOLS[type][gameState.currentPlayer]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

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
              className="px-6 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-lg font-medium flex items-center gap-2 transition-all"
            >
              Settings
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChess;

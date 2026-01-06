'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import toast from 'react-hot-toast';
import { aiService } from '@/services/aiService';
import { DailyChallengeWidget, WalletDisplay } from '@/components/challenges/DailyChallengeWidget';
import {
  Gamepad2,
  Brain,
  Trophy,
  Target,
  Zap,
  Clock,
  Star,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  CheckCircle,
  XCircle,
  Lightbulb,
  MessageSquare,
  Swords,
  Shield,
  Heart,
  Flame,
  Snowflake,
  Wind,
  Droplets,
  Sparkles,
  Crown,
  Dices,
  Grid3X3,
  Users,
  Bot,
} from 'lucide-react';

// ============================================================================
// GAMES SUITE - AI-POWERED MINI-GAMES
// ============================================================================
// Includes:
// - Trivia Challenge (AI generates questions on any topic)
// - Word Wizard (vocabulary & spelling games)
// - Logic Puzzles (pattern recognition, sudoku, etc.)
// - AI Dueling Arena (turn-based strategy vs AI)
// - Memory Match (pattern memory games)
// - Speed Math (mental math challenges)
// - Story Quest (choose-your-own-adventure with AI)
// ============================================================================

// ================== TYPES ==================
interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface GameScore {
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
  points: number;
}

interface DuelCharacter {
  name: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  abilities: Ability[];
}

interface Ability {
  name: string;
  damage: number;
  manaCost: number;
  type: 'fire' | 'ice' | 'lightning' | 'heal' | 'shield';
  icon: React.ReactNode;
}

interface StoryNode {
  id: string;
  text: string;
  choices: { text: string; nextId: string }[];
  isEnding?: boolean;
}

// ================== TRIVIA CHALLENGE ==================
function TriviaChallenge() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [currentQuestion, setCurrentQuestion] = useState<TriviaQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState<GameScore>({
    correct: 0,
    total: 0,
    streak: 0,
    bestStreak: 0,
    points: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [gameActive, setGameActive] = useState(false);

  const generateQuestion = async () => {
    setIsLoading(true);
    setSelectedAnswer(null);
    setShowResult(false);

    try {
      const topicText = topic.trim() || 'general knowledge';
      const result = await aiService.generate(
        `Generate a ${difficulty} trivia question about: ${topicText}`,
        {
          systemPrompt: `You are a trivia game master. Generate a single trivia question in this exact JSON format:
{
  "question": "the question text",
  "options": ["option A", "option B", "option C", "option D"],
  "correctIndex": 0-3,
  "explanation": "brief explanation of the correct answer",
  "category": "topic category"
}

Make the question ${difficulty} difficulty. Ensure exactly 4 options with only one correct answer.
Output ONLY valid JSON, no markdown.`,
          temperature: 0.8,
          maxTokens: 500,
        }
      );

      if (result.success) {
        try {
          const parsed = JSON.parse(result.content.replace(/```json?|```/g, '').trim());
          setCurrentQuestion({
            id: Date.now().toString(),
            question: parsed.question,
            options: parsed.options,
            correctIndex: parsed.correctIndex,
            explanation: parsed.explanation,
            difficulty,
            category: parsed.category || topicText,
          });
        } catch {
          // Fallback question
          setCurrentQuestion({
            id: 'fallback',
            question: 'What is the capital of France?',
            options: ['London', 'Berlin', 'Paris', 'Madrid'],
            correctIndex: 2,
            explanation: 'Paris is the capital and largest city of France.',
            difficulty: 'easy',
            category: 'Geography',
          });
        }
      } else {
        // Fallback if AI unavailable
        setCurrentQuestion({
          id: 'demo',
          question: 'Which data structure uses LIFO (Last In, First Out)?',
          options: ['Queue', 'Stack', 'Array', 'Linked List'],
          correctIndex: 1,
          explanation: 'A Stack follows LIFO principle - the last element added is the first one removed.',
          difficulty: 'medium',
          category: 'Programming',
        });
        toast('Using demo question - AI unavailable', { icon: '⚠️' });
      }
    } catch (error) {
      toast.error('Error generating question');
    }

    setIsLoading(false);
  };

  const submitAnswer = (answerIndex: number) => {
    if (showResult || !currentQuestion) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const isCorrect = answerIndex === currentQuestion.correctIndex;
    const pointsEarned = isCorrect
      ? difficulty === 'easy'
        ? 10
        : difficulty === 'medium'
        ? 25
        : 50
      : 0;

    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak,
      points: prev.points + pointsEarned,
    }));

    if (isCorrect) {
      toast.success(`+${pointsEarned} points!`);
    }
  };

  const startGame = () => {
    setGameActive(true);
    setScore({ correct: 0, total: 0, streak: 0, bestStreak: 0, points: 0 });
    generateQuestion();
  };

  return (
    <div className="space-y-6">
      {!gameActive ? (
        <Card className="bg-slate-900 border-slate-800 max-w-md mx-auto">
          <CardHeader className="text-center">
            <Brain size={48} className="mx-auto mb-4 text-aura-400" />
            <CardTitle className="text-white text-2xl">Trivia Challenge</CardTitle>
            <CardDescription>Test your knowledge with AI-generated questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Topic (optional)</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Programming, Science, History..."
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Difficulty</label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <Button
                    key={d}
                    variant={difficulty === d ? 'default' : 'outline'}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 capitalize ${difficulty === d ? 'bg-aura-600' : ''}`}
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={startGame} className="w-full bg-gradient-to-r from-aura-500 to-purple-500">
              <Play size={18} className="mr-2" />
              Start Challenge
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Score Panel */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="py-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" />
                Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center p-4 bg-slate-800 rounded-lg">
                <p className="text-3xl font-bold text-aura-400">{score.points}</p>
                <p className="text-xs text-slate-400">Points</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div className="p-2 bg-slate-800 rounded">
                  <p className="text-white font-semibold">{score.correct}/{score.total}</p>
                  <p className="text-xs text-slate-400">Correct</p>
                </div>
                <div className="p-2 bg-slate-800 rounded">
                  <p className="text-white font-semibold">{score.streak} 🔥</p>
                  <p className="text-xs text-slate-400">Streak</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setGameActive(false)}
              >
                End Game
              </Button>
            </CardContent>
          </Card>

          {/* Question */}
          <Card className="lg:col-span-3 bg-slate-900 border-slate-800">
            <CardContent className="py-8">
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw size={48} className="mx-auto mb-4 text-aura-400 animate-spin" />
                  <p className="text-slate-400">Generating question...</p>
                </div>
              ) : currentQuestion ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className={`px-2 py-1 rounded ${
                      currentQuestion.difficulty === 'easy' ? 'bg-green-900/50 text-green-400' :
                      currentQuestion.difficulty === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {currentQuestion.difficulty}
                    </span>
                    <span>{currentQuestion.category}</span>
                  </div>

                  <h2 className="text-xl font-semibold text-white">
                    {currentQuestion.question}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => submitAnswer(idx)}
                        disabled={showResult}
                        className={`p-4 text-left rounded-lg border transition ${
                          showResult
                            ? idx === currentQuestion.correctIndex
                              ? 'bg-green-900/50 border-green-500 text-green-100'
                              : idx === selectedAnswer
                              ? 'bg-red-900/50 border-red-500 text-red-100'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                            : 'bg-slate-800 border-slate-700 text-white hover:border-aura-500'
                        }`}
                      >
                        <span className="mr-2 text-slate-500">{String.fromCharCode(65 + idx)}.</span>
                        {option}
                      </button>
                    ))}
                  </div>

                  {showResult && (
                    <div className={`p-4 rounded-lg ${
                      selectedAnswer === currentQuestion.correctIndex
                        ? 'bg-green-900/30 border border-green-700'
                        : 'bg-red-900/30 border border-red-700'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {selectedAnswer === currentQuestion.correctIndex ? (
                          <CheckCircle size={20} className="text-green-400" />
                        ) : (
                          <XCircle size={20} className="text-red-400" />
                        )}
                        <span className="font-semibold text-white">
                          {selectedAnswer === currentQuestion.correctIndex ? 'Correct!' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{currentQuestion.explanation}</p>
                    </div>
                  )}

                  {showResult && (
                    <Button onClick={generateQuestion} className="w-full bg-aura-600 hover:bg-aura-700">
                      Next Question
                      <ChevronRight size={18} className="ml-2" />
                    </Button>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ================== SPEED MATH ==================
function SpeedMath() {
  const [problem, setProblem] = useState<{ question: string; answer: number } | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      toast.success(`Time's up! Score: ${score}`);
    }
  }, [isPlaying, timeLeft, score]);

  const generateProblem = useCallback(() => {
    const operators = difficulty === 'easy' ? ['+', '-'] : difficulty === 'medium' ? ['+', '-', '*'] : ['+', '-', '*', '/'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let a: number, b: number, answer: number;
    const maxNum = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : 100;

    switch (operator) {
      case '+':
        a = Math.floor(Math.random() * maxNum) + 1;
        b = Math.floor(Math.random() * maxNum) + 1;
        answer = a + b;
        break;
      case '-':
        a = Math.floor(Math.random() * maxNum) + 1;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
        break;
      case '*':
        a = Math.floor(Math.random() * 12) + 1;
        b = Math.floor(Math.random() * 12) + 1;
        answer = a * b;
        break;
      case '/':
        b = Math.floor(Math.random() * 12) + 1;
        answer = Math.floor(Math.random() * 12) + 1;
        a = b * answer;
        break;
      default:
        a = 1; b = 1; answer = 2;
    }

    setProblem({ question: `${a} ${operator} ${b} = ?`, answer });
    setUserAnswer('');
  }, [difficulty]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setIsPlaying(true);
    generateProblem();
  };

  const checkAnswer = () => {
    if (!problem) return;
    
    if (parseInt(userAnswer) === problem.answer) {
      setScore(score + (difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3));
      toast.success('+1', { duration: 500 });
      generateProblem();
    } else {
      toast.error('Try again!', { duration: 500 });
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="text-center">
          <Zap size={48} className="mx-auto mb-4 text-yellow-400" />
          <CardTitle className="text-white text-2xl">Speed Math</CardTitle>
          <CardDescription>Solve as many problems as you can in 60 seconds!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isPlaying ? (
            <>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Difficulty</label>
                <div className="flex gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((d) => (
                    <Button
                      key={d}
                      variant={difficulty === d ? 'default' : 'outline'}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 capitalize ${difficulty === d ? 'bg-aura-600' : ''}`}
                    >
                      {d}
                    </Button>
                  ))}
                </div>
              </div>

              {score > 0 && (
                <div className="text-center p-4 bg-slate-800 rounded-lg">
                  <p className="text-2xl font-bold text-aura-400">Last Score: {score}</p>
                </div>
              )}

              <Button onClick={startGame} className="w-full bg-gradient-to-r from-yellow-500 to-orange-500">
                <Play size={18} className="mr-2" />
                Start Game
              </Button>
            </>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-aura-400">{score}</p>
                  <p className="text-xs text-slate-400">Score</p>
                </div>
                <div className={`text-center p-4 rounded-lg ${timeLeft <= 10 ? 'bg-red-900/50' : 'bg-slate-800'}`}>
                  <p className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                    {timeLeft}
                  </p>
                  <p className="text-xs text-slate-400">Seconds</p>
                </div>
              </div>

              {problem && (
                <div className="text-center space-y-4">
                  <p className="text-4xl font-bold text-white">{problem.question}</p>
                  <Input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                    placeholder="Your answer"
                    className="text-center text-2xl bg-slate-800 border-slate-700 text-white"
                    autoFocus
                  />
                  <Button onClick={checkAnswer} className="w-full bg-green-600 hover:bg-green-700">
                    Submit
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ================== AI DUELING ARENA ==================
function AIDuelingArena() {
  const [playerHealth, setPlayerHealth] = useState(100);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [playerMana, setPlayerMana] = useState(50);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);

  const abilities: Ability[] = [
    { name: 'Fireball', damage: 25, manaCost: 15, type: 'fire', icon: <Flame size={16} /> },
    { name: 'Ice Shard', damage: 20, manaCost: 10, type: 'ice', icon: <Snowflake size={16} /> },
    { name: 'Lightning', damage: 30, manaCost: 20, type: 'lightning', icon: <Zap size={16} /> },
    { name: 'Heal', damage: -20, manaCost: 15, type: 'heal', icon: <Heart size={16} /> },
  ];

  const useAbility = (ability: Ability) => {
    if (!isPlayerTurn || gameOver) return;
    if (playerMana < ability.manaCost) {
      toast.error('Not enough mana!');
      return;
    }

    setPlayerMana((prev) => prev - ability.manaCost);

    if (ability.type === 'heal') {
      setPlayerHealth((prev) => Math.min(100, prev - ability.damage));
      setBattleLog((prev) => [...prev, `You used ${ability.name} and healed for ${-ability.damage} HP!`]);
    } else {
      setEnemyHealth((prev) => {
        const newHealth = prev - ability.damage;
        if (newHealth <= 0) {
          setGameOver(true);
          setWinner('player');
        }
        return Math.max(0, newHealth);
      });
      setBattleLog((prev) => [...prev, `You used ${ability.name} for ${ability.damage} damage!`]);
    }

    setIsPlayerTurn(false);

    // AI turn
    setTimeout(() => {
      if (enemyHealth <= 0) return;

      const aiAbility = abilities[Math.floor(Math.random() * abilities.length)];
      
      if (aiAbility.type === 'heal') {
        setEnemyHealth((prev) => Math.min(100, prev - aiAbility.damage));
        setBattleLog((prev) => [...prev, `Enemy used ${aiAbility.name} and healed!`]);
      } else {
        setPlayerHealth((prev) => {
          const newHealth = prev - aiAbility.damage;
          if (newHealth <= 0) {
            setGameOver(true);
            setWinner('enemy');
          }
          return Math.max(0, newHealth);
        });
        setBattleLog((prev) => [...prev, `Enemy used ${aiAbility.name} for ${aiAbility.damage} damage!`]);
      }

      setPlayerMana((prev) => Math.min(50, prev + 5));
      setIsPlayerTurn(true);
    }, 1500);
  };

  const resetGame = () => {
    setPlayerHealth(100);
    setEnemyHealth(100);
    setPlayerMana(50);
    setIsPlayerTurn(true);
    setBattleLog([]);
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="text-center">
          <Swords size={48} className="mx-auto mb-4 text-red-400" />
          <CardTitle className="text-white text-2xl">AI Dueling Arena</CardTitle>
          <CardDescription>Battle against the AI in turn-based combat!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Health Bars */}
          <div className="grid grid-cols-2 gap-4">
            {/* Player */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-blue-400" />
                <span className="text-white font-semibold">You</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all"
                  style={{ width: `${playerHealth}%` }}
                />
              </div>
              <p className="text-sm text-slate-400">{playerHealth}/100 HP</p>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
                  style={{ width: `${(playerMana / 50) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">{playerMana}/50 Mana</p>
            </div>

            {/* Enemy */}
            <div className="space-y-2 text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-white font-semibold">AI Opponent</span>
                <Bot size={20} className="text-red-400" />
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all float-right"
                  style={{ width: `${enemyHealth}%` }}
                />
              </div>
              <p className="text-sm text-slate-400">{enemyHealth}/100 HP</p>
            </div>
          </div>

          {/* Battle Log */}
          <div className="h-32 bg-slate-800 rounded-lg p-3 overflow-y-auto text-sm">
            {battleLog.length === 0 ? (
              <p className="text-slate-500 text-center">Battle begins!</p>
            ) : (
              battleLog.map((log, idx) => (
                <p key={idx} className="text-slate-300 mb-1">{log}</p>
              ))
            )}
          </div>

          {/* Actions */}
          {gameOver ? (
            <div className="text-center space-y-4">
              <p className={`text-2xl font-bold ${winner === 'player' ? 'text-green-400' : 'text-red-400'}`}>
                {winner === 'player' ? '🎉 Victory!' : '💀 Defeat!'}
              </p>
              <Button onClick={resetGame} className="bg-aura-600 hover:bg-aura-700">
                <RotateCcw size={16} className="mr-2" />
                Play Again
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className={`text-center font-semibold ${isPlayerTurn ? 'text-green-400' : 'text-yellow-400'}`}>
                {isPlayerTurn ? 'Your Turn' : 'Enemy Turn...'}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {abilities.map((ability) => (
                  <Button
                    key={ability.name}
                    onClick={() => useAbility(ability)}
                    disabled={!isPlayerTurn || playerMana < ability.manaCost}
                    className={`flex-col h-auto py-3 ${
                      ability.type === 'fire' ? 'bg-orange-600 hover:bg-orange-700' :
                      ability.type === 'ice' ? 'bg-cyan-600 hover:bg-cyan-700' :
                      ability.type === 'lightning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                      'bg-pink-600 hover:bg-pink-700'
                    }`}
                  >
                    {ability.icon}
                    <span className="text-xs mt-1">{ability.name}</span>
                    <span className="text-xs opacity-70">{ability.manaCost} MP</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ================== MEMORY MATCH ==================
function MemoryMatch() {
  const [cards, setCards] = useState<{ id: number; emoji: string; flipped: boolean; matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const emojis = ['🎮', '🎨', '🎵', '🎬', '📚', '🔬', '🌟', '🚀'];

  const initializeGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, id) => ({ id, emoji, flipped: false, matched: false }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameStarted(true);
  };

  const flipCard = (id: number) => {
    if (flippedCards.length === 2) return;
    if (cards[id].flipped || cards[id].matched) return;

    const newCards = [...cards];
    newCards[id].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [first, second] = newFlipped;

      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          const matched = [...cards];
          matched[first].matched = true;
          matched[second].matched = true;
          setCards(matched);
          setMatches((prev) => prev + 1);
          setFlippedCards([]);

          if (matches + 1 === emojis.length) {
            toast.success(`You won in ${moves + 1} moves!`);
          }
        }, 500);
      } else {
        setTimeout(() => {
          const reset = [...cards];
          reset[first].flipped = false;
          reset[second].flipped = false;
          setCards(reset);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="text-center">
          <Grid3X3 size={48} className="mx-auto mb-4 text-purple-400" />
          <CardTitle className="text-white text-2xl">Memory Match</CardTitle>
          <CardDescription>Find all matching pairs!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!gameStarted ? (
            <Button onClick={initializeGame} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Play size={18} className="mr-2" />
              Start Game
            </Button>
          ) : (
            <>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Moves: {moves}</span>
                <span>Matches: {matches}/{emojis.length}</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => flipCard(card.id)}
                    className={`aspect-square rounded-lg text-2xl transition-all duration-300 ${
                      card.flipped || card.matched
                        ? 'bg-aura-600 rotate-y-180'
                        : 'bg-slate-700 hover:bg-slate-600'
                    } ${card.matched ? 'opacity-50' : ''}`}
                  >
                    {(card.flipped || card.matched) && card.emoji}
                  </button>
                ))}
              </div>

              <Button onClick={initializeGame} variant="outline" className="w-full">
                <RotateCcw size={16} className="mr-2" />
                Reset
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ================== WORD WIZARD ==================
function WordWizard() {
  const [currentWord, setCurrentWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [score, setScore] = useState(0);
  const [hint, setHint] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const words = [
    { word: 'ALGORITHM', hint: 'A step-by-step procedure for solving a problem' },
    { word: 'VARIABLE', hint: 'A container for storing data values' },
    { word: 'FUNCTION', hint: 'A reusable block of code' },
    { word: 'DATABASE', hint: 'Organized collection of data' },
    { word: 'INTERFACE', hint: 'A point of interaction between components' },
    { word: 'RECURSIVE', hint: 'A function that calls itself' },
  ];

  const scrambleWord = (word: string) => {
    return word.split('').sort(() => Math.random() - 0.5).join('');
  };

  const newWord = () => {
    const wordObj = words[Math.floor(Math.random() * words.length)];
    setCurrentWord(wordObj.word);
    setScrambled(scrambleWord(wordObj.word));
    setHint(wordObj.hint);
    setUserGuess('');
    setShowHint(false);
  };

  const startGame = () => {
    setScore(0);
    setGameStarted(true);
    newWord();
  };

  const checkGuess = () => {
    if (userGuess.toUpperCase() === currentWord) {
      setScore((prev) => prev + (showHint ? 5 : 10));
      toast.success('Correct!');
      newWord();
    } else {
      toast.error('Try again!');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="text-center">
          <MessageSquare size={48} className="mx-auto mb-4 text-green-400" />
          <CardTitle className="text-white text-2xl">Word Wizard</CardTitle>
          <CardDescription>Unscramble the programming terms!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!gameStarted ? (
            <Button onClick={startGame} className="w-full bg-gradient-to-r from-green-500 to-teal-500">
              <Play size={18} className="mr-2" />
              Start Game
            </Button>
          ) : (
            <>
              <div className="text-center p-4 bg-slate-800 rounded-lg">
                <p className="text-sm text-slate-400 mb-2">Score: {score}</p>
                <p className="text-3xl font-bold text-aura-400 tracking-widest">{scrambled}</p>
              </div>

              {showHint && (
                <div className="p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                  <p className="text-sm text-yellow-300 flex items-center gap-2">
                    <Lightbulb size={16} />
                    {hint}
                  </p>
                </div>
              )}

              <Input
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && checkGuess()}
                placeholder="Your answer..."
                className="text-center text-xl bg-slate-800 border-slate-700 text-white uppercase tracking-widest"
              />

              <div className="flex gap-2">
                <Button onClick={checkGuess} className="flex-1 bg-green-600 hover:bg-green-700">
                  Submit
                </Button>
                <Button
                  onClick={() => setShowHint(true)}
                  disabled={showHint}
                  variant="outline"
                >
                  <Lightbulb size={16} />
                </Button>
                <Button onClick={newWord} variant="outline">
                  <RotateCcw size={16} />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ================== MAIN GAMES SUITE COMPONENT ==================
export default function GamesSuitePage() {
  const [activeTab, setActiveTab] = useState('trivia');

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
                <Gamepad2 size={32} className="text-green-500" />
                Games Arena
              </h1>
              <p className="text-slate-400">
                AI-powered mini-games to sharpen your skills while having fun
              </p>
            </div>
            <WalletDisplay userId="demo-user" />
          </div>
        </div>

        {/* Daily Challenge Widget */}
        <div className="mb-8">
          <DailyChallengeWidget section="games" userId="demo-user" compact />
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 flex-wrap">
            <TabsTrigger value="trivia" className="data-[state=active]:bg-aura-600">
              <Brain size={16} className="mr-2" />
              Trivia
            </TabsTrigger>
            <TabsTrigger value="math" className="data-[state=active]:bg-aura-600">
              <Zap size={16} className="mr-2" />
              Speed Math
            </TabsTrigger>
            <TabsTrigger value="duel" className="data-[state=active]:bg-aura-600">
              <Swords size={16} className="mr-2" />
              AI Duel
            </TabsTrigger>
            <TabsTrigger value="memory" className="data-[state=active]:bg-aura-600">
              <Grid3X3 size={16} className="mr-2" />
              Memory
            </TabsTrigger>
            <TabsTrigger value="words" className="data-[state=active]:bg-aura-600">
              <MessageSquare size={16} className="mr-2" />
              Words
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trivia">
            <TriviaChallenge />
          </TabsContent>

          <TabsContent value="math">
            <SpeedMath />
          </TabsContent>

          <TabsContent value="duel">
            <AIDuelingArena />
          </TabsContent>

          <TabsContent value="memory">
            <MemoryMatch />
          </TabsContent>

          <TabsContent value="words">
            <WordWizard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

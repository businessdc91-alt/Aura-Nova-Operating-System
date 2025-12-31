'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Coins,
  Trophy,
  Sparkles,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap,
  Gift,
} from 'lucide-react';
import {
  AI_PERSONAS,
  generateDailyChallenge,
  submitChallenge,
  getDailyChallengeStatus,
  DailyChallengeStatus,
  Challenge,
  AIPersona,
} from '@/services/challengeService';
import { getWallet, getDailyProgress, type SectionId } from '@/services/currencyService';

// ================== WALLET DISPLAY COMPONENT ==================
export function WalletDisplay({ userId }: { userId: string }) {
  const [wallet, setWallet] = useState<{ coins: number; points: number } | null>(null);
  const [progress, setProgress] = useState<{ earned: number; max: number } | null>(null);
  
  useEffect(() => {
    const w = getWallet(userId);
    setWallet({ coins: w.aetherCoins, points: w.auroraPoints });
    
    const p = getDailyProgress(userId);
    setProgress({ earned: p.totalEarned, max: p.maxDaily });
  }, [userId]);
  
  if (!wallet) return null;
  
  return (
    <div className="flex items-center gap-4 bg-black/40 backdrop-blur-sm rounded-lg px-4 py-2 border border-amber-500/30">
      <div className="flex items-center gap-2">
        <Coins className="w-5 h-5 text-amber-400" />
        <span className="font-bold text-amber-300">{wallet.coins}</span>
        <span className="text-xs text-slate-400">Aether</span>
      </div>
      <div className="w-px h-6 bg-slate-600" />
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-purple-400" />
        <span className="font-bold text-purple-300">{wallet.points}</span>
        <span className="text-xs text-slate-400">Aurora</span>
      </div>
      {progress && (
        <>
          <div className="w-px h-6 bg-slate-600" />
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-green-400" />
            <span className="text-xs text-slate-400">
              Daily: {progress.earned}/{progress.max}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// ================== AI PERSONA CARD COMPONENT ==================
interface PersonaCardProps {
  persona: AIPersona;
  speaking?: boolean;
  message?: string;
}

function PersonaCard({ persona, speaking, message }: PersonaCardProps) {
  return (
    <div className={`
      relative p-4 rounded-xl border-2 transition-all duration-300
      ${speaking ? 'border-amber-500 bg-gradient-to-br from-amber-900/30 to-purple-900/30' : 'border-slate-700 bg-black/40'}
    `}>
      <div className="flex items-center gap-4">
        <div className={`
          w-16 h-16 rounded-full flex items-center justify-center text-3xl
          ${speaking ? 'animate-pulse bg-gradient-to-br from-amber-500/40 to-purple-500/40' : 'bg-slate-800'}
          border-2 ${speaking ? 'border-amber-400' : 'border-slate-600'}
        `}>
          {persona.avatar}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-white">{persona.name}</h3>
          <p className="text-sm text-amber-400">{persona.title}</p>
          {message && (
            <p className={`
              mt-2 text-sm italic
              ${speaking ? 'text-amber-200' : 'text-slate-400'}
            `}>
              "{message}"
            </p>
          )}
        </div>
      </div>
      
      {/* Difficulty Badge */}
      <div className={`
        absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold
        ${persona.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' : ''}
        ${persona.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : ''}
        ${persona.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : ''}
      `}>
        {persona.difficulty.toUpperCase()}
      </div>
    </div>
  );
}

// ================== CHALLENGE QUESTION COMPONENT ==================
interface ChallengeQuestionProps {
  challenge: Challenge;
  onAnswer: (answer: number) => void;
  selectedAnswer: number | null;
  showResult: boolean;
  isCorrect: boolean;
  hintsUsed: number;
  onUseHint: () => void;
}

function ChallengeQuestion({
  challenge,
  onAnswer,
  selectedAnswer,
  showResult,
  isCorrect,
  hintsUsed,
  onUseHint,
}: ChallengeQuestionProps) {
  return (
    <div className="space-y-4">
      {/* Question */}
      <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
        <p className="text-slate-300 whitespace-pre-wrap">{challenge.question}</p>
      </div>
      
      {/* Hints */}
      {hintsUsed > 0 && (
        <div className="bg-amber-900/30 rounded-lg p-3 border border-amber-500/30">
          <div className="flex items-center gap-2 text-amber-300 text-sm mb-2">
            <Lightbulb size={16} />
            <span>Hint {hintsUsed}</span>
          </div>
          <p className="text-amber-200/80 text-sm">{challenge.hints[hintsUsed - 1]}</p>
        </div>
      )}
      
      {/* Options */}
      {challenge.options && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {challenge.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isAnswer = index === challenge.correctAnswer;
            
            let buttonStyle = 'border-slate-600 hover:border-purple-500 hover:bg-purple-500/20';
            
            if (showResult) {
              if (isAnswer) {
                buttonStyle = 'border-green-500 bg-green-500/20 text-green-300';
              } else if (isSelected && !isCorrect) {
                buttonStyle = 'border-red-500 bg-red-500/20 text-red-300';
              }
            } else if (isSelected) {
              buttonStyle = 'border-purple-500 bg-purple-500/30 text-purple-200';
            }
            
            return (
              <button
                key={index}
                onClick={() => !showResult && onAnswer(index)}
                disabled={showResult}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all duration-200
                  ${buttonStyle}
                  ${showResult ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-xs font-bold">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                  {showResult && isAnswer && <CheckCircle size={18} className="text-green-400 ml-auto" />}
                  {showResult && isSelected && !isCorrect && <XCircle size={18} className="text-red-400 ml-auto" />}
                </span>
              </button>
            );
          })}
        </div>
      )}
      
      {/* Hint Button */}
      {!showResult && hintsUsed < challenge.hints.length && (
        <Button
          variant="outline"
          size="sm"
          onClick={onUseHint}
          className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
        >
          <Lightbulb size={16} className="mr-2" />
          Use Hint ({challenge.hints.length - hintsUsed} remaining)
        </Button>
      )}
    </div>
  );
}

// ================== MAIN DAILY CHALLENGE WIDGET ==================
interface DailyChallengeWidgetProps {
  section: SectionId;
  userId?: string;
  compact?: boolean;
  onCoinEarned?: (coins: number) => void;
}

export function DailyChallengeWidget({
  section,
  userId = 'demo-user',
  compact = false,
  onCoinEarned,
}: DailyChallengeWidgetProps) {
  const [status, setStatus] = useState<DailyChallengeStatus | null>(null);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [personaMessage, setPersonaMessage] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  useEffect(() => {
    const s = getDailyChallengeStatus(userId, section);
    setStatus(s);
    setPersonaMessage(s.completed ? 'Challenge completed! Return tomorrow.' : s.persona.greeting);
    setIsSpeaking(true);
    
    const timeout = setTimeout(() => setIsSpeaking(false), 2000);
    return () => clearTimeout(timeout);
  }, [section, userId]);
  
  const handleAnswer = (answerIndex: number) => {
    if (!status || showResult) return;
    setSelectedAnswer(answerIndex);
  };
  
  const handleSubmit = () => {
    if (!status || selectedAnswer === null) return;
    
    const result = submitChallenge(userId, status.challenge, selectedAnswer);
    
    setIsCorrect(result.correct);
    setShowResult(true);
    setIsSpeaking(true);
    setPersonaMessage(result.personaResponse);
    
    if (result.correct) {
      setCoinsEarned(result.coinsEarned);
      onCoinEarned?.(result.coinsEarned);
      
      // Update status
      setStatus(prev => prev ? { ...prev, completed: true, coinsAvailable: prev.coinsAvailable - result.coinsEarned } : null);
    }
  };
  
  const handleUseHint = () => {
    if (!status || hintsUsed >= status.challenge.hints.length) return;
    setHintsUsed(prev => prev + 1);
    setIsSpeaking(true);
    setPersonaMessage(status.persona.hintQuote);
  };
  
  const handleReset = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
    setHintsUsed(0);
    setCoinsEarned(0);
    if (status) {
      setPersonaMessage(status.persona.greeting);
    }
  };
  
  if (!status) {
    return (
      <Card className="bg-slate-900/80 border-slate-700">
        <CardContent className="p-4 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-slate-500" />
        </CardContent>
      </Card>
    );
  }
  
  // Compact view - just the header
  if (compact && !isExpanded) {
    return (
      <Card 
        className={`
          bg-gradient-to-br from-slate-900/90 to-slate-800/90 
          border ${status.completed ? 'border-green-500/50' : 'border-amber-500/50'}
          cursor-pointer hover:border-purple-500/70 transition-all duration-200
        `}
        onClick={() => setIsExpanded(true)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{status.persona.avatar}</span>
              <div>
                <h3 className="font-bold text-white">{status.persona.name}'s Challenge</h3>
                <p className="text-xs text-slate-400">
                  {status.completed ? '✅ Completed' : `🪙 Earn up to ${status.coinsAvailable} coins`}
                </p>
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`
      bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm
      border-2 ${status.completed ? 'border-green-500/50' : 'border-amber-500/50'}
    `}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <CardTitle className="text-lg text-white">Daily Challenge</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-full">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-300">{status.coinsAvailable}</span>
            </div>
            {compact && (
              <button onClick={() => setIsExpanded(false)} className="text-slate-400 hover:text-white">
                <ChevronUp size={20} />
              </button>
            )}
          </div>
        </div>
        <CardDescription className="text-slate-400">
          {status.challenge.title} • {status.challenge.type.charAt(0).toUpperCase() + status.challenge.type.slice(1)} Challenge
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* AI Persona */}
        <PersonaCard 
          persona={status.persona} 
          speaking={isSpeaking}
          message={personaMessage}
        />
        
        {/* Challenge Content */}
        {status.completed ? (
          <div className="bg-green-900/30 rounded-lg p-4 border border-green-500/30 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
            <h3 className="font-bold text-green-300 mb-1">Challenge Complete!</h3>
            <p className="text-sm text-slate-400">Come back tomorrow for a new challenge.</p>
          </div>
        ) : (
          <>
            <ChallengeQuestion
              challenge={status.challenge}
              onAnswer={handleAnswer}
              selectedAnswer={selectedAnswer}
              showResult={showResult}
              isCorrect={isCorrect}
              hintsUsed={hintsUsed}
              onUseHint={handleUseHint}
            />
            
            {/* Result Display */}
            {showResult && (
              <div className={`
                rounded-lg p-4 border text-center
                ${isCorrect 
                  ? 'bg-green-900/30 border-green-500/50' 
                  : 'bg-red-900/30 border-red-500/50'}
              `}>
                {isCorrect ? (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <span className="text-xl font-bold text-amber-300">+{coinsEarned} Coin{coinsEarned > 1 ? 's' : ''}!</span>
                    </div>
                    <p className="text-green-300">{status.persona.victoryQuote}</p>
                  </>
                ) : (
                  <>
                    <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-red-300">Incorrect! Try again.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      className="mt-3 border-red-500/50 text-red-300 hover:bg-red-500/20"
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Try Again
                    </Button>
                  </>
                )}
              </div>
            )}
            
            {/* Submit Button */}
            {!showResult && selectedAnswer !== null && (
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500"
                onClick={handleSubmit}
              >
                <Zap size={18} className="mr-2" />
                Submit Answer
              </Button>
            )}
          </>
        )}
        
        {/* Reward Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-700">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            Resets at midnight
          </span>
          <span className="flex items-center gap-1">
            <Star size={12} />
            +{status.challenge.pointReward} Aurora Points on correct
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ================== ALL CHALLENGES OVERVIEW ==================
interface AllChallengesProps {
  userId?: string;
}

export function AllChallengesOverview({ userId = 'demo-user' }: AllChallengesProps) {
  const [statuses, setStatuses] = useState<DailyChallengeStatus[]>([]);
  const [wallet, setWallet] = useState<{ coins: number; points: number } | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionId | null>(null);
  
  useEffect(() => {
    // Get all challenge statuses
    const allStatuses: DailyChallengeStatus[] = [];
    const sections: SectionId[] = ['dev', 'art', 'academics', 'games', 'marketplace', 'community', 'aetherium', 'literature'];
    
    for (const section of sections) {
      allStatuses.push(getDailyChallengeStatus(userId, section));
    }
    
    setStatuses(allStatuses);
    
    const w = getWallet(userId);
    setWallet({ coins: w.aetherCoins, points: w.auroraPoints });
  }, [userId]);
  
  const completedCount = statuses.filter(s => s.completed).length;
  const totalCoinsAvailable = statuses.reduce((sum, s) => sum + s.coinsAvailable, 0);
  
  const refreshWallet = () => {
    const w = getWallet(userId);
    setWallet({ coins: w.aetherCoins, points: w.auroraPoints });
    
    // Refresh statuses
    const allStatuses: DailyChallengeStatus[] = [];
    const sections: SectionId[] = ['dev', 'art', 'academics', 'games', 'marketplace', 'community', 'aetherium', 'literature'];
    for (const section of sections) {
      allStatuses.push(getDailyChallengeStatus(userId, section));
    }
    setStatuses(allStatuses);
  };
  
  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-purple-900/50 to-amber-900/50 rounded-xl p-6 border border-amber-500/30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Daily AI Challenges</h2>
            <p className="text-slate-400">Complete challenges to earn Aether Coins for the Aetherium TCG!</p>
          </div>
          
          {wallet && (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-2 text-amber-300">
                  <Coins className="w-6 h-6" />
                  <span className="text-3xl font-bold">{wallet.coins}</span>
                </div>
                <span className="text-xs text-slate-400">Aether Coins</span>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-purple-300">
                  <Sparkles className="w-6 h-6" />
                  <span className="text-3xl font-bold">{wallet.points}</span>
                </div>
                <span className="text-xs text-slate-400">Aurora Points</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Today's Progress</span>
            <span className="text-amber-300">{completedCount}/{statuses.length} Challenges</span>
          </div>
          <div className="h-3 bg-black/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-amber-500 transition-all duration-500"
              style={{ width: `${(completedCount / statuses.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {totalCoinsAvailable} coins still available today
          </p>
        </div>
      </div>
      
      {/* Selected Challenge */}
      {selectedSection && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Active Challenge</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSection(null)}
              className="text-slate-400"
            >
              Close
            </Button>
          </div>
          <DailyChallengeWidget 
            section={selectedSection} 
            userId={userId}
            onCoinEarned={() => refreshWallet()}
          />
        </div>
      )}
      
      {/* Challenge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statuses.map(status => (
          <Card
            key={status.section}
            onClick={() => !status.completed && setSelectedSection(status.section)}
            className={`
              bg-slate-900/80 backdrop-blur-sm cursor-pointer transition-all duration-200
              border-2 hover:scale-102
              ${status.completed 
                ? 'border-green-500/50 opacity-75 cursor-default' 
                : 'border-slate-700 hover:border-purple-500/70'}
              ${selectedSection === status.section ? 'ring-2 ring-purple-500' : ''}
            `}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-2xl
                  ${status.completed ? 'bg-green-500/20' : 'bg-slate-800'}
                  border-2 ${status.completed ? 'border-green-500/50' : 'border-slate-600'}
                `}>
                  {status.completed ? <CheckCircle className="w-6 h-6 text-green-400" /> : status.persona.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-white">{status.persona.name}</h4>
                  <p className="text-xs text-slate-400">{status.persona.title}</p>
                </div>
              </div>
              
              <div className="text-sm text-slate-300 mb-3">
                {status.challenge.title}
              </div>
              
              <div className="flex items-center justify-between">
                <div className={`
                  flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                  ${status.completed ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}
                `}>
                  <Coins size={12} />
                  {status.completed ? 'Complete' : `+${status.coinsAvailable}`}
                </div>
                
                <span className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${status.persona.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' : ''}
                  ${status.persona.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                  ${status.persona.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' : ''}
                `}>
                  {status.persona.difficulty}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DailyChallengeWidget;

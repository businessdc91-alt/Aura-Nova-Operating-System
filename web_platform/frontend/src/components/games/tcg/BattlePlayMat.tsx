
import React, { useState, useEffect, useRef } from 'react';
import { 
  BattleState, 
  initializeBattle, 
  playCard, 
  drawCard, 
  attack, 
  endPhase, 
  runAITurn,
  BattleCard,
  getTemplate 
} from '../../../services/battleEngine';
import { BattleCardVisual } from './BattleCardVisual';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface BattlePlayMatProps {
  playerDeckIds: string[];
  opponentDeckIds: string[]; // NPC deck
  onComplete: (winner: 'player' | 'opponent') => void;
}

export default function BattlePlayMat({ playerDeckIds, opponentDeckIds, onComplete }: BattlePlayMatProps) {
  const [game, setGame] = useState<BattleState | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null); // InstanceId
  const [targetMode, setTargetMode] = useState<{ sourceId: string, action: 'attack' } | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Game
  useEffect(() => {
    const initialState = initializeBattle(playerDeckIds, opponentDeckIds);
    setGame({ ...initialState });
    toast.success('Duel Started!');
  }, []);

  // AI Turn Loop
  useEffect(() => {
    if (!game) return;
    
    if (game.currentTurn === 'opponent' && !game.winner) {
      const timer = setTimeout(() => {
        runAITurn(game);
        setGame({ ...game }); // Update UI
      }, 1500); // Delay for realism
      return () => clearTimeout(timer);
    }
  }, [game]);

  // Scroll log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [game?.log.length]);

  if (!game) return <div className="text-white">Initializing Neural Link...</div>;

  // --- Actions ---

  const handleCardClick = (card: BattleCard) => {
    if (game.winner) return;

    // ATTACK TARGETING
    if (targetMode) {
      if (card.controllerId === 'opponent' && card.zone === 'field' && targetMode.action === 'attack') {
        const success = attack(game, targetMode.sourceId, card.instanceId);
        if (success) {
          toast.success('Attack successful!');
          setTargetMode(null);
          setSelectedCard(null);
        } else {
            toast.error('Invalid target');
        }
        setGame({ ...game });
        return;
      }
    }

    // SELECT OWN CARD
    if (card.controllerId === 'player') {
      if (card.zone === 'hand') {
        // Play Card
        const success = playCard(game, card.instanceId, 'player');
        if (success) {
          setGame({ ...game });
          setSelectedCard(null);
        }
      } else if (card.zone === 'field') {
        // Declare Attack
        if (game.phase === 'battle' && !card.isTapped && !card.summoningSickness) {
           setTargetMode({ sourceId: card.instanceId, action: 'attack' });
           setSelectedCard(card.instanceId);
           toast.loading('Select a target to attack...', { duration: 2000 });
        } else {
           setSelectedCard(card.instanceId);
           setTargetMode(null);
        }
      }
    }
  };

  const handleDirectAttack = () => {
      if (targetMode && targetMode.action === 'attack') {
          const success = attack(game, targetMode.sourceId, null); // Null = direct
          if (success) {
              setTargetMode(null);
              setSelectedCard(null);
              setGame({ ...game });
              toast.success('Direct hit!');
          }
      }
  };

  const handleEndPhase = () => {
    endPhase(game);
    setGame({ ...game });
  };

  // --- RENDERERS ---

  return (
    <div className="w-full h-full bg-slate-950 flex flex-col relative overflow-hidden select-none">
      
      {/* BACKGROUND FX */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 z-0 pointer-events-none" />

      {/* --- OPPONENT ZONE (Top) --- */}
      <div className="relative z-10 flex-1 flex flex-col items-center pt-4 transition-colors duration-500 border-b border-white/5 bg-red-900/5">
        
        {/* Opponent Hand (Backs only) */}
        <div className="flex -space-x-4 mb-2">
            {game.opponent.hand.map((c, i) => (
                <div key={c.instanceId} className="w-16 h-24 bg-gradient-to-br from-red-900 to-black border border-red-500/30 rounded-lg shadow-xl" />
            ))}
        </div>

        {/* Opponent Stats */}
        <div className="absolute top-4 left-4 flex gap-4 text-red-200">
             <div onClick={handleDirectAttack} className={`p-4 border-2 rounded-full cursor-pointer ${targetMode ? 'animate-pulse ring-4 ring-red-500 bg-red-500/20' : 'border-red-500/30 bg-black/50'} backdrop-blur-md`}>
                <div className="text-3xl font-bold text-center">❤️ {game.opponent.health}</div>
                <div className="text-xs text-center opacity-70">OPPONENT</div>
             </div>
             <div className="p-2 border border-blue-500/30 rounded-lg bg-black/50 backdrop-blur-md h-fit">
                <div className="text-xl font-bold text-blue-400">💎 {game.opponent.aether}/{game.opponent.maxAether}</div>
             </div>
        </div>

        {/* Opponent Field */}
        <div className="flex gap-4 items-center justify-center min-h-[160px] w-full px-12 perspective-1000">
          <AnimatePresence>
            {game.opponent.field.map(card => (
                 <BattleCardVisual 
                    key={card.instanceId} 
                    card={card} 
                    onClick={() => handleCardClick(card)}
                    className={targetMode ? 'cursor-crosshair hover:ring-2 ring-red-500' : ''}
                 />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* --- MID BOARD (Phase & Info) --- */}
      <div className="h-16 bg-black/40 border-y border-white/10 flex items-center justify-between px-8 backdrop-blur-sm z-20">
         <div className="text-xs text-slate-500 font-mono">
            TURN {game.turnCount} • {game.currentTurn.toUpperCase()}
         </div>
         
         {/* Phase Indicator */}
         <div className="flex gap-2">
            {['draw', 'main1', 'battle', 'main2', 'end'].map(p => (
                <div key={p} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${game.phase === p ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 scale-110' : 'bg-slate-800 text-slate-500'}`}>
                    {p.toUpperCase()}
                </div>
            ))}
         </div>

         <div onClick={() => onComplete('opponent')} className="cursor-pointer text-slate-500 hover:text-white transition-colors">
            SURRENDER
         </div>
      </div>

      {/* --- PLAYER ZONE (Bottom) --- */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-4 border-t border-white/5 bg-blue-900/5">
        
        {/* Player Stats */}
        <div className="absolute bottom-32 left-8 flex gap-4 text-blue-100">
             <div className="p-4 border-2 border-blue-500 rounded-full bg-black/50 backdrop-blur-md shadow-lg shadow-blue-500/20">
                <div className="text-3xl font-bold text-center">❤️ {game.player.health}</div>
                <div className="text-xs text-center opacity-70">YOU</div>
             </div>
             <div className="p-2 border border-cyan-500/50 rounded-lg bg-black/50 backdrop-blur-md h-fit">
                <div className="text-xl font-bold text-cyan-400">💎 {game.player.aether}/{game.player.maxAether}</div>
             </div>
        </div>

        {/* Action Button */}
        <div className="absolute bottom-32 right-8">
             <button 
                onClick={handleEndPhase}
                disabled={game.currentTurn !== 'player' || game.winner !== null}
                className="px-8 py-4 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:opacity-50 text-white font-black rounded-xl shadow-xl shadow-amber-900/50 border-b-4 border-amber-800 active:border-b-0 active:translate-y-1 transition-all"
             >
                {game.phase === 'end' ? 'END TURN' : 'NEXT PHASE →'}
             </button>
        </div>

        {/* Player Field */}
        <div className="flex gap-4 items-center justify-center min-h-[160px] w-full px-12 mb-4">
             <AnimatePresence>
            {game.player.field.map(card => (
                 <BattleCardVisual 
                    key={card.instanceId} 
                    card={card} 
                    onClick={() => handleCardClick(card)}
                    className={`${selectedCard === card.instanceId ? 'ring-2 ring-yellow-400 scale-105' : ''}`}
                    isPlayable={game.currentTurn === 'player' && game.phase === 'battle' && !card.summoningSickness && !card.isTapped}
                 />
            ))}
            </AnimatePresence>
        </div>

        {/* Player Hand */}
        <div className="flex -space-x-8 hover:space-x-1 transition-all duration-300 p-4 min-h-[140px] items-end">
            <AnimatePresence>
            {game.player.hand.map((card, i) => (
                <motion.div 
                    key={card.instanceId}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ zIndex: i }}
                >
                    <BattleCardVisual 
                        size="sm"
                        card={card} 
                        onClick={() => handleCardClick(card)}
                        isPlayable={game.currentTurn === 'player' && card.currentCost <= game.player.aether && (game.phase === 'main1' || game.phase === 'main2')}
                        className="hover:z-50 border-slate-600"
                    />
                </motion.div>
            ))}
            </AnimatePresence>
        </div>

      </div>

      {/* --- LOG OVERLAY --- */}
      <div className="absolute top-20 right-4 w-64 max-h-48 overflow-y-auto bg-black/60 rounded-lg border border-white/10 p-2 text-[10px] font-mono text-slate-300 pointer-events-none fade-mask" ref={logContainerRef}>
           {game.log.map((entry, i) => (
               <div key={i} className="mb-0.5 border-l-2 border-slate-600 pl-1">{entry}</div>
           ))}
      </div>

      {/* --- WINNER OVERLAY --- */}
      {game.winner && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50">
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-300 to-yellow-600 mb-8 filter drop-shadow-lg"
              >
                  {game.winner === 'player' ? 'VICTORY' : 'DEFEAT'}
              </motion.div>
              <button 
                onClick={() => onComplete(game.winner as 'player' | 'opponent')}
                className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
              >
                  Return to Hub
              </button>
          </div>
      )}

    </div>
  );
}


import React from 'react';
import { BattleCard, getTemplate } from '../../../services/battleEngine';
import { getRarityColor, getRarityGlow } from '../../../services/aetheriumService';
import { motion } from 'framer-motion';

interface BattleCardVisualProps {
  card: BattleCard;
  onClick?: () => void;
  isPlayable?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BattleCardVisual: React.FC<BattleCardVisualProps> = ({ 
  card, 
  onClick, 
  isPlayable = false,
  className = '',
  size = 'md' 
}) => {
  const template = getTemplate(card);
  const borderColor = getRarityColor(template.rarity);
  const glow = getRarityGlow(template.rarity);
  
  const sizeClasses = {
    sm: 'w-20 h-28 text-[9px]', // Hand/small
    md: 'w-32 h-44 text-xs',    // Field/standard
    lg: 'w-64 h-96 text-sm'     // Preview
  };

  return (
    <motion.div
      layoutId={card.instanceId}
      className={`
        relative rounded-lg border-2 ${borderColor} bg-slate-800 
        flex flex-col overflow-hidden select-none cursor-pointer transition-all duration-200
        ${sizeClasses[size]}
        ${card.isTapped ? 'rotate-90 opacity-80' : ''}
        ${card.summoningSickness && card.zone === 'field' ? 'grayscale-[0.3]' : ''}
        ${isPlayable ? 'hover:-translate-y-4 hover:shadow-xl shadow-blue-500/20 z-10' : ''}
        ${glow}
        ${className}
      `}
      onClick={onClick}
      whileHover={isPlayable ? { scale: 1.05 } : {}}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Header */}
      <div className="bg-slate-900/80 p-1 flex justify-between items-center border-b border-white/10">
        <span className="font-bold truncate">{template.name}</span>
        <span className="bg-blue-600 px-1.5 rounded-full text-[10px] font-bold shadow-lg shadow-blue-500/50">
          {card.currentCost}
        </span>
      </div>

      {/* Art Area */}
      <div className="flex-1 bg-gradient-to-br from-slate-700 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="text-4xl filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-500">
          {template.artPlaceholder}
        </div>
        {template.faction !== 'neutral' && (
             <div className="absolute opacity-10 text-[80px] font-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                 {template.faction[0].toUpperCase()}
             </div>
        )}
      </div>

      {/* Stats/Abilities */}
      <div className="bg-slate-900/90 p-1.5 border-t border-white/10 min-h-[35%] flex flex-col justify-between backdrop-blur-sm">
        <p className="text-[10px] text-slate-300 line-clamp-2 leading-tight italic">
            {template.abilities[0]?.description || template.flavorText}
        </p>

        {template.type === 'construct' && (
          <div className="flex justify-between items-center mt-1 font-mono font-bold">
            <div className="bg-amber-700/80 px-1.5 rounded text-amber-100 shadow-sm border border-amber-600/50">
              ⚔️ {card.currentAttack}
            </div>
            <div className="bg-slate-600/80 px-1.5 rounded text-slate-100 shadow-sm border border-slate-500/50">
              🛡️ {card.currentDefense}
            </div>
          </div>
        )}
      </div>
      
      {/* Tap Overlay when exhausted */}
      {card.summoningSickness && card.zone === 'field' && (
          <div className="absolute inset-0 bg-black/20 pointer-events-none flex items-center justify-center">
              <span className="text-xs bg-black/50 px-1 rounded backdrop-blur">Zzz</span>
          </div>
      )}
    </motion.div>
  );
};

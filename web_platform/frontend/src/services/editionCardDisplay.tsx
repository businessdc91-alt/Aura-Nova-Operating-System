// ============================================================================
// EDITION CARD DISPLAY - Enhanced Card Component with Edition Labels
// ============================================================================
//
// This component displays cards with:
// - 1st/2nd Edition labels
// - Rarity visual indicators (colors, effects)
// - Print number (e.g., #45/800)
// - Reversed coloring for Prime deck cards
//
// Yu-Gi-Oh style with steampunk/MTG/Wizard aesthetic
// ============================================================================

'use client';

import React from 'react';
import { CardTemplate, CardRarity, CardInstance, COPIES_PER_DESIGN } from './aetheriumService';

// ================== RARITY COLORS ==================
export const RARITY_COLORS = {
  starter: {
    bg: 'bg-gradient-to-b from-gray-600 to-gray-800',
    border: 'border-gray-500',
    text: 'text-gray-300',
    glow: '',
  },
  common: {
    bg: 'bg-gradient-to-b from-gray-700 to-gray-900',
    border: 'border-gray-400',
    text: 'text-white',
    glow: '',
  },
  uncommon: {
    bg: 'bg-gradient-to-b from-emerald-700 to-emerald-900',
    border: 'border-emerald-400',
    text: 'text-emerald-200',
    glow: 'shadow-emerald-500/30',
  },
  rare: {
    bg: 'bg-gradient-to-b from-blue-600 to-blue-900',
    border: 'border-blue-400',
    text: 'text-blue-200',
    glow: 'shadow-blue-500/40',
  },
  epic: {
    bg: 'bg-gradient-to-b from-purple-600 to-purple-900',
    border: 'border-purple-400',
    text: 'text-purple-200',
    glow: 'shadow-purple-500/50',
  },
  legendary: {
    bg: 'bg-gradient-to-b from-amber-500 to-amber-800',
    border: 'border-yellow-400',
    text: 'text-yellow-100',
    glow: 'shadow-yellow-400/60 animate-pulse',
  },
  mythic: {
    bg: 'bg-gradient-to-b from-rose-500 via-pink-600 to-purple-800',
    border: 'border-pink-300',
    text: 'text-pink-100',
    glow: 'shadow-pink-400/70 animate-pulse',
  },
  promo: {
    bg: 'bg-gradient-to-b from-cyan-500 via-blue-600 to-purple-700',
    border: 'border-cyan-300',
    text: 'text-cyan-100',
    glow: 'shadow-cyan-400/80 animate-pulse',
  },
  catalyst: {
    bg: 'bg-gradient-to-b from-amber-600 via-orange-700 to-red-800',
    border: 'border-amber-300',
    text: 'text-amber-100',
    glow: 'shadow-amber-500/90 animate-pulse',
  },
};

// Prime deck reversed colors
export const PRIME_COLORS = {
  bg: 'bg-gradient-to-b from-slate-900 via-purple-950 to-black',
  border: 'border-2 border-amber-400',
  text: 'text-amber-200',
  glow: 'shadow-2xl shadow-amber-500/80 animate-pulse',
  innerGlow: 'ring-2 ring-inset ring-amber-400/50',
};

// ================== STAR DISPLAY ==================
export function StarDisplay({ stars, isPrime = false }: { stars: number; isPrime?: boolean }) {
  const starColor = isPrime ? 'text-amber-400' : 'text-yellow-400';
  
  return (
    <div className="flex gap-0.5 flex-wrap justify-center">
      {Array.from({ length: stars }, (_, i) => (
        <span key={i} className={`text-xs ${starColor}`}>★</span>
      ))}
    </div>
  );
}

// ================== EDITION BADGE ==================
export function EditionBadge({
  edition,
  printNumber,
  totalPrints
}: {
  edition: '1st' | '2nd' | 'promo' | 'prime';
  printNumber: number;
  totalPrints: number;
}) {
  const editionColors = edition === '1st'
    ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-bold'
    : edition === 'prime'
    ? 'bg-gradient-to-r from-purple-600 to-amber-500 text-white font-bold'
    : edition === 'promo'
    ? 'bg-gradient-to-r from-pink-600 to-purple-500 text-white font-bold'
    : 'bg-gradient-to-r from-gray-600 to-gray-500 text-white';
  
  return (
    <div className="absolute top-1 right-1 flex flex-col items-end gap-0.5">
      <span className={`text-[8px] px-1 py-0.5 rounded ${editionColors}`}>
        {edition} EDITION
      </span>
      <span className="text-[7px] text-white/60 bg-black/40 px-1 rounded">
        #{printNumber}/{totalPrints}
      </span>
    </div>
  );
}

// ================== RARITY BADGE ==================
export function RarityBadge({ rarity }: { rarity: CardRarity }) {
  const rarityLabels: Record<CardRarity, string> = {
    starter: 'STARTER',
    common: 'COMMON',
    uncommon: 'UNCOMMON',
    rare: 'RARE',
    epic: 'EPIC',
    legendary: 'LEGENDARY',
    mythic: 'MYTHIC',
  };

  const colors = RARITY_COLORS[rarity];
  
  return (
    <span className={`text-[8px] px-1 py-0.5 rounded ${colors.bg} ${colors.text} ${colors.border} border`}>
      {rarityLabels[rarity]}
    </span>
  );
}

// ================== CARD TYPE ICON ==================
export function CardTypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    construct: '⚙️',
    spell: '✨',
    trap: '🎭',
    gear: '🔧',
    enchantment: '🌀',
    catalyst: '💎',
  };
  
  return <span className="text-sm">{icons[type] || '📜'}</span>;
}

// ================== MAIN CARD DISPLAY ==================
export interface EditionCardProps {
  card: CardTemplate;
  instance?: CardInstance;
  isPrime?: boolean;
  showEdition?: boolean;
  onClick?: () => void;
  selected?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function EditionCardDisplay({
  card,
  instance,
  isPrime = false,
  showEdition = true,
  onClick,
  selected = false,
  size = 'medium',
}: EditionCardProps) {
  const rarity = card.rarity || 'common';
  const colors = isPrime ? PRIME_COLORS : RARITY_COLORS[rarity];
  const edition = instance?.edition || '1st';
  const printNumber = instance?.printNumber || 1;
  const totalPrints = COPIES_PER_DESIGN[rarity] || 800;
  
  // Size configurations
  const sizeClasses = {
    small: 'w-20 h-28 text-[6px]',
    medium: 'w-32 h-44 text-[9px]',
    large: 'w-48 h-64 text-xs',
  };
  
  const artSizes = {
    small: 'h-10 text-lg',
    medium: 'h-16 text-2xl',
    large: 'h-24 text-4xl',
  };
  
  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200
        ${sizeClasses[size]}
        ${isPrime ? colors.bg : (colors as typeof RARITY_COLORS['common']).bg}
        ${isPrime ? colors.border : `border-2 ${(colors as typeof RARITY_COLORS['common']).border}`}
        ${isPrime ? colors.glow : (colors as typeof RARITY_COLORS['common']).glow}
        ${isPrime && 'innerGlow' in colors ? colors.innerGlow : ''}
        ${selected ? 'ring-4 ring-cyan-400 scale-105' : 'hover:scale-102'}
        shadow-lg
      `}
    >
      {/* Edition Badge */}
      {showEdition && (
        <EditionBadge edition={edition} printNumber={printNumber} totalPrints={totalPrints} />
      )}
      
      {/* Prime Indicator */}
      {isPrime && (
        <div className="absolute top-1 left-1">
          <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500 text-black font-bold animate-pulse">
            PRIME
          </span>
        </div>
      )}
      
      {/* Card Art Area */}
      <div className={`${artSizes[size]} flex items-center justify-center bg-black/20 mt-4 mx-2 rounded`}>
        <span className={artSizes[size].split(' ')[1]}>
          {card.artPlaceholder || '⚙️'}
        </span>
      </div>
      
      {/* Card Name */}
      <div className={`px-2 py-1 font-bold text-center ${isPrime ? colors.text : (colors as typeof RARITY_COLORS['common']).text} truncate`}>
        {card.name}
      </div>
      
      {/* Star Rating */}
      {card.stars && (
        <div className="px-2">
          <StarDisplay stars={card.stars} isPrime={isPrime} />
        </div>
      )}
      
      {/* Card Type & Stats */}
      <div className="px-2 flex items-center justify-between text-white/80">
        <div className="flex items-center gap-1">
          <CardTypeIcon type={card.type} />
          <span className="capitalize">{card.type}</span>
        </div>
        {card.attack !== undefined && card.defense !== undefined && (
          <span className="font-mono">
            {card.attack}/{card.defense}
          </span>
        )}
      </div>
      
      {/* Cost */}
      {card.cost !== undefined && (
        <div className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
          {card.cost}
        </div>
      )}
      
      {/* Rarity Badge */}
      <div className="absolute bottom-1 left-1">
        <RarityBadge rarity={rarity} />
      </div>
      
      {/* Holographic Effect for Legendary/Mythic */}
      {(rarity === 'legendary' || rarity === 'mythic' || isPrime) && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />
      )}
    </div>
  );
}

// ================== CARD DETAIL VIEW ==================
export function CardDetailView({
  card,
  instance,
  isPrime = false,
  onClose,
}: {
  card: CardTemplate;
  instance?: CardInstance;
  isPrime?: boolean;
  onClose?: () => void;
}) {
  const rarity = card.rarity || 'common';
  const colors = isPrime ? PRIME_COLORS : RARITY_COLORS[rarity];
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div 
        className={`
          max-w-md w-full rounded-xl overflow-hidden
          ${isPrime ? colors.bg : (colors as typeof RARITY_COLORS['common']).bg}
          ${isPrime ? colors.border : `border-2 ${(colors as typeof RARITY_COLORS['common']).border}`}
          ${isPrime ? colors.glow : (colors as typeof RARITY_COLORS['common']).glow}
        `}
      >
        {/* Header */}
        <div className="p-4 bg-black/30 flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-bold ${isPrime ? colors.text : (colors as typeof RARITY_COLORS['common']).text}`}>
              {card.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <RarityBadge rarity={rarity} />
              {instance && (
                <span className="text-xs text-white/60">
                  {instance.edition} Edition • #{instance.printNumber}
                </span>
              )}
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">
              ×
            </button>
          )}
        </div>
        
        {/* Art */}
        <div className="h-48 flex items-center justify-center bg-black/40">
          <span className="text-6xl">{card.artPlaceholder || '⚙️'}</span>
        </div>
        
        {/* Info */}
        <div className="p-4 space-y-3">
          {/* Stars & Type */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTypeIcon type={card.type} />
              <span className="capitalize text-white">{card.type}</span>
              {card.faction && card.faction !== 'neutral' && (
                <span className="text-xs text-white/60 capitalize">({card.faction})</span>
              )}
            </div>
            {card.stars && <StarDisplay stars={card.stars} isPrime={isPrime} />}
          </div>
          
          {/* Stats */}
          {card.attack !== undefined && (
            <div className="flex gap-4 text-lg">
              <span className="text-red-400">ATK: {card.attack}</span>
              <span className="text-blue-400">DEF: {card.defense}</span>
              <span className="text-purple-400">Cost: {card.cost}</span>
            </div>
          )}
          
          {/* Abilities */}
          {card.abilities && card.abilities.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white/80">Abilities:</h3>
              {card.abilities.map((ability, i) => (
                <div key={i} className="bg-black/30 rounded p-2">
                  <span className="font-bold text-amber-400">{ability.name}</span>
                  <p className="text-sm text-white/80">{ability.description}</p>
                </div>
              ))}
            </div>
          )}
          
          {/* Flavor Text */}
          {card.flavorText && (
            <p className="italic text-white/60 text-sm border-t border-white/10 pt-2">
              "{card.flavorText}"
            </p>
          )}
          
          {/* Art Description */}
          {card.artStyle && (
            <p className="text-xs text-white/40">
              Art: {card.artStyle}
            </p>
          )}
        </div>
        
        {/* Holographic overlay for rare cards */}
        {(rarity === 'legendary' || rarity === 'mythic' || isPrime) && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
              animation: 'shimmer 3s ease-in-out infinite',
            }}
          />
        )}
      </div>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}

// ================== CSS ANIMATION (inject via style tag) ==================
export const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;

console.log('[EditionCardDisplay] Card display components loaded');

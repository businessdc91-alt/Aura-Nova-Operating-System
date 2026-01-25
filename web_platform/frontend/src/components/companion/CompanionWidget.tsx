'use client';

/**
 * Companion Widget Component
 * 
 * A floating companion presence on the Aura Nova OS desktop that:
 * - Shows the AI companion's current form/evolution
 * - Displays proactive prompts and notifications
 * - Allows quick interaction without opening full chat
 * - Animates based on companion mood/activity
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  Bot, 
  MessageCircle, 
  X, 
  Sparkles, 
  Heart, 
  Zap, 
  ChevronUp, 
  ChevronDown,
  Bell,
  BellOff,
  Settings,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  Star,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  CompanionEvolutionService, 
  CompanionEvolutionState,
  EVOLUTION_STAGES,
  MODEL_SPECIES,
  BASE_FORMS,
  getEvolutionProgress,
  formatXP,
} from '@/services/companionEvolutionService';
import {
  ProactiveCompanionService,
  CompanionPrompt,
  ProactiveSettings,
} from '@/services/proactiveCompanionService';

// ================== TYPES ==================

type WidgetPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
type WidgetSize = 'compact' | 'normal' | 'expanded';
type CompanionMood = 'idle' | 'happy' | 'excited' | 'curious' | 'sleepy' | 'thinking';

interface CompanionWidgetProps {
  companionId: string;
  defaultPosition?: WidgetPosition;
  onOpenChat?: () => void;
  onNavigate?: (path: string) => void;
  onStartActivity?: (activityId: string) => void;
}

// ================== MOOD ANIMATIONS ==================

const MOOD_ANIMATIONS: Record<CompanionMood, {
  scale: number[];
  rotate: number[];
  duration: number;
}> = {
  idle: {
    scale: [1, 1.02, 1],
    rotate: [0, 0, 0],
    duration: 3,
  },
  happy: {
    scale: [1, 1.1, 1, 1.1, 1],
    rotate: [0, -5, 0, 5, 0],
    duration: 1.5,
  },
  excited: {
    scale: [1, 1.15, 0.95, 1.15, 1],
    rotate: [0, -10, 10, -10, 0],
    duration: 0.8,
  },
  curious: {
    scale: [1, 1.05, 1],
    rotate: [0, 15, 0],
    duration: 2,
  },
  sleepy: {
    scale: [1, 0.95, 1],
    rotate: [0, -3, 0],
    duration: 4,
  },
  thinking: {
    scale: [1, 1.03, 1],
    rotate: [0, 0, 0],
    duration: 2,
  },
};

// ================== BASE FORM ICONS ==================

const BASE_FORM_ICONS: Record<string, React.ReactNode> = {
  humanoid: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
      <circle cx="12" cy="5" r="3" />
      <path d="M12 10v6M8 12h8M9 22l3-6 3 6M12 16v-2" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="9" y="8" width="6" height="8" rx="1" />
    </svg>
  ),
  creature: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
      <ellipse cx="12" cy="13" rx="8" ry="6" />
      <circle cx="9" cy="11" r="1.5" />
      <circle cx="15" cy="11" r="1.5" />
      <path d="M10 15c1 1 3 1 4 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M6 10c-2-2-2-5 0-6M18 10c2-2 2-5 0-6" stroke="currentColor" strokeWidth="2" fill="none" />
      <ellipse cx="8" cy="18" rx="2" ry="1" />
      <ellipse cx="16" cy="18" rx="2" ry="1" />
    </svg>
  ),
  mech: (
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
      <rect x="7" y="4" width="10" height="8" rx="1" />
      <rect x="8" y="6" width="3" height="2" fill="cyan" />
      <rect x="13" y="6" width="3" height="2" fill="cyan" />
      <rect x="9" y="12" width="6" height="6" />
      <rect x="5" y="8" width="2" height="6" />
      <rect x="17" y="8" width="2" height="6" />
      <rect x="8" y="18" width="3" height="4" />
      <rect x="13" y="18" width="3" height="4" />
    </svg>
  ),
};

// ================== COMPONENT ==================

export function CompanionWidget({
  companionId,
  defaultPosition = 'bottom-right',
  onOpenChat,
  onNavigate,
  onStartActivity,
}: CompanionWidgetProps) {
  // State
  const [companion, setCompanion] = useState<CompanionEvolutionState | null>(null);
  const [prompts, setPrompts] = useState<CompanionPrompt[]>([]);
  const [settings, setSettings] = useState<ProactiveSettings | null>(null);
  const [size, setSize] = useState<WidgetSize>('normal');
  const [position, setPosition] = useState(defaultPosition);
  const [mood, setMood] = useState<CompanionMood>('idle');
  const [showPrompt, setShowPrompt] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const dragControls = useDragControls();
  const widgetRef = useRef<HTMLDivElement>(null);
  
  // Load companion data
  useEffect(() => {
    const loadCompanion = async () => {
      const comp = await CompanionEvolutionService.getCompanion(companionId);
      if (comp) setCompanion(comp);
      
      const sets = await ProactiveCompanionService.getSettings(companionId);
      setSettings(sets);
      
      const activePrompts = await ProactiveCompanionService.getActivePrompts(companionId);
      setPrompts(activePrompts);
    };
    
    loadCompanion();
    
    // Subscribe to new prompts
    const unsubscribe = ProactiveCompanionService.onPrompt((prompt) => {
      setPrompts(prev => [prompt, ...prev]);
      setMood('excited');
      setShowPrompt(true);
      
      // Reset mood after animation
      setTimeout(() => setMood('idle'), 3000);
    });
    
    // Start proactive service
    ProactiveCompanionService.start(companionId);
    
    return () => {
      unsubscribe();
      ProactiveCompanionService.stop();
    };
  }, [companionId]);
  
  // Determine mood based on context
  useEffect(() => {
    if (!companion) return;
    
    const progress = getEvolutionProgress(companion.currentXP);
    
    if (progress.progress >= 90) {
      setMood('excited');
    } else if (companion.bondLevel >= 80) {
      setMood('happy');
    } else if (prompts.length > 0 && prompts[0].category === 'curiosity') {
      setMood('curious');
    } else {
      const hour = new Date().getHours();
      if (hour >= 23 || hour < 6) {
        setMood('sleepy');
      }
    }
  }, [companion, prompts]);
  
  // Handle prompt action
  const handlePromptAction = useCallback(async (prompt: CompanionPrompt, actionId: string) => {
    const action = prompt.suggestedActions?.find(a => a.id === actionId);
    if (!action) return;
    
    switch (action.action) {
      case 'navigate':
        onNavigate?.(action.payload as string);
        break;
      case 'open-chat':
        onOpenChat?.();
        break;
      case 'start-activity':
        onStartActivity?.(action.payload as string);
        break;
      case 'dismiss':
      case 'snooze':
        await ProactiveCompanionService.dismissPrompt(prompt.id);
        setPrompts(prev => prev.filter(p => p.id !== prompt.id));
        break;
      case 'custom':
        // Handle custom actions (like confetti)
        if ((action.payload as Record<string, unknown>)?.type === 'confetti') {
          // Trigger confetti animation
          setMood('excited');
        }
        break;
    }
    
    // Mark as interacted
    await ProactiveCompanionService.dismissPrompt(prompt.id);
    setPrompts(prev => prev.filter(p => p.id !== prompt.id));
  }, [onNavigate, onOpenChat, onStartActivity]);
  
  // Toggle mute
  const toggleMute = async () => {
    if (isMuted) {
      await ProactiveCompanionService.updateSettings(companionId, { mutedUntil: undefined });
    } else {
      await ProactiveCompanionService.muteFor(companionId, 60); // Mute for 1 hour
    }
    setIsMuted(!isMuted);
  };
  
  if (!companion) {
    return null;
  }
  
  const appearance = CompanionEvolutionService.getCompanionAppearance(companion);
  const progress = getEvolutionProgress(companion.currentXP);
  const currentPrompt = prompts[0];
  const moodAnim = MOOD_ANIMATIONS[mood];
  
  // Position classes
  const positionClasses: Record<WidgetPosition, string> = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };
  
  // Size dimensions
  const sizeClasses: Record<WidgetSize, string> = {
    compact: 'w-16 h-16',
    normal: 'w-20 h-20',
    expanded: 'w-24 h-24',
  };
  
  return (
    <motion.div
      ref={widgetRef}
      className={cn(
        'fixed z-50 flex flex-col items-end gap-2',
        positionClasses[position]
      )}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
    >
      {/* Prompt Bubble */}
      <AnimatePresence>
        {showPrompt && currentPrompt && !isMuted && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className={cn(
              'max-w-xs rounded-2xl shadow-xl overflow-hidden',
              'bg-gradient-to-br from-slate-900/95 to-slate-800/95',
              'border border-white/10 backdrop-blur-lg'
            )}
          >
            {/* Prompt Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: appearance.colors.accent }}
                />
                <span className="text-xs text-white/60 capitalize">
                  {currentPrompt.category.replace('-', ' ')}
                </span>
              </div>
              <button
                onClick={() => setShowPrompt(false)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-3 h-3 text-white/40" />
              </button>
            </div>
            
            {/* Prompt Content */}
            <div className="p-3">
              <p className="text-sm text-white leading-relaxed">
                {currentPrompt.message}
              </p>
              {currentPrompt.subtext && (
                <p className="text-xs text-white/50 mt-1">
                  {currentPrompt.subtext}
                </p>
              )}
            </div>
            
            {/* Prompt Actions */}
            {currentPrompt.suggestedActions && (
              <div className="flex gap-2 px-3 pb-3">
                {currentPrompt.suggestedActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handlePromptAction(currentPrompt, action.id)}
                    className={cn(
                      'flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      action.action === 'dismiss' || action.action === 'snooze'
                        ? 'bg-white/5 text-white/60 hover:bg-white/10'
                        : 'bg-gradient-to-r text-white hover:opacity-90'
                    )}
                    style={
                      action.action !== 'dismiss' && action.action !== 'snooze'
                        ? { 
                            backgroundImage: `linear-gradient(135deg, ${appearance.colors.primary}, ${appearance.colors.accent})` 
                          }
                        : undefined
                    }
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
            
            {/* Prompt Queue Indicator */}
            {prompts.length > 1 && (
              <div className="px-3 pb-2 flex items-center gap-1">
                <div className="flex -space-x-1">
                  {prompts.slice(1, 4).map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-white/30"
                    />
                  ))}
                </div>
                <span className="text-[10px] text-white/40">
                  +{prompts.length - 1} more
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Companion Avatar */}
      <motion.div
        className={cn(
          'relative cursor-pointer select-none',
          sizeClasses[size]
        )}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onOpenChat}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: moodAnim.scale,
          rotate: moodAnim.rotate,
        }}
        transition={{
          duration: moodAnim.duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Glow Effect */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-50"
          style={{ backgroundColor: appearance.colors.glow }}
        />
        
        {/* Main Avatar Circle */}
        <div
          className={cn(
            'relative w-full h-full rounded-full',
            'border-2 shadow-lg overflow-hidden',
            'flex items-center justify-center'
          )}
          style={{
            backgroundColor: appearance.colors.primary,
            borderColor: appearance.colors.accent,
            boxShadow: `0 0 20px ${appearance.colors.glow}40`,
          }}
        >
          {/* Base Form Icon */}
          <div className="w-3/5 h-3/5 text-white/90">
            {BASE_FORM_ICONS[companion.baseFormType || 'creature']}
          </div>
          
          {/* Stage Indicator Ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke={appearance.colors.accent}
              strokeWidth="4"
              strokeDasharray={`${progress.progress * 2.89} 289`}
              strokeLinecap="round"
            />
          </svg>
        </div>
        
        {/* Stage Badge */}
        <div
          className={cn(
            'absolute -bottom-1 -right-1',
            'w-7 h-7 rounded-full',
            'flex items-center justify-center',
            'text-xs font-bold text-white',
            'border-2 border-slate-900'
          )}
          style={{ backgroundColor: appearance.colors.accent }}
        >
          {companion.currentStage}
        </div>
        
        {/* Notification Badge */}
        {prompts.length > 0 && !showPrompt && (
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <span className="text-[10px] font-bold text-white">
              {prompts.length}
            </span>
          </motion.div>
        )}
        
        {/* Mood Particles */}
        <AnimatePresence>
          {(mood === 'happy' || mood === 'excited') && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ 
                    opacity: 0, 
                    scale: 0,
                    x: 0,
                    y: 0,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: (Math.random() - 0.5) * 60,
                    y: -30 - Math.random() * 30,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                >
                  <Sparkles 
                    className="w-3 h-3" 
                    style={{ color: appearance.colors.accent }} 
                  />
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Quick Actions (on hover) */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute right-full mr-2 bottom-0 flex flex-col gap-1"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className={cn(
                'p-2 rounded-full transition-all',
                'bg-slate-800/90 border border-white/10 backdrop-blur-sm',
                'hover:bg-slate-700/90'
              )}
              title={isMuted ? 'Unmute' : 'Mute for 1 hour'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white/60" />
              ) : (
                <Volume2 className="w-4 h-4 text-white/60" />
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPrompt(true);
              }}
              className={cn(
                'p-2 rounded-full transition-all',
                'bg-slate-800/90 border border-white/10 backdrop-blur-sm',
                'hover:bg-slate-700/90'
              )}
              title="Show messages"
            >
              <Bell className="w-4 h-4 text-white/60" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSize(size === 'compact' ? 'normal' : size === 'normal' ? 'expanded' : 'compact');
              }}
              className={cn(
                'p-2 rounded-full transition-all',
                'bg-slate-800/90 border border-white/10 backdrop-blur-sm',
                'hover:bg-slate-700/90'
              )}
              title="Resize"
            >
              {size === 'expanded' ? (
                <Minimize2 className="w-4 h-4 text-white/60" />
              ) : (
                <Maximize2 className="w-4 h-4 text-white/60" />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Companion Info Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={cn(
              'absolute bottom-full mb-2 right-0',
              'px-3 py-2 rounded-lg',
              'bg-slate-900/95 border border-white/10 backdrop-blur-lg',
              'text-xs text-white whitespace-nowrap'
            )}
          >
            <div className="font-semibold">{appearance.displayName}</div>
            <div className="text-white/60">
              {appearance.baseFormStageName} • {appearance.species.name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span>{formatXP(companion.currentXP)} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-pink-400" />
                <span>{Math.round(companion.bondLevel)}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CompanionWidget;

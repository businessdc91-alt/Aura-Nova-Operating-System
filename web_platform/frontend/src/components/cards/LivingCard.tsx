
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageCircle } from 'lucide-react';
import { DialogueBubble } from '@/components/ui/DialogueBubble';
import { Button } from '@/components/ui/button';

interface LivingCardProps {
  id: string;
  suit: string;
  rank: string;
  color: string;
  symbol: string;
  backgroundColor: string;
  personality?: string; // Optional custom personality
  children?: React.ReactNode; // For the card content/design
}

export const LivingCard: React.FC<LivingCardProps> = ({
  id,
  suit,
  rank,
  color,
  symbol,
  backgroundColor,
  personality,
  children
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [dialogue, setDialogue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDialogue = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setDialogue(null);

    try {
      const response = await fetch('http://localhost:4000/api/ai/card-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardName: `${rank} of ${suit}`,
          suit,
          rank,
          personality,
          context: 'User has just awakened you.'
        })
      });

      const data = await response.json();
      if (data.message) {
        setDialogue(data.message);
        // Auto-close after 6 seconds
        setTimeout(() => setDialogue(null), 6000);
      }
    } catch (error) {
      console.error('Failed to talk to card:', error);
      setDialogue('*Static noise* (Connection failed)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative group perspective-1000">
      <DialogueBubble message={dialogue || ''} isVisible={!!dialogue} />

      <motion.div
        whileHover={{ scale: 1.05, rotateY: 5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative preserve-3d transition-all duration-500"
      >
        {/* Living Glow Effect */}
        <div className={`absolute -inset-1 blur-md bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-70 transition-opacity duration-500 rounded-lg`} />

        {/* Card Body */}
        <div 
            className="relative bg-white rounded-lg shadow-xl overflow-hidden cursor-pointer"
            onClick={fetchDialogue}
        >
            {/* Loading Indicator */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-yellow-400 animate-spin" />
                </div>
            )}

            {children}

            {/* Talk Interaction Hint */}
            <div className={`absolute bottom-2 right-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-purple-600 shadow-sm">
                    <MessageCircle className="w-4 h-4" />
                </Button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

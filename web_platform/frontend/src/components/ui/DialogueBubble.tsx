
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogueBubbleProps {
  message: string;
  isVisible: boolean;
  onClose?: () => void;
  position?: 'top' | 'bottom';
}

export const DialogueBubble: React.FC<DialogueBubbleProps> = ({ 
  message, 
  isVisible, 
  position = 'top' 
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          className={`absolute ${position === 'top' ? '-top-24' : '-bottom-24'} left-1/2 -translate-x-1/2 z-50 w-48`}
        >
          <div className="relative bg-white text-slate-900 p-3 rounded-2xl shadow-xl border-2 border-purple-500 text-sm font-medium text-center">
            {message}
            {/* Triangle/Tail */}
            <div 
              className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-purple-500 transform rotate-45 ${
                position === 'top' ? '-bottom-2 bg-white' : '-top-2 bg-white rotate-[225deg]'
              }`}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

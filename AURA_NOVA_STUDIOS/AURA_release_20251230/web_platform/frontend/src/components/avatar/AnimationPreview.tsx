'use client';

import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Animation, AnimationService } from '@/services/animationService';

interface AnimationPreviewProps {
  animation: Animation;
  className?: string;
}

export const AnimationPreview: React.FC<AnimationPreviewProps> = ({
  animation,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (isPlaying) {
        const currentProgress = animation.loopable
          ? (elapsed % animation.duration) / animation.duration
          : Math.min(1, elapsed / animation.duration);

        setProgress(currentProgress);

        if (!animation.loopable && currentProgress >= 1) {
          setIsPlaying(false);
          setProgress(1);
          return;
        }

        drawAnimation(currentProgress);
      }

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      drawAnimation(progress);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, progress, animation]);

  const drawAnimation = (progress: number) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = 256;
    canvas.height = 384;
    const ctx = canvas.getContext('2d')!;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const baseY = canvas.height * 0.6;

    // Draw simplified figure with animation applied
    drawAnimatedFigure(ctx, centerX, baseY, progress, animation);

    // Draw progress bar
    ctx.fillStyle = '#4A90FF';
    ctx.fillRect(0, canvas.height - 3, canvas.width * progress, 3);

    // Draw animation info
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(animation.name, 10, 20);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px Arial';
    ctx.fillText(`${Math.round(progress * 100)}%`, canvas.width - 40, 20);
  };

  const drawAnimatedFigure = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    baseY: number,
    progress: number,
    animation: Animation
  ) => {
    // Simple stick figure with animation
    const scaleFactor = 0.8;

    // Get joint transformations
    const headPos = { x: centerX, y: baseY - 80 * scaleFactor };
    const torsoPos = { x: centerX, y: baseY - 40 * scaleFactor };
    const legLPos = { x: centerX - 15 * scaleFactor, y: baseY };
    const legRPos = { x: centerX + 15 * scaleFactor, y: baseY };

    // Draw head
    ctx.fillStyle = '#E8B5A6';
    ctx.beginPath();
    ctx.arc(headPos.x, headPos.y, 20 * scaleFactor, 0, Math.PI * 2);
    ctx.fill();

    // Draw eyes with animation
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(headPos.x - 8, headPos.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(headPos.x + 8, headPos.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw torso
    ctx.strokeStyle = '#E8B5A6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(headPos.x, headPos.y + 15);
    ctx.lineTo(torsoPos.x, torsoPos.y + 30);
    ctx.stroke();

    // Draw arms with animation
    const armAnimation = animation.tracks.find(t => t.jointId?.includes('hand'));
    const armRotation = armAnimation
      ? AnimationService.interpolateKeyframes(armAnimation.keyframes, progress).rotation.x
      : 0;

    const armOffsetX = Math.sin((armRotation * Math.PI) / 180) * 25 * scaleFactor;
    const armOffsetY = Math.cos((armRotation * Math.PI) / 180) * 25 * scaleFactor;

    // Left arm
    ctx.beginPath();
    ctx.moveTo(torsoPos.x - 15, torsoPos.y - 10);
    ctx.lineTo(torsoPos.x - 15 - armOffsetX * 0.5, torsoPos.y - 10 + armOffsetY);
    ctx.stroke();

    // Right arm
    ctx.beginPath();
    ctx.moveTo(torsoPos.x + 15, torsoPos.y - 10);
    ctx.lineTo(torsoPos.x + 15 + armOffsetX, torsoPos.y - 10 + armOffsetY);
    ctx.stroke();

    // Draw legs
    ctx.beginPath();
    ctx.moveTo(torsoPos.x - 8, torsoPos.y + 30);
    ctx.lineTo(legLPos.x, legLPos.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(torsoPos.x + 8, torsoPos.y + 30);
    ctx.lineTo(legRPos.x, legRPos.y);
    ctx.stroke();

    // Draw body sway based on animation
    const bodyAnimation = animation.tracks.find(t => t.jointId === 'pelvis');
    if (bodyAnimation) {
      const frame = AnimationService.interpolateKeyframes(bodyAnimation.keyframes, progress);
      const swayX = frame.position.x || 0;
      const swayY = frame.position.y || 0;

      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#4A90FF';
      ctx.beginPath();
      ctx.arc(centerX + swayX, baseY + swayY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  return (
    <div className={`bg-slate-950 rounded-lg border border-slate-800 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full block"
      />

      <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-3">
        {/* Playback Controls */}
        <div className="flex gap-2">
          <button
            onClick={togglePlayPause}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={restart}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={progress * 100}
              onChange={(e) => {
                setProgress(parseInt(e.target.value) / 100);
                setIsPlaying(false);
              }}
              className="flex-1"
            />
            <span className="text-xs text-slate-400 w-10 text-right">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-slate-400 space-y-1">
          <p>
            <span className="font-semibold">Duration:</span> {animation.duration}ms
          </p>
          <p>
            <span className="font-semibold">Loopable:</span> {animation.loopable ? 'Yes' : 'No'}
          </p>
          {animation.description && (
            <p>
              <span className="font-semibold">Description:</span> {animation.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimationPreview;

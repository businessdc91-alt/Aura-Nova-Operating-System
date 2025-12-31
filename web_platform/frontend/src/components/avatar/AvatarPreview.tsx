import React, { useEffect, useRef } from 'react';
import { Avatar, AvatarService } from '@/services/avatarService';
import { ClothingCreatorService } from '@/services/clothingCreatorService';

interface AvatarPreviewProps {
  avatar: Avatar;
  width?: number;
  height?: number;
  showOutfit?: boolean;
  className?: string;
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({
  avatar,
  width = 256,
  height = 384,
  showOutfit = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    renderAvatar();
  }, [avatar]);

  const renderAvatar = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw avatar body
    drawBody(ctx, canvas);

    // Draw clothing if provided
    if (showOutfit && avatar.clothingLayers) {
      await drawClothing(ctx, canvas);
    }
  };

  const drawBody = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const { body } = avatar;
    const centerX = canvas.width / 2;
    const headY = canvas.height * 0.15;
    const torsoY = canvas.height * 0.35;
    const legY = canvas.height * 0.55;

    ctx.fillStyle = body.skinTone;

    // Head
    switch (body.headShape) {
      case 'round':
        ctx.beginPath();
        ctx.arc(centerX, headY, 25, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        ctx.fillRect(centerX - 25, headY - 25, 50, 50);
        break;
      case 'oval':
        ctx.beginPath();
        ctx.ellipse(centerX, headY, 22, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'heart':
        ctx.beginPath();
        ctx.arc(centerX - 12, headY - 12, 12, 0, Math.PI * 2);
        ctx.arc(centerX + 12, headY - 12, 12, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    // Torso
    const torsoWidth =
      body.bodyType === 'broad'
        ? 50
        : body.bodyType === 'slim'
          ? 30
          : body.bodyType === 'curvy'
            ? 45
            : 40;

    ctx.fillRect(centerX - torsoWidth / 2, torsoY, torsoWidth, 75);

    // Arms
    ctx.fillRect(centerX - torsoWidth / 2 - 20, torsoY + 10, 20, 70);
    ctx.fillRect(centerX + torsoWidth / 2, torsoY + 10, 20, 70);

    // Legs
    const legWidth = 15;
    ctx.fillRect(centerX - legWidth - 5, legY, legWidth, 100);
    ctx.fillRect(centerX + 5, legY, legWidth, 100);

    // Eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX - 10, headY - 8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + 10, headY - 8, 3, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, headY + 8, 5, 0, Math.PI);
    ctx.stroke();
  };

  const drawClothing = async (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const centerX = canvas.width / 2;
    const torsoY = canvas.height * 0.35;
    const legY = canvas.height * 0.55;

    // Simplified clothing layers visualization
    const { clothingLayers } = avatar;

    // Top
    if (clothingLayers?.top) {
      ctx.fillStyle = '#4ECDC4';
      ctx.globalAlpha = 0.8;
      const topWidth = 50;
      ctx.fillRect(centerX - topWidth / 2, torsoY, topWidth, 60);
      ctx.globalAlpha = 1;
    }

    // Bottom
    if (clothingLayers?.bottom) {
      ctx.fillStyle = '#FF6B6B';
      ctx.globalAlpha = 0.8;
      const bottomWidth = 45;
      ctx.fillRect(centerX - bottomWidth / 2, legY - 20, bottomWidth, 50);
      ctx.globalAlpha = 1;
    }

    // Shoes
    if (clothingLayers?.shoes) {
      ctx.fillStyle = '#2C3E50';
      const shoeWidth = 18;
      ctx.fillRect(centerX - shoeWidth - 8, legY + 100, shoeWidth, 15);
      ctx.fillRect(centerX + 8, legY + 100, shoeWidth, 15);
    }

    // Accessories/Coat overlay
    if (clothingLayers?.coat) {
      ctx.strokeStyle = '#95E1D3';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      const centerX = canvas.width / 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 30, torsoY - 10);
      ctx.lineTo(centerX - 35, legY + 80);
      ctx.lineTo(centerX + 35, legY + 80);
      ctx.lineTo(centerX + 30, torsoY - 10);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={`bg-slate-950 rounded-lg border border-slate-800 ${className}`}
    />
  );
};

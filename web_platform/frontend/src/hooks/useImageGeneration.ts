/**
 * React hook for AI image generation using Vertex AI Imagen
 */

import { useState, useCallback } from 'react';

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  numberOfImages?: number;
  type?: 'sprite' | 'background' | 'character' | 'general';
}

export interface GeneratedImage {
  imageData: string;
  prompt: string;
}

export interface ImageGenerationResult {
  success: boolean;
  images: GeneratedImage[];
  model?: string;
  error?: string;
}

export function useImageGeneration() {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageGenerationResult | null>(null);

  const generateImage = useCallback(async (options: ImageGenerationOptions): Promise<ImageGenerationResult> => {
    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/art/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Image generation failed');
      }

      const imageResult: ImageGenerationResult = {
        success: data.success,
        images: data.images || [],
        model: data.model,
      };

      setResult(imageResult);
      return imageResult;

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate image';
      setError(errorMessage);
      
      const errorResult: ImageGenerationResult = {
        success: false,
        images: [],
        error: errorMessage,
      };
      
      setResult(errorResult);
      return errorResult;

    } finally {
      setGenerating(false);
    }
  }, []);

  const generateSprite = useCallback(async (
    prompt: string,
    frameCount: number = 4
  ): Promise<ImageGenerationResult> => {
    const spritePrompt = `${prompt}, sprite sheet with ${frameCount} frames, pixel art style, game asset, transparent background`;
    
    return generateImage({
      prompt: spritePrompt,
      aspectRatio: '16:9',
      type: 'sprite',
    });
  }, [generateImage]);

  const generateBackground = useCallback(async (
    prompt: string,
    aspectRatio: '16:9' | '4:3' = '16:9'
  ): Promise<ImageGenerationResult> => {
    const backgroundPrompt = `${prompt}, game background, detailed environment, landscape`;
    
    return generateImage({
      prompt: backgroundPrompt,
      aspectRatio,
      type: 'background',
    });
  }, [generateImage]);

  const generateCharacter = useCallback(async (
    prompt: string
  ): Promise<ImageGenerationResult> => {
    const characterPrompt = `${prompt}, character design, game character, detailed`;
    
    return generateImage({
      prompt: characterPrompt,
      aspectRatio: '1:1',
      type: 'character',
    });
  }, [generateImage]);

  const reset = useCallback(() => {
    setGenerating(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    generating,
    error,
    result,
    generateImage,
    generateSprite,
    generateBackground,
    generateCharacter,
    reset,
  };
}

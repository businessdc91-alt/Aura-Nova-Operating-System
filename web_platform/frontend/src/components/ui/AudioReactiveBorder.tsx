'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

interface AudioReactiveBorderProps {
  children: React.ReactNode;
  className?: string;
  borderWidth?: number;
  sensitivity?: number;
  enabled?: boolean;
}

export function AudioReactiveBorder({
  children,
  className = '',
  borderWidth = 3,
  sensitivity = 1.5,
  enabled = true,
}: AudioReactiveBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);
  
  const [isListening, setIsListening] = useState(false);
  const [hue, setHue] = useState(0);
  const [intensity, setIntensity] = useState(0);

  // Start listening to system audio
  const startListening = useCallback(async () => {
    try {
      // Request audio access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      sourceRef.current = source;
      
      setIsListening(true);
      animate();
    } catch (error) {
      console.log('Audio access not available, using ambient animation');
      // Fallback to ambient animation if no mic access
      animateAmbient();
    }
  }, []);

  // Stop listening
  const stopListening = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
  }, []);

  // Audio-reactive animation
  const animate = useCallback(() => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average frequency intensity
    const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    const normalizedIntensity = Math.min(1, (average / 128) * sensitivity);

    // Get bass (low frequencies) for color shifting
    const bass = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
    const treble = dataArray.slice(100, 128).reduce((a, b) => a + b, 0) / 28;

    // Update hue based on audio
    setHue((prev) => (prev + bass * 0.1 + 0.5) % 360);
    setIntensity(normalizedIntensity);

    // Draw the border
    drawBorder(normalizedIntensity, bass, treble);

    animationRef.current = requestAnimationFrame(animate);
  }, [sensitivity]);

  // Ambient animation fallback (no audio)
  const animateAmbient = useCallback(() => {
    let frame = 0;
    
    const ambientLoop = () => {
      frame++;
      const wave = Math.sin(frame * 0.02) * 0.5 + 0.5;
      const wave2 = Math.sin(frame * 0.03 + 1) * 0.5 + 0.5;
      
      setHue((frame * 0.5) % 360);
      setIntensity(wave * 0.3 + 0.2);
      
      drawBorder(wave * 0.5, wave * 100, wave2 * 100);
      
      animationRef.current = requestAnimationFrame(ambientLoop);
    };
    
    ambientLoop();
  }, []);

  // Draw the RGB border on canvas
  const drawBorder = useCallback((intensity: number, bass: number, treble: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = container.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    const time = Date.now() * 0.001;
    const segments = 100;

    // Create gradient that flows around the border
    for (let i = 0; i < segments; i++) {
      const progress = i / segments;
      const angle = progress * Math.PI * 2;
      
      // Calculate position along the border
      let x, y;
      const perimeter = 2 * (width + height);
      const position = progress * perimeter;

      if (position < width) {
        // Top edge
        x = position;
        y = 0;
      } else if (position < width + height) {
        // Right edge
        x = width;
        y = position - width;
      } else if (position < 2 * width + height) {
        // Bottom edge
        x = width - (position - width - height);
        y = height;
      } else {
        // Left edge
        x = 0;
        y = height - (position - 2 * width - height);
      }

      // Calculate color with flowing hue
      const hueOffset = (time * 50 + progress * 360 + bass * 0.5) % 360;
      const saturation = 80 + intensity * 20;
      const lightness = 50 + treble * 0.2 + intensity * 20;
      
      // Pulsing effect based on intensity
      const pulseSize = borderWidth + intensity * 4 + Math.sin(time * 10 + progress * 20) * 2;

      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hueOffset}, ${saturation}%, ${lightness}%, ${0.6 + intensity * 0.4})`;
      ctx.fill();
    }

    // Add glow effect
    ctx.shadowBlur = 20 + intensity * 30;
    ctx.shadowColor = `hsla(${(time * 50) % 360}, 100%, 60%, ${0.5 + intensity * 0.5})`;
  }, [borderWidth]);

  useEffect(() => {
    if (enabled) {
      startListening();
    } else {
      stopListening();
    }

    return () => {
      stopListening();
    };
  }, [enabled, startListening, stopListening]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          mixBlendMode: 'screen',
        }}
      />
      <div
        className="relative z-0"
        style={{
          boxShadow: isListening 
            ? `0 0 ${20 + intensity * 40}px hsla(${hue}, 100%, 60%, ${0.3 + intensity * 0.4})`
            : `0 0 20px hsla(${hue}, 100%, 60%, 0.3)`,
          transition: 'box-shadow 0.1s ease-out',
        }}
      >
        {children}
      </div>
      
      {/* Toggle Button */}
      <button
        onClick={() => isListening ? stopListening() : startListening()}
        className={`absolute top-2 right-2 z-20 p-2 rounded-full transition-all ${
          isListening 
            ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
            : 'bg-slate-800/80 text-slate-400 border border-slate-700'
        }`}
        title={isListening ? 'Listening to audio' : 'Click to enable audio reactivity'}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isListening ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          )}
        </svg>
      </button>
    </div>
  );
}

export default AudioReactiveBorder;

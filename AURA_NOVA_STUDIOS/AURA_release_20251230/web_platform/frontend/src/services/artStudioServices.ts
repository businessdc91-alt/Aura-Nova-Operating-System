'use client';

/**
 * Art Studio Services
 * Handles all art creation operations: background removal, motion creation, procedural generation
 */

// ============== BACKGROUND REMOVER ==============
export interface BackgroundRemovalResult {
  success: boolean;
  originalImage: string;
  processedImage: string;
  transparencyMask: string;
  processingTime: number;
  format: 'png' | 'webp';
}

export class BackgroundRemoverService {
  /**
   * Remove background from image using canvas
   * Supports simple color-based removal and edge detection
   */
  static async removeBackground(
    imageUrl: string,
    options: {
      tolerance?: number;
      edgeDetection?: boolean;
      featherEdges?: boolean;
    } = {}
  ): Promise<BackgroundRemovalResult> {
    const startTime = performance.now();
    const { tolerance = 30, edgeDetection = true, featherEdges = true } = options;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;

        // Draw image
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Detect background color (usually dominant color in corners)
        const bgColor = this.detectBackgroundColor(data, canvas.width, canvas.height);

        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Check if pixel is similar to background color
          const distance = Math.sqrt(
            Math.pow(r - bgColor.r, 2) +
              Math.pow(g - bgColor.g, 2) +
              Math.pow(b - bgColor.b, 2)
          );

          if (distance < tolerance) {
            // Make transparent
            data[i + 3] = 0;
          } else if (featherEdges && distance < tolerance * 1.5) {
            // Feather edges
            data[i + 3] = Math.max(0, 255 - (distance - tolerance) * 5);
          }
        }

        // Apply edge detection if enabled
        if (edgeDetection) {
          this.applyEdgeSmoothing(data, canvas.width, canvas.height);
        }

        ctx.putImageData(imageData, 0, 0);

        // Get results
        const processedImage = canvas.toDataURL('image/png');
        const transparencyMask = this.createTransparencyMask(canvas);

        resolve({
          success: true,
          originalImage: imageUrl,
          processedImage,
          transparencyMask,
          processingTime: performance.now() - startTime,
          format: 'png',
        });
      };
      img.src = imageUrl;
    });
  }

  private static detectBackgroundColor(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): { r: number; g: number; b: number } {
    // Sample corners (likely background)
    const samples = [
      [0, 0], // top-left
      [width - 1, 0], // top-right
      [0, height - 1], // bottom-left
      [width - 1, height - 1], // bottom-right
    ];

    let r = 0,
      g = 0,
      b = 0;

    for (const [x, y] of samples) {
      const idx = (y * width + x) * 4;
      r += data[idx];
      g += data[idx + 1];
      b += data[idx + 2];
    }

    return {
      r: Math.round(r / 4),
      g: Math.round(g / 4),
      b: Math.round(b / 4),
    };
  }

  private static applyEdgeSmoothing(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): void {
    // Simple edge smoothing (box blur on alpha channel)
    const alphaData = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
      alphaData[i / 4] = data[i + 3];
    }

    // Apply 3x3 blur
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let sum = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            sum += alphaData[(y + dy) * width + (x + dx)];
          }
        }
        const idx = (y * width + x) * 4;
        data[idx + 3] = Math.round(sum / 9);
      }
    }
  }

  private static createTransparencyMask(canvas: HTMLCanvasElement): string {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Create grayscale mask based on alpha
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      data[i] = alpha; // R
      data[i + 1] = alpha; // G
      data[i + 2] = alpha; // B
      data[i + 3] = 255; // A = fully opaque
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }
}

// ============== MOTION CREATOR ==============
export interface AnimationFrame {
  duration: number;
  position?: { x: number; y: number };
  rotation?: number;
  scale?: { x: number; y: number };
  opacity?: number;
}

export interface MotionSequence {
  id: string;
  name: string;
  frames: AnimationFrame[];
  duration: number;
  looping: boolean;
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic';
  fps: number;
  generatedCode: string;
}

export class MotionCreatorService {
  /**
   * Create motion/animation sequence
   */
  static createMotionSequence(
    name: string,
    keyframes: Array<{
      time: number;
      transform: Partial<AnimationFrame>;
    }>
  ): MotionSequence {
    const sequence: AnimationFrame[] = [];
    const totalDuration = keyframes[keyframes.length - 1].time;

    // Interpolate between keyframes
    for (let i = 0; i < keyframes.length - 1; i++) {
      const current = keyframes[i];
      const next = keyframes[i + 1];
      const frameDiff = next.time - current.time;

      sequence.push({
        duration: current.time,
        ...current.transform,
      });

      // Add interpolated frames
      const steps = Math.ceil(frameDiff * 30); // 30 FPS
      for (let step = 1; step < steps; step++) {
        const progress = step / steps;
        const time = current.time + frameDiff * progress;

        sequence.push({
          duration: time,
          position: this.interpolate(current.transform.position, next.transform.position, progress),
          rotation: this.interpolateNumber(current.transform.rotation, next.transform.rotation, progress),
          scale: this.interpolate(current.transform.scale, next.transform.scale, progress),
          opacity: this.interpolateNumber(current.transform.opacity, next.transform.opacity, progress),
        });
      }
    }

    const motionId = `motion-${Date.now()}`;
    const generatedCode = this.generateAnimationCode(name, sequence);

    return {
      id: motionId,
      name,
      frames: sequence,
      duration: totalDuration,
      looping: true,
      easing: 'easeInOut',
      fps: 30,
      generatedCode,
    };
  }

  private static interpolate(
    start?: { x: number; y: number },
    end?: { x: number; y: number },
    progress: number
  ): { x: number; y: number } | undefined {
    if (!start || !end) return start || end;
    return {
      x: start.x + (end.x - start.x) * progress,
      y: start.y + (end.y - start.y) * progress,
    };
  }

  private static interpolateNumber(
    start?: number,
    end?: number,
    progress?: number
  ): number | undefined {
    if (start === undefined || end === undefined) return start || end;
    return start + (end - start) * (progress || 0);
  }

  private static generateAnimationCode(name: string, frames: AnimationFrame[]): string {
    return `// Animation: ${name}
const ${name}Animation = {
  frames: ${JSON.stringify(frames, null, 2)},
  duration: ${frames[frames.length - 1].duration},
  fps: 30,
  
  apply(element, progress) {
    const frameIndex = Math.floor(progress * this.frames.length);
    const frame = this.frames[frameIndex];
    
    if (frame.position) {
      element.style.transform = \`translate(\${frame.position.x}px, \${frame.position.y}px)\`;
    }
    if (frame.rotation !== undefined) {
      element.style.transform += \` rotate(\${frame.rotation}deg)\`;
    }
    if (frame.scale) {
      element.style.transform += \` scale(\${frame.scale.x}, \${frame.scale.y})\`;
    }
    if (frame.opacity !== undefined) {
      element.style.opacity = frame.opacity;
    }
  }
};`;
  }

  /**
   * Generate CSS animation from motion sequence
   */
  static generateCSSAnimation(sequence: MotionSequence): string {
    const keyframes = sequence.frames
      .map((frame, idx) => {
        const percent = (idx / (sequence.frames.length - 1)) * 100;
        let css = `  ${percent.toFixed(1)}% {`;

        if (frame.position) {
          css += ` transform: translate(${frame.position.x}px, ${frame.position.y}px);`;
        }
        if (frame.rotation) {
          css += ` transform: rotate(${frame.rotation}deg);`;
        }
        if (frame.scale) {
          css += ` transform: scale(${frame.scale.x}, ${frame.scale.y});`;
        }
        if (frame.opacity !== undefined) {
          css += ` opacity: ${frame.opacity};`;
        }

        css += ' }';
        return css;
      })
      .join('\n');

    return `@keyframes ${sequence.name} {
${keyframes}
}

.animated-${sequence.name} {
  animation: ${sequence.name} ${sequence.duration}ms ease-in-out infinite;
}`;
  }
}

// ============== PROCEDURAL GENERATOR ==============
export interface ProceduralConfig {
  seed: number;
  complexity: 'simple' | 'moderate' | 'complex';
  style: 'geometric' | 'organic' | 'fractal' | 'cellular' | 'perlin';
  colorScheme: string[];
  dimensions: { width: number; height: number };
}

export class ProceduralGeneratorService {
  /**
   * Generate procedural art using canvas
   */
  static generateArt(config: ProceduralConfig): string {
    const canvas = document.createElement('canvas');
    canvas.width = config.dimensions.width;
    canvas.height = config.dimensions.height;
    const ctx = canvas.getContext('2d')!;

    // Set random seed
    this.seededRandom(config.seed);

    switch (config.style) {
      case 'geometric':
        this.generateGeometric(ctx, config);
        break;
      case 'organic':
        this.generateOrganic(ctx, config);
        break;
      case 'fractal':
        this.generateFractal(ctx, config);
        break;
      case 'cellular':
        this.generateCellular(ctx, config);
        break;
      case 'perlin':
        this.generatePerlin(ctx, config);
        break;
    }

    return canvas.toDataURL('image/png');
  }

  private static seededRandom(seed: number) {
    this.seed = seed;
  }

  private static seed = 1;

  private static random(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  private static generateGeometric(ctx: CanvasRenderingContext2D, config: ProceduralConfig): void {
    ctx.fillStyle = config.colorScheme[0];
    ctx.fillRect(0, 0, config.dimensions.width, config.dimensions.height);

    const count = config.complexity === 'simple' ? 10 : config.complexity === 'moderate' ? 50 : 200;

    for (let i = 0; i < count; i++) {
      const x = this.random() * config.dimensions.width;
      const y = this.random() * config.dimensions.height;
      const size = this.random() * 100;
      const color = config.colorScheme[Math.floor(this.random() * config.colorScheme.length)];

      ctx.fillStyle = color;
      ctx.globalAlpha = this.random() * 0.7 + 0.3;

      if (this.random() > 0.5) {
        ctx.fillRect(x, y, size, size);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }

  private static generateOrganic(ctx: CanvasRenderingContext2D, config: ProceduralConfig): void {
    ctx.fillStyle = config.colorScheme[0];
    ctx.fillRect(0, 0, config.dimensions.width, config.dimensions.height);

    const count = config.complexity === 'simple' ? 3 : config.complexity === 'moderate' ? 8 : 15;

    for (let i = 0; i < count; i++) {
      const x = this.random() * config.dimensions.width;
      const y = this.random() * config.dimensions.height;
      const color = config.colorScheme[Math.floor(this.random() * config.colorScheme.length)];

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;

      // Draw wavy/organic shapes using Bezier curves
      ctx.beginPath();
      ctx.moveTo(x, y);

      for (let j = 0; j < 5; j++) {
        const cp1x = x + this.random() * 200 - 100;
        const cp1y = y + this.random() * 200 - 100;
        const cp2x = x + this.random() * 200 - 100;
        const cp2y = y + this.random() * 200 - 100;
        const ex = x + this.random() * 200 - 100;
        const ey = y + this.random() * 200 - 100;

        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, ex, ey);
      }

      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  private static generateFractal(ctx: CanvasRenderingContext2D, config: ProceduralConfig): void {
    ctx.fillStyle = config.colorScheme[0];
    ctx.fillRect(0, 0, config.dimensions.width, config.dimensions.height);

    const depth = config.complexity === 'simple' ? 3 : config.complexity === 'moderate' ? 5 : 8;

    const drawFractal = (x: number, y: number, size: number, d: number) => {
      if (d === 0) return;

      const color = config.colorScheme[Math.floor((depth - d) / depth * config.colorScheme.length)];
      ctx.fillStyle = color;
      ctx.fillRect(x, y, size, size);

      const newSize = size / 2;
      const positions = [
        [x, y],
        [x + newSize, y],
        [x, y + newSize],
        [x + newSize, y + newSize],
      ];

      for (const [nx, ny] of positions) {
        if (this.random() > 0.3) {
          drawFractal(nx, ny, newSize, d - 1);
        }
      }
    };

    drawFractal(0, 0, config.dimensions.width, depth);
  }

  private static generateCellular(ctx: CanvasRenderingContext2D, config: ProceduralConfig): void {
    const cellSize = config.complexity === 'simple' ? 50 : config.complexity === 'moderate' ? 30 : 10;
    const cols = Math.ceil(config.dimensions.width / cellSize);
    const rows = Math.ceil(config.dimensions.height / cellSize);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const color = config.colorScheme[Math.floor(this.random() * config.colorScheme.length)];
        ctx.fillStyle = color;
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }

  private static generatePerlin(ctx: CanvasRenderingContext2D, config: ProceduralConfig): void {
    // Simplified Perlin-like noise
    const scale = config.complexity === 'simple' ? 100 : config.complexity === 'moderate' ? 50 : 20;

    for (let y = 0; y < config.dimensions.height; y += scale) {
      for (let x = 0; x < config.dimensions.width; x += scale) {
        const noise = Math.abs(Math.sin(x * 0.01 + y * 0.01 + this.seed) * Math.cos(x * 0.01 - y * 0.01));
        const colorIndex = Math.floor(noise * config.colorScheme.length);
        ctx.fillStyle = config.colorScheme[colorIndex];
        ctx.fillRect(x, y, scale, scale);
      }
    }
  }
}

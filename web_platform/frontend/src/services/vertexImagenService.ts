/**
 * Vertex AI Imagen Service
 * Handles AI-powered image generation using Google's Imagen model
 */

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  numberOfImages?: number;
  seed?: number;
  guidanceScale?: number;
}

export interface GeneratedImage {
  imageData: string; // Base64 encoded image
  seed: number;
  prompt: string;
}

export interface ImageGenerationResponse {
  success: boolean;
  images: GeneratedImage[];
  error?: string;
  metadata?: {
    model: string;
    processingTime: number;
    cost: number;
  };
}

export class VertexImagenService {
  private static API_ENDPOINT = 'https://us-central1-aiplatform.googleapis.com/v1';
  
  /**
   * Generate images using Vertex AI Imagen
   */
  static async generateImage(
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResponse> {
    const startTime = performance.now();
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_VERTEX_API_KEY;
      const projectId = process.env.NEXT_PUBLIC_GCP_PROJECT_ID;
      const location = process.env.NEXT_PUBLIC_VERTEX_LOCATION || 'us-central1';

      if (!apiKey || !projectId) {
        throw new Error('Vertex AI credentials not configured. Please set NEXT_PUBLIC_VERTEX_API_KEY and NEXT_PUBLIC_GCP_PROJECT_ID in your .env.local file.');
      }

      // Construct the API endpoint for Imagen
      const endpoint = `${this.API_ENDPOINT}/projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration:predict`;

      const payload = {
        instances: [
          {
            prompt: request.prompt,
          }
        ],
        parameters: {
          sampleCount: request.numberOfImages || 1,
          aspectRatio: request.aspectRatio || '1:1',
          negativePrompt: request.negativePrompt || '',
          seed: request.seed,
          guidanceScale: request.guidanceScale || 7.5,
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `Vertex AI API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const processingTime = performance.now() - startTime;

      // Parse the response
      const images: GeneratedImage[] = [];
      
      if (data.predictions && Array.isArray(data.predictions)) {
        for (const prediction of data.predictions) {
          if (prediction.bytesBase64Encoded) {
            images.push({
              imageData: `data:image/png;base64,${prediction.bytesBase64Encoded}`,
              seed: request.seed || Math.floor(Math.random() * 1000000),
              prompt: request.prompt,
            });
          }
        }
      }

      return {
        success: true,
        images,
        metadata: {
          model: 'imagen-3.0-generate-001',
          processingTime,
          cost: this.calculateCost(request.numberOfImages || 1),
        },
      };
    } catch (error: any) {
      console.error('Vertex Imagen generation error:', error);
      
      return {
        success: false,
        images: [],
        error: error.message || 'Failed to generate image',
      };
    }
  }

  /**
   * Generate sprite sheet using AI
   */
  static async generateSpriteSheet(
    prompt: string,
    frameCount: number = 4
  ): Promise<ImageGenerationResponse> {
    const spritePrompt = `${prompt}, sprite sheet with ${frameCount} frames, pixel art style, game asset, transparent background, evenly spaced frames`;
    
    return this.generateImage({
      prompt: spritePrompt,
      aspectRatio: frameCount <= 4 ? '16:9' : '1:1',
      numberOfImages: 1,
    });
  }

  /**
   * Generate background image
   */
  static async generateBackground(
    prompt: string,
    aspectRatio: '16:9' | '4:3' | '21:9' = '16:9'
  ): Promise<ImageGenerationResponse> {
    const backgroundPrompt = `${prompt}, game background, landscape, detailed environment, high quality`;
    
    return this.generateImage({
      prompt: backgroundPrompt,
      aspectRatio,
      numberOfImages: 1,
    });
  }

  /**
   * Calculate estimated cost for image generation
   * Based on Vertex AI Imagen pricing
   */
  private static calculateCost(numberOfImages: number): number {
    // Approximate cost per image (adjust based on actual Vertex AI pricing)
    const costPerImage = 0.02; // $0.02 per image for Imagen
    return numberOfImages * costPerImage;
  }

  /**
   * Check if Vertex AI is properly configured
   */
  static isConfigured(): boolean {
    return !!(
      process.env.NEXT_PUBLIC_VERTEX_API_KEY &&
      process.env.NEXT_PUBLIC_GCP_PROJECT_ID
    );
  }

  /**
   * Get configuration status and instructions
   */
  static getConfigurationStatus(): {
    configured: boolean;
    message: string;
    instructions?: string[];
  } {
    const configured = this.isConfigured();
    
    if (configured) {
      return {
        configured: true,
        message: 'Vertex AI Imagen is configured and ready to use',
      };
    }

    return {
      configured: false,
      message: 'Vertex AI Imagen is not configured',
      instructions: [
        '1. Get your Vertex AI API key from Google Cloud Console',
        '2. Enable Vertex AI API for your project',
        '3. Add NEXT_PUBLIC_VERTEX_API_KEY to your .env.local file',
        '4. Add NEXT_PUBLIC_GCP_PROJECT_ID to your .env.local file',
        '5. Restart your development server',
      ],
    };
  }
}

/**
 * POST /api/art/generate-image
 * Generate images using Vertex AI Imagen
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, negativePrompt, aspectRatio, numberOfImages, type } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }

    // Vertex AI Imagen API configuration
    const apiKey = process.env.NEXT_PUBLIC_VERTEX_API_KEY;
    const projectId = process.env.NEXT_PUBLIC_GCP_PROJECT_ID;
    const location = process.env.NEXT_PUBLIC_VERTEX_LOCATION || 'us-central1';

    if (!apiKey || !projectId) {
      return NextResponse.json(
        {
          error: 'Vertex AI not configured',
          message: 'Please configure NEXT_PUBLIC_VERTEX_API_KEY and NEXT_PUBLIC_GCP_PROJECT_ID in your environment variables',
        },
        { status: 503 }
      );
    }

    // Construct API endpoint
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration:predict`;

    // Prepare request payload
    const payload = {
      instances: [
        {
          prompt: prompt,
        }
      ],
      parameters: {
        sampleCount: numberOfImages || 1,
        aspectRatio: aspectRatio || '1:1',
        negativePrompt: negativePrompt || '',
      }
    };

    // Call Vertex AI Imagen
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
      console.error('Vertex AI error:', errorData);
      
      return NextResponse.json(
        {
          error: 'Image generation failed',
          message: errorData.error?.message || `API returned ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract generated images
    const images = [];
    if (data.predictions && Array.isArray(data.predictions)) {
      for (const prediction of data.predictions) {
        if (prediction.bytesBase64Encoded) {
          images.push({
            imageData: `data:image/png;base64,${prediction.bytesBase64Encoded}`,
            prompt: prompt,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      images,
      model: 'imagen-3.0-generate-001',
      type: type || 'general',
    });

  } catch (error: any) {
    console.error('Image generation error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message || 'Failed to generate image',
      },
      { status: 500 }
    );
  }
}

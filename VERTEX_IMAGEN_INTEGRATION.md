# Vertex AI Imagen Integration Guide

## Overview

The Aura Nova platform now includes AI-powered image generation using Google's Vertex AI Imagen model. This feature enables you to generate:
- Game sprites and sprite sheets
- Background images
- Character designs
- General artwork

## Setup Instructions

### 1. Prerequisites

- Google Cloud Platform account
- Active GCP project with billing enabled
- Vertex AI API enabled

### 2. Enable Vertex AI

```bash
# Enable the Vertex AI API
gcloud services enable aiplatform.googleapis.com --project=YOUR_PROJECT_ID
```

Or visit: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com

### 3. Get Your API Key

1. Go to [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. (Recommended) Restrict the key to Vertex AI API only

### 4. Configure Environment Variables

Create or edit `web_platform/frontend/.env.local`:

```bash
# Required for Vertex AI Imagen
NEXT_PUBLIC_VERTEX_API_KEY=your_vertex_api_key_here
NEXT_PUBLIC_GCP_PROJECT_ID=your_gcp_project_id
NEXT_PUBLIC_VERTEX_LOCATION=us-central1
```

### 5. Restart Development Server

```bash
cd web_platform/frontend
npm run dev
```

## Usage

### Using the React Hook

```typescript
import { useImageGeneration } from '@/hooks/useImageGeneration';

function MyComponent() {
  const { generating, generateImage, result, error } = useImageGeneration();

  const handleGenerate = async () => {
    const result = await generateImage({
      prompt: 'A fantasy castle on a floating island',
      aspectRatio: '16:9',
      numberOfImages: 1,
    });
    
    if (result.success) {
      console.log('Generated images:', result.images);
    }
  };

  return (
    <button onClick={handleGenerate} disabled={generating}>
      {generating ? 'Generating...' : 'Generate Image'}
    </button>
  );
}
```

### Specialized Generation Functions

```typescript
// Generate a sprite sheet
const spriteResult = await generateSprite('wizard character', 4);

// Generate a background
const bgResult = await generateBackground('forest at sunset', '16:9');

// Generate a character
const charResult = await generateCharacter('cyberpunk warrior');
```

### Using the Service Directly

```typescript
import { VertexImagenService } from '@/services/vertexImagenService';

const result = await VertexImagenService.generateImage({
  prompt: 'A magical sword',
  aspectRatio: '1:1',
  numberOfImages: 1,
  negativePrompt: 'blurry, low quality',
});
```

## API Endpoint

### POST /api/art/generate-image

Generate images using Vertex AI Imagen.

**Request Body:**
```json
{
  "prompt": "A fantasy castle on a floating island",
  "negativePrompt": "blurry, low quality",
  "aspectRatio": "16:9",
  "numberOfImages": 1,
  "type": "background"
}
```

**Response:**
```json
{
  "success": true,
  "images": [
    {
      "imageData": "data:image/png;base64,...",
      "prompt": "A fantasy castle on a floating island"
    }
  ],
  "model": "imagen-3.0-generate-001"
}
```

## Pricing

Vertex AI Imagen charges per generated image. Approximate costs:
- ~$0.02 per image generated
- Higher resolution images may cost more

Monitor your usage in the [Google Cloud Console](https://console.cloud.google.com/billing).

## Features

### Supported Aspect Ratios
- `1:1` - Square (default)
- `16:9` - Widescreen landscape
- `9:16` - Vertical portrait
- `4:3` - Standard landscape
- `3:4` - Standard portrait

### Image Types
- `sprite` - Game sprites and sprite sheets
- `background` - Environment backgrounds
- `character` - Character designs
- `general` - General artwork

### Parameters
- `prompt` (required) - Description of what to generate
- `negativePrompt` (optional) - What to avoid in the image
- `aspectRatio` (optional) - Image dimensions
- `numberOfImages` (optional) - How many variations to generate (default: 1)
- `seed` (optional) - For reproducible results

## Troubleshooting

### "Vertex AI not configured" error

Make sure you have:
1. Set `NEXT_PUBLIC_VERTEX_API_KEY` in `.env.local`
2. Set `NEXT_PUBLIC_GCP_PROJECT_ID` in `.env.local`
3. Restarted your development server

### API errors

Check that:
1. Vertex AI API is enabled for your project
2. Your API key has permission to access Vertex AI
3. Your GCP project has billing enabled
4. Your project ID is correct

### Generation failures

Common issues:
- Prompt violates content policy (adjust your prompt)
- API quota exceeded (check GCP console)
- Invalid aspect ratio (use supported ratios)

## Example Integration

Here's a complete example of integrating image generation into an art creation page:

```typescript
'use client';

import { useState } from 'react';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export default function ArtGenerator() {
  const [prompt, setPrompt] = useState('');
  const { generating, generateImage, result } = useImageGeneration();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a description');
      return;
    }

    const toastId = toast.loading('Generating image...');
    
    const result = await generateImage({
      prompt,
      aspectRatio: '1:1',
    });

    if (result.success) {
      toast.success('Image generated!', { id: toastId });
    } else {
      toast.error(result.error || 'Generation failed', { id: toastId });
    }
  };

  return (
    <div className="space-y-4">
      <Input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe what you want to create..."
      />
      
      <Button onClick={handleGenerate} disabled={generating}>
        {generating ? 'Generating...' : 'Generate Image'}
      </Button>

      {result?.images && result.images.map((img, i) => (
        <img key={i} src={img.imageData} alt={img.prompt} />
      ))}
    </div>
  );
}
```

## Cost Considerations

Your $1200/week investment in Vertex AI provides significant image generation capacity:
- Approximately 60,000 images per week at $0.02/image
- ~8,500 images per day
- Enables unlimited creative possibilities for your platform

## Support

For issues with:
- **Vertex AI API**: https://cloud.google.com/vertex-ai/docs/support
- **This Integration**: Check the code in `src/services/vertexImagenService.ts`
- **Billing Questions**: https://console.cloud.google.com/billing

## Next Steps

1. Configure your credentials
2. Test with simple prompts
3. Integrate into your art creation workflows
4. Experiment with different prompts and parameters
5. Build amazing AI-powered features!

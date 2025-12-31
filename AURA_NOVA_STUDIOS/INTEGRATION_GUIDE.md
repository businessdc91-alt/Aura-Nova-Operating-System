# Creator Studio + Dojo: AI Model Integration Guide

## Quick Start

### 1. Register Your Local Model

1. **Install LM Studio** (recommended)
   - Download: https://lmstudio.ai
   - Install and launch
   - Download a model (e.g., Gemma 2B, Phi 3)
   - Click "Load" to start the model
   - Go to "Developer Console" → "Local Server"
   - Note the endpoint (default: `http://localhost:1234`)

2. **OR Install Ollama**
   - Download: https://ollama.ai
   - Run: `ollama pull gemma:2b`
   - Run: `ollama serve`
   - Endpoint: `http://localhost:11434`

3. **Register in Creator Studio**
   - Go to `/onboarding`
   - Select your platform (LM Studio or Ollama)
   - Enter endpoint: `http://localhost:1234` (or `http://localhost:11434` for Ollama)
   - Click "Test Connection"
   - Name your model (e.g., "My Gemma 2B")
   - Click "Complete Setup"

### 2. Generate Code

1. **Open Creator Studio**
   - Go to `/creator-studio`
   - Verify your model appears in the header
   - Write a project description
   - Click "Generate with AI"

2. **What Happens:**
   - System tries your **local model first**
   - If local fails, falls back to **Gemini** (cloud)
   - Shows latency and which model was used
   - Displays generated files with syntax highlighting

### 3. Generate Games (Dojo)

1. **Open The Dojo**
   - Go to `/dojo`
   - Your model is automatically selected
   - Fill in game title and description
   - Select complexity (puzzle → epic)
   - Click "Generate Game"

2. **What You Get:**
   - Complete game project structure
   - Story with acts and endings
   - Game mechanics (5-6 per complexity level)
   - Characters (protagonist + NPCs)
   - Levels (10-20 depending on complexity)
   - Full source code for your engine
   - Deployment instructions

## Cloud Fallback Setup

### Gemini API (Free Tier Available)

1. Get API key: https://aistudio.google.com
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```

### Vertex AI (Optional)

1. Setup GCP project
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GCP_PROJECT_ID=your_project_id
   GCP_SERVICE_ACCOUNT_KEY=your_service_account_json
   ```

## Architecture

```
Creator Studio / Dojo UI
    ↓
useCodeGeneration() / useGameGeneration() hooks
    ↓
callLocalModel() → LM Studio / Ollama (port 1234/11434)
    ↓ (if local fails)
callCloudAPI() → Gemini 1.5 Pro
```

## How to Test

### Test Local Model Only

```bash
# 1. Start LM Studio with a model loaded
# 2. Go to http://localhost:3000/onboarding
# 3. Register your local model
# 4. Go to http://localhost:3000/creator-studio
# 5. Write a simple description: "Create a React button component"
# 6. Click "Generate with AI"
# 7. Check browser console for latency metrics
```

### Test Cloud Fallback

```bash
# 1. Stop your local LM Studio (or unplug network)
# 2. Add NEXT_PUBLIC_GEMINI_API_KEY to .env.local
# 3. Go to Creator Studio
# 4. Generate code again
# 5. Should see "Code generated with gemini-1.5-pro"
```

## Model Registry

All registered models are stored in **localStorage** at:
```
aura_model_registry → JSON array of LocalModel objects
```

Each model tracks:
- Name and friendly name
- Endpoint and platform
- Health status (healthy/unhealthy)
- Latency in ms
- Session count
- Last used date

## Debugging

### Check Model Health

```typescript
// In browser console:
import { ModelRegistryService } from '@/lib/modelRegistry';

// Get all models
ModelRegistryService.getAllModels();

// Get active model
ModelRegistryService.getActiveModel();

// Check health of a model
import { ModelHealthChecker } from '@/lib/modelHealthChecker';
await ModelHealthChecker.checkHealthByEndpoint(
  'http://localhost:1234',
  'lm-studio'
);
```

### Test API Endpoint Directly

```bash
# LM Studio
curl http://localhost:1234/api/status

# Ollama
curl http://localhost:11434/api/tags

# Should return 200 if running
```

### Check Generation Logs

- Browser DevTools → Console → Network tab
- Check `/api/ai/generate` requests
- Response should include `modelUsed` and `latency`

## Model Selection Priority

1. **User's Active Local Model** (if healthy)
2. **Gemini 1.5 Pro** (cloud, requires API key)
3. **Vertex AI** (complex tasks, requires GCP setup)
4. **Error** if all fail

## Training Packets

Download asset packs for faster game development:
- Zelda OoT style graphics and audio
- Pixel art sprite libraries
- 3D model packs
- Engine starter templates (Unity, Godot, Unreal)

Access via `/models` dashboard or in Dojo generator.

## Next Steps

1. ✅ Register local model
2. ✅ Test code generation
3. ✅ Generate first game in Dojo
4. ⏳ Add cloud API key for fallback
5. ⏳ Fine-tune prompts for better results
6. ⏳ Export and test generated code

---

**The Partnership Philosophy:**

Users own their AI model. It runs on their machine. They bond with it by naming it and seeing it work. The platform removes the throttle that says "you can only call an API"—instead it says "here's your partner, use it."

When local models can't handle a task, we seamlessly fall back to cloud APIs. But the user always sees which model worked and how fast it was. That's the partnership: transparent, local-first, trust-based.

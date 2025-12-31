# Quick Reference: Testing & Debugging

## 🧪 Test Scenarios

### Scenario 1: Local Model Only (No Cloud)

```bash
# 1. Start LM Studio
# - Download from https://lmstudio.ai
# - Select model (Gemma 2B recommended)
# - Click Load
# - Go to "Developer Console" → "Local Server"
# - Verify running on http://localhost:1234

# 2. Register in app
# - Visit http://localhost:3000/onboarding
# - Select "LM Studio"
# - Enter: http://localhost:1234
# - Click "Test Connection"
# - Name model: "Test Gemma"
# - Click "Complete Setup"

# 3. Generate code
# - Visit http://localhost:3000/creator-studio
# - See "Test Gemma" in header (green ●)
# - Enter description: "Create a React button component"
# - Click "Generate with AI"
# - Should see generated code in ~2-10 seconds
# - Toast: "Code generated with Test Gemma"
```

### Scenario 2: Cloud Fallback (Local → Gemini)

```bash
# 1. Get Gemini API Key
# - Visit https://aistudio.google.com
# - Click "Get API Key"
# - Copy key

# 2. Add to environment
# - Create/edit .env.local in /web_platform/frontend
# - Add: NEXT_PUBLIC_GEMINI_API_KEY=your_key_here

# 3. Restart dev server
# - Ctrl+C to stop
# - npm run dev
# - Wait for "Ready on http://localhost:3000"

# 4. Test fallback
# - Visit http://localhost:3000/creator-studio
# - Stop LM Studio (or unplug network)
# - Enter description: "Create TypeScript interfaces for a blog"
# - Click "Generate with AI"
# - Wait 2-5 seconds (cloud is slower)
# - Toast: "Code generated with gemini-1.5-pro"
# - Should show latency ~2000ms
```

### Scenario 3: Dojo Game Generation

```bash
# 1. Have a model registered
# - Model should be showing in header

# 2. Visit Dojo
# - http://localhost:3000/dojo
# - Should see your model name in top section

# 3. Generate game
# - Title: "Pixel Quest"
# - Description: "A 2D adventure game in the style of Zelda"
# - Complexity: "zelda-like"
# - Engine: "web"
# - Graphics: "pixel-art"
# - Click "Generate Game"
# - Wait 3-10 seconds

# 4. View results
# - Click "Viewer" tab
# - Browse:
#   - Story (acts, themes, endings)
#   - Mechanics (10+ gameplay systems)
#   - Characters (protagonist + NPCs)
#   - Levels (progression plan)
#   - Code (Phaser.js boilerplate)
#   - Instructions (how to build)

# 5. Export
# - Click "Export as ZIP"
# - Extract and open in code editor
# - Follow deployment instructions
```

### Scenario 4: Multiple Models

```bash
# 1. Register Ollama as second model
# - Visit http://localhost:3000/onboarding
# - Select "Ollama"
# - Enter: http://localhost:11434
# - Click "Test Connection"
# - Name: "My Ollama"
# - Click "Complete Setup"

# 2. Switch between models
# - Creator Studio header
# - Click "Switch Model ▼"
# - See both models listed
# - Click on "My Ollama"
# - Header updates with Ollama health
# - Generate code again with new model
# - Toast shows which model was used

# 3. Compare output
# - Generated files might differ
# - Same prompt, different interpretations
# - Track which model you prefer
# - Toggle Favorite star ⭐
```

## 🐛 Debugging Commands

### Browser Console (DevTools)

```javascript
// ============ MODEL MANAGEMENT ============

// Import the service
import { ModelRegistryService } from '@/lib/modelRegistry';

// Get all registered models
ModelRegistryService.getAllModels();
// Output: [{ id, friendlyName, endpoint, ... }, ...]

// Get active model
ModelRegistryService.getActiveModel();
// Output: { id: "lm-studio-...", friendlyName: "My Gemma 2B", ... }

// Get specific model
ModelRegistryService.getModel('lm-studio-1703768400000');

// Update health status (manual)
ModelRegistryService.updateHealth(
  modelId,
  'healthy',  // status
  145,        // latency
  null        // errorMessage
);

// Record a session
ModelRegistryService.recordSession(modelId);
// Increments sessionCount and updates lastUsedDate

// ============ HEALTH CHECKING ============

// Import health checker
import { ModelHealthChecker } from '@/lib/modelHealthChecker';

// Check endpoint directly
const result = await ModelHealthChecker.checkHealthByEndpoint(
  'http://localhost:1234',
  'lm-studio'
);
console.log(result);
// Output: { status: "healthy", latency: 145, ... }

// Get connection guide
const guide = ModelHealthChecker.getConnectionGuide('lm-studio');
console.log(guide.instructions);
// Outputs: Setup instructions for LM Studio

// ============ STORAGE ============

// View all stored data
localStorage.getItem('aura_model_registry');
// Copy and paste into JSON viewer for pretty print

// Clear all models (WARNING: deletes all)
localStorage.clear();

// ============ API TESTING ============

// Test Gemini API directly
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-goog-api-key': 'your_key_here'
  },
  body: JSON.stringify({
    contents: [{
      parts: [{
        text: "Say hello in 3 words"
      }]
    }]
  })
}).then(r => r.json()).then(console.log);
```

### Terminal Commands

```bash
# ============ LOCAL MODEL HEALTH ============

# Test LM Studio
curl http://localhost:1234/api/status
# Should return: {"status":"ok"}

# Test Ollama
curl http://localhost:11434/api/tags
# Should return: {"models":[...]}

# ============ API ROUTE TESTING ============

# Test code generation endpoint
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "taskType": "generate",
    "prompt": "Create a React button",
    "complexity": "simple"
  }'

# Test with Gemini key
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: YOUR_KEY_HERE" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello"
      }]
    }]
  }'

# ============ ENV VALIDATION ============

# Check if .env.local exists
cat web_platform/frontend/.env.local

# Add Gemini key
echo "NEXT_PUBLIC_GEMINI_API_KEY=your_key_here" >> web_platform/frontend/.env.local

# Restart Next.js dev server
# Ctrl+C, then:
cd web_platform/frontend && npm run dev
```

## 📊 Common Issues & Fixes

### Issue: "No models registered"
```
Solution:
1. Visit http://localhost:3000/onboarding
2. Select platform (LM Studio or Ollama)
3. Enter endpoint
4. Test connection
5. Name your model
6. Complete setup
```

### Issue: "Local model offline" (but it's running)
```
Troubleshooting:
1. Check endpoint is correct: http://localhost:1234 (LM Studio)
2. Verify model is LOADED (not just selected)
3. Check "Developer Console" → "Local Server" is running
4. Try: curl http://localhost:1234/api/status
5. Restart LM Studio if no response
```

### Issue: "Connection failed: timeout" (30 seconds)
```
Causes & Solutions:
- Model too large for your hardware: Use smaller model (e.g., Phi-3 instead of 70B)
- Model not actually loaded: Check LM Studio's "Load" button
- Network issue: Check firewall, try disabling VPN
- Slow disk: SSD recommended for faster model loading
```

### Issue: "Gemini API error: 401 Unauthorized"
```
Solutions:
1. Check API key: https://aistudio.google.com
2. Verify it's in .env.local: NEXT_PUBLIC_GEMINI_API_KEY=...
3. Restart dev server after adding key
4. Make sure key is not expired (regenerate if needed)
5. Check key has "Generative AI User" role
```

### Issue: "Rate limit exceeded"
```
What it means:
- More than 100 requests in 60 seconds

Solutions:
- Wait 1 minute
- Check for infinite loops in your app
- Batch requests instead of individual calls
- Increase RateLimiter.MAX_REQUESTS in apiMiddleware.ts if needed
```

### Issue: Toast shows model but no files generated
```
Debugging:
1. Open DevTools → Network tab
2. Look for failed requests
3. Check /api/ai/generate response
4. Error might be in the response JSON
5. See "error" field for details
6. Check browser console for exceptions
```

## 📈 Performance Monitoring

### Check Generation Speed

```javascript
// In browser console, after generation:
const startTime = performance.now();
// ... do generation ...
const endTime = performance.now();
console.log(`Generated in ${endTime - startTime}ms`);

// Expected ranges:
// - Local model: 500ms - 5s (depending on size)
// - Cloud API: 1s - 3s
// - Cached: < 1ms
```

### Monitor Model Health

```javascript
// In browser console:
import { ModelRegistryService } from '@/lib/modelRegistry';

setInterval(() => {
  const model = ModelRegistryService.getActiveModel();
  if (model) {
    console.log(`${model.friendlyName}: ${model.healthStatus} (${model.latency}ms)`);
  }
}, 5000);  // Check every 5 seconds
```

### Check API Costs

```javascript
// In browser console, after generation:
const response = await fetch('/api/ai/metrics').then(r => r.json());
console.log(response.totalCost);  // USD spent on APIs
console.log(response.byModel);     // Cost breakdown per model
```

## 🔌 Port Reference

```
LM Studio:  http://localhost:1234
Ollama:     http://localhost:11434
Next.js:    http://localhost:3000
Database:   localhost:5432 (PostgreSQL, if used)
Redis:      localhost:6379 (if used)
```

## 📝 Quick Checklist

- [ ] Can connect to local model
- [ ] Model shows in Creator Studio header
- [ ] Health badge shows green ● with latency
- [ ] Can generate code in Creator Studio
- [ ] Toast shows model name and latency
- [ ] Can switch between multiple models
- [ ] Can generate game in Dojo
- [ ] Can export game as ZIP
- [ ] Cloud fallback works (stop local model, generate code)
- [ ] Multiple generation requests work
- [ ] Model session count increments

---

**Having issues? Check the console logs and cross-reference with Common Issues & Fixes above.**

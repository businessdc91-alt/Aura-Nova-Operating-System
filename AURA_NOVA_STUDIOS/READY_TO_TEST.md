# 🧪 READY TO TEST NOW

## Your Fully Integrated AI Partnership Platform

Everything is coded, typed, integrated, and documented. Here's what to test:

---

## 🎬 Test #1: Register a Local Model (5 minutes)

### What you need:
- LM Studio installed (https://lmstudio.ai)
- A model loaded in LM Studio (Gemma 2B recommended)
- Local server running (port 1234)

### Steps:
```
1. Open LM Studio
2. Select a model (e.g., Gemma 2B)
3. Click "Load"
4. Go to "Developer Console" → "Local Server"
5. Verify it says "Server is running at http://localhost:1234"

6. In browser: http://localhost:3000/onboarding
7. Click "LM Studio"
8. Enter: http://localhost:1234
9. Click "Test Connection" (should show ✓ after 2-3 seconds)
10. Name your model: "My Gemma 2B"
11. Click "Complete Setup"
```

### Expected Result:
✅ Model registered and saved to localStorage

---

## 🎬 Test #2: See Model in Creator Studio Header (2 minutes)

### Steps:
```
1. Go to: http://localhost:3000/creator-studio
2. Look at top-right of header
3. Should see: [Monitor] My Gemma 2B
                          ● 145ms
```

### Expected Result:
✅ Green dot (healthy), shows latency in milliseconds

---

## 🎬 Test #3: Generate Code with Local Model (5 minutes)

### Steps:
```
1. Still in Creator Studio
2. In left pane, under description box
3. Type: "Create a React component for a button with click handling"
4. Make sure "react" is selected as framework
5. Click "Generate with AI" button
6. Wait... (should take 2-10 seconds depending on model size)
```

### Expected Result:
✅ Code appears in right pane
✅ Toast shows: "Code generated with My Gemma 2B in [X]ms"
✅ Multiple files displayed (main.tsx, tests, types)
✅ Session count increments (check /models dashboard)

---

## 🎬 Test #4: Cloud Fallback (10 minutes)

### What you need:
- Gemini API key (https://aistudio.google.com, free tier available)
- `.env.local` file in `/web_platform/frontend`

### Setup:
```bash
# Create or edit: web_platform/frontend/.env.local
# Add this line:
NEXT_PUBLIC_GEMINI_API_KEY=your_key_from_aistudio_google_com
```

### Steps:
```
1. Restart dev server (Ctrl+C, npm run dev)
2. Wait for "Ready on http://localhost:3000"
3. Go to Creator Studio
4. Stop your LM Studio (or unplug network)
5. Try to generate code again
6. Wait 2-5 seconds (cloud is slower)
```

### Expected Result:
✅ Code still generates (without local model!)
✅ Toast shows: "Code generated with gemini-1.5-pro in [X]ms"
✅ Latency is higher (~1500-3000ms) because cloud is remote
✅ Files are still properly formatted

---

## 🎬 Test #5: Switch Models (2 minutes)

### Setup:
- Have LM Studio model registered
- Optionally: Install Ollama for a second model

### Steps (if you have 2 models):
```
1. Go to Creator Studio
2. Click "Switch Model ▼" button (top right)
3. See list of registered models
4. Click on second model
5. Header updates to show new model
6. Generate code again
7. Toast shows which model was used
```

### Expected Result:
✅ Can switch between models
✅ Different models might generate different code
✅ Both show their latency
✅ Session count increments for each model

---

## 🎬 Test #6: Dojo Game Generation (5 minutes)

### Steps:
```
1. Go to: http://localhost:3000/dojo
2. In "Generator" tab, fill out:
   - Title: "Pixel Quest"
   - Description: "An adventure game in the style of Zelda"
   - Complexity: "zelda-like"
   - Engine: "web"
   - Graphics: "pixel-art"
3. Click "Generate Game"
4. Wait 3-10 seconds
```

### Expected Result:
✅ Game project generates
✅ Click "Viewer" tab
✅ See sections: Story, Mechanics, Characters, Levels, Code
✅ Each section has generated content
✅ Code shows Phaser.js boilerplate

---

## 🔍 Debugging: View Model Data

### In Browser Console:
```javascript
// Get all registered models
import { ModelRegistryService } from '@/lib/modelRegistry';
ModelRegistryService.getAllModels();

// Get active model
ModelRegistryService.getActiveModel();

// Check model health
import { ModelHealthChecker } from '@/lib/modelHealthChecker';
await ModelHealthChecker.checkHealthByEndpoint('http://localhost:1234', 'lm-studio');
```

---

## 📊 What to Look For

### Success Indicators ✅

- [ ] Header shows your model name and health status
- [ ] Health status updates every 30 seconds (try refreshing page)
- [ ] Green dot (●) when model is healthy
- [ ] Can generate code in under 5 seconds with local model
- [ ] Can see latency in milliseconds in toast
- [ ] Model name shown: "generated with [YourModel]"
- [ ] Session count increments (go to /models dashboard)
- [ ] Files have syntax highlighting
- [ ] Can switch between models
- [ ] Dojo generates full game projects
- [ ] Cloud fallback works without local model

### Potential Issues 🐛

| Issue | Solution |
|-------|----------|
| Model not showing in header | Check if model is registered in localStorage |
| "Connection failed" | Verify LM Studio is running on localhost:1234 |
| Timeout error | Model might be too large, try smaller model |
| No code generated | Check browser console for errors |
| Gemini API fails | Verify API key in .env.local, restart server |
| Health check slow | Model taking time to respond, normal for large models |

---

## 📁 Key Files You're Testing

```
src/app/creator-studio/page.tsx
├─ CreatorStudioHeader (new)
├─ uses useModelRegistry() (new)
└─ uses useCodeGeneration() (new)

src/hooks/useCodeGeneration.ts (new)
├─ callLocalModel() → LM Studio / Ollama
└─ callCloudAPI() → Gemini (fallback)

src/lib/useModelManagement.ts (updated)
├─ useModelRegistry()
├─ useModelHealth()
└─ useActiveModel()

src/app/api/ai/generate/route.ts
└─ Routes to selectModel() → callGeminiAPI()
```

---

## ⏱️ Time Estimates

| Test | Time |
|------|------|
| Register model | 5 min |
| See in header | 2 min |
| Generate code (local) | 5 min |
| Cloud fallback setup | 5 min |
| Cloud fallback test | 5 min |
| Switch models | 2 min |
| Dojo generation | 5 min |
| **Total** | **~30 min** |

---

## 📍 URLs to Test

```
http://localhost:3000/onboarding          ← Register new models
http://localhost:3000/creator-studio      ← Generate code
http://localhost:3000/dojo                ← Generate games
http://localhost:3000/models              ← Manage models
http://localhost:3000/chat                ← (Other features)
```

---

## 🎯 Success = You See This

```
Visit /creator-studio
┌─────────────────────────────────────────────┐
│ Creator Studio │ My Gemma 2B  │ Switch ▼ │  │
│                │ ● 145ms      │ Dashboard   │
├─────────────────────────────────────────────┤
│ Project Name: MyProject                     │
│ Description: Create a React button...       │
│ Framework: React ✓                          │
│                                             │
│ [Generate with AI]                          │
└─────────────────────────────────────────────┘
                    ↓
            (After clicking)
                    ↓
✓ Code generated with My Gemma 2B in 234ms
  ├─ MyProject.tsx
  ├─ MyProject.test.tsx
  └─ MyProject.types.ts
  
  [Syntax highlighted code displayed]
  [Copy] [Download]
```

---

## 🚀 You're Ready!

Everything is built, wired up, and waiting for you to test it.

**Start with Test #1:** Register a local model and watch it generate code.

The partnership is now real. Not theoretical. **Actually working code.**

Enjoy! 🎉

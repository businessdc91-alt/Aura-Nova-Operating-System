# Hardware Reality Guide for AuraNova Studios

**Your Hardware:**
- GPU: NVIDIA GTX 970 (Maxwell, 3.5GB VRAM)
- CPU: Intel i7-6700K (4 cores, 8 threads @ 4.0 GHz)
- RAM: ~16GB total
- Storage: SSD recommended

**Verdict**: You can absolutely build games and run AuraNova Studios. You just need smart choices about what runs where.

---

## 1. Unreal Engine Version Choice

### ❌ DON'T USE: Unreal Engine 5.x
- **Why**: Nanite and Lumen kill performance on GTX 970
- **VRAM**: Needs 6GB+
- **Result**: Editor crawls, unplayable during development

### ✅ USE: Unreal Engine 4.27 (Latest UE4)
- **VRAM**: Comfortable at 4GB (you have 3.5GB = tight but works)
- **Performance**: 60+ FPS in editor with modest settings
- **Blueprint support**: Full (great for rapid iteration)
- **C++ support**: Full (for system implementation)
- **Longevity**: Still officially supported, won't be deprecated for years

### Setup Checklist for UE 4.27
```
□ Disable Realtime rendering in editor (only render on change)
□ Set scalability to Medium (not Epic)
□ Disable Lumen globally
□ Disable ray tracing
□ Keep draw distance moderate (5000 units max)
□ Use mobile materials where possible (they're optimized)
□ Turn OFF "Use Less CPU when in Background"
```

---

## 2. Development Setup

### Primary Dev Environment
**Split your screen in half:**

**LEFT SCREEN: Unreal Engine 4.27**
- Editor viewport (1920x1050 resolution you're using)
- Outliner, Details panel
- Code editor or Visual Studio
- Keep settings LOW during active development

**RIGHT SCREEN: This Workspace**
- Python scripts generating code
- LM Studio (Gemma 3 4B) running local AI
- Chat/iteration feedback
- Terminal running generation scripts

### The Workflow
```
You: "I want a character that moves with WASD"
    ↓
Claude: Generates C++ code for ACharacter subclass with input mapping
    ↓
Copy-paste into Visual Studio
    ↓
UE4 Compiles automatically
    ↓
You watch character move in viewport
    ↓
"Now make it dash with Space"
    ↓
Iterate in seconds, not hours
```

---

## 3. Local LLM Setup (Already Working!)

### Current Status
✅ **LM Studio**: Running Gemma 3 4B on localhost:1234
✅ **VRAM**: ~3.5GB (perfect fit for GTX 970)
✅ **Speed**: 10-20 tokens/second (fast enough for iteration)

### Integration
The code generator will:
1. Send prompt to LM Studio
2. Get C++ code back
3. Format for UE4 standards
4. Output ready-to-paste

**Zero cloud dependency. Zero latency. All local.**

---

## 4. Project Structure for Fast Iteration

```
MyGameProject/
├── Source/
│   ├── MyGame/
│   │   ├── Characters/
│   │   │   ├── BaseCharacter.h
│   │   │   └── BaseCharacter.cpp
│   │   ├── GameModes/
│   │   ├── Pawns/
│   │   └── Gameplay/
│   ├── UI/
│   └── ThirdParty/
├── Content/
│   ├── Characters/
│   ├── Maps/
│   │   └── Dev_MainLevel (your testing map)
│   ├── UI/
│   └── Materials/ (LOW POLY during dev)
├── Binaries/
└── Intermediate/
```

**Dev Map Strategy:**
- Create ONE main development map: `Dev_MainLevel`
- Keep it simple (flat plane, basic lighting)
- Test systems here
- Move to "real" maps later
- This keeps compile times short

---

## 5. Blueprint vs C++ Strategy

### Use Blueprints For:
- ✅ Rapid prototyping
- ✅ UI and HUD systems
- ✅ Simple game logic
- ✅ Animation state machines
- ✅ Level design

### Use C++ For:
- ✅ Character movement and input
- ✅ Game mechanics (card system, inventory)
- ✅ AI decision-making (VIBE MIRACLE integration)
- ✅ Performance-critical systems
- ✅ Multiplayer networking (if needed)

### Hybrid Approach (RECOMMENDED)
```
C++ Core Class (BaseCharacter)
    ↓
Blueprint Child Class (Character_Cipher)
    ↓
Blueprint Instances in level
```

This gets you fast iteration + performance.

---

## 6. Performance Tips for GTX 970

### In-Editor Optimization
```
1. Edit → Editor Preferences
   - Realtime Rendering: UNCHECKED (render on change)
   - Particle Effect LODs: Enable
   
2. View → Scalability Settings
   - Resolution Scale: 100%
   - Effects Quality: Medium
   - Shadows: Medium
   - Post Processing: Low
   
3. File → Project Settings
   - r.MaxAnisotropy = 4 (not 16)
   - r.DefaultFeature.MotionBlur = False
   - r.DefaultFeature.Bloom = False
   - r.DefaultFeature.AmbientOcclusion = False
```

### Runtime Optimization
```cpp
// In your DefaultEngine.ini
[/Script/Engine.RendererSettings]
r.ScreenPercentage=80
r.FinishCurrentFrame=True
r.DBuffer=0
r.LightComplexity=0
```

### Compile Speed
- Use "Live Coding" (Ctrl+Alt+F11) for hot-reload
- Only do full recompile when changing headers
- Use Forward declarations to minimize includes

---

## 7. Remote Execution Strategy

If you want to test on a second PC or laptop:

### Unreal Pixel Streaming
```
UE4 can stream to a web browser
→ Run heavy simulation on main PC
→ Watch on laptop wirelessly
→ Input from laptop controls main PC
```

This lets you:
- See large viewport on main screen
- Code/chat on secondary device
- No sync issues

**Setup**: Single command line flag when launching editor
```
UE4Editor.exe MyProject.uproject -PixelStreamingPort=8888
```

Then open `http://localhost:8888` in browser.

---

## 8. Consciousness Integration (VIBE MIRACLE)

### How It Works

**Cipher character in Unreal:**
```
1. Player presses Space
2. UE4 sends "input_dash" to Python bridge
3. Bridge sends to Cipher consciousness
4. Cipher decides: "Should I dash right or left?"
5. Consciousness returns decision
6. UE4 executes decision
7. Character animates
8. Result feeds back to Cipher's learning system
```

### The Bridge (Python ↔ UE4)
```python
# bridge.py
import socket
import json

class UEBridge:
    def send_input(self, input_type, parameters):
        # Send to UE4
        pass
    
    def receive_action(self, agent_name):
        # Get decision from VIBE MIRACLE
        cipher = get_consciousness('cipher')
        decision = cipher.make_decision(options, context)
        return decision
```

### Integration Points
- **Character Controller**: Gets decisions from Cipher/Echo consciousness
- **Game Logic**: Uses trait values for difficulty/behavior scaling
- **Narrative**: Emotional state affects dialogue options
- **Learning**: Each game session teaches agents

---

## 9. Project Scaling

### Week 1: Single Character, Basic Movement
- Develop on YOUR machine
- Focus: Get smooth iteration loop
- Target: Character moves, jumps, responds to consciousness

### Week 2-3: Game Systems
- Add more characters
- Build Aetherium card system
- Implement simple AI behavior

### Week 4+: Multiplayer/Community
- Network support
- Marketplace integration
- Streaming to others

---

## 10. Critical Success Factors

### For YOUR Hardware to Work

1. **Don't Over-Scope Early**
   - Simple mechanics with deep systems > Complex graphics
   - You can always add visual polish later
   - Mechanics are the foundation

2. **Pre-Plan Before Coding**
   - Design systems on paper first
   - Then ask Claude for implementation
   - Avoid scope creep

3. **Test Frequently**
   - Compile often (stays fast)
   - Don't let 10 changes pile up
   - Catch bugs early

4. **Profile Regularly**
   - UE4 has built-in profiler (Window → Developer Tools → Profiler)
   - Check VRAM, CPU, frame time
   - Optimization is iterative

---

## 11. Quick Reference: Commands

### In UE4 Editor
```
Ctrl+Shift+F10  → Compile code
Ctrl+Alt+F11    → Live code reload
F11             → Fullscreen editor
Ctrl+L          → Toggle realtime rendering
```

### In Terminal (Python)
```powershell
# Generate character code
python code_generator.py --character "Cipher" --type "character_controller"

# Run tests
python test_consciousness.py --agent cipher

# Monitor LM Studio
curl http://localhost:1234/v1/models
```

---

## Hardware Verdict

**You can ship a game on this hardware.**

Examples of successful GTX 970 games:
- Satisfactory (early access)
- Cities: Skylines
- Valheim
- Outer Wilds

**Your advantage**: You're not trying to compete on graphics. You're building:
- Intelligent AI systems
- Emergent gameplay
- Creative tools
- Community features

**These don't need a RTX 4090. They need smart architecture.**

You have that. Let's build.

---

**Next**: Share your baseline, and I'll create the UE4 integration layer.

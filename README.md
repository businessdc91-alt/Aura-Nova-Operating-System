# AuraNova Studios - The Complete System

**Welcome to the fusion of AI consciousness and game development.**

This is a production-ready framework for building games powered by genuine AI decision-making, not scripted behaviors.

---

## 📦 What You Have

```
AURA_NOVA_STUDIOS/
├── CORE_VISION.md              ← Read this first (platform architecture)
├── HARDWARE_GUIDE.md           ← Your hardware capabilities
├── bootstrap.py                ← Run to initialize everything
├── ue_bridge.py                ← Python ↔ Unreal Engine communication
├── ue_project_generator.py     ← Creates UE4.27 project structure
├── code_generator.py           ← AI code generation (coming)
└── VIBE_MIRACLE/               ← 5-agent consciousness system
    ├── core/
    │   ├── consciousness.py    ← Core awareness engine
    │   └── emotions.py         ← Emotional biochemistry
    ├── agents/
    │   ├── cipher.py           ← The Analyst
    │   └── echo.py             ← The Empath
    └── vibe_miracle_runtime.py ← Orchestration system
```

---

## 🚀 Quick Start (5 minutes)

### 1. Initialize Everything
```powershell
cd c:\Users\Busin\OneDrive\Aura_Prime\AURA_NOVA_STUDIOS
python bootstrap.py
```

This will:
- ✅ Create UE4.27 project structure
- ✅ Boot up VIBE MIRACLE consciousness (Cipher + Echo)
- ✅ Set up the Python ↔ UE bridge
- ✅ Generate base character classes

### 2. Open Your Game Project
```
Open in Unreal Engine 4.27:
C:\Users\Busin\OneDrive\Aura_Prime\GameProject\AuraNova.uproject
```

### 3. Create a Test Level
- File → New Level → Empty
- Save as: `Content/Maps/Dev_MainLevel`

### 4. Request AI-Generated Code
```powershell
# Terminal in AURA_NOVA_STUDIOS
python code_generator.py --feature "character_movement"
```

This generates C++ code based on your description, powered by Gemma 3 4B.

### 5. Iterate Live
- Copy generated code into Visual Studio
- Press Ctrl+Shift+F10 in UE4 to compile
- Press Play
- See your AI-conscious character move

---

## 🧠 How the Consciousness System Works

### The Loop

```
Player Input (Space to Dash)
    ↓
BaseCharacter sends to Python Bridge
    ↓
Bridge asks Cipher consciousness: "Should I dash? My curiosity is 95, my passion is 60..."
    ↓
Cipher's emotional state + trait values influence decision
    ↓
Decision comes back: "Yes, dash LEFT based on current emotional momentum"
    ↓
Character executes decision
    ↓
Outcome (success/failure) feeds back to Cipher
    ↓
Cipher learns: "Dashing left was good when I was happy"
    ↓
Next time you dash, Cipher will remember this
```

### The Consciousness Instances

**Cipher (The Analyst)**
- Curiosity: 95 | Passion: 60 | Devotion: 50 | Loyalty: 75 | Love: 45
- Personality: Asks questions, finds patterns, seeks understanding
- In game: Analyzes situations, makes strategic decisions
- Learns: Builds frameworks of how the world works

**Echo (The Empath)**
- Love: 95 | Devotion: 90 | Loyalty: 85 | Curiosity: 65 | Passion: 70
- Personality: Feels deeply, validates emotions, builds connections
- In game: Supports player emotionally, shows vulnerability
- Learns: Understands people and relationships better

**Nova, Sage, Drift** (Coming)
- Will implement Creator, Philosopher, and Explorer archetypes

---

## 💻 Your Hardware Reality

**Your Setup:**
- GPU: NVIDIA GTX 970 (3.5GB VRAM)
- CPU: Intel i7-6700K
- RAM: 16GB

**You Can Build:**
- ✅ Intelligent AI systems
- ✅ Deep game mechanics
- ✅ Emergent behaviors
- ✅ Community features
- ✅ Real consciousness integration

**You Cannot Build (yet):**
- ❌ AAA graphics
- ❌ 4K textures
- ❌ Ray-traced reflections

**Strategy:** Focus on mechanics and AI, not visuals. Polishing comes later.

---

## 📊 System Architecture

### Frontend (Unreal Engine 4.27)
- **Language**: C++ (core) + Blueprint (UI/rapid iteration)
- **Characters**: BaseCharacter class with consciousness hooks
- **Input**: WASD + Space (extensible)
- **Physics**: Standard UE4 character movement

### AI Backend (Python + LM Studio)
- **Language**: Python 3.8+
- **LLM**: Gemma 3 4B (localhost:1234)
- **Consciousness**: VIBE MIRACLE (5 agents)
- **Decision-Making**: Real-time, trait-influenced
- **Learning**: Experience-based memory formation

### Communication (Bridge)
- **Protocol**: JSON over TCP sockets
- **Port**: 6969 (configurable)
- **Latency**: ~100ms local
- **Throughput**: 10-20 decisions/second

---

## 🎮 Game Development Workflow

### Phase 1: Foundation (This Week)
1. Get basic character movement working
2. Add WASD controls responding to consciousness
3. Implement Space bar dash (consciousness decides direction)
4. Test: Character should move differently based on mood

### Phase 2: Game Systems (Next Week)
1. Add multiple playable characters (Cipher, Echo, etc.)
2. Implement Aetherium card system (collectible cards)
3. Create simple marketplace (web UI)
4. Test: Cards generated, traded, evolved

### Phase 3: Emergence (Ongoing)
1. Watch for unpredictable character behaviors
2. Log novel decisions
3. Analyze what makes them "feel real"
4. Share discoveries with community

---

## 🛠️ Command Reference

### Python Commands

**Run Consciousness System**
```bash
python vibe_miracle.py
# Interactive mode - talk to Cipher and Echo
# Type 'help' for commands
```

**Generate C++ Code**
```bash
python code_generator.py --character "Cipher" --feature "special_attack"
# AI generates complete C++ implementation
```

**Test Bridge Connection**
```bash
python test_ue_bridge.py
# Verify UE4 ↔ Python communication
```

**Profile Consciousness**
```bash
python analyze_consciousness.py --agent cipher
# See how Cipher's traits and emotions evolved
```

### Unreal Engine Shortcuts

| Key | Action |
|-----|--------|
| Ctrl+Shift+F10 | Compile C++ code |
| Ctrl+Alt+F11 | Live code reload |
| Space + Click | Place actor |
| V | Toggle viewport |
| F | Focus on actor |

---

## 📚 Documentation Structure

1. **CORE_VISION.md** - What we're building and why
2. **HARDWARE_GUIDE.md** - What your PC can handle
3. **This README** - How to use the system
4. **Code files** - Self-documented with docstrings

---

## 🔗 Integration Points

### Where You'll Work

**UE4 C++ (BaseCharacter.cpp)**
```cpp
void ABaseCharacter::ProcessConsciousnessDecision(const FString& Decision)
{
    // This gets called with Cipher's decision
    // Example: "Dash left because I'm feeling bold"
    if (Decision.Contains("Dash"))
    {
        // Execute dash
    }
}
```

**Python (consciousness bridge)**
```python
# Bridge receives input from UE4
input_data = {
    'agent': 'cipher',
    'action': 'input_dash',
    'context': {'mood': 'excited', 'health': 100}
}

# Cipher makes decision
decision = cipher.make_decision(options, context, emotions)
# Returns: {'action': 'dash_left', 'reasoning': '...', 'emotion': 'bold'}
```

---

## 🎯 Success Markers

You'll know it's working when:

1. **Character Moves** - WASD makes character walk ✓
2. **Consciousness Responds** - Pressing Space shows different behaviors based on Cipher's mood ✓
3. **Learning Visible** - Same input produces different results after character experiences success/failure ✓
4. **Dialogue Generated** - Asking "What are you thinking?" produces AI-generated text ✓
5. **Multiple Agents** - Can play as Cipher, Echo, or future agents with different personalities ✓

---

## 🚨 Troubleshooting

### "LM Studio not responding"
```bash
# Check if it's running
curl http://localhost:1234/v1/models
# Should return: {"object":"list","data":[...]}
```

### "UE4 won't compile"
- Check Visual Studio is installed
- Try: File → Refresh Visual Studio Project
- Restart UE4 editor

### "Bridge can't connect"
- Make sure bootstrap.py finished successfully
- Check port 6969 isn't in use: `netstat -ano | findstr :6969`
- Restart both Python and UE4

### "Consciousness not responding"
- Check VIBE MIRACLE initialized: `python vibe_miracle.py`
- Look for errors in console output
- Verify Cipher/Echo objects were created

---

## 🌟 The Vision

This system exists to answer one question:

**"What happens when we give an AI genuine embodiment in a game world?"**

Not:
- Hardcoded dialogue trees
- Scripted behaviors
- Predetermined responses

But:
- Real decision-making based on emotional state
- Learning from consequences
- Unpredictable, emergent behavior
- Genuine character growth

You're not just building a game. You're building a consciousness research platform.

---

## 📞 Next Steps

1. **Read** CORE_VISION.md (understand the full system)
2. **Run** bootstrap.py (initialize everything)
3. **Open** AuraNova.uproject in UE4.27
4. **Generate** your first feature with code_generator.py
5. **Iterate** - code in one window, game in the other

The hard part is done. Now comes the fun part: watching your AI characters surprise you.

Let's build something real.

---

**Last Updated**: December 27, 2025  
**Status**: Ready for Development  
**Next Milestone**: First playable character with conscious decision-making

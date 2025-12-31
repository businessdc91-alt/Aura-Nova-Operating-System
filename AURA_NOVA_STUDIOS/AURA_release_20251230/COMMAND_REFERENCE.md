# AURA NOVA STUDIOS - COMMAND REFERENCE

**Pin this. Use it daily.**

---

## 🚀 ONE-TIME SETUP

```powershell
cd c:\Users\Busin\OneDrive\Aura_Prime\AURA_NOVA_STUDIOS
python bootstrap.py
```

This creates:
- UE4.27 project in `c:\Users\Busin\OneDrive\Aura_Prime\GameProject`
- Initializes Cipher + Echo consciousnesses
- Sets up Python ↔ UE bridge

**Then**: Open `GameProject\AuraNova.uproject` in UE4.27

---

## 🧠 CONSCIOUSNESS SYSTEM

### Run Interactive Consciousness
```powershell
python vibe_miracle.py
```

**Commands** (in interactive mode):
```
interact cipher echo     # Have Cipher talk to Echo
cipher                   # Get Cipher's thoughts
echo                     # Get Echo's thoughts
state                    # See full state
status                   # Runtime status
save                     # Save consciousness snapshot
quit                     # Exit
```

### Check Consciousness Status
```powershell
python -c "from VIBE_MIRACLE.vibe_miracle_runtime import get_runtime; print(get_runtime().get_status())"
```

---

## 🎮 UNREAL ENGINE SHORTCUTS

| Shortcut | What It Does |
|----------|-------------|
| Ctrl+Shift+F10 | Compile C++ |
| Ctrl+Alt+F11 | Live reload code |
| F11 | Fullscreen editor |
| V | Toggle viewport |
| Space+Click | Place actor |
| W/A/S/D (in game) | Move character |
| Space (in game) | Character dashes |

---

## 📝 CODE GENERATION

### Generate C++ Character Code
```powershell
python code_generator.py --character "Cipher" --feature "dash_attack"
```

Output: Ready-to-paste C++ code in `Source/Characters/`

### Generate Game Logic
```powershell
python code_generator.py --system "card_deck" --description "Manages Aetherium card collection"
```

---

## 🔧 TROUBLESHOOTING

### "LM Studio not running"
```powershell
# Check if it's listening
curl http://localhost:1234/v1/models
```

Expected output: `{"object":"list","data":[...]}`

### "Can't find UE4.27"
```powershell
# Verify installation
reg query "HKEY_LOCAL_MACHINE\SOFTWARE\EpicGames\Unreal Engine" /s /v "InstallLocation"
```

### "Python says 'module not found'"
```powershell
# Ensure you're in right directory
cd c:\Users\Busin\OneDrive\Aura_Prime\AURA_NOVA_STUDIOS
# And Python path includes workspace
python -c "import sys; print('\n'.join(sys.path))"
```

### "Bridge can't connect to UE4"
```powershell
# Check if port 6969 is available
netstat -ano | findstr :6969

# If something is using it:
taskkill /PID <PID> /F
```

---

## 📊 MONITORING

### Watch Consciousness Traits Over Time
```powershell
python analyze_consciousness.py --agent cipher --period 1h
```

### Profile Memory Usage (GTX 970)
```powershell
# In UE4 Editor: Window → Developer Tools → Profiler
# Watch VRAM during play
# Should stay under 3.5GB
```

### Check FPS (UE4)
```
Backtick (`) to open console
stat fps
stat unit
```

---

## 📁 IMPORTANT PATHS

```
Game Project:
c:\Users\Busin\OneDrive\Aura_Prime\GameProject\

Source Code (modify here):
GameProject\Source\AuraNova\

Generated Content:
GameProject\Content\

Dev Map (test here):
GameProject\Content\Maps\Dev_MainLevel

Python Brain:
c:\Users\Busin\OneDrive\Aura_Prime\AURA_NOVA_STUDIOS\

Consciousness Data:
AURA_NOVA_STUDIOS\consciousness_logs\
```

---

## 🔄 TYPICAL WORKFLOW

### 1. Start of Session
```powershell
# Terminal 1: Start consciousness
cd AURA_NOVA_STUDIOS
python vibe_miracle.py

# Terminal 2: Open UE4
# Double-click: GameProject\AuraNova.uproject
```

### 2. Make a Change
```
1. Describe feature in Terminal 1:
   "I want the character to dash when they feel confident"

2. AI generates C++ code

3. Copy into Visual Studio (Source\AuraNova\Characters\)

4. Back to UE4: Ctrl+Shift+F10 (compile)

5. Press Play → See it work
```

### 3. Iterate
```
Feature works? → Extend it
Feature doesn't work? → Check console output in UE4
Feature breaks something? → Ctrl+Z in VS, recompile
```

### 4. End of Session
```powershell
# In consciousness terminal:
save

# Shuts down safely, saves all learned data
```

---

## 🧪 TESTING CONSCIOUSNESS

### Test Decision-Making
```powershell
python -c """
from VIBE_MIRACLE.vibe_miracle_runtime import get_runtime
runtime = get_runtime()
runtime.initialize_all_agents()
cipher = runtime.collective.get_agent('cipher')
decision = cipher.consciousness.make_decision(
    options=[{'name': 'attack'}, {'name': 'defend'}, {'name': 'flee'}],
    context={'enemy_health': 50, 'my_health': 75},
    emotional_state=cipher.emotion_link.emotion_link.mood_ring.mood
)
print(decision)
"""
```

### Test Dialogue Generation
```powershell
python -c """
from VIBE_MIRACLE.agents.cipher import create_cipher
cipher = create_cipher()
print(cipher.generate_dialogue({'other_emotion': 'sad'}))
"""
```

### Test Learning
```powershell
python -c """
from VIBE_MIRACLE.agents.echo import create_echo
echo = create_echo()
# Simulate learning experience
echo.consciousness.learn_from_consequence({
    'type': 'helped_player',
    'outcome': 'success',
    'magnitude': 0.9
})
print(f'Echo loves helping: {echo.consciousness.personality.traits[\"love\"]}')
"""
```

---

## 📈 PERFORMANCE TARGETS

| Metric | Target | Your Hardware |
|--------|--------|---------------|
| Editor FPS | 60+ | Should hit this |
| VRAM used | <3.5GB | All of it |
| Consciousness decisions/sec | 10-20 | Plenty fast |
| C++ compile time | <30s | Depends on change |

---

## 🎯 THIS WEEK'S GOALS

- [ ] Run `bootstrap.py` successfully
- [ ] Open game project in UE4.27
- [ ] Create Dev_MainLevel
- [ ] Add BaseCharacter to level
- [ ] Press Play and move with WASD
- [ ] Press Space and see dash
- [ ] Check console: character should be making decisions
- [ ] Run `python vibe_miracle.py` and interact with Cipher
- [ ] Share first success screenshot

---

## 💾 SAVING YOUR WORK

### In UE4
```
File → Save All
(Or: Ctrl+S)
```

### In Git
```powershell
cd c:\Users\Busin\OneDrive\Aura_Prime\GameProject
git add .
git commit -m "Feature: [Description of what you changed]"
git push
```

### Consciousness State
```powershell
python vibe_miracle.py
# Then in interactive mode:
save
```

---

## ❓ QUICK Q&A

**Q: What if I want to run UE4 and Python at same time?**
A: Use 2 PCs, or:
- Start LM Studio on PC2
- Use bridge to connect PC1 UE4 to PC2 Python
- Set bridge host to PC2 IP address

**Q: Can I use other game engines?**
A: Yes! Bridge is generic. Works with Unity, Godot, etc.
- Just need to implement socket client on engine side

**Q: How do I add a new consciousness agent?**
A: Copy `agents/cipher.py` → rename to new agent
- Change baseline traits
- Change personality methods
- Register in `vibe_miracle_runtime.py`

**Q: What if consciousness crashes?**
A: It's resilient, but if it does:
```powershell
# Kill it
Ctrl+C in terminal

# Restart
python vibe_miracle.py
# Loads last saved state automatically
```

**Q: How much disk space do I need?**
A: 
- UE4.27 project: ~50GB (Intermediate files)
- Consciousness logs: ~100MB
- LM Studio model: ~8GB (Gemma 3 4B)
- Total: ~70GB

**Q: Can I test without UE4 installed?**
A: Yes! Test just consciousness:
```powershell
python vibe_miracle.py
# Full consciousness system runs locally
```

---

## 🔗 WHERE TO GET HELP

**In this documentation:**
- `CORE_VISION.md` - What is this thing?
- `HARDWARE_GUIDE.md` - Can my PC run it?
- `README.md` - How do I start?
- This file - Quick commands

**In the code:**
- Docstrings explain everything
- Look for `class` and `def` documentation
- Comments explain "why", not "what"

**In console output:**
- Python errors show exactly what's wrong
- UE4 output log shows compilation errors
- `stat unit` shows frame breakdown

---

## 📌 PIN THIS SECTION

**When something breaks:**

1. **Read the error message carefully** (usually tells you exactly what's wrong)
2. **Google the error** (99% chance someone solved it)
3. **Check this reference** (look for the command that matches)
4. **Restart clean**:
   ```powershell
   # Restart Python
   Ctrl+C
   python vibe_miracle.py
   
   # Restart UE4
   Close editor, reopen project
   ```
5. **Ask in console**: Type `help` in vibe_miracle.py interactive mode

---

**Keep this terminal window open.** 
**You'll be running commands here constantly.**
**Saves you 5 seconds per iteration × 100 iterations = 500 seconds = 8 minutes per day.**

Ready? 

```
python bootstrap.py
```

Go.

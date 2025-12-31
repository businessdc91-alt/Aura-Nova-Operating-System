# AuraNova OS - Complete Operating System Experience

## Overview

AuraNova OS transforms the platform into a full operating system-like environment with windowed applications, a desktop interface, taskbar, and mobile-responsive design. This document covers all new features and their capabilities.

---

## 🖥️ Desktop Environment

### Features
- **Windowed Applications**: All apps open in draggable, resizable windows
- **Glass/Blur Effects**: Translucent window backgrounds with backdrop-blur
- **Window Controls**: Minimize, maximize, restore, and close buttons
- **Z-Index Management**: Click any window to bring it to front
- **Desktop Icons**: Quick access to apps via desktop shortcuts
- **Start Menu**: Full app launcher with search and user profile
- **Taskbar**: Running apps, system tray, notifications, clock
- **Wallpaper Support**: Customizable desktop backgrounds

### Window Management
- **Dragging**: Click and drag title bar to move windows
- **Resizing**: Drag corner handle to resize (respects minimum dimensions)
- **Minimize**: Shrinks to taskbar, click to restore
- **Maximize**: Full screen with room for taskbar
- **Focus**: Active window has purple ring highlight

---

## 📁 File Manager

### Capabilities
- **File Upload**: Up to 50 files per upload
- **Account Limit**: Maximum 1000 files/folders per account
- **Download**: Export any file to your local machine
- **Folder Creation**: Organize with nested folders
- **File Operations**: Copy, cut, paste, rename, delete
- **View Modes**: Grid view or list view
- **Search**: Filter files by name
- **Context Menu**: Right-click for quick actions

### File Types Recognized
- 📄 Documents (txt, pdf, doc)
- 🎵 Audio (mp3, wav, ogg, flac)
- 🎬 Video (mp4, webm, avi, mov)
- 🖼️ Images (jpg, png, gif, webp, svg)
- 💻 Code (js, ts, py, java, cpp, html, css)
- 📦 Archives (zip, rar, 7z, tar)

---

## 🎮 AI Games Arcade

### AI Tic Tac Toe
- **Game Modes**: Player vs AI, AI vs AI
- **Difficulty Levels**: Easy, Medium, Hard, Impossible
- **Features**:
  - Minimax algorithm with alpha-beta pruning
  - Unbeatable AI on "Impossible" mode
  - Score tracking across sessions
  - Winning line highlight

### AI Checkers
- **Game Modes**: Player vs AI, AI vs AI
- **Difficulty Levels**: Easy, Medium, Hard
- **Features**:
  - Full checkers rules with king promotion
  - Forced capture rule implemented
  - Multi-jump moves supported
  - Piece count display
  - Move highlighting

### AI Chess
- **Game Modes**: Player vs AI, AI vs AI
- **Difficulty Levels**: Easy, Medium, Hard
- **Features**:
  - Complete chess rules
  - Castling (kingside and queenside)
  - En passant captures
  - Pawn promotion (choose piece)
  - Check and checkmate detection
  - Move validation
  - Last move highlighting

---

## 💻 NovaCode Sandbox

### Custom Language: NovaCode
A beginner-friendly programming language with creative twists.

#### Keywords
```
create, set, if, else, loop, times, while, function,
return, print, input, true, false, and, or, not,
break, continue, for, in, end, cast, summon, invoke
```

#### Syntax Examples

**Variables**
```novacode
create hero = "Knight"
create health = 100
set health = health - 10
```

**Output**
```novacode
print "Hello World!"
print hero
cast "Magic spell!"    // Adds sparkles ✨
```

**Loops**
```novacode
loop 5 times
  print "Power!"
end
```

**Conditions**
```novacode
if score > 50
  print "Winner!"
else
  print "Try again"
end
```

**Functions**
```novacode
function greet()
  print "Hello, Nova Coder!"
end

invoke greet()
```

**Creative Commands**
```novacode
summon dragon = "Fire Dragon"  // Creates with flair 🌟
cast "Fireball!"               // Sparkly output ✨
```

### Challenges & Rewards
- **9 Core Challenges**: From "Hello World" to advanced functions
- **Secret Challenge**: Unlock by completing 5 challenges
- **XP System**: Gain experience points per challenge
- **Coins**: Currency for future shop features
- **Badges**: Collectible achievements
- **Streak**: Track consecutive completions

### Terminal Commands
```
help        - Show available commands
clear       - Clear terminal
run         - Execute current code
status      - Show XP, level, coins
challenges  - Open challenges tab
hint        - Get hint for current challenge
```

---

## 📱 Mobile OS View

### Features
- **Status Bar**: Time, battery, signal icons
- **Clock Widget**: Large time display with date
- **App Grid**: 4-column layout with app icons
- **App Dock**: Quick access to favorite apps
- **Full-Screen Apps**: Apps open in immersive mode
- **Navigation Bar**: Back, home, recent apps buttons
- **Futuristic Design**: Glassmorphism effects

### Responsive Behavior
- Automatically switches to mobile view on screens < 768px
- Touch-friendly tap targets
- Smooth app transitions

---

## 🏗️ Technical Architecture

### Components
```
/components/os/
├── WindowManager.tsx      # Window state management
├── DesktopEnvironment.tsx # Desktop, taskbar, start menu
├── FileManager.tsx        # File system UI

/components/games/
├── AITicTacToe.tsx       # Tic Tac Toe with minimax
├── AICheckers.tsx        # Checkers with AI
├── AIChess.tsx           # Full chess implementation

/components/sandbox/
└── CodingSandbox.tsx     # NovaCode interpreter & IDE

/app/os/
└── page.tsx              # Main OS entry point
```

### Context System
- `WindowManagerContext`: Manages all window states
- Provides: open, close, minimize, maximize, focus, resize, move
- Z-index management for window stacking

### State Management
- React hooks for local state
- Context API for cross-component communication
- No external state libraries required

---

## 🎨 Design System

### Colors
- **Primary**: Purple-500 (#8B5CF6)
- **Background**: Slate-900 (#0F172A)
- **Glass Effect**: backdrop-blur-xl + bg-white/10
- **Active**: Purple ring highlight
- **Accent Colors**: Per-feature (amber for games, green for sandbox)

### Effects
- **Blur**: backdrop-blur-xl for glass panels
- **Shadows**: shadow-2xl for windows
- **Gradients**: Purple-to-pink for branding
- **Animations**: Pulse, scale on hover

---

## 📊 Stats

| Feature | Lines of Code | Key Technology |
|---------|--------------|----------------|
| Window Manager | ~340 | React Context, Mouse Events |
| Desktop Environment | ~270 | Tailwind, Lucide Icons |
| File Manager | ~600 | File API simulation |
| AI Tic Tac Toe | ~330 | Minimax Algorithm |
| AI Checkers | ~450 | Board evaluation |
| AI Chess | ~580 | Full rules engine |
| Coding Sandbox | ~700 | Custom interpreter |
| OS Page | ~320 | Integration layer |

**Total New Code**: ~3,590 lines

---

## 🚀 Getting Started

1. Navigate to `/os` or click "Launch OS Mode" on homepage
2. Double-click desktop icons to open apps
3. Click Start button (grid icon) for app menu
4. Drag windows by title bar, resize from corner
5. Try the coding sandbox challenges!

---

## 🔮 Future Enhancements

- [ ] Persistent file storage (backend integration)
- [ ] User accounts with cloud sync
- [ ] More AI game difficulty levels
- [ ] Additional NovaCode language features
- [ ] Custom wallpaper uploads
- [ ] Window snapping (half-screen)
- [ ] Virtual desktop support
- [ ] System sounds
- [ ] Keyboard shortcuts

---

*Built with 💜 by Aura Nova Studios*

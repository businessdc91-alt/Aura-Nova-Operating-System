# 🚀 Repository Setup & Deployment Guide

**Last Updated:** December 30, 2025  
**Status:** ✅ Ready for Production

---

## 📋 Prerequisites

Before getting started, ensure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** ([Download](https://git-scm.com/))
- **Python 3.8+** (optional, for local AI models)

---

## 🎯 Quick Start (5 minutes)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/aura-nova-studios.git
cd aura-nova-studios
```

### 2. Set Up Frontend
```bash
cd web_platform/frontend
npm install
cp .env.example .env.local
```

Edit `.env.local` and add your API keys (see Configuration section below).

### 3. Set Up Backend
```bash
cd ../backend
npm install
cp .env.example .env
```

Edit `.env` with your configuration.

### 4. Start Development Servers

**Terminal 1 - Frontend:**
```bash
cd web_platform/frontend
npm run dev
```
Frontend runs at: `http://localhost:3000`

**Terminal 2 - Backend:**
```bash
cd web_platform/backend
npm run dev
```
Backend runs at: `http://localhost:4000`

✅ Both servers are running!

---

## ⚙️ Configuration

### Frontend (.env.local)

```env
# Required - API Endpoints
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000

# Required - Gemini API (get from Google Cloud Console)
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
NEXT_PUBLIC_GCP_PROJECT_ID=your_project_id_here

# Optional - Local AI Models
NEXT_PUBLIC_LM_STUDIO_URL=http://localhost:1234
NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434

# Optional - Cloud Services
NEXT_PUBLIC_AURA_ENDPOINT=http://localhost:8000
AURA_INTERNAL_KEY=your_internal_key_here
NEXT_PUBLIC_GCS_BUCKET=your_bucket_name
```

### Backend (.env)

```env
# Server Configuration
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# API Keys
GEMINI_API_KEY=your_api_key_here
REMOVE_BG_API_KEY=your_api_key_here

# Optional - LM Studio (Local Models)
LM_STUDIO_URL=http://localhost:1234

# Optional - Ollama (Alternative Local Models)
OLLAMA_URL=http://localhost:11434
```

---

## 🤖 Setting Up Local AI Models (Optional)

### Option 1: LM Studio (Recommended)

1. **Download** [LM Studio](https://lmstudio.ai/)
2. **Open** LM Studio
3. **Search** for "Gemma 2B" in the model library
4. **Download** and load it
5. **Go to** Developer Console → Local Server
6. **Verify** it says "Server is running at http://localhost:1234"

### Option 2: Ollama

1. **Download** [Ollama](https://ollama.ai/)
2. **Install** and run:
   ```bash
   ollama pull mistral
   ollama serve
   ```
3. Server will be available at `http://localhost:11434`

---

## 🔧 Build for Production

### Frontend Build
```bash
cd web_platform/frontend
npm run build
npm run start
```

### Backend Build
```bash
cd web_platform/backend
npm run build
npm run start
```

---

## 📦 Project Structure

```
aura-nova-studios/
├── web_platform/
│   ├── frontend/              # Next.js React App
│   │   ├── src/
│   │   │   ├── app/          # Pages and routes
│   │   │   ├── components/   # React components
│   │   │   ├── hooks/        # Custom hooks
│   │   │   ├── services/     # API services
│   │   │   └── lib/          # Utilities
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── next.config.mjs
│   │   └── .env.example
│   │
│   └── backend/               # Express Server
│       ├── src/
│       │   ├── index.ts       # Main server
│       │   ├── routes/        # API routes
│       │   └── websocket/     # Socket.IO
│       ├── package.json
│       ├── tsconfig.json
│       └── .env.example
│
├── CORE_VISION.md             # Platform vision
├── ARCHITECTURE.md            # System design
├── INTEGRATION_GUIDE.md       # Setup instructions
├── README.md                  # Project overview
└── .gitignore
```

---

## 🧪 Testing

### Test Frontend
```bash
cd web_platform/frontend
npm run dev
# Navigate to http://localhost:3000
```

### Test Backend Health Check
```bash
curl http://localhost:4000/health
```
Should return: `{ "status": "healthy", "timestamp": "..." }`

### Test API Connection
```bash
# From frontend, try creating a code generation
# Go to http://localhost:3000/creator-studio
# Click "Generate Code"
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Frontend (port 3000)
lsof -i :3000
kill -9 <PID>

# Backend (port 4000)
lsof -i :4000
kill -9 <PID>

# On Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### npm Install Issues
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Check for errors
npm run type-check

# Or in VS Code, restart the TypeScript server
# Press Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

### WebSocket Connection Issues
- Check that backend is running on port 4000
- Verify `NEXT_PUBLIC_WS_URL` in frontend `.env.local`
- Check browser console for connection errors
- Ensure CORS is properly configured

---

## 📊 Project Features

### AI & Code Generation
- ✅ Local model support (LM Studio, Ollama)
- ✅ Cloud API fallback (Gemini)
- ✅ Model selection & health checking
- ✅ Real-time code generation
- ✅ Syntax highlighting

### Creative Tools
- ✅ Art Studio (sprite generation, background removal)
- ✅ Avatar Builder (customize appearance)
- ✅ Clothing Creator (design system)
- ✅ Music Composer (DAW interface)
- ✅ Poetry Creator (writing assistant)
- ✅ Collaborative Writing (multi-user)

### User Features
- ✅ User profiles & settings
- ✅ Real-time chat
- ✅ Notifications
- ✅ Favorites & saved items
- ✅ Leaderboards

---

## 🚀 Deployment Options

### Deploy Frontend to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd web_platform/frontend
vercel
```

### Deploy Backend to Railway
```bash
# Visit https://railway.app
# Connect GitHub repo
# Add backend environment variables
# Deploy
```

### Deploy with Docker
```bash
docker-compose up
```

---

## 📚 Documentation

- [README.md](README.md) - Project overview
- [CORE_VISION.md](CORE_VISION.md) - Platform vision
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Setup details
- [API_CONTRACTS.md](API_CONTRACTS.md) - API reference
- [REPOSITORY_CHECKLIST.md](REPOSITORY_CHECKLIST.md) - Deployment checklist

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🆘 Support

For issues and questions:
- Check the troubleshooting section above
- Review the documentation files
- Check GitHub Issues
- Contact: [your-email@example.com]

---

**Status:** ✅ Ready to Deploy

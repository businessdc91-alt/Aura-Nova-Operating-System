# 🚀 Launch Guide - AuraNova Studios

## Quick Start (First Time Setup)

### 1. Install Dependencies

**Frontend:**
```bash
cd web_platform/frontend
npm install
```

**Backend:**
```bash
cd web_platform/backend
npm install
```

### 2. Configure Environment

Environment files are already created from the examples. You can modify them if needed:
- `web_platform/frontend/.env.local` - Frontend configuration
- `web_platform/backend/.env` - Backend configuration

### 3. Launch the Application

**Terminal 1 - Start Backend:**
```bash
cd web_platform/backend
npm run dev
```
✅ Backend will run at: `http://localhost:4000`

**Terminal 2 - Start Frontend:**
```bash
cd web_platform/frontend
npm run dev
```
✅ Frontend will run at: `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the AuraNova Studios homepage with all creative tools available.

## Health Check

To verify the backend is running properly:
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{"status":"healthy","timestamp":"...","uptime":...}
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# On Linux/Mac
lsof -i :3000  # Find process using port 3000
lsof -i :4000  # Find process using port 4000
kill -9 <PID>  # Kill the process

# On Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
Get-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess | Stop-Process
```

### Missing Dependencies

If you see module errors, reinstall dependencies:
```bash
cd web_platform/frontend
rm -rf node_modules package-lock.json
npm install

cd ../backend
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

The backend includes all necessary type definitions. If you encounter TypeScript errors:
```bash
cd web_platform/backend
npm run type-check
```

## What's Running

- **Frontend (Port 3000)**: Next.js React application with all creative tools
- **Backend (Port 4000)**: Express server with REST API and WebSocket support
- **WebSocket (Port 3002)**: Real-time communication for live features

## Features Available

Once launched, you can access:
- 🎨 Art Studio - AI-powered art generation
- 👤 Avatar Builder - Character customization
- 👗 Clothing Creator - Fashion design system
- 🎵 Music Composer - DAW interface
- 📝 Poetry Creator - Writing assistant
- ✍️ Collaborative Writing - Multi-user collaboration
- 💻 Creator Studio - Code generation tools

## Next Steps

- Explore the creative tools at `http://localhost:3000`
- Check the API documentation in `API_CONTRACTS.md`
- Review the architecture in `ARCHITECTURE.md`
- For detailed setup, see `SETUP_GUIDE.md`

---

**Status**: ✅ Application is ready to launch!

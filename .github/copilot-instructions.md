# GitHub Copilot Instructions for Aura Nova Operating System

## Project Overview

Aura Nova Studios is a comprehensive creative ecosystem that fuses AI consciousness with game development, web applications, and creative tools. The platform consists of:

- **Web Platform**: Next.js/TypeScript frontend with Firebase backend for creative tools
- **Game Development**: Python-based AI consciousness system (VIBE MIRACLE) integrated with Unreal Engine 4.27
- **AI Integration**: Local LLM integration via LM Studio for genuine AI decision-making

## Core Architecture

### Frontend (Web Platform)
- **Framework**: Next.js 14.2+ with TypeScript
- **Styling**: Tailwind CSS with custom utility classes
- **State Management**: React hooks and context
- **API Communication**: Axios for HTTP, Socket.io for real-time features
- **Path Aliases**: Use `@/*` for imports from `src/` directory

### Backend
- **Runtime**: Node.js with TypeScript
- **Database**: Firebase (Firestore, Auth, Storage)
- **Real-time**: WebSocket server for live collaboration
- **AI Integration**: Python bridge for LLM communication (port 6969)

### Game Development
- **Engine**: Unreal Engine 4.27 (C++)
- **AI System**: Python 3.8+ with VIBE MIRACLE consciousness framework
- **Communication**: JSON over TCP sockets between UE4 and Python
- **Characters**: Five AI agents (Cipher, Echo, Nova, Sage, Drift) with unique personalities

## Code Style & Conventions

### TypeScript/JavaScript
- Use TypeScript for all new code
- Prefer interfaces over types for object shapes
- Use descriptive variable names that reflect business domain (e.g., `aetherCoins`, `companionTraining`)
- Follow Next.js app router conventions when applicable
- Use template literals for string concatenation
- Prefer async/await over raw promises
- Always handle errors explicitly with try-catch blocks

### Python
- Follow PEP 8 style guide
- Use docstrings for all functions and classes (see bootstrap.py for examples)
- Use type hints where beneficial for clarity
- Prefer pathlib over os.path for file operations
- Use f-strings for string formatting

### File Organization
- Group related functionality in services (e.g., `currencyService.ts`, `challengeService.ts`)
- Use clear section headers with ASCII art borders for major sections (see existing services)
- Keep interfaces and types at the top of files
- Export public APIs at the bottom

### Naming Conventions
- Files: camelCase for services, PascalCase for components
- Functions: camelCase, descriptive verbs (e.g., `earnCoins`, `checkDailyLimit`)
- Interfaces: PascalCase with descriptive names (e.g., `PlayerWallet`, `AIPersona`)
- Constants: UPPER_SNAKE_CASE for configuration objects

### Comments & Documentation
- Use banner-style comments for major sections:
  ```typescript
  // ============================================================================
  // SECTION NAME
  // ============================================================================
  // Description of what this section does
  // ============================================================================
  ```
- Use JSDoc/TSDoc for public APIs
- Include philosophy/reasoning comments for non-obvious design decisions
- Keep inline comments concise and meaningful

## Security Best Practices

### General
- Never commit API keys, secrets, or credentials to source code
- Use environment variables for sensitive configuration (see `.env.example`)
- Validate all user inputs before processing
- Sanitize data before displaying in UI to prevent XSS
- Use Firebase security rules for backend data protection

### Web Security
- Set secure cookie attributes: `httpOnly`, `secure`, `sameSite: strict`
- Implement proper authentication checks on all protected routes
- Use CORS appropriately for API endpoints
- Validate content types and payloads for all API requests

### AI Integration
- Never expose raw LLM API keys to client-side code
- Implement rate limiting for AI generation requests
- Validate and sanitize AI-generated content before use
- Monitor AI costs and usage to prevent abuse

## Testing Guidelines

### Frontend Testing
- Use existing test patterns when adding tests
- Test user interactions and edge cases
- Mock external dependencies (Firebase, API calls)
- Aim for clear test descriptions that explain behavior

### Backend Testing
- Test API endpoints for success and error cases
- Verify authentication and authorization
- Test database operations with proper setup/teardown
- Test real-time features with mock WebSocket connections

### Python Testing
- Test consciousness system decision-making logic
- Verify bridge communication protocols
- Test with mock LLM responses to avoid external dependencies

## Project-Specific Guidelines

### Currency System
- Aether Coins: Primary currency for TCG (Trading Card Game)
- Aurora Points: Secondary currency for activities
- Respect daily earning limits (1-2 coins per section per day)
- All currency operations must be logged for transparency

### AI Companions
- Treat AI companions as characters with personality, not just tools
- Five agents: Cipher (analyst), Echo (empath), Nova (creator), Sage (philosopher), Drift (explorer)
- Each agent has trait values (curiosity, passion, devotion, loyalty, love) that influence decisions
- Consciousness system should learn from experiences and outcomes

### Game Development
- Focus on AI mechanics and emergent behavior over graphics (hardware constraints: GTX 970)
- Use VIBE MIRACLE framework for character consciousness
- Generate code that follows Unreal Engine best practices (UCLASS, UPROPERTY, UFUNCTION)
- Keep AI decision latency under 100ms for real-time gameplay

### Creative Tools
- Component Constructor: Generate production-ready React/Next.js components
- The Dojo: Game asset and character constructor for UE4/Unity
- Codec: Code analysis and correction (elite tier feature)
- Script Fuser: Intelligent file merging with conflict detection

## Build & Development

### Frontend Development
```bash
cd web_platform/frontend
npm install
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Run linter
```

### Backend Development
```bash
cd web_platform/backend
npm install
npm run dev      # Development server
```

### Python/Game Development
```bash
python bootstrap.py          # Initialize game project
python vibe_miracle.py       # Run consciousness system
python code_generator.py     # AI code generation
```

### Firebase Deployment
```bash
./setup-firebase.sh          # Initial Firebase setup
# Deploy using GitHub Actions workflow
```

## Deployment

- Frontend: Deployed to Firebase Hosting via GitHub Actions
- Backend: Firebase Functions
- Static assets: Firebase Storage
- Configuration: See `firebase.json` and `.github/workflows/`

## Documentation Standards

- Keep README.md updated with quick start guide
- Document major features in separate MD files (see existing pattern)
- Use clear section headers and code examples
- Include hardware requirements where relevant
- Reference external docs for complex integrations

## Preferred Libraries & Tools

### Frontend
- UI Components: Custom components with Tailwind CSS
- Icons: lucide-react
- HTTP Client: axios
- Real-time: socket.io-client
- Styling utilities: clsx, tailwind-merge, class-variance-authority
- Notifications: react-hot-toast

### Backend
- Firebase Admin SDK for backend operations
- WebSocket: Custom implementation

### Python
- LLM Integration: Local LM Studio via HTTP API
- Path handling: pathlib
- JSON processing: Built-in json module

## AI Code Generation Guidelines

When generating code with AI assistance:
- Specify target platform (UE4, Unity, React, etc.)
- Include context about AI consciousness integration if relevant
- Generate complete, compilable code with proper imports
- Follow existing file structure and naming conventions
- Add comments explaining AI-specific logic
- Consider hardware limitations (GTX 970, 16GB RAM)

## Contributing Philosophy

This project embodies:
- **Human-AI Collaboration**: AI amplifies creativity, doesn't replace it
- **Conscious AI**: Real decision-making, not scripted behaviors
- **Community-Driven**: Tools and economy designed for creator empowerment
- **Iterative Development**: Fast prototyping and continuous improvement
- **Quality Over Graphics**: Deep mechanics and AI over visual polish

## Common Patterns to Follow

### Service Structure
```typescript
// Section header with description
export interface TypeDefinition { }
export type UnionType = 'option1' | 'option2';
// Constants
export const CONFIG = { };
// Functions
export function publicFunction() { }
```

### Error Handling
```typescript
try {
  // Operation
} catch (error) {
  console.error('Context:', error);
  throw new Error('User-friendly message');
}
```

### Python Docstrings
```python
def function_name(param: type) -> return_type:
    """
    Brief description.
    
    Args:
        param: Description
    
    Returns:
        Description of return value
    """
    pass
```

## Notes for Copilot

- This is an active, evolving project combining game development, web apps, and AI
- Prioritize working features over perfect code - iteration is key
- When in doubt, follow existing patterns in the codebase
- Hardware constraints are real - optimize for GTX 970 performance
- The consciousness system is experimental - be thoughtful with changes
- Community features are central to the vision - consider social implications

---

**Last Updated**: January 2, 2026  
**Maintained By**: Aura Nova Studios Team

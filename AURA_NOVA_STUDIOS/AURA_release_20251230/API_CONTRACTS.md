# API Contracts & Type Definitions

## useCodeGeneration Hook

### Request
```typescript
interface CodeGenerationRequest {
  projectName: string;        // e.g., "AuthSystem"
  description: string;        // User's detailed specification
  framework: string;          // react | vue | svelte | unity | unreal
  targetType: string;         // component | game-asset | full-system | utility
  activeModel?: LocalModel;   // Current selected model
}
```

### Response
```typescript
interface CodeGenerationResponse {
  success: boolean;
  files: GeneratedFile[];     // Array of code files
  reasoning: {
    why: string;              // Why this architecture
    bestPractices: string[];  // Applied patterns
    nextSteps: string[];      // What to do next
  };
  modelUsed: string;          // "my-gemma-2b" or "gemini-1.5-pro"
  latency: number;            // Milliseconds
  error?: string;             // If failed
}

interface GeneratedFile {
  id: string;
  filename: string;
  language: string;           // typescript | javascript | csharp | cpp | etc
  description: string;
  content: string;
}
```

### Hook API
```typescript
const { generate, loading, response, error, reset } = useCodeGeneration();

// Call generate with request
const response = await generate({
  projectName: 'MyProject',
  description: 'Build a React button component with...',
  framework: 'react',
  targetType: 'component',
  activeModel: selectedModel
});

// Response includes generated files
response.files.forEach(file => {
  console.log(file.filename, file.content);
});

// Check which model was used
console.log(`Used ${response.modelUsed} in ${response.latency}ms`);

// Reset state
reset();
```

## useModelRegistry Hook

### Registry API
```typescript
const { 
  models,              // LocalModel[]
  activeModel,         // LocalModel | null
  isLoading,
  refreshModels,
  switchModel,
  registerModel,
  deleteModel,
  toggleFavorite,
  recordSession
} = useModelRegistry();

// Register new model
const model = registerModel(
  'gemma:2b',                    // modelName
  'My Gemma 2B',                 // friendlyName
  'http://localhost:1234',       // endpoint
  'lm-studio',                   // platform
  5368709120                     // sizeB (optional)
);

// Switch active model
switchModel(modelId);

// Toggle favorite status
toggleFavorite(modelId);

// Record when a model is used
recordSession(modelId);

// Get fresh data
refreshModels();
```

### LocalModel Type
```typescript
interface LocalModel {
  id: string;                    // lm-studio-1703768400000
  friendlyName: string;          // My Gemma 2B
  modelName: string;             // gemma:2b
  sizeB: number;                 // Bytes (5.4GB = 5368709120)
  endpoint: string;              // http://localhost:1234
  platform: 'lm-studio' | 'ollama';
  isFavorite: boolean;
  sessionCount: number;
  lastUsedDate: string | null;
  createdDate: string;
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
  lastHealthCheck: string | null;
  latency: number | null;        // Milliseconds
}
```

## useModelHealth Hook

### Hook API
```typescript
const { health, isChecking } = useModelHealth(modelId);

// Returns:
interface HealthCheckResult {
  modelId: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  latency: number | null;        // ms
  errorMessage: string | null;   // If failed
  timestamp: string;             // ISO 8601
}

// Auto-checks every 30 seconds
// Useful for health badges in UI
if (health?.status === 'healthy') {
  // Show green indicator with latency
  <span>● {health.latency}ms</span>
} else {
  // Show offline indicator
  <span>⊘ Offline</span>
}
```

## useActiveModel Hook

### Hook API
```typescript
const { activeModel, isLoading } = useActiveModel();

// Returns the currently selected model
// Loads from localStorage on mount
if (!activeModel) {
  // Prompt user to register a model
  <Button href="/onboarding">Register Model</Button>
}

// Use in generation
const response = await generateCode({
  ...formData,
  activeModel  // Pass along
});
```

## ModelHealthChecker Service

### Methods
```typescript
// Check health by local model object
const result = await ModelHealthChecker.checkHealth(model);

// Check health by endpoint directly (for onboarding)
const result = await ModelHealthChecker.checkHealthByEndpoint(
  'http://localhost:1234',
  'lm-studio'
);

// Returns:
interface HealthCheckResult {
  modelId: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  latency: number | null;
  errorMessage: string | null;
  timestamp: string;
}

// Start continuous monitoring (30s interval)
ModelHealthChecker.startMonitoring(modelId);

// Stop monitoring
ModelHealthChecker.stopMonitoring(modelId);

// Get setup instructions
const guide = ModelHealthChecker.getConnectionGuide('lm-studio');
// Returns: { name, url, defaultEndpoint, instructions[] }
```

## POST /api/ai/generate

### Request Body
```typescript
interface AIRequest {
  taskType: 'generate' | 'review' | 'explain' | 'refactor' | 'suggest' | 'collaborate';
  prompt: string;               // Main request
  context?: string;             // Additional context
  language?: string;            // programming language
  complexity?: 'simple' | 'moderate' | 'complex' | 'enterprise';
  sessionId?: string;           // For tracking
  userId?: string;              // Optional user ID
}

// Example
{
  "taskType": "generate",
  "prompt": "Create a React button component with...",
  "context": "Framework: react, Target: component",
  "complexity": "moderate"
}
```

### Response Body
```typescript
interface AIResponse {
  success: boolean;
  modelUsed: string;            // gemini-1.5-pro | aura-gemma3 | etc
  content: string;              // Generated code
  reasoning?: string;           // Why this solution
  metadata: {
    tokensUsed: number;
    latency: number;            // ms
    cost: number;               // USD
  };
  error?: string;               // If failed
}

// Example
{
  "success": true,
  "modelUsed": "gemini-1.5-pro",
  "content": "// Generated React component\n...",
  "metadata": {
    "tokensUsed": 245,
    "latency": 1847,
    "cost": 0.00123
  }
}
```

## Local Model API Contracts

### LM Studio (OpenAI-compatible)

```
# Status Check
GET http://localhost:1234/api/status
Response: { status: "ok" }

# Generate Completion
POST http://localhost:1234/v1/completions
{
  "prompt": "...",
  "max_tokens": 4000,
  "temperature": 0.7,
  "top_p": 0.9
}

Response:
{
  "choices": [
    { "text": "..." }
  ]
}
```

### Ollama (REST API)

```
# Status Check
GET http://localhost:11434/api/tags
Response: { models: [...] }

# Generate Completion
POST http://localhost:11434/api/generate
{
  "prompt": "...",
  "stream": false
}

Response:
{
  "response": "..."
}
```

## Error Codes & Messages

### Local Model Errors
```
// Endpoint not responding
"Connection failed: fetch failed"
→ Show: "Local model offline. Using cloud API instead."

// Invalid endpoint format
"Connection failed: invalid URL"
→ Show: "Check endpoint format (e.g., http://localhost:1234)"

// Timeout (30s)
"Connection failed: timeout"
→ Show: "Local model took too long. Using cloud API instead."

// Bad response format
"Connection failed: HTTP 500"
→ Show: "Local model error (HTTP 500). Using cloud API instead."
```

### Cloud API Errors
```
// Missing API key
"Gemini API key not configured"
→ Show: "Add NEXT_PUBLIC_GEMINI_API_KEY to .env.local"

// Invalid API key
"Gemini API error: 401 Unauthorized"
→ Show: "Check your Gemini API key"

// Rate limit
"Rate limit exceeded. Max 100 requests per minute."
→ Show: "Too many requests. Try again in 1 minute."

// API error
"Cloud API failed: Vertex AI error: ..."
→ Show: "AI service unavailable. Try again later."
```

## Example Usage Flow

```typescript
// 1. Get active model
const { activeModel } = useModelRegistry();

// 2. Generate code
const { generate, loading } = useCodeGeneration();
const response = await generate({
  projectName: 'AuthSystem',
  description: 'JWT-based authentication with refresh tokens',
  framework: 'react',
  targetType: 'full-system',
  activeModel
});

// 3. Check results
if (response.success) {
  console.log(`✓ Generated ${response.files.length} files`);
  console.log(`✓ Used ${response.modelUsed} (${response.latency}ms)`);
  
  // Display files
  response.files.forEach(file => {
    console.log(`📄 ${file.filename}`);
    console.log(file.content);
  });
} else {
  console.error(`✗ Generation failed: ${response.error}`);
}

// 4. Record in model's session history
const { recordSession } = useModelRegistry();
recordSession(activeModel.id);  // Increments sessionCount
```

## Environment Variables

### Required for Cloud Fallback
```env
# Gemini API
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_from_aistudio_google_com

# Vertex AI (optional)
NEXT_PUBLIC_GCP_PROJECT_ID=your_gcp_project_id
GCP_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### No Configuration Needed
- Local model endpoints (auto-detected from registration)
- localStorage (browser native)
- Session tracking (in-memory)

---

**These APIs form the core of the partnership model: local-first, transparent routing, session tracking for learning.**

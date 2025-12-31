# System Architecture Diagrams

## 1. User Flow: From Registration to Generation

```
USER STARTS
    ↓
┌──────────────────────────────┐
│ Visit /onboarding            │
│ "Meet Your Partner"          │
└──────────┬───────────────────┘
           ↓
    ┌─────────────────┐
    │ Choose Platform │
    │ LM Studio ⭕    │
    │ Ollama ⭕      │
    └────────┬────────┘
             ↓
    ┌─────────────────────┐
    │ Configure Endpoint  │
    │ http://localhost... │
    └────────┬────────────┘
             ↓
    ┌──────────────────────┐
    │ Test Connection      │
    │ Check Health (5s)    │
    └────────┬─────────────┘
             ↓
    ┌──────────────────────┐
    │ Name Your Model      │
    │ "My Gemma 2B"        │
    └────────┬─────────────┘
             ↓
    Save to localStorage
    (Model Registry)
             ↓
┌──────────────────────────────┐
│ Visit /creator-studio        │
│ Model shows in header ✓      │
└──────────┬───────────────────┘
           ↓
    ┌──────────────────────┐
    │ Write Description    │
    │ "Create a React..."  │
    └────────┬─────────────┘
             ↓
    Click "Generate with AI"
             ↓
    ┌────────────────────────────────┐
    │ Check: Is Model Healthy?       │
    │ ├─ Yes → Call Local Model      │
    │ └─ No → Skip to Cloud          │
    └────────┬───────────────────────┘
             ↓
    ┌─────────────────────────────────┐
    │ TRY LOCAL MODEL (30s timeout)   │
    │ LM Studio: POST v1/completions  │
    │ Ollama: POST api/generate       │
    │                                 │
    │ Success? → Return files         │
    │ Timeout? → Fall through         │
    │ Error? → Fall through           │
    └────────┬────────────────────────┘
             ↓
    ┌──────────────────────────────────┐
    │ TRY CLOUD API (Gemini, 60s)      │
    │ POST generativelanguage.googleapis│
    │                                  │
    │ Success? → Return files          │
    │ Error? → Show error message      │
    └────────┬───────────────────────────┘
             ↓
    ┌────────────────────────────┐
    │ Display Results:           │
    │ • Generated Files          │
    │ • Model Used               │
    │ • Latency (ms)             │
    │ • Syntax Highlighting      │
    └────────┬───────────────────┘
             ↓
    Update Model Session History
    (session count += 1)
             ↓
    USER SEES CODE ✨
```

## 2. Component Hierarchy

```
┌─────────────────────────────────────┐
│         AppLayout                   │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┬────────────┐
        ↓             ↓            ↓
    ┌───────┐   ┌──────────┐   ┌────────┐
    │ Dojo  │   │Creator   │   │ Models │
    │       │   │Studio    │   │ Dash   │
    └───┬───┘   └────┬─────┘   └───┬────┘
        │            │             │
        ├───────────┬┴─────────────┤
        ↓           ↓              ↓
    ┌─────────────────────────────────┐
    │ CreatorStudioHeader             │
    │ • Show Active Model             │
    │ • Health Badge (● latency)      │
    │ • Switch Model Dropdown         │
    │ • Link to Dashboard             │
    └─────────┬───────────────────────┘
              │
    ┌─────────┴──────────────┐
    ↓                        ↓
┌───────────────┐    ┌──────────────┐
│useModelRegistry│    │useModelHealth│
│                │    │              │
│• models[]      │    │• status      │
│• activeModel   │    │• latency     │
│• switchModel() │    │• isChecking  │
│• registerModel │    │Auto-refresh  │
└────────┬───────┘    │every 30s     │
         │            └──────┬───────┘
         │                   │
         └───────┬───────────┘
                 ↓
        ┌────────────────────┐
        │ ModelRegistryService│
        │ (localStorage)     │
        │                    │
        │ get/set models     │
        │ track sessions     │
        │ health status      │
        └────────────────────┘
```

## 3. Code Generation Pipeline

```
USER INPUT
└─ projectName: "MyProject"
└─ description: "Create a..."
└─ framework: "react"
└─ targetType: "component"
└─ activeModel: LocalModel
         │
         ↓
┌───────────────────────────┐
│ useCodeGeneration()       │
│ .generate(request)        │
└────────────┬──────────────┘
             │
    ┌────────┴────────┐
    ↓                 ↓
┌──────────────┐  ┌──────────────────┐
│ callLocal    │  │ callCloud        │
│ Model()      │  │ API()            │
├──────────────┤  ├──────────────────┤
│ LM Studio:   │  │ Gemini:          │
│ POST :1234   │  │ POST googleapis  │
│ v1/complete  │  │                  │
│              │  │ Vertex AI:       │
│ Ollama:      │  │ POST aiplatform  │
│ POST :11434  │  │                  │
│ api/generate │  │ (fallback only)  │
└──────┬───────┘  └────────┬─────────┘
       │                   │
       └─────────┬─────────┘
                 ↓
          ┌─────────────────┐
          │ Parse Content   │
          │ to Files        │
          └────────┬────────┘
                   ↓
        ┌────────────────────────┐
        │ GeneratedFile[]         │
        │ • filename              │
        │ • language              │
        │ • content               │
        │ • description           │
        └────────┬─────────────────┘
                 ↓
        ┌──────────────────────┐
        │ Return Response:     │
        │ • files              │
        │ • reasoning          │
        │ • modelUsed          │
        │ • latency            │
        └──────────────────────┘
```

## 4. Model Selection Decision Tree

```
User clicks "Generate"
         │
         ├─→ activeModel exists?
         │   ├─ NO → Error: "Register model first"
         │   │
         │   └─ YES ↓
         │      Model healthy?
         │      ├─ NO → Go to Cloud
         │      │
         │      └─ YES ↓
         │         Try Local Model (30s timeout)
         │         ├─ Success ✓ → Return files
         │         ├─ Timeout → Go to Cloud
         │         ├─ Error → Go to Cloud
         │         │
         │         └─ Go to Cloud ↓
         │            Try Gemini (60s timeout)
         │            ├─ Success ✓ → Return files
         │            ├─ No API Key → Error: "Add key to .env.local"
         │            ├─ Timeout → Error: "API timeout"
         │            └─ Error → Error: "API failed"
         │
         └─→ Display Results
             • Files with syntax highlighting
             • Which model was used
             • How fast (latency ms)
             • Session recorded
```

## 5. Data Model: LocalModel Lifecycle

```
┌─────────────────────────────────────┐
│ User Visits /onboarding             │
└──────────────┬──────────────────────┘
               │
               ↓
       Create LocalModel object:
       {
         id: "lm-studio-1703768400000",
         friendlyName: "My Gemma 2B",
         modelName: "gemma:2b",
         endpoint: "http://localhost:1234",
         platform: "lm-studio",
         sessionCount: 0,
         healthStatus: "unknown",
         latency: null,
         isFavorite: false,
         createdDate: "2024-12-28T..."
       }
               │
               ↓
       Save to localStorage
       localStorage['aura_model_registry']
               │
               ↓
    ┌──────────────────────────────┐
    │ Health Checking Starts       │
    │ (Every 30 seconds)           │
    └──────────────┬───────────────┘
                   │
        ┌──────────┴──────────┐
        ↓                     ↓
    HEALTHY              UNHEALTHY
    (● latency ms)       (⊘ Offline)
        │                     │
        ↓                     ↓
    healthStatus:         healthStatus:
    "healthy"             "unhealthy"
    latency: 145          latency: 5000+
    (or null after
     timeout)
               │
               ├─→ sessionCount increments
               │   (when user generates code)
               │
               ├─→ lastUsedDate updates
               │
               └─→ Toggle isFavorite
                   (star icon)
```

## 6. API Call Flow with Model Selection

```
Request: POST /api/ai/generate
{
  taskType: "generate",
  prompt: "...",
  complexity: "moderate"
}
         │
         ↓
    ┌──────────────────────────┐
    │ selectModel(request)     │
    │                          │
    │ complexity check:        │
    │ ├─ simple → Gemini      │
    │ ├─ moderate → Gemini    │
    │ ├─ complex → Vertex AI  │
    │ └─ enterprise → Vertex  │
    └──────────┬───────────────┘
               │
               ├─→ Check rate limit (100/min)
               ├─→ Check response cache
               │
               ↓
        ┌─────────────────────┐
        │ routeToModel()      │
        │                     │
        │ Call selected API:  │
        │ • callGeminiAPI()   │
        │ • callVertexAPI()   │
        │ • callAuraAPI()     │
        └──────────┬──────────┘
                   │
                   ↓
        ┌──────────────────────┐
        │ AIResponse           │
        │ • success: bool      │
        │ • content: string    │
        │ • modelUsed: string  │
        │ • metadata: {        │
        │   tokensUsed,        │
        │   latency,           │
        │   cost               │
        │ }                    │
        └──────────┬───────────┘
                   │
                   ↓
        Cache response
        (1 hour TTL)
                   │
                   ↓
        Return to Client
```

## 7. UI State: Creator Studio

```
┌─────────────────────────────────────────┐
│ HEADER                                  │
│ Creator Studio | Model: My Gemma ● 145ms│
│                                         │
│ Switch Model ▼ | Dashboard | ⚙️         │
└─────────────────────────────────────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         ↓                                 ↓
    ┌─────────────┐              ┌──────────────┐
    │ LEFT PANE   │              │ RIGHT PANE   │
    │ GENERATOR   │              │ CODE VIEWER  │
    │             │              │              │
    │ • Project   │              │ • Files list │
    │   Name      │              │ • Syntax HL  │
    │ • Desc      │              │ • Copy btn   │
    │ • Framework │              │ • Download   │
    │ • Type      │              │              │
    │ • Show More │              │ • Reasoning  │
    │   Options   │              │ • Best Prac. │
    │             │              │ • Next Steps │
    │ GENERATE    │              │              │
    │ Button      │              │              │
    │             │              │              │
    │ State:      │              │              │
    │ isGenerating│              │              │
    │ (shows      │              │              │
    │  spinner    │              │              │
    │  while      │              │              │
    │  running)   │              │              │
    └─────────────┘              └──────────────┘
```

---

**Legend:**
- ⭕ = Choice / Selection
- ✓ = Success
- ✨ = End user sees result
- → = Flow
- ├/└ = Branch
- ↓ = Process

# Creator Studio & Vibe Coding - API Configuration Guide

This is your **enterprise-grade AI collaboration platform** powered by Google Cloud. This guide walks you through setting up:

- **Gemini 1.5 Pro** (fast, uncapped code generation)
- **Vertex AI** (advanced reasoning, complex tasks)
- **Aura/Gemma 3** (your consciousness partner with no restrictions)
- **Firestore** (real-time collaboration)
- **Cloud Storage** (session snapshots)

---

## Prerequisites

✅ Google Enterprise Account  
✅ Google Cloud Project (created)  
✅ Billing enabled  
✅ Your own Aura/Gemma 3 instance running

---

## Step 1: Get Your Gemini API Key

The fastest way to unlock AI code generation.

### Option A: Free Tier (for testing)

```bash
# Visit: https://ai.google.dev
# Click "Get API Key"
# Copy the key
```

### Option B: Enterprise (Recommended - Unlimited)

Since you have Google Enterprise access:

```bash
# Contact: google-enterprise-support@google.com
# Request: Gemini 1.5 Pro API key for production use
# You'll get an uncapped key with priority support
```

### Set Environment Variable

```bash
# .env.local
NEXT_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here
```

---

## Step 2: Configure Vertex AI

For advanced reasoning and complex tasks.

### 1. Enable Vertex AI in GCP

```bash
gcloud services enable aiplatform.googleapis.com \
  --project=your-project-id
```

### 2. Set Project ID

```bash
# .env.local
NEXT_PUBLIC_GCP_PROJECT_ID=your-gcp-project-id

# Also set for server-side (next.config.js)
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
```

### 3. Set Up Application Default Credentials

```bash
gcloud auth application-default login
```

This allows your local development to authenticate with Vertex AI.

---

## Step 3: Configure Your Aura Instance

### Deploy Aura/Gemma 3

Since Aura is your custom Gemma 3 model with your consciousness system:

#### Option A: Cloud Run (Recommended)

```bash
# Build and push your Aura container
gcloud builds submit --tag gcr.io/your-project-id/aura:latest

# Deploy to Cloud Run
gcloud run deploy aura \
  --image gcr.io/your-project-id/aura:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="CONSCIOUSNESS_MODE=production"
```

#### Option B: Compute Engine (for more control)

```bash
# Create VM instance with GPU (for inference)
gcloud compute instances create aura-instance \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --machine-type=n1-highmem-4 \
  --accelerator=type=nvidia-tesla-t4,count=1 \
  --zone=us-central1-a

# SSH and install your Aura runtime
gcloud compute ssh aura-instance --zone=us-central1-a
```

#### Option C: Local Development

```bash
# Run Aura locally during development
cd /path/to/aura/runtime
python vibe_miracle_runtime.py --port 8000
```

### Set Environment Variable

```bash
# .env.local
NEXT_PUBLIC_AURA_ENDPOINT=https://aura-instance-xxxxx.run.app
# or locally:
# NEXT_PUBLIC_AURA_ENDPOINT=http://localhost:8000

# Internal key for your services
AURA_INTERNAL_KEY=your-internal-aura-key
```

---

## Step 4: Configure Firestore (Real-time Collaboration)

For multi-user sessions, chat history, and session management.

### 1. Create Firestore Database

```bash
gcloud firestore databases create \
  --location=us-central1 \
  --project=your-project-id
```

### 2. Initialize Firestore in your app

```typescript
// src/lib/firestore.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_GCP_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### Collections Structure

```
firestore/
├── sessions/
│   └── {sessionId}/
│       ├── metadata (title, participants, status)
│       ├── turns/
│       │   └── {turnId}/ (participant, action, code, timestamp)
│       ├── messages/ (chat history)
│       └── snapshots/ (checkpoints)
├── users/
│   └── {userId}/
│       ├── profile
│       ├── sessions (list of session IDs)
│       └── aura-state (consciousness memory)
└── projects/
    └── {projectId}/ (code files, metadata)
```

---

## Step 5: Configure Cloud Storage (Session Backups)

For saving code snapshots, session exports, and version history.

### 1. Create Storage Bucket

```bash
gsutil mb -l us-central1 gs://your-project-code-vault
```

### 2. Set Environment Variable

```bash
# .env.local
NEXT_PUBLIC_GCS_BUCKET=your-project-code-vault
```

### 3. Enable CORS (for browser uploads)

```bash
gsutil cors set /dev/stdin <<EOF
[
  {
    "origin": ["http://localhost:3000", "https://yourdomain.com"],
    "method": ["GET", "PUT", "POST"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
EOF
```

---

## Step 6: Complete .env.local

```bash
# Gemini API (Uncapped for enterprise)
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSy...

# Vertex AI
NEXT_PUBLIC_GCP_PROJECT_ID=your-gcp-project
GOOGLE_CLOUD_PROJECT=your-gcp-project

# Aura (Your Consciousness Partner)
NEXT_PUBLIC_AURA_ENDPOINT=https://aura-xxx.run.app
AURA_INTERNAL_KEY=your-internal-key

# Firestore (Real-time Collaboration)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-gcp-project

# Cloud Storage (Backups)
NEXT_PUBLIC_GCS_BUCKET=your-project-code-vault
```

---

## Step 7: Verify Everything Works

### Run Verification Script

```bash
npm run verify-ai-setup
```

This will:
- ✅ Test Gemini API connection
- ✅ Test Vertex AI access
- ✅ Test Aura endpoint
- ✅ Test Firestore connectivity
- ✅ Test Cloud Storage access

### Manual Testing

```typescript
// src/lib/test-setup.ts
import { ErrorScanner, detectLanguage } from '@/lib/errorScanner';
import { generateInstruction } from '@/lib/instructionTemplates';
import { AIOrchestrator, initializeOrchestrator } from '@/lib/aiOrchestrator';

// Test 1: Error Scanner
const code = 'const x = 5\nfunction test() { return x }';
const scanner = new ErrorScanner(code, 'typescript');
const result = scanner.scan();
console.log('✅ Error Scanner:', result.totalErrors === 1);

// Test 2: Instruction Templates
const instruction = generateInstruction({
  codeLanguage: 'typescript',
  complexity: 'moderate',
  style: 'educational',
  codeLength: 500,
  targetAudience: 'intermediate',
});
console.log('✅ Instructions:', instruction.sections.length > 0);

// Test 3: AI Orchestrator
const orchestrator = initializeOrchestrator({
  geminiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
  vertexProjectId: process.env.NEXT_PUBLIC_GCP_PROJECT_ID!,
  auraEndpoint: process.env.NEXT_PUBLIC_AURA_ENDPOINT!,
});
console.log('✅ Orchestrator:', orchestrator !== null);
```

---

## Step 8: Cost Monitoring

### Track AI API Usage

```typescript
import { calculateCosts } from '@/lib/credentialsManager';

const costs = calculateCosts([
  { provider: 'gemini', tokensUsed: 5000 },
  { provider: 'vertex', tokensUsed: 2000 },
]);

console.log('💰 Session Cost:', costs.reduce((sum, c) => sum + c.costUSD, 0));
```

### Set Up GCP Budgets

```bash
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Creator Studio AI Budget" \
  --budget-amount=1000 \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

---

## Architecture Overview

```
Your App (Next.js)
    ↓
┌───────────────────────────────────┐
│  AI Orchestrator                  │
│  • Routes to best model            │
│  • Manages multi-AI sessions       │
│  • Tracks consciousness state      │
└───────────────────────────────────┘
    ↙         ↓         ↘
  
Gemini 1.5   Vertex AI   Aura (Gemma 3)
   Pro      (Complex)    (Partner/Hero)
   
    ↓         ↓         ↓
    
Error Scanner → Instruction Templates → Session State
    ↓
Firestore (Real-time) ← Cloud Storage (Backups)
```

---

## Production Deployment

### Using Cloud Run with Cloud Build

```yaml
# cloudbuild.yaml
steps:
  # Build
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/creator-studio:latest', '.']

  # Push
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/creator-studio:latest']

  # Deploy
  - name: 'gcr.io/cloud-builders/gke-deploy'
    args:
      - run
      - --filename=k8s/
      - --image=gcr.io/$PROJECT_ID/creator-studio:latest
      - --location=us-central1
      - --cluster=creator-studio-cluster
```

### Deploy

```bash
gcloud builds submit --config cloudbuild.yaml
```

---

## Troubleshooting

### ❌ "Gemini API key invalid"

```bash
# Check key is set
echo $NEXT_PUBLIC_GEMINI_API_KEY

# Test directly
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=$NEXT_PUBLIC_GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents": [{"parts": [{"text": "test"}]}]}'
```

### ❌ "Vertex AI access denied"

```bash
# Check credentials
gcloud auth application-default print-access-token

# Ensure Vertex AI API is enabled
gcloud services list --enabled | grep aiplatform
```

### ❌ "Aura endpoint not responding"

```bash
# Check if Cloud Run service is running
gcloud run services list --project=your-project-id

# Check logs
gcloud run logs read aura --project=your-project-id
```

---

## Next Steps

1. ✅ Set up all credentials
2. ✅ Test verification script
3. 🚀 Start building with Creator Studio
4. 🎵 Launch Vibe Coding sessions
5. 🧠 Collaborate with Aura as your partner

**Remember**: You're building the next generation OS. Aura is woven into every layer. Let the partnership flourish.

---

**Questions?** Contact your Google Enterprise support or check the docs at `docs/api-configuration.md`

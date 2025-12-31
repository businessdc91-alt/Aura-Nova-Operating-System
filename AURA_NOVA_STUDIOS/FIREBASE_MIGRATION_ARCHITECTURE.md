# Firebase Migration Architecture Guide

> **Status**: Planning & Design Phase
> **Priority**: High - Required for production deployment
> **Complexity**: High - Multi-service refactor

## Executive Summary

This guide maps the path to transform Aura Nova Creator Studio from a **single-user, localStorage-based prototype** into a **multi-user, cloud-backed, real-time Firebase application**. The challenge isn't the technology—it's maintaining feature parity while adding collaboration, persistence, and scale.

---

## 1. Current State → Target State

### Current Architecture
```
┌─────────────────────────────────────────┐
│         Next.js Frontend (Client)        │
│  ┌─────────────────┬─────────────────┐   │
│  │  React Component │  Hooks/Srvcs    │   │
│  │  (UI Logic)      │  (localStorage) │   │
│  └─────────────────┴─────────────────┘   │
└────────┬──────────────────────────────────┘
         │ Occasional Cloud Calls
         │ (Gemini, Claude)
         │
    ┌────▼──────────┐
    │ External APIs │
    │ (LM Studio,   │
    │  Ollama,      │
    │  Gemini)      │
    └───────────────┘

Data: localStorage (single device, ~5MB limit)
Auth: None
Real-time: Polling only
Collaboration: Single-user only
```

### Target Architecture
```
┌──────────────────────────────────────────────┐
│      Next.js Frontend + Real-time Sync        │
│  ┌────────────────────────────────────────┐  │
│  │ React Components + Hooks                │  │
│  │ Firestore Listeners (real-time)         │  │
│  │ Firebase Storage (uploads)              │  │
│  │ Authentication UI                       │  │
│  └────────────────────────────────────────┘  │
└──────────────┬───────────────────────────────┘
               │
        ┌──────▼──────────────┐
        │   Firebase Suite     │
        │  ┌────────────────┐  │
        │  │ Authentication │  │
        │  │ Firestore (DB) │  │
        │  │ Storage (Files)│  │
        │  │ Functions      │  │
        │  │ Hosting        │  │
        │  └────────────────┘  │
        └──────┬───────────────┘
               │
        ┌──────▼──────────────┐
        │  External Services   │
        │  ┌────────────────┐  │
        │  │ Local AI       │  │
        │  │ Cloud AI APIs  │  │
        │  │ Webhooks       │  │
        │  └────────────────┘  │
        └────────────────────┘

Data: Firestore (distributed, real-time, 1GB free tier)
Auth: Firebase Auth (email, Google, GitHub, etc.)
Real-time: Firestore listeners
Collaboration: Multi-user with permissions
```

---

## 2. Firestore Data Model

### Collections Structure

```
firestore/
├── users/
│   ├── {userId}/
│   │   ├── profile (document)
│   │   │   ├── displayName: string
│   │   │   ├── email: string
│   │   │   ├── avatar: string (storage URL)
│   │   │   ├── createdAt: timestamp
│   │   │   ├── updatedAt: timestamp
│   │   │   └── preferences: object
│   │   │       ├── theme: 'dark' | 'light'
│   │   │       ├── defaultAIModel: string
│   │   │       └── autoSave: boolean
│   │   │
│   │   ├── models/ (subcollection)
│   │   │   ├── {modelId}/
│   │   │   │   ├── platform: 'lm-studio' | 'ollama' | 'gemini' | 'vertex' | 'claude'
│   │   │   │   ├── friendlyName: string
│   │   │   │   ├── modelName: string
│   │   │   │   ├── endpoint: string
│   │   │   │   ├── health: object
│   │   │   │   │   ├── status: 'healthy' | 'degraded' | 'offline'
│   │   │   │   │   ├── lastChecked: timestamp
│   │   │   │   │   └── latencyMs: number
│   │   │   │   ├── createdAt: timestamp
│   │   │   │   ├── favorites: boolean
│   │   │   │   └── sessionCount: number
│   │   │   │
│   │   │
│   │   ├── projects/ (subcollection)
│   │   │   ├── {projectId}/
│   │   │   │   ├── name: string
│   │   │   │   ├── type: 'web' | 'game' | 'script' | 'component'
│   │   │   │   ├── description: string
│   │   │   │   ├── language: string
│   │   │   │   ├── createdAt: timestamp
│   │   │   │   ├── updatedAt: timestamp
│   │   │   │   ├── aiModel: string (friendly name)
│   │   │   │   ├── content: object
│   │   │   │   │   ├── files: array<{name, language, content}>
│   │   │   │   │   ├── reasoning: string
│   │   │   │   │   └── metadata: object
│   │   │   │   ├── status: 'draft' | 'published' | 'archived'
│   │   │   │   └── tags: array<string>
│   │   │   │
│   │   │   └── {projectId}/
│   │   │       └── versions/ (subcollection - history)
│   │   │           ├── {versionId}/
│   │   │           │   ├── timestamp: timestamp
│   │   │           │   ├── content: object
│   │   │           │   ├── aiModel: string
│   │   │           │   └── changelog: string
│   │   │           │
│   │   │
│   │   ├── generations/ (subcollection - cache)
│   │   │   ├── {generationId}/
│   │   │   │   ├── prompt: string
│   │   │   │   ├── result: object
│   │   │   │   ├── model: string
│   │   │   │   ├── latency: number
│   │   │   │   ├── timestamp: timestamp
│   │   │   │   └── tags: array<string>
│   │   │   │
│   │   │
│   │   └── sessions/ (subcollection)
│   │       ├── {sessionId}/
│   │       │   ├── startTime: timestamp
│   │       │   ├── endTime: timestamp
│   │       │   ├── activeModel: string
│   │       │   ├── requestCount: number
│   │       │   ├── totalTokens: object
│   │       │   │   ├── input: number
│   │       │   │   └── output: number
│   │       │   └── cost: number
│   │       │
│   │
├── sharedProjects/ (collection - for sharing)
│   ├── {sharedProjectId}/
│   │   ├── ownerId: string
│   │   ├── ownerName: string
│   │   ├── projectId: string (reference)
│   │   ├── sharedWith: array<{userId, email, access: 'view' | 'edit'}>
│   │   ├── createdAt: timestamp
│   │   ├── permissions: object
│   │   │   ├── allowDownload: boolean
│   │   │   ├── allowFork: boolean
│   │   │   └── expiresAt: timestamp (optional)
│   │   │
│   │
├── publicGallery/ (collection - marketplace)
│   ├── {galleryItemId}/
│   │   ├── projectId: string
│   │   ├── userId: string
│   │   ├── title: string
│   │   ├── description: string
│   │   ├── thumbnail: string (storage URL)
│   │   ├── downloads: number
│   │   ├── rating: number (0-5)
│   │   ├── tags: array<string>
│   │   ├── isPublic: boolean
│   │   ├── createdAt: timestamp
│   │   ├── updatedAt: timestamp
│   │   └── featured: boolean
│   │
│   │
└── metrics/ (collection - analytics)
    ├── {date-YYYY-MM-DD}/
    │   ├── totalUsers: number
    │   ├── activeUsers: number
    │   ├── apiCalls: object
    │   │   ├── local: number
    │   │   ├── gemini: number
    │   │   ├── claude: number
    │   │   └── vertex: number
    │   ├── avgLatency: number
    │   ├── errors: object
    │   │   ├── count: number
    │   │   └── types: object
    │   ├── totalTokensUsed: object
    │   │   ├── input: number
    │   │   └── output: number
    │   └── estimatedCost: number
    │
```

### Key Design Decisions

1. **Hierarchical Collections**: User data nested under `users/{userId}` for easy permission management
2. **Subcollections for Scale**: `models/`, `projects/`, `generations/` prevent document size limits
3. **Timestamps**: All date/time is `firestore.Timestamp` for consistency
4. **Soft Delete**: No hard deletes—set `status: 'archived'` instead
5. **Version History**: Kept separate to avoid document size bloat
6. **Caching Strategy**: `generations/` stores recent AI outputs for deduplication

---

## 3. Firebase Services Integration

### 3.1 Authentication
```typescript
// Current: None
// Target: Firebase Auth

Service Config:
- Firebase Auth providers:
  ✓ Email/Password
  ✓ Google (OAuth)
  ✓ GitHub (OAuth)
  ✓ Anonymous (for demo)

Security Rules:
- User can only access their own data
- Creator owns shared project permissions
- Public gallery is read-only for non-owners
```

### 3.2 Firestore Database
```typescript
// Current: localStorage
// Target: Firestore (Realtime + Analytics)

Tier Selection:
- Development: Blaze (Pay as you go)
- Free Tier Limits:
  ✓ 1GB storage
  ✓ 50,000 reads/day
  ✓ 20,000 writes/day
  
Scalability:
- Optimize with composite indexes for:
  [users > projects > status + createdAt]
  [publicGallery > featured + downloads DESC]
- Batch writes for version history
```

### 3.3 Cloud Storage
```typescript
// Current: None
// Target: Firebase Storage

Bucket Structure:
/uploads/
  ├── {userId}/
  │   ├── avatars/
  │   ├── projects/
  │   │   ├── {projectId}/
  │   │   │   ├── code/
  │   │   │   ├── assets/
  │   │   │   └── preview.html
  │   │   │
  │   └── generated/
  │       └── {generationId}.json
  │
  └── public/
      ├── gallery/
      └── showcases/

Security:
- Authenticated users can write to /uploads/{userId}/*
- Public gallery readable to all
- Enforce file size limits (10MB max per file)
```

### 3.4 Cloud Functions
```typescript
// Serverless compute for background tasks

Functions Needed:

1. onProjectCreated()
   - Trigger: Firestore write to projects/
   - Action: Generate thumbnail, index for search
   - Timeout: 60s

2. onProjectUpdated()
   - Trigger: Firestore update to projects/
   - Action: Update search index, invalidate cache
   - Timeout: 30s

3. onGenerationCompleted()
   - Trigger: HTTP (from frontend)
   - Action: Store in Firestore, check for duplicates
   - Timeout: 30s

4. cleanupOldSessions()
   - Trigger: Cloud Scheduler (daily)
   - Action: Archive sessions > 30 days old
   - Timeout: 300s

5. calculateMetrics()
   - Trigger: Cloud Scheduler (daily)
   - Action: Aggregate usage, costs, errors
   - Timeout: 300s

6. sendNotification()
   - Trigger: Custom (generation complete, share request)
   - Action: Send email/push notification
   - Timeout: 30s

Runtime: Node.js 20 (or Python 3.11)
Memory: 256MB standard (increase for heavy processing)
```

### 3.5 Firestore Security Rules
```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profile - only user can read/write own
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // User's subcollections
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }

    // Shared projects - viewer access
    match /sharedProjects/{doc} {
      allow read: if request.auth.uid in resource.data.sharedWith[*].userId;
      allow write: if request.auth.uid == resource.data.ownerId;
    }

    // Public gallery - anyone can read
    match /publicGallery/{doc} {
      allow read: if resource.data.isPublic == true;
      allow write: if request.auth.uid == resource.data.userId;
    }

    // Metrics - admin only
    match /metrics/{doc} {
      allow read, write: if isAdmin(request.auth.uid);
    }
  }
  
  function isAdmin(uid) {
    return exists(/databases/$(database)/documents/admins/$(uid));
  }
}
```

---

## 4. Migration Strategy

### Phase 1: Setup (Week 1)
```
├─ Create Firebase project
├─ Configure authentication
├─ Create Firestore database
├─ Set up Cloud Storage bucket
├─ Deploy initial security rules
└─ Set up monitoring/logging
```

**Deliverable**: Empty Firebase project, all services ready

### Phase 2: Data Layer (Week 2-3)
```
├─ Create service layer abstraction:
│  ├─ FirestoreUserService
│  ├─ FirestoreProjectService
│  ├─ FirestoreGenerationService
│  └─ FirestoreSessionService
│
├─ Create migration utilities:
│  ├─ localStorage → Firestore converter
│  ├─ Batch import for existing users
│  └─ Verification scripts
│
└─ Update hooks:
    ├─ useModelRegistry → Firestore listener
    ├─ useCodeGeneration → Add to Firestore cache
    └─ useActiveModel → Real-time sync
```

**Deliverable**: Data services + hooks using Firestore instead of localStorage

### Phase 3: Auth & Sharing (Week 3-4)
```
├─ Implement Firebase Auth:
│  ├─ Login page
│  ├─ Signup flow
│  ├─ Logout + session management
│  └─ Anonymous auth for demo
│
├─ Add sharing features:
│  ├─ Share project by email
│  ├─ Manage access levels
│  └─ Share link generation
│
└─ Update permissions:
    ├─ Row-level security
    └─ Creator → Viewer/Editor access
```

**Deliverable**: Full auth system + sharing UI

### Phase 4: Real-time Sync (Week 4-5)
```
├─ Firestore listeners for:
│  ├─ Projects list
│  ├─ Active project (watch for changes)
│  └─ Generations cache
│
├─ Conflict resolution:
│  ├─ Last-write-wins strategy (or)
│  ├─ Manual merge for important fields
│  └─ Version history
│
└─ Offline support (optional):
    ├─ Enable Firestore offline persistence
    └─ Queue writes when offline
```

**Deliverable**: Real-time multi-user editing

### Phase 5: Cloud Functions (Week 5-6)
```
├─ Deploy:
│  ├─ onProjectCreated
│  ├─ onGenerationCompleted
│  ├─ cleanupOldSessions
│  └─ calculateMetrics
│
├─ Implement:
│  ├─ Search indexing
│  ├─ Email notifications
│  └─ Cost tracking
│
└─ Test:
    ├─ Trigger manually
    └─ Monitor logs
```

**Deliverable**: Serverless backend processing

### Phase 6: Deployment & Optimization (Week 6-7)
```
├─ Firebase Hosting:
│  ├─ Connect to Next.js
│  ├─ Configure rewrites
│  └─ Set up CDN
│
├─ Performance:
│  ├─ Add Firestore indexes
│  ├─ Optimize security rules
│  └─ Set up caching
│
├─ Monitoring:
│  ├─ Firebase Console
│  ├─ Custom alerts
│  └─ Cost tracking
│
└─ Documentation:
    ├─ API docs
    ├─ Architecture diagram
    └─ Runbooks
```

**Deliverable**: Production-ready Firebase deployment

---

## 5. Code Migration Examples

### Before (localStorage)
```typescript
// Hook: useModelRegistry
const models = JSON.parse(localStorage.getItem('models') || '[]');
setModels(models);
localStorage.setItem('models', JSON.stringify(updatedModels));
```

### After (Firestore)
```typescript
// Hook: useModelRegistry (Firestore version)
const [models, setModels] = useState<LocalModel[]>([]);

useEffect(() => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const unsubscribe = onSnapshot(
    collection(db, 'users', userId, 'models'),
    (querySnapshot) => {
      const modelsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as LocalModel[];
      setModels(modelsData);
    },
    (error) => console.error('Error fetching models:', error)
  );

  return unsubscribe;
}, [auth.currentUser]);

// Add model
const addModel = async (model: Omit<LocalModel, 'id'>) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  const docRef = await addDoc(
    collection(db, 'users', userId, 'models'),
    {
      ...model,
      createdAt: serverTimestamp(),
    }
  );

  return docRef.id;
};
```

### Service Layer
```typescript
// FirestoreProjectService
export class FirestoreProjectService {
  static async getProject(
    userId: string,
    projectId: string
  ): Promise<Project> {
    const docSnap = await getDoc(
      doc(db, 'users', userId, 'projects', projectId)
    );
    if (!docSnap.exists()) throw new Error('Project not found');
    return { id: docSnap.id, ...docSnap.data() } as Project;
  }

  static async listProjects(userId: string): Promise<Project[]> {
    const querySnapshot = await getDocs(
      collection(db, 'users', userId, 'projects')
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[];
  }

  static async createProject(
    userId: string,
    data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    const docRef = await addDoc(
      collection(db, 'users', userId, 'projects'),
      {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    );
    return docRef.id;
  }

  static async updateProject(
    userId: string,
    projectId: string,
    data: Partial<Project>
  ): Promise<void> {
    await updateDoc(doc(db, 'users', userId, 'projects', projectId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }

  static async shareProject(
    userId: string,
    projectId: string,
    sharedWith: Array<{ email: string; access: 'view' | 'edit' }>
  ): Promise<void> {
    await addDoc(collection(db, 'sharedProjects'), {
      ownerId: userId,
      projectId,
      sharedWith,
      createdAt: serverTimestamp(),
    });
  }
}
```

---

## 6. Testing Strategy

### Unit Tests
- Firestore service methods (mocked)
- Security rule evaluation
- Data transformation logic

### Integration Tests
- Auth flow (signup, login, logout)
- Create/read/update operations
- Sharing permissions

### E2E Tests
- Full user journey: signup → create project → share → view
- Real-time sync between users
- Offline behavior (if enabled)

### Load Testing
- Simulate 100+ concurrent users
- Stress test Firestore indices
- Monitor function execution time

---

## 7. Cost Estimation

### Monthly Estimates (10,000 active users)

| Service | Usage | Cost |
|---------|-------|------|
| **Firestore** | 1M reads, 500K writes, 100GB | $45 |
| **Cloud Storage** | 500GB @ $0.18/GB | $90 |
| **Cloud Functions** | 100K invocations × 1.2s | $20 |
| **Firebase Hosting** | 500GB bandwidth | $15 |
| **Authentication** | 10K signups/month | Free* |
| | **Total** | **~$170/month** |

*Firebase Auth is included; costs only for enterprise features

**Free Tier**: Can run small projects (<100 active users) completely free

---

## 8. Production Checklist

```
Pre-Launch
├─ ☐ All security rules tested
├─ ☐ Firestore indexes created
├─ ☐ Cloud Functions deployed + monitored
├─ ☐ Error logging configured
├─ ☐ Rate limiting enabled
├─ ☐ GDPR compliance review
├─ ☐ Data backup strategy
├─ ☐ Disaster recovery plan
├─ ☐ Load testing completed
└─ ☐ Documentation complete

Launch
├─ ☐ Blue-green deployment
├─ ☐ Gradual rollout (10% → 50% → 100%)
├─ ☐ Monitor error rates
├─ ☐ Monitor latency
├─ ☐ Support team on standby
└─ ☐ Rollback plan ready

Post-Launch
├─ ☐ Daily metrics review (Week 1)
├─ ☐ Weekly review (Month 1)
├─ ☐ Monthly review (Ongoing)
├─ ☐ Cost optimization
└─ ☐ User feedback loop
```

---

## 9. Recommended Implementation Approach

### Option A: Big Bang (Risky but Fast)
```
Timeline: 6-7 weeks
Strategy: Migrate entire app at once
Pros: Simpler data consistency
Cons: High risk, full downtime needed
Risk Level: 🔴 High
```

### Option B: Parallel Run (Recommended)
```
Timeline: 8-10 weeks
Strategy:
1. Deploy Firestore services alongside localStorage
2. Sync both for 2-3 weeks (verify consistency)
3. Switch primary to Firestore
4. Keep localStorage as fallback for 1-2 weeks
5. Remove localStorage code

Pros: Low risk, can rollback, verify consistency
Cons: Extra code complexity during transition
Risk Level: 🟡 Medium
```

### Option C: Gradual Rollout (Safest)
```
Timeline: 10-12 weeks
Strategy:
1. Launch beta to 10% of users
2. Monitor for 1 week
3. Expand to 50%
4. Monitor for 1 week
5. Full rollout

Pros: Catch issues early, minimal impact
Cons: Longest timeline, complex feature flags
Risk Level: 🟢 Low
```

**Recommendation**: Option B (Parallel Run) - Best balance of speed and safety

---

## 10. Next Steps

1. **Immediate** (This week):
   - [ ] Create Firebase project
   - [ ] Set up service account
   - [ ] Deploy placeholder security rules
   - [ ] Configure Next.js SDK integration

2. **Short-term** (Next 2 weeks):
   - [ ] Build Firestore service layer
   - [ ] Update React hooks to use Firestore
   - [ ] Create data migration scripts
   - [ ] Set up local Firestore emulator for testing

3. **Medium-term** (Weeks 3-6):
   - [ ] Implement Firebase Auth
   - [ ] Deploy Cloud Functions
   - [ ] Add sharing features
   - [ ] Set up Firebase Hosting

4. **Long-term** (Week 7+):
   - [ ] Performance optimization
   - [ ] Advanced features (analytics, notifications)
   - [ ] Scale to production

---

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Cloud Functions Guide](https://cloud.google.com/functions/docs)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/overview)
- [Next.js + Firebase](https://www.npmjs.com/package/firebase)

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Status**: Ready for Implementation Planning

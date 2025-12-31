# Aura Nova Studios - Firebase Deployment Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────┐
│              Aura Nova Studios - Firebase               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Frontend (Next.js)                       │  │
│  │  - Deployed to Firebase Hosting                  │  │
│  │  - Domain: your-project.web.app                  │  │
│  │  - Also deployed to GitHub Pages                 │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↓                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │    Firebase Realtime Services                    │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │ Authentication (Firebase Auth)             │ │  │
│  │  │ - Email/Password, Google, GitHub OAuth     │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │ Firestore Database                         │ │  │
│  │  │ - User profiles & settings                 │ │  │
│  │  │ - Chat history & messages                  │ │  │
│  │  │ - Real-time sync enabled                   │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │ Realtime Database (Optional)               │ │  │
│  │  │ - WebSocket connections                    │ │  │
│  │  │ - Instant updates                          │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────┐ │  │
│  │  │ Cloud Storage                              │ │  │
│  │  │ - User avatars & media                     │ │  │
│  │  │ - File uploads                             │ │  │
│  │  └────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                        ↓                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │       Backend (Cloud Functions / App Engine)    │  │
│  │  - Deployed to Firebase Functions               │  │
│  │  - Express.js APIs                              │  │
│  │  - Firestore integration                        │  │
│  │  - Scheduled tasks                              │  │
│  │  - Real-time triggers                           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         CI/CD Pipeline (GitHub Actions)         │  │
│  │  - Automated tests on PR                        │  │
│  │  - Build & deploy on push to main               │  │
│  │  - Deploy to GitHub Pages                       │  │
│  │  - Environment variables via GitHub Secrets     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
web_platform/
├── firebase.json              # Firebase configuration
├── .firebaserc                # Project ID configuration
├── .env.example               # Environment variables template
├── .env.local                 # Your local environment (gitignored)
│
├── frontend/                  # Next.js Frontend
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.config.ts    # Firebase initialization
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   ├── next.config.mjs
│   └── tsconfig.json
│
├── backend/                   # Cloud Functions / Backend
│   ├── src/
│   │   ├── index.ts                    # Main entry point
│   │   ├── firebase-integration.ts    # Firebase Functions
│   │   └── handlers/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.local
│
└── ...

.github/
├── workflows/
│   ├── firebase-deploy.yml      # Deploy to Firebase
│   └── deploy-pages.yml         # Deploy to GitHub Pages
```

## Deployment Environments

### Development
- **Frontend:** `http://localhost:3000`
- **Backend:** `http://localhost:5001`
- **Firestore:** `http://localhost:8080`
- **Firebase Emulator:** `firebase emulators:start`

### Staging
- **URL:** `staging-your-project.web.app`
- **Database:** Staging Firestore instance
- **Manual:** `firebase deploy --only hosting,functions --project staging`

### Production
- **URL:** `your-project.web.app`
- **Database:** Production Firestore
- **Auto-deployment:** On push to `main` branch via GitHub Actions

## Data Flow

1. **User → Frontend**
   - Next.js serves the web application
   - Firebase Auth handles authentication
   - Firestore SDK enables real-time data sync

2. **Frontend → Backend APIs**
   - REST calls to Cloud Functions
   - WebSocket for real-time features
   - Authentication via Firebase tokens

3. **Backend → Firestore**
   - Create, read, update, delete operations
   - Batch operations for consistency
   - Real-time listeners for triggers

4. **Firestore Triggers → Actions**
   - Auto-cleanup old data
   - Send notifications
   - Update search indexes
   - Generate reports

## Key Firebase Services Used

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Hosting** | Serve Next.js static files | 10 GB/month |
| **Firestore** | NoSQL database | 1 GB storage |
| **Authentication** | User login/signup | Unlimited users |
| **Cloud Functions** | Serverless backend | 2M invocations/month |
| **Storage** | File uploads | 5 GB |
| **Realtime Database** | Real-time sync (optional) | 1 GB |

## Security & Permissions

### Firestore Rules Example
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read/write only their own profile
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Messages in conversations
    match /conversations/{conversationId}/messages/{messageId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
    }
    
    // Public data
    match /public/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### Storage Rules Example
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User uploads
    match /users/{userId}/uploads/{allPaths=**} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId && request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

## Monitoring & Debugging

### View Real-time Logs
```bash
firebase functions:log
```

### Check Deployment Status
```bash
firebase deploy --only hosting --project production
firebase deploy --only functions --project production
```

### Monitor Performance
- Firebase Console → Performance Tab
- Cloud Functions → Logs
- Firestore → Database Metrics

## Cost Optimization Tips

1. **Set Firestore TTL** - Auto-delete old documents
2. **Use Indexes** - Composite indexes for complex queries
3. **Batch Operations** - Combine writes to save operations
4. **Optimize Functions** - Minimize execution time
5. **Archive Old Data** - Move to Cloud Storage
6. **Use CDN** - Firebase Hosting includes global CDN

## Troubleshooting

### Build Failures
```bash
npm install -g firebase-tools@latest
firebase projects:list  # Verify authentication
```

### Deployment Hangs
- Check Firebase quota limits
- Verify .firebaserc configuration
- Deploy in stages: `firebase deploy --only hosting`

### Real-time Sync Not Working
- Verify Firestore rules allow access
- Check Firebase token validity
- Review browser console for errors

## Next Steps

1. ✅ Configure `.env.local` with Firebase credentials
2. ✅ Test locally with emulator
3. ✅ Deploy to Firebase: `firebase deploy`
4. ✅ Setup GitHub Secrets for CI/CD
5. ✅ Monitor in Firebase Console

See `FIREBASE_DEPLOYMENT_GUIDE.md` for detailed setup instructions.

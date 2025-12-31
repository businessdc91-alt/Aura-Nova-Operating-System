# Firebase Deployment Guide for Aura Nova Studios

## Prerequisites

1. **Firebase Account & Project**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Authenticate: `firebase login`

2. **Environment Variables Setup**

Create `.env.local` in `web_platform/` (or in respective frontend/backend folders):

```env
# Frontend (.env.local or .env.production.local)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Backend
FIREBASE_ADMIN_SDK_KEY=path/to/serviceAccountKey.json
DATABASE_URL=your_firestore_database_url
```

## Local Development Setup

### 1. Initialize Firebase in Your Project

```bash
cd web_platform
firebase init
```

**Select:**
- ✅ Hosting
- ✅ Functions
- ✅ Firestore Database
- ✅ Authentication
- ✅ Storage

### 2. Run Firebase Emulator Locally

```bash
firebase emulators:start
```

This starts:
- Hosting emulator: `http://localhost:5000`
- Functions emulator: `http://localhost:5001`
- Firestore emulator: `http://localhost:8080`
- Auth emulator: `http://localhost:9099`

### 3. Build & Test Frontend

```bash
cd web_platform/frontend
npm install
npm run build
npm run dev  # For development with Next.js
```

### 4. Test Backend Functions

```bash
cd web_platform/backend
npm install
npm run build
npm test
```

## Deployment Steps

### Option 1: Manual Deployment

```bash
cd web_platform

# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### Option 2: Automated Deployment (GitHub Actions)

The `.github/workflows/firebase-deploy.yml` automatically deploys on push to `main` or `develop`.

**Setup GitHub Secrets:**

1. Generate Firebase token:
   ```bash
   firebase login:ci
   ```

2. Add to GitHub repository secrets:
   - `FIREBASE_TOKEN` - from above command
   - `FIREBASE_API_KEY`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`

### Option 3: Deploy to GitHub Pages

The `.github/workflows/deploy-pages.yml` automatically deploys to GitHub Pages.

## Deployment Checklist

- [ ] Firebase project created
- [ ] `.env.local` configured with Firebase credentials
- [ ] Frontend builds successfully (`npm run build`)
- [ ] Backend functions compile without errors
- [ ] Firestore rules configured
- [ ] Authentication providers enabled (if needed)
- [ ] Storage bucket configured (if needed)
- [ ] GitHub secrets configured
- [ ] First deployment tested with `firebase deploy`

## Post-Deployment Verification

1. **Check Hosting:**
   ```bash
   firebase hosting:channel:list
   ```

2. **View Live Site:**
   ```bash
   https://your-project-id.web.app
   https://your-project-id.firebaseapp.com
   ```

3. **Monitor Functions:**
   - Firebase Console → Functions tab
   - Check logs: `firebase functions:log`

4. **Verify Database:**
   - Firebase Console → Firestore Database
   - Confirm data structure matches expectations

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Timeout
- Check Firebase quota limits
- Split deployment: `firebase deploy --only hosting`
- Increase timeout in firebase.json

### Functions Not Running
```bash
firebase functions:log
```

### CORS Issues
Configure in backend functions:
```typescript
response.setHeader('Access-Control-Allow-Origin', '*');
response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
```

## Performance Tips

1. **Enable CDN Caching:**
   - Configure headers in `firebase.json`
   
2. **Optimize Bundle:**
   - Use Next.js static optimization
   - Enable tree-shaking in TypeScript

3. **Monitor Performance:**
   - Firebase Console → Performance Monitoring
   - Analytics Dashboard

## CI/CD Configuration

GitHub Actions automatically:
1. Runs linting on pull requests
2. Builds frontend & backend
3. Deploys to Firebase on push to main
4. Runs tests on PRs

No manual deployment needed after GitHub setup!

## Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
- [Next.js Deployment](https://nextjs.org/docs/deployment/firebase)
- [Cloud Functions for Firebase](https://firebase.google.com/docs/functions)

# Aura Nova Studios - Firebase Deployment Checklist

## Pre-Deployment Setup (One Time)

### Firebase Project Setup
- [ ] Create Firebase project at https://firebase.google.com
- [ ] Enable billing (to use Cloud Functions and advanced features)
- [ ] Create web app in Firebase Console
- [ ] Copy Firebase config to `.env.local`

### Environment Configuration
- [ ] Copy `.env.example` to `.env.local` in `web_platform/`
- [ ] Add all Firebase configuration values
- [ ] Generate service account key (for backend)
- [ ] Store key securely (never commit to git)

### Local Development Setup
- [ ] Install Node.js 20+
- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Authenticate: `firebase login`
- [ ] Run: `npm install` in `web_platform/`
- [ ] Install backend deps: `npm install` in `web_platform/backend/`

### GitHub Repository Setup
- [ ] Create GitHub repository
- [ ] Push code: `git push origin main`
- [ ] Go to repo → Settings → Secrets and variables → Actions
- [ ] Add these secrets:
  - [ ] `FIREBASE_TOKEN` (from `firebase login:ci`)
  - [ ] `FIREBASE_API_KEY`
  - [ ] `FIREBASE_PROJECT_ID`
  - [ ] `FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `FIREBASE_APP_ID`

## Pre-Deployment Testing

### Local Emulator Testing
```bash
cd web_platform
firebase emulators:start
```
- [ ] Frontend loads at http://localhost:5000
- [ ] Functions available at http://localhost:5001
- [ ] Firestore emulator runs at http://localhost:8080
- [ ] No errors in console

### Build Verification
```bash
# Frontend
cd web_platform/frontend
npm run build

# Backend (if using Cloud Functions)
cd web_platform/backend
npm run build
```
- [ ] Frontend builds without errors
- [ ] Backend functions compile successfully
- [ ] No TypeScript errors

### Feature Testing
- [ ] Authentication works (login/signup)
- [ ] Can read/write to Firestore
- [ ] File uploads to Storage (if applicable)
- [ ] Real-time features sync correctly

## Deployment Steps

### Option A: Manual Deployment via CLI

#### Step 1: Configure Firebase Project
```bash
cd web_platform
firebase projects:list
firebase use --add
# Select your project from the list
```
- [ ] `.firebaserc` updated with correct project ID

#### Step 2: Configure Firestore Rules
Go to Firebase Console → Firestore Database → Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
- [ ] Rules set appropriately for your use case
- [ ] Published to Firestore

#### Step 3: Configure Storage Rules (if using)
Go to Firebase Console → Storage → Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/uploads/{allPaths=**} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId && request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```
- [ ] Storage rules published

#### Step 4: Deploy
```bash
cd web_platform

# Deploy everything
firebase deploy

# Or deploy individually
firebase deploy --only hosting        # Frontend only
firebase deploy --only functions      # Backend only
firebase deploy --only firestore:rules # Firestore rules
firebase deploy --only storage:rules  # Storage rules
```
- [ ] Deployment succeeds without errors
- [ ] Check Firebase Console for status

### Option B: Automated Deployment via GitHub Actions

#### Step 1: Verify GitHub Actions Workflows
- [ ] `.github/workflows/firebase-deploy.yml` exists
- [ ] `.github/workflows/deploy-pages.yml` exists

#### Step 2: Push Code to GitHub
```bash
git add .
git commit -m "Setup Firebase deployment"
git push origin main
```
- [ ] Workflows trigger automatically
- [ ] Check Actions tab for status

#### Step 3: Monitor Deployment
- [ ] Go to GitHub → Actions tab
- [ ] Watch `firebase-deploy` workflow
- [ ] All jobs complete successfully
- [ ] No build or deployment errors

## Post-Deployment Verification

### Hosting Verification
```bash
firebase hosting:channel:list
firebase open hosting:site  # Opens your live site
```
- [ ] Visit `https://your-project-id.web.app`
- [ ] Frontend loads correctly
- [ ] All assets load (CSS, JS, images)
- [ ] Navigation works

### API Verification
```bash
firebase functions:log
```
- [ ] Check: `curl https://your-project-id.cloudfunctions.net/api/health`
- [ ] Should return: `{"status":"healthy",...}`
- [ ] Backend APIs responding

### Database Verification
Go to Firebase Console → Firestore Database
- [ ] Collections visible
- [ ] Sample data present
- [ ] Can query documents

### GitHub Pages Verification (Optional)
- [ ] Visit `https://your-username.github.io/your-repo`
- [ ] Frontend accessible from GitHub Pages
- [ ] All features working

## Monitoring & Maintenance

### Daily Monitoring
- [ ] Check Firebase Console Dashboard
- [ ] Monitor usage and costs
- [ ] Review error logs: `firebase functions:log`
- [ ] Check Firestore quota usage

### Weekly Maintenance
- [ ] Review analytics data
- [ ] Check for failed functions
- [ ] Verify backups are working
- [ ] Review security audit logs

### Monthly Tasks
- [ ] Update dependencies: `npm update`
- [ ] Review and optimize Firestore queries
- [ ] Analyze performance metrics
- [ ] Plan for scaling if needed

## Troubleshooting

### Deployment Fails
```bash
# Clear everything and retry
firebase logout
firebase login
firebase projects:list
firebase deploy --force
```

### Build Errors
```bash
cd web_platform
rm -rf frontend/node_modules backend/node_modules
npm install
npm run build
```

### Functions Not Responding
```bash
# Check logs
firebase functions:log

# Redeploy functions
firebase deploy --only functions --force
```

### Firestore Rules Error
- Check rules syntax at Firebase Console
- Verify test rules locally: `firebase emulators:start`
- Check client-side authentication status

### GitHub Actions Failing
- Verify secrets are set in GitHub
- Check workflow file syntax
- Review job logs in Actions tab
- Ensure Firebase token is current

## Rollback Procedure

If deployment causes issues:

```bash
# Option 1: Redeploy previous version
git revert HEAD
git push origin main
# GitHub Actions automatically redeploys

# Option 2: Manual rollback
firebase deploy --only hosting --project production
# Select previous version from version history

# Option 3: Manual fix
firebase emulators:start  # Test locally
# Fix issues
firebase deploy          # Redeploy
```

## Security Checklist

- [ ] Service account key never committed to git
- [ ] `.env.local` in `.gitignore`
- [ ] Firebase token rotated if exposed
- [ ] Firestore rules restrict unauthorized access
- [ ] Storage rules limit file uploads
- [ ] CORS configured properly
- [ ] API rate limiting enabled (if applicable)

## Cost Optimization

- [ ] Firestore: Review unused indexes
- [ ] Functions: Monitor execution time
- [ ] Storage: Enable cleanup of old files
- [ ] Hosting: Verify CDN caching working
- [ ] Review monthly billing in Firebase Console

## Go-Live Checklist

- [ ] All tests passing
- [ ] Performance metrics acceptable
- [ ] Security audit complete
- [ ] Backup/disaster recovery plan
- [ ] Monitoring alerts configured
- [ ] Support documentation ready
- [ ] Team trained on deployment process

## Useful Commands

```bash
# List all deployed versions
firebase hosting:channel:list

# View live deployment
firebase open hosting:site

# View function logs
firebase functions:log --lines 50

# Test functions locally
firebase emulators:start --only functions

# Run all tests
npm test

# Check Firebase account
firebase projects:list

# Update Firebase CLI
npm install -g firebase-tools@latest
```

## Success Criteria

✅ **Deployment Complete When:**
- Frontend loads at `https://your-project-id.web.app`
- API health check responds successfully
- User authentication works
- Firestore database accessible
- File uploads functional (if applicable)
- GitHub Pages mirrors frontend
- All workflows passing in GitHub Actions
- No errors in Firebase Console

---

## Need Help?

- **Firebase Docs:** https://firebase.google.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **GitHub Actions:** https://docs.github.com/en/actions
- **Firebase CLI Reference:** https://firebase.google.com/docs/cli

Last Updated: 2025-01-01

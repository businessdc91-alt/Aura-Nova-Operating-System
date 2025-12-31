#!/bin/bash
# Firebase Project Setup Script
# Run this script to initialize your Firebase deployment

set -e

echo "🚀 Aura Nova Studios - Firebase Setup Script"
echo "==========================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI found"

# Navigate to web_platform
cd "$(dirname "$0")/web_platform" || exit 1

# Check authentication
if ! firebase projects:list &> /dev/null; then
    echo "📝 Please authenticate with Firebase:"
    firebase login
fi

echo "📦 Installing dependencies..."
npm install

cd frontend
npm install
cd ../backend
npm install
cd ..

echo "🔧 Initializing Firebase configuration..."

# Ask user for project ID
read -p "Enter your Firebase Project ID: " PROJECT_ID

# Update .firebaserc
cat > .firebaserc <<EOF
{
  "projects": {
    "default": "$PROJECT_ID"
  }
}
EOF

echo "✅ Project configured: $PROJECT_ID"

echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables in web_platform/.env.local"
echo "2. Run: firebase emulators:start (for local testing)"
echo "3. Deploy: firebase deploy"
echo "4. Configure GitHub secrets for CI/CD"
echo ""
echo "📖 See FIREBASE_DEPLOYMENT_GUIDE.md for detailed instructions"

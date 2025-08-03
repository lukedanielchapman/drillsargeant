# DrillSargeant Setup - Next Steps

## Environment Files Created
✅ Frontend: `src/frontend/env-frontend` → Rename to `.env`
✅ Backend: `src/backend/env-backend` → Rename to `.env`

## Required Actions

### 1. Rename Environment Files
```powershell
# Rename frontend environment file
Rename-Item "src\frontend\env-frontend" ".env"

# Rename backend environment file  
Rename-Item "src\backend\env-backend" ".env"
```

### 2. Get Firebase API Key
You need to get the Firebase API key from your Firebase Console:
1. Go to https://console.firebase.google.com/project/drillsargeant-19d36
2. Navigate to Project Settings → General
3. Scroll down to "Your apps" section
4. Create a new web app if you haven't already
5. Copy the `apiKey` from the config object
6. Replace `AIzaSyABYv...your_api_key_here` in `src/frontend/.env`

### 3. Initialize Firebase Project
```powershell
# Login to Firebase (if not already logged in)
firebase login

# Initialize Firebase project
firebase init

# Select these options:
# - Firestore: Configure security rules and indexes
# - Hosting: Configure files for Firebase Hosting
# - Functions: Configure a Cloud Functions directory
# - Use existing project: drillsargeant-19d36
```

### 4. Deploy Firestore Rules
```powershell
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### 5. Start Development
```powershell
# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

## Current Status
- ✅ Project structure created
- ✅ Firebase configuration files generated
- ✅ Environment templates created with service account details
- ⏳ Environment files need renaming
- ⏳ Firebase API key needs to be added
- ⏳ Firebase project initialization
- ⏳ Firestore rules deployment
- ⏳ Development server startup

## Notes
- The Firebase service account key is already configured in the backend environment
- All Firebase project details are extracted from your service account key
- The frontend needs the public API key from Firebase Console
- Both frontend and backend are configured to use the `drillsargeant-19d36` project 
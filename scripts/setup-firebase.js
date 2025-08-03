#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔥 Setting up Firebase configuration for DrillSargeant...\n');

// Create firebase.json
const firebaseConfig = {
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "src/frontend/build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "src/backend",
    "runtime": "nodejs18"
  }
};

// Create firestore.rules
const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Projects - users can read/write their own projects
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.teamMembers[request.auth.uid] == true);
    }
    
    // Assessments - users can read/write their own assessments
    match /assessments/{assessmentId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.teamMembers[request.auth.uid] == true);
    }
    
    // Issues - users can read/write issues for their projects
    match /issues/{issueId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.teamMembers[request.auth.uid] == true);
    }
    
    // Fixes - users can read/write fixes for their projects
    match /fixes/{fixId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.teamMembers[request.auth.uid] == true);
    }
    
    // Reports - users can read/write reports for their projects
    match /reports/{reportId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.teamMembers[request.auth.uid] == true);
    }
  }
}`;

// Create firestore.indexes.json
const firestoreIndexes = {
  "indexes": [
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "assessments",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "projectId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "issues",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "projectId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "severity",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
};

// Create .env.example files
const frontendEnvExample = `# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Application Configuration
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development

# Analytics (optional)
REACT_APP_GA_TRACKING_ID=your_ga_tracking_id
`;

const backendEnvExample = `# Server Configuration
PORT=3001
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your_project_id.iam.gserviceaccount.com

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
`;

// Function to write file with error handling
function writeFile(filePath, content, description) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Created ${description}: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error creating ${description}: ${error.message}`);
  }
}

// Function to create directory if it doesn't exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Main setup function
function setupFirebase() {
  console.log('📁 Creating Firebase configuration files...\n');
  
  // Create firebase.json
  writeFile('firebase.json', JSON.stringify(firebaseConfig, null, 2), 'Firebase configuration');
  
  // Create firestore.rules
  writeFile('firestore.rules', firestoreRules, 'Firestore security rules');
  
  // Create firestore.indexes.json
  writeFile('firestore.indexes.json', JSON.stringify(firestoreIndexes, null, 2), 'Firestore indexes');
  
  // Create .env.example files
  ensureDirectoryExists('src/frontend');
  ensureDirectoryExists('src/backend');
  
  writeFile('src/frontend/.env.example', frontendEnvExample, 'Frontend environment template');
  writeFile('src/backend/.env.example', backendEnvExample, 'Backend environment template');
  
  console.log('\n🎉 Firebase setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Update the .env.example files with your Firebase project details');
  console.log('2. Copy .env.example to .env in both frontend and backend directories');
  console.log('3. Run "firebase init" to initialize your Firebase project');
  console.log('4. Deploy Firestore rules with "firebase deploy --only firestore:rules"');
  console.log('\n📚 For more information, see GETTING_STARTED.md');
}

// Check if Firebase CLI is installed
function checkFirebaseCLI() {
  const { execSync } = require('child_process');
  try {
    execSync('firebase --version', { stdio: 'ignore' });
    console.log('✅ Firebase CLI is installed');
    return true;
  } catch (error) {
    console.log('⚠️  Firebase CLI not found. Install it with: npm install -g firebase-tools');
    console.log('   Then run: firebase login');
    return false;
  }
}

// Run setup
if (require.main === module) {
  console.log('🔍 Checking Firebase CLI installation...');
  checkFirebaseCLI();
  console.log('');
  setupFirebase();
} 
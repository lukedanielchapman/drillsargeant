# Firebase Configuration for DrillSargeant

## 🔥 Firebase Project Setup

### 1. **Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `DrillSargeant`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. **Enable Authentication**

#### Email/Password Authentication
1. Go to **Authentication** > **Sign-in method**
2. Enable **Email/Password**
3. Configure settings:
   - Allow users to sign up: ✅
   - Email verification: ✅
   - Password reset: ✅

#### Google Authentication (Optional)
1. Enable **Google** sign-in method
2. Configure OAuth consent screen
3. Add authorized domains

### 3. **Set Up Firestore Database**

#### Create Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode**
4. Choose location: `us-central1` (or your preferred region)

#### Create Collections
Run the following script to create the required collections:

```javascript
// Firebase Admin SDK script to initialize collections
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'drillsargeant'
});

const db = admin.firestore();

// Create collections with initial documents
async function initializeCollections() {
  // Projects collection
  await db.collection('projects').doc('template').set({
    name: 'Template Project',
    description: 'Template for new projects',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'system',
    status: 'template'
  });

  // Assessments collection
  await db.collection('assessments').doc('template').set({
    projectId: 'template',
    status: 'template',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    type: 'comprehensive'
  });

  // Users collection
  await db.collection('users').doc('template').set({
    email: 'template@example.com',
    name: 'Template User',
    role: 'user',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Issues collection
  await db.collection('issues').doc('template').set({
    projectId: 'template',
    type: 'security',
    severity: 'medium',
    status: 'open',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Fixes collection
  await db.collection('fixes').doc('template').set({
    issueId: 'template',
    appliedBy: 'template',
    appliedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'applied'
  });

  // Reports collection
  await db.collection('reports').doc('template').set({
    assessmentId: 'template',
    type: 'comprehensive',
    generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    generatedBy: 'template'
  });

  console.log('Collections initialized successfully');
}

initializeCollections().catch(console.error);
```

### 4. **Firestore Security Rules**

#### Production Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return request.auth.token.role == 'admin';
    }
    
    function isProjectMember(projectId) {
      return exists(/databases/$(database)/documents/projects/$(projectId)/members/$(request.auth.uid));
    }
    
    // Projects collection
    match /projects/{projectId} {
      allow read: if isAuthenticated() && (isOwner(resource.data.createdBy) || isProjectMember(projectId) || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (isOwner(resource.data.createdBy) || isAdmin());
      
      // Project members subcollection
      match /members/{userId} {
        allow read, write: if isAuthenticated() && (isOwner(projectId) || isAdmin());
      }
    }
    
    // Assessments collection
    match /assessments/{assessmentId} {
      allow read: if isAuthenticated() && (isOwner(resource.data.createdBy) || isProjectMember(resource.data.projectId) || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (isOwner(resource.data.createdBy) || isAdmin());
    }
    
    // Users collection
    match /users/{userId} {
      allow read, write: if isAuthenticated() && (isOwner(userId) || isAdmin());
    }
    
    // Issues collection
    match /issues/{issueId} {
      allow read: if isAuthenticated() && (isOwner(resource.data.createdBy) || isProjectMember(resource.data.projectId) || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (isOwner(resource.data.createdBy) || isAdmin());
    }
    
    // Fixes collection
    match /fixes/{fixId} {
      allow read: if isAuthenticated() && (isOwner(resource.data.appliedBy) || isProjectMember(resource.data.projectId) || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (isOwner(resource.data.appliedBy) || isAdmin());
    }
    
    // Reports collection
    match /reports/{reportId} {
      allow read: if isAuthenticated() && (isOwner(resource.data.generatedBy) || isProjectMember(resource.data.projectId) || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && (isOwner(resource.data.generatedBy) || isAdmin());
    }
  }
}
```

### 5. **Environment Variables**

#### Frontend Environment Variables
Create `.env` file in the frontend directory:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=drillsargeant.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=drillsargeant
REACT_APP_FIREBASE_STORAGE_BUCKET=drillsargeant.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Backend API
REACT_APP_API_URL=http://localhost:3001/api

# Assessment Tools Configuration
REACT_APP_ESLINT_CONFIG_PATH=./eslint.config.js
REACT_APP_LIGHTHOUSE_CONFIG_PATH=./lighthouse.config.js
REACT_APP_ZAP_CONFIG_PATH=./zap.config.js
```

#### Backend Environment Variables
Create `.env` file in the backend directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Firebase Admin SDK
FIREBASE_PROJECT_ID=drillsargeant
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@drillsargeant.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40drillsargeant.iam.gserviceaccount.com

# Assessment Tools Configuration
ESLINT_CONFIG_PATH=./eslint.config.js
LIGHTHOUSE_CONFIG_PATH=./lighthouse.config.js
ZAP_CONFIG_PATH=./zap.config.js

# Security Configuration
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key

# Monitoring Configuration
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### 6. **Service Account Setup**

#### Generate Service Account Key
1. Go to **Project Settings** > **Service accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Store it securely (never commit to version control)

#### Service Account Permissions
Ensure the service account has the following roles:
- **Firebase Admin**
- **Cloud Datastore User**
- **Firebase Authentication Admin**

### 7. **Indexes for Firestore**

#### Required Composite Indexes
Create the following indexes in Firestore:

1. **Assessments Collection**
   - Fields: `projectId` (Ascending), `createdAt` (Descending)
   - Fields: `status` (Ascending), `createdAt` (Descending)
   - Fields: `type` (Ascending), `createdAt` (Descending)

2. **Issues Collection**
   - Fields: `projectId` (Ascending), `severity` (Ascending)
   - Fields: `projectId` (Ascending), `type` (Ascending)
   - Fields: `projectId` (Ascending), `status` (Ascending)

3. **Fixes Collection**
   - Fields: `issueId` (Ascending), `appliedAt` (Descending)
   - Fields: `projectId` (Ascending), `appliedAt` (Descending)

### 8. **Next Steps**

Once you've completed the Firebase setup:

1. **Share the Firebase configuration** with me
2. **Create the service account key** and provide the details
3. **Set up the environment variables** as shown above
4. **Deploy the security rules** to Firestore

Then we can start building the DrillSargeant application! 🚀

## 📋 Checklist

- [ ] Create Firebase project named "DrillSargeant"
- [ ] Enable Email/Password authentication
- [ ] Enable Google authentication (optional)
- [ ] Create Firestore database in production mode
- [ ] Set up the required collections
- [ ] Deploy security rules
- [ ] Generate service account key
- [ ] Set up environment variables
- [ ] Create required indexes

Let me know when you've completed these steps and I'll help you start building the application! 
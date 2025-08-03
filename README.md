# DrillSargeant

AI-powered code review and improvement platform for assessing application production readiness.

## 🚀 Quick Deploy

### Prerequisites
- Node.js 18+
- Firebase CLI
- GitHub account with repository access

### 1. Clone and Setup
```bash
git clone https://github.com/lukedanielchapman/drillsargeant.git
cd drillsargeant
```

### 2. Install Dependencies
```bash
# Install frontend dependencies
cd src/frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Environment Setup

#### Frontend Environment Variables
Create `src/frontend/.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSyANhKjZ2d9XWh7mJs3uVSD7n3qbetyBlZs
VITE_FIREBASE_AUTH_DOMAIN=drillsargeant-19d36.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=drillsargeant-19d36
VITE_FIREBASE_STORAGE_BUCKET=drillsargeant-19d36.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=930934013813
VITE_FIREBASE_APP_ID=1:930934013813:web:1a2a32226b2d752ed7dd3c
```

#### Backend Environment Variables
Create `src/backend/.env`:
```env
FIREBASE_PROJECT_ID=drillsargeant-19d36
FIREBASE_PRIVATE_KEY_ID=772b4535ac5b77bb8aec0b7a172121f66dbaa319
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC1aXZI29BU9CMR\nMaCnN7mJuQBqhmR0rMF6QCxdZx1Lh73actEEIYECsit3qz2q6VqJOfngtmLQ+Qja\n+cpvxpFkgtIpzY/6HsRQSGFxRDER+mI/C9i7HP5vmBLoHrPJv43/VPmx+2ueKBQe\ns6tq2bYRgFS+giUeRX24QoX74XGyPnJjNQ/6RzbePFg+Mg6N6Y5ySb4Y8tH8uF17\n26ATVazLrdvF6anFUGjZ0d6QoKRq/M9ttDuUBVaGbgom0/uc+1z8hDN8g29Y2USW\n+Z/BQPo38tt9+YYtHuKxJqj1L0SdGTxQyzQYqZ3tVSSHqK12DKHmLR5U9Xtae2tV\nvEA0Sph3AgMBAAECggEADhTMkKU3S5DTs/71KGWj6jPI+3vJCmFqdzHJ/8oENRup\nOe6VmMt89xebViOdmsmYNHSil7Wwf+YEsPKYqwpvuKyK4aHKHjELLewgXCld4bZc\nr+YcgZGjkkfsl8XiULOkswAGjbElTlZwEV4C3T1e64bZjRwPA4WDV60aN03thFdB\nFpLtt2OdycjzDXCZvzt7efoloCy7NeNvttqtbLciciCouJJaVvVJdzseYS7QhFtf\nnLxZ0HL9ADtMidmdt9NE8Ubs18X8WOsOmOZoXlLy39u4yP5YlNVOFQnv8iKVZVkv\nH5kCqGCRv/yR7qR7WTN2WH1YLGY4PkN22TxSfYbnIQKBgQDaHq4kiEwHm0Tf7CC7\nCRK4RsE1LuWLoozdAvn95Nwe70MY6gIkjVRLF3yqveU7LI1cS014oTGNtpZqpJ5M\nMqi/eGf3GyNgORYXSPQFN6CfMFC0Gsv33uhe4boG3YrkgDVnfxZATxOCDCrJO5uh\ngkbh1tDowsoX9graFfbp+sn60QKBgQDU6sxAhxnF3LiFvNK2nbAZ+/II33c9D7Uo\nsR/SBS5Cw40wzl0IP2a7cxfGp4tEC6ngvD6s94RzWZ2CkItb565rKglO0HMgPTtt\nHkOKGFSOnzsOpGRHpB9R0iQQ9Ak/wfmZGFsCg1J3cSCZCMv6Tem0Yx2SiG/lzwqa\nxofnkaagxwKBgQCQ5krHiCgB8ZsaqpG/zrI56v8VJpdlYNH1TLHoge3dOxM27NYJ\nlD3IOM0f3FD5M4qhIoFPvr3dp8tbAwsKEalasVFXrhadKK9NPrCk+qRgvEcQrrCL\ndPCnf4sGXoyTabyQibOtexq5jP2re0bTT2lpRDy6NBTvQAtLf8XtACbH0QKBgFWk\nUB4QeZxtyMb6iaMs0F3TSqqpADROcib4//yhWtc+AzfDegZMQk1Z4RFl6Q2ox17/\nORKnyN4BCOswqu1/xleSpAXQsM4h8xpUFwSf/rsTb1TXaQKsEHD/3sP29RVxN62N\n72WWXwBuP5duw2VeG4gUahu7x46fdfuFqbrKikSXAoGAZvCE7ubj8GO+1aKPaGvl\nn8wBahG+FBN5SZT1TGxXTLkGfS8G5AWtBiJoOtZF1jVbcpLXAnNHj+vHfYZLrj9e\nH3GlPBiRpl9iiuK5E4cvxyxrhkV9cl+mouy/lFNHg/PYUoZT9bj9QWlFPylHcEkF\nW7ZYTLDZ40aPXK4nqZo6zIg=\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@drillsargeant-19d36.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=113026537805812429530
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40drillsargeant-19d36.iam.gserviceaccount.com
CORS_ORIGIN=http://localhost:3003
```

### 4. Initialize Database
```bash
cd src/backend
node init-database.js
```

### 5. Start Development Servers
```bash
# Terminal 1 - Backend
cd src/backend
npm run dev

# Terminal 2 - Frontend
cd src/frontend
npm run dev
```

### 6. Deploy to Firebase

#### Manual Deployment
```bash
# Build frontend
cd src/frontend
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

#### GitHub Actions Deployment
1. Add Firebase service account key to GitHub Secrets:
   - Go to GitHub repository settings
   - Add secret: `FIREBASE_SERVICE_ACCOUNT_DRILLSARGEANT`
   - Value: Content of `drillsargeant-19d36-firebase-adminsdk-fbsvc-772b4535ac.json`

2. Add Firebase environment variables to GitHub Secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. Push to main branch to trigger deployment:
```bash
git add .
git commit -m "Initial deployment setup"
git push origin main
```

## 🏗️ Architecture

- **Frontend**: React + Vite + Material-UI
- **Backend**: Node.js + Express + TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting

## 🔧 Development

### Available Scripts
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start            # Start production server
```

### API Endpoints
- `GET /health` - Health check
- `GET /api/status` - API status
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create project
- `POST /api/assessments` - Create assessment
- `GET /api/assessments/:id` - Get assessment

## 🌐 Production URLs

- **Frontend**: https://drillsargeant-19d36.web.app
- **Backend**: Deploy separately to Cloud Run/App Engine

## 📝 Environment Variables

### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Backend (.env)
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your_client_x509_cert_url
CORS_ORIGIN=http://localhost:3003
```

## 🚀 Deployment Checklist

- [ ] Firebase project created
- [ ] Service account key downloaded
- [ ] Environment variables configured
- [ ] Database initialized
- [ ] GitHub secrets added
- [ ] Frontend builds successfully
- [ ] Backend runs locally
- [ ] Firebase hosting configured
- [ ] GitHub Actions workflow working
- [ ] Production deployment successful 
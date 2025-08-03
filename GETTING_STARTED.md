# 🚀 Getting Started with DrillSargeant

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Git**
- **Firebase CLI** (`npm install -g firebase-tools`)

## 🔥 Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `DrillSargeant`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. Go to **Authentication** > **Sign-in method**
2. Enable **Email/Password**
3. Configure settings:
   - Allow users to sign up: ✅
   - Email verification: ✅
   - Password reset: ✅

### 3. Set Up Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **production mode**
4. Choose location: `us-central1` (or your preferred region)

### 4. Generate Service Account Key

1. Go to **Project Settings** > **Service accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Store it securely (never commit to version control)

## 🛠️ Project Setup

### 1. Clone and Install Dependencies

```powershell
# Navigate to the project directory
cd DrillSargeant

# Install all dependencies
npm run install:all
```

### 2. Configure Firebase

```powershell
# Run the Firebase setup script
npm run setup:firebase

# Initialize Firebase project
firebase init

# Select the following services:
# - Firestore
# - Hosting
# - Functions (optional)
```

### 3. Environment Configuration

1. Copy the environment template files:
   ```powershell
   Copy-Item src/frontend/.env.example src/frontend/.env
   Copy-Item src/backend/.env.example src/backend/.env
   ```

2. Update the Firebase configuration in both `.env` files with your project details

3. Update the service account details in `src/backend/.env`

### 4. Deploy Firestore Rules

```powershell
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

## 🚀 Running the Application

### Development Mode

```powershell
# Start both frontend and backend
npm run dev

# Or start them separately
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:3001
```

### Production Build

```powershell
# Build both frontend and backend
npm run build

# Deploy to Firebase
firebase deploy
```

## 📁 Project Structure

```
DrillSargeant/
├── src/
│   ├── frontend/           # React frontend application
│   │   ├── src/
│   │   │   ├── components/ # Reusable UI components
│   │   │   ├── pages/      # Page components
│   │   │   ├── services/   # API services
│   │   │   ├── store/      # Redux store and slices
│   │   │   ├── utils/      # Utility functions
│   │   │   └── types/      # TypeScript type definitions
│   │   ├── public/         # Static assets
│   │   └── package.json    # Frontend dependencies
│   └── backend/            # Node.js backend API
│       ├── controllers/    # API route controllers
│       ├── services/       # Business logic services
│       ├── middleware/     # Express middleware
│       ├── utils/          # Utility functions
│       └── types/          # TypeScript type definitions
├── scripts/                # Build and setup scripts
├── docs/                   # Documentation
├── firebase.json           # Firebase configuration
├── firestore.rules         # Firestore security rules
└── package.json           # Root dependencies
```

## 🔧 Key Features

### Interactive Code Review
- **Real-time Analysis**: Live issue detection as users type
- **Visual Highlighting**: Color-coded severity highlighting
- **One-Click Fixes**: Apply common fixes instantly
- **Step-by-Step Guidance**: Walk through complex fixes

### Assessment Tools
- **Code Quality**: ESLint, SonarQube integration
- **Security**: OWASP ZAP integration
- **Performance**: Lighthouse integration
- **Compliance**: Industry standards checking

### Team Collaboration
- **Issue Assignment**: Assign issues to team members
- **Progress Tracking**: Track completion across projects
- **Shared Workflows**: Collaborative fixing
- **Reporting**: Comprehensive progress reports

## 🎯 Development Workflow

### 1. Create a New Project
1. Navigate to the Projects page
2. Click "Create New Project"
3. Enter project details and repository URL
4. Configure assessment settings

### 2. Run Assessment
1. Select the project
2. Choose assessment type (comprehensive, quick, security, performance)
3. Start the assessment
4. Monitor progress in real-time

### 3. Review Issues
1. View detected issues by severity and type
2. Click on issues to see detailed explanations
3. Apply one-click fixes for common issues
4. Follow step-by-step guidance for complex fixes

### 4. Track Progress
1. Monitor fix completion rates
2. View team progress dashboards
3. Generate comprehensive reports
4. Export results for stakeholders

## 🧪 Testing

```powershell
# Run all tests
npm test

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:backend

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring and Analytics

### Performance Monitoring
- **Web Vitals**: Core Web Vitals tracking
- **Error Tracking**: Sentry integration
- **User Analytics**: Firebase Analytics
- **Custom Metrics**: Application-specific metrics

### Security Monitoring
- **Vulnerability Scanning**: Automated security checks
- **Access Logs**: User activity tracking
- **Audit Trails**: Complete action history
- **Compliance Reports**: Regulatory compliance tracking

## 🔒 Security Considerations

### Data Protection
- All data encrypted at rest and in transit
- Role-based access control
- Complete audit logging
- Configurable data retention policies

### Privacy Compliance
- GDPR compliance for EU users
- Data minimization practices
- Right to erasure implementation
- Explicit consent management

## 🚀 Deployment

### Development Deployment
```powershell
# Deploy to Firebase Hosting (development)
firebase deploy --only hosting

# Deploy to Cloud Run (backend)
gcloud run deploy drillsargeant-backend --source .
```

### Production Deployment
```powershell
# Build for production
npm run build

# Deploy all services
firebase deploy

# Set up monitoring
npm run setup:monitoring
```

## 📈 Performance Optimization

### Frontend Optimization
- **Code Splitting**: Dynamic imports for better loading
- **Lazy Loading**: Components loaded on demand
- **Caching**: React Query for efficient data caching
- **Bundle Optimization**: Webpack optimization

### Backend Optimization
- **Database Indexing**: Optimized Firestore queries
- **Caching**: Redis for session and data caching
- **Load Balancing**: Horizontal scaling support
- **CDN**: Global content delivery

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Issues**
   - Verify service account credentials
   - Check Firebase project configuration
   - Ensure proper permissions

2. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript configuration
   - Verify environment variables

3. **Performance Issues**
   - Monitor bundle size
   - Check database query optimization
   - Review caching strategies

### Getting Help

- **Documentation**: Check the docs/ directory
- **Issues**: Create GitHub issues for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Support**: Contact the development team

## 🎉 Next Steps

1. **Explore the Interface**: Familiarize yourself with the dashboard
2. **Create Your First Project**: Set up a test project
3. **Run an Assessment**: Try the comprehensive assessment
4. **Review Issues**: Explore the interactive code review features
5. **Apply Fixes**: Try the one-click and guided fixes
6. **Generate Reports**: Create your first assessment report

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [Material-UI Documentation](https://mui.com/getting-started)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

**DrillSargeant** - Empowering development teams with comprehensive production readiness assessment and actionable insights for achieving world-class software quality standards. 
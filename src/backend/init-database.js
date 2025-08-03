const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: "googleapis.com"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing DrillSargeant database...');
    
    // Create collections with permanent documents
    const collections = [
      {
        name: 'projects',
        documents: [
          {
            name: 'Welcome Project',
            description: 'Your first project in DrillSargeant',
            repositoryUrl: 'https://github.com/example/welcome-project',
            userId: 'system',
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'active'
          }
        ]
      },
      {
        name: 'assessments',
        documents: [
          {
            projectId: 'welcome-project',
            assessmentType: 'code_quality',
            configuration: {
              includeSecurity: true,
              includePerformance: true,
              includeBestPractices: true
            },
            userId: 'system',
            status: 'completed',
            createdAt: new Date(),
            updatedAt: new Date(),
            results: {
              overallScore: 85,
              securityScore: 90,
              performanceScore: 80,
              maintainabilityScore: 85
            }
          }
        ]
      },
      {
        name: 'users',
        documents: [
          {
            email: 'admin@drillsargeant.com',
            displayName: 'System Administrator',
            createdAt: new Date(),
            lastLogin: new Date(),
            role: 'admin'
          }
        ]
      }
    ];

    for (const collection of collections) {
      console.log(`📝 Creating collection: ${collection.name}`);
      
      // Add permanent documents to ensure collection exists
      for (const docData of collection.documents) {
        const docRef = await db.collection(collection.name).add(docData);
        console.log(`✅ Created document in ${collection.name}: ${docRef.id}`);
      }
    }

    console.log('✅ Database initialization completed successfully!');
    console.log('📊 Collections created with permanent documents:');
    console.log('   - projects (1 document)');
    console.log('   - assessments (1 document)');
    console.log('   - users (1 document)');
    console.log('🔐 Firebase Admin SDK connected and ready');
    console.log('💡 You can now see these collections in the Firebase console');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase(); 
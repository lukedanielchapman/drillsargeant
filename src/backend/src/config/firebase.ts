import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // In Firebase Functions, use default credentials
  if (process.env.ADMIN_PROJECT_ID) {
    // Local development with service account
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.ADMIN_PROJECT_ID,
      private_key_id: process.env.ADMIN_PRIVATE_KEY_ID,
      private_key: process.env.ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.ADMIN_CLIENT_EMAIL,
      client_id: process.env.ADMIN_CLIENT_ID,
      auth_uri: process.env.ADMIN_AUTH_URI,
      token_uri: process.env.ADMIN_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.ADMIN_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.ADMIN_CLIENT_X509_CERT_URL,
      universe_domain: "googleapis.com"
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: process.env.ADMIN_PROJECT_ID
    });
  } else {
    // Firebase Functions environment - use default credentials
    admin.initializeApp({
      projectId: 'drillsargeant-19d36'
    });
  }
}

export const auth = admin.auth();
export const db = admin.firestore();

export default admin; 
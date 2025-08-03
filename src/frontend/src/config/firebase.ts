import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyANhKjZ2d9XWh7mJs3uVSD7n3qbetyBlZs",
  authDomain: "drillsargeant-19d36.firebaseapp.com",
  projectId: "drillsargeant-19d36",
  storageBucket: "drillsargeant-19d36.appspot.com",
  messagingSenderId: "930934013813",
  appId: "1:930934013813:web:1a2a32226b2d752ed7dd3c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 
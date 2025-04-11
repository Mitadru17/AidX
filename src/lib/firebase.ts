import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  OAuthProvider,
  PhoneAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Initialize providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
const phoneProvider = new PhoneAuthProvider(auth);

// Initialize Analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { 
  app, 
  auth, 
  analytics,
  googleProvider,
  appleProvider,
  phoneProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier
}; 
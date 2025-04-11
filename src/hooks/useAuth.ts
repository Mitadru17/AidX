import { useState, useEffect } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  ConfirmationResult
} from 'firebase/auth';
import { 
  auth, 
  googleProvider, 
  appleProvider,
  signInWithPopup,
  signInWithPhoneNumber
} from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      throw error;
    }
  };

  const loginWithApple = async () => {
    try {
      const result = await signInWithPopup(auth, appleProvider);
      return result.user;
    } catch (error) {
      throw error;
    }
  };

  const setupRecaptcha = (elementId: string) => {
    const recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
      size: 'invisible',
    });
    return recaptchaVerifier;
  };

  const loginWithPhone = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setConfirmationResult(confirmation);
      return confirmation;
    } catch (error) {
      throw error;
    }
  };

  const confirmPhoneCode = async (code: string) => {
    if (!confirmationResult) throw new Error('No confirmation result found');
    try {
      const result = await confirmationResult.confirm(code);
      return result.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  return { 
    user, 
    loading, 
    login, 
    signup, 
    logout,
    loginWithGoogle,
    loginWithApple,
    loginWithPhone,
    confirmPhoneCode,
    setupRecaptcha
  };
} 
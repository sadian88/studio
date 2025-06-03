// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics as FirebaseAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCtmFLpliyRlY5wZvDX4nulXJ45fbD4MHs",
  authDomain: "flashprint-designs.firebaseapp.com",
  projectId: "flashprint-designs",
  storageBucket: "flashprint-designs.firebasestorage.app",
  messagingSenderId: "178686687847",
  appId: "1:178686687847:web:c8792d1fd8152bbb0772c2",
  measurementId: "G-25GCTT3CX8"
};

let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Function to get analytics instance, ensures it's only called on client and if supported
const getFirebaseAnalytics = async (): Promise<FirebaseAnalytics | null> => {
  if (typeof window !== 'undefined') {
    try {
      const supported = await isSupported();
      if (supported) {
        return getAnalytics(app);
      }
    } catch (error) {
      console.error("Error checking Firebase Analytics support:", error);
      return null;
    }
  }
  return null;
};

export { app, firebaseConfig, getFirebaseAnalytics };

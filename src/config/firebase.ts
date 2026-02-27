/**
 * Firebase Configuration
 *
 * Initializes Firebase directly to avoid circular dependencies
 */

import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseWebConfig } from './firebase.web';

console.log('📌 firebase.ts - Initializing Firebase');

// Initialize Firebase app
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseWebConfig);

// Initialize services
const auth = getAuth(app);
const firestore = getFirestore(app);

console.log('📌 Firebase initialized in firebase.ts');
console.log('📌 Auth instance:', !!auth);
console.log('📌 Firestore instance:', !!firestore);
console.log('📌 App instance:', !!app);

const functions = null; // Not needed for Spark plan
const messaging = null; // Not available on web

// Export Firebase services
export { auth, firestore, functions, messaging, app };

/**
 * Check if running on web platform
 */
export const isWeb = Platform.OS === 'web';

/**
 * Helper to check if Firebase is initialized
 */
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log('✅ Firebase connected successfully (WEB)');
    return !!firestore;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
};

/**
 * Initialize Firebase Cloud Messaging (Push Notifications)
 * Not available on web
 */
export const initializeMessaging = async (): Promise<string | null> => {
  console.log('⚠️  Push notifications not available on web');
  return null;
};

export default {
  auth,
  firestore,
  functions,
  messaging,
  app,
  isWeb,
  checkFirebaseConnection,
  initializeMessaging,
};

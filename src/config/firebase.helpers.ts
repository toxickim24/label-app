/**
 * Firebase Helper Functions
 *
 * Web-only Firebase helpers
 */

import {
  signInWithEmailAndPassword as firebaseSignIn,
  createUserWithEmailAndPassword as firebaseCreateUser,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

import {
  collection as firestoreCollection,
  doc as firestoreDoc,
  addDoc as firestoreAddDoc,
  setDoc as firestoreSetDoc,
  getDoc as firestoreGetDoc,
  getDocs as firestoreGetDocs,
  updateDoc as firestoreUpdateDoc,
  deleteDoc as firestoreDeleteDoc,
  query as firestoreQuery,
  where as firestoreWhere,
  orderBy as firestoreOrderBy,
  limit as firestoreLimit,
  onSnapshot as firestoreOnSnapshot,
  serverTimestamp as firestoreServerTimestamp,
  QueryConstraint,
} from 'firebase/firestore';

// Import Firebase instances DIRECTLY from index.ts to avoid circular dependency
import { auth as firebaseAuth, firestore as firebaseDb } from '../../index';
import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';

// Helper to get auth instance
const getAuth = () => {
  console.log('🔍 Getting auth instance:', !!firebaseAuth);
  if (!firebaseAuth) {
    console.error('❌ Auth instance is undefined!');
  }
  return firebaseAuth;
};

// Helper to get firestore instance
const getFirestore = () => {
  console.log('🔍 Getting firestore instance:', !!firebaseDb);
  if (!firebaseDb) {
    console.error('❌ Firestore instance is undefined!');
  }
  return firebaseDb;
};

/**
 * Authentication Helpers
 */
export const FirebaseAuth = {
  // Sign in with email and password
  signInWithEmailAndPassword: async (email: string, password: string) => {
    return await firebaseSignIn(getAuth(), email, password);
  },

  // Create user with email and password
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    return await firebaseCreateUser(getAuth(), email, password);
  },

  // Sign out
  signOut: async () => {
    return await firebaseSignOut(getAuth());
  },

  // Update profile
  updateProfile: async (user: FirebaseUser, profile: { displayName?: string; photoURL?: string }) => {
    return await firebaseUpdateProfile(user, profile);
  },

  // Get current user
  getCurrentUser: () => {
    return getAuth().currentUser;
  },

  // Auth state listener
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return firebaseOnAuthStateChanged(getAuth(), callback);
  },
};

/**
 * Firestore Helpers
 */
export const FirebaseFirestore = {
  // Get collection reference
  collection: (path: string) => {
    return firestoreCollection(getFirestore(), path);
  },

  // Get document reference
  doc: (collectionPath: string, docId: string) => {
    return firestoreDoc(getFirestore(), collectionPath, docId);
  },

  // Add document
  addDoc: async (collectionRef: any, data: any) => {
    return await firestoreAddDoc(collectionRef, data);
  },

  // Set document
  setDoc: async (docRef: any, data: any) => {
    return await firestoreSetDoc(docRef, data);
  },

  // Get document
  getDoc: async (docRef: any) => {
    return await firestoreGetDoc(docRef);
  },

  // Update document
  updateDoc: async (docRef: any, data: any) => {
    return await firestoreUpdateDoc(docRef, data);
  },

  // Delete document
  deleteDoc: async (docRef: any) => {
    return await firestoreDeleteDoc(docRef);
  },

  // Query helpers
  where: (field: string, operator: any, value: any) => {
    return firestoreWhere(field, operator, value);
  },

  orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => {
    return firestoreOrderBy(field, direction);
  },

  limit: (count: number) => {
    return firestoreLimit(count);
  },

  // Execute query
  getDocs: async (queryOrRef: any) => {
    return await firestoreGetDocs(queryOrRef);
  },

  // Server timestamp
  serverTimestamp: () => {
    return firestoreServerTimestamp();
  },

  // On snapshot (real-time listener)
  onSnapshot: (queryOrRef: any, callback: (snapshot: any) => void, errorCallback?: (error: any) => void) => {
    return firestoreOnSnapshot(queryOrRef, callback, errorCallback);
  },
};

/**
 * Helper to build queries
 */
export const buildQuery = (collectionRef: any, constraints: QueryConstraint[]) => {
  return firestoreQuery(collectionRef, ...constraints);
};

export default {
  FirebaseAuth,
  FirebaseFirestore,
  buildQuery,
  isWeb,
};

console.log('🚀🚀🚀 INDEX.TS - TOP OF FILE 🚀🚀🚀');

// Initialize Firebase DIRECTLY here to ensure it runs
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

console.log('📦 Firebase imports loaded in index.ts');

// Firebase config
const firebaseWebConfig = {
  apiKey: "AIzaSyBgX9HogTN04R_pMOQksRR-hjo2bHKunIU",
  authDomain: "label-app-b5e46.firebaseapp.com",
  databaseURL: "https://label-app-b5e46-default-rtdb.firebaseio.com",
  projectId: "label-app-b5e46",
  storageBucket: "label-app-b5e46.firebasestorage.app",
  messagingSenderId: "1037452577086",
  appId: "1:1037452577086:web:d3549609238399103dc46f",
  measurementId: "G-B478TNB29S"
};

console.log('🔥 Attempting to initialize Firebase app in index.ts...');

// Initialize Firebase
const app = !getApps().length
  ? initializeApp(firebaseWebConfig)
  : getApps()[0];

console.log('✅ Firebase app initialized:', !!app);

// Initialize services
const auth = getAuth(app);
const firestore = getFirestore(app);

console.log('🔐 Auth initialized:', !!auth);
console.log('📄 Firestore initialized:', !!firestore);
console.log('🎉 FIREBASE INITIALIZATION COMPLETE IN INDEX.TS');

// Export for use by other modules
export { auth, firestore, app };

import { registerRootComponent } from 'expo';
import App from './App';

console.log('📱 Registering root component...');

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

console.log('✅ Root component registered');


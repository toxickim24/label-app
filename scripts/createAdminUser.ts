/**
 * Create Admin User Script
 *
 * This script creates the admin user account in Firebase.
 * Run this AFTER completing Firebase Console setup (Authentication + Firestore enabled).
 *
 * Usage:
 *   npx ts-node scripts/createAdminUser.ts
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import type { User } from '../src/types';

const ADMIN_EMAIL = 'admin@labelsalesagents.com';
const ADMIN_PASSWORD = 'Thelabel99!';
const ADMIN_NAME = 'Admin User';

async function createAdminUser() {
  try {
    console.log('🔥 Creating admin user...\n');

    // Step 1: Create Firebase Auth user
    console.log('Step 1: Creating Firebase Authentication user...');
    const userCredential = await auth().createUserWithEmailAndPassword(
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );

    // Update display name
    await userCredential.user.updateProfile({
      displayName: ADMIN_NAME,
    });

    console.log(`✅ Firebase Auth user created with UID: ${userCredential.user.uid}\n`);

    // Step 2: Check if this is the first user (should get master role)
    console.log('Step 2: Checking if this is the first user...');
    const usersSnapshot = await firestore().collection('users').limit(1).get();
    const isFirstUser = usersSnapshot.empty;

    console.log(isFirstUser ? '✅ First user - will assign MASTER role' : '⚠️  Not first user - will assign ADMIN role\n');

    // Step 3: Create user profile in Firestore
    console.log('Step 3: Creating user profile in Firestore...');

    const newUser: User = {
      uid: userCredential.user.uid,
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      role: isFirstUser ? 'master' : 'admin', // Master if first, otherwise admin
      permissions: {
        pool_permits: ['view', 'create', 'edit', 'delete', 'export', 'send_sms', 'send_email'],
        kitchen_bath_permits: ['view', 'create', 'edit', 'delete', 'export', 'send_sms', 'send_email'],
        roof_permits: ['view', 'create', 'edit', 'delete', 'export', 'send_sms', 'send_email'],
      },
      createdAt: firestore.FieldValue.serverTimestamp(),
      lastLogin: firestore.FieldValue.serverTimestamp(),
      isActive: true,
      hasAcceptedTerms: true,
      acceptedTermsVersion: '1.0',
      hasAcceptedPrivacy: true,
      acceptedPrivacyVersion: '1.0',
      fcmTokens: [],
    };

    await firestore().collection('users').doc(userCredential.user.uid).set(newUser);

    console.log('✅ User profile created in Firestore\n');

    // Step 4: Create audit log entry
    console.log('Step 4: Creating audit log entry...');

    await firestore().collection('auditLogs').add({
      userId: userCredential.user.uid,
      userEmail: ADMIN_EMAIL,
      action: 'user_created',
      details: 'Admin user account created via script',
      timestamp: firestore.FieldValue.serverTimestamp(),
      ipAddress: 'script',
    });

    console.log('✅ Audit log entry created\n');

    // Success summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 ADMIN USER CREATED SUCCESSFULLY!\n');
    console.log('📧 Email:', ADMIN_EMAIL);
    console.log('🔒 Password:', ADMIN_PASSWORD);
    console.log('👤 Display Name:', ADMIN_NAME);
    console.log('🔑 UID:', userCredential.user.uid);
    console.log('⭐ Role:', isFirstUser ? 'MASTER' : 'ADMIN');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('✅ You can now log in to the app with these credentials.\n');
    console.log('⚠️  IMPORTANT: Change the password after first login for security!\n');

  } catch (error: any) {
    console.error('\n❌ ERROR creating admin user:\n');

    if (error.code === 'auth/email-already-in-use') {
      console.error('This email is already registered in Firebase.');
      console.error('If you need to reset the password, use the Firebase Console:');
      console.error('https://console.firebase.google.com/project/_/authentication/users\n');
    } else if (error.code === 'auth/network-request-failed') {
      console.error('Network error. Make sure you have internet connection and Firebase is configured.\n');
    } else if (error.code === 'auth/operation-not-allowed') {
      console.error('Email/Password authentication is not enabled in Firebase Console.');
      console.error('Enable it at: https://console.firebase.google.com/project/_/authentication/providers\n');
    } else {
      console.error(error.message);
      console.error('\nFull error:', error);
    }

    process.exit(1);
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

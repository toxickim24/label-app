/**
 * Cloud Functions for Label App
 *
 * This file contains serverless functions that run on Firebase Cloud Functions.
 * They handle backend operations like user profile creation, notifications, etc.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

/**
 * Creates a user profile in Firestore when a new user signs up via Firebase Auth
 *
 * This function automatically runs when a new user is created in Firebase Authentication.
 * It creates a corresponding user document in the 'users' collection with default permissions.
 */
export const createUserProfile = functions.auth.user().onCreate(async (user) => {
  try {
    console.log('Creating user profile for:', user.email);

    const userProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      role: 'user', // Default role
      permissions: {
        pool_permits: {
          view: false,
          create: false,
          edit: false,
          delete: false,
          text: false,
          email: false,
          export: false,
          import: false,
          reset_password: false,
          manage_templates: false,
          manage_api: false,
          manage_users: false,
        },
        kitchen_bath_permits: {
          view: false,
          create: false,
          edit: false,
          delete: false,
          text: false,
          email: false,
          export: false,
          import: false,
          reset_password: false,
          manage_templates: false,
          manage_api: false,
          manage_users: false,
        },
        roof_permits: {
          view: false,
          create: false,
          edit: false,
          delete: false,
          text: false,
          email: false,
          export: false,
          import: false,
          reset_password: false,
          manage_templates: false,
          manage_api: false,
          manage_users: false,
        },
      },
      theme: 'system',
      terms_version: null,
      privacy_version: null,
      accepted_at: null,
      phone: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      disabled: false,
      fcmTokens: [],
      badgeCount: 0,
      photoURL: user.photoURL || null,
    };

    // Create the user document in Firestore
    await admin.firestore().collection('users').doc(user.uid).set(userProfile);

    console.log('User profile created successfully for:', user.email);
    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create user profile');
  }
});

/**
 * Sends notifications to admins when a new lead is created
 *
 * This function triggers when a new document is added to the 'leads' collection.
 * It finds all admin and master users and creates notification documents for them.
 */
export const notifyOnNewLead = functions.firestore
  .document('leads/{leadId}')
  .onCreate(async (snap, context) => {
    try {
      const lead = snap.data();
      const leadId = context.params.leadId;

      console.log('New lead created:', leadId);

      // Get all admin and master users
      const adminsSnapshot = await admin.firestore()
        .collection('users')
        .where('role', 'in', ['admin', 'master'])
        .get();

      if (adminsSnapshot.empty) {
        console.log('No admins found to notify');
        return { success: true, notificationsSent: 0 };
      }

      // Create notification for each admin
      const batch = admin.firestore().batch();
      let notificationCount = 0;

      adminsSnapshot.docs.forEach((doc) => {
        const notificationRef = admin.firestore().collection('notifications').doc();
        const notification = {
          userId: doc.id,
          title: 'New Lead',
          body: `New ${lead.permitType.replace('_', ' ')} lead: ${lead.fullName}`,
          type: 'new_lead',
          actionType: 'lead_detail',
          actionPayload: {
            leadId: leadId,
            permitType: lead.permitType,
          },
          isRead: false,
          readAt: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          sentViaFCM: false,
          fcmMessageId: null,
        };

        batch.set(notificationRef, notification);
        notificationCount++;
      });

      await batch.commit();

      console.log(`Created ${notificationCount} notifications for new lead`);
      return { success: true, notificationsSent: notificationCount };
    } catch (error) {
      console.error('Error creating notifications:', error);
      // Don't throw error - we don't want to fail lead creation if notifications fail
      return { success: false, error: error };
    }
  });

/**
 * Updates user's lastLogin timestamp when they sign in
 *
 * This function can be called from your app after successful login
 */
export const updateLastLogin = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    await admin.firestore()
      .collection('users')
      .doc(context.auth.uid)
      .update({
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      });

    return { success: true };
  } catch (error) {
    console.error('Error updating last login:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update last login');
  }
});

// ============================================================================
// SECURE API FUNCTIONS (API keys stored in Firebase config)
// ============================================================================

// Import API functions
export { generateAITemplate } from './aiFunction';
export { sendSMS } from './smsFunction';
export { sendEmail } from './emailFunction';

// ============================================================================
// MIGRATION FUNCTIONS (One-time data structure updates)
// ============================================================================

// Import migration functions
export {
  migrateKitchenBathPermits,
  migrateLeadPermitTypes,
  migrateTemplatePermitTypes,
} from './migrationFunction';

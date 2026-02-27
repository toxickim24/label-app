/**
 * Migration Functions
 * One-time functions to update data structures
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

interface OldPermissions {
  kitchen_bath_permits?: any;
  pool_permits?: any;
  roof_permits?: any;
}

/**
 * Migrate users from kitchen_bath_permits to kitchen_permits and bath_permits
 * This is a callable function - run it once to migrate all users
 */
export const migrateKitchenBathPermits = functions.https.onCall(async (data, context) => {
  // Only masters can run migrations
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  const user = userDoc.data();

  if (!user || user.role !== 'master') {
    throw new functions.https.HttpsError('permission-denied', 'Only masters can run migrations');
  }

  try {
    // Get all users
    const usersSnapshot = await admin.firestore().collection('users').get();

    let migratedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    // Process each user
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const permissions = userData.permissions as OldPermissions;

      // Check if user has the old kitchen_bath_permits structure
      if (permissions && permissions.kitchen_bath_permits) {
        try {
          // Copy kitchen_bath_permits to both kitchen_permits and bath_permits
          const newPermissions = {
            ...permissions,
            kitchen_permits: { ...permissions.kitchen_bath_permits },
            bath_permits: { ...permissions.kitchen_bath_permits },
          };

          // Remove the old kitchen_bath_permits field
          delete newPermissions.kitchen_bath_permits;

          // Update user document
          await admin.firestore().collection('users').doc(userDoc.id).update({
            permissions: newPermissions,
          });

          migratedCount++;
          console.log(`Migrated user: ${userDoc.id} (${userData.email})`);
        } catch (error: any) {
          errors.push(`Failed to migrate user ${userDoc.id}: ${error.message}`);
          console.error(`Error migrating user ${userDoc.id}:`, error);
        }
      } else {
        skippedCount++;
        console.log(`Skipped user: ${userDoc.id} (already migrated or no permissions)`);
      }
    }

    return {
      success: true,
      migratedCount,
      skippedCount,
      totalUsers: usersSnapshot.size,
      errors: errors.length > 0 ? errors : null,
    };
  } catch (error: any) {
    console.error('Migration error:', error);
    throw new functions.https.HttpsError('internal', `Migration failed: ${error.message}`);
  }
});

/**
 * Migrate leads from kitchen_bath_permits to kitchen_permits or bath_permits
 * This requires manual review since we need to determine if each lead is kitchen or bath
 */
export const migrateLeadPermitTypes = functions.https.onCall(async (data, context) => {
  // Only masters can run migrations
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  const user = userDoc.data();

  if (!user || user.role !== 'master') {
    throw new functions.https.HttpsError('permission-denied', 'Only masters can run migrations');
  }

  const { defaultType } = data;

  // Validate defaultType
  if (!defaultType || !['kitchen_permits', 'bath_permits'].includes(defaultType)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Must provide defaultType as either "kitchen_permits" or "bath_permits"'
    );
  }

  try {
    // Get all leads with kitchen_bath_permits
    const leadsSnapshot = await admin
      .firestore()
      .collection('leads')
      .where('permitType', '==', 'kitchen_bath_permits')
      .get();

    let migratedCount = 0;
    const errors: string[] = [];

    // Update each lead
    for (const leadDoc of leadsSnapshot.docs) {
      try {
        await admin.firestore().collection('leads').doc(leadDoc.id).update({
          permitType: defaultType,
        });

        migratedCount++;
        console.log(`Migrated lead: ${leadDoc.id} to ${defaultType}`);
      } catch (error: any) {
        errors.push(`Failed to migrate lead ${leadDoc.id}: ${error.message}`);
        console.error(`Error migrating lead ${leadDoc.id}:`, error);
      }
    }

    return {
      success: true,
      migratedCount,
      totalLeads: leadsSnapshot.size,
      migratedTo: defaultType,
      errors: errors.length > 0 ? errors : null,
    };
  } catch (error: any) {
    console.error('Lead migration error:', error);
    throw new functions.https.HttpsError('internal', `Lead migration failed: ${error.message}`);
  }
});

/**
 * Migrate templates from kitchen_bath_permits to kitchen_permits or bath_permits
 */
export const migrateTemplatePermitTypes = functions.https.onCall(async (data, context) => {
  // Only masters can run migrations
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  const user = userDoc.data();

  if (!user || user.role !== 'master') {
    throw new functions.https.HttpsError('permission-denied', 'Only masters can run migrations');
  }

  try {
    // Get all templates with kitchen_bath_permits
    const templatesSnapshot = await admin
      .firestore()
      .collection('templates')
      .where('permitType', '==', 'kitchen_bath_permits')
      .get();

    let migratedCount = 0;
    const errors: string[] = [];
    const migrations: { [key: string]: string } = {};

    // Smart migration based on template name/content
    for (const templateDoc of templatesSnapshot.docs) {
      try {
        const templateData = templateDoc.data();
        const name = (templateData.name || '').toLowerCase();
        const content = (templateData.content || '').toLowerCase();

        // Determine if it's kitchen or bath based on name/content
        let newPermitType = 'kitchen_permits'; // default

        if (name.includes('bath') || name.includes('bathroom') || content.includes('bathroom')) {
          newPermitType = 'bath_permits';
        }

        await admin.firestore().collection('templates').doc(templateDoc.id).update({
          permitType: newPermitType,
        });

        migrations[templateDoc.id] = newPermitType;
        migratedCount++;
        console.log(`Migrated template: ${templateDoc.id} (${templateData.name}) to ${newPermitType}`);
      } catch (error: any) {
        errors.push(`Failed to migrate template ${templateDoc.id}: ${error.message}`);
        console.error(`Error migrating template ${templateDoc.id}:`, error);
      }
    }

    return {
      success: true,
      migratedCount,
      totalTemplates: templatesSnapshot.size,
      migrations,
      errors: errors.length > 0 ? errors : null,
    };
  } catch (error: any) {
    console.error('Template migration error:', error);
    throw new functions.https.HttpsError('internal', `Template migration failed: ${error.message}`);
  }
});

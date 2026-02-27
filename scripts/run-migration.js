/**
 * Migration Script - Run once to migrate kitchen_bath_permits to kitchen_permits and bath_permits
 *
 * This script calls the Cloud Functions to:
 * 1. Update all user permissions
 * 2. Optionally update leads permit types
 * 3. Automatically update templates based on their names
 *
 * Usage: node scripts/run-migration.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-admin-key.json'); // You'll need to download this

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'label-app-b5e46',
});

const functions = require('firebase-functions-test')({
  projectId: 'label-app-b5e46',
}, '../firebase-admin-key.json');

async function runMigration() {
  console.log('🚀 Starting migration...\n');

  try {
    // Step 1: Migrate user permissions
    console.log('📋 Step 1: Migrating user permissions...');
    const db = admin.firestore();

    const usersSnapshot = await db.collection('users').get();
    let usersMigrated = 0;
    let usersSkipped = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const permissions = userData.permissions;

      if (permissions && permissions.kitchen_bath_permits) {
        // Copy kitchen_bath_permits to both kitchen_permits and bath_permits
        const newPermissions = {
          ...permissions,
          kitchen_permits: { ...permissions.kitchen_bath_permits },
          bath_permits: { ...permissions.kitchen_bath_permits },
        };

        // Remove the old kitchen_bath_permits field
        delete newPermissions.kitchen_bath_permits;

        await db.collection('users').doc(userDoc.id).update({
          permissions: newPermissions,
        });

        console.log(`  ✅ Migrated user: ${userData.email || userDoc.id}`);
        usersMigrated++;
      } else {
        console.log(`  ⏭️  Skipped user: ${userData.email || userDoc.id} (already migrated)`);
        usersSkipped++;
      }
    }

    console.log(`\n✅ Users migration complete!`);
    console.log(`   - Migrated: ${usersMigrated}`);
    console.log(`   - Skipped: ${usersSkipped}`);
    console.log(`   - Total: ${usersSnapshot.size}\n`);

    // Step 2: Migrate templates (smart detection based on name)
    console.log('📋 Step 2: Migrating templates...');
    const templatesSnapshot = await db.collection('templates')
      .where('permitType', '==', 'kitchen_bath_permits')
      .get();

    let templatesMigrated = 0;

    if (templatesSnapshot.empty) {
      console.log('  ℹ️  No templates to migrate\n');
    } else {
      for (const templateDoc of templatesSnapshot.docs) {
        const templateData = templateDoc.data();
        const name = (templateData.name || '').toLowerCase();
        const content = (templateData.content || '').toLowerCase();

        // Smart detection: if name/content contains "bath", it's a bath template
        let newPermitType = 'kitchen_permits'; // default to kitchen

        if (name.includes('bath') || name.includes('bathroom') || content.includes('bathroom')) {
          newPermitType = 'bath_permits';
        }

        await db.collection('templates').doc(templateDoc.id).update({
          permitType: newPermitType,
        });

        console.log(`  ✅ Migrated template: "${templateData.name}" → ${newPermitType}`);
        templatesMigrated++;
      }

      console.log(`\n✅ Templates migration complete!`);
      console.log(`   - Migrated: ${templatesMigrated}\n`);
    }

    // Step 3: Check leads (just report, don't auto-migrate)
    console.log('📋 Step 3: Checking leads...');
    const leadsSnapshot = await db.collection('leads')
      .where('permitType', '==', 'kitchen_bath_permits')
      .get();

    if (leadsSnapshot.empty) {
      console.log('  ℹ️  No leads to migrate\n');
    } else {
      console.log(`  ⚠️  Found ${leadsSnapshot.size} leads with kitchen_bath_permits`);
      console.log('  ℹ️  You need to manually review and categorize these leads as kitchen or bath');
      console.log('  ℹ️  Run this command after reviewing:\n');
      console.log('     Option 1: Migrate all to kitchen_permits:');
      console.log('       firebase functions:shell');
      console.log('       migrateLeadPermitTypes({defaultType: "kitchen_permits"})\n');
      console.log('     Option 2: Migrate all to bath_permits:');
      console.log('       firebase functions:shell');
      console.log('       migrateLeadPermitTypes({defaultType: "bath_permits"})\n');
    }

    console.log('🎉 Migration complete!\n');
    console.log('Next steps:');
    console.log('1. Check your Firebase Console to verify the changes');
    console.log('2. If you have leads to migrate, run the appropriate command above');
    console.log('3. Update your Firestore security rules with the new permission structure\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run the migration
runMigration();

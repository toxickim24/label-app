/**
 * Reverse Migration Script - Combine kitchen_permits and bath_permits back to kitchen_bath_permits
 *
 * This script will:
 * 1. Update all user permissions: kitchen_permits + bath_permits → kitchen_bath_permits
 * 2. Update all leads: kitchen_permits OR bath_permits → kitchen_bath_permits
 * 3. Update all templates: kitchen_permits OR bath_permits → kitchen_bath_permits
 *
 * Usage: node scripts/reverse-migration.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-admin-key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'label-app-b5e46',
});

const db = admin.firestore();

async function reverseMigration() {
  console.log('🚀 Starting REVERSE migration (combining kitchen & bath)...\n');

  try {
    // Step 1: Migrate user permissions
    console.log('📋 Step 1: Migrating user permissions...');
    console.log('   Combining kitchen_permits + bath_permits → kitchen_bath_permits\n');

    const usersSnapshot = await db.collection('users').get();
    let usersMigrated = 0;
    let usersSkipped = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const permissions = userData.permissions;

      // Check if user has the separate kitchen_permits or bath_permits
      if (permissions && (permissions.kitchen_permits || permissions.bath_permits)) {
        // Use kitchen_permits as the base, or bath_permits if kitchen doesn't exist
        const basePermissions = permissions.kitchen_permits || permissions.bath_permits || {
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
        };

        // Create new permissions with combined kitchen_bath_permits
        const newPermissions = {
          ...permissions,
          kitchen_bath_permits: { ...basePermissions },
        };

        // Remove the old separate fields
        delete newPermissions.kitchen_permits;
        delete newPermissions.bath_permits;

        await db.collection('users').doc(userDoc.id).update({
          permissions: newPermissions,
        });

        console.log(`  ✅ Migrated user: ${userData.email || userDoc.id}`);
        usersMigrated++;
      } else if (permissions && permissions.kitchen_bath_permits) {
        console.log(`  ⏭️  Skipped user: ${userData.email || userDoc.id} (already combined)`);
        usersSkipped++;
      } else {
        console.log(`  ⚠️  Warning: User ${userData.email || userDoc.id} has no kitchen/bath permissions`);
        usersSkipped++;
      }
    }

    console.log(`\n✅ Users migration complete!`);
    console.log(`   - Migrated: ${usersMigrated}`);
    console.log(`   - Skipped: ${usersSkipped}`);
    console.log(`   - Total: ${usersSnapshot.size}\n`);

    // Step 2: Migrate leads with kitchen_permits
    console.log('📋 Step 2: Migrating leads...');

    const kitchenLeadsSnapshot = await db.collection('leads')
      .where('permitType', '==', 'kitchen_permits')
      .get();

    const bathLeadsSnapshot = await db.collection('leads')
      .where('permitType', '==', 'bath_permits')
      .get();

    let leadsMigrated = 0;

    // Migrate kitchen leads
    for (const leadDoc of kitchenLeadsSnapshot.docs) {
      await db.collection('leads').doc(leadDoc.id).update({
        permitType: 'kitchen_bath_permits',
      });
      const leadData = leadDoc.data();
      console.log(`  ✅ Migrated lead: ${leadData.fullName || leadDoc.id} (kitchen → kitchen_bath)`);
      leadsMigrated++;
    }

    // Migrate bath leads
    for (const leadDoc of bathLeadsSnapshot.docs) {
      await db.collection('leads').doc(leadDoc.id).update({
        permitType: 'kitchen_bath_permits',
      });
      const leadData = leadDoc.data();
      console.log(`  ✅ Migrated lead: ${leadData.fullName || leadDoc.id} (bath → kitchen_bath)`);
      leadsMigrated++;
    }

    console.log(`\n✅ Leads migration complete!`);
    console.log(`   - Kitchen leads migrated: ${kitchenLeadsSnapshot.size}`);
    console.log(`   - Bath leads migrated: ${bathLeadsSnapshot.size}`);
    console.log(`   - Total leads migrated: ${leadsMigrated}\n`);

    // Step 3: Migrate templates
    console.log('📋 Step 3: Migrating templates...');

    const kitchenTemplatesSnapshot = await db.collection('templates')
      .where('permitType', '==', 'kitchen_permits')
      .get();

    const bathTemplatesSnapshot = await db.collection('templates')
      .where('permitType', '==', 'bath_permits')
      .get();

    let templatesMigrated = 0;

    // Migrate kitchen templates
    for (const templateDoc of kitchenTemplatesSnapshot.docs) {
      await db.collection('templates').doc(templateDoc.id).update({
        permitType: 'kitchen_bath_permits',
      });
      const templateData = templateDoc.data();
      console.log(`  ✅ Migrated template: "${templateData.name}" (kitchen → kitchen_bath)`);
      templatesMigrated++;
    }

    // Migrate bath templates
    for (const templateDoc of bathTemplatesSnapshot.docs) {
      await db.collection('templates').doc(templateDoc.id).update({
        permitType: 'kitchen_bath_permits',
      });
      const templateData = templateDoc.data();
      console.log(`  ✅ Migrated template: "${templateData.name}" (bath → kitchen_bath)`);
      templatesMigrated++;
    }

    console.log(`\n✅ Templates migration complete!`);
    console.log(`   - Kitchen templates migrated: ${kitchenTemplatesSnapshot.size}`);
    console.log(`   - Bath templates migrated: ${bathTemplatesSnapshot.size}`);
    console.log(`   - Total templates migrated: ${templatesMigrated}\n`);

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🎉 REVERSE MIGRATION COMPLETE!\n');
    console.log('Summary:');
    console.log(`   - Users migrated: ${usersMigrated}`);
    console.log(`   - Leads migrated: ${leadsMigrated}`);
    console.log(`   - Templates migrated: ${templatesMigrated}\n`);
    console.log('Next steps:');
    console.log('1. ✅ Check your Firebase Console to verify the changes');
    console.log('2. ✅ All permissions are now combined as kitchen_bath_permits');
    console.log('3. ✅ Deploy updated Firestore rules: firebase deploy --only firestore:rules');
    console.log('4. ✅ Deploy updated Functions: firebase deploy --only functions\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error(error.stack);
  } finally {
    process.exit(0);
  }
}

// Run the migration
reverseMigration();

/**
 * Migration Script
 * Adds a "description" field (empty string) to all documents in the leads collection
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin with your project
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'label-app-b5e46',
});

const db = admin.firestore();

async function migrate() {
  console.log('🚀 Starting migration to add description field to leads...\n');

  try {
    // Get all leads
    const leadsSnapshot = await db.collection('leads').get();

    if (leadsSnapshot.empty) {
      console.log('❌ No leads found');
      return;
    }

    console.log(`Found ${leadsSnapshot.size} lead(s)\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    // Process each lead
    for (const leadDoc of leadsSnapshot.docs) {
      const leadData = leadDoc.data();

      console.log(`Processing lead: ${leadDoc.id}`);

      // Check if description field already exists
      if (leadData.hasOwnProperty('description')) {
        console.log('  ⏭️  Description field already exists - skipping\n');
        skippedCount++;
      } else {
        console.log('  📝 Adding description field...');

        // Add description field with empty string
        await db.collection('leads').doc(leadDoc.id).update({
          description: '',
        });

        console.log('  ✅ Description field added!\n');
        updatedCount++;
      }
    }

    console.log('═══════════════════════════════════════');
    console.log('🎉 Migration Complete!');
    console.log('═══════════════════════════════════════');
    console.log(`✅ Updated: ${updatedCount} lead(s)`);
    console.log(`⏭️  Skipped: ${skippedCount} lead(s)`);
    console.log(`📊 Total: ${leadsSnapshot.size} lead(s)\n`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// Run the migration
migrate();

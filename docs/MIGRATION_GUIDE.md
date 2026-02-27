# Migration Guide: Kitchen/Bath Permits Separation

This guide will help you migrate your existing data from the old `kitchen_bath_permits` structure to the new separate `kitchen_permits` and `bath_permits` structure.

---

## What Gets Migrated?

1. **User Permissions** - Copies `kitchen_bath_permits` to both `kitchen_permits` and `bath_permits`
2. **Templates** - Automatically categorizes templates as kitchen or bath based on their names/content
3. **Leads** - You'll manually specify whether to categorize as kitchen or bath

---

## Option 1: Quick Browser Test (Easiest)

Create a test HTML file to call the migration functions:

1. Create `test-migration.html` in your project root:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Run Migration</title>
  <script type="module">
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
    import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
    import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js';

    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "label-app-b5e46.firebaseapp.com",
      projectId: "label-app-b5e46",
      storageBucket: "label-app-b5e46.firebasestorage.app",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const functions = getFunctions(app);

    window.runMigration = async function() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const output = document.getElementById('output');

      try {
        output.innerHTML = '🔐 Logging in...<br>';

        // Login as master user
        await signInWithEmailAndPassword(auth, email, password);
        output.innerHTML += '✅ Logged in successfully<br><br>';

        // Run user migration
        output.innerHTML += '📋 Migrating user permissions...<br>';
        const migrateUsers = httpsCallable(functions, 'migrateKitchenBathPermits');
        const usersResult = await migrateUsers();

        output.innerHTML += `✅ Users migration complete:<br>`;
        output.innerHTML += `   - Migrated: ${usersResult.data.migratedCount}<br>`;
        output.innerHTML += `   - Skipped: ${usersResult.data.skippedCount}<br>`;
        output.innerHTML += `   - Total: ${usersResult.data.totalUsers}<br><br>`;

        // Run template migration
        output.innerHTML += '📋 Migrating templates...<br>';
        const migrateTemplates = httpsCallable(functions, 'migrateTemplatePermitTypes');
        const templatesResult = await migrateTemplates();

        output.innerHTML += `✅ Templates migration complete:<br>`;
        output.innerHTML += `   - Migrated: ${templatesResult.data.migratedCount}<br>`;
        output.innerHTML += `   - Total: ${templatesResult.data.totalTemplates}<br><br>`;

        if (templatesResult.data.migrations) {
          output.innerHTML += `📝 Template migrations:<br>`;
          for (const [id, type] of Object.entries(templatesResult.data.migrations)) {
            output.innerHTML += `   - ${id} → ${type}<br>`;
          }
          output.innerHTML += '<br>';
        }

        output.innerHTML += '🎉 <strong>Migration complete!</strong><br><br>';
        output.innerHTML += 'ℹ️ If you have leads to migrate, use the buttons below:<br>';

        document.getElementById('migrateKitchen').style.display = 'inline-block';
        document.getElementById('migrateBath').style.display = 'inline-block';

      } catch (error) {
        output.innerHTML += `❌ Error: ${error.message}<br>`;
        console.error(error);
      }
    };

    window.migrateLeads = async function(type) {
      const output = document.getElementById('output');

      try {
        output.innerHTML += `<br>📋 Migrating leads to ${type}...<br>`;
        const migrateLeads = httpsCallable(functions, 'migrateLeadPermitTypes');
        const result = await migrateLeads({ defaultType: type });

        output.innerHTML += `✅ Leads migration complete:<br>`;
        output.innerHTML += `   - Migrated: ${result.data.migratedCount}<br>`;
        output.innerHTML += `   - Total: ${result.data.totalLeads}<br>`;
        output.innerHTML += `   - Migrated to: ${result.data.migratedTo}<br><br>`;

      } catch (error) {
        output.innerHTML += `❌ Error: ${error.message}<br>`;
        console.error(error);
      }
    };
  </script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
    }
    input {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    button {
      padding: 10px 20px;
      margin: 10px 5px;
      background: #007AFF;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #0056b3;
    }
    #output {
      margin-top: 20px;
      padding: 15px;
      background: #f5f5f5;
      border-radius: 4px;
      font-family: monospace;
      white-space: pre-wrap;
    }
    .warning {
      background: #fff3cd;
      padding: 10px;
      border-left: 4px solid #ffc107;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <h1>Migration Tool</h1>

  <div class="warning">
    <strong>⚠️ Important:</strong> Only run this migration once! Login with your master account.
  </div>

  <h2>Step 1: Login as Master</h2>
  <input type="email" id="email" placeholder="admin@labelsalesagents.com">
  <input type="password" id="password" placeholder="Password">

  <button onclick="runMigration()">🚀 Run Migration</button>

  <div id="output"></div>

  <h2>Step 2: Migrate Leads (Optional)</h2>
  <button id="migrateKitchen" style="display:none;" onclick="migrateLeads('kitchen_permits')">
    Migrate Leads to Kitchen
  </button>
  <button id="migrateBath" style="display:none;" onclick="migrateLeads('bath_permits')">
    Migrate Leads to Bath
  </button>
</body>
</html>
```

2. Get your Firebase config from:
   https://console.firebase.google.com/project/label-app-b5e46/settings/general

3. Replace the `firebaseConfig` values in the HTML

4. Open the HTML file in your browser

5. Login with your master account email and password

6. Click "Run Migration"

---

## Option 2: Using Firebase Console (Manual)

### Step 1: Migrate User Permissions

1. Go to Firestore: https://console.firebase.google.com/project/label-app-b5e46/firestore

2. Find your user document in the `users` collection

3. Edit the `permissions` field:
   - Copy the `kitchen_bath_permits` object
   - Create new field `kitchen_permits` with the same values
   - Create new field `bath_permits` with the same values
   - Delete the `kitchen_bath_permits` field

**Before:**
```
permissions: {
  pool_permits: {...},
  kitchen_bath_permits: {...},  ← Remove this
  roof_permits: {...}
}
```

**After:**
```
permissions: {
  pool_permits: {...},
  kitchen_permits: {...},  ← Add this
  bath_permits: {...},     ← Add this
  roof_permits: {...}
}
```

### Step 2: Migrate Templates

For each template with `permitType: "kitchen_bath_permits"`:

1. Look at the template name and content
2. If it's for bathrooms → change to `bath_permits`
3. If it's for kitchens → change to `kitchen_permits`

### Step 3: Migrate Leads

For each lead with `permitType: "kitchen_bath_permits"`:

1. Review the lead details
2. Determine if it's a kitchen or bathroom renovation
3. Change `permitType` to either `kitchen_permits` or `bath_permits`

---

## Option 3: Using Firebase CLI (For developers)

1. Open Firebase Functions shell:
```bash
firebase functions:shell
```

2. Run user migration:
```javascript
migrateKitchenBathPermits()
```

3. Run template migration:
```javascript
migrateTemplatePermitTypes()
```

4. Run lead migration (choose one):
```javascript
// Migrate all leads to kitchen
migrateLeadPermitTypes({defaultType: 'kitchen_permits'})

// OR migrate all leads to bath
migrateLeadPermitTypes({defaultType: 'bath_permits'})
```

---

## Verification

After migration, verify:

1. **Check Users**: All users should have `kitchen_permits` and `bath_permits` (no `kitchen_bath_permits`)

2. **Check Templates**: Templates should be categorized as either `kitchen_permits` or `bath_permits`

3. **Check Leads**: Leads should have either `kitchen_permits` or `bath_permits`

4. **Test App**: Make sure your app still works with the new structure

---

## Rollback (If Needed)

If something goes wrong, you can rollback by:

1. Going to Firestore
2. Clicking the "Restore" button at the top
3. Selecting a backup from before the migration

**Important**: Firestore keeps backups for 7 days

---

## Support

If you encounter issues:
1. Check Firebase Functions logs: https://console.firebase.google.com/project/label-app-b5e46/functions/logs
2. Check Firestore data: https://console.firebase.google.com/project/label-app-b5e46/firestore
3. Review error messages in the migration output

---

## After Migration

Once migration is complete:

1. ✅ Update Firestore security rules (use the new rules provided)
2. ✅ Test your app thoroughly
3. ✅ Remove migration functions (optional - they won't run automatically)
4. ✅ Celebrate! 🎉

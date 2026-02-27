# Admin User Creation Guide

This guide explains how to create the admin user account: **admin@labelsalesagents.com**

---

## ⚠️ Prerequisites

Before creating the admin user, you **MUST** complete Firebase setup:

1. ✅ **Enable Firebase Authentication**
   - Go to: https://console.firebase.google.com/project/YOUR_PROJECT/authentication
   - Click "Get Started"
   - Enable "Email/Password" sign-in method

2. ✅ **Create Firestore Database**
   - Go to: https://console.firebase.google.com/project/YOUR_PROJECT/firestore
   - Click "Create Database"
   - Choose "Production mode" or "Test mode"

3. ✅ **Ensure Firebase Config Files are in Place**
   - Android: `android/app/google-services.json`
   - iOS: `ios/GoogleService-Info.plist`

**If you haven't done these steps yet**, see `docs/FIREBASE_PRODUCTION_SETUP.md` first!

---

## Method 1: Using the Script (Recommended)

### Step 1: Install Dependencies

```bash
npm install --save-dev ts-node @types/node
```

### Step 2: Run the Script

```bash
npx ts-node scripts/createAdminUser.ts
```

### Expected Output:

```
🔥 Creating admin user...

Step 1: Creating Firebase Authentication user...
✅ Firebase Auth user created with UID: abc123...

Step 2: Checking if this is the first user...
✅ First user - will assign MASTER role

Step 3: Creating user profile in Firestore...
✅ User profile created in Firestore

Step 4: Creating audit log entry...
✅ Audit log entry created

═══════════════════════════════════════════════════════
🎉 ADMIN USER CREATED SUCCESSFULLY!

📧 Email: admin@labelsalesagents.com
🔒 Password: Thelabel99!
👤 Display Name: Admin User
🔑 UID: abc123def456...
⭐ Role: MASTER
═══════════════════════════════════════════════════════

✅ You can now log in to the app with these credentials.

⚠️  IMPORTANT: Change the password after first login for security!
```

---

## Method 2: Using the App (Mobile/Web)

### Step 1: Open the App

Start the development server:
```bash
npm start
```

### Step 2: Sign Up

1. Open the app on web (press `w`) or mobile
2. Navigate to the Sign Up screen
3. Enter:
   - **Email**: admin@labelsalesagents.com
   - **Password**: Thelabel99!
   - **Display Name**: Admin User
4. Click "Sign Up"

**Note**: The first user to sign up automatically gets **MASTER** role!

---

## Method 3: Firebase Console (Manual)

### Step 1: Create Auth User

1. Go to: https://console.firebase.google.com/project/YOUR_PROJECT/authentication/users
2. Click "Add User"
3. Enter:
   - **Email**: admin@labelsalesagents.com
   - **Password**: Thelabel99!
4. Click "Add User"
5. Copy the generated **UID**

### Step 2: Create User Profile in Firestore

1. Go to: https://console.firebase.google.com/project/YOUR_PROJECT/firestore/data
2. Click "Start Collection"
3. Collection ID: `users`
4. Document ID: (paste the UID from Step 1)
5. Add these fields:

```json
{
  "uid": "YOUR_UID_HERE",
  "email": "admin@labelsalesagents.com",
  "displayName": "Admin User",
  "role": "master",
  "permissions": {
    "pool_permits": ["view", "create", "edit", "delete", "export", "send_sms", "send_email"],
    "kitchen_bath_permits": ["view", "create", "edit", "delete", "export", "send_sms", "send_email"],
    "roof_permits": ["view", "create", "edit", "delete", "export", "send_sms", "send_email"]
  },
  "createdAt": "CURRENT_TIMESTAMP",
  "lastLogin": "CURRENT_TIMESTAMP",
  "isActive": true,
  "hasAcceptedTerms": true,
  "acceptedTermsVersion": "1.0",
  "hasAcceptedPrivacy": true,
  "acceptedPrivacyVersion": "1.0",
  "fcmTokens": []
}
```

6. Click "Save"

---

## Verification

After creating the admin user, verify it works:

### 1. Check Firebase Authentication

Go to: https://console.firebase.google.com/project/YOUR_PROJECT/authentication/users

You should see: **admin@labelsalesagents.com**

### 2. Check Firestore

Go to: https://console.firebase.google.com/project/YOUR_PROJECT/firestore/data/users

You should see a document with the admin user's data.

### 3. Test Login in App

1. Open the app
2. Go to Login screen
3. Enter:
   - **Email**: admin@labelsalesagents.com
   - **Password**: Thelabel99!
4. Click "Login"

You should be logged in with **MASTER** role and full permissions!

---

## Troubleshooting

### Error: "auth/email-already-in-use"

This email is already registered. Options:
1. Reset password via Firebase Console
2. Delete the existing user and try again
3. Use the app's "Forgot Password" feature

### Error: "auth/operation-not-allowed"

Email/Password authentication is not enabled.

**Fix:**
1. Go to: https://console.firebase.google.com/project/YOUR_PROJECT/authentication/providers
2. Click "Email/Password"
3. Toggle "Enable"
4. Click "Save"

### Error: "Firestore permission denied"

Your security rules are too restrictive.

**Fix:**
1. Go to: https://console.firebase.google.com/project/YOUR_PROJECT/firestore/rules
2. Temporarily use test mode rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
3. Click "Publish"
4. Try creating the user again
5. Deploy production rules from `docs/SECURITY_RULES.md`

### Script Error: "Cannot find module"

Install dependencies:
```bash
npm install --save-dev ts-node @types/node
```

---

## Security Recommendations

After creating the admin account:

1. **Change Password Immediately**
   - The password "Thelabel99!" is now in this document
   - Change it through the app or Firebase Console

2. **Enable 2FA** (if available in your Firebase project)

3. **Review Audit Logs** regularly
   - Check `auditLogs` collection in Firestore

4. **Limit Admin Accounts**
   - Only create admin/master accounts for trusted users
   - Use "user" role for regular employees

5. **Deploy Security Rules**
   - See `docs/SECURITY_RULES.md`
   - Test rules before going to production

---

## User Roles Explained

### Master (highest privileges)
- Full access to everything
- Can manage users and assign roles
- Can edit system settings
- Can view audit logs
- **Only the first user gets this role automatically**

### Admin
- Can manage leads, templates, notifications
- Can send SMS/Email
- Can export data
- Cannot manage users or edit system settings

### Manager
- Can view and edit leads
- Can send messages
- Cannot delete or export

### User (lowest privileges)
- Can view leads only
- Cannot edit, delete, or send messages

---

## Next Steps

After creating your admin user:

1. ✅ Log in to the app
2. ✅ Change your password
3. ✅ Test all features (leads, templates, messaging)
4. ✅ Create additional user accounts (with appropriate roles)
5. ✅ Deploy Cloud Functions (see `docs/CLOUD_FUNCTIONS.md`)
6. ✅ Set up Push Notifications (see `docs/FIREBASE_PRODUCTION_SETUP.md`)
7. ✅ Import or create test data

See `MIGRATION_SUMMARY.md` for the complete checklist!

---

**Questions?** Check the main documentation:
- `docs/FIREBASE_PRODUCTION_SETUP.md` - Firebase setup guide
- `docs/SECURITY_RULES.md` - Security rules documentation
- `MIGRATION_SUMMARY.md` - Migration checklist

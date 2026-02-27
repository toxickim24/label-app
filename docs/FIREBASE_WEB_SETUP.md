# Firebase Web Setup - Quick Guide

## Step 1: Get Your Firebase Web Config

1. Go to **Firebase Console**: https://console.firebase.google.com
2. Select your project (or create one)
3. Click **gear icon (⚙️)** next to "Project Overview"
4. Click **"Project settings"**
5. Scroll to **"Your apps"** section
6. Click the **Web icon** (`</>`)
7. If you don't have a web app:
   - Click **"Add app"**
   - Give it a nickname: "Label Web"
   - Don't check Firebase Hosting
   - Click **"Register app"**

8. Copy the config object (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 2: Add Config to Your App

1. Open `src/config/firebase.web.ts`
2. Replace the placeholder config with your actual config
3. Save the file

## Step 3: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **"Get started"**
3. Click **"Sign-in method"** tab
4. Enable **"Email/Password"**
5. Save

## Step 4: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for now)
4. Select your region (closest to you)
5. Click **"Enable"**

## Step 5: Create Your Admin User

### Option A: Via Firebase Console

1. Go to **Authentication > Users**
2. Click **"Add user"**
3. Email: `admin@labelsalesagents.com`
4. Password: `Thelabel99!`
5. Click **"Add user"**
6. **Copy the UID**

7. Go to **Firestore Database**
8. Click **"Start collection"**
9. Collection ID: `users`
10. Document ID: **Paste the UID**
11. Add these fields:
```
uid: YOUR_UID (string)
email: admin@labelsalesagents.com (string)
displayName: Admin User (string)
role: master (string)
isActive: true (boolean)
hasAcceptedTerms: true (boolean)
acceptedTermsVersion: 1.0 (string)
hasAcceptedPrivacy: true (boolean)
acceptedPrivacyVersion: 1.0 (string)
permissions: (map - see below)
createdAt: (timestamp - use server time)
lastLogin: (timestamp - use server time)
fcmTokens: [] (array - empty)
```

For permissions (map):
```
permissions (map)
  pool_permits: ["view","create","edit","delete","export","send_sms","send_email"] (array)
  kitchen_bath_permits: ["view","create","edit","delete","export","send_sms","send_email"] (array)
  roof_permits: ["view","create","edit","delete","export","send_sms","send_email"] (array)
```

12. Click **"Save"**

### Option B: Use the Sign Up Screen (After config is added)

1. Refresh your web browser at localhost:8081
2. Click "Sign Up" (if available)
3. Enter your details
4. The first user will automatically get "master" role

## Step 6: Test Login

1. Refresh localhost:8081
2. Enter email: `admin@labelsalesagents.com`
3. Enter password: `Thelabel99!`
4. Click **"Login"**

You should now be logged in!

---

## Troubleshooting

### Error: "No Firebase App '[DEFAULT]' has been created"
- **Solution**: Make sure you've added your Firebase config to `src/config/firebase.web.ts`

### Error: "Firebase: Error (auth/user-not-found)"
- **Solution**: Create the user in Firebase Console Authentication section

### Error: "auth/api-key-not-valid"
- **Solution**: Check your Firebase config - make sure the apiKey is correct

### Error: "Firebase: Access to this account has been temporarily disabled"
- **Solution**: Wait a few minutes or reset password in Firebase Console

### Login button does nothing
- **Solution**: Check browser console for errors (F12 > Console tab)

---

## What's Next?

After successful login:
1. You'll see the dashboard with mock data
2. To use real Firebase data, update the stores to use Firestore
3. Deploy security rules from `docs/SECURITY_RULES.md`
4. Deploy Cloud Functions from `docs/CLOUD_FUNCTIONS.md`

---

**Need Help?** Check the full documentation in `docs/FIREBASE_PRODUCTION_SETUP.md`

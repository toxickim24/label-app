# Firebase Production Setup Guide

Complete guide for setting up Firebase services for the Label App production environment.

**Last Updated:** February 2026
**Status:** Production Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Firebase Authentication Setup](#firebase-authentication-setup)
4. [Cloud Firestore Setup](#cloud-firestore-setup)
5. [Cloud Functions Setup](#cloud-functions-setup)
6. [Push Notifications Setup](#push-notifications-setup)
7. [Real-time Data Sync](#real-time-data-sync)
8. [Security Rules](#security-rules)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This guide will help you set up all Firebase services needed for Label App:

- **Authentication**: User sign-up, sign-in, and session management
- **Firestore**: NoSQL database for leads, templates, users, and notifications
- **Cloud Functions**: Server-side logic for sending emails/SMS, webhooks, etc.
- **Cloud Messaging**: Push notifications for new leads and updates
- **Real-time Sync**: Live updates across all devices

**Architecture:**
```
Mobile App (React Native)
    ↓
Firebase SDK
    ↓
├── Authentication (User Management)
├── Firestore (Database)
├── Cloud Functions (Backend Logic)
└── Cloud Messaging (Push Notifications)
```

---

## Prerequisites

### 1. Firebase Project Setup

You should have already completed:
- ✅ Created Firebase project at https://console.firebase.google.com
- ✅ Downloaded `google-services.json` (Android)
- ✅ Downloaded `GoogleService-Info.plist` (iOS)
- ✅ Placed files in correct folders:
  - `android/app/google-services.json`
  - `ios/GoogleService-Info.plist`

### 2. Enable Billing

**Important:** Cloud Functions require the Blaze (pay-as-you-go) plan.

1. Go to: https://console.firebase.google.com/project/_/usage/details
2. Click **"Modify Plan"**
3. Select **"Blaze Plan"**
4. Add payment method

**Cost Estimate:**
- Free tier includes: 125K reads/day, 50K writes/day, 20K deletes/day
- Typical monthly cost for 100 active users: **$10-50**
- Typical monthly cost for 1,000 active users: **$100-300**

### 3. Required Tools

Install these tools:
```bash
# Firebase CLI
npm install -g firebase-tools

# Verify installation
firebase --version
```

---

## Firebase Authentication Setup

### Step 1: Enable Authentication Methods

1. **Go to Firebase Console:**
   - https://console.firebase.google.com/project/YOUR_PROJECT/authentication

2. **Click "Get Started"**

3. **Enable Email/Password:**
   - Click "Sign-in method" tab
   - Click "Email/Password"
   - Toggle "Enable"
   - Click "Save"

4. **(Optional) Enable Google Sign-In:**
   - Click "Google"
   - Toggle "Enable"
   - Enter project name and support email
   - Click "Save"

### Step 2: Configure Email Templates

1. **Go to Templates Tab:**
   - https://console.firebase.google.com/project/YOUR_PROJECT/authentication/emails

2. **Customize Templates:**
   - Email verification
   - Password reset
   - Email address change

3. **Update Sender Info:**
   - From name: "Label App"
   - Reply-to email: your-support-email@domain.com

### Step 3: Test Authentication

The app already has Firebase Auth integration in `src/config/firebase.ts`.

**Test Sign-Up:**
```javascript
import { auth } from './config/firebase';

// Sign up new user
const signUp = async (email, password) => {
  const result = await auth().createUserWithEmailAndPassword(email, password);
  console.log('User created:', result.user.uid);
};

// Test
signUp('test@example.com', 'password123');
```

**Test Sign-In:**
```javascript
const signIn = async (email, password) => {
  const result = await auth().signInWithEmailAndPassword(email, password);
  console.log('User signed in:', result.user.uid);
};
```

---

## Cloud Firestore Setup

### Step 1: Create Database

1. **Go to Firestore:**
   - https://console.firebase.google.com/project/YOUR_PROJECT/firestore

2. **Click "Create Database"**

3. **Choose Mode:**
   - Select "Start in **production mode**" (we'll add rules next)
   - Click "Next"

4. **Choose Location:**
   - Select closest region (e.g., `us-central` for US)
   - Click "Enable"

### Step 2: Create Collections

Create these collections manually first (or they'll be created automatically when data is added):

1. **users** - User profiles and permissions
2. **leads** - Contractor leads (pool, kitchen/bath, roof permits)
3. **templates** - Email and SMS templates
4. **notifications** - In-app notifications
5. **auditLogs** - Activity tracking
6. **settings** - App configuration

### Step 3: Set Up Indexes

**Create Composite Indexes:**

1. **Go to Indexes Tab:**
   - https://console.firebase.google.com/project/YOUR_PROJECT/firestore/indexes

2. **Add These Indexes:**

**Index 1: leads - Filter by permitType and sort by date**
- Collection: `leads`
- Fields:
  - `permitType` Ascending
  - `createdDate` Descending
- Query scope: Collection

**Index 2: leads - Filter by status and sort by date**
- Collection: `leads`
- Fields:
  - `status` Ascending
  - `createdDate` Descending
- Query scope: Collection

**Index 3: leads - Filter by permitType, status, and sort**
- Collection: `leads`
- Fields:
  - `permitType` Ascending
  - `status` Ascending
  - `createdDate` Descending
- Query scope: Collection

**Index 4: templates - Active templates by type**
- Collection: `templates`
- Fields:
  - `permitType` Ascending
  - `isActive` Ascending
  - `createdAt` Descending
- Query scope: Collection

### Step 4: Add Initial Data

You can migrate your mock data or start fresh:

**Option A: Start Fresh**
- Users will create their own data
- First user will be assigned "master" role automatically

**Option B: Import Mock Data**
```javascript
// Run this once to import mock data
import { firestore } from './config/firebase';
import { MOCK_LEADS, MOCK_TEMPLATES } from './services/mockData';

const importData = async () => {
  const batch = firestore().batch();

  // Import leads
  MOCK_LEADS.forEach(lead => {
    const ref = firestore().collection('leads').doc(lead.id);
    batch.set(ref, lead);
  });

  // Import templates
  MOCK_TEMPLATES.forEach(template => {
    const ref = firestore().collection('templates').doc(template.id);
    batch.set(ref, template);
  });

  await batch.commit();
  console.log('Data imported successfully');
};
```

---

## Cloud Functions Setup

### Step 1: Initialize Cloud Functions

```bash
# Login to Firebase
firebase login

# Initialize Functions
cd label-app
firebase init functions

# Choose options:
# - Use existing project
# - Language: TypeScript
# - ESLint: Yes
# - Install dependencies: Yes
```

This creates a `functions/` folder.

### Step 2: Install Dependencies

```bash
cd functions
npm install --save axios twilio @sendgrid/mail
npm install --save-dev @types/node
```

### Step 3: Create Function Files

The complete Cloud Functions code is in `docs/CLOUD_FUNCTIONS.md`. Key functions to implement:

**src/index.ts** (main file):
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Authentication Functions
export { createUser, deleteUser } from './auth';

// Communication Functions
export { sendSMS, sendEmail } from './communications';

// Webhook Functions
export { twilioWebhook, sendgridWebhook } from './webhooks';

// Template Functions
export { generateAITemplate } from './ai';

// Notification Functions
export { sendPushNotification } from './notifications';
```

See `CLOUD_FUNCTIONS.md` for complete implementation.

### Step 4: Configure Environment Variables

```bash
# Set API keys
firebase functions:config:set \
  openai.api_key="YOUR_OPENAI_KEY" \
  twilio.account_sid="YOUR_TWILIO_SID" \
  twilio.auth_token="YOUR_TWILIO_TOKEN" \
  twilio.phone_number="+1234567890" \
  sendgrid.api_key="YOUR_SENDGRID_KEY" \
  sendgrid.from_email="noreply@yourdomain.com"
```

### Step 5: Deploy Functions

```bash
# Build TypeScript
npm run build

# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:sendSMS
```

### Step 6: Test Functions

```javascript
import { functions } from './config/firebase';

// Test sending SMS
const sendSMS = functions().httpsCallable('sendSMS');
const result = await sendSMS({
  to: '+1234567890',
  message: 'Test message from Label App'
});
console.log('SMS sent:', result.data);
```

---

## Push Notifications Setup

### Step 1: Enable Cloud Messaging

1. **Go to Cloud Messaging:**
   - https://console.firebase.google.com/project/YOUR_PROJECT/settings/cloudmessaging

2. **Enable API** (if not already enabled)

3. **Get Server Key:**
   - Copy the "Server Key" (you'll need this for testing)

### Step 2: Configure iOS (Apple Push Notification Service)

1. **Go to Apple Developer:**
   - https://developer.apple.com/account/resources/authkeys/list

2. **Create APNs Key:**
   - Click "+"
   - Select "Apple Push Notifications service (APNs)"
   - Download `.p8` key file

3. **Upload to Firebase:**
   - Go to Project Settings > Cloud Messaging
   - iOS app configuration
   - Upload APNs key
   - Enter Key ID and Team ID

### Step 3: Configure Android (FCM)

Android is automatically configured via `google-services.json`.

No additional setup needed!

### Step 4: Request Permission in App

The app already has this in `src/config/firebase.ts`:

```typescript
import messaging from '@react-native-firebase/messaging';

export const requestNotificationPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    return await messaging().getToken();
  }

  return null;
};
```

### Step 5: Handle Notifications

**Foreground Notifications:**
```typescript
useEffect(() => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('Notification received:', remoteMessage);

    // Show in-app alert or banner
    Alert.alert(
      remoteMessage.notification?.title || 'Notification',
      remoteMessage.notification?.body || ''
    );
  });

  return unsubscribe;
}, []);
```

**Background Notifications:**
```typescript
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message:', remoteMessage);
  // Handle notification silently
});
```

### Step 6: Send Test Notification

**From Firebase Console:**
1. Go to: https://console.firebase.google.com/project/YOUR_PROJECT/notification
2. Click "Send your first message"
3. Enter title and text
4. Click "Send test message"
5. Enter FCM token
6. Click "Test"

**From Cloud Function:**
```typescript
import * as admin from 'firebase-admin';

export const sendPushNotification = functions.https.onCall(async (data, context) => {
  const { userId, title, body } = data;

  // Get user's FCM tokens
  const userDoc = await admin.firestore().collection('users').doc(userId).get();
  const tokens = userDoc.data()?.fcmTokens || [];

  if (tokens.length === 0) {
    throw new functions.https.HttpsError('not-found', 'No FCM tokens found');
  }

  // Send notification
  const message = {
    notification: { title, body },
    tokens: tokens,
  };

  const response = await admin.messaging().sendMulticast(message);
  return { success: response.successCount, failed: response.failureCount };
});
```

---

## Real-time Data Sync

### Overview

Firestore provides real-time listeners that automatically update when data changes.

### Implementation in App

The stores already support real-time sync. Example:

**Leads Store (src/store/index.ts):**
```typescript
import { firestore } from '../config/firebase';

// Subscribe to leads collection
export const subscribeToLeads = (permitType: PermitType, callback: (leads: Lead[]) => void) => {
  const unsubscribe = firestore()
    .collection('leads')
    .where('permitType', '==', permitType)
    .orderBy('createdDate', 'desc')
    .onSnapshot(snapshot => {
      const leads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];

      callback(leads);
    });

  return unsubscribe; // Call this to unsubscribe
};
```

**Usage in Components:**
```typescript
useEffect(() => {
  const unsubscribe = subscribeToLeads('pool_permits', (leads) => {
    setLeads(leads);
  });

  // Cleanup on unmount
  return unsubscribe;
}, []);
```

### Real-time Features

1. **New Lead Notifications:**
   - When a lead is added to Firestore, all users see it instantly
   - Triggers push notification

2. **Status Updates:**
   - When lead status changes, all viewers see the update
   - Shows "Live" indicator

3. **Template Updates:**
   - When templates are modified, available immediately
   - No app restart needed

4. **Concurrent Editing:**
   - Multiple users can work on different leads simultaneously
   - Changes sync in real-time

---

## Security Rules

### Step 1: Deploy Security Rules

1. **Create firestore.rules file:**

See `docs/SECURITY_RULES.md` for complete rules.

2. **Deploy rules:**
```bash
firebase deploy --only firestore:rules
```

### Step 2: Test Security Rules

**From Firebase Console:**
1. Go to: https://console.firebase.google.com/project/YOUR_PROJECT/firestore/rules
2. Click "Rules Playground"
3. Test read/write operations

**Example Tests:**
```javascript
// Test: Can user read their own profile?
// Location: /users/{userId}
// User: auth.uid = 'user-123'
// Operation: get
// Expected: allow

// Test: Can user read another user's profile?
// Location: /users/other-user
// User: auth.uid = 'user-123'
// Operation: get
// Expected: deny (unless admin)
```

---

## Testing

### Step 1: Test Authentication

```bash
# Create test user
firebase auth:import users.json --hash-algo=NONE

# Or use app to create user
```

### Step 2: Test Firestore

```javascript
// Test writing data
import { firestore } from './config/firebase';

const testFirestore = async () => {
  // Add document
  const docRef = await firestore().collection('test').add({
    name: 'Test Document',
    timestamp: firestore.FieldValue.serverTimestamp()
  });

  console.log('Document added:', docRef.id);

  // Read document
  const doc = await firestore().collection('test').doc(docRef.id).get();
  console.log('Document data:', doc.data());

  // Delete document
  await firestore().collection('test').doc(docRef.id).delete();
  console.log('Document deleted');
};
```

### Step 3: Test Cloud Functions

```bash
# Test function locally
cd functions
npm run serve

# Call function from app (using local emulator)
const result = await functions().useFunctionsEmulator('http://localhost:5001')
  .httpsCallable('sendSMS')({
    to: '+1234567890',
    message: 'Test'
  });
```

### Step 4: Test Push Notifications

1. Get FCM token from app
2. Send test notification from Firebase Console
3. Verify notification is received

---

## Troubleshooting

### Common Issues

**1. "Firebase not initialized" Error**
```typescript
// Make sure firebase.ts is imported at app start
import './config/firebase'; // Add to App.tsx
```

**2. "Permission Denied" in Firestore**
- Check security rules
- Verify user is authenticated
- Check user role/permissions

**3. Cloud Functions Not Working**
```bash
# Check function logs
firebase functions:log

# Redeploy
firebase deploy --only functions
```

**4. Push Notifications Not Received**
- Verify FCM token is saved to user profile
- Check notification permissions
- Test with Firebase Console first
- Check iOS APNs certificate expiration

**5. Real-time Sync Not Working**
- Check internet connection
- Verify onSnapshot listener is active
- Check Firestore indexes

### Debug Mode

Enable Firebase debug logging:
```typescript
// Add to App.tsx
if (__DEV__) {
  // Enable Firestore logging
  firestore().settings({
    persistence: true,
    cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
  });
}
```

---

## Next Steps

1. ✅ Complete this setup guide
2. Deploy security rules
3. Deploy Cloud Functions
4. Test all features thoroughly
5. Set up monitoring and alerts
6. Configure backups
7. Plan for scaling

See `docs/DEPLOYMENT_GUIDE.md` for production deployment steps.

---

## Support Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **Firebase Console**: https://console.firebase.google.com
- **Status Page**: https://status.firebase.google.com
- **Stack Overflow**: https://stackoverflow.com/questions/tagged/firebase

---

**Version:** 1.0
**Last Updated:** February 2026
**Status:** ✅ Production Ready

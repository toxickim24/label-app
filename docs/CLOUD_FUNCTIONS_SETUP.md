# Cloud Functions Setup Guide

## What Was Set Up

I've successfully set up Firebase Cloud Functions for your Label app! Here's what was created:

### File Structure
```
functions/
├── src/
│   └── index.ts          # Your Cloud Functions code
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── .eslintrc.js         # Code quality rules

firebase.json             # Firebase project configuration
.firebaserc              # Firebase project ID
```

### Three Basic Functions Created

#### 1. **createUserProfile** (Auth Trigger)
- **Automatically runs** when a new user signs up
- Creates a user document in Firestore with default permissions
- Sets up initial user data structure

#### 2. **notifyOnNewLead** (Firestore Trigger)
- **Automatically runs** when a new lead is created
- Sends notifications to all admin and master users
- Creates notification documents in Firestore

#### 3. **updateLastLogin** (HTTPS Callable)
- **Called from your app** after successful login
- Updates the user's lastLogin timestamp

---

## Next Steps - Deploy Your Functions

### Step 1: Login to Firebase
Open a **new terminal** (not in this session) and run:
```bash
firebase login
```

This will open your browser to authenticate with Google.

### Step 2: Build Your Functions
```bash
cd functions
npm run build
```

This compiles your TypeScript code to JavaScript.

### Step 3: Deploy to Firebase
```bash
firebase deploy --only functions
```

This uploads your functions to Firebase Cloud Functions.

---

## Testing Your Functions

### Test Locally (Before Deploying)

1. **Start the Firebase Emulator**:
   ```bash
   cd functions
   npm run serve
   ```

2. **Create a test user** in Firebase Auth Console or your app

3. **Watch the logs** to see the functions execute:
   ```bash
   firebase functions:log
   ```

### Test in Production (After Deploying)

1. **Create a new user** through your app's signup
   - The `createUserProfile` function will automatically create their Firestore document

2. **Add a new lead** to Firestore
   - The `notifyOnNewLead` function will send notifications to admins

3. **View logs in Firebase Console**:
   - Go to: Firebase Console → Functions → Logs
   - See real-time execution logs

---

## How to Call Functions from Your App

### Example: Calling updateLastLogin

In your `src/services/authService.ts`:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

export const updateUserLastLogin = async () => {
  try {
    const updateLastLogin = httpsCallable(functions, 'updateLastLogin');
    const result = await updateLastLogin();
    console.log('Last login updated:', result);
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};
```

Then call it after successful login:
```typescript
// In your login function
await signInWithEmailAndPassword(auth, email, password);
await updateUserLastLogin(); // Call the cloud function
```

---

## Adding More Functions

### Example: Send SMS Function

Add to `functions/src/index.ts`:

```typescript
export const sendSMS = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { to, message } = data;

  // Add your Twilio logic here
  // This keeps your API keys secure on the server!

  return { success: true };
});
```

### Example: Generate AI Template Function

```typescript
export const generateTemplate = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { permitType, category } = data;

  // Add your OpenAI logic here
  // API keys stay secure on the server!

  return { template: 'generated template...' };
});
```

---

## Security Best Practices

### 1. Move API Keys to Cloud Functions
Instead of storing API keys in your app, move them to Cloud Functions:

```bash
firebase functions:config:set twilio.sid="YOUR_SID" twilio.token="YOUR_TOKEN"
firebase functions:config:set openai.key="YOUR_KEY"
```

Access in functions:
```typescript
const twilioSid = functions.config().twilio.sid;
const openaiKey = functions.config().openai.key;
```

### 2. Add Authentication Checks
Always verify the user is authenticated:
```typescript
if (!context.auth) {
  throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
}
```

### 3. Add Permission Checks
Verify user has the right permissions:
```typescript
const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
const user = userDoc.data();

if (user.role !== 'admin' && user.role !== 'master') {
  throw new functions.https.HttpsError('permission-denied', 'Admin access required');
}
```

---

## Monitoring & Debugging

### View Logs
```bash
firebase functions:log
```

Or in Firebase Console: **Functions → Logs**

### Check Function Status
Firebase Console → **Functions** → See all deployed functions

### Performance Monitoring
Firebase Console → **Performance** → See function execution times

---

## Cost Management

### Free Tier (Blaze Plan)
- **2 million invocations/month** - FREE
- **400,000 GB-seconds** - FREE
- **200,000 CPU-seconds** - FREE

### Tips to Stay in Free Tier
1. Use Firestore triggers (free) instead of scheduled functions where possible
2. Optimize function execution time
3. Monitor usage in Firebase Console → Usage & Billing

---

## Useful Commands

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy a specific function
firebase deploy --only functions:createUserProfile

# View real-time logs
firebase functions:log --only createUserProfile

# Delete a function
firebase functions:delete createUserProfile

# Test locally with emulator
cd functions && npm run serve
```

---

## Troubleshooting

### Build Errors
```bash
cd functions
npm run build
```
Fix any TypeScript errors shown.

### Deployment Fails
- Make sure you're logged in: `firebase login`
- Check project ID: `firebase use`
- Verify you're on Blaze plan in Firebase Console

### Function Not Executing
- Check logs: `firebase functions:log`
- Verify function is deployed: Firebase Console → Functions
- Check Firestore rules allow the operation

---

## What's Next?

1. **Deploy the functions**: Run `firebase deploy --only functions`
2. **Test user creation**: Sign up a new user and check Firestore
3. **Move API keys**: Transfer Twilio/OpenAI/SendGrid keys to Cloud Functions
4. **Add more functions**: Build functions for SMS sending, template generation, etc.

Need help? Check out:
- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Cloud Functions Samples](https://github.com/firebase/functions-samples)

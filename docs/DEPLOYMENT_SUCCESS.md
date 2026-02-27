# Cloud Functions Deployment - SUCCESS

## Deployment Summary

All 6 Cloud Functions have been successfully deployed to Firebase!

**Project**: label-app-b5e46
**Region**: us-central1
**Runtime**: Node.js 20
**Date**: February 26, 2026

---

## Deployed Functions

### 1. createUserProfile
- **Type**: Auth Trigger
- **Trigger**: Automatically runs when a new user signs up
- **Purpose**: Creates user profile in Firestore with default permissions
- **No client code needed** - runs automatically

### 2. notifyOnNewLead
- **Type**: Firestore Trigger
- **Trigger**: Automatically runs when a new lead is created
- **Purpose**: Notifies admins/masters about new leads
- **No client code needed** - runs automatically

### 3. updateLastLogin
- **Type**: Callable Function
- **Purpose**: Updates user's last login timestamp
- **How to call from your app**:
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const updateLastLogin = httpsCallable(functions, 'updateLastLogin');

// Call it after user logs in
const result = await updateLastLogin();
```

### 4. generateAITemplate
- **Type**: Callable Function
- **Purpose**: Generates email/SMS templates using OpenAI
- **Secured API**: OpenAI API key is stored server-side
- **How to call from your app**:
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const generateAITemplate = httpsCallable(functions, 'generateAITemplate');

// Example usage
const result = await generateAITemplate({
  permitType: 'pool_permits',
  category: 'homeowner_email',
  leadData: {
    firstName: 'John',
    lastName: 'Doe',
    fullAddress: '123 Main St',
    city: 'Springfield',
    state: 'IL'
  }
});

console.log(result.data.content); // Generated template
```

### 5. sendSMS
- **Type**: Callable Function
- **Purpose**: Sends SMS via Twilio
- **Secured API**: Twilio credentials stored server-side
- **Permission Check**: Requires user to have `text: true` permission
- **How to call from your app**:
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendSMS = httpsCallable(functions, 'sendSMS');

// Example usage
const result = await sendSMS({
  to: '+15551234567',
  body: 'Your message here',
  leadId: 'lead-123' // Optional - logs communication in Firestore
});

console.log(result.data.messageSid); // Twilio message ID
```

### 6. sendEmail
- **Type**: Callable Function
- **Purpose**: Sends emails via SendGrid
- **Secured API**: SendGrid API key stored server-side
- **Permission Check**: Requires user to have `email: true` permission
- **How to call from your app**:
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const sendEmail = httpsCallable(functions, 'sendEmail');

// Example usage
const result = await sendEmail({
  to: 'recipient@example.com',
  subject: 'Your Subject',
  body: 'Your message here',
  leadId: 'lead-123' // Optional - logs communication in Firestore
});

console.log(result.data.messageId); // SendGrid message ID
```

---

## Environment Variables Configured

All API keys are securely stored in `functions/.env` (never committed to git):

- `OPENAI_API_KEY` - OpenAI API access
- `OPENAI_MODEL` - GPT-4 Turbo Preview
- `TWILIO_ACCOUNT_SID` - Twilio account
- `TWILIO_AUTH_TOKEN` - Twilio auth
- `TWILIO_PHONE_NUMBER` - Your Twilio number
- `SENDGRID_API_KEY` - SendGrid API access
- `SENDGRID_FROM_EMAIL` - Your sender email
- `SENDGRID_FROM_NAME` - Label App

---

## Next Steps

### 1. Update Client Code

You need to replace direct API calls with Cloud Functions calls. Here's what to update:

#### Replace OpenAI Direct Calls
**Before** (in your app):
```typescript
import { OPENAI_API_KEY } from './config/api';
// Direct API call
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
});
```

**After**:
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';
const functions = getFunctions();
const generateAITemplate = httpsCallable(functions, 'generateAITemplate');
const result = await generateAITemplate({ permitType, category });
```

#### Replace Twilio Direct Calls
**Before**:
```typescript
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } from './config/api';
// Direct API call with exposed credentials
```

**After**:
```typescript
const sendSMS = httpsCallable(functions, 'sendSMS');
const result = await sendSMS({ to, body, leadId });
```

#### Replace SendGrid Direct Calls
**Before**:
```typescript
import { SENDGRID_API_KEY } from './config/api';
// Direct API call with exposed key
```

**After**:
```typescript
const sendEmail = httpsCallable(functions, 'sendEmail');
const result = await sendEmail({ to, subject, body, leadId });
```

### 2. Remove Old API Keys

Once you've updated your client code, you can:
- Delete or comment out `src/config/api.ts` (no longer needed)
- The keys are now only in `functions/.env` (secure)

### 3. Test the Functions

Test each function to make sure they work:

```bash
# View function logs in real-time
firebase functions:log --only generateAITemplate
firebase functions:log --only sendSMS
firebase functions:log --only sendEmail
```

Or view all logs in Firebase Console:
https://console.firebase.google.com/project/label-app-b5e46/functions/logs

### 4. Monitor Costs

Your functions are on the Blaze plan:
- **Free tier**: 2M invocations/month
- **After free tier**: $0.40 per million invocations
- **Monitor usage**: https://console.firebase.google.com/project/label-app-b5e46/usage

---

## Security Features

1. **API Keys Secured**: All API keys are server-side only
2. **Authentication Required**: All callable functions require user to be logged in
3. **Permission Checks**: SMS/Email functions verify user permissions
4. **Environment Variables**: Using modern `.env` approach (not deprecated config)
5. **Git Ignored**: `.env` files never committed to repository

---

## Troubleshooting

### Function not working?
```bash
# Check function logs
firebase functions:log

# Test function locally
cd functions
npm run serve
```

### Need to update environment variables?
1. Edit `functions/.env`
2. Redeploy: `firebase deploy --only functions`

### Need to update function code?
1. Edit files in `functions/src/`
2. Build: `cd functions && npm run build`
3. Deploy: `firebase deploy --only functions`

---

## Useful Commands

```bash
# List all deployed functions
firebase functions:list

# View function logs
firebase functions:log

# Deploy only specific function
firebase deploy --only functions:sendEmail

# Delete a function
firebase functions:delete sendEmail

# Run functions locally for testing
cd functions && npm run serve
```

---

## Cost Management

**Artifact Registry Cleanup**: Configured to delete images older than 1 day to minimize storage costs.

**Current Setup**:
- Location: us-central1
- Cleanup Policy: Delete images after 1 day
- This prevents accumulation of old Docker images

---

## Documentation

For more details, see:
- `docs/CLOUD_FUNCTIONS_SETUP.md` - Initial setup guide
- `docs/API_KEYS_SECURE_SETUP.md` - API keys migration guide
- Firebase Console: https://console.firebase.google.com/project/label-app-b5e46

---

## Success! 🎉

Your Firebase Cloud Functions are now live and securing your API keys. All communications (SMS, Email, AI) are now server-side and protected.

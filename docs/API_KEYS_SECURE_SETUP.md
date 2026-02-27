# Secure API Keys Setup Guide

## Overview

Your API keys are now secured in Firebase Cloud Functions instead of your app code. This means:
- ✅ **API keys never exposed** in your app bundle
- ✅ **Server-side permission checks** before any API calls
- ✅ **Centralized key management** via Firebase console
- ✅ **Audit trail** of all API usage in Cloud Functions logs

---

## Step 1: Configure API Keys in Firebase

You need to set your API keys in Firebase Functions configuration. Run these commands in your terminal:

### OpenAI API Key
```bash
firebase functions:config:set openai.key="YOUR_OPENAI_API_KEY_HERE"
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

### Twilio Credentials
```bash
firebase functions:config:set twilio.sid="YOUR_TWILIO_ACCOUNT_SID"
firebase functions:config:set twilio.token="YOUR_TWILIO_AUTH_TOKEN"
firebase functions:config:set twilio.phone="+1YOUR_TWILIO_PHONE_NUMBER"
```

Get your Twilio credentials from: https://console.twilio.com/

### SendGrid Credentials
```bash
firebase functions:config:set sendgrid.key="YOUR_SENDGRID_API_KEY"
firebase functions:config:set sendgrid.from="your-verified-email@example.com"
firebase functions:config:set sendgrid.name="Label App"
```

Get your SendGrid API key from: https://app.sendgrid.com/settings/api_keys

### View Current Configuration
```bash
firebase functions:config:get
```

This shows all your configured values (keys are hidden for security).

---

## Step 2: Deploy Cloud Functions

```bash
firebase deploy --only functions
```

This will deploy 6 functions:
- `createUserProfile` - Auto-creates user profiles on signup
- `notifyOnNewLead` - Sends notifications when leads are created
- `updateLastLogin` - Updates user login timestamps
- `generateAITemplate` - **Secure** OpenAI template generation
- `sendSMS` - **Secure** Twilio SMS sending
- `sendEmail` - **Secure** SendGrid email sending

---

## Step 3: Update Your Client Code

Now update your app to call the Cloud Functions instead of making direct API calls.

### Install Firebase Functions in your app

```bash
npm install firebase-functions
```

### Update AI Service

**File:** `src/services/aiService.ts`

Replace the `generateAITemplate` function:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../config/firebase'; // Your Firebase app instance

const functions = getFunctions(app);

export async function generateAITemplate(
  params: GenerateTemplateParams
): Promise<{ content: string; provider: AIProvider; model: string }> {
  try {
    const generateTemplate = httpsCallable(functions, 'generateAITemplate');

    const result = await generateTemplate({
      permitType: params.permitType,
      category: params.category,
      customPrompt: params.customPrompt,
      leadData: params.leadData,
    });

    return result.data as { content: string; provider: AIProvider; model: string };
  } catch (error: any) {
    console.error('Cloud Function Error:', error);
    throw new Error('Failed to generate template');
  }
}
```

### Update SMS Service

**File:** `src/services/smsService.ts`

Replace the `sendSMS` function:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../config/firebase';

const functions = getFunctions(app);

export async function sendSMS(params: SendSMSParams): Promise<SMSResponse> {
  try {
    const sendSMSFunction = httpsCallable(functions, 'sendSMS');

    const result = await sendSMSFunction({
      to: params.to,
      body: params.body,
      leadId: params.leadId,
    });

    return result.data as SMSResponse;
  } catch (error: any) {
    console.error('Cloud Function Error:', error.message);
    return {
      success: false,
      error: error.message || 'Failed to send SMS',
    };
  }
}
```

### Update Email Service

**File:** `src/services/emailService.ts`

Replace the `sendEmail` function:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../config/firebase';

const functions = getFunctions(app);

export async function sendEmail(params: SendEmailParams): Promise<EmailResponse> {
  try {
    const sendEmailFunction = httpsCallable(functions, 'sendEmail');

    const result = await sendEmailFunction({
      to: params.to,
      subject: params.subject,
      body: params.body,
      leadId: params.leadId,
    });

    return result.data as EmailResponse;
  } catch (error: any) {
    console.error('Cloud Function Error:', error.message);
    return {
      success: false,
      error: error.message || 'Failed to send email',
    };
  }
}
```

---

## Step 4: Remove Old API Keys

After deploying and testing:

1. **Delete** or **comment out** the API keys in `src/config/api.ts`
2. **Never commit** API keys to git (they're already in .gitignore)
3. **Revoke old keys** if they were ever exposed

---

## Testing Your Setup

### Test AI Template Generation

```typescript
// In your app
import { generateAITemplate } from './services/aiService';

const result = await generateAITemplate({
  provider: 'openai',
  permitType: 'pool_permits',
  category: 'homeowner_email',
});

console.log('Generated template:', result.content);
```

### Test SMS Sending

```typescript
// In your app
import { sendSMS } from './services/smsService';

const result = await sendSMS({
  to: '+1234567890',
  body: 'Test message from Label App',
  leadId: 'lead-123', // optional
});

console.log('SMS sent:', result.success);
```

### Test Email Sending

```typescript
// In your app
import { sendEmail } from './services/emailService';

const result = await sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  body: 'This is a test email from Label App',
  leadId: 'lead-123', // optional
});

console.log('Email sent:', result.success);
```

---

## Security Features

### 1. Authentication Required
All Cloud Functions check if the user is authenticated:
```typescript
if (!context.auth) {
  throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
}
```

### 2. Permission Checks
SMS and Email functions verify user has the correct permissions:
```typescript
const hasEmailPermission = Object.values(user.permissions).some(
  (perm: any) => perm.email === true
);
```

### 3. Audit Logging
All API calls are logged in Firebase Cloud Functions:
- View logs: `firebase functions:log`
- Or in Firebase Console → Functions → Logs

### 4. Rate Limiting
Firebase automatically rate limits Cloud Functions to prevent abuse.

---

## Monitoring & Costs

### View Usage
Firebase Console → Functions → Usage

### Costs
- **First 2M invocations/month**: FREE
- **Additional invocations**: $0.40 per million
- **Typical usage for your app**: Likely stays in free tier

### Monitor Costs
Firebase Console → Usage & Billing → View detailed usage

---

## Troubleshooting

### Function Not Found Error
```
Error: Function not found: generateAITemplate
```

**Fix:** Make sure you deployed the functions:
```bash
firebase deploy --only functions
```

### Configuration Missing Error
```
Error: OpenAI API key not configured
```

**Fix:** Set the API key:
```bash
firebase functions:config:set openai.key="YOUR_KEY"
firebase deploy --only functions
```

### Permission Denied Error
```
Error: User does not have SMS sending permission
```

**Fix:** Update user permissions in Firestore:
- Go to Firebase Console → Firestore
- Find the user document
- Update `permissions.pool_permits.text = true` (or other permit type)

### Local Testing

To test functions locally before deploying:
```bash
cd functions
npm run serve
```

Then update your app to point to the local emulator:
```typescript
import { connectFunctionsEmulator } from 'firebase/functions';

if (__DEV__) {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

---

## Best Practices

1. **Never hardcode API keys** in your app
2. **Use environment-specific configs** (dev/staging/prod)
3. **Rotate API keys regularly** (every 90 days)
4. **Monitor usage** to detect anomalies
5. **Set up billing alerts** in Firebase Console
6. **Review logs weekly** for errors or abuse

---

## Next Steps

✅ **Step 1:** Configure your API keys (commands above)
✅ **Step 2:** Deploy Cloud Functions (`firebase deploy --only functions`)
✅ **Step 3:** Update your client code (examples above)
✅ **Step 4:** Test each function thoroughly
✅ **Step 5:** Remove old API keys from your code

**Need help?** Check the logs:
```bash
firebase functions:log
```

Or view in Firebase Console → Functions → Logs

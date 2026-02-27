# 🔑 API Key Setup Instructions

## Where to Add Your API Keys

All API keys go in **ONE FILE**: `src/config/api.ts`

---

## Step-by-Step Setup

### 1. Open the API Configuration File

```
src/config/api.ts
```

### 2. Insert Your API Keys

Replace the empty strings with your actual API keys:

```typescript
export const API_CONFIG = {
  // ====================================================================
  // OPENAI (ChatGPT)
  // ====================================================================
  OPENAI_API_KEY: 'sk-proj-YOUR_KEY_HERE', // ← Paste your OpenAI key

  // ====================================================================
  // GOOGLE GEMINI
  // ====================================================================
  GEMINI_API_KEY: 'AIza_YOUR_KEY_HERE', // ← Paste your Gemini key

  // ====================================================================
  // TWILIO (SMS)
  // ====================================================================
  TWILIO_ACCOUNT_SID: 'AC_YOUR_SID_HERE', // ← Paste your Twilio SID
  TWILIO_AUTH_TOKEN: 'YOUR_TOKEN_HERE', // ← Paste your Twilio token
  TWILIO_PHONE_NUMBER: '+1234567890', // ← Your Twilio phone number

  // ====================================================================
  // SENDGRID (Email)
  // ====================================================================
  SENDGRID_API_KEY: 'SG._YOUR_KEY_HERE', // ← Paste your SendGrid key
  SENDGRID_FROM_EMAIL: 'noreply@yourcompany.com', // ← Your sender email
  SENDGRID_FROM_NAME: 'Label App',
};
```

### 3. Save the File

That's it! The app will automatically start using your API keys.

---

## How to Get API Keys

### OpenAI (ChatGPT)

1. Go to: https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-` or `sk-`)
5. Paste into `OPENAI_API_KEY`

**Cost**: ~$0.01 per template generated

### Google Gemini

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API key"
4. Copy the key (starts with `AIza`)
5. Paste into `GEMINI_API_KEY`

**Cost**: Free tier (60 requests/min), then pay-as-you-go

### Twilio (SMS)

1. Go to: https://console.twilio.com
2. Sign up for account
3. Dashboard shows:
   - Account SID (starts with `AC`)
   - Auth Token (click to reveal)
4. Buy a phone number: https://console.twilio.com/phone-numbers/search
5. Paste all three values into config

**Cost**: ~$0.0079 per SMS

### SendGrid (Email)

1. Go to: https://app.sendgrid.com/settings/api_keys
2. Sign up for account
3. Click "Create API Key"
4. Name it "Label App"
5. Permissions: "Full Access" or "Mail Send"
6. Copy key (starts with `SG.`)
7. Paste into `SENDGRID_API_KEY`
8. Add your verified sender email to `SENDGRID_FROM_EMAIL`

**Cost**: Free (100 emails/day), then $19.95/month (50k emails)

---

## Firebase Setup

Firebase credentials are configured differently:

### Android

1. Download `google-services.json` from Firebase Console
2. Place in: `android/app/google-services.json`

### iOS

1. Download `GoogleService-Info.plist` from Firebase Console
2. Place in: `ios/LabelApp/GoogleService-Info.plist`

**No manual entry needed** - Firebase SDK reads these files automatically!

---

## Testing API Keys

After adding your keys, the app will:

1. Automatically detect which APIs are configured
2. Use real APIs when keys are present
3. Use mock data when keys are missing
4. Show clear error messages if keys are invalid

### Check API Status

The app logs which APIs are active:

```
✅ OpenAI: Configured
✅ Gemini: Configured
✅ Twilio: Configured
✅ SendGrid: Configured
```

Or:

```
⚠️ OpenAI: Not configured - using mock data
⚠️ Twilio: Not configured - simulating SMS
```

---

## Security Best Practices

### ⚠️ NEVER commit API keys to Git!

**Before committing code:**

1. Add to `.gitignore`:
```
src/config/api.ts
.env
```

2. Or use environment variables (recommended for production):

```typescript
// src/config/api.ts
export const API_CONFIG = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  // ...
};
```

3. Create `.env` file:
```
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=AIza...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@yourcompany.com
```

### For Production

Use **Firebase Cloud Functions** with **Secret Manager**:

```bash
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set SENDGRID_API_KEY
```

Then your mobile app calls Cloud Functions, which have secure access to secrets.

---

## Troubleshooting

### "API key not configured" message

- Check you saved `src/config/api.ts` after pasting keys
- Restart the app
- Check for typos in keys

### "Invalid API key" error

- Verify key is correct (copy-paste again)
- Check key hasn't been revoked
- Ensure billing is set up (for paid APIs)

### SMS not sending

- Verify phone number format: `+1234567890`
- Check Twilio account has credit
- Ensure phone number is verified (for trial accounts)

### Email not sending

- Verify sender email is verified in SendGrid
- Check domain authentication (recommended)
- Ensure SendGrid account is active

---

## Development vs Production

### Development (Current Setup)

- API keys in `src/config/api.ts`
- Good for testing
- Easy to change
- ⚠️ Keys exposed in app bundle

### Production (Recommended)

- Move logic to Firebase Cloud Functions
- API keys in Secret Manager
- Mobile app calls Cloud Functions
- 🔒 Keys never exposed

**Migration Guide**: See `CLOUD_FUNCTIONS.md` for production setup

---

## Summary Checklist

- [ ] Created accounts for all services
- [ ] Obtained API keys
- [ ] Opened `src/config/api.ts`
- [ ] Pasted all keys
- [ ] Saved file
- [ ] Restarted app
- [ ] Tested each feature (AI, SMS, Email)
- [ ] Added `src/config/api.ts` to `.gitignore`
- [ ] Verified keys working

---

## Need Help?

1. Check console logs for specific error messages
2. Verify key format matches examples
3. Test keys using provider's API documentation
4. Ensure billing/limits configured correctly

---

**That's it!** Your Label app is now connected to all external services.

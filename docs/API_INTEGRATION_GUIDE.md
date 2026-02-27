# Label App - API Integration Guide

## Overview

This guide provides step-by-step instructions for integrating all external APIs required by Label:

1. **OpenAI (ChatGPT)**: AI template generation
2. **Google Gemini**: AI template generation
3. **Twilio**: SMS messaging
4. **SendGrid**: Email delivery

---

## Table of Contents

1. [OpenAI Integration](#openai-integration)
2. [Google Gemini Integration](#google-gemini-integration)
3. [Twilio Integration](#twilio-integration)
4. [SendGrid Integration](#sendgrid-integration)
5. [Firebase Secret Manager Setup](#firebase-secret-manager-setup)
6. [Testing & Verification](#testing--verification)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Troubleshooting](#troubleshooting)

---

## OpenAI Integration

### 1. Create OpenAI Account

1. Visit https://platform.openai.com/signup
2. Sign up with email
3. Verify email address
4. Complete profile setup

### 2. Set Up Billing

1. Go to https://platform.openai.com/account/billing
2. Add payment method
3. Set up billing alerts:
   - **Soft Limit**: $50/month (adjustable)
   - **Hard Limit**: $100/month (prevents overcharges)
4. Add email for usage alerts at 50%, 75%, 90%

### 3. Generate API Key

1. Navigate to https://platform.openai.com/api-keys
2. Click **+ Create new secret key**
3. Name it: "Label App Production"
4. **Important**: Copy key immediately (shown only once)
   - Format: `sk-proj-...` (starts with sk-proj or sk-)
5. Save key securely (will add to Firebase next)

### 4. Set Usage Limits

1. Go to https://platform.openai.com/account/limits
2. Set per-model limits:
   - **gpt-4-turbo-preview**: 10,000 tokens/min (adjust based on volume)
3. Enable rate limiting to prevent abuse

### 5. Configure in Label App

**Via Firebase Secret Manager:**

```bash
# Set secret
firebase functions:secrets:set OPENAI_API_KEY

# When prompted, paste your key: sk-proj-...

# Verify
firebase functions:secrets:access OPENAI_API_KEY
```

**Via Label Admin Panel:**

1. Open Label app as Master
2. Settings > Admin Panel > API Keys
3. Tap **+ Add Key**
4. Select **OpenAI**
5. Enter:
   - Display Name: "OpenAI Production"
   - API Key: `sk-proj-...`
6. Tap **Test Connection**
7. If successful, tap **Save**

### 6. Test Integration

**Manual Test:**

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-4-turbo-preview",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Write a brief email to a homeowner about their pool permit."}
    ],
    "max_tokens": 200
  }'
```

**Expected Response:**
```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4-turbo-preview",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Subject: Your Pool Permit Application\n\nDear Homeowner,\n\n..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 35,
    "completion_tokens": 120,
    "total_tokens": 155
  }
}
```

**In-App Test:**

1. Label app > Templates
2. Tap **Generate with AI**
3. Select **OpenAI**
4. Generate sample template
5. Verify content quality

### 7. Model Selection

**Recommended Models:**

| Model | Use Case | Cost | Speed |
|-------|----------|------|-------|
| **gpt-4-turbo-preview** | High-quality templates | $0.01/1K tokens | Medium |
| **gpt-4** | Best quality | $0.03/1K tokens | Slow |
| **gpt-3.5-turbo** | Budget option | $0.001/1K tokens | Fast |

**Configure in Cloud Function:**

```typescript
// functions/src/ai/generateTemplate.ts

const response = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview', // Change here
  messages: [...],
  temperature: 0.7,
  max_tokens: 500
});
```

### 8. Cost Estimation

**Average Template Generation:**
- Prompt: ~50 tokens
- Completion: ~200 tokens
- Total: ~250 tokens per generation

**Monthly Cost Examples:**

| Templates/Month | Model | Cost |
|-----------------|-------|------|
| 100 | GPT-4 Turbo | $0.75 |
| 500 | GPT-4 Turbo | $3.75 |
| 1,000 | GPT-4 Turbo | $7.50 |
| 5,000 | GPT-4 Turbo | $37.50 |

**Monitor Usage:**
https://platform.openai.com/usage

---

## Google Gemini Integration

### 1. Set Up Google Cloud Project

1. Visit https://console.cloud.google.com
2. Create new project: "Label App"
3. Note Project ID: `label-app-12345`

### 2. Enable Generative AI API

1. In Cloud Console, go to **APIs & Services** > **Library**
2. Search: "Generative Language API"
3. Click **Enable**
4. Wait for activation (~2 minutes)

### 3. Create API Key

**Via Google AI Studio (Easier):**

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click **Create API key**
4. Select project: "Label App"
5. Key generated: `AIza...`
6. **Copy immediately**

**Via Cloud Console:**

1. **APIs & Services** > **Credentials**
2. Click **+ Create Credentials** > **API Key**
3. Key created: `AIza...`
4. Click **Restrict Key**:
   - **Application restrictions**: None
   - **API restrictions**: Select "Generative Language API"
5. Save restrictions

### 4. Configure Quota

1. **APIs & Services** > **Quotas**
2. Find "Generative Language API"
3. Default limits:
   - Free tier: 60 requests/minute
   - Paid tier: Contact Google for increase

**Upgrade to Paid:**

1. Enable billing for project
2. Go to https://cloud.google.com/billing
3. Link billing account
4. Quotas automatically increase

### 5. Configure in Label App

**Via Firebase Secret Manager:**

```bash
firebase functions:secrets:set GEMINI_API_KEY
# Paste: AIza...
```

**Via Label Admin Panel:**

1. Settings > Admin Panel > API Keys
2. Tap **+ Add Key**
3. Select **Google Gemini**
4. Enter:
   - Display Name: "Gemini Production"
   - API Key: `AIza...`
5. Tap **Test Connection**
6. Save

### 6. Test Integration

**Manual Test:**

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts":[{
        "text": "Write a brief email to a homeowner about their pool permit."
      }]
    }]
  }'
```

**Expected Response:**
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Subject: Your Pool Permit\n\nDear Homeowner,\n\nCongratulations..."
          }
        ],
        "role": "model"
      },
      "finishReason": "STOP"
    }
  ]
}
```

**In-App Test:**

1. Templates > Generate with AI
2. Select **Google Gemini**
3. Generate template
4. Verify output

### 7. Model Options

**Available Models:**

| Model | Use Case | Features |
|-------|----------|----------|
| **gemini-pro** | Text generation | Best for templates |
| **gemini-pro-vision** | Image + text | Not needed for Label |
| **gemini-ultra** | Highest quality | Limited availability |

**Cost:**

- **Free Tier**: 60 requests/minute
- **Paid**: Pay-as-you-go (contact Google)

### 8. Set as Default Provider

1. Label Admin Panel > API Keys
2. Find Gemini key
3. Tap **Set as Default**
4. All template generations use Gemini unless specified otherwise

---

## Twilio Integration

### 1. Create Twilio Account

1. Visit https://www.twilio.com/try-twilio
2. Sign up (free trial available)
3. Verify email and phone number
4. Complete account setup

### 2. Get Trial or Upgrade

**Free Trial:**
- $15 free credit
- Can send to verified numbers only
- "Sent from Twilio trial account" prefix on SMS

**Production Account:**
1. Add payment method
2. Upgrade account
3. Remove trial restrictions

### 3. Purchase Phone Number

1. Twilio Console: https://console.twilio.com
2. **Phone Numbers** > **Buy a Number**
3. Select country: United States
4. Filter by:
   - **SMS**: Required
   - **Voice**: Optional (for calls)
   - **MMS**: Optional (for images)
5. Choose number (e.g., +1 415-XXX-XXXX)
6. Purchase ($1-2/month)

**Recommended:**
- Local number in your service area
- Toll-free (800, 888, etc.) for national reach

### 4. Get Credentials

1. Twilio Console: https://console.twilio.com
2. Note from Dashboard:
   - **Account SID**: `AC...` (public identifier)
   - **Auth Token**: `...` (secret, click to reveal)
3. Copy both

### 5. Configure Webhooks

**For Delivery Status:**

1. **Phone Numbers** > **Manage** > **Active Numbers**
2. Click your purchased number
3. Scroll to **Messaging**
4. **Configure**:
   - **A Message Comes In**: Leave blank (not needed)
   - **Status Callback URL**: `https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/twilioWebhook/status`
   - **Method**: POST
5. Save

**Note**: Replace with actual Cloud Function URL after deployment.

### 6. Configure in Label App

**Via Firebase Secret Manager:**

```bash
firebase functions:secrets:set TWILIO_ACCOUNT_SID
# Paste: AC...

firebase functions:secrets:set TWILIO_AUTH_TOKEN
# Paste: (your auth token)

firebase functions:secrets:set TWILIO_PHONE_NUMBER
# Enter: +14155551234
```

**Via Label Admin Panel:**

1. Settings > Admin Panel > API Keys
2. Tap **+ Add Key**
3. Select **Twilio**
4. Enter:
   - Display Name: "Twilio SMS Production"
   - Account SID: `AC...`
   - Auth Token: `...`
   - Phone Number: `+14155551234`
5. Tap **Test Connection** (sends test SMS to your number)
6. Verify you received SMS
7. Save

### 7. Test Integration

**Manual Test:**

```bash
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json" \
  --data-urlencode "From=+14155551234" \
  --data-urlencode "To=+15105551234" \
  --data-urlencode "Body=Test message from Label App" \
  -u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN
```

**Expected Response:**
```json
{
  "sid": "SM...",
  "status": "queued",
  "to": "+15105551234",
  "from": "+14155551234",
  "body": "Test message from Label App"
}
```

**In-App Test:**

1. Open any lead
2. Tap **Text**
3. Write test message
4. Send
5. Verify delivery in Twilio Console

### 8. Set Up Alerts

1. Twilio Console > **Monitor** > **Alerts**
2. Create alerts for:
   - **High Usage**: >1000 SMS/day
   - **Unusual Activity**: Spike detection
   - **Budget**: Spending limit
3. Add email for notifications

### 9. Compliance (IMPORTANT)

**TCPA Compliance:**
- Only text users who opted in
- Include opt-out instructions: "Reply STOP to unsubscribe"
- Honor opt-outs immediately
- Keep records of consent

**Set Up Opt-Out:**

1. Twilio Console > **Messaging** > **Regulatory Compliance**
2. Enable **Advanced Opt-Out**
3. Configure keywords:
   - **STOP**: Opt out
   - **START**: Opt back in
   - **HELP**: Get help message
4. Set help/opt-out responses

### 10. Cost Estimation

**SMS Pricing (US):**
- Outbound: $0.0079 per message
- Inbound: $0.0079 per message
- Phone number: $1.00/month

**Monthly Cost Examples:**

| SMS/Month | Cost |
|-----------|------|
| 100 | $1.79 |
| 500 | $4.95 |
| 1,000 | $8.90 |
| 5,000 | $40.50 |

**Monitor Usage:**
https://console.twilio.com/us1/billing/manage-billing/billing-overview

---

## SendGrid Integration

### 1. Create SendGrid Account

1. Visit https://signup.sendgrid.com
2. Sign up (free plan available)
3. Complete email verification
4. Answer onboarding questions

**Free Plan:**
- 100 emails/day (3,000/month)
- Basic features

**Paid Plans:**
- Essentials: $19.95/month (50,000 emails)
- Pro: Custom pricing

### 2. Domain Authentication (Critical)

**Why**: Improves deliverability and removes "via sendgrid.net"

**Setup:**

1. SendGrid Dashboard: https://app.sendgrid.com
2. **Settings** > **Sender Authentication**
3. Click **Authenticate Your Domain**
4. Select DNS host (e.g., GoDaddy, Cloudflare, etc.)
5. Enter domain: `labelapp.com`
6. SendGrid provides DNS records:
   ```
   CNAME em1234.labelapp.com → u12345.wl.sendgrid.net
   CNAME s1._domainkey.labelapp.com → s1.domainkey...
   CNAME s2._domainkey.labelapp.com → s2.domainkey...
   ```
7. Add records to your DNS provider
8. Return to SendGrid, click **Verify**
9. Wait for verification (5-30 minutes)

**If you don't own a domain:**
- Use SendGrid's shared domain (less ideal)
- Purchase domain from Google Domains, Namecheap, etc.

### 3. Sender Identity

**Single Sender:**

1. **Settings** > **Sender Authentication**
2. Click **Create New Sender**
3. Enter:
   - From Name: "Label App"
   - From Email: noreply@labelapp.com
   - Reply To: support@labelapp.com (optional)
   - Address: Your business address
4. Save
5. Verify email address (check inbox)

### 4. Generate API Key

1. **Settings** > **API Keys**
2. Click **Create API Key**
3. Name: "Label App Production"
4. Permissions: **Full Access** (or restricted to "Mail Send")
5. Click **Create & View**
6. **Copy key immediately**: `SG....` (shown only once)
7. Store securely

### 5. Configure Webhook (Event Tracking)

**For open/click tracking:**

1. **Settings** > **Mail Settings** > **Event Webhook**
2. Enable webhook
3. **HTTP Post URL**: `https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/sendgridWebhook/events`
4. **Authorization Method**: None (or use basic auth)
5. Select events to track:
   - [x] Delivered
   - [x] Opened
   - [x] Clicked
   - [x] Bounced
   - [x] Dropped
   - [x] Spam Report
6. **Test Your Integration** (sends test event)
7. Save

**Note**: Update URL after deploying Cloud Function.

### 6. Configure in Label App

**Via Firebase Secret Manager:**

```bash
firebase functions:secrets:set SENDGRID_API_KEY
# Paste: SG...

firebase functions:secrets:set SENDGRID_FROM_EMAIL
# Enter: noreply@labelapp.com

firebase functions:secrets:set SENDGRID_FROM_NAME
# Enter: Label App
```

**Via Label Admin Panel:**

1. Settings > Admin Panel > API Keys
2. Tap **+ Add Key**
3. Select **SendGrid**
4. Enter:
   - Display Name: "SendGrid Production"
   - API Key: `SG...`
   - From Email: noreply@labelapp.com
   - From Name: Label App
5. Tap **Test Connection** (sends test email)
6. Check inbox for test email
7. Save

### 7. Test Integration

**Manual Test:**

```bash
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header 'Authorization: Bearer YOUR_API_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "personalizations": [{
      "to": [{"email": "test@example.com"}]
    }],
    "from": {"email": "noreply@labelapp.com", "name": "Label App"},
    "subject": "Test Email from Label",
    "content": [{
      "type": "text/plain",
      "value": "This is a test email."
    }]
  }'
```

**Expected Response:**
```
202 Accepted
```

**In-App Test:**

1. Open any lead
2. Tap **Email**
3. Compose test email
4. Send
5. Verify receipt
6. Check SendGrid Dashboard for stats

### 8. Enable Tracking

**Email Open & Click Tracking:**

1. **Settings** > **Tracking**
2. Enable:
   - [x] Open Tracking
   - [x] Click Tracking
3. Save

**In Cloud Function:**

```typescript
// Already configured in sendEmail function
trackingSettings: {
  clickTracking: { enable: true },
  openTracking: { enable: true }
}
```

### 9. Set Up Alerts

1. **Settings** > **Alerts**
2. Create alerts for:
   - **Usage**: Approaching plan limit
   - **Deliverability**: Bounce rate >5%
   - **Spam**: Complaints >0.1%
3. Add email for notifications

### 10. Cost Estimation

**Pricing:**

| Plan | Emails/Month | Cost |
|------|--------------|------|
| Free | 3,000 | $0 |
| Essentials | 50,000 | $19.95 |
| Pro | 100,000 | $89.95 |

**Monitor Usage:**
https://app.sendgrid.com/statistics

---

## Firebase Secret Manager Setup

### 1. Enable Secret Manager API

```bash
# Enable API
gcloud services enable secretmanager.googleapis.com --project=YOUR_PROJECT_ID
```

### 2. Set All Secrets

```bash
# OpenAI
firebase functions:secrets:set OPENAI_API_KEY
# When prompted, paste: sk-proj-...

# Gemini
firebase functions:secrets:set GEMINI_API_KEY
# Paste: AIza...

# Twilio
firebase functions:secrets:set TWILIO_ACCOUNT_SID
# Paste: AC...

firebase functions:secrets:set TWILIO_AUTH_TOKEN
# Paste: (auth token)

firebase functions:secrets:set TWILIO_PHONE_NUMBER
# Enter: +14155551234

# SendGrid
firebase functions:secrets:set SENDGRID_API_KEY
# Paste: SG...

firebase functions:secrets:set SENDGRID_FROM_EMAIL
# Enter: noreply@labelapp.com

firebase functions:secrets:set SENDGRID_FROM_NAME
# Enter: Label App
```

### 3. Verify Secrets

```bash
# List all secrets
firebase functions:secrets:access --list

# View specific secret (use carefully)
firebase functions:secrets:access OPENAI_API_KEY
```

### 4. Grant Access to Functions

**Automatic** when using `defineSecret()` in functions:

```typescript
import { defineSecret } from 'firebase-functions/params';

const openaiKey = defineSecret('OPENAI_API_KEY');

export const generateTemplate = functions
  .runWith({ secrets: [openaiKey] })
  .https.onCall(async (data, context) => {
    const key = openaiKey.value();
    // Use key...
  });
```

### 5. Update Secrets

```bash
# Create new version
firebase functions:secrets:set OPENAI_API_KEY

# Deploy functions to use new version
firebase deploy --only functions
```

### 6. Delete Secrets (If Needed)

```bash
firebase functions:secrets:destroy OPENAI_API_KEY
```

---

## Testing & Verification

### Integration Checklist

**OpenAI:**
- [ ] API key added to Secret Manager
- [ ] Test connection successful
- [ ] Generate sample template in app
- [ ] Verify usage in OpenAI dashboard
- [ ] Billing alerts configured

**Gemini:**
- [ ] API key added to Secret Manager
- [ ] Test connection successful
- [ ] Generate sample template in app
- [ ] Verify quota in Google Cloud Console
- [ ] Set as default (if preferred)

**Twilio:**
- [ ] Account SID, Auth Token, Phone Number added
- [ ] Test SMS sent successfully
- [ ] Webhook URL configured
- [ ] Delivery status updates working
- [ ] Opt-out compliance configured

**SendGrid:**
- [ ] API key added to Secret Manager
- [ ] Domain authenticated
- [ ] Sender identity verified
- [ ] Test email sent successfully
- [ ] Webhook URL configured
- [ ] Open/click tracking working

### End-to-End Test

1. **Generate Template with AI:**
   - Templates > Generate with AI
   - Try both OpenAI and Gemini
   - Verify quality

2. **Send SMS:**
   - Open test lead
   - Send SMS
   - Verify delivery
   - Check Twilio Console

3. **Send Email:**
   - Open test lead
   - Send email
   - Verify delivery
   - Open email
   - Click link
   - Check SendGrid Dashboard

4. **Verify Tracking:**
   - Lead communication history shows:
     - SMS: Delivered status
     - Email: Opened and Clicked timestamps

---

## Monitoring & Analytics

### OpenAI

**Dashboard**: https://platform.openai.com/usage

**Metrics:**
- Total requests
- Tokens used
- Cost
- Errors

**Set Up Alerts:**
1. Account > Billing > Usage Notifications
2. Add thresholds (50%, 75%, 90%)

### Gemini

**Dashboard**: https://console.cloud.google.com/apis/dashboard

**Metrics:**
- Requests/day
- Quota usage
- Errors

**Set Up Alerts:**
1. Cloud Console > Monitoring > Alerting
2. Create alert policy for quota

### Twilio

**Dashboard**: https://console.twilio.com/monitor/alerts

**Metrics:**
- Messages sent/received
- Delivery rate
- Error rate
- Cost

**Key Metrics to Watch:**
- Undelivered rate: Should be <5%
- Response rate: Track engagement

### SendGrid

**Dashboard**: https://app.sendgrid.com/statistics

**Metrics:**
- Deliveries
- Opens
- Clicks
- Bounces
- Spam reports

**Key Metrics to Watch:**
- Bounce rate: Should be <5%
- Spam rate: Should be <0.1%
- Open rate: 15-25% is typical

---

## Troubleshooting

### OpenAI Issues

**Error: Invalid API Key**
- Verify key format (starts with sk-)
- Check key not revoked in OpenAI dashboard
- Ensure secret deployed to Cloud Functions

**Error: Rate Limit Exceeded**
- Increase limit in OpenAI dashboard
- Implement retry logic with exponential backoff
- Consider upgrading plan

**Error: Insufficient Quota**
- Add billing/increase limit
- Check usage dashboard

### Gemini Issues

**Error: API Not Enabled**
- Enable "Generative Language API" in Cloud Console
- Wait 5 minutes for propagation

**Error: Quota Exceeded**
- Free tier: 60 requests/min
- Enable billing for higher quota
- Contact Google for increase

### Twilio Issues

**SMS Not Delivered**
- Check phone number format (+1XXXXXXXXXX)
- Verify number not on blocklist
- Check Twilio error code in console

**Webhook Not Receiving Events**
- Verify webhook URL correct
- Ensure Cloud Function deployed
- Check function logs for errors
- Test webhook with Twilio's test tool

### SendGrid Issues

**Emails Going to Spam**
- Authenticate domain (critical!)
- Verify sender identity
- Warm up IP (gradually increase volume)
- Improve email content (avoid spam triggers)

**Webhook Not Working**
- Verify webhook URL
- Ensure Cloud Function deployed
- Check function logs
- Use SendGrid's webhook tester

---

## Security Best Practices

1. **Never Commit Secrets**: Don't store in code/git
2. **Rotate Keys**: Every 90 days minimum
3. **Least Privilege**: Grant minimal permissions
4. **Monitor Usage**: Watch for anomalies
5. **Rate Limit**: Prevent abuse
6. **Audit Logs**: Review regularly
7. **Backup Keys**: Have secondary keys ready
8. **Secure Storage**: Use Firebase Secret Manager only

---

This completes the API integration setup. All services should now be fully operational in your Label app.

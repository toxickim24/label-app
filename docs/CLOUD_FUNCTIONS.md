# Label App - Cloud Functions Implementation

## Overview

All backend business logic is implemented as Firebase Cloud Functions (Node.js 18+).

**Functions Deployment Region**: us-central1 (or closest to your users)

---

## Project Setup

### Initialize Functions

```bash
cd label-app
firebase init functions

# Select:
# - JavaScript or TypeScript (recommended: TypeScript)
# - ESLint: Yes
# - Install dependencies: Yes
```

### Package Dependencies

```json
{
  "name": "functions",
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.5.0",
    "openai": "^4.20.0",
    "@google/generative-ai": "^0.1.3",
    "twilio": "^4.19.0",
    "@sendgrid/mail": "^7.7.0",
    "express": "^4.18.2",
    "express-rate-limit": "^7.1.5",
    "cors": "^2.8.5",
    "axios": "^1.6.2",
    "joi": "^17.11.0",
    "libphonenumber-js": "^1.10.51"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.13.2",
    "@typescript-eslint/parser": "^6.13.2",
    "eslint": "^8.55.0",
    "typescript": "^5.3.3"
  }
}
```

### Environment Configuration

```bash
# .env file (for local development with emulators)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@labelapp.com
SENDGRID_FROM_NAME=Label App

# For production, use Secret Manager
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set TWILIO_PHONE_NUMBER
firebase functions:secrets:set SENDGRID_API_KEY
firebase functions:secrets:set SENDGRID_FROM_EMAIL
firebase functions:secrets:set SENDGRID_FROM_NAME
```

---

## Function Index

```typescript
// functions/src/index.ts

import * as admin from 'firebase-admin';
import { setGlobalOptions } from 'firebase-functions/v2';

admin.initializeApp();

// Set global options
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 100,
  timeoutSeconds: 540,
  memory: '512MiB'
});

// Export all functions
export * from './auth/onUserCreate';
export * from './auth/setCustomClaims';
export * from './auth/onUserDelete';

export * from './ai/generateTemplate';
export * from './ai/selectProvider';

export * from './communications/sendSms';
export * from './communications/sendEmail';
export * from './communications/twilioWebhook';
export * from './communications/sendgridWebhook';

export * from './leads/onLeadCreated';
export * from './leads/onLeadUpdated';
export * from './leads/importLeads';
export * from './leads/exportLeads';

export * from './notifications/sendPushNotification';
export * from './notifications/updateBadgeCount';

export * from './policies/onPolicyPublished';
export * from './policies/checkPolicyAcceptance';

export * from './admin/createAuditLog';
export * from './admin/getUserStats';
```

---

## 1. Authentication Functions

### onUserCreate - Initialize New User

```typescript
// functions/src/auth/onUserCreate.ts

import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName } = user;

  try {
    // Create user document with default settings
    await admin.firestore().collection('users').doc(uid).set({
      uid,
      email: email || '',
      displayName: displayName || email?.split('@')[0] || 'User',
      role: 'user', // Default role

      // Default permissions (none)
      permissions: {
        pool_permits: {
          view: false,
          create: false,
          edit: false,
          delete: false,
          text: false,
          email: false,
          export: false,
          import: false,
          reset_password: false,
          manage_templates: false,
          manage_api: false,
          manage_users: false
        },
        kitchen_bath_permits: {
          view: false,
          create: false,
          edit: false,
          delete: false,
          text: false,
          email: false,
          export: false,
          import: false,
          reset_password: false,
          manage_templates: false,
          manage_api: false,
          manage_users: false
        },
        roof_permits: {
          view: false,
          create: false,
          edit: false,
          delete: false,
          text: false,
          email: false,
          export: false,
          import: false,
          reset_password: false,
          manage_templates: false,
          manage_api: false,
          manage_users: false
        }
      },

      theme: 'system',
      terms_version: null,
      privacy_version: null,
      accepted_at: null,
      phone: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      disabled: false,
      fcmTokens: [],
      badgeCount: 0,
      createdBy: uid,
      updatedBy: uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Set default custom claims
    await admin.auth().setCustomUserClaims(uid, {
      role: 'user',
      permissions: {} // No permissions by default
    });

    console.log(`User ${uid} created successfully`);
  } catch (error) {
    console.error('Error creating user document:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create user');
  }
});
```

### setCustomClaims - Update User Permissions

```typescript
// functions/src/auth/setCustomClaims.ts

import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import Joi from 'joi';

const permissionSchema = Joi.object({
  view: Joi.boolean().required(),
  create: Joi.boolean().required(),
  edit: Joi.boolean().required(),
  delete: Joi.boolean().required(),
  text: Joi.boolean().required(),
  email: Joi.boolean().required(),
  export: Joi.boolean().required(),
  import: Joi.boolean().required(),
  reset_password: Joi.boolean().required(),
  manage_templates: Joi.boolean().required(),
  manage_api: Joi.boolean().required(),
  manage_users: Joi.boolean().required()
});

const schema = Joi.object({
  userId: Joi.string().required(),
  role: Joi.string().valid('master', 'admin', 'manager', 'user').required(),
  permissions: Joi.object({
    pool_permits: permissionSchema.required(),
    kitchen_bath_permits: permissionSchema.required(),
    roof_permits: permissionSchema.required()
  }).required()
});

export const setUserRole = functions.https.onCall(async (request) => {
  const { auth, data } = request;

  // Verify authentication
  if (!auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  // Verify caller has permission (Master or Admin only)
  const callerClaims = auth.token;
  if (callerClaims.role !== 'master' && callerClaims.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  // Validate input
  const { error, value } = schema.validate(data);
  if (error) {
    throw new functions.https.HttpsError('invalid-argument', error.message);
  }

  const { userId, role, permissions } = value;

  // Master cannot be demoted by anyone except themselves
  const targetUser = await admin.auth().getUser(userId);
  const targetClaims = targetUser.customClaims || {};

  if (targetClaims.role === 'master' && auth.uid !== userId) {
    throw new functions.https.HttpsError('permission-denied', 'Cannot modify Master role');
  }

  // Admin cannot create another Master
  if (callerClaims.role === 'admin' && role === 'master') {
    throw new functions.https.HttpsError('permission-denied', 'Admins cannot create Master users');
  }

  try {
    // Set custom claims
    await admin.auth().setCustomUserClaims(userId, {
      role,
      permissions
    });

    // Update Firestore document
    await admin.firestore().collection('users').doc(userId).update({
      role,
      permissions,
      updatedBy: auth.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create audit log
    await admin.firestore().collection('audit_logs').add({
      userId: auth.uid,
      userEmail: auth.token.email,
      userRole: callerClaims.role,
      action: 'permission_change',
      resource: 'user',
      resourceId: userId,
      changes: {
        before: { role: targetClaims.role },
        after: { role, permissions }
      },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: request.rawRequest?.ip || null,
      deviceInfo: request.rawRequest?.headers['user-agent'] || null
    });

    return { success: true, message: 'User role and permissions updated' };
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update user role');
  }
});
```

### onUserDelete - Cleanup User Data

```typescript
// functions/src/auth/onUserDelete.ts

import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  const { uid } = user;

  try {
    // Delete user document
    await admin.firestore().collection('users').doc(uid).delete();

    // Delete user's notifications
    const notificationsSnapshot = await admin.firestore()
      .collection('notifications')
      .where('userId', '==', uid)
      .get();

    const batch = admin.firestore().batch();
    notificationsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    console.log(`User ${uid} data cleaned up`);
  } catch (error) {
    console.error('Error cleaning up user data:', error);
  }
});
```

---

## 2. AI Template Generation Functions

### generateTemplate - OpenAI & Gemini Integration

```typescript
// functions/src/ai/generateTemplate.ts

import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Joi from 'joi';

const openaiKey = defineSecret('OPENAI_API_KEY');
const geminiKey = defineSecret('GEMINI_API_KEY');

const schema = Joi.object({
  provider: Joi.string().valid('openai', 'gemini').required(),
  permitType: Joi.string().valid('pool_permits', 'kitchen_bath_permits', 'roof_permits').required(),
  category: Joi.string().valid('homeowner_email', 'homeowner_text', 'contractor_email', 'contractor_text').required(),
  leadData: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    fullAddress: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    permitType: Joi.string().required()
  }).optional(),
  customPrompt: Joi.string().optional()
});

export const generateTemplate = functions
  .runWith({
    secrets: [openaiKey, geminiKey],
    timeoutSeconds: 300,
    memory: '512MiB'
  })
  .https.onCall(async (request) => {
    const { auth, data } = request;

    // Verify authentication
    if (!auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    // Validate input
    const { error, value } = schema.validate(data);
    if (error) {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    }

    const { provider, permitType, category, leadData, customPrompt } = value;

    // Check permissions
    const userDoc = await admin.firestore().collection('users').doc(auth.uid).get();
    const userData = userDoc.data();

    if (!userData?.permissions?.[permitType]?.manage_templates) {
      throw new functions.https.HttpsError('permission-denied', 'No template management permission');
    }

    try {
      // Get base prompt from Firestore
      let basePrompt = customPrompt;

      if (!basePrompt) {
        const promptDoc = await admin.firestore()
          .collection('ai_prompts')
          .where('permitType', '==', permitType)
          .where('category', '==', category)
          .limit(1)
          .get();

        if (!promptDoc.empty) {
          basePrompt = promptDoc.docs[0].data().basePrompt;
        } else {
          basePrompt = getDefaultPrompt(permitType, category);
        }
      }

      // Build final prompt with lead data
      const finalPrompt = buildPrompt(basePrompt, category, leadData);

      let generatedContent = '';
      let modelUsed = '';

      if (provider === 'openai') {
        const result = await generateWithOpenAI(openaiKey.value(), finalPrompt, category);
        generatedContent = result.content;
        modelUsed = result.model;
      } else if (provider === 'gemini') {
        const result = await generateWithGemini(geminiKey.value(), finalPrompt, category);
        generatedContent = result.content;
        modelUsed = result.model;
      }

      // Create audit log
      await admin.firestore().collection('audit_logs').add({
        userId: auth.uid,
        userEmail: auth.token.email,
        userRole: auth.token.role,
        action: 'generate_template',
        resource: 'template',
        resourceId: `${permitType}_${category}`,
        changes: {
          provider,
          model: modelUsed,
          permitType,
          category
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress: request.rawRequest?.ip || null,
        deviceInfo: request.rawRequest?.headers['user-agent'] || null
      });

      return {
        success: true,
        content: generatedContent,
        provider,
        model: modelUsed,
        category
      };

    } catch (error: any) {
      console.error('Error generating template:', error);
      throw new functions.https.HttpsError('internal', error.message || 'Failed to generate template');
    }
  });

// OpenAI integration
async function generateWithOpenAI(apiKey: string, prompt: string, category: string) {
  const openai = new OpenAI({ apiKey });

  const isEmail = category.includes('email');

  const systemPrompt = isEmail
    ? 'You are a professional email copywriter specializing in contractor lead generation. Write compelling, professional emails that get responses.'
    : 'You are an expert SMS copywriter. Write concise, engaging text messages under 160 characters that drive action.';

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: isEmail ? 500 : 100
  });

  return {
    content: response.choices[0].message.content || '',
    model: response.model
  };
}

// Gemini integration
async function generateWithGemini(apiKey: string, prompt: string, category: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const isEmail = category.includes('email');

  const systemInstruction = isEmail
    ? 'You are a professional email copywriter specializing in contractor lead generation. Write compelling, professional emails that get responses.'
    : 'You are an expert SMS copywriter. Write concise, engaging text messages under 160 characters that drive action.';

  const fullPrompt = `${systemInstruction}\n\n${prompt}`;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;

  return {
    content: response.text(),
    model: 'gemini-pro'
  };
}

// Build prompt with lead data
function buildPrompt(basePrompt: string, category: string, leadData?: any): string {
  let prompt = basePrompt;

  if (leadData) {
    prompt = prompt
      .replace('{{firstName}}', leadData.firstName || '')
      .replace('{{lastName}}', leadData.lastName || '')
      .replace('{{fullName}}', `${leadData.firstName} ${leadData.lastName}` || '')
      .replace('{{address}}', leadData.fullAddress || '')
      .replace('{{city}}', leadData.city || '')
      .replace('{{state}}', leadData.state || '')
      .replace('{{permitType}}', formatPermitType(leadData.permitType) || '');
  }

  return prompt;
}

// Default prompts if none configured
function getDefaultPrompt(permitType: string, category: string): string {
  const permitName = formatPermitType(permitType);

  const prompts: Record<string, string> = {
    homeowner_email: `Write a professional email to a homeowner who recently pulled a ${permitName} permit. Introduce our contractor services and offer a free consultation. Keep it friendly and non-pushy.`,
    homeowner_text: `Write a brief, friendly text message (under 160 chars) to a homeowner about their recent ${permitName} permit. Offer our contractor services.`,
    contractor_email: `Write a professional B2B email to a contractor about a new ${permitName} lead in their area. Highlight the opportunity and next steps.`,
    contractor_text: `Write a concise text (under 160 chars) alerting a contractor to a new ${permitName} lead. Include location and urgency.`
  };

  return prompts[category] || 'Generate appropriate content for this communication.';
}

function formatPermitType(permitType: string): string {
  const map: Record<string, string> = {
    pool_permits: 'Pool',
    kitchen_bath_permits: 'Kitchen & Bath',
    roof_permits: 'Roof'
  };
  return map[permitType] || permitType;
}
```

---

## 3. Communication Functions

### sendSms - Twilio Integration

```typescript
// functions/src/communications/sendSms.ts

import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';
import twilio from 'twilio';
import { parsePhoneNumber } from 'libphonenumber-js';
import Joi from 'joi';

const twilioSid = defineSecret('TWILIO_ACCOUNT_SID');
const twilioToken = defineSecret('TWILIO_AUTH_TOKEN');
const twilioPhone = defineSecret('TWILIO_PHONE_NUMBER');

const schema = Joi.object({
  leadId: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  message: Joi.string().max(1600).required(), // Twilio max for single message
  templateId: Joi.string().optional()
});

export const sendSms = functions
  .runWith({
    secrets: [twilioSid, twilioToken, twilioPhone],
    timeoutSeconds: 60
  })
  .https.onCall(async (request) => {
    const { auth, data } = request;

    if (!auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { error, value } = schema.validate(data);
    if (error) {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    }

    const { leadId, phoneNumber, message, templateId } = value;

    try {
      // Get lead and check permissions
      const leadDoc = await admin.firestore().collection('leads').doc(leadId).get();
      if (!leadDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Lead not found');
      }

      const lead = leadDoc.data()!;
      const userDoc = await admin.firestore().collection('users').doc(auth.uid).get();
      const userData = userDoc.data();

      if (!userData?.permissions?.[lead.permitType]?.text) {
        throw new functions.https.HttpsError('permission-denied', 'No SMS permission for this permit type');
      }

      // Format phone number
      const parsedPhone = parsePhoneNumber(phoneNumber, 'US');
      if (!parsedPhone || !parsedPhone.isValid()) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid phone number');
      }

      // Send SMS via Twilio
      const client = twilio(twilioSid.value(), twilioToken.value());
      const twilioResponse = await client.messages.create({
        body: message,
        from: twilioPhone.value(),
        to: parsedPhone.number
      });

      // Update lead communication history
      await admin.firestore().collection('leads').doc(leadId).update({
        communications: admin.firestore.FieldValue.arrayUnion({
          type: 'sms',
          templateId: templateId || null,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          sentBy: auth.uid,
          deliveryStatus: 'pending',
          twilioSid: twilioResponse.sid,
          phoneNumber: parsedPhone.number
        }),
        lastContactedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastContactedBy: auth.uid,
        status: lead.status === 'new' ? 'contacted' : lead.status
      });

      // Create audit log
      await admin.firestore().collection('audit_logs').add({
        userId: auth.uid,
        userEmail: auth.token.email,
        userRole: auth.token.role,
        action: 'send_sms',
        resource: 'lead',
        resourceId: leadId,
        changes: {
          twilioSid: twilioResponse.sid,
          phoneNumber: parsedPhone.number
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress: request.rawRequest?.ip || null,
        deviceInfo: request.rawRequest?.headers['user-agent'] || null
      });

      return {
        success: true,
        messageSid: twilioResponse.sid,
        status: twilioResponse.status
      };

    } catch (error: any) {
      console.error('Error sending SMS:', error);
      throw new functions.https.HttpsError('internal', error.message || 'Failed to send SMS');
    }
  });
```

### sendEmail - SendGrid Integration

```typescript
// functions/src/communications/sendEmail.ts

import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';
import sgMail from '@sendgrid/mail';
import Joi from 'joi';

const sendgridKey = defineSecret('SENDGRID_API_KEY');
const sendgridFrom = defineSecret('SENDGRID_FROM_EMAIL');
const sendgridFromName = defineSecret('SENDGRID_FROM_NAME');

const schema = Joi.object({
  leadId: Joi.string().required(),
  to: Joi.string().email().required(),
  subject: Joi.string().required(),
  body: Joi.string().required(),
  templateId: Joi.string().optional()
});

export const sendEmail = functions
  .runWith({
    secrets: [sendgridKey, sendgridFrom, sendgridFromName],
    timeoutSeconds: 60
  })
  .https.onCall(async (request) => {
    const { auth, data } = request;

    if (!auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { error, value } = schema.validate(data);
    if (error) {
      throw new functions.https.HttpsError('invalid-argument', error.message);
    }

    const { leadId, to, subject, body, templateId } = value;

    try {
      // Get lead and check permissions
      const leadDoc = await admin.firestore().collection('leads').doc(leadId).get();
      if (!leadDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Lead not found');
      }

      const lead = leadDoc.data()!;
      const userDoc = await admin.firestore().collection('users').doc(auth.uid).get();
      const userData = userDoc.data();

      if (!userData?.permissions?.[lead.permitType]?.email) {
        throw new functions.https.HttpsError('permission-denied', 'No email permission for this permit type');
      }

      // Initialize SendGrid
      sgMail.setApiKey(sendgridKey.value());

      // Send email
      const msg = {
        to,
        from: {
          email: sendgridFrom.value(),
          name: sendgridFromName.value()
        },
        subject,
        html: body,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        },
        customArgs: {
          leadId,
          userId: auth.uid
        }
      };

      const response = await sgMail.send(msg);
      const messageId = response[0].headers['x-message-id'];

      // Update lead communication history
      await admin.firestore().collection('leads').doc(leadId).update({
        communications: admin.firestore.FieldValue.arrayUnion({
          type: 'email',
          templateId: templateId || null,
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          sentBy: auth.uid,
          deliveryStatus: 'pending',
          sendgridMessageId: messageId,
          email: to,
          subject
        }),
        lastContactedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastContactedBy: auth.uid,
        status: lead.status === 'new' ? 'contacted' : lead.status
      });

      // Create audit log
      await admin.firestore().collection('audit_logs').add({
        userId: auth.uid,
        userEmail: auth.token.email,
        userRole: auth.token.role,
        action: 'send_email',
        resource: 'lead',
        resourceId: leadId,
        changes: {
          sendgridMessageId: messageId,
          to,
          subject
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        ipAddress: request.rawRequest?.ip || null,
        deviceInfo: request.rawRequest?.headers['user-agent'] || null
      });

      return {
        success: true,
        messageId,
        status: 'sent'
      };

    } catch (error: any) {
      console.error('Error sending email:', error);
      throw new functions.https.HttpsError('internal', error.message || 'Failed to send email');
    }
  });
```

---

## 4. Webhook Handlers

### twilioWebhook - Track SMS Delivery

```typescript
// functions/src/communications/twilioWebhook.ts

import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import * as express from 'express';

const app = express();

export const twilioWebhook = functions.https.onRequest(app);

app.post('/status', async (req, res) => {
  const {
    MessageSid,
    MessageStatus,
    ErrorCode
  } = req.body;

  try {
    // Find lead with this Twilio SID
    const leadsSnapshot = await admin.firestore()
      .collection('leads')
      .where('communications', 'array-contains', {
        twilioSid: MessageSid
      })
      .limit(1)
      .get();

    if (leadsSnapshot.empty) {
      console.log(`Lead not found for Twilio SID: ${MessageSid}`);
      return res.status(200).send('OK');
    }

    const leadDoc = leadsSnapshot.docs[0];
    const lead = leadDoc.data();

    // Update delivery status
    const updatedCommunications = lead.communications.map((comm: any) => {
      if (comm.twilioSid === MessageSid) {
        return {
          ...comm,
          deliveryStatus: mapTwilioStatus(MessageStatus),
          errorCode: ErrorCode || null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
      }
      return comm;
    });

    await leadDoc.ref.update({
      communications: updatedCommunications
    });

    console.log(`Updated SMS status for ${MessageSid}: ${MessageStatus}`);
    res.status(200).send('OK');

  } catch (error) {
    console.error('Error processing Twilio webhook:', error);
    res.status(500).send('Error');
  }
});

function mapTwilioStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'queued': 'pending',
    'sending': 'pending',
    'sent': 'pending',
    'delivered': 'delivered',
    'undelivered': 'failed',
    'failed': 'failed'
  };
  return statusMap[status] || 'pending';
}
```

### sendgridWebhook - Track Email Opens/Clicks

```typescript
// functions/src/communications/sendgridWebhook.ts

import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';
import * as express from 'express';

const app = express();

export const sendgridWebhook = functions.https.onRequest(app);

app.post('/events', async (req, res) => {
  const events = req.body;

  try {
    for (const event of events) {
      const {
        event: eventType,
        'sg_message_id': messageId,
        leadId,
        timestamp
      } = event;

      if (!leadId) continue;

      // Get lead document
      const leadDoc = await admin.firestore().collection('leads').doc(leadId).get();
      if (!leadDoc.exists) continue;

      const lead = leadDoc.data()!;

      // Update communication based on event type
      const updatedCommunications = lead.communications.map((comm: any) => {
        if (comm.sendgridMessageId && messageId.includes(comm.sendgridMessageId)) {
          const updates: any = { ...comm };

          if (eventType === 'delivered') {
            updates.deliveryStatus = 'delivered';
          } else if (eventType === 'bounce' || eventType === 'dropped') {
            updates.deliveryStatus = 'bounced';
          } else if (eventType === 'open' && !comm.openedAt) {
            updates.openedAt = new Date(timestamp * 1000);
          } else if (eventType === 'click' && !comm.clickedAt) {
            updates.clickedAt = new Date(timestamp * 1000);
          }

          return updates;
        }
        return comm;
      });

      await leadDoc.ref.update({
        communications: updatedCommunications
      });
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Error processing SendGrid webhook:', error);
    res.status(500).send('Error');
  }
});
```

---

## 5. Lead Management Functions

### onLeadCreated - Send Notifications

```typescript
// functions/src/leads/onLeadCreated.ts

import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

export const onLeadCreated = functions.firestore
  .document('leads/{leadId}')
  .onCreate(async (snapshot, context) => {
    const lead = snapshot.data();
    const leadId = context.params.leadId;

    try {
      // Get all users with 'view' permission for this permit type
      const usersSnapshot = await admin.firestore()
        .collection('users')
        .where(`permissions.${lead.permitType}.view`, '==', true)
        .get();

      // Create notifications and send FCM for each user
      const batch = admin.firestore().batch();

      for (const userDoc of usersSnapshot.docs) {
        const user = userDoc.data();

        // Create notification document
        const notificationRef = admin.firestore().collection('notifications').doc();
        batch.set(notificationRef, {
          userId: userDoc.id,
          title: 'New Lead Available',
          body: `${lead.fullName} - ${lead.city}, ${lead.state}`,
          type: 'new_lead',
          actionType: 'lead_detail',
          actionPayload: {
            leadId,
            permitType: lead.permitType
          },
          isRead: false,
          readAt: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          sentViaFCM: false,
          fcmMessageId: null
        });

        // Send FCM push notification
        if (user.fcmTokens && user.fcmTokens.length > 0) {
          const message = {
            notification: {
              title: 'New Lead Available',
              body: `${lead.fullName} - ${lead.city}, ${lead.state}`
            },
            data: {
              type: 'new_lead',
              leadId,
              permitType: lead.permitType
            },
            tokens: user.fcmTokens
          };

          try {
            const response = await admin.messaging().sendMulticast(message);
            console.log(`FCM sent to ${user.email}: ${response.successCount} success, ${response.failureCount} failure`);

            // Remove invalid tokens
            if (response.failureCount > 0) {
              const tokensToRemove: string[] = [];
              response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                  tokensToRemove.push(user.fcmTokens[idx]);
                }
              });

              if (tokensToRemove.length > 0) {
                await admin.firestore().collection('users').doc(userDoc.id).update({
                  fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove)
                });
              }
            }
          } catch (fcmError) {
            console.error(`Error sending FCM to ${user.email}:`, fcmError);
          }
        }

        // Update badge count
        batch.update(userDoc.ref, {
          badgeCount: admin.firestore.FieldValue.increment(1)
        });
      }

      await batch.commit();
      console.log(`Notifications sent for new lead: ${leadId}`);

    } catch (error) {
      console.error('Error in onLeadCreated:', error);
    }
  });
```

---

This completes Part 1 of Cloud Functions. Continue with remaining functions next.

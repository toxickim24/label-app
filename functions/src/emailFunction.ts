/**
 * Email Functions - SendGrid Integration
 * API keys are stored securely in Firebase Functions config
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  leadId?: string;
}

/**
 * Send Email via SendGrid
 * Callable function - can be invoked from your app
 */
export const sendEmail = functions.https.onCall(async (data: SendEmailRequest, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Get user permissions
  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  const user = userDoc.data();

  if (!user) {
    throw new functions.https.HttpsError('not-found', 'User profile not found');
  }

  // Check if user has email permission for any permit type
  const hasEmailPermission = Object.values(user.permissions).some((perm: any) => perm.email === true);

  if (!hasEmailPermission) {
    throw new functions.https.HttpsError('permission-denied', 'User does not have email sending permission');
  }

  // Get SendGrid credentials from environment variables
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const sendgridFrom = process.env.SENDGRID_FROM_EMAIL;
  const sendgridName = process.env.SENDGRID_FROM_NAME || 'Label App';

  if (!sendgridKey || !sendgridFrom) {
    throw new functions.https.HttpsError('failed-precondition', 'SendGrid credentials not configured');
  }

  const { to, subject, body, leadId } = data;

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid email address');
  }

  try {
    // Build SendGrid payload
    const payload = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      from: {
        email: sendgridFrom,
        name: sendgridName,
      },
      content: [
        {
          type: 'text/html',
          value: convertToHTML(body),
        },
        {
          type: 'text/plain',
          value: body,
        },
      ],
      tracking_settings: {
        click_tracking: {
          enable: true,
        },
        open_tracking: {
          enable: true,
        },
      },
    };

    // Call SendGrid API
    const response = await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sendgridKey}`,
        },
      }
    );

    const messageId = response.headers['x-message-id'] || `MSG${Date.now()}`;

    // Log communication in Firestore if leadId provided
    if (leadId) {
      await admin.firestore().collection('leads').doc(leadId).update({
        communications: admin.firestore.FieldValue.arrayUnion({
          type: 'email',
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          sentBy: context.auth.uid,
          deliveryStatus: 'delivered',
          sendgridMessageId: messageId,
          email: to,
          subject: subject,
        }),
        lastContactedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastContactedBy: context.auth.uid,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return {
      success: true,
      messageId,
    };
  } catch (error: any) {
    console.error('SendGrid API Error:', error.response?.data || error.message);
    throw new functions.https.HttpsError(
      'internal',
      error.response?.data?.errors?.[0]?.message || 'Failed to send email'
    );
  }
});

/**
 * Convert plain text to HTML
 */
function convertToHTML(text: string): string {
  const paragraphs = text.split(/\n\n+/);

  const htmlParagraphs = paragraphs
    .map((p) => {
      const lines = p.split('\n').join('<br>');
      return `<p>${lines}</p>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    p {
      margin: 1em 0;
    }
    a {
      color: #007AFF;
      text-decoration: none;
    }
  </style>
</head>
<body>
  ${htmlParagraphs}
  <hr style="border: none; border-top: 1px solid #ddd; margin: 2em 0;">
  <p style="font-size: 12px; color: #666;">
    Sent via Label App
  </p>
</body>
</html>
  `.trim();
}

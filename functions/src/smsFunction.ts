/**
 * SMS Functions - Twilio Integration
 * API keys are stored securely in Firebase Functions config
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

interface SendSMSRequest {
  to: string;
  body: string;
  leadId?: string;
}

/**
 * Send SMS via Twilio
 * Callable function - can be invoked from your app
 */
export const sendSMS = functions.https.onCall(async (data: SendSMSRequest, context) => {
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

  // Check if user has SMS permission for any permit type
  const hasTextPermission = Object.values(user.permissions).some((perm: any) => perm.text === true);

  if (!hasTextPermission) {
    throw new functions.https.HttpsError('permission-denied', 'User does not have SMS sending permission');
  }

  // Get Twilio credentials from environment variables
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!twilioSid || !twilioToken || !twilioPhone) {
    throw new functions.https.HttpsError('failed-precondition', 'Twilio credentials not configured');
  }

  const { to, body, leadId } = data;

  // Validate phone number
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const cleanedPhone = to.replace(/[\s()-]/g, '');
  if (!phoneRegex.test(cleanedPhone)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid phone number format');
  }

  try {
    // Format phone numbers
    const formattedTo = cleanedPhone.startsWith('+') ? cleanedPhone : `+${cleanedPhone}`;
    const formattedFrom = twilioPhone.startsWith('+') ? twilioPhone : `+${twilioPhone}`;

    // Create form data for Twilio
    const formData = new URLSearchParams();
    formData.append('To', formattedTo);
    formData.append('From', formattedFrom);
    formData.append('Body', body);

    // Call Twilio API
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: twilioSid,
          password: twilioToken,
        },
      }
    );

    // Log communication in Firestore if leadId provided
    if (leadId) {
      await admin.firestore().collection('leads').doc(leadId).update({
        communications: admin.firestore.FieldValue.arrayUnion({
          type: 'sms',
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          sentBy: context.auth.uid,
          deliveryStatus: response.data.status,
          twilioSid: response.data.sid,
          phoneNumber: formattedTo,
        }),
        lastContactedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastContactedBy: context.auth.uid,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return {
      success: true,
      messageSid: response.data.sid,
      status: response.data.status,
    };
  } catch (error: any) {
    console.error('Twilio API Error:', error.response?.data || error.message);
    throw new functions.https.HttpsError('internal', error.response?.data?.message || 'Failed to send SMS');
  }
});

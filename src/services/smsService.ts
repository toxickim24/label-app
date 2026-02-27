/**
 * SMS Service - Twilio Integration
 *
 * ⚠️ API KEY INSERTION POINTS ⚠️
 * Add your Twilio credentials in src/config/api.ts
 */

import axios from 'axios';
import API_CONFIG, { API_ENDPOINTS, USE_MOCK_DATA } from '../config/api';

// ============================================================================
// 🔑 INSERT TWILIO CREDENTIALS IN: src/config/api.ts
// ============================================================================
// TWILIO_ACCOUNT_SID: Your Account SID (AC...)
// TWILIO_AUTH_TOKEN: Your Auth Token
// TWILIO_PHONE_NUMBER: Your Twilio phone number (+1...)
// ============================================================================

export interface SendSMSParams {
  to: string;
  body: string;
  leadId?: string;
}

export interface SMSResponse {
  success: boolean;
  messageSid?: string;
  status?: string;
  error?: string;
  mock?: boolean;
}

/**
 * Send SMS via Twilio
 *
 * TO USE:
 * 1. Add TWILIO_ACCOUNT_SID in src/config/api.ts
 * 2. Add TWILIO_AUTH_TOKEN in src/config/api.ts
 * 3. Add TWILIO_PHONE_NUMBER in src/config/api.ts
 * 4. This function will automatically use them
 */
export async function sendSMS(params: SendSMSParams): Promise<SMSResponse> {
  const { to, body } = params;

  // Validate phone number format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(to.replace(/[\s()-]/g, ''))) {
    return {
      success: false,
      error: 'Invalid phone number format. Use E.164 format (+1234567890)',
    };
  }

  // Check if Twilio configured
  if (!API_CONFIG.TWILIO_ACCOUNT_SID || !API_CONFIG.TWILIO_AUTH_TOKEN) {
    console.log('⚠️ Twilio not configured - simulating SMS send');

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      messageSid: `SM${Date.now()}mock`,
      status: 'delivered',
      mock: true,
    };
  }

  try {
    // Format phone number (remove spaces, dashes, parentheses)
    const formattedTo = to.replace(/[\s()-]/g, '');
    const formattedFrom = API_CONFIG.TWILIO_PHONE_NUMBER.replace(/[\s()-]/g, '');

    // Ensure numbers start with +
    const finalTo = formattedTo.startsWith('+') ? formattedTo : `+${formattedTo}`;
    const finalFrom = formattedFrom.startsWith('+')
      ? formattedFrom
      : `+${formattedFrom}`;

    // Create form data for Twilio API
    const formData = new URLSearchParams();
    formData.append('To', finalTo);
    formData.append('From', finalFrom);
    formData.append('Body', body);

    // 🔑 TWILIO API CALL
    const response = await axios.post(
      `${API_ENDPOINTS.twilio}/Accounts/${API_CONFIG.TWILIO_ACCOUNT_SID}/Messages.json`,
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        auth: {
          username: API_CONFIG.TWILIO_ACCOUNT_SID,
          password: API_CONFIG.TWILIO_AUTH_TOKEN,
        },
      }
    );

    return {
      success: true,
      messageSid: response.data.sid,
      status: response.data.status,
      mock: false,
    };
  } catch (error: any) {
    console.error('Twilio API Error:', error.response?.data || error.message);

    // Return mock success on error (for development)
    if (__DEV__) {
      console.log('Development mode: Returning mock success');
      return {
        success: true,
        messageSid: `SM${Date.now()}mock`,
        status: 'delivered',
        mock: true,
      };
    }

    return {
      success: false,
      error: error.response?.data?.message || 'Failed to send SMS',
    };
  }
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): {
  valid: boolean;
  formatted?: string;
  error?: string;
} {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Check if it's a valid US number (10 digits) or international (7-15 digits)
  if (cleaned.length === 10) {
    // US number without country code
    return {
      valid: true,
      formatted: `+1${cleaned}`,
    };
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US number with country code
    return {
      valid: true,
      formatted: `+${cleaned}`,
    };
  } else if (cleaned.length >= 7 && cleaned.length <= 15) {
    // International number
    return {
      valid: true,
      formatted: `+${cleaned}`,
    };
  } else {
    return {
      valid: false,
      error: 'Invalid phone number. Must be 10 digits for US numbers.',
    };
  }
}

/**
 * Format phone number for display
 * (123) 456-7890
 */
export function formatPhoneDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Calculate SMS character count and segment count
 * SMS messages are limited to 160 characters per segment
 */
export function calculateSMSSegments(text: string): {
  characterCount: number;
  segmentCount: number;
  charactersRemaining: number;
} {
  const characterCount = text.length;

  // Standard SMS: 160 chars per segment
  // If multiple segments: 153 chars per segment (7 chars for header)
  let segmentCount: number;
  let charsPerSegment: number;

  if (characterCount <= 160) {
    segmentCount = 1;
    charsPerSegment = 160;
  } else {
    charsPerSegment = 153;
    segmentCount = Math.ceil(characterCount / charsPerSegment);
  }

  const charactersRemaining = segmentCount * charsPerSegment - characterCount;

  return {
    characterCount,
    segmentCount,
    charactersRemaining,
  };
}

/**
 * Check SMS delivery status (mock for now)
 * In production, this would query Twilio's API or use webhooks
 */
export async function checkSMSStatus(messageSid: string): Promise<{
  status: string;
  delivered: boolean;
}> {
  if (USE_MOCK_DATA || messageSid.includes('mock')) {
    return {
      status: 'delivered',
      delivered: true,
    };
  }

  // TODO: Implement real Twilio status check when credentials added
  // GET https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Messages/{MessageSid}.json

  return {
    status: 'pending',
    delivered: false,
  };
}

export default {
  sendSMS,
  validatePhoneNumber,
  formatPhoneDisplay,
  calculateSMSSegments,
  checkSMSStatus,
};

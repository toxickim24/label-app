/**
 * Email Service - SendGrid Integration
 *
 * ⚠️ API KEY INSERTION POINTS ⚠️
 * Add your SendGrid credentials in src/config/api.ts
 */

import axios from 'axios';
import API_CONFIG, { API_ENDPOINTS, USE_MOCK_DATA } from '../config/api';

// ============================================================================
// 🔑 INSERT SENDGRID CREDENTIALS IN: src/config/api.ts
// ============================================================================
// SENDGRID_API_KEY: Your SendGrid API key (SG...)
// SENDGRID_FROM_EMAIL: Your verified sender email
// SENDGRID_FROM_NAME: Your sender name (e.g., "Label App")
// ============================================================================

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  leadId?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  mock?: boolean;
}

/**
 * Send Email via SendGrid
 *
 * TO USE:
 * 1. Add SENDGRID_API_KEY in src/config/api.ts
 * 2. Add SENDGRID_FROM_EMAIL in src/config/api.ts
 * 3. Add SENDGRID_FROM_NAME in src/config/api.ts
 * 4. This function will automatically use them
 */
export async function sendEmail(params: SendEmailParams): Promise<EmailResponse> {
  const { to, subject, body } = params;

  // Validate email format
  if (!validateEmail(to)) {
    return {
      success: false,
      error: 'Invalid email address format',
    };
  }

  // Check if SendGrid configured
  if (!API_CONFIG.SENDGRID_API_KEY || !API_CONFIG.SENDGRID_FROM_EMAIL) {
    console.log('⚠️ SendGrid not configured - simulating email send');

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      messageId: `MSG${Date.now()}mock`,
      mock: true,
    };
  }

  try {
    // Build SendGrid request payload
    const payload = {
      personalizations: [
        {
          to: [{ email: to }],
          subject: subject,
        },
      ],
      from: {
        email: API_CONFIG.SENDGRID_FROM_EMAIL,
        name: API_CONFIG.SENDGRID_FROM_NAME,
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

    // 🔑 SENDGRID API CALL
    const response = await axios.post(API_ENDPOINTS.sendgrid, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_CONFIG.SENDGRID_API_KEY}`,
      },
    });

    // SendGrid returns 202 on success with X-Message-Id header
    const messageId = response.headers['x-message-id'];

    return {
      success: true,
      messageId: messageId || `MSG${Date.now()}`,
      mock: false,
    };
  } catch (error: any) {
    console.error('SendGrid API Error:', error.response?.data || error.message);

    // Return mock success on error (for development)
    if (__DEV__) {
      console.log('Development mode: Returning mock success');
      return {
        success: true,
        messageId: `MSG${Date.now()}mock`,
        mock: true,
      };
    }

    return {
      success: false,
      error: error.response?.data?.errors?.[0]?.message || 'Failed to send email',
    };
  }
}

/**
 * Validate email address format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Convert plain text to HTML (basic formatting)
 * Converts line breaks to <br> tags and wraps in paragraphs
 */
function convertToHTML(text: string): string {
  // Replace double line breaks with paragraph breaks
  const paragraphs = text.split(/\n\n+/);

  const htmlParagraphs = paragraphs
    .map((p) => {
      // Replace single line breaks with <br>
      const lines = p.split('\n').join('<br>');
      return `<p>${lines}</p>`;
    })
    .join('');

  // Wrap in basic HTML template
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

/**
 * Check email delivery status (mock for now)
 * In production, this would use SendGrid webhooks
 */
export async function checkEmailStatus(messageId: string): Promise<{
  status: string;
  delivered: boolean;
  opened: boolean;
  clicked: boolean;
}> {
  if (USE_MOCK_DATA || messageId.includes('mock')) {
    return {
      status: 'delivered',
      delivered: true,
      opened: false,
      clicked: false,
    };
  }

  // TODO: Implement real SendGrid status check when API key added
  // Or use webhooks to receive real-time events

  return {
    status: 'pending',
    delivered: false,
    opened: false,
    clicked: false,
  };
}

/**
 * Parse email template variables
 * Returns list of {variable} placeholders found in template
 */
export function extractTemplateVariables(template: string): string[] {
  const regex = /\{(\w+)\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

/**
 * Replace template variables with values
 */
export function replaceTemplateVariables(
  template: string,
  values: Record<string, string>
): string {
  let result = template;

  Object.entries(values).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || '');
  });

  return result;
}

/**
 * Preview email HTML (for testing)
 */
export function previewEmail(params: {
  subject: string;
  body: string;
  to: string;
}): string {
  return `
To: ${params.to}
Subject: ${params.subject}

${convertToHTML(params.body)}
  `.trim();
}

export default {
  sendEmail,
  validateEmail,
  checkEmailStatus,
  extractTemplateVariables,
  replaceTemplateVariables,
  previewEmail,
};

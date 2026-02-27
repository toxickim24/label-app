/**
 * API Configuration Template
 *
 * ⚠️ INSTRUCTIONS ⚠️
 * 1. Copy this file to api.ts: cp api.example.ts api.ts
 * 2. Replace empty strings with your actual API keys
 * 3. NEVER commit api.ts to version control (it's in .gitignore)
 *
 * Get your API keys from:
 * - OpenAI: https://platform.openai.com/api-keys
 * - Gemini: https://makersuite.google.com/app/apikey
 * - Twilio: https://console.twilio.com
 * - SendGrid: https://app.sendgrid.com/settings/api_keys
 */

export const API_CONFIG = {
  // ====================================================================
  // 🔑 OPENAI API (ChatGPT)
  // ====================================================================
  // Get your key from: https://platform.openai.com/api-keys
  // Format: sk-proj-...
  OPENAI_API_KEY: '', // ← INSERT YOUR OPENAI KEY HERE
  OPENAI_MODEL: 'gpt-4-turbo-preview', // or 'gpt-3.5-turbo' for lower cost

  // ====================================================================
  // 🔑 GOOGLE GEMINI API
  // ====================================================================
  // Get your key from: https://makersuite.google.com/app/apikey
  // Format: AIza...
  GEMINI_API_KEY: '', // ← INSERT YOUR GEMINI KEY HERE
  GEMINI_MODEL: 'gemini-pro',

  // ====================================================================
  // 🔑 TWILIO API (SMS)
  // ====================================================================
  // Get from: https://console.twilio.com
  TWILIO_ACCOUNT_SID: '', // ← INSERT YOUR TWILIO ACCOUNT SID (AC...)
  TWILIO_AUTH_TOKEN: '', // ← INSERT YOUR TWILIO AUTH TOKEN
  TWILIO_PHONE_NUMBER: '', // ← INSERT YOUR TWILIO PHONE NUMBER (+1...)

  // ====================================================================
  // 🔑 SENDGRID API (Email)
  // ====================================================================
  // Get from: https://app.sendgrid.com/settings/api_keys
  SENDGRID_API_KEY: '', // ← INSERT YOUR SENDGRID API KEY (SG...)
  SENDGRID_FROM_EMAIL: '', // ← INSERT YOUR FROM EMAIL (e.g., noreply@labelapp.com)
  SENDGRID_FROM_NAME: 'Label App',

  // ====================================================================
  // 🔑 FIREBASE CONFIG
  // ====================================================================
  // These will be auto-configured from google-services.json (Android)
  // and GoogleService-Info.plist (iOS)
  // No manual entry needed - Firebase SDK reads these files automatically
};

/**
 * Check if APIs are configured
 */
export const checkApiStatus = () => {
  return {
    openai: !!API_CONFIG.OPENAI_API_KEY,
    gemini: !!API_CONFIG.GEMINI_API_KEY,
    twilio: !!API_CONFIG.TWILIO_ACCOUNT_SID && !!API_CONFIG.TWILIO_AUTH_TOKEN,
    sendgrid: !!API_CONFIG.SENDGRID_API_KEY,
  };
};

/**
 * Get default AI provider
 * Returns first available: OpenAI > Gemini > null
 */
export const getDefaultAIProvider = (): 'openai' | 'gemini' | null => {
  if (API_CONFIG.OPENAI_API_KEY) return 'openai';
  if (API_CONFIG.GEMINI_API_KEY) return 'gemini';
  return null;
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  twilio: 'https://api.twilio.com/2010-04-01',
  sendgrid: 'https://api.sendgrid.com/v3/mail/send',
};

/**
 * Mock mode flag
 * Set to false once you add real API keys
 */
export const USE_MOCK_DATA = !API_CONFIG.OPENAI_API_KEY &&
                              !API_CONFIG.GEMINI_API_KEY &&
                              !API_CONFIG.TWILIO_ACCOUNT_SID &&
                              !API_CONFIG.SENDGRID_API_KEY;

export default API_CONFIG;

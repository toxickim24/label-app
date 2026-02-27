/**
 * AI Functions - OpenAI Template Generation
 * API keys are stored securely in Firebase Functions config
 */

import * as functions from 'firebase-functions';
import axios from 'axios';

interface GenerateTemplateRequest {
  permitType: string;
  category: string;
  customPrompt?: string;
  leadData?: {
    firstName: string;
    lastName: string;
    fullAddress: string;
    city: string;
    state: string;
  };
}

/**
 * Generate AI template using OpenAI
 * Callable function - can be invoked from your app
 */
export const generateAITemplate = functions.https.onCall(async (data: GenerateTemplateRequest, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  // Get OpenAI API key from environment variables
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    throw new functions.https.HttpsError('failed-precondition', 'OpenAI API key not configured');
  }

  const openaiModel = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';

  const { permitType, category, customPrompt, leadData } = data;

  try {
    // Build prompt
    const prompt = customPrompt || getDefaultPrompt(permitType, category);
    const isEmail = category.includes('email');

    const systemPrompt = isEmail
      ? 'You are a professional email copywriter specializing in contractor lead generation. Write compelling, professional emails that get responses.'
      : 'You are an expert SMS copywriter. Write concise, engaging text messages under 160 characters that drive action.';

    // Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: openaiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: isEmail ? 500 : 100,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
      }
    );

    const content = response.data.choices[0].message.content;

    return {
      success: true,
      content,
      provider: 'openai',
      model: openaiModel,
    };
  } catch (error: any) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    throw new functions.https.HttpsError('internal', 'Failed to generate template');
  }
});

function getDefaultPrompt(permitType: string, category: string): string {
  const permitName = formatPermitType(permitType);

  const prompts: Record<string, string> = {
    homeowner_email: `Write a professional email to a homeowner who recently pulled a ${permitName} permit. Introduce our contractor services and offer a free consultation. Keep it friendly and non-pushy.`,
    homeowner_text: `Write a brief, friendly text message (under 160 chars) to a homeowner about their recent ${permitName} permit. Offer our contractor services.`,
    contractor_email: `Write a professional B2B email to a contractor about a new ${permitName} lead in their area. Highlight the opportunity and next steps.`,
    contractor_text: `Write a concise text (under 160 chars) alerting a contractor to a new ${permitName} lead. Include location and urgency.`,
  };

  return prompts[category] || 'Generate appropriate content for this communication.';
}

function formatPermitType(permitType: string): string {
  const map: Record<string, string> = {
    pool_permits: 'Pool',
    kitchen_bath_permits: 'Kitchen & Bath',
    roof_permits: 'Roof',
  };
  return map[permitType] || permitType;
}

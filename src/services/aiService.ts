/**
 * AI Service - OpenAI Integration
 *
 * ⚠️ API KEY INSERTION POINTS ⚠️
 * See marked sections below for where to add your API keys
 */

import axios from 'axios';
import API_CONFIG, { API_ENDPOINTS, USE_MOCK_DATA } from '../config/api';
import { AIProvider } from '../types';
import { getAITemplateInstruction } from '../utils/templateVariables';

// ============================================================================
// MOCK DATA (Used when API keys not configured)
// ============================================================================

const MOCK_TEMPLATES = {
  homeowner_email: `Subject: Your Recent Pool Permit - Free Consultation Available

Hi {firstName},

I noticed you recently pulled a pool permit for your property at {fullAddress}.

We specialize in pool construction and design in {city} and would love to offer you a complimentary consultation to discuss your project.

Our team has completed over 200 pool installations in the area with 5-star reviews.

Would you be available for a quick 15-minute call this week?

Best regards,
[Your Name]
Label App`,

  homeowner_text: `Hi {firstName}! Noticed your pool permit at {fullAddress}. We're local pool specialists with 200+ projects. Free consultation? Reply YES`,

  contractor_email: `Subject: New Pool Permit Lead in {city}

Hi there,

A new pool permit was just pulled at {fullAddress} in {city}, {state}.

Homeowner: {fullName}
Contact: Available in system

This is a fresh lead - contact ASAP to secure the project.

Best,
Label App`,

  contractor_text: `NEW LEAD: Pool permit in {city}. {fullName} at {fullAddress}. Contact now!`,
};

// ============================================================================
// 🔑 INSERT OPENAI API KEY IN: src/config/api.ts
// ============================================================================

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Generate template using OpenAI (ChatGPT)
 *
 * TO USE:
 * 1. Add your OPENAI_API_KEY in src/config/api.ts
 * 2. The code below will automatically use it
 */
export async function generateWithOpenAI(
  prompt: string,
  category: string
): Promise<string> {
  // Check if API key configured
  if (!API_CONFIG.OPENAI_API_KEY) {
    console.log('⚠️ OpenAI API key not configured - using mock template');
    return getMockTemplate(category);
  }

  try {
    const isEmail = category.includes('email');

    const systemPrompt = isEmail
      ? 'You are a professional email copywriter specializing in contractor lead generation. Write compelling, professional emails that get responses.'
      : 'You are an expert SMS copywriter. Write concise, engaging text messages under 160 characters that drive action.';

    // Add template variables instruction to the prompt
    const enhancedPrompt = `${prompt}\n\n${getAITemplateInstruction()}`;

    const messages: OpenAIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: enhancedPrompt },
    ];

    // 🔑 OPENAI API CALL
    const response = await axios.post(
      API_ENDPOINTS.openai,
      {
        model: API_CONFIG.OPENAI_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: isEmail ? 500 : 100,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    throw new Error('Failed to generate template with OpenAI');
  }
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

interface GenerateTemplateParams {
  provider: AIProvider;
  permitType: string;
  category: string;
  customPrompt?: string;
}

/**
 * Generate AI template (Main function)
 *
 * Uses OpenAI to generate templates
 */
export async function generateAITemplate(
  params: GenerateTemplateParams
): Promise<{ content: string; provider: AIProvider; model: string }> {
  const { provider, category, customPrompt } = params;

  // Build prompt
  let prompt = customPrompt || getDefaultPrompt(params.permitType, category);

  // Note: We don't replace template variables here - the generated template
  // should contain placeholders like {firstName}, {fullAddress}, etc.
  // These will be replaced by replaceTemplateVariables() when sending

  // If using mock data or manual, return immediately
  if (USE_MOCK_DATA || provider === 'manual') {
    return {
      content: getMockTemplate(category),
      provider: 'manual',
      model: 'mock',
    };
  }

  // Generate with OpenAI
  try {
    const content = await generateWithOpenAI(prompt, category);
    const model = API_CONFIG.OPENAI_MODEL;

    return { content, provider: 'openai', model };
  } catch (error) {
    // Fallback to mock on error
    console.error('AI generation failed, using mock:', error);
    return {
      content: getMockTemplate(category),
      provider: 'manual',
      model: 'mock (fallback)',
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

function getMockTemplate(category: string, leadData?: any): string {
  const key = category as keyof typeof MOCK_TEMPLATES;
  let template = MOCK_TEMPLATES[key] || MOCK_TEMPLATES.homeowner_email;

  // Note: We don't replace variables here - they should be replaced when sending
  // The template should contain placeholders like {firstName}, {fullAddress}, etc.
  // These will be replaced by replaceTemplateVariables() in SendMessageDialog

  return template;
}

export default {
  generateAITemplate,
  generateWithOpenAI,
};

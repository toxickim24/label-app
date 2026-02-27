/**
 * Template Variables Utility
 * Handles placeholder replacement in templates
 */

import { Lead } from '../types';

// Available template variables
export const TEMPLATE_VARIABLES = {
  // Name fields
  '{firstName}': 'Lead first name',
  '{lastName}': 'Lead last name',
  '{fullName}': 'Lead full name',

  // Contact fields
  '{primaryPhone}': 'Primary phone number',
  '{secondaryPhone}': 'Secondary phone number',
  '{primaryEmail}': 'Primary email address',
  '{secondaryEmail}': 'Secondary email address',

  // Address fields
  '{fullAddress}': 'Complete address',
  '{street}': 'Street address',
  '{city}': 'City',
  '{state}': 'State',
  '{zip}': 'ZIP code',

  // Permit fields
  '{permitNumber}': 'Permit number',
  '{permitType}': 'Permit type (formatted)',
  '{permitDate}': 'Permit date',

  // Other
  '{recordId}': 'Record ID',
};

/**
 * Get formatted permit type (e.g., "pool_permits" -> "Pool Permits")
 */
function formatPermitType(permitType: string): string {
  return permitType
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Replace template variables with actual lead data
 */
export function replaceTemplateVariables(template: string, lead: Lead): string {
  let result = template;

  // Name fields
  result = result.replace(/{firstName}/g, lead.firstName || '');
  result = result.replace(/{lastName}/g, lead.lastName || '');
  result = result.replace(/{fullName}/g, lead.fullName || '');

  // Contact fields
  result = result.replace(/{primaryPhone}/g, lead.phone1 || lead.phoneNumber || '');
  result = result.replace(/{secondaryPhone}/g, lead.phone2 || '');
  result = result.replace(/{primaryEmail}/g, lead.email1 || lead.email || '');
  result = result.replace(/{secondaryEmail}/g, lead.email2 || '');

  // Address fields
  result = result.replace(/{fullAddress}/g, lead.fullAddress || '');
  result = result.replace(/{street}/g, lead.street || '');
  result = result.replace(/{city}/g, lead.city || '');
  result = result.replace(/{state}/g, lead.state || '');
  result = result.replace(/{zip}/g, lead.zipCode || '');

  // Permit fields
  result = result.replace(/{permitNumber}/g, lead.permitNumber || lead.recordId || '');
  result = result.replace(/{permitType}/g, formatPermitType(lead.permitType));
  result = result.replace(/{permitDate}/g, lead.permitDate ? new Date(lead.permitDate).toLocaleDateString() : '');

  // Other
  result = result.replace(/{recordId}/g, lead.recordId || lead.permitNumber || '');

  return result;
}

/**
 * Get a formatted guide text for template variables
 */
export function getTemplateVariablesGuide(): string {
  return `Available Variables:

NAMES:
{firstName} - Lead's first name
{lastName} - Lead's last name
{fullName} - Lead's full name

CONTACT:
{primaryPhone} - Primary phone number
{secondaryPhone} - Secondary phone number
{primaryEmail} - Primary email address
{secondaryEmail} - Secondary email address

ADDRESS:
{fullAddress} - Complete address
{street} - Street address
{city} - City
{state} - State
{zip} - ZIP code

PERMIT INFO:
{permitNumber} - Permit number
{permitType} - Permit type (e.g., Pool Permits)
{permitDate} - Permit filing date
{recordId} - Record ID

Example:
"Hi {firstName}, we noticed your {permitType} application at {fullAddress}..."

Will become:
"Hi John, we noticed your Pool Permits application at 123 Main St..."`;
}

/**
 * Get AI instruction for using template variables
 */
export function getAITemplateInstruction(): string {
  return `
IMPORTANT: Use these placeholder variables in your template so they can be automatically replaced with lead data:

- {firstName}, {lastName}, {fullName} for names
- {primaryPhone}, {primaryEmail} for contact
- {fullAddress}, {street}, {city}, {state}, {zip} for address
- {permitType}, {permitNumber}, {permitDate} for permit info

Example: "Hi {firstName}, we noticed your {permitType} permit application at {fullAddress}..."

DO NOT use actual names or addresses - use the placeholders above instead.`;
}

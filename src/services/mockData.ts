/**
 * Mock Data Service
 * Provides sample data for testing without Firebase
 */

import { Lead, Template, User, Notification, LeadStatus } from '../types';

// ============================================================================
// MOCK LEADS
// ============================================================================

export const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-001',
    recordId: 'AR26-0128',
    fullName: 'James Bariteau',
    firstName: 'James',
    lastName: 'Bariteau',
    fullAddress: '10895 Miguelito Road, San Jose, CA, 95127',
    street: '10895 Miguelito Road',
    city: 'San Jose',
    state: 'CA',
    zip: '95127',
    county: 'Santa Clara',
    phone1: '4083076212',
    phone2: '4082747477',
    phone3: '4082581898',
    email1: 'baretoe55@sbcglobal.net',
    email2: 'james.bariteaufm84@netscape.net',
    email3: 'james.bariteau@yahoo.com',
    permitType: 'pool_permits',
    status: 'new',
    communications: [],
    viewedBy: [],
    createdDate: new Date('2026-01-15T10:30:00Z'),
    lastUpdated: new Date('2026-01-17T14:22:00Z'),
    isRead: false,
    isFlagged: false,
    notes: '',
  },
  {
    id: 'lead-002',
    recordId: 'AR26-0129',
    fullName: 'Sarah Martinez',
    firstName: 'Sarah',
    lastName: 'Martinez',
    fullAddress: '543 Oak Street, San Jose, CA, 95110',
    street: '543 Oak Street',
    city: 'San Jose',
    state: 'CA',
    zip: '95110',
    county: 'Santa Clara',
    phone1: '4085551234',
    email1: 'sarah.martinez@email.com',
    permitType: 'pool_permits',
    status: 'contacted',
    communications: [
      {
        type: 'email',
        templateId: 'template-001',
        sentAt: new Date('2026-01-16T09:00:00Z'),
        sentBy: 'user-123',
        deliveryStatus: 'delivered',
        openedAt: new Date('2026-01-16T10:30:00Z'),
        email: 'sarah.martinez@email.com',
        subject: 'Your Pool Permit - Free Consultation',
      },
    ],
    lastContactedAt: new Date('2026-01-16T09:00:00Z'),
    viewedBy: ['user-123'],
    createdDate: new Date('2026-01-14T15:20:00Z'),
    lastUpdated: new Date('2026-01-16T09:00:00Z'),
    isRead: true,
    isFlagged: false,
    notes: 'Interested in modern pool design',
  },
  {
    id: 'lead-003',
    recordId: 'BT26-0045',
    fullName: 'Michael Chen',
    firstName: 'Michael',
    lastName: 'Chen',
    fullAddress: '789 Maple Ave, Santa Clara, CA, 95050',
    street: '789 Maple Ave',
    city: 'Santa Clara',
    state: 'CA',
    zip: '95050',
    county: 'Santa Clara',
    phone1: '6505551234',
    email1: 'mchen@email.com',
    permitType: 'kitchen_bath_permits',
    status: 'responded',
    communications: [
      {
        type: 'sms',
        templateId: null,
        sentAt: new Date('2026-01-15T14:00:00Z'),
        sentBy: 'user-123',
        deliveryStatus: 'delivered',
        phoneNumber: '6505551234',
      },
    ],
    lastContactedAt: new Date('2026-01-15T14:00:00Z'),
    viewedBy: ['user-123'],
    createdDate: new Date('2026-01-13T11:10:00Z'),
    lastUpdated: new Date('2026-01-15T16:30:00Z'),
    isRead: true,
    isFlagged: true,
    notes: 'Looking for bathroom remodel, budget $30k',
  },
  {
    id: 'lead-004',
    recordId: 'RF26-0067',
    fullName: 'Emily Rodriguez',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    fullAddress: '321 Pine St, Sunnyvale, CA, 94086',
    street: '321 Pine St',
    city: 'Sunnyvale',
    state: 'CA',
    zip: '94086',
    county: 'Santa Clara',
    phone1: '4085559876',
    email1: 'emily.r@email.com',
    permitType: 'roof_permits',
    status: 'new',
    communications: [],
    viewedBy: [],
    createdDate: new Date('2026-01-17T08:45:00Z'),
    lastUpdated: new Date('2026-01-17T08:45:00Z'),
    isRead: false,
    isFlagged: false,
    notes: '',
  },
  {
    id: 'lead-005',
    recordId: 'AR26-0130',
    fullName: 'David Kim',
    firstName: 'David',
    lastName: 'Kim',
    fullAddress: '456 Elm Street, San Jose, CA, 95123',
    street: '456 Elm Street',
    city: 'San Jose',
    state: 'CA',
    zip: '95123',
    county: 'Santa Clara',
    phone1: '4085557890',
    email1: 'dkim@email.com',
    permitType: 'pool_permits',
    status: 'qualified',
    communications: [
      {
        type: 'email',
        templateId: 'template-001',
        sentAt: new Date('2026-01-10T10:00:00Z'),
        sentBy: 'user-123',
        deliveryStatus: 'delivered',
        openedAt: new Date('2026-01-10T11:00:00Z'),
        clickedAt: new Date('2026-01-10T11:05:00Z'),
        email: 'dkim@email.com',
      },
    ],
    lastContactedAt: new Date('2026-01-10T10:00:00Z'),
    viewedBy: ['user-123'],
    createdDate: new Date('2026-01-09T13:20:00Z'),
    lastUpdated: new Date('2026-01-12T15:45:00Z'),
    isRead: true,
    isFlagged: true,
    notes: 'Very interested. Follow up next week. Budget approved.',
  },
  {
    id: 'lead-006',
    recordId: 'KB26-0101',
    fullName: 'Kimi Gagamao',
    firstName: 'Kimi',
    lastName: 'Gagamao',
    fullAddress: '123 Test Street, Manila, Philippines',
    street: '123 Test Street',
    city: 'Manila',
    state: 'NCR',
    zip: '1000',
    county: 'Metro Manila',
    phone1: '+639282647165', // Your actual Philippines number - needs verification in Twilio trial
    phone2: '+12345678900', // Replace with your personal US number or verified number
    email1: 'kimigagamao@gmail.com',
    permitType: 'kitchen_bath_permits',
    status: 'new',
    communications: [],
    viewedBy: [],
    createdDate: new Date('2026-02-25T08:00:00Z'),
    lastUpdated: new Date('2026-02-25T08:00:00Z'),
    isRead: false,
    isFlagged: false,
    notes: 'Test lead for messaging feature. NOTE: Cannot send SMS to same Twilio number (+17155046421). Must verify phone1 or use different number.',
  },
];

// ============================================================================
// MOCK TEMPLATES
// ============================================================================

export const MOCK_TEMPLATES: Template[] = [
  {
    id: 'template-001',
    name: 'Welcome Email',
    permitType: 'pool_permits',
    category: 'homeowner_email',
    subject: 'Your Pool Permit - Free Consultation Available',
    body: `Hi {firstName},

I noticed you recently pulled a pool permit for your property at {fullAddress}.

We specialize in pool construction and design in {city} and would love to offer you a complimentary consultation to discuss your project.

Our team has completed over 200 pool installations in the area with 5-star reviews.

Would you be available for a quick 15-minute call this week?

Best regards,
Label App Team`,
    generatedBy: 'manual',
    aiModel: null,
    basePrompt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    createdBy: 'user-123',
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    updatedBy: 'user-123',
    timesUsed: 47,
    lastUsedAt: new Date('2026-01-16T09:00:00Z'),
    isActive: true,
    isDefault: true,
  },
  {
    id: 'template-002',
    name: 'Quick SMS',
    permitType: 'pool_permits',
    category: 'homeowner_text',
    subject: null,
    body: 'Hi {firstName}! Noticed your pool permit at {fullAddress}. Local specialists, 200+ projects. Free quote? Reply YES',
    generatedBy: 'openai',
    aiModel: 'gpt-4-turbo-preview',
    basePrompt: 'Write a brief SMS to homeowner about pool permit',
    createdAt: new Date('2026-01-05T00:00:00Z'),
    createdBy: 'user-123',
    updatedAt: new Date('2026-01-05T00:00:00Z'),
    updatedBy: 'user-123',
    timesUsed: 23,
    lastUsedAt: new Date('2026-01-15T14:00:00Z'),
    isActive: true,
    isDefault: false,
  },
  {
    id: 'template-003',
    name: 'Kitchen Welcome Email',
    permitType: 'kitchen_bath_permits',
    category: 'homeowner_email',
    subject: 'Your Kitchen Permit - Renovation Experts Available',
    body: `Hi {firstName},

I noticed you recently pulled a kitchen permit for your property at {fullAddress}.

We specialize in kitchen and bathroom renovations in {city} and would love to offer you a complimentary consultation to discuss your project.

Our team has completed over 150 kitchen and bath remodels in the area with 5-star reviews.

Would you be available for a quick 15-minute call this week?

Best regards,
Label App Team`,
    generatedBy: 'manual',
    aiModel: null,
    basePrompt: null,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    createdBy: 'user-123',
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    updatedBy: 'user-123',
    timesUsed: 32,
    lastUsedAt: new Date('2026-02-20T09:00:00Z'),
    isActive: true,
    isDefault: true,
  },
  {
    id: 'template-004',
    name: 'Bath Renovation Quick SMS',
    permitType: 'kitchen_bath_permits',
    category: 'homeowner_text',
    subject: null,
    body: 'Hi {firstName}! Saw your bathroom permit at {fullAddress}. Expert bathroom remodelers, 150+ projects. Free quote? Text YES',
    generatedBy: 'openai',
    aiModel: 'gpt-4-turbo-preview',
    basePrompt: 'Write a brief SMS to homeowner about bathroom permit',
    createdAt: new Date('2026-01-05T00:00:00Z'),
    createdBy: 'user-123',
    updatedAt: new Date('2026-01-05T00:00:00Z'),
    updatedBy: 'user-123',
    timesUsed: 18,
    lastUsedAt: new Date('2026-02-22T14:00:00Z'),
    isActive: true,
    isDefault: false,
  },
];

// ============================================================================
// MOCK NOTIFICATIONS
// ============================================================================

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    userId: 'user-123',
    title: 'New Lead Available',
    body: 'James Bariteau - San Jose, CA',
    type: 'new_lead',
    actionType: 'lead_detail',
    actionPayload: {
      leadId: 'lead-001',
      permitType: 'pool_permits',
    },
    isRead: false,
    readAt: null,
    createdAt: new Date('2026-01-17T10:30:00Z'),
    sentViaFCM: true,
    fcmMessageId: 'fcm-123',
  },
  {
    id: 'notif-002',
    userId: 'user-123',
    title: 'Privacy Policy Updated',
    body: 'Please review and accept the updated Privacy Policy',
    type: 'policy_update',
    actionType: 'policy_accept',
    actionPayload: {
      policyId: 'policy-002',
    },
    isRead: true,
    readAt: new Date('2026-01-16T12:00:00Z'),
    createdAt: new Date('2026-01-15T08:00:00Z'),
    sentViaFCM: true,
    fcmMessageId: 'fcm-124',
  },
];

// ============================================================================
// MOCK CURRENT USER
// ============================================================================

export const MOCK_CURRENT_USER: User = {
  uid: 'user-123',
  email: 'demo@labelapp.com',
  displayName: 'Demo User',
  role: 'manager',
  permissions: {
    pool_permits: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      text: true,
      email: true,
      export: true,
      import: false,
      reset_password: false,
      manage_templates: true,
      manage_api: false,
      manage_users: false,
    },
    kitchen_bath_permits: {
      view: true,
      create: true,
      edit: true,
      delete: false,
      text: true,
      email: true,
      export: true,
      import: false,
      reset_password: false,
      manage_templates: true,
      manage_api: false,
      manage_users: false,
    },
    roof_permits: {
      view: true,
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
      manage_users: false,
    },
  },
  theme: 'system',
  terms_version: '1.0',
  privacy_version: '1.0',
  accepted_at: new Date('2026-01-01T00:00:00Z'),
  phone: '4085551234',
  createdAt: new Date('2026-01-01T00:00:00Z'),
  lastLogin: new Date(),
  disabled: false,
  fcmTokens: [],
  badgeCount: 1,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get leads by permit type
 */
export function getLeadsByPermitType(permitType: string): Lead[] {
  return MOCK_LEADS.filter((lead) => lead.permitType === permitType);
}

/**
 * Get leads by status
 */
export function getLeadsByStatus(status: LeadStatus): Lead[] {
  return MOCK_LEADS.filter((lead) => lead.status === status);
}

/**
 * Get lead by ID
 */
export function getLeadById(id: string): Lead | undefined {
  return MOCK_LEADS.find((lead) => lead.id === id);
}

/**
 * Search leads
 */
export function searchLeads(query: string): Lead[] {
  const lowerQuery = query.toLowerCase();

  return MOCK_LEADS.filter(
    (lead) =>
      lead.recordId.toLowerCase().includes(lowerQuery) ||
      lead.fullName.toLowerCase().includes(lowerQuery) ||
      lead.city.toLowerCase().includes(lowerQuery) ||
      lead.fullAddress.toLowerCase().includes(lowerQuery) ||
      lead.phone1.includes(query) ||
      lead.email1.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get templates by permit type and category
 */
export function getTemplates(permitType?: string, category?: string): Template[] {
  let filtered = MOCK_TEMPLATES;

  if (permitType) {
    filtered = filtered.filter((t) => t.permitType === permitType);
  }

  if (category) {
    filtered = filtered.filter((t) => t.category === category);
  }

  return filtered;
}

/**
 * Get unread notifications
 */
export function getUnreadNotifications(): Notification[] {
  return MOCK_NOTIFICATIONS.filter((n) => !n.isRead);
}

export default {
  MOCK_LEADS,
  MOCK_TEMPLATES,
  MOCK_NOTIFICATIONS,
  MOCK_CURRENT_USER,
  getLeadsByPermitType,
  getLeadsByStatus,
  getLeadById,
  searchLeads,
  getTemplates,
  getUnreadNotifications,
};

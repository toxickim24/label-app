/**
 * TypeScript Type Definitions for Label App
 */

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = 'master' | 'admin' | 'manager' | 'user';

export type PermitType = 'pool_permits' | 'kitchen_permits' | 'bath_permits' | 'roof_permits';

export interface Permission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  text: boolean;
  email: boolean;
  export: boolean;
  import: boolean;
  reset_password: boolean;
  manage_templates: boolean;
  manage_api: boolean;
  manage_users: boolean;
}

export interface UserPermissions {
  pool_permits: Permission;
  kitchen_permits: Permission;
  bath_permits: Permission;
  roof_permits: Permission;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  permissions: UserPermissions;
  theme: 'light' | 'dark' | 'system';
  terms_version: string | null;
  privacy_version: string | null;
  accepted_at: Date | null;
  phone: string;
  createdAt: Date;
  lastLogin: Date;
  disabled: boolean;
  fcmTokens: string[];
  badgeCount: number;
  photoURL?: string;
}

// ============================================================================
// LEAD TYPES
// ============================================================================

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'responded'
  | 'qualified'
  | 'disqualified'
  | 'converted';

export interface Communication {
  type: 'sms' | 'email';
  templateId: string | null;
  sentAt: Date;
  sentBy: string;
  deliveryStatus: 'pending' | 'delivered' | 'failed' | 'bounced';
  openedAt?: Date | null;
  clickedAt?: Date | null;
  twilioSid?: string | null;
  sendgridMessageId?: string | null;
  phoneNumber?: string;
  email?: string;
  subject?: string;
}

export interface Lead {
  id: string;
  recordId: string;

  // Address
  fullAddress: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  county: string;

  // Contact
  fullName: string;
  firstName: string;
  lastName: string;
  phone1: string;
  phone2?: string;
  phone3?: string;
  email1: string;
  email2?: string;
  email3?: string;

  // Permit
  permitType: PermitType;
  permitId?: string;

  // Status
  status: LeadStatus;

  // Communication
  communications: Communication[];
  lastContactedAt?: Date | null;
  lastContactedBy?: string | null;
  viewedBy: string[];

  // Timestamps
  createdDate: Date;
  lastUpdated: Date;
  importedAt?: Date;
  importedBy?: string;

  // Flags
  isRead: boolean;
  isFlagged: boolean;
  notes: string;
}

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export type TemplateCategory =
  | 'homeowner_email'
  | 'homeowner_text'
  | 'contractor_email'
  | 'contractor_text';

export type AIProvider = 'openai' | 'manual';

export interface Template {
  id: string;
  name: string;
  permitType: PermitType;
  category: TemplateCategory;
  subject: string | null;
  body: string;
  generatedBy: AIProvider;
  aiModel: string | null;
  basePrompt: string | null;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  timesUsed: number;
  lastUsedAt: Date | null;
  isActive: boolean;
  isDefault: boolean;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export type NotificationType =
  | 'new_lead'
  | 'policy_update'
  | 'permission_change'
  | 'system_alert';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  actionType: 'lead_detail' | 'policy_accept' | 'settings' | null;
  actionPayload: {
    leadId?: string;
    policyId?: string;
    permitType?: string;
  } | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  sentViaFCM: boolean;
  fcmMessageId: string | null;
}

// ============================================================================
// POLICY TYPES
// ============================================================================

export type PolicyType = 'terms' | 'privacy';

export interface Policy {
  id: string;
  type: PolicyType;
  version: string;
  content: string;
  publishedAt: Date;
  publishedBy: string;
  requiresAcceptance: boolean;
  isDraft: boolean;
  isActive: boolean;
  changeLog: string;
}

// ============================================================================
// API KEY TYPES
// ============================================================================

export type APIProvider = 'openai' | 'twilio' | 'sendgrid';

export interface APIKey {
  id: string;
  provider: APIProvider;
  displayName: string;
  keyPrefix: string;
  isActive: boolean;
  isDefault: boolean;
  secretName: string;
  secretVersion: string;
  lastUsedAt: Date | null;
  requestCount: number;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

// ============================================================================
// AUDIT LOG TYPES
// ============================================================================

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'send_sms'
  | 'send_email'
  | 'export'
  | 'import'
  | 'permission_change'
  | 'generate_template';

export type AuditResource =
  | 'lead'
  | 'user'
  | 'template'
  | 'policy'
  | 'api_key';

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userRole: UserRole;
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  changes: {
    before: any | null;
    after: any | null;
  };
  timestamp: Date;
  ipAddress: string | null;
  deviceInfo: string;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ResetPassword: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Templates: undefined;
  Notifications: undefined;
  Settings: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  LeadDetail: { leadId: string };
  SendMessage: { leadId: string; type: 'sms' | 'email' };
};

// ============================================================================
// FORM TYPES
// ============================================================================

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  acknowledgePrivacy: boolean;
}

export interface SendMessageForm {
  to: string;
  subject?: string;
  body: string;
  templateId?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

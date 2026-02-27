# Label - Production Mobile App Architecture

## Executive Summary

**Label** is a mobile-first Firebase application for managing permit-based contractor leads with automated outreach capabilities.

**Platform**: Mobile Only (Android + iOS)
**Framework**: React Native with Expo
**Backend**: Firebase (Firestore, Authentication, Cloud Functions, FCM, Secret Manager)
**AI Providers**: OpenAI (ChatGPT), Google Gemini
**Communication**: Twilio (SMS), SendGrid (Email)

---

## 1. Mobile App Architecture

### Framework Selection: React Native + Expo

**Justification**:
- Cross-platform development (Android + iOS from single codebase)
- Expo provides managed workflow with simplified build process
- Built-in support for push notifications, updates, and asset management
- Strong Firebase integration via react-native-firebase
- Mature ecosystem with extensive community support
- Hot reload for rapid development
- Easier CI/CD pipeline setup

**Technology Stack**:
```
Frontend:
├── React Native 0.73+
├── Expo SDK 50+
├── React Navigation 6
├── React Native Paper (Material Design)
├── Async Storage (local persistence)
├── React Native Reanimated (animations)
└── Expo Image (optimized image handling)

Backend:
├── Firebase Authentication
├── Cloud Firestore
├── Cloud Functions (Node.js 18)
├── Firebase Cloud Messaging (FCM)
├── Firebase Secret Manager
├── Firebase Storage (if needed for documents)
└── Firebase Analytics

State Management:
├── React Context API + useReducer
├── React Query (server state)
└── Zustand (client state)

AI Integration:
├── OpenAI API (GPT-4)
└── Google Gemini API

Communications:
├── Twilio API (SMS)
└── SendGrid API (Email)
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         MOBILE APP                               │
│                    (React Native + Expo)                         │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Auth Flow   │  │  Dashboard   │  │  Lead Detail │          │
│  │              │  │              │  │              │          │
│  │  - Login     │  │  - Permits   │  │  - Full Info │          │
│  │  - Register  │  │  - Leads     │  │  - Actions   │          │
│  │  - Reset     │  │  - Search    │  │  - AI Gen    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Templates   │  │  Settings    │  │  Admin Panel │          │
│  │              │  │              │  │              │          │
│  │  - AI Gen    │  │  - Profile   │  │  - Users     │          │
│  │  - Edit      │  │  - Theme     │  │  - Perms     │          │
│  │  - Send      │  │  - About     │  │  - Policies  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ Firebase SDK
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                        FIREBASE BACKEND                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Firestore DB │  │     Auth     │  │     FCM      │          │
│  │              │  │              │  │              │          │
│  │  - Users     │  │  - Email/PW  │  │  - Push      │          │
│  │  - Leads     │  │  - Roles     │  │  - Badges    │          │
│  │  - Templates │  │  - Custom    │  │  - Topics    │          │
│  │  - Policies  │  │    Claims    │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────────────────────────────────────────┐           │
│  │           Cloud Functions (Node.js)              │           │
│  │                                                   │           │
│  │  - generateAiTemplate (OpenAI/Gemini)           │           │
│  │  - sendSms (Twilio)                              │           │
│  │  - sendEmail (SendGrid)                          │           │
│  │  - twilioWebhook (delivery status)               │           │
│  │  - sendgridWebhook (opens/clicks)                │           │
│  │  - onLeadCreated (trigger notifications)         │           │
│  │  - onPolicyUpdated (force re-acceptance)         │           │
│  │  - calculateBadgeCount (unread leads)            │           │
│  │  - setCustomClaims (role management)             │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                   │
│  ┌──────────────┐                                                │
│  │Secret Manager│                                                │
│  │              │                                                │
│  │  - OPENAI_KEY│                                                │
│  │  - GEMINI_KEY│                                                │
│  │  - TWILIO_*  │                                                │
│  │  - SENDGRID_*│                                                │
│  └──────────────┘                                                │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                │ External APIs
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                      EXTERNAL SERVICES                           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   OpenAI     │  │Google Gemini │  │    Twilio    │          │
│  │   GPT-4      │  │   Pro/Ultra  │  │  SMS + Voice │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                   │
│  ┌──────────────┐                                                │
│  │  SendGrid    │                                                │
│  │    Email     │                                                │
│  └──────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Firestore Data Model

### Collection Structure

```
/users
/leads
/permits
/templates
/policies
/api_keys (metadata only, actual keys in Secret Manager)
/notifications
/audit_logs
/ai_prompts
/acceptance_logs
```

### Detailed Schema

#### `/users/{userId}`

```typescript
{
  uid: string,                    // Firebase Auth UID
  email: string,
  displayName: string,
  role: "master" | "admin" | "manager" | "user",

  // Permissions per permit type
  permissions: {
    pool_permits: {
      view: boolean,
      create: boolean,
      edit: boolean,
      delete: boolean,
      text: boolean,
      email: boolean,
      export: boolean,
      import: boolean,
      reset_password: boolean,
      manage_templates: boolean,
      manage_api: boolean,
      manage_users: boolean
    },
    kitchen_bath_permits: { /* same structure */ },
    roof_permits: { /* same structure */ }
  },

  // Theme preferences
  theme: "light" | "dark" | "system",

  // Policy acceptance
  terms_version: string,          // e.g., "1.0"
  privacy_version: string,
  accepted_at: timestamp,
  acceptance_source: "registration" | "forced_update",

  // Profile
  phone: string,
  createdAt: timestamp,
  lastLogin: timestamp,
  disabled: boolean,

  // FCM tokens for push notifications
  fcmTokens: string[],            // Can have multiple devices

  // Badge count
  badgeCount: number,

  // Metadata
  createdBy: string,              // userId
  updatedBy: string,
  updatedAt: timestamp
}
```

#### `/leads/{leadId}`

```typescript
{
  // Identity
  recordId: string,               // e.g., "AR26-0128"

  // Address
  fullAddress: string,
  street: string,
  city: string,
  state: string,
  zip: string,
  county: string,

  // Contact
  fullName: string,
  firstName: string,
  lastName: string,
  phone1: string,
  phone2: string,
  phone3: string,
  email1: string,
  email2: string,
  email3: string,

  // Permit information
  permitType: "pool_permits" | "kitchen_bath_permits" | "roof_permits",
  permitId: string,               // Reference to parent permit

  // Status
  status: "new" | "contacted" | "responded" | "qualified" | "disqualified" | "converted",

  // Communication tracking
  communications: [
    {
      type: "sms" | "email",
      templateId: string,
      sentAt: timestamp,
      sentBy: string,            // userId
      deliveryStatus: "pending" | "delivered" | "failed" | "bounced",
      openedAt: timestamp | null,
      clickedAt: timestamp | null,
      twilioSid: string | null,
      sendgridMessageId: string | null
    }
  ],

  // Engagement
  lastContactedAt: timestamp | null,
  lastContactedBy: string | null,
  viewedBy: string[],            // userIds who viewed this lead

  // Timestamps
  createdDate: timestamp,
  lastUpdated: timestamp,
  importedAt: timestamp,
  importedBy: string,            // userId

  // Flags
  isRead: boolean,
  isFlagged: boolean,
  notes: string
}
```

#### `/permits/{permitId}`

```typescript
{
  permitType: "pool_permits" | "kitchen_bath_permits" | "roof_permits",
  displayName: string,            // e.g., "Pool Permits"

  // Stats
  totalLeads: number,
  newLeads: number,
  contactedLeads: number,
  convertedLeads: number,

  // Configuration
  enabled: boolean,

  // Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: string
}
```

#### `/templates/{templateId}`

```typescript
{
  name: string,
  permitType: "pool_permits" | "kitchen_bath_permits" | "roof_permits",
  category: "homeowner_email" | "homeowner_text" | "contractor_email" | "contractor_text",

  // Content
  subject: string | null,         // For emails only
  body: string,                   // Can include variables: {{firstName}}, {{address}}, etc.

  // AI Generation
  generatedBy: "openai" | "gemini" | "manual",
  aiModel: string | null,         // e.g., "gpt-4", "gemini-pro"
  basePrompt: string | null,      // The prompt used to generate

  // Metadata
  createdAt: timestamp,
  createdBy: string,              // userId
  updatedAt: timestamp,
  updatedBy: string,

  // Usage
  timesUsed: number,
  lastUsedAt: timestamp | null,

  // Status
  isActive: boolean,
  isDefault: boolean
}
```

#### `/policies/{policyId}`

```typescript
{
  type: "terms" | "privacy",
  version: string,                // e.g., "1.0", "1.1", "2.0"
  content: string,                // Markdown or HTML content

  // Publication
  publishedAt: timestamp,
  publishedBy: string,            // userId (must be Master)

  // Force re-acceptance
  requiresAcceptance: boolean,

  // Metadata
  isDraft: boolean,
  isActive: boolean,              // Only one active version per type
  changeLog: string               // Summary of what changed
}
```

#### `/ai_prompts/{promptId}`

```typescript
{
  permitType: "pool_permits" | "kitchen_bath_permits" | "roof_permits",
  category: "homeowner_email" | "homeowner_text" | "contractor_email" | "contractor_text",

  // Base prompt for AI generation
  basePrompt: string,

  // Instructions
  instructions: string,           // Additional context for AI

  // Variables available
  availableVariables: string[],   // ["firstName", "lastName", "address", "permitType"]

  // Provider preference
  preferredProvider: "openai" | "gemini",

  // Metadata
  updatedAt: timestamp,
  updatedBy: string               // userId (requires manage_templates permission)
}
```

#### `/api_keys/{keyId}`

```typescript
{
  // Metadata only - actual keys stored in Secret Manager
  provider: "openai" | "gemini" | "twilio" | "sendgrid",

  // Display information
  displayName: string,            // e.g., "OpenAI Production Key"
  keyPrefix: string,              // First 8 chars for identification: "sk-proj..."

  // Configuration
  isActive: boolean,
  isDefault: boolean,             // Which key to use if multiple exist

  // Secret Manager reference
  secretName: string,             // e.g., "OPENAI_API_KEY_v1"
  secretVersion: string,          // e.g., "latest" or "5"

  // Usage tracking
  lastUsedAt: timestamp | null,
  requestCount: number,

  // Metadata
  createdAt: timestamp,
  createdBy: string,              // userId (must be Master)
  updatedAt: timestamp,
  updatedBy: string
}
```

#### `/notifications/{notificationId}`

```typescript
{
  userId: string,                 // Recipient

  // Content
  title: string,
  body: string,

  // Type and action
  type: "new_lead" | "policy_update" | "permission_change" | "system_alert",
  actionType: "lead_detail" | "policy_accept" | "settings" | null,
  actionPayload: {
    leadId?: string,
    policyId?: string,
    permitType?: string
  } | null,

  // Status
  isRead: boolean,
  readAt: timestamp | null,

  // Metadata
  createdAt: timestamp,
  sentViaFCM: boolean,
  fcmMessageId: string | null
}
```

#### `/acceptance_logs/{logId}`

```typescript
{
  userId: string,

  // Policy details
  policyType: "terms" | "privacy",
  policyVersion: string,
  policyId: string,

  // Acceptance
  acceptedAt: timestamp,
  acceptance_source: "registration" | "forced_update" | "settings_review",

  // Device info
  device: string,                 // "iOS 17.2" or "Android 14"
  appVersion: string,             // "1.0.5"
  ipAddress: string | null
}
```

#### `/audit_logs/{logId}`

```typescript
{
  // Actor
  userId: string,
  userEmail: string,
  userRole: string,

  // Action
  action: "create" | "update" | "delete" | "view" | "send_sms" | "send_email" | "export" | "import" | "permission_change",
  resource: "lead" | "user" | "template" | "policy" | "api_key",
  resourceId: string,

  // Details
  changes: {
    before: object | null,
    after: object | null
  },

  // Metadata
  timestamp: timestamp,
  ipAddress: string | null,
  deviceInfo: string
}
```

---

## 3. Index Configuration

### Composite Indexes Required

```javascript
// leads collection
{
  fields: [
    { fieldPath: "permitType", order: "ASCENDING" },
    { fieldPath: "createdDate", order: "DESCENDING" }
  ]
}

{
  fields: [
    { fieldPath: "permitType", order: "ASCENDING" },
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "createdDate", order: "DESCENDING" }
  ]
}

{
  fields: [
    { fieldPath: "status", order: "ASCENDING" },
    { fieldPath: "createdDate", order: "DESCENDING" }
  ]
}

// notifications collection
{
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "isRead", order: "ASCENDING" },
    { fieldPath: "createdAt", order: "DESCENDING" }
  ]
}

// templates collection
{
  fields: [
    { fieldPath: "permitType", order: "ASCENDING" },
    { fieldPath: "category", order: "ASCENDING" },
    { fieldPath: "isActive", order: "ASCENDING" }
  ]
}

// audit_logs collection
{
  fields: [
    { fieldPath: "userId", order: "ASCENDING" },
    { fieldPath: "timestamp", order: "DESCENDING" }
  ]
}

{
  fields: [
    { fieldPath: "resource", order: "ASCENDING" },
    { fieldPath: "resourceId", order: "ASCENDING" },
    { fieldPath: "timestamp", order: "DESCENDING" }
  ]
}
```

---

## 4. Authentication & Custom Claims

### Firebase Authentication Setup

```javascript
// Custom claims structure
{
  role: "master" | "admin" | "manager" | "user",
  permissions: {
    pool_permits: { /* permission object */ },
    kitchen_bath_permits: { /* permission object */ },
    roof_permits: { /* permission object */ }
  }
}
```

### Cloud Function: Set Custom Claims

```javascript
// functions/src/auth/setCustomClaims.js
exports.setUserRole = functions.https.onCall(async (data, context) => {
  // Verify caller is Master or Admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const callerClaims = context.auth.token;
  if (callerClaims.role !== 'master' && callerClaims.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  const { userId, role, permissions } = data;

  // Set custom claims
  await admin.auth().setCustomUserClaims(userId, {
    role,
    permissions
  });

  // Update Firestore user document
  await admin.firestore().collection('users').doc(userId).update({
    role,
    permissions,
    updatedBy: context.auth.uid,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true };
});
```

---

## 5. Mobile Navigation Structure

### Navigation Hierarchy

```
Root Navigator (Stack)
├── Auth Stack (if not authenticated)
│   ├── Login Screen
│   ├── Register Screen
│   └── Reset Password Screen
│
└── Main Stack (if authenticated)
    ├── Tab Navigator (Bottom Tabs)
    │   ├── Dashboard Tab
    │   │   └── Dashboard Screen
    │   │       ├── Permit Selector
    │   │       ├── Lead List (newest first)
    │   │       └── Search Bar
    │   │
    │   ├── Templates Tab
    │   │   └── Templates Screen
    │   │       ├── Permit Selector
    │   │       ├── Category Selector
    │   │       └── Template List
    │   │
    │   ├── Notifications Tab (with badge)
    │   │   └── Notifications Screen
    │   │       └── Notification List
    │   │
    │   └── Settings Tab
    │       └── Settings Screen
    │           ├── Profile
    │           ├── Theme Toggle
    │           ├── About (Footer/Policies)
    │           ├── Admin Panel (if Master/Admin)
    │           └── Logout
    │
    └── Modal Screens (Stack)
        ├── Lead Detail Screen
        │   ├── Lead Information
        │   ├── Communication History
        │   ├── Quick Actions (Text/Email)
        │   └── Edit Lead
        │
        ├── Template Editor Screen
        │   ├── AI Generation
        │   ├── Edit Content
        │   └── Save/Copy
        │
        ├── Send Message Screen
        │   ├── Template Selector
        │   ├── Preview
        │   └── Send
        │
        ├── Admin Panel Screens
        │   ├── User Management
        │   ├── Permission Editor
        │   ├── API Key Manager
        │   ├── Policy Editor
        │   └── Footer Editor
        │
        └── Policy Acceptance Screen
            ├── Terms & Conditions
            ├── Privacy Policy
            └── Accept/Decline
```

### Screen Specifications

#### Dashboard Screen
- **Header**: Logo (switches based on theme) + Permit dropdown
- **Search**: Full-text search across leads
- **Filter**: By status, date range
- **Sort**: Newest first (default)
- **Lead Card**: Shows recordId, name, address, permit type, status, last contacted
- **Pull to refresh**: Fetch latest leads
- **Badge**: Show unread count

#### Lead Detail Screen
- **Header**: Record ID + Status badge
- **Sections**:
  - Contact Information (all fields)
  - Communication History (timeline)
  - Quick Actions (Text/Email/Call buttons)
  - Notes
  - Audit Trail
- **Actions**: Based on permissions

#### Templates Screen
- **Permit Selector**: Dropdown at top
- **Category Tabs**: Homeowner Email | Homeowner Text | Contractor Email | Contractor Text
- **Template Cards**: Name, last used, times used
- **Actions**: Edit | Copy | Delete | Generate New

#### Settings Screen
- **Profile Section**: Name, email, role badge
- **Preferences**: Theme toggle (Light/Dark/System)
- **About**: App version, footer text, Terms, Privacy, Contact
- **Admin Panel**: (Master/Admin only)
- **Logout**: Clear session button

---

## 6. Theme & Logo Integration

### Theme Configuration

```typescript
// src/theme/colors.ts
export const lightTheme = {
  primary: '#007AFF',
  background: '#FFFFFF',
  surface: '#F2F2F7',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  logo: 'label-logo.png'        // Light mode logo
};

export const darkTheme = {
  primary: '#0A84FF',
  background: '#000000',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  error: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A',
  logo: 'label-white-logo.png'  // Dark mode logo
};
```

### Logo File Structure

```
/label-app
  /assets
    /images
      /logos
        label-logo.png              (icon + name, light)
        label-white-logo.png        (icon + name, dark)
        label-favicon.png           (icon only, light)
        label-white-favicon.png     (icon only, dark)
```

### Android Setup

```
/android/app/src/main/res
  /mipmap-mdpi
    ic_launcher.png (48x48)
    ic_launcher_round.png (48x48)
  /mipmap-hdpi
    ic_launcher.png (72x72)
    ic_launcher_round.png (72x72)
  /mipmap-xhdpi
    ic_launcher.png (96x96)
    ic_launcher_round.png (96x96)
  /mipmap-xxhdpi
    ic_launcher.png (144x144)
    ic_launcher_round.png (144x144)
  /mipmap-xxxhdpi
    ic_launcher.png (192x192)
    ic_launcher_round.png (192x192)

  /values/colors.xml
  /drawable/splash_screen.xml
```

**Adaptive Icon** (Android 8.0+):
```xml
<!-- android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml -->
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
  <background android:drawable="@color/ic_launcher_background"/>
  <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```

**Splash Screen**:
```xml
<!-- android/app/src/main/res/drawable/splash_screen.xml -->
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
  <item android:drawable="@color/splash_background"/>
  <item>
    <bitmap
      android:src="@drawable/splash_logo"
      android:gravity="center"/>
  </item>
</layer-list>
```

### iOS Setup

```
/ios/LabelApp/Images.xcassets
  /AppIcon.appiconset
    Icon-20@2x.png (40x40)
    Icon-20@3x.png (60x60)
    Icon-29@2x.png (58x58)
    Icon-29@3x.png (87x87)
    Icon-40@2x.png (80x80)
    Icon-40@3x.png (120x120)
    Icon-60@2x.png (120x120)
    Icon-60@3x.png (180x180)
    Icon-1024.png (1024x1024)
    Contents.json

  /LaunchImage.launchimage
    splash@2x.png
    splash@3x.png
    Contents.json
```

**Launch Screen**:
```swift
// ios/LabelApp/LaunchScreen.storyboard
// Configure with:
// - Background color matching brand
// - Center logo image (label-favicon.png)
// - Auto-layout constraints for all screen sizes
```

### Dynamic Logo Switching in App

```typescript
// src/components/AppLogo.tsx
import React from 'react';
import { Image, useColorScheme } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface AppLogoProps {
  variant: 'full' | 'icon';
  height?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ variant, height = 40 }) => {
  const { theme } = useTheme(); // custom hook reading user preference
  const systemColorScheme = useColorScheme();

  // Determine actual theme (respects "system" preference)
  const effectiveTheme = theme === 'system' ? systemColorScheme : theme;

  const logoSource = variant === 'full'
    ? (effectiveTheme === 'dark'
        ? require('../../assets/images/logos/label-white-logo.png')
        : require('../../assets/images/logos/label-logo.png'))
    : (effectiveTheme === 'dark'
        ? require('../../assets/images/logos/label-white-favicon.png')
        : require('../../assets/images/logos/label-favicon.png'));

  return (
    <Image
      source={logoSource}
      style={{ height, resizeMode: 'contain' }}
      accessibilityLabel="Label App Logo"
    />
  );
};
```

### Asset Generation Commands

```bash
# Install image processing tool
npm install -g @bam.tech/react-native-make

# Generate all app icons from base 1024x1024
npx react-native set-icon --path ./logo/label-favicon.png

# Generate splash screens
npx react-native set-splash --path ./logo/label-logo.png --resize contain --background "#FFFFFF"
```

**Manual High-Resolution Recommendations**:
- **Base Master**: 1024x1024px (PNG, transparent background)
- **Android**: Generate all densities (mdpi to xxxhdpi)
- **iOS**: Use Asset Catalog with 1x, 2x, 3x variants
- **Splash**: 2048x2048px canvas with centered logo
- **Format**: PNG-24 with transparency
- **Color Space**: sRGB

---

This completes Part 1 of the architecture document. Continue to security rules and Cloud Functions next.

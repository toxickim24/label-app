# Label App - Master Admin Guide

## Overview

This guide is for **Master** role users who have full administrative control over the Label application.

**Master Capabilities:**
- User management and role assignment
- Permission configuration
- API key management
- Policy editing (Terms & Privacy)
- Footer content management
- System configuration
- Full audit access

---

## Table of Contents

1. [Admin Panel Access](#admin-panel-access)
2. [User Management](#user-management)
3. [Permission System](#permission-system)
4. [API Key Management](#api-key-management)
5. [Policy Management](#policy-management)
6. [Footer Configuration](#footer-configuration)
7. [Audit Logs](#audit-logs)
8. [System Settings](#system-settings)
9. [Best Practices](#best-practices)

---

## Admin Panel Access

### Accessing Admin Features

1. Open Label app
2. Tap **Settings** tab
3. **Admin Panel** section appears (Master/Admin only)
4. Options:
   - User Management
   - Permissions
   - API Keys
   - Policies
   - Footer Editor
   - Audit Logs
   - System Settings

### Admin Dashboard

```
╔═══════════════════════════════════════╗
║  Admin Panel                          ║
╠═══════════════════════════════════════╣
║  👥 USER MANAGEMENT                   ║
║  ─────────────────────────────────────║
║  Total Users: 47                      ║
║  Active: 43 | Disabled: 4             ║
║  [Manage Users]                       ║
╠═══════════════════════════════════════╣
║  🔐 PERMISSIONS                       ║
║  ─────────────────────────────────────║
║  Roles: Master(1) Admin(3)            ║
║         Manager(8) User(35)           ║
║  [Configure Permissions]              ║
╠═══════════════════════════════════════╣
║  🔑 API KEYS                          ║
║  ─────────────────────────────────────║
║  OpenAI: Active                       ║
║  Gemini: Active                       ║
║  Twilio: Active                       ║
║  SendGrid: Active                     ║
║  [Manage API Keys]                    ║
╠═══════════════════════════════════════╣
║  📋 POLICIES                          ║
║  ─────────────────────────────────────║
║  Terms: v1.2 (Updated 14d ago)        ║
║  Privacy: v1.1 (Updated 30d ago)      ║
║  [Edit Policies]                      ║
╠═══════════════════════════════════════╣
║  📝 FOOTER                            ║
║  ─────────────────────────────────────║
║  Last updated: 7d ago                 ║
║  [Edit Footer]                        ║
╠═══════════════════════════════════════╣
║  📊 AUDIT LOGS                        ║
║  ─────────────────────────────────────║
║  [View Activity Logs]                 ║
╚═══════════════════════════════════════╝
```

---

## User Management

### View All Users

1. Admin Panel > **User Management**
2. See list of all registered users
3. Sort by:
   - Name
   - Email
   - Role
   - Last Login
   - Status (Active/Disabled)

### User List View

```
╔═══════════════════════════════════════╗
║  User Management        [+ Invite]   ║
╠═══════════════════════════════════════╣
║  [🔍 Search users...]                ║
║  Filter: [All] [Active] [Disabled]   ║
║  Sort: [Name ▼]                       ║
╠═══════════════════════════════════════╣
║  ┌─────────────────────────────────┐ ║
║  │ Sarah Johnson                   │ ║
║  │ sarah@example.com               │ ║
║  │ [Admin] · Active                │ ║
║  │ Last login: 2h ago              │ ║
║  │ [Edit] [Disable] [Reset PW]     │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │ Mike Chen                       │ ║
║  │ mike@example.com                │ ║
║  │ [Manager] · Active              │ ║
║  │ Last login: 1d ago              │ ║
║  │ [Edit] [Disable] [Reset PW]     │ ║
║  └─────────────────────────────────┘ ║
╚═══════════════════════════════════════╝
```

### Invite New User

1. Tap **+ Invite**
2. Enter:
   - Email address
   - Full name
   - Initial role (User/Manager/Admin)
   - Initial permissions (optional)
3. Tap **Send Invitation**
4. User receives email with:
   - Account activation link
   - Temporary password
   - Setup instructions

**Note**: New users must accept Terms & Privacy before first use.

### Edit User

1. Find user in list
2. Tap **Edit**
3. Can modify:
   - Display Name
   - Phone Number
   - Role
   - Permissions
   - Status (Active/Disabled)
4. Tap **Save**

**Role Change Effects:**
- User must log out and back in
- New permissions apply immediately
- Audit log created automatically

### Assign Role

**Available Roles:**

| Role | Description | Typical Use |
|------|-------------|-------------|
| **Master** | Full system control | CEO, Owner |
| **Admin** | User & system management | Operations Manager |
| **Manager** | Team oversight | Team Lead |
| **User** | Basic access | Sales Rep, Contractor |

**To Change Role:**

1. Edit user
2. Select **Role** dropdown
3. Choose new role:
   - User
   - Manager
   - Admin
   - Master (Master only)
4. Save

**Master Role Restrictions:**
- Only existing Master can create another Master
- Cannot demote yourself
- At least one Master must exist
- Admin cannot promote to Master

### Configure Permissions

See [Permission System](#permission-system) section below.

### Reset User Password

**Force Password Reset:**

1. Find user in list
2. Tap **Reset Password**
3. Options:
   - **Send Reset Email**: User resets themselves
   - **Generate Temporary**: Create temp password
4. Choose method
5. Confirm

**Reset Email:**
- User receives reset link
- Link valid for 24 hours
- User sets own new password

**Temporary Password:**
- System generates random password
- Displayed once (copy immediately)
- Share securely with user
- User must change on first login

### Disable User

**Temporarily Disable Access:**

1. Find user
2. Tap **Disable**
3. Confirm
4. User is logged out immediately
5. Cannot log in until re-enabled

**Use Cases:**
- Employee on leave
- Suspended access
- Security investigation
- Offboarding process

**Re-Enable:**
1. Find disabled user
2. Tap **Enable**
3. User can log in again

### Delete User

**Permanently Remove User:**

1. Edit user
2. Scroll to bottom
3. Tap **Delete Account**
4. **Warning**: Cannot be undone
5. Type user email to confirm
6. Tap **Permanently Delete**

**What Gets Deleted:**
- User document
- Custom claims
- FCM tokens
- Personal notifications
- Acceptance logs (archived)

**What Remains:**
- Leads they contacted (history preserved)
- Audit logs (for compliance)
- Templates they created (ownership transferred)

**⚠️ Critical**: Only delete when absolutely necessary. Prefer disabling.

---

## Permission System

### Permission Structure

Permissions are assigned **per permit type** with granular controls.

### Permit Types

1. **Pool Permits**
2. **Kitchen & Bath Permits**
3. **Roof Permits**

Each user has independent permissions for each permit type.

### Permission Types

| Permission | Description | Dependencies |
|------------|-------------|--------------|
| **view** | See leads | - |
| **create** | Add new leads | view |
| **edit** | Modify lead data | view |
| **delete** | Remove leads | view |
| **text** | Send SMS | view |
| **email** | Send emails | view |
| **export** | Download data | view |
| **import** | Upload leads | create |
| **reset_password** | Reset user passwords | manage_users |
| **manage_templates** | Create/edit templates | view |
| **manage_api** | Configure API keys | Master only |
| **manage_users** | User administration | Admin+ |

### Configure User Permissions

**Step-by-Step:**

1. Admin Panel > **User Management**
2. Find and tap user
3. Tap **Edit Permissions**
4. See three tabs:
   - Pool Permits
   - Kitchen & Bath Permits
   - Roof Permits

**For Each Permit Type:**

```
╔═══════════════════════════════════════╗
║  Edit Permissions - Pool Permits     ║
╠═══════════════════════════════════════╣
║  👁️  Viewing                          ║
║  [✓] View leads                       ║
║                                       ║
║  ✏️  Editing                          ║
║  [✓] Create leads                     ║
║  [✓] Edit leads                       ║
║  [ ] Delete leads                     ║
║                                       ║
║  💬 Communication                     ║
║  [✓] Send text messages               ║
║  [✓] Send emails                      ║
║                                       ║
║  📊 Data                              ║
║  [✓] Export data                      ║
║  [ ] Import data                      ║
║                                       ║
║  🔧 Management                        ║
║  [✓] Manage templates                 ║
║  [ ] Manage API keys                  ║
║  [ ] Manage users                     ║
║  [ ] Reset passwords                  ║
╠═══════════════════════════════════════╣
║  [Copy to Other Permits]              ║
║  [Apply Template]                     ║
║  [Save Changes]                       ║
╚═══════════════════════════════════════╝
```

5. Toggle permissions on/off
6. **Copy to Other Permits**: Apply same settings to other permit types
7. **Apply Template**: Use predefined permission set
8. Tap **Save Changes**

### Permission Templates

Create reusable permission sets:

**Default Templates:**

**1. View Only**
- view: ✓
- All others: ✗

**2. Sales Representative**
- view: ✓
- text: ✓
- email: ✓
- manage_templates: ✓

**3. Team Lead**
- view: ✓
- create: ✓
- edit: ✓
- text: ✓
- email: ✓
- export: ✓
- manage_templates: ✓

**4. Full Access** (Manager)
- view: ✓
- create: ✓
- edit: ✓
- delete: ✓
- text: ✓
- email: ✓
- export: ✓
- import: ✓
- manage_templates: ✓

**Create Custom Template:**

1. Admin Panel > **Permissions**
2. Tap **Templates**
3. Tap **+ New Template**
4. Name template (e.g., "Junior Sales")
5. Configure permissions
6. Save

**Apply Template to User:**

1. Edit user permissions
2. Tap **Apply Template**
3. Select template
4. Permissions auto-populate
5. Adjust if needed
6. Save

### Bulk Permission Updates

**Update Multiple Users:**

1. User Management
2. Tap **Select Multiple**
3. Check users to update
4. Tap **Bulk Actions**
5. Choose **Update Permissions**
6. Select permit type(s)
7. Configure permissions
8. Review affected users
9. Confirm

**Use Cases:**
- Onboard new team
- Seasonal access changes
- Role-based updates
- Security lockdowns

---

## API Key Management

### Overview

Label integrates with external services requiring API keys:

1. **OpenAI**: AI template generation (ChatGPT)
2. **Google Gemini**: AI template generation
3. **Twilio**: SMS messaging
4. **SendGrid**: Email delivery

**Security**: Keys stored in Firebase Secret Manager, never in Firestore plaintext.

### View API Keys

1. Admin Panel > **API Keys**
2. See all configured keys:
   - Provider name
   - Display name
   - Status (Active/Inactive)
   - Last used date
   - Request count

```
╔═══════════════════════════════════════╗
║  API Key Management      [+ Add Key] ║
╠═══════════════════════════════════════╣
║  ┌─────────────────────────────────┐ ║
║  │ 🤖 OpenAI (ChatGPT)             │ ║
║  │ sk-proj-abc... [Active]         │ ║
║  │ Last used: 2h ago               │ ║
║  │ Requests: 1,247                 │ ║
║  │ [Edit] [Test] [Deactivate]      │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │ 🔷 Google Gemini                │ ║
║  │ AIza... [Active] [Default]      │ ║
║  │ Last used: 5m ago               │ ║
║  │ Requests: 843                   │ ║
║  │ [Edit] [Test] [Deactivate]      │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │ 📱 Twilio SMS                   │ ║
║  │ AC... [Active]                  │ ║
║  │ Last used: 1h ago               │ ║
║  │ Messages sent: 342              │ ║
║  │ [Edit] [Test] [Deactivate]      │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │ 📧 SendGrid Email               │ ║
║  │ SG... [Active]                  │ ║
║  │ Last used: 30m ago              │ ║
║  │ Emails sent: 589                │ ║
║  │ [Edit] [Test] [Deactivate]      │ ║
║  └─────────────────────────────────┘ ║
╚═══════════════════════════════════════╝
```

### Add API Key

**OpenAI (ChatGPT):**

1. Get API key from https://platform.openai.com/api-keys
2. Admin Panel > **API Keys** > **+ Add Key**
3. Select **OpenAI**
4. Enter:
   - Display Name: "OpenAI Production"
   - API Key: sk-proj-...
5. Tap **Test Connection**
6. If successful, tap **Save**
7. Key stored in Secret Manager
8. Metadata saved in Firestore

**Google Gemini:**

1. Get API key from https://makersuite.google.com/app/apikey
2. Admin Panel > **API Keys** > **+ Add Key**
3. Select **Google Gemini**
4. Enter:
   - Display Name: "Gemini Production"
   - API Key: AIza...
5. Tap **Test Connection**
6. Save

**Twilio:**

1. Get credentials from https://console.twilio.com
2. Admin Panel > **API Keys** > **+ Add Key**
3. Select **Twilio**
4. Enter:
   - Display Name: "Twilio SMS"
   - Account SID: AC...
   - Auth Token: ...
   - Phone Number: +1...
5. Tap **Test Connection** (sends test SMS)
6. Save

**SendGrid:**

1. Get API key from https://app.sendgrid.com/settings/api_keys
2. Admin Panel > **API Keys** > **+ Add Key**
3. Select **SendGrid**
4. Enter:
   - Display Name: "SendGrid Production"
   - API Key: SG...
   - From Email: noreply@yourdomain.com
   - From Name: Label App
5. Tap **Test Connection** (sends test email)
6. Save

### Edit API Key

1. Find key in list
2. Tap **Edit**
3. Can update:
   - Display Name
   - API Key/Credentials
   - Status (Active/Inactive)
   - Set as Default
4. Tap **Save**

**Note**: Updating key may take 1-2 minutes to propagate to Cloud Functions.

### Set Default AI Provider

When multiple AI providers configured:

1. Find desired provider (OpenAI or Gemini)
2. Tap **Set as Default**
3. This provider used for template generation unless user specifies otherwise

### Test API Key

Verify key works:

1. Find key
2. Tap **Test**
3. System performs:
   - **OpenAI/Gemini**: Test completion request
   - **Twilio**: Test SMS to your number
   - **SendGrid**: Test email to your address
4. Result shown:
   - ✅ Success: Key working
   - ❌ Failed: Error message displayed

### Rotate API Key

**Best Practice**: Rotate keys every 90 days for security.

1. Generate new key from provider
2. Edit existing key in Label
3. Paste new key
4. Test
5. Save
6. Revoke old key at provider

### Deactivate API Key

Temporarily disable without deleting:

1. Find key
2. Tap **Deactivate**
3. Key remains but won't be used
4. Features using this key will fail

**Re-Activate:**
1. Tap **Activate**
2. Key immediately usable

### Delete API Key

**Permanently remove:**

1. Edit key
2. Scroll to bottom
3. Tap **Delete Key**
4. Confirm
5. Key deleted from Secret Manager
6. Metadata removed from Firestore

**⚠️ Warning**: Features using this key will immediately stop working.

### Monitor API Usage

1. API Keys screen shows request counts
2. For detailed metrics:
   - **OpenAI**: Visit platform.openai.com/usage
   - **Gemini**: Check Google Cloud Console
   - **Twilio**: console.twilio.com/usage
   - **SendGrid**: app.sendgrid.com/statistics

### Cost Management

**Set Budgets:**

Each provider offers usage limits:

**OpenAI:**
- Set monthly budget limit
- Alerts at thresholds (50%, 80%, 100%)

**Twilio:**
- Set spending limits
- Auto-recharge or cap

**SendGrid:**
- Plan-based limits
- Upgrade as needed

**Gemini:**
- Free tier: 60 requests/minute
- Paid tier for higher volume

---

## Policy Management

### Overview

Master users control:
- **Terms & Conditions**
- **Privacy Policy**

Both are:
- Versioned
- User acceptance tracked
- Can force re-acceptance

### View Current Policies

1. Admin Panel > **Policies**
2. See:
   - Terms: Current version, last updated
   - Privacy: Current version, last updated

```
╔═══════════════════════════════════════╗
║  Policy Management                    ║
╠═══════════════════════════════════════╣
║  📋 TERMS & CONDITIONS                ║
║  ─────────────────────────────────────║
║  Current Version: 1.2                 ║
║  Published: Jan 10, 2026              ║
║  Accepted by: 45/47 users             ║
║  [View] [Edit] [New Version]          ║
╠═══════════════════════════════════════╣
║  🔒 PRIVACY POLICY                    ║
║  ─────────────────────────────────────║
║  Current Version: 1.1                 ║
║  Published: Dec 15, 2025              ║
║  Accepted by: 47/47 users             ║
║  [View] [Edit] [New Version]          ║
╠═══════════════════════════════════════╣
║  📊 ACCEPTANCE STATUS                 ║
║  ─────────────────────────────────────║
║  Pending Acceptance:                  ║
║  - John Doe (Terms v1.2)              ║
║  - Sarah Lee (Terms v1.2)             ║
║  [Send Reminder]                      ║
╚═══════════════════════════════════════╝
```

### Edit Policy

**Minor Edits (Same Version):**

1. Tap **Edit** on policy
2. Editor opens with current content
3. Make changes
4. **Do not** change version number
5. Tap **Save Draft**
6. Tap **Publish**
7. Users not forced to re-accept

**Use for**: Typo fixes, clarifications, non-material changes.

### Create New Version

**Major Changes (Force Re-Acceptance):**

1. Tap **New Version** on policy
2. System creates copy of current
3. Increment version:
   - 1.0 → 1.1 (minor changes)
   - 1.0 → 2.0 (major changes)
4. Edit content
5. Add change log:
   ```
   ## Changes in v1.2
   - Added data retention policy
   - Updated third-party sharing clause
   - Clarified user rights section
   ```
6. Toggle **Require Re-Acceptance**: ON
7. Tap **Save Draft**

### Preview Policy

Before publishing:

1. Edit policy
2. Tap **Preview**
3. See exactly how users will see it
4. Verify formatting
5. Check all links
6. Return to editor if changes needed

### Publish Policy

**Go Live:**

1. Save draft
2. Tap **Publish**
3. Confirm:
   - Version number correct
   - Change log accurate
   - Re-acceptance required (if major)
4. Tap **Publish Now**

**What Happens:**
1. Policy marked as active
2. Previous version archived
3. If re-acceptance required:
   - Notifications sent to all users
   - App blocks until accepted
   - Acceptance logged
4. Audit log created

### Force Re-Acceptance

**Immediate Effect:**

Users who haven't accepted latest version:
1. Receive push notification
2. App shows policy screen on next open
3. Cannot proceed until accepted
4. Must check "I Accept"
5. Acceptance logged with:
   - User ID
   - Policy type & version
   - Timestamp
   - IP address
   - Device info

### Monitor Acceptance

1. Policy Management screen shows:
   - Total users
   - Accepted count
   - Pending count
2. Tap **Acceptance Status**
3. See list of pending users
4. Options:
   - **Send Reminder**: Push notification
   - **View User**: Check last login
   - **Disable User**: Force compliance

### Policy History

View all versions:

1. Tap policy
2. Tap **Version History**
3. See:
   - Version number
   - Published date
   - Published by
   - Change log
   - Acceptance rate
4. Tap any version to view content

### Revert Policy

**Rollback to Previous Version:**

1. View version history
2. Find version to restore
3. Tap **Restore This Version**
4. Confirm
5. Version becomes active
6. (Optional) Force re-acceptance

**Use Cases:**
- Mistake in new version
- Legal requirement
- User confusion

---

## Footer Configuration

### Overview

The "About" section in mobile app displays:
- App name & version
- **Editable footer text** (Master controlled)
- Terms & Conditions link
- Privacy Policy link
- Support contact

### Edit Footer

1. Admin Panel > **Footer Editor**
2. See current footer text
3. Tap **Edit**
4. Markdown editor opens

```
╔═══════════════════════════════════════╗
║  Footer Editor                        ║
╠═══════════════════════════════════════╣
║  Current Footer Text:                 ║
║  ┌─────────────────────────────────┐ ║
║  │ © 2026 Label App, Inc.          │ ║
║  │                                 │ ║
║  │ Support Hours:                  │ ║
║  │ Mon-Fri: 9am-6pm PST            │ ║
║  │                                 │ ║
║  │ Email: support@labelapp.com     │ ║
║  │ Phone: (555) 123-4567           │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║  Last updated: 7 days ago             ║
║  Updated by: admin@labelapp.com       ║
╠═══════════════════════════════════════╣
║  [Edit] [Preview] [History]           ║
╚═══════════════════════════════════════╝
```

4. Edit text (supports Markdown):
   - **Bold**: `**text**`
   - *Italic*: `*text*`
   - Links: `[text](url)`
   - Line breaks: Double enter
5. Tap **Preview** to verify
6. Tap **Save**
7. Changes appear immediately in all user apps

**Best Practices:**
- Keep concise (3-5 lines)
- Include support contact
- Add company info
- Note support hours
- Link to help center

### Footer History

View changes:

1. Tap **History**
2. See all versions:
   - Date changed
   - Changed by
   - Full content
3. Tap version to view
4. (Optional) Tap **Restore** to revert

---

## Audit Logs

### Overview

Track all system activity for compliance and security.

### View Logs

1. Admin Panel > **Audit Logs**
2. See chronological activity
3. Filter by:
   - User
   - Action type
   - Resource
   - Date range
   - IP address

```
╔═══════════════════════════════════════╗
║  Audit Logs              [Export CSV] ║
╠═══════════════════════════════════════╣
║  Filter: [All Actions ▼]              ║
║  User: [All Users ▼]                  ║
║  Date: [Last 30 Days ▼]               ║
╠═══════════════════════════════════════╣
║  Jan 24, 2026 14:35                   ║
║  👤 sarah@example.com (Admin)         ║
║  📧 send_email → Lead AR26-0128       ║
║  IP: 192.168.1.1                      ║
║                                       ║
║  Jan 24, 2026 14:22                   ║
║  👤 mike@example.com (Manager)        ║
║  👁️  view → Lead AR26-0127            ║
║  IP: 10.0.0.52                        ║
║                                       ║
║  Jan 24, 2026 14:10                   ║
║  👤 admin@labelapp.com (Master)       ║
║  🔧 permission_change → john@ex.com   ║
║  Changes: role: user → manager        ║
║  IP: 73.15.222.10                     ║
╚═══════════════════════════════════════╝
```

### Action Types Logged

- **create**: New lead/user/template
- **update**: Edit existing resource
- **delete**: Remove resource
- **view**: Access sensitive data
- **send_sms**: SMS sent
- **send_email**: Email sent
- **export**: Data exported
- **import**: Bulk import
- **permission_change**: Role/permission update
- **login**: User authentication
- **logout**: Session end
- **password_reset**: Password changed
- **policy_accepted**: Terms/Privacy acceptance

### Log Details

Tap any log entry to see full details:

- User: Email, role, UID
- Action: Specific operation
- Resource: What was affected
- Resource ID: Specific record
- Changes:
  - Before: Previous state
  - After: New state
- Timestamp: Exact time (with timezone)
- IP Address: Where request originated
- Device: Platform and version
- User Agent: Browser/app info

### Export Logs

**For Compliance:**

1. Set filters
2. Tap **Export**
3. Choose format:
   - CSV
   - JSON
   - PDF Report
4. Choose date range
5. Tap **Generate**
6. Download file

**Use Cases:**
- Security audit
- Compliance report
- Incident investigation
- User activity review

### Search Logs

1. Tap search icon
2. Enter:
   - User email
   - Resource ID (e.g., lead ID)
   - IP address
   - Date/time
3. Results update instantly

---

## System Settings

### App Configuration

1. Admin Panel > **System Settings**
2. Configure global settings

**Available Settings:**

**Default AI Provider:**
- OpenAI (ChatGPT)
- Google Gemini

**Badge Count Mode:**
- New leads only
- New + uncontacted leads
- Unread notifications
- Combined

**Data Retention:**
- Audit logs: 1 year (default), 2 years, indefinite
- Deleted users: 90 days
- Notifications: 30 days, 60 days, 90 days

**Communication Settings:**
- SMS rate limit: N per hour per user
- Email rate limit: N per day per user
- Quiet hours: Enable/disable, set times
- Auto-retry failed: Yes/No

**Security:**
- Session timeout: 1 hour, 4 hours, 24 hours, 7 days
- Password requirements: Customize complexity
- 2FA requirement: Optional, required for Admin+, required for all

### Maintenance Mode

**Enable for Updates:**

1. System Settings > **Maintenance**
2. Toggle ON
3. Set message: "System maintenance in progress..."
4. Choose:
   - Block all users
   - Block non-admin users
5. Save

**During Maintenance:**
- Users see maintenance screen
- Admin/Master can still access
- No data changes allowed (for block all)

**Disable:**
1. Toggle OFF
2. Users regain access immediately

---

## Best Practices

### User Management

1. **Principle of Least Privilege**: Grant minimum permissions needed
2. **Regular Reviews**: Audit user access quarterly
3. **Onboarding**: Use permission templates for consistency
4. **Offboarding**: Disable immediately, delete after 90 days
5. **Training**: Document role expectations

### Security

1. **Strong Passwords**: Enforce complexity requirements
2. **Rotate API Keys**: Every 90 days minimum
3. **Monitor Logs**: Review weekly for anomalies
4. **Limit Masters**: Only trusted individuals
5. **2FA**: Enable for all admin roles

### Policies

1. **Version Clearly**: Use semantic versioning (1.0, 1.1, 2.0)
2. **Change Logs**: Document every change
3. **Legal Review**: Have attorney approve major changes
4. **Notice Period**: Give users advance warning when possible
5. **Plain Language**: Avoid legal jargon

### API Management

1. **Test Keys**: Always test before going live
2. **Monitor Usage**: Set budget alerts
3. **Backup Keys**: Have secondary key ready
4. **Document**: Note which key is for what environment
5. **Secure Storage**: Never expose in client code

### Communication

1. **Templates**: Require approval for public-facing content
2. **Rate Limits**: Prevent spam/abuse
3. **Opt-Out**: Honor unsubscribe immediately
4. **TCPA Compliance**: Follow SMS regulations
5. **CAN-SPAM**: Follow email regulations

### Data Governance

1. **Regular Backups**: Daily automated backups
2. **Export Logs**: Monthly compliance exports
3. **Data Retention**: Follow legal requirements
4. **Privacy**: Minimize PII collection
5. **Breach Plan**: Have incident response ready

---

## Emergency Procedures

### Account Lockout

**User Locked Out:**
1. Verify identity securely
2. Admin Panel > User Management
3. Find user > Reset Password
4. Send reset email or provide temp password
5. User logs in and sets new password

### Compromised Account

**If Account Breached:**
1. Immediately **Disable** user
2. Review Audit Logs for suspicious activity
3. Check affected leads/data
4. Contact user through verified channel
5. Reset password
6. Clear all FCM tokens (force logout all devices)
7. Re-enable only after verification
8. Document incident

### API Key Leak

**If Key Exposed:**
1. Immediately **Deactivate** key
2. Generate new key at provider
3. Update key in Label
4. Test new key
5. Revoke old key at provider
6. Review logs for unauthorized usage
7. Report to provider if fraud detected

### Mass Deletion Recovery

**If Data Accidentally Deleted:**
1. Stop immediately
2. Do not make more changes
3. Contact Firebase support
4. Restore from backup:
   - Firebase Console > Firestore > Import/Export
   - Use latest backup before deletion
5. Verify restoration
6. Document lesson learned

### Policy Mistake

**If Wrong Policy Published:**
1. Admin Panel > Policies
2. View Version History
3. Restore previous version
4. Force re-acceptance if needed
5. Notify users of error
6. Document correction

---

## Support Contacts

**Firebase/Google Cloud:**
- Console: https://console.firebase.google.com
- Support: https://firebase.google.com/support

**OpenAI:**
- Platform: https://platform.openai.com
- Support: https://help.openai.com

**Twilio:**
- Console: https://console.twilio.com
- Support: https://support.twilio.com

**SendGrid:**
- Dashboard: https://app.sendgrid.com
- Support: https://support.sendgrid.com

**Label App:**
- Email: support@labelapp.com
- Emergency: +1 (555) 123-4567

---

This guide covers all Master admin capabilities. For technical implementation details, see deployment and API integration guides.

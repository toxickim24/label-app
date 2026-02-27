# Label App - Firestore Security Rules

## Complete Production Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    // Check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Get user role from custom claims
    function getUserRole() {
      return request.auth.token.role;
    }

    // Check if user is Master
    function isMaster() {
      return isAuthenticated() && getUserRole() == 'master';
    }

    // Check if user is Admin or Master
    function isAdminOrMaster() {
      return isAuthenticated() && (getUserRole() == 'admin' || getUserRole() == 'master');
    }

    // Check if user is Manager, Admin, or Master
    function isManagerOrHigher() {
      return isAuthenticated() && getUserRole() in ['manager', 'admin', 'master'];
    }

    // Get user permissions for specific permit type
    function getPermissions(permitType) {
      return request.auth.token.permissions[permitType];
    }

    // Check specific permission for permit type
    function hasPermission(permitType, permission) {
      return isAuthenticated() &&
             request.auth.token.permissions != null &&
             request.auth.token.permissions[permitType] != null &&
             request.auth.token.permissions[permitType][permission] == true;
    }

    // Get permit type from lead document
    function getLeadPermitType(leadData) {
      return leadData.permitType;
    }

    // Check if user is accessing their own document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Validate email format
    function isValidEmail(email) {
      return email.matches('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
    }

    // ============================================
    // USERS COLLECTION
    // ============================================

    match /users/{userId} {
      // Read: Users can read their own profile, admins can read all
      allow read: if isOwner(userId) || isAdminOrMaster();

      // Create: Only during registration via Cloud Function
      // Direct writes are blocked; use callable function
      allow create: if false;

      // Update: Users can update own profile (limited fields)
      // Admins can update any user
      allow update: if (isOwner(userId) &&
                       onlyUpdatingAllowedFields()) ||
                       isAdminOrMaster();

      // Delete: Only Master can soft-delete (disable) users
      allow delete: if false; // Soft delete only

      function onlyUpdatingAllowedFields() {
        let allowedFields = ['displayName', 'phone', 'theme', 'fcmTokens', 'lastLogin', 'badgeCount'];
        return request.resource.data.diff(resource.data).affectedKeys().hasOnly(allowedFields);
      }
    }

    // ============================================
    // LEADS COLLECTION
    // ============================================

    match /leads/{leadId} {
      // Read: Must have 'view' permission for lead's permit type
      allow read: if isAuthenticated() &&
                    hasPermission(resource.data.permitType, 'view');

      // Create: Must have 'create' permission for permit type
      allow create: if isAuthenticated() &&
                      hasPermission(request.resource.data.permitType, 'create') &&
                      validateLeadData();

      // Update: Must have 'edit' permission for permit type
      allow update: if isAuthenticated() &&
                      hasPermission(resource.data.permitType, 'edit') &&
                      validateLeadData();

      // Delete: Must have 'delete' permission for permit type
      allow delete: if isAuthenticated() &&
                      hasPermission(resource.data.permitType, 'delete');

      function validateLeadData() {
        let data = request.resource.data;
        return data.recordId is string &&
               data.permitType in ['pool_permits', 'kitchen_bath_permits', 'roof_permits'] &&
               data.status in ['new', 'contacted', 'responded', 'qualified', 'disqualified', 'converted'] &&
               data.fullName is string &&
               data.fullAddress is string;
      }
    }

    // ============================================
    // PERMITS COLLECTION
    // ============================================

    match /permits/{permitId} {
      // Read: Must have 'view' permission for permit type
      allow read: if isAuthenticated() &&
                    hasPermission(resource.data.permitType, 'view');

      // Create/Update/Delete: Only Master or Admin
      allow write: if isAdminOrMaster();
    }

    // ============================================
    // TEMPLATES COLLECTION
    // ============================================

    match /templates/{templateId} {
      // Read: Must have 'view' permission for permit type
      allow read: if isAuthenticated() &&
                    hasPermission(resource.data.permitType, 'view');

      // Create/Update/Delete: Must have 'manage_templates' permission
      allow create, update: if isAuthenticated() &&
                              hasPermission(request.resource.data.permitType, 'manage_templates');

      allow delete: if isAuthenticated() &&
                      hasPermission(resource.data.permitType, 'manage_templates');
    }

    // ============================================
    // AI PROMPTS COLLECTION
    // ============================================

    match /ai_prompts/{promptId} {
      // Read: Must have 'manage_templates' permission for permit type
      allow read: if isAuthenticated() &&
                    hasPermission(resource.data.permitType, 'manage_templates');

      // Write: Must have 'manage_templates' permission
      allow write: if isAuthenticated() &&
                     hasPermission(request.resource.data.permitType, 'manage_templates');
    }

    // ============================================
    // POLICIES COLLECTION
    // ============================================

    match /policies/{policyId} {
      // Read: All authenticated users can read active policies
      allow read: if isAuthenticated();

      // Write: Only Master can create/update policies
      allow create, update: if isMaster() &&
                              validatePolicy();

      // Delete: Only Master can delete (should be soft delete)
      allow delete: if isMaster();

      function validatePolicy() {
        let data = request.resource.data;
        return data.type in ['terms', 'privacy'] &&
               data.version is string &&
               data.content is string &&
               data.publishedBy == request.auth.uid;
      }
    }

    // ============================================
    // API KEYS COLLECTION (Metadata Only)
    // ============================================

    match /api_keys/{keyId} {
      // Read: Only users with 'manage_api' permission for any permit type
      allow read: if isAuthenticated() && (
                    hasPermission('pool_permits', 'manage_api') ||
                    hasPermission('kitchen_bath_permits', 'manage_api') ||
                    hasPermission('roof_permits', 'manage_api')
                  );

      // Write: Only Master
      allow write: if isMaster();
    }

    // ============================================
    // NOTIFICATIONS COLLECTION
    // ============================================

    match /notifications/{notificationId} {
      // Read: Users can only read their own notifications
      allow read: if isAuthenticated() &&
                    resource.data.userId == request.auth.uid;

      // Create: System only (via Cloud Functions)
      allow create: if false;

      // Update: Users can mark their own as read
      allow update: if isAuthenticated() &&
                      resource.data.userId == request.auth.uid &&
                      onlyMarkingAsRead();

      // Delete: Users can delete their own notifications
      allow delete: if isAuthenticated() &&
                      resource.data.userId == request.auth.uid;

      function onlyMarkingAsRead() {
        let allowedFields = ['isRead', 'readAt'];
        return request.resource.data.diff(resource.data).affectedKeys().hasOnly(allowedFields);
      }
    }

    // ============================================
    // ACCEPTANCE LOGS COLLECTION
    // ============================================

    match /acceptance_logs/{logId} {
      // Read: Users can read their own logs, admins can read all
      allow read: if isOwner(resource.data.userId) || isAdminOrMaster();

      // Create: Users can create their own acceptance logs
      allow create: if isAuthenticated() &&
                      request.resource.data.userId == request.auth.uid;

      // Update/Delete: No one can modify logs (immutable audit trail)
      allow update, delete: if false;
    }

    // ============================================
    // AUDIT LOGS COLLECTION
    // ============================================

    match /audit_logs/{logId} {
      // Read: Master and Admin only
      allow read: if isAdminOrMaster();

      // Write: System only (via Cloud Functions)
      allow write: if false;
    }

    // ============================================
    // FOOTER CONFIGURATION
    // ============================================

    match /config/footer {
      // Read: All authenticated users
      allow read: if isAuthenticated();

      // Write: Only Master
      allow write: if isMaster();
    }

    // ============================================
    // APP CONFIGURATION
    // ============================================

    match /config/{document=**} {
      // Read: All authenticated users
      allow read: if isAuthenticated();

      // Write: Only Master
      allow write: if isMaster();
    }

    // ============================================
    // DEFAULT DENY ALL
    // ============================================

    // Block all other paths
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Firebase Storage Rules (if needed)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isMaster() {
      return request.auth.token.role == 'master';
    }

    function isAdminOrMaster() {
      return request.auth.token.role in ['admin', 'master'];
    }

    // User profile images
    match /users/{userId}/profile/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId &&
                     request.resource.size < 5 * 1024 * 1024 && // 5MB max
                     request.resource.contentType.matches('image/.*');
    }

    // Lead attachments
    match /leads/{leadId}/attachments/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() &&
                     request.resource.size < 10 * 1024 * 1024; // 10MB max
    }

    // Policy documents (Master only)
    match /policies/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isMaster();
    }

    // App assets (Master only)
    match /assets/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isMaster();
    }

    // Default deny
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Security Best Practices

### 1. Custom Claims Management

**Never store sensitive permissions in Firestore** - use Firebase Auth Custom Claims:

```javascript
// Cloud Function to set claims after permission changes
exports.updateUserPermissions = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const userId = context.params.userId;

    // Set custom claims
    await admin.auth().setCustomUserClaims(userId, {
      role: newData.role,
      permissions: newData.permissions
    });

    return null;
  });
```

### 2. Token Refresh

After updating permissions, users must refresh their ID token:

```typescript
// Mobile app code
import auth from '@react-native-firebase/auth';

async function refreshUserToken() {
  const user = auth().currentUser;
  if (user) {
    await user.getIdToken(true); // Force refresh
    // New claims are now available
  }
}
```

### 3. Rate Limiting

Implement rate limiting in Cloud Functions:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each user to 100 requests per windowMs
});

exports.sendSms = functions.https.onCall(async (data, context) => {
  // Apply rate limiting logic
  const userId = context.auth.uid;
  const userRef = admin.firestore().collection('rate_limits').doc(userId);

  // Check and update rate limit
  // ... implementation
});
```

### 4. Input Validation

Always validate input in both client and Cloud Functions:

```javascript
function validateLeadInput(data) {
  const schema = {
    recordId: { type: 'string', required: true, maxLength: 50 },
    fullName: { type: 'string', required: true, maxLength: 100 },
    email1: { type: 'email', required: false },
    phone1: { type: 'phone', required: false },
    permitType: { type: 'enum', values: ['pool_permits', 'kitchen_bath_permits', 'roof_permits'] }
  };

  // Validate against schema
  // Throw error if invalid
}
```

### 5. Audit Logging

Log all sensitive operations:

```javascript
async function createAuditLog(action, resource, resourceId, userId, changes = null) {
  await admin.firestore().collection('audit_logs').add({
    userId,
    userEmail: (await admin.auth().getUser(userId)).email,
    userRole: (await admin.auth().getUser(userId)).customClaims.role,
    action,
    resource,
    resourceId,
    changes,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    ipAddress: null, // Can be captured from request context
    deviceInfo: null
  });
}
```

### 6. Sensitive Data Handling

**Never store in Firestore**:
- API keys (use Secret Manager)
- Passwords (use Firebase Auth)
- Credit card data
- SSN or sensitive personal identifiers

**Encrypt at rest** (if absolutely necessary to store):
```javascript
const crypto = require('crypto');
const algorithm = 'aes-256-gcm';

function encrypt(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

function decrypt(encrypted, key, iv, authTag) {
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

### 7. CORS Configuration

Configure CORS for Cloud Functions:

```javascript
const cors = require('cors')({
  origin: true, // Allow all origins for mobile apps
  credentials: true
});

exports.myFunction = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    // Your function logic
  });
});
```

### 8. Environment Variables & Secrets

Store all secrets in Firebase Secret Manager:

```bash
# Set secrets
firebase functions:secrets:set OPENAI_API_KEY
firebase functions:secrets:set GEMINI_API_KEY
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set SENDGRID_API_KEY
```

Access in functions:

```javascript
const { defineSecret } = require('firebase-functions/params');

const openaiKey = defineSecret('OPENAI_API_KEY');
const geminiKey = defineSecret('GEMINI_API_KEY');

exports.generateTemplate = functions
  .runWith({
    secrets: [openaiKey, geminiKey]
  })
  .https.onCall(async (data, context) => {
    const key = openaiKey.value();
    // Use key...
  });
```

---

## Testing Security Rules

### Local Emulator Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize emulators
firebase init emulators

# Start emulators
firebase emulators:start
```

### Unit Tests

```javascript
// firestore.rules.test.js
const firebase = require('@firebase/testing');
const fs = require('fs');

const PROJECT_ID = 'label-app-test';

function getFirestore(auth) {
  return firebase.initializeTestApp({ projectId: PROJECT_ID, auth }).firestore();
}

function getAdminFirestore() {
  return firebase.initializeAdminApp({ projectId: PROJECT_ID }).firestore();
}

beforeAll(async () => {
  const rules = fs.readFileSync('firestore.rules', 'utf8');
  await firebase.loadFirestoreRules({ projectId: PROJECT_ID, rules });
});

afterAll(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
});

describe('Users Collection', () => {
  it('allows users to read their own profile', async () => {
    const db = getFirestore({ uid: 'user1', role: 'user' });
    const profile = db.collection('users').doc('user1');
    await firebase.assertSucceeds(profile.get());
  });

  it('denies users from reading other profiles', async () => {
    const db = getFirestore({ uid: 'user1', role: 'user' });
    const profile = db.collection('users').doc('user2');
    await firebase.assertFails(profile.get());
  });

  it('allows admins to read all profiles', async () => {
    const db = getFirestore({ uid: 'admin1', role: 'admin' });
    const profile = db.collection('users').doc('user2');
    await firebase.assertSucceeds(profile.get());
  });
});

describe('Leads Collection', () => {
  it('allows viewing leads with proper permission', async () => {
    const db = getFirestore({
      uid: 'user1',
      role: 'user',
      permissions: {
        pool_permits: { view: true }
      }
    });

    const adminDb = getAdminFirestore();
    await adminDb.collection('leads').doc('lead1').set({
      permitType: 'pool_permits',
      recordId: 'TEST-001',
      fullName: 'Test User',
      fullAddress: '123 Test St'
    });

    const lead = db.collection('leads').doc('lead1');
    await firebase.assertSucceeds(lead.get());
  });

  it('denies viewing leads without permission', async () => {
    const db = getFirestore({
      uid: 'user1',
      role: 'user',
      permissions: {
        pool_permits: { view: false }
      }
    });

    const lead = db.collection('leads').doc('lead1');
    await firebase.assertFails(lead.get());
  });
});

describe('Policies Collection', () => {
  it('allows master to create policies', async () => {
    const db = getFirestore({ uid: 'master1', role: 'master' });
    const policy = db.collection('policies').doc('policy1');
    await firebase.assertSucceeds(policy.set({
      type: 'terms',
      version: '1.0',
      content: 'Test content',
      publishedBy: 'master1'
    }));
  });

  it('denies non-master from creating policies', async () => {
    const db = getFirestore({ uid: 'admin1', role: 'admin' });
    const policy = db.collection('policies').doc('policy1');
    await firebase.assertFails(policy.set({
      type: 'terms',
      version: '1.0',
      content: 'Test content',
      publishedBy: 'admin1'
    }));
  });
});
```

Run tests:

```bash
npm test
```

---

## Monitoring & Alerts

### Set up Firebase Security Monitoring

1. **Firebase Console → Firestore → Rules → Monitoring**
   - Review denied requests
   - Identify potential security issues
   - Track unusual access patterns

2. **Cloud Logging Filters**:
```
resource.type="cloud_function"
severity>=ERROR
textPayload:"permission-denied"
```

3. **Alert Policies**:
   - High rate of permission denied errors
   - Unusual number of failed authentication attempts
   - Spike in API key usage
   - Large data exports

---

This completes the Security Rules documentation.

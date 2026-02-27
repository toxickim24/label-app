# Firebase Quick Reference Guide

Quick code snippets for common Firebase operations in your Label App.

## 🔐 Authentication

### Sign Up New User

```typescript
import { auth } from '../config/firebase';

const signUp = async (email: string, password: string) => {
  try {
    const result = await auth().createUserWithEmailAndPassword(email, password);
    console.log('User ID:', result.user.uid);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Email already registered');
    } else if (error.code === 'auth/weak-password') {
      console.log('Password should be at least 6 characters');
    }
    throw error;
  }
};
```

### Sign In User

```typescript
const signIn = async (email: string, password: string) => {
  try {
    const result = await auth().signInWithEmailAndPassword(email, password);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log('No user found with this email');
    } else if (error.code === 'auth/wrong-password') {
      console.log('Incorrect password');
    }
    throw error;
  }
};
```

### Sign Out User

```typescript
const signOut = async () => {
  await auth().signOut();
};
```

### Get Current User

```typescript
const currentUser = auth().currentUser;

if (currentUser) {
  console.log('User email:', currentUser.email);
  console.log('User ID:', currentUser.uid);
} else {
  console.log('No user signed in');
}
```

### Listen to Auth State Changes

```typescript
import { useEffect } from 'react';

const useAuthListener = () => {
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        console.log('User signed in:', user.email);
      } else {
        console.log('User signed out');
      }
    });

    return unsubscribe; // Cleanup on unmount
  }, []);
};
```

### Update User Profile

```typescript
const updateProfile = async (displayName: string, photoURL?: string) => {
  const user = auth().currentUser;
  if (user) {
    await user.updateProfile({
      displayName,
      photoURL,
    });
  }
};
```

### Send Password Reset Email

```typescript
const resetPassword = async (email: string) => {
  await auth().sendPasswordResetEmail(email);
  console.log('Password reset email sent');
};
```

---

## 📊 Firestore Database

### Add Document (Auto ID)

```typescript
import { firestore } from '../config/firebase';

const addLead = async (leadData: any) => {
  const docRef = await firestore().collection('leads').add({
    ...leadData,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });

  console.log('Document ID:', docRef.id);
  return docRef.id;
};
```

### Add Document (Custom ID)

```typescript
const addLeadWithId = async (id: string, leadData: any) => {
  await firestore().collection('leads').doc(id).set({
    ...leadData,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
};
```

### Get Single Document

```typescript
const getLead = async (leadId: string) => {
  const doc = await firestore().collection('leads').doc(leadId).get();

  if (doc.exists) {
    return { id: doc.id, ...doc.data() };
  } else {
    console.log('Document not found');
    return null;
  }
};
```

### Get All Documents

```typescript
const getAllLeads = async () => {
  const snapshot = await firestore().collection('leads').get();

  const leads = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  return leads;
};
```

### Query Documents

```typescript
// Get leads by permit type
const getLeadsByType = async (permitType: string) => {
  const snapshot = await firestore()
    .collection('leads')
    .where('permitType', '==', permitType)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get recent leads (limit 10)
const getRecentLeads = async () => {
  const snapshot = await firestore()
    .collection('leads')
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Complex query
const getQualifiedPoolLeads = async () => {
  const snapshot = await firestore()
    .collection('leads')
    .where('permitType', '==', 'pool_permits')
    .where('status', '==', 'qualified')
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

### Update Document

```typescript
const updateLead = async (leadId: string, updates: any) => {
  await firestore().collection('leads').doc(leadId).update({
    ...updates,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  });
};
```

### Delete Document

```typescript
const deleteLead = async (leadId: string) => {
  await firestore().collection('leads').doc(leadId).delete();
};
```

### Real-time Listener (All Documents)

```typescript
const listenToLeads = (callback: (leads: any[]) => void) => {
  const unsubscribe = firestore()
    .collection('leads')
    .onSnapshot(snapshot => {
      const leads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(leads);
    });

  return unsubscribe; // Call this to stop listening
};

// Usage in React component
useEffect(() => {
  const unsubscribe = listenToLeads(leads => {
    console.log('Leads updated:', leads);
    setLeads(leads);
  });

  return unsubscribe;
}, []);
```

### Real-time Listener (Single Document)

```typescript
const listenToLead = (leadId: string, callback: (lead: any) => void) => {
  const unsubscribe = firestore()
    .collection('leads')
    .doc(leadId)
    .onSnapshot(doc => {
      if (doc.exists) {
        callback({ id: doc.id, ...doc.data() });
      }
    });

  return unsubscribe;
};
```

### Batch Operations

```typescript
const batchUpdate = async (leadIds: string[], updates: any) => {
  const batch = firestore().batch();

  leadIds.forEach(id => {
    const ref = firestore().collection('leads').doc(id);
    batch.update(ref, updates);
  });

  await batch.commit();
  console.log('Batch update complete');
};
```

### Increment/Decrement Values

```typescript
const incrementViewCount = async (leadId: string) => {
  await firestore()
    .collection('leads')
    .doc(leadId)
    .update({
      viewCount: firestore.FieldValue.increment(1),
    });
};
```

### Array Operations

```typescript
// Add to array
const addViewer = async (leadId: string, userId: string) => {
  await firestore()
    .collection('leads')
    .doc(leadId)
    .update({
      viewedBy: firestore.FieldValue.arrayUnion(userId),
    });
};

// Remove from array
const removeViewer = async (leadId: string, userId: string) => {
  await firestore()
    .collection('leads')
    .doc(leadId)
    .update({
      viewedBy: firestore.FieldValue.arrayRemove(userId),
    });
};
```

---

## ☁️ Cloud Functions

### Call a Function

```typescript
import { functions } from '../config/firebase';

const sendEmail = async (to: string, subject: string, body: string) => {
  const sendEmailFunction = functions().httpsCallable('sendEmail');

  try {
    const result = await sendEmailFunction({
      to,
      subject,
      body,
    });

    console.log('Email sent:', result.data);
    return result.data;
  } catch (error) {
    console.error('Error calling function:', error);
    throw error;
  }
};
```

---

## 🔔 Cloud Messaging (Push Notifications)

### Get FCM Token

```typescript
import { messaging, initializeMessaging } from '../config/firebase';

const getToken = async () => {
  const token = await initializeMessaging();
  console.log('FCM Token:', token);

  // Save this token to Firestore
  const user = auth().currentUser;
  if (user && token) {
    await firestore()
      .collection('users')
      .doc(user.uid)
      .update({
        fcmTokens: firestore.FieldValue.arrayUnion(token),
      });
  }

  return token;
};
```

### Listen for Notifications (Foreground)

```typescript
useEffect(() => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('Notification received:', remoteMessage);

    // Show local notification or update UI
    Alert.alert(
      remoteMessage.notification?.title || 'Notification',
      remoteMessage.notification?.body || ''
    );
  });

  return unsubscribe;
}, []);
```

### Handle Background Notifications

```typescript
// In your index.ts or App.tsx (outside component)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message:', remoteMessage);
});
```

---

## 🔍 Common Patterns

### Check If Document Exists

```typescript
const documentExists = async (collection: string, docId: string) => {
  const doc = await firestore().collection(collection).doc(docId).get();
  return doc.exists;
};
```

### Get Document Count

```typescript
const getLeadCount = async () => {
  const snapshot = await firestore().collection('leads').get();
  return snapshot.size;
};
```

### Paginated Queries

```typescript
let lastDoc: any = null;

const getNextPage = async (pageSize: number = 10) => {
  let query = firestore()
    .collection('leads')
    .orderBy('createdAt', 'desc')
    .limit(pageSize);

  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }

  const snapshot = await query.get();

  if (!snapshot.empty) {
    lastDoc = snapshot.docs[snapshot.docs.length - 1];
  }

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

### Search in Firestore

```typescript
// Note: Firestore doesn't have full-text search
// For basic prefix search:
const searchLeads = async (searchTerm: string) => {
  const snapshot = await firestore()
    .collection('leads')
    .where('fullName', '>=', searchTerm)
    .where('fullName', '<=', searchTerm + '\uf8ff')
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

---

## 🛡️ Security Best Practices

### 1. Never Store Sensitive Data in Firestore Without Encryption

```typescript
// ❌ BAD
await firestore().collection('users').doc(userId).set({
  creditCard: '1234-5678-9012-3456',
  ssn: '123-45-6789',
});

// ✅ GOOD - Use Cloud Functions to handle sensitive data
```

### 2. Always Validate User Permissions

```typescript
const updateLead = async (leadId: string, updates: any) => {
  const user = auth().currentUser;

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if user has permission
  const userDoc = await firestore().collection('users').doc(user.uid).get();
  const userData = userDoc.data();

  if (!userData?.permissions?.edit) {
    throw new Error('No permission to edit');
  }

  await firestore().collection('leads').doc(leadId).update(updates);
};
```

### 3. Use Firestore Security Rules

See `SECURITY_RULES.md` for examples.

---

## 📝 Error Handling

```typescript
const safeFirestoreOperation = async () => {
  try {
    const result = await firestore().collection('leads').get();
    return result;
  } catch (error: any) {
    console.error('Firestore error:', error);

    if (error.code === 'permission-denied') {
      console.log('You don not have permission');
    } else if (error.code === 'unavailable') {
      console.log('Firestore is offline');
    } else if (error.code === 'not-found') {
      console.log('Document not found');
    }

    throw error;
  }
};
```

---

## 🎯 Tips & Tricks

### 1. Use TypeScript Interfaces

```typescript
interface Lead {
  id: string;
  fullName: string;
  email: string;
  permitType: string;
  createdAt: Date;
  updatedAt: Date;
}

const getLead = async (id: string): Promise<Lead | null> => {
  const doc = await firestore().collection('leads').doc(id).get();
  if (doc.exists) {
    return { id: doc.id, ...doc.data() } as Lead;
  }
  return null;
};
```

### 2. Use Timestamps Consistently

```typescript
// Always use server timestamp for consistency
const data = {
  ...leadData,
  createdAt: firestore.FieldValue.serverTimestamp(),
};
```

### 3. Offline Persistence

```typescript
// Enable offline persistence (done automatically in firebase.ts)
await firestore().settings({
  persistence: true,
});
```

### 4. Optimize Reads

```typescript
// Use get() for one-time reads
const leads = await firestore().collection('leads').get();

// Use onSnapshot() only when you need real-time updates
const unsubscribe = firestore()
  .collection('leads')
  .onSnapshot(snapshot => {
    // This will be called every time data changes
  });
```

---

## 🔗 Useful Links

- [Firestore Data Types](https://firebase.google.com/docs/firestore/manage-data/data-types)
- [Query Operators](https://firebase.google.com/docs/firestore/query-data/queries)
- [Firebase Auth Errors](https://firebase.google.com/docs/auth/admin/errors)
- [Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

**Need more help?** Check the [Firebase Setup Guide](./FIREBASE_SETUP_GUIDE.md) or Firebase documentation.

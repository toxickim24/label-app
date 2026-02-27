/**
 * Policies Service - Firestore Operations
 * Handles terms & conditions and privacy policy
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from '../../index';

function getFirestore() {
  if (!firestore) {
    console.error('❌ Firestore instance is undefined in policiesService!');
    throw new Error('Firestore not initialized');
  }
  return firestore;
}

export interface Policy {
  id: string;
  version: string;
  title: string;
  content: string;
  effectiveDate: Date;
  lastUpdated: Date;
}

/**
 * Get a policy document (terms or privacy)
 */
export async function getPolicy(policyId: 'terms_and_conditions' | 'privacy_policy'): Promise<Policy | null> {
  try {
    const db = getFirestore();
    const policyDoc = await getDoc(doc(db, 'policies', policyId));

    if (policyDoc.exists()) {
      const data = policyDoc.data();
      return {
        id: policyDoc.id,
        version: data.version || '1.0',
        title: data.title || '',
        content: data.content || '',
        effectiveDate: data.effectiveDate?.toDate() || new Date(),
        lastUpdated: data.lastUpdated?.toDate() || new Date(),
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting policy:', error);
    return null;
  }
}

/**
 * Update a policy document
 */
export async function updatePolicy(
  policyId: 'terms_and_conditions' | 'privacy_policy',
  content: string,
  version?: string
): Promise<void> {
  try {
    const db = getFirestore();
    const policyRef = doc(db, 'policies', policyId);

    // Get existing policy to preserve title
    const existing = await getDoc(policyRef);
    const title = existing.exists()
      ? existing.data().title
      : policyId === 'terms_and_conditions' ? 'Terms and Conditions' : 'Privacy Policy';

    await setDoc(policyRef, {
      version: version || '1.0',
      title,
      content,
      lastUpdated: serverTimestamp(),
      effectiveDate: existing.exists() ? existing.data().effectiveDate : serverTimestamp(),
    }, { merge: true });

    console.log('✅ Policy updated:', policyId);
  } catch (error) {
    console.error('Error updating policy:', error);
    throw error;
  }
}

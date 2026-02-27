/**
 * Templates Service - Firestore Operations
 * Handles all template-related Firestore operations
 */

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Template, PermitType, TemplateCategory } from '../types';
import { firestore } from '../../index';

function getFirestore() {
  if (!firestore) {
    console.error('❌ Firestore instance is undefined in templatesService!');
    throw new Error('Firestore not initialized');
  }
  return firestore;
}

/**
 * Subscribe to real-time templates updates
 */
export function subscribeToTemplates(
  permitType: PermitType | 'all',
  callback: (templates: Template[]) => void
): () => void {
  console.log('📡 Subscribing to templates:', { permitType });

  const db = getFirestore();
  const templatesRef = collection(db, 'templates');

  let q = permitType === 'all'
    ? query(templatesRef, orderBy('createdAt', 'desc'))
    : query(templatesRef, where('permitType', '==', permitType), orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const templates = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastUsedAt: doc.data().lastUsedAt?.toDate() || null,
      })) as Template[];

      console.log(`✅ Loaded ${templates.length} templates from Firestore`);
      callback(templates);
    },
    (error) => {
      console.error('❌ Error loading templates:', error);
      callback([]);
    }
  );

  return unsubscribe;
}

/**
 * Get a single template by ID
 */
export async function getTemplate(templateId: string): Promise<Template | null> {
  try {
    const db = getFirestore();
    const templateDoc = await getDoc(doc(db, 'templates', templateId));

    if (templateDoc.exists()) {
      return {
        id: templateDoc.id,
        ...templateDoc.data(),
        createdAt: templateDoc.data().createdAt?.toDate() || new Date(),
        updatedAt: templateDoc.data().updatedAt?.toDate() || new Date(),
        lastUsedAt: templateDoc.data().lastUsedAt?.toDate() || null,
      } as Template;
    }
    return null;
  } catch (error) {
    console.error('Error getting template:', error);
    return null;
  }
}

/**
 * Create a new template
 */
export async function createTemplate(templateData: Partial<Template>): Promise<string> {
  try {
    const db = getFirestore();
    const docRef = await addDoc(collection(db, 'templates'), {
      ...templateData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timesUsed: 0,
      lastUsedAt: null,
      isActive: true,
      isDefault: false,
    });

    console.log('✅ Template created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
}

/**
 * Update a template
 */
export async function updateTemplate(templateId: string, updates: Partial<Template>): Promise<void> {
  try {
    const db = getFirestore();
    await updateDoc(doc(db, 'templates', templateId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Template updated:', templateId);
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: string): Promise<void> {
  try {
    const db = getFirestore();
    await deleteDoc(doc(db, 'templates', templateId));
    console.log('✅ Template deleted:', templateId);
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}

/**
 * Increment template usage count
 */
export async function incrementTemplateUsage(templateId: string): Promise<void> {
  try {
    const template = await getTemplate(templateId);
    if (!template) throw new Error('Template not found');

    const db = getFirestore();
    await updateDoc(doc(db, 'templates', templateId), {
      timesUsed: (template.timesUsed || 0) + 1,
      lastUsedAt: serverTimestamp(),
    });

    console.log('✅ Template usage incremented:', templateId);
  } catch (error) {
    console.error('Error incrementing template usage:', error);
    throw error;
  }
}

/**
 * Leads Service - Firestore Operations
 * Handles all lead-related Firestore operations
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
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Lead, PermitType, LeadStatus } from '../types';

// Import firestore instance from index.ts (same as firebase.helpers.ts does)
import { firestore } from '../../index';

function getFirestore() {
  if (!firestore) {
    console.error('❌ Firestore instance is undefined in leadsService!');
    throw new Error('Firestore not initialized');
  }
  return firestore;
}

/**
 * Convert Firestore timestamp to Date
 */
function convertTimestamp(timestamp: any): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp?.toDate) return timestamp.toDate();
  if (timestamp?.seconds) return new Date(timestamp.seconds * 1000);
  return new Date();
}

/**
 * Convert Firestore document to Lead object
 */
function convertFirestoreToLead(id: string, data: any): Lead {
  const lead = {
    id,
    // Basic Info
    permitNumber: data.permitNumber || '',
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    fullName: data.fullName || '',

    // Contact Info (convert phone numbers to strings since they may be stored as numbers in Firebase)
    phoneNumbers: (data.phoneNumbers || []).map((p: any) => String(p)),
    phoneNumber: String(data.phoneNumber || ''),
    phone1: String(data.phoneNumber || data.phoneNumbers?.[0] || ''),
    phone2: String(data.phoneNumbers?.[1] || ''),
    phone3: String(data.phoneNumbers?.[2] || ''),
    emails: data.emails || [],
    email: data.email || '',
    email1: data.email || data.emails?.[0] || '',
    email2: data.emails?.[1] || '',
    email3: data.emails?.[2] || '',

    // Address Info
    fullAddress: data.fullAddress || '',
    street: data.street || '',
    city: data.city || '',
    state: data.state || '',
    zipCode: data.zipCode || '',
    county: data.county || '',

    // Permit Info
    permitType: data.permitType || 'pool_permits',
    permitDate: data.permitDate ? convertTimestamp(data.permitDate) : null,

    // Status
    status: data.status || 'new',

    // Legacy field mappings
    recordId: data.permitNumber || '',
    createdDate: data.createdAt ? convertTimestamp(data.createdAt) : new Date(),

    // Metadata
    source: data.source || 'unknown',
    importedAt: data.importedAt ? convertTimestamp(data.importedAt) : null,
    createdAt: data.createdAt ? convertTimestamp(data.createdAt) : new Date(),
    lastUpdated: data.lastUpdated ? convertTimestamp(data.lastUpdated) : new Date(),

    // Arrays
    tags: data.tags || [],
    communications: data.communications || [],

    // Text fields
    notes: data.notes || '',
    description: data.description || '',

    // Contact tracking
    lastContactedAt: data.lastContactedAt ? convertTimestamp(data.lastContactedAt) : null,
    lastContactedBy: data.lastContactedBy || null,
    contactedCount: data.contactedCount || 0,

    // Flags
    isRead: data.isRead || false,
    isFlagged: data.isFlagged || false,
    viewedBy: data.viewedBy || [],
    importedBy: data.importedBy || null,
  };

  return lead;
}

/**
 * Subscribe to real-time leads updates
 */
export function subscribeToLeads(
  permitType: PermitType | 'all',
  statusFilter: LeadStatus | 'all',
  callback: (leads: Lead[]) => void
): () => void {
  console.log('📡 Subscribing to leads:', { permitType, statusFilter });

  const db = getFirestore();
  const leadsRef = collection(db, 'leads');
  let q = query(leadsRef, orderBy('createdAt', 'desc'));

  // Add permit type filter
  if (permitType !== 'all') {
    q = query(leadsRef, where('permitType', '==', permitType), orderBy('createdAt', 'desc'));
  }

  // Add status filter
  if (statusFilter !== 'all' && permitType === 'all') {
    q = query(leadsRef, where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
  } else if (statusFilter !== 'all' && permitType !== 'all') {
    q = query(
      leadsRef,
      where('permitType', '==', permitType),
      where('status', '==', statusFilter),
      orderBy('createdAt', 'desc')
    );
  }

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const leads = snapshot.docs.map((doc, index) => {
        const lead = convertFirestoreToLead(doc.id, doc.data());
        // Log first lead for debugging
        if (index === 0) {
          console.log('📋 First lead DETAILED:', {
            id: lead.id,
            description: lead.description,
            notes: lead.notes,
            permitNumber: lead.permitNumber,
            fullName: lead.fullName,
          });
        }
        return lead;
      });
      console.log(`✅ Loaded ${leads.length} leads from Firestore`);
      callback(leads);
    },
    (error) => {
      console.error('❌ Error loading leads:', error);
      callback([]);
    }
  );

  return unsubscribe;
}

/**
 * Get a single lead by ID
 */
export async function getLead(leadId: string): Promise<Lead | null> {
  try {
    const db = getFirestore();
    const leadDoc = await getDoc(doc(db, 'leads', leadId));
    if (leadDoc.exists()) {
      return convertFirestoreToLead(leadDoc.id, leadDoc.data());
    }
    return null;
  } catch (error) {
    console.error('Error getting lead:', error);
    return null;
  }
}

/**
 * Create a new lead
 */
export async function createLead(leadData: Partial<Lead>): Promise<string> {
  try {
    const db = getFirestore();
    const docRef = await addDoc(collection(db, 'leads'), {
      ...leadData,
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      status: leadData.status || 'new',
      notes: [],
      tags: [],
      communications: [],
      contactedCount: 0,
    });
    console.log('✅ Lead created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
}

/**
 * Update a lead
 */
export async function updateLead(leadId: string, updates: Partial<Lead>): Promise<void> {
  try {
    const db = getFirestore();
    await updateDoc(doc(db, 'leads', leadId), {
      ...updates,
      lastUpdated: serverTimestamp(),
    });
    console.log('✅ Lead updated:', leadId);
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
}

/**
 * Delete a lead
 */
export async function deleteLead(leadId: string): Promise<void> {
  try {
    const db = getFirestore();
    await deleteDoc(doc(db, 'leads', leadId));
    console.log('✅ Lead deleted:', leadId);
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
}

/**
 * Add a note to a lead
 */
export async function addNote(leadId: string, note: string, userId: string): Promise<void> {
  try {
    const lead = await getLead(leadId);
    if (!lead) throw new Error('Lead not found');

    const newNote = {
      id: `note-${Date.now()}`,
      text: note,
      createdBy: userId,
      createdAt: new Date(),
    };

    const db = getFirestore();
    await updateDoc(doc(db, 'leads', leadId), {
      notes: [...(lead.notes || []), newNote],
      lastUpdated: serverTimestamp(),
    });

    console.log('✅ Note added to lead:', leadId);
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
}

/**
 * Log communication for a lead
 */
export async function logCommunication(
  leadId: string,
  communication: {
    type: 'email' | 'sms' | 'call';
    sentBy: string;
    content?: string;
  }
): Promise<void> {
  try {
    const lead = await getLead(leadId);
    if (!lead) throw new Error('Lead not found');

    const newCommunication = {
      ...communication,
      sentAt: new Date(),
    };

    const db = getFirestore();
    await updateDoc(doc(db, 'leads', leadId), {
      communications: [...(lead.communications || []), newCommunication],
      contactedCount: (lead.contactedCount || 0) + 1,
      lastContactedAt: serverTimestamp(),
      lastContactedBy: communication.sentBy,
      lastUpdated: serverTimestamp(),
    });

    console.log('✅ Communication logged for lead:', leadId);
  } catch (error) {
    console.error('Error logging communication:', error);
    throw error;
  }
}

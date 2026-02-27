/**
 * Global State Management with Zustand
 */

import { create } from 'zustand';
import { User, Lead, Template, Notification, PermitType } from '../types';
import { FirebaseAuth, FirebaseFirestore, buildQuery, isWeb } from '../config/firebase.helpers';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Timestamp,
  getFirestore as getFirestoreInstance
} from 'firebase/firestore';
import { app } from '../config/firebase';

// Helper to get firestore instance at runtime (avoids circular dependency issues)
const getFirestore = () => {
  const db = getFirestoreInstance(app);
  console.log('🔥 getFirestore() called, instance:', !!db);
  return db;
};

// ============================================================================
// AUTH STORE
// ============================================================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      console.log('🔐 Starting login for:', email);

      // Sign in with Firebase Auth
      const userCredential = await FirebaseAuth.signInWithEmailAndPassword(email, password);
      console.log('✅ Firebase Auth successful, UID:', userCredential.user.uid);

      // Get user profile from Firestore
      const userDocRef = FirebaseFirestore.doc('users', userCredential.user.uid);
      console.log('📄 Fetching user document from Firestore...');

      const userDoc = await FirebaseFirestore.getDoc(userDocRef);
      const docExists = typeof userDoc.exists === 'function' ? userDoc.exists() : userDoc.exists;
      console.log('📄 Document exists:', docExists);
      console.log('📄 Document data:', userDoc.data());

      if (docExists && userDoc.data()) {
        const userData = userDoc.data() as User;
        console.log('✅ User profile loaded:', userData);

        set({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        console.error('❌ User profile not found in Firestore');
        throw new Error('User profile not found');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      set({
        isLoading: false,
        error: error.message || 'Failed to login',
      });
      throw error;
    }
  },

  signup: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true, error: null });

    try {
      // Create user with Firebase Auth
      const userCredential = await FirebaseAuth.createUserWithEmailAndPassword(email, password);

      // Update profile
      await FirebaseAuth.updateProfile(userCredential.user, { displayName });

      // Determine role (first user is master, others are users)
      const usersCollectionRef = FirebaseFirestore.collection('users');
      const usersQuery = buildQuery(usersCollectionRef, [FirebaseFirestore.limit(1)]);
      const usersSnapshot = await FirebaseFirestore.getDocs(usersQuery);
      const isFirstUser = usersSnapshot.empty;

      // Create user profile in Firestore
      const newUser: User = {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        role: isFirstUser ? 'master' : 'user',
        permissions: {
          pool_permits: {
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
          kitchen_bath_permits: {
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
        accepted_at: new Date(),
        createdAt: new Date(),
        lastLogin: new Date(),
        disabled: false,
        fcmTokens: [],
        badgeCount: 0,
      };

      const userDocRef = FirebaseFirestore.doc('users', userCredential.user.uid);
      await FirebaseFirestore.setDoc(userDocRef, newUser);

      set({
        user: newUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to sign up',
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await FirebaseAuth.signOut();
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      set({ error: error.message || 'Failed to logout' });
      throw error;
    }
  },

  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },

  initializeAuth: async () => {
    set({ isLoading: true });

    try {
      // Listen to auth state changes
      FirebaseAuth.onAuthStateChanged(async (firebaseUser: any) => {
        if (firebaseUser) {
          // User is signed in, get profile from Firestore
          const userDocRef = FirebaseFirestore.doc('users', firebaseUser.uid);
          const userDoc = await FirebaseFirestore.getDoc(userDocRef);
          const docExists = typeof userDoc.exists === 'function' ? userDoc.exists() : userDoc.exists;

          if (docExists && userDoc.data()) {
            // Update last login
            await FirebaseFirestore.updateDoc(userDocRef, {
              lastLogin: FirebaseFirestore.serverTimestamp(),
            });

            set({
              user: userDoc.data() as User,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } else {
          // User is signed out
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      });
    } catch (error: any) {
      console.error('Initialize auth error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to initialize authentication',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

// ============================================================================
// THEME STORE
// ============================================================================

interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  isDark: boolean;
  setTheme: (mode: 'light' | 'dark' | 'system') => void;
  setIsDark: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  isDark: false,

  setTheme: (mode) => {
    set({ mode });
    // TODO: Save to AsyncStorage and update user profile in Firestore
  },

  setIsDark: (isDark) => {
    set({ isDark });
  },
}));

// ============================================================================
// LEADS STORE
// ============================================================================

interface LeadsState {
  leads: Lead[];
  selectedPermitType: PermitType;
  searchQuery: string;
  statusFilter: string;
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  fetchLeads: (permitType: PermitType) => Promise<void>;
  subscribeToLeads: (permitType: PermitType) => void;
  unsubscribeFromLeads: () => void;
  addLead: (lead: Omit<Lead, 'id'>) => Promise<string>;
  updateLead: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
  setSelectedPermitType: (permitType: PermitType) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setLeads: (leads: Lead[]) => void;
  getFilteredLeads: () => Lead[];
  clearError: () => void;
}

export const useLeadsStore = create<LeadsState>((set, get) => ({
  leads: [],
  selectedPermitType: 'pool_permits',
  searchQuery: '',
  statusFilter: 'all',
  isLoading: false,
  error: null,
  unsubscribe: null,

  fetchLeads: async (permitType: PermitType) => {
    set({ isLoading: true, error: null });

    try {
      const leadsRef = collection(getFirestore(), 'leads');
      const q = query(leadsRef, where('permitType', '==', permitType), orderBy('createdDate', 'desc'));
      const snapshot = await getDocs(q);

      const leads = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          // Ensure county is explicitly included
          county: data.county || '',
          // Handle zipCode field (map from 'zip' if 'zipCode' doesn't exist)
          zipCode: data.zipCode || data.zip || '',
          // Handle phoneNumbers array (map from phoneNumber if doesn't exist)
          phoneNumbers: data.phoneNumbers || (data.phoneNumber ? [data.phoneNumber] : []),
          // Handle emails array (map from email if doesn't exist)
          emails: data.emails || (data.email ? [data.email] : []),
          // Timestamps
          createdDate: data.createdDate instanceof Timestamp ? data.createdDate.toDate() : new Date(),
          lastUpdated: data.lastUpdated instanceof Timestamp ? data.lastUpdated.toDate() : new Date(),
          lastContactedAt: data.lastContactedAt instanceof Timestamp ? data.lastContactedAt.toDate() : null,
        };
      }) as Lead[];

      set({ leads, isLoading: false });
    } catch (error: any) {
      console.error('Fetch leads error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch leads',
      });
    }
  },

  subscribeToLeads: (permitType: PermitType) => {
    // Unsubscribe from previous listener
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
    }

    set({ isLoading: true, error: null });

    const leadsRef = collection(getFirestore(), 'leads');
    const q = query(leadsRef, where('permitType', '==', permitType), orderBy('createdDate', 'desc'));

    const newUnsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const leads = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();

          // Map old field names to new ones
          const lead: any = {
            id: docSnap.id,
            ...data,
            // Ensure county is explicitly included
            county: data.county || '',
            // Handle zipCode field (map from 'zip' if 'zipCode' doesn't exist)
            zipCode: data.zipCode || data.zip || '',
            // Handle phoneNumbers array (map from phoneNumber if doesn't exist)
            phoneNumbers: data.phoneNumbers || (data.phoneNumber ? [data.phoneNumber] : []),
            // Handle emails array (map from email if doesn't exist)
            emails: data.emails || (data.email ? [data.email] : []),
            // Timestamps
            createdDate: data.createdDate instanceof Timestamp ? data.createdDate.toDate() : new Date(),
            lastUpdated: data.lastUpdated instanceof Timestamp ? data.lastUpdated.toDate() : new Date(),
            lastContactedAt: data.lastContactedAt instanceof Timestamp ? data.lastContactedAt.toDate() : null,
          };

          // Debug first lead
          if (docSnap.id === snapshot.docs[0]?.id) {
            console.log('📋 First lead loaded:', {
              countyFromDB: data.county,
              countyInLead: lead.county,
              zipCode: lead.zipCode,
              zipFromDB: data.zip,
              zipCodeFromDB: data.zipCode,
              phoneNumbers: lead.phoneNumbers,
              emails: lead.emails,
              allDataKeys: Object.keys(data).join(', '),
            });
          }

          return lead;
        }) as Lead[];

        set({ leads, isLoading: false });
      },
      (error) => {
        console.error('Subscribe to leads error:', error);
        set({
          isLoading: false,
          error: error.message || 'Failed to subscribe to leads',
        });
      }
    );

    set({ unsubscribe: newUnsubscribe });
  },

  unsubscribeFromLeads: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },

  addLead: async (lead: Omit<Lead, 'id'>) => {
    set({ isLoading: true, error: null });

    try {
      const leadsRef = collection(getFirestore(), 'leads');
      const docRef = await addDoc(leadsRef, {
        ...lead,
        createdDate: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });

      set({ isLoading: false });
      return docRef.id;
    } catch (error: any) {
      console.error('Add lead error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to add lead',
      });
      throw error;
    }
  },

  updateLead: async (leadId: string, updates: Partial<Lead>) => {
    set({ isLoading: true, error: null });

    let cleanUpdates: any = {};
    try {
      console.log('🔍 Raw updates:', updates);

      // Filter out undefined/null values and non-updatable fields
      Object.keys(updates).forEach((key) => {
        const value = (updates as any)[key];

        // Skip old/legacy fields - we'll sync them from new fields
        if (key === 'phone1' || key === 'phone2' || key === 'phone3' ||
            key === 'email1' || key === 'email2' || key === 'email3' ||
            key === 'phoneNumber' || key === 'email' || key === 'zip') {
          console.log(`⏭️ Skipping legacy field: ${key}`);
          return;
        }

        // Skip undefined, null, empty arrays, and internal fields
        if (value !== undefined &&
            key !== 'id' &&
            key !== 'createdDate' &&
            key !== 'createdAt' &&
            key !== 'importedAt' &&
            key !== 'importedBy') {

          // Handle arrays - filter out empty strings
          if (Array.isArray(value)) {
            const filteredArray = value.filter(v => v !== '');
            if (filteredArray.length > 0) {
              cleanUpdates[key] = filteredArray;
              console.log(`✅ Adding array field: ${key} = ${JSON.stringify(filteredArray)}`);

              // Sync with legacy fields for backward compatibility
              if (key === 'phoneNumbers') {
                // Update phoneNumber (singular) to phoneNumbers[0]
                cleanUpdates.phoneNumber = filteredArray[0] || '';
                console.log(`  🔄 Syncing phoneNumber = ${filteredArray[0]}`);
              } else if (key === 'emails') {
                // Update email (singular) to emails[0]
                cleanUpdates.email = filteredArray[0] || '';
                console.log(`  🔄 Syncing email = ${filteredArray[0]}`);
              }
            }
            return;
          }

          // Skip empty strings
          if (value === '') {
            return;
          }

          cleanUpdates[key] = value;
          console.log(`✅ Adding field: ${key} = ${JSON.stringify(value)}`);
        }
      });

      // Auto-update fullName if firstName or lastName changed
      if (cleanUpdates.firstName || cleanUpdates.lastName) {
        const firstName = cleanUpdates.firstName || updates.firstName || '';
        const lastName = cleanUpdates.lastName || updates.lastName || '';
        cleanUpdates.fullName = `${firstName} ${lastName}`.trim();
        console.log(`🔄 Auto-updating fullName = "${cleanUpdates.fullName}"`);
      }

      // Delete redundant old fields if we're updating phoneNumbers or emails
      if (cleanUpdates.phoneNumbers) {
        cleanUpdates.phone1 = null;
        cleanUpdates.phone2 = null;
        cleanUpdates.phone3 = null;
        console.log('🗑️ Marking phone1, phone2, phone3 for deletion');
      }
      if (cleanUpdates.emails) {
        cleanUpdates.email1 = null;
        cleanUpdates.email2 = null;
        cleanUpdates.email3 = null;
        console.log('🗑️ Marking email1, email2, email3 for deletion');
      }
      // Delete old 'zip' field if we're updating zipCode
      if (cleanUpdates.zipCode) {
        cleanUpdates.zip = null;
        console.log('🗑️ Marking zip for deletion (using zipCode instead)');
      }

      console.log('📝 Clean updates to send:', cleanUpdates);

      const db = getFirestore();
      const leadRef = doc(db, 'leads', leadId);

      // Use deleteField for proper deletion
      const { deleteField } = await import('firebase/firestore');
      const finalUpdates: any = { ...cleanUpdates };

      // Convert null values to deleteField()
      Object.keys(finalUpdates).forEach(key => {
        if (finalUpdates[key] === null) {
          finalUpdates[key] = deleteField();
        }
      });

      await updateDoc(leadRef, {
        ...finalUpdates,
        lastUpdated: serverTimestamp(),
      });

      console.log('✅ Lead updated successfully');
      set({ isLoading: false });
    } catch (error: any) {
      console.error('❌ Update lead error:', error);
      console.error('❌ Update data:', cleanUpdates);
      set({
        isLoading: false,
        error: error.message || 'Failed to update lead',
      });
      throw error;
    }
  },

  deleteLead: async (leadId: string) => {
    set({ isLoading: true, error: null });

    try {
      const leadRef = doc(getFirestore(), 'leads', leadId);
      await deleteDoc(leadRef);
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Delete lead error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to delete lead',
      });
      throw error;
    }
  },

  setSelectedPermitType: (permitType) => set({ selectedPermitType: permitType }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setStatusFilter: (status) => set({ statusFilter: status }),

  setLeads: (leads: Lead[]) => set({ leads }),

  getFilteredLeads: () => {
    const { leads, selectedPermitType, searchQuery, statusFilter } = get();

    let filtered = leads.filter((lead) => lead.permitType === selectedPermitType);

    if (statusFilter !== 'all') {
      filtered = filtered.filter((lead) => lead.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.recordId.toLowerCase().includes(query) ||
          lead.fullName.toLowerCase().includes(query) ||
          lead.city.toLowerCase().includes(query) ||
          lead.fullAddress.toLowerCase().includes(query) ||
          lead.phone1.includes(query) ||
          lead.email1.toLowerCase().includes(query)
      );
    }

    // Sort by newest first
    return filtered.sort(
      (a, b) => b.createdDate.getTime() - a.createdDate.getTime()
    );
  },

  clearError: () => set({ error: null }),
}));

// ============================================================================
// TEMPLATES STORE
// ============================================================================

interface TemplatesState {
  templates: Template[];
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  fetchTemplates: (permitType?: PermitType, category?: string) => Promise<void>;
  subscribeToTemplates: (permitType?: PermitType, category?: string) => void;
  unsubscribeFromTemplates: () => void;
  addTemplate: (template: Omit<Template, 'id'>) => Promise<string>;
  updateTemplate: (templateId: string, updates: Partial<Template>) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  setTemplates: (templates: Template[]) => void;
  clearError: () => void;
}

export const useTemplatesStore = create<TemplatesState>((set, get) => ({
  templates: [],
  isLoading: false,
  error: null,
  unsubscribe: null,

  fetchTemplates: async (permitType?: PermitType, category?: string) => {
    set({ isLoading: true, error: null });

    try {
      const templatesRef = collection(getFirestore(), 'templates');
      let constraints: any[] = [where('isActive', '==', true)];

      if (permitType) {
        constraints.push(where('permitType', '==', permitType));
      }

      if (category) {
        constraints.push(where('category', '==', category));
      }

      constraints.push(orderBy('createdAt', 'desc'));

      const q = query(templatesRef, ...constraints);
      const snapshot = await getDocs(q);

      const templates = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
          lastUsedAt: data.lastUsedAt instanceof Timestamp ? data.lastUsedAt.toDate() : null,
        };
      }) as Template[];

      set({ templates, isLoading: false });
    } catch (error: any) {
      console.error('Fetch templates error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch templates',
      });
    }
  },

  subscribeToTemplates: (permitType?: PermitType, category?: string) => {
    // Unsubscribe from previous listener
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
    }

    set({ isLoading: true, error: null });

    const templatesRef = collection(getFirestore(), 'templates');
    let constraints: any[] = [where('isActive', '==', true)];

    if (permitType) {
      constraints.push(where('permitType', '==', permitType));
    }

    if (category) {
      constraints.push(where('category', '==', category));
    }

    constraints.push(orderBy('createdAt', 'desc'));

    const q = query(templatesRef, ...constraints);

    const newUnsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const templates = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
            lastUsedAt: data.lastUsedAt instanceof Timestamp ? data.lastUsedAt.toDate() : null,
          };
        }) as Template[];

        set({ templates, isLoading: false });
      },
      (error) => {
        console.error('Subscribe to templates error:', error);
        set({
          isLoading: false,
          error: error.message || 'Failed to subscribe to templates',
        });
      }
    );

    set({ unsubscribe: newUnsubscribe });
  },

  unsubscribeFromTemplates: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },

  addTemplate: async (template: Omit<Template, 'id'>) => {
    set({ isLoading: true, error: null });

    try {
      const templatesRef = collection(getFirestore(), 'templates');
      const docRef = await addDoc(templatesRef, {
        ...template,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      set({ isLoading: false });
      return docRef.id;
    } catch (error: any) {
      console.error('Add template error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to add template',
      });
      throw error;
    }
  },

  updateTemplate: async (templateId: string, updates: Partial<Template>) => {
    set({ isLoading: true, error: null });

    try {
      const templateRef = doc(getFirestore(), 'templates', templateId);
      await updateDoc(templateRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      set({ isLoading: false });
    } catch (error: any) {
      console.error('Update template error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to update template',
      });
      throw error;
    }
  },

  deleteTemplate: async (templateId: string) => {
    set({ isLoading: true, error: null });

    try {
      // Soft delete - just set isActive to false
      const templateRef = doc(getFirestore(), 'templates', templateId);
      await updateDoc(templateRef, {
        isActive: false,
        updatedAt: serverTimestamp(),
      });

      set({ isLoading: false });
    } catch (error: any) {
      console.error('Delete template error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to delete template',
      });
      throw error;
    }
  },

  setTemplates: (templates: Template[]) => set({ templates }),

  clearError: () => set({ error: null }),
}));

// ============================================================================
// NOTIFICATIONS STORE
// ============================================================================

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  fetchNotifications: (userId: string) => Promise<void>;
  subscribeToNotifications: (userId: string) => void;
  unsubscribeFromNotifications: () => void;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId?: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: (userId: string) => Promise<void>;
  setNotifications: (notifications: Notification[]) => void;
  clearError: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  unsubscribe: null,

  fetchNotifications: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const notificationsRef = collection(getFirestore(), 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        firestoreLimit(50)
      );
      const snapshot = await getDocs(q);

      const notifications = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          readAt: data.readAt instanceof Timestamp ? data.readAt.toDate() : undefined,
        };
      }) as Notification[];

      const unreadCount = notifications.filter((n) => !n.isRead).length;

      set({ notifications, unreadCount, isLoading: false });
    } catch (error: any) {
      console.error('Fetch notifications error:', error);
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch notifications',
      });
    }
  },

  subscribeToNotifications: (userId: string) => {
    // Unsubscribe from previous listener
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
    }

    set({ isLoading: true, error: null });

    const notificationsRef = collection(getFirestore(), 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      firestoreLimit(50)
    );

    const newUnsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            readAt: data.readAt instanceof Timestamp ? data.readAt.toDate() : undefined,
          };
        }) as Notification[];

        const unreadCount = notifications.filter((n) => !n.isRead).length;

        set({ notifications, unreadCount, isLoading: false });
      },
      (error) => {
        console.error('Subscribe to notifications error:', error);
        set({
          isLoading: false,
          error: error.message || 'Failed to subscribe to notifications',
        });
      }
    );

    set({ unsubscribe: newUnsubscribe });
  },

  unsubscribeFromNotifications: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      // Update local state first (for mock data)
      const { notifications } = get();
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true, readAt: notification.readAt || new Date() }
          : notification
      );
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      set({ notifications: updatedNotifications, unreadCount });

      // Also update Firestore (will fail silently for mock data)
      try {
        const notificationRef = doc(getFirestore(), 'notifications', notificationId);
        await updateDoc(notificationRef, {
          isRead: true,
          readAt: serverTimestamp(),
        });
      } catch (firestoreError) {
        // Ignore Firestore errors when using mock data
        console.log('Firestore update skipped (using mock data)');
      }
    } catch (error: any) {
      console.error('Mark as read error:', error);
      set({ error: error.message || 'Failed to mark notification as read' });
      throw error;
    }
  },

  markAllAsRead: async (userId?: string) => {
    try {
      // Update local state first (for mock data)
      const { notifications } = get();
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt || new Date(),
      }));
      set({ notifications: updatedNotifications, unreadCount: 0 });

      // If userId provided, also update Firestore
      if (userId) {
        const notificationsRef = collection(getFirestore(), 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', userId),
          where('isRead', '==', false)
        );
        const snapshot = await getDocs(q);

        const batch = writeBatch(getFirestore());

        snapshot.docs.forEach((docSnap) => {
          batch.update(docSnap.ref, {
            isRead: true,
            readAt: serverTimestamp(),
          });
        });

        await batch.commit();
      }
    } catch (error: any) {
      console.error('Mark all as read error:', error);
      set({ error: error.message || 'Failed to mark all as read' });
      throw error;
    }
  },

  deleteNotification: async (notificationId: string) => {
    try {
      // Update local state first (for mock data)
      const { notifications } = get();
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      set({ notifications: updatedNotifications, unreadCount });

      // Also update Firestore (will fail silently for mock data)
      try {
        const notificationRef = doc(getFirestore(), 'notifications', notificationId);
        await deleteDoc(notificationRef);
      } catch (firestoreError) {
        // Ignore Firestore errors when using mock data
        console.log('Firestore delete skipped (using mock data)');
      }
    } catch (error: any) {
      console.error('Delete notification error:', error);
      set({ error: error.message || 'Failed to delete notification' });
      throw error;
    }
  },

  clearAll: async (userId: string) => {
    try {
      const notificationsRef = collection(getFirestore(), 'notifications');
      const q = query(notificationsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      const batch = writeBatch(getFirestore());

      snapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });

      await batch.commit();
    } catch (error: any) {
      console.error('Clear all notifications error:', error);
      set({ error: error.message || 'Failed to clear all notifications' });
      throw error;
    }
  },

  setNotifications: (notifications: Notification[]) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    set({ notifications, unreadCount });
  },

  clearError: () => set({ error: null }),
}));

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Check if user has specific permission
 */
export const usePermission = (permitType: PermitType, permission: keyof import('../types').Permission) => {
  const user = useAuthStore((state) => state.user);

  if (!user) return false;

  return user.permissions[permitType][permission];
};

/**
 * Check if user has role
 */
export const useRole = (requiredRole: 'master' | 'admin' | 'manager' | 'user') => {
  const user = useAuthStore((state) => state.user);

  if (!user) return false;

  const roleHierarchy = { user: 0, manager: 1, admin: 2, master: 3 };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
};

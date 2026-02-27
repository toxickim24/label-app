/**
 * Notifications Service - Firestore Operations
 * Handles all notification-related Firestore operations
 */

import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { Notification } from '../types';
import { firestore } from '../../index';

function getFirestore() {
  if (!firestore) {
    console.error('❌ Firestore instance is undefined in notificationsService!');
    throw new Error('Firestore not initialized');
  }
  return firestore;
}

/**
 * Subscribe to real-time notifications updates for a specific user
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
): () => void {
  console.log('📡 Subscribing to notifications for user:', userId);

  const db = getFirestore();
  const notificationsRef = collection(db, 'notifications');

  // Query with where filter only (orderBy will be done in memory)
  const q = query(
    notificationsRef,
    where('userId', '==', userId)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        readAt: doc.data().readAt?.toDate() || null,
      })) as Notification[];

      // Sort by createdAt descending (newest first) in memory
      notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      console.log(`✅ Loaded ${notifications.length} notifications from Firestore`);
      callback(notifications);
    },
    (error) => {
      console.error('❌ Error loading notifications:', error);
      callback([]);
    }
  );

  return unsubscribe;
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    const db = getFirestore();
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
      readAt: new Date(),
    });
    console.log('✅ Notification marked as read:', notificationId);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark a notification as unread
 */
export async function markNotificationAsUnread(notificationId: string): Promise<void> {
  try {
    const db = getFirestore();
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: false,
      readAt: null,
    });
    console.log('✅ Notification marked as unread:', notificationId);
  } catch (error) {
    console.error('Error marking notification as unread:', error);
    throw error;
  }
}

/**
 * Toggle notification read/unread status
 */
export async function toggleNotificationReadStatus(notificationId: string, currentIsRead: boolean): Promise<void> {
  if (currentIsRead) {
    await markNotificationAsUnread(notificationId);
  } else {
    await markNotificationAsRead(notificationId);
  }
}

/**
 * Mark all notifications as read for a specific user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const db = getFirestore();
    const notificationsRef = collection(db, 'notifications');
    const q = query(notificationsRef, where('userId', '==', userId), where('isRead', '==', false));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('No unread notifications to mark');
      return;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnapshot) => {
      batch.update(docSnapshot.ref, {
        isRead: true,
        readAt: new Date(),
      });
    });

    await batch.commit();
    console.log(`✅ Marked ${snapshot.size} notifications as read`);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    const db = getFirestore();
    await deleteDoc(doc(db, 'notifications', notificationId));
    console.log('✅ Notification deleted:', notificationId);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

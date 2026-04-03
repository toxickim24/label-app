/**
 * Notification Service
 * Handles push notifications and local notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Lead } from '../types';
import { filterStaleLeads } from '../utils/leadUtils';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push notification permissions');
    return false;
  }

  return true;
}

/**
 * Get Expo push token for FCM
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id', // Replace with actual Expo project ID
    });

    console.log('Expo Push Token:', token.data);
    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Schedule daily lead notification at 8 AM
 */
export async function scheduleDailyLeadNotification(): Promise<void> {
  try {
    // Cancel existing daily notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule notification for 8 AM daily
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📋 New Leads Available',
        body: 'Check out your fresh leads for today!',
        data: { type: 'daily_leads' },
        sound: true,
      },
      trigger: {
        hour: 8,
        minute: 0,
        repeats: true,
      },
    });

    console.log('✅ Daily notification scheduled for 8 AM');
  } catch (error) {
    console.error('Error scheduling daily notification:', error);
  }
}

/**
 * Send immediate notification for stale leads
 */
export async function sendStaleLeadNotification(staleCount: number): Promise<void> {
  try {
    if (staleCount === 0) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Leads Need Attention',
        body: `You have ${staleCount} lead${staleCount > 1 ? 's' : ''} that haven't been contacted in 48+ hours`,
        data: { type: 'stale_leads', count: staleCount },
        sound: true,
      },
      trigger: null, // Send immediately
    });

    console.log(`✅ Sent stale lead notification (${staleCount} leads)`);
  } catch (error) {
    console.error('Error sending stale lead notification:', error);
  }
}

/**
 * Check for stale leads and send notification if needed
 */
export async function checkAndNotifyStaleLeads(leads: Lead[]): Promise<void> {
  const staleLeads = filterStaleLeads(leads);

  if (staleLeads.length > 0) {
    await sendStaleLeadNotification(staleLeads.length);
  }
}

/**
 * Send notification for new leads
 */
export async function sendNewLeadsNotification(count: number): Promise<void> {
  try {
    if (count === 0) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 New Leads Available!',
        body: `${count} new lead${count > 1 ? 's have' : ' has'} been added to your pipeline`,
        data: { type: 'new_leads', count },
        sound: true,
      },
      trigger: null, // Send immediately
    });

    console.log(`✅ Sent new leads notification (${count} leads)`);
  } catch (error) {
    console.error('Error sending new leads notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ Cancelled all scheduled notifications');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
}

/**
 * Get notification badge count
 */
export async function getBadgeCount(): Promise<number> {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
}

/**
 * Set notification badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
}

/**
 * Clear notification badge
 */
export async function clearBadge(): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Error clearing badge:', error);
  }
}

/**
 * Add notification response listener
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Add notification received listener
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

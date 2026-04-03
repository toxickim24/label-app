/**
 * useNotifications Hook
 * Manages notification setup and listeners
 */

import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermissions,
  scheduleDailyLeadNotification,
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from '../services/notificationService';
import { useAuthStore } from '../store';

export function useNotifications() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Request permissions and setup notifications
    const setupNotifications = async () => {
      if (!user) return;

      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        console.log('Notification permissions not granted');
        return;
      }

      // Check if user has daily notifications enabled
      const preferences = user.notificationPreferences || {
        enabled: true,
        dailyLeadNotification: true,
        staleLeadReminders: true,
        newLeadAlerts: true,
        notificationTime: '08:00',
      };

      if (preferences.enabled && preferences.dailyLeadNotification) {
        await scheduleDailyLeadNotification();
      }
    };

    setupNotifications();

    // Setup notification listeners
    notificationListener.current = addNotificationReceivedListener((notification) => {
      console.log('📬 Notification received:', notification);
      // Handle received notification (when app is in foreground)
    });

    responseListener.current = addNotificationResponseListener((response) => {
      console.log('📬 Notification response:', response);
      const data = response.notification.request.content.data;

      // Navigate based on notification type
      if (data.type === 'daily_leads' || data.type === 'stale_leads') {
        // @ts-ignore - Navigation typing
        navigation.navigate('Dashboard');
      }
    });

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user, navigation]);

  return {
    // Could expose notification methods here if needed
  };
}

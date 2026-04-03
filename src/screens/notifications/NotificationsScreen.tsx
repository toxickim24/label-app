/**
 * Notifications Screen
 * View and manage notifications
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Platform } from 'react-native';
import { Text, Card, IconButton, useTheme, Button, Surface } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNotificationsStore, useAuthStore } from '../../store';
import { Notification } from '../../types';
import { spacing, shadows, borderRadius, darkTheme, lightTheme } from '../../theme';
import WebContainer from '../../components/WebContainer';
import EmptyState from '../../components/EmptyState';
import { formatRelativeTime } from '../../utils/formatRelativeTime';
import {
  subscribeToNotifications,
  toggleNotificationReadStatus,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationService,
} from '../../services/notificationsService';

export default function NotificationsScreen() {
  const theme = useTheme();
  const currentTheme = theme.dark ? darkTheme : lightTheme;
  const { notifications, setNotifications } = useNotificationsStore();
  const user = useAuthStore((state) => state.user);

  // Subscribe to Firestore notifications in real-time
  useEffect(() => {
    if (!user?.uid) {
      console.log('⚠️ No user logged in, skipping notifications subscription');
      return;
    }

    console.log('📡 Setting up notifications Firestore subscription for user:', user.uid);
    const unsubscribe = subscribeToNotifications(user.uid, (fetchedNotifications) => {
      console.log(`✅ Received ${fetchedNotifications.length} notifications from Firestore`);
      setNotifications(fetchedNotifications);
    });

    return () => {
      console.log('🔌 Cleaning up notifications Firestore subscription');
      unsubscribe();
    };
  }, [user?.uid, setNotifications]);

  const handleToggleReadStatus = async (notificationId: string, currentIsRead: boolean) => {
    try {
      await toggleNotificationReadStatus(notificationId, currentIsRead);
    } catch (error) {
      console.error('Failed to toggle notification status:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationService(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;

    try {
      await markAllNotificationsAsRead(user.uid);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <Surface
      style={[
        styles.card,
        {
          backgroundColor: !item.isRead
            ? currentTheme.primary + '10'
            : currentTheme.surface,
          borderColor: currentTheme.border,
        },
        shadows.sm,
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {!item.isRead && (
              <Icon name="circle" size={8} color={currentTheme.primary} style={styles.unreadDot} />
            )}
            <Text style={{ flex: 1, fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: currentTheme.text }}>
              {item.title}
            </Text>
          </View>
          <IconButton
            icon="close"
            size={18}
            onPress={() => handleDeleteNotification(item.id)}
          />
        </View>

        <Text style={[styles.body, { color: currentTheme.textSecondary }]}>
          {item.body}
        </Text>

        <View style={styles.footer}>
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: currentTheme.textSecondary }}>
            {formatRelativeTime(item.createdAt)}
          </Text>
          <Button
            mode="text"
            compact
            onPress={() => handleToggleReadStatus(item.id, item.isRead)}
          >
            {item.isRead ? 'Mark unread' : 'Mark read'}
          </Button>
        </View>
      </View>
    </Surface>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <WebContainer noPadding>
        <View style={styles.headerContainer}>
          <Text style={{ fontFamily: 'DMSans_700Bold', fontSize: 24, color: currentTheme.text }}>Notifications</Text>
          {notifications.some((n) => !n.isRead) && (
            <Button mode="text" onPress={handleMarkAllAsRead}>
              Mark all read
            </Button>
          )}
        </View>

        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="bell-outline"
              title="No notifications"
              description="You're all caught up! We'll notify you when something important happens."
            />
          }
        />
      </WebContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  card: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      web: {
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      },
    }),
  },
  cardContent: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unreadDot: {
    marginRight: spacing.xs,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    lineHeight: 20,
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});

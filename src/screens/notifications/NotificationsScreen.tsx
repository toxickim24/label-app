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
import { spacing, shadows, borderRadius } from '../../theme';
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
            ? theme.colors.primaryContainer
            : theme.colors.surface,
        },
        shadows.sm,
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {!item.isRead && (
              <Icon name="circle" size={8} color={theme.colors.primary} style={styles.unreadDot} />
            )}
            <Text variant="titleMedium" style={{ flex: 1, color: theme.colors.onSurface }}>
              {item.title}
            </Text>
          </View>
          <IconButton
            icon="close"
            size={20}
            onPress={() => handleDeleteNotification(item.id)}
          />
        </View>

        <Text variant="bodyMedium" style={[styles.body, { color: theme.colors.onSurfaceVariant }]}>
          {item.body}
        </Text>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
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
      <WebContainer>
        <View style={styles.headerContainer}>
          <Text variant="headlineSmall">Notifications</Text>
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
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  list: {
    padding: spacing.xl,
    paddingTop: 0,
  },
  card: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
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
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unreadDot: {
    marginRight: spacing.sm,
  },
  body: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});

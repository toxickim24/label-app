/**
 * Notifications Screen
 * View and manage notifications
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, IconButton, useTheme, Button } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNotificationsStore, useAuthStore } from '../../store';
import { Notification } from '../../types';
import { spacing } from '../../theme';
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
    <Card
      style={[
        styles.card,
        !item.isRead && { backgroundColor: theme.colors.primaryContainer },
      ]}
      mode="elevated"
      onPress={() => handleToggleReadStatus(item.id, item.isRead)}
    >
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {!item.isRead && (
              <Icon name="circle" size={8} color={theme.colors.primary} style={styles.unreadDot} />
            )}
            <Text variant="titleMedium" style={{ flex: 1 }}>
              {item.title}
            </Text>
          </View>
          <IconButton
            icon="close"
            size={20}
            onPress={() => handleDeleteNotification(item.id)}
          />
        </View>

        <Text variant="bodyMedium" style={styles.body}>
          {item.body}
        </Text>

        <Text variant="bodySmall" style={{ color: theme.colors.secondary, marginTop: spacing.sm }}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          <View style={styles.emptyContainer}>
            <Icon name="bell-outline" size={64} color={theme.colors.secondary} />
            <Text variant="titleMedium" style={{ color: theme.colors.secondary, marginTop: spacing.md }}>
              No notifications
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.secondary, marginTop: spacing.sm }}>
              You're all caught up!
            </Text>
          </View>
        }
      />
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
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  list: {
    padding: spacing.md,
    paddingTop: 0,
  },
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    marginTop: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    marginTop: spacing.xxl,
  },
});

/**
 * Main Tab Navigator
 * Bottom tabs for authenticated users
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import DashboardStack from './DashboardStack';
import TemplatesScreen from '../screens/templates/TemplatesScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SettingsStack from './SettingsStack';

import { useNotificationsStore } from '../store';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const theme = useTheme();
  const unreadCount = useNotificationsStore((state) => state.unreadCount);

  console.log('📱 MainTabs rendering...');
  console.log('📱 Theme:', theme);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="view-dashboard" size={size} color={color} />
          ),
          title: 'Dashboard',
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="Templates"
        component={TemplatesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-document-multiple" size={size} color={color} />
          ),
          title: 'Templates',
        }}
      />

      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="bell" size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          title: 'Notifications',
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="cog" size={size} color={color} />
          ),
          title: 'Settings',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

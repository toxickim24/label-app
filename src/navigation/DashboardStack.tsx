/**
 * Dashboard Stack Navigator
 * Handles navigation within the Dashboard tab
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import LeadDetailScreen from '../screens/dashboard/LeadDetailScreen';
import { DashboardStackParamList } from '../types';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export default function DashboardStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen
        name="DashboardHome"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
        }}
      />
      <Stack.Screen
        name="LeadDetail"
        component={LeadDetailScreen}
        options={{
          title: 'Lead Details',
        }}
      />
    </Stack.Navigator>
  );
}

/**
 * Settings Stack Navigator
 * Settings screen with nested screens for Terms and Privacy
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';

import SettingsScreen from '../screens/settings/SettingsScreen';
import TermsScreen from '../screens/settings/TermsScreen';
import PrivacyPolicyScreen from '../screens/settings/PrivacyPolicyScreen';

const Stack = createNativeStackNavigator();

export default function SettingsStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
      />
      <Stack.Screen
        name="Terms"
        component={TermsScreen}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
      />
    </Stack.Navigator>
  );
}

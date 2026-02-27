/**
 * Reset Password Screen
 * Password recovery
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { spacing } from '../../theme';

export default function ResetPasswordScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium">Reset Password</Text>
      <Text variant="bodyMedium" style={{ marginTop: spacing.md, color: theme.colors.secondary }}>
        Password reset screen - To be implemented
      </Text>
      <Button mode="outlined" style={{ marginTop: spacing.lg }} onPress={() => console.log('Back')}>
        Back to Login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
});

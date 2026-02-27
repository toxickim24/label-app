/**
 * Login Screen
 * User authentication
 */

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import Logo from '../../components/Logo';
import { useAuthStore } from '../../store';
import { spacing } from '../../theme';

export default function LoginScreen() {
  const theme = useTheme();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setError('');
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Logo size={100} variant="favicon" />
        </View>
        <Text variant="displaySmall" style={styles.title}>
          Label
        </Text>
        <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.secondary }]}>
          Manage leads. Close deals.
        </Text>

        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            mode="outlined"
            style={styles.input}
            error={!!error}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            mode="outlined"
            style={styles.input}
            error={!!error}
          />

          {error ? (
            <Text variant="bodySmall" style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
          >
            Login
          </Button>

          <Button mode="text" onPress={() => console.log('Forgot password')}>
            Forgot Password?
          </Button>
        </View>

        <Text variant="bodySmall" style={[styles.info, { color: theme.colors.secondary }]}>
          Powered by Firebase Authentication
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  form: {
    marginTop: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  error: {
    color: 'red',
    marginBottom: spacing.md,
  },
  info: {
    textAlign: 'center',
    marginTop: spacing.xxl,
    fontStyle: 'italic',
  },
});

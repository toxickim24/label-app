/**
 * Login Screen
 * User authentication
 */

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, Surface, Divider } from 'react-native-paper';
import Logo from '../../components/Logo';
import { useAuthStore } from '../../store';
import { spacing, borderRadius, shadows, typography } from '../../theme';
import WebContainer from '../../components/WebContainer';
import { useResponsive } from '../../hooks/useResponsive';

export default function LoginScreen() {
  const theme = useTheme();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const { isMobile } = useResponsive();

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
      style={[
        styles.container,
        {
          backgroundColor: theme.dark
            ? theme.colors.background
            : '#F8F9FA',
        },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <WebContainer maxWidth="sm">
          <View style={[styles.centerContainer, { paddingHorizontal: isMobile ? spacing.lg : spacing.xl }]}>
            <Surface
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  padding: isMobile ? spacing.xl : spacing.xxxl,
                },
                shadows.md,
              ]}
            >
              {/* Logo & Branding */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Logo size={64} variant="favicon" />
                </View>
                <Text
                  variant="headlineMedium"
                  style={[
                    styles.title,
                    {
                      color: theme.colors.onSurface,
                      ...typography.h1,
                    },
                  ]}
                >
                  Welcome to Label
                </Text>
                <Text
                  variant="bodyMedium"
                  style={[
                    styles.subtitle,
                    {
                      color: theme.colors.onSurfaceVariant,
                    },
                  ]}
                >
                  Manage leads efficiently and close more deals
                </Text>
              </View>

              <Divider style={styles.divider} />

              {/* Form */}
              <View style={styles.form}>
                <TextInput
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  mode="outlined"
                  style={styles.input}
                  error={!!error}
                  left={<TextInput.Icon icon="email-outline" />}
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
                  left={<TextInput.Icon icon="lock-outline" />}
                />

                {error ? (
                  <View style={styles.errorContainer}>
                    <Text
                      variant="bodySmall"
                      style={[styles.error, { color: theme.colors.error }]}
                    >
                      {error}
                    </Text>
                  </View>
                ) : null}

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading || !email || !password}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                >
                  Sign In
                </Button>

                <Button
                  mode="text"
                  onPress={() => console.log('Forgot password')}
                  style={styles.forgotButton}
                >
                  Forgot Password?
                </Button>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text
                  variant="bodySmall"
                  style={[
                    styles.footerText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Secured by Firebase Authentication
                </Text>
              </View>
            </Surface>
          </View>
        </WebContainer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xxxxl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: borderRadius.xl,
    ...Platform.select({
      web: {
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    marginVertical: spacing.xl,
  },
  form: {
    marginBottom: spacing.xl,
  },
  input: {
    marginBottom: spacing.lg,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  error: {
    textAlign: 'center',
    fontWeight: '500',
  },
  button: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  buttonContent: {
    height: 48,
    paddingHorizontal: spacing.xl,
  },
  forgotButton: {
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  footerText: {
    fontSize: 12,
  },
});

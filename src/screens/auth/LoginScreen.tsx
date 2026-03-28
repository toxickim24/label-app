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
    minHeight: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 460,                     // Slightly wider
    borderRadius: borderRadius.xxl,    // More rounded (need to add to theme)
    ...Platform.select({
      web: {
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,         // More space
  },
  logoContainer: {
    marginBottom: spacing.xl,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(0, 122, 255, 0.06)',
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: spacing.md,
    fontSize: 32,
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
    opacity: 0.8,
  },
  divider: {
    marginVertical: spacing.xxl,       // More space
  },
  form: {
    marginBottom: spacing.xl,
    gap: spacing.lg,                   // Add gap between inputs
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: 'transparent',     // Transparent background for cleaner look
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.10)',
    borderRadius: borderRadius.lg,     // More rounded
    padding: spacing.lg,               // More padding
    marginBottom: spacing.lg,
    borderLeftWidth: 4,                // Accent border
    borderLeftColor: '#FF3B30',
  },
  error: {
    textAlign: 'center',
    fontWeight: '600',                 // Slightly bolder
    fontSize: 14,
  },
  button: {
    marginTop: spacing.lg,             // More space
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,     // More rounded
    elevation: 0,                       // Remove shadow for cleaner look
  },
  buttonContent: {
    height: 52,                         // Taller for better touch target
    paddingHorizontal: spacing.xxl,
  },
  forgotButton: {
    marginTop: spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.xl,            // More space
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  footerText: {
    fontSize: 13,
    opacity: 0.6,
    lineHeight: 18,
  },
});

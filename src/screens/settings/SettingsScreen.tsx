/**
 * Settings Screen
 * User preferences and account settings
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Text, List, Button, Divider, useTheme, Avatar, Appbar } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuthStore, useThemeStore } from '../../store';
import { spacing, borderRadius, shadows } from '../../theme';
import WebContainer from '../../components/WebContainer';
import { useResponsive } from '../../hooks/useResponsive';

export default function SettingsScreen({ navigation }: any) {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const { user, logout } = useAuthStore();
  const { mode, setTheme } = useThemeStore();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // Use native browser confirm for web
      if (window.confirm('Are you sure you want to logout?')) {
        logout();
      }
    } else {
      // Use Alert.alert for mobile platforms
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              await logout();
            },
          },
        ]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <ScrollView>
        <WebContainer>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Avatar.Text
              size={80}
              label={user?.displayName?.charAt(0) || 'U'}
              style={{ backgroundColor: theme.colors.primary }}
            />
            <Text variant="titleLarge" style={styles.displayName}>
              {user?.displayName || 'User'}
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
              {user?.email}
            </Text>
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.primary,
                marginTop: spacing.xs,
                textTransform: 'uppercase',
                fontWeight: '600',
              }}
            >
              {user?.role}
            </Text>
          </View>

          <Divider />

          {/* Theme Section */}
          <List.Section>
            <List.Subheader style={{ fontWeight: '700', fontSize: 13, letterSpacing: 0.5 }}>
              APPEARANCE
            </List.Subheader>

            <View style={styles.themeContainer}>
              <View style={[styles.themeOption, mode === 'light' && styles.themeOptionActive, { borderColor: theme.colors.outline }]}>
                <TouchableOpacity
                  style={styles.themeButton}
                  onPress={() => setTheme('light')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.themeIconContainer, mode === 'light' && { backgroundColor: theme.colors.primary }]}>
                    <Icon name="white-balance-sunny" size={24} color={mode === 'light' ? '#fff' : theme.colors.onSurfaceVariant} />
                  </View>
                  <Text
                    variant="titleSmall"
                    style={[
                      styles.themeLabel,
                      { color: mode === 'light' ? theme.colors.primary : theme.colors.onSurface }
                    ]}
                  >
                    Light
                  </Text>
                  {mode === 'light' && (
                    <Icon name="check-circle" size={20} color={theme.colors.primary} style={styles.themeCheck} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={[styles.themeOption, mode === 'dark' && styles.themeOptionActive, { borderColor: theme.colors.outline }]}>
                <TouchableOpacity
                  style={styles.themeButton}
                  onPress={() => setTheme('dark')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.themeIconContainer, mode === 'dark' && { backgroundColor: theme.colors.primary }]}>
                    <Icon name="moon-waning-crescent" size={24} color={mode === 'dark' ? '#fff' : theme.colors.onSurfaceVariant} />
                  </View>
                  <Text
                    variant="titleSmall"
                    style={[
                      styles.themeLabel,
                      { color: mode === 'dark' ? theme.colors.primary : theme.colors.onSurface }
                    ]}
                  >
                    Dark
                  </Text>
                  {mode === 'dark' && (
                    <Icon name="check-circle" size={20} color={theme.colors.primary} style={styles.themeCheck} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={[styles.themeOption, mode === 'system' && styles.themeOptionActive, { borderColor: theme.colors.outline }]}>
                <TouchableOpacity
                  style={styles.themeButton}
                  onPress={() => setTheme('system')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.themeIconContainer, mode === 'system' && { backgroundColor: theme.colors.primary }]}>
                    <Icon name="brightness-auto" size={24} color={mode === 'system' ? '#fff' : theme.colors.onSurfaceVariant} />
                  </View>
                  <Text
                    variant="titleSmall"
                    style={[
                      styles.themeLabel,
                      { color: mode === 'system' ? theme.colors.primary : theme.colors.onSurface }
                    ]}
                  >
                    Auto
                  </Text>
                  {mode === 'system' && (
                    <Icon name="check-circle" size={20} color={theme.colors.primary} style={styles.themeCheck} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {mode === 'system' && (
              <Text variant="bodySmall" style={{ marginHorizontal: spacing.lg, marginTop: spacing.sm, color: theme.colors.onSurfaceVariant }}>
                Follows your device's system theme settings
              </Text>
            )}
          </List.Section>

          <Divider />

          {/* About Section */}
          <List.Section>
            <List.Subheader>About</List.Subheader>

            <List.Item
              title="App Version"
              description="1.0.0"
              left={(props) => <List.Icon {...props} icon="information" />}
            />

            <List.Item
              title="Terms & Conditions"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('Terms')}
            />

            <List.Item
              title="Privacy Policy"
              left={(props) => <List.Icon {...props} icon="shield-check" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            />

            <List.Item
              title="Contact Support"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => console.log('Contact Support')}
            />
          </List.Section>

          <Divider />

          {/* Account Section */}
          <View style={styles.accountSection}>
            <Button
              mode="outlined"
              onPress={handleLogout}
              icon="logout"
              style={styles.logoutButton}
            >
              Logout
            </Button>
          </View>

          <View style={styles.footer}>
            <Text variant="bodySmall" style={{ color: theme.colors.secondary, textAlign: 'center' }}>
              Label App{'\n'}
              Manage leads. Close deals.
            </Text>
          </View>
        </WebContainer>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    padding: spacing.xxxl,
    paddingBottom: spacing.xxl,
  },
  displayName: {
    marginTop: spacing.lg,
    fontWeight: '700',
    fontSize: 20,
  },
  themeContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  themeOption: {
    flex: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
    }),
  },
  themeOptionActive: {
    ...shadows.md,
  },
  themeButton: {
    alignItems: 'center',
    padding: spacing.lg,
    paddingVertical: spacing.xl,
    position: 'relative',
  },
  themeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: spacing.md,
  },
  themeLabel: {
    fontWeight: '700',
    fontSize: 15,
    textAlign: 'center',
  },
  themeCheck: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  accountSection: {
    padding: spacing.xl,
  },
  logoutButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
  },
  footer: {
    padding: spacing.xxxl,
    paddingTop: spacing.lg,
  },
});

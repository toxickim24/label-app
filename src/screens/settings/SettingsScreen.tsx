/**
 * Settings Screen
 * User preferences and account settings
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import { Text, List, Button, Divider, useTheme, Avatar, Appbar } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuthStore, useThemeStore } from '../../store';
import { spacing, borderRadius, shadows, darkTheme, lightTheme } from '../../theme';
import WebContainer from '../../components/WebContainer';
import { useResponsive } from '../../hooks/useResponsive';

export default function SettingsScreen({ navigation }: any) {
  const theme = useTheme();
  const currentTheme = theme.dark ? darkTheme : lightTheme;
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
              size={64}
              label={user?.displayName?.charAt(0) || 'U'}
              style={{ backgroundColor: currentTheme.primary }}
            />
            <Text style={[styles.displayName, { color: currentTheme.text }]}>
              {user?.displayName || 'User'}
            </Text>
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: currentTheme.textSecondary }}>
              {user?.email}
            </Text>
            <Text
              style={{
                fontFamily: 'DMSans_700Bold',
                fontSize: 11,
                color: currentTheme.primary,
                marginTop: spacing.xs,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {user?.role}
            </Text>
          </View>

          <Divider />

          {/* Theme Section */}
          <List.Section>
            <List.Subheader style={{ fontFamily: 'DMSans_700Bold', fontSize: 11, letterSpacing: 0.8, color: currentTheme.textSecondary }}>
              APPEARANCE
            </List.Subheader>

            <View style={styles.themeContainer}>
              <View style={[styles.themeOption, mode === 'light' && styles.themeOptionActive, { borderColor: mode === 'light' ? currentTheme.primary : currentTheme.border }]}>
                <TouchableOpacity
                  style={styles.themeButton}
                  onPress={() => setTheme('light')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.themeIconContainer, mode === 'light' && { backgroundColor: currentTheme.primary }]}>
                    <Icon name="white-balance-sunny" size={20} color={mode === 'light' ? '#fff' : currentTheme.textSecondary} />
                  </View>
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: mode === 'light' ? currentTheme.primary : currentTheme.text }
                    ]}
                  >
                    Light
                  </Text>
                  {mode === 'light' && (
                    <Icon name="check-circle" size={16} color={currentTheme.primary} style={styles.themeCheck} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={[styles.themeOption, mode === 'dark' && styles.themeOptionActive, { borderColor: mode === 'dark' ? currentTheme.primary : currentTheme.border }]}>
                <TouchableOpacity
                  style={styles.themeButton}
                  onPress={() => setTheme('dark')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.themeIconContainer, mode === 'dark' && { backgroundColor: currentTheme.primary }]}>
                    <Icon name="moon-waning-crescent" size={20} color={mode === 'dark' ? '#fff' : currentTheme.textSecondary} />
                  </View>
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: mode === 'dark' ? currentTheme.primary : currentTheme.text }
                    ]}
                  >
                    Dark
                  </Text>
                  {mode === 'dark' && (
                    <Icon name="check-circle" size={16} color={currentTheme.primary} style={styles.themeCheck} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={[styles.themeOption, mode === 'system' && styles.themeOptionActive, { borderColor: mode === 'system' ? currentTheme.primary : currentTheme.border }]}>
                <TouchableOpacity
                  style={styles.themeButton}
                  onPress={() => setTheme('system')}
                  activeOpacity={0.7}
                >
                  <View style={[styles.themeIconContainer, mode === 'system' && { backgroundColor: currentTheme.primary }]}>
                    <Icon name="brightness-auto" size={20} color={mode === 'system' ? '#fff' : currentTheme.textSecondary} />
                  </View>
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: mode === 'system' ? currentTheme.primary : currentTheme.text }
                    ]}
                  >
                    Auto
                  </Text>
                  {mode === 'system' && (
                    <Icon name="check-circle" size={16} color={currentTheme.primary} style={styles.themeCheck} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {mode === 'system' && (
              <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, marginHorizontal: spacing.md, marginTop: spacing.xs, color: currentTheme.textSecondary }}>
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
            <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 11, color: currentTheme.textSecondary, textAlign: 'center' }}>
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
    padding: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  displayName: {
    fontFamily: 'DMSans_700Bold',
    marginTop: spacing.md,
    fontSize: 18,
  },
  themeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  themeOption: {
    flex: 1,
    borderRadius: borderRadius.md,
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
    ...shadows.sm,
  },
  themeButton: {
    alignItems: 'center',
    padding: spacing.md,
    paddingVertical: spacing.lg,
    position: 'relative',
  },
  themeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: spacing.sm,
  },
  themeLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    textAlign: 'center',
  },
  themeCheck: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  accountSection: {
    padding: spacing.lg,
  },
  logoutButton: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
  },
  footer: {
    padding: spacing.xl,
    paddingTop: spacing.md,
  },
});

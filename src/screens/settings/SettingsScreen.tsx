/**
 * Settings Screen
 * User preferences and account settings
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, List, Switch, Button, Divider, useTheme, Avatar, Appbar } from 'react-native-paper';
import { useAuthStore, useThemeStore } from '../../store';
import { spacing } from '../../theme';
import WebContainer from '../../components/WebContainer';

export default function SettingsScreen({ navigation }: any) {
  const theme = useTheme();
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
            <List.Subheader>Preferences</List.Subheader>

            <List.Item
              title="Light Mode"
              left={(props) => <List.Icon {...props} icon="white-balance-sunny" />}
              right={() => (
                <Switch
                  value={mode === 'light'}
                  onValueChange={() => setTheme('light')}
                />
              )}
            />

            <List.Item
              title="Dark Mode"
              left={(props) => <List.Icon {...props} icon="moon-waning-crescent" />}
              right={() => (
                <Switch
                  value={mode === 'dark'}
                  onValueChange={() => setTheme('dark')}
                />
              )}
            />

            <List.Item
              title="Auto (System)"
              description="Follow system theme"
              left={(props) => <List.Icon {...props} icon="brightness-auto" />}
              right={() => (
                <Switch
                  value={mode === 'system'}
                  onValueChange={() => setTheme('system')}
                />
              )}
            />
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
    padding: spacing.xxl,
  },
  displayName: {
    marginTop: spacing.md,
    fontWeight: '600',
  },
  accountSection: {
    padding: spacing.md,
  },
  logoutButton: {
    marginTop: spacing.md,
  },
  footer: {
    padding: spacing.xxl,
    paddingTop: spacing.md,
  },
});

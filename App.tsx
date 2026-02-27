/**
 * Label Mobile App
 * Entry Point
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';

import RootNavigator from './src/navigation/RootNavigator';
import { useThemeStore, useAuthStore } from './src/store';
import { paperLightTheme, paperDarkTheme } from './src/theme';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  const systemColorScheme = useColorScheme();
  const { mode, isDark, setIsDark } = useThemeStore();
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  // Initialize Firebase Auth listener
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Determine effective theme
  useEffect(() => {
    const effectiveIsDark = mode === 'system' ? systemColorScheme === 'dark' : mode === 'dark';
    setIsDark(effectiveIsDark);
  }, [mode, systemColorScheme, setIsDark]);

  const theme = isDark ? paperDarkTheme : paperLightTheme;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <StatusBar
              barStyle={isDark ? 'light-content' : 'dark-content'}
              backgroundColor={theme.colors.background}
            />
            <RootNavigator />
          </NavigationContainer>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

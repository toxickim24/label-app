/**
 * Label Mobile App
 * Entry Point
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold,
} from '@expo-google-fonts/dm-sans';

import RootNavigator from './src/navigation/RootNavigator';
import { useThemeStore, useAuthStore } from './src/store';
import { paperLightTheme, paperDarkTheme, darkTheme, lightTheme } from './src/theme';
import { ErrorBoundary, OfflineIndicator } from './src/components';

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

  // Load DM Sans font
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSans_800ExtraBold,
  });

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

  // Show loading screen while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }} />
    );
  }

  const currentTheme = isDark ? darkTheme : lightTheme;

  // Toast configuration with theme colors
  const toastConfig = {
    success: (props: any) => (
      <View style={{
        backgroundColor: currentTheme.surface,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: currentTheme.primary,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
      }}>
        <Text style={{ fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: currentTheme.text }}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: currentTheme.textSecondary, marginTop: 4 }}>
            {props.text2}
          </Text>
        )}
      </View>
    ),
    error: (props: any) => (
      <View style={{
        backgroundColor: currentTheme.surface,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: currentTheme.coral,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
      }}>
        <Text style={{ fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: currentTheme.text }}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: currentTheme.textSecondary, marginTop: 4 }}>
            {props.text2}
          </Text>
        )}
      </View>
    ),
    info: (props: any) => (
      <View style={{
        backgroundColor: currentTheme.surface,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: currentTheme.accent,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
      }}>
        <Text style={{ fontFamily: 'DMSans_600SemiBold', fontSize: 15, color: currentTheme.text }}>
          {props.text1}
        </Text>
        {props.text2 && (
          <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 13, color: currentTheme.textSecondary, marginTop: 4 }}>
            {props.text2}
          </Text>
        )}
      </View>
    ),
  };

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
              <PaperProvider theme={theme}>
                <NavigationContainer>
                  <StatusBar
                    barStyle={isDark ? 'light-content' : 'dark-content'}
                    backgroundColor={theme.colors.background}
                  />
                  <OfflineIndicator />
                  <RootNavigator />
                  <Toast config={toastConfig} />
                </NavigationContainer>
              </PaperProvider>
            </QueryClientProvider>
          </SafeAreaProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

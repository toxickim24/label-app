/**
 * Web Container Component
 * Provides max-width layout for web platform
 * Centers content and adds proper padding
 */

import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { layout, spacing } from '../theme';

interface WebContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  style?: ViewStyle;
  noPadding?: boolean;
}

export default function WebContainer({
  children,
  maxWidth = 'xl',
  style,
  noPadding = false,
}: WebContainerProps) {
  // Only apply max-width on web
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.content,
          {
            maxWidth: layout.maxWidth[maxWidth],
            paddingHorizontal: noPadding ? 0 : layout.containerPadding,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    flex: 1,
  },
});

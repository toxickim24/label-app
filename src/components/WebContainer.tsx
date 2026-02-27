/**
 * Web Container Component
 * Provides responsive max-width layout for web platform
 * Centers content and adds breakpoint-aware padding
 */

import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { layout, spacing } from '../theme';
import { useResponsive } from '../hooks/useResponsive';

interface WebContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full';
  style?: ViewStyle;
  noPadding?: boolean;
  fullWidthOnMobile?: boolean; // Full width on mobile, contained on larger screens
}

export default function WebContainer({
  children,
  maxWidth = 'xl',
  style,
  noPadding = false,
  fullWidthOnMobile = false,
}: WebContainerProps) {
  const { containerPadding, isMobile } = useResponsive();

  // Only apply max-width on web
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  // Calculate maxWidth value
  const maxWidthValue = maxWidth === 'full' ? '100%' : layout.maxWidth[maxWidth];

  // Apply responsive padding unless noPadding is true
  const horizontalPadding = noPadding ? 0 : fullWidthOnMobile && isMobile ? 0 : containerPadding;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.content,
          {
            maxWidth: maxWidthValue,
            paddingHorizontal: horizontalPadding,
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

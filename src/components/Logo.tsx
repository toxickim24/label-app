/**
 * Logo Component
 * Displays Label logo with theme-aware coloring
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from 'react-native-paper';

interface LogoProps {
  size?: number;
  variant?: 'favicon' | 'full';
}

export default function Logo({ size = 80, variant = 'favicon' }: LogoProps) {
  const theme = useTheme();
  const color = theme.dark ? '#FFFFFF' : '#000000';

  if (variant === 'favicon') {
    // Favicon icon (23x24 viewBox)
    const scale = size / 24;

    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg
          width={size}
          height={size}
          viewBox="0 0 23 24"
          fill="none"
        >
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.0039 2.9691L22.3947 9.91953V24.0007H0.0410156V9.91953L2.29126 8.38087V6.85725L13.0039 0V2.9691ZM5.80127 7.77535V20.7301H16.881V17.0369H9.49451V5.25L5.80127 7.77535Z"
            fill={color}
          />
        </Svg>
      </View>
    );
  }

  // Full logo version - can be implemented later
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 23 24"
        fill="none"
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.0039 2.9691L22.3947 9.91953V24.0007H0.0410156V9.91953L2.29126 8.38087V6.85725L13.0039 0V2.9691ZM5.80127 7.77535V20.7301H16.881V17.0369H9.49451V5.25L5.80127 7.77535Z"
          fill={color}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

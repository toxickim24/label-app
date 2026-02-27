import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'largeDesktop';

export interface ResponsiveValues {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  width: number;
  containerPadding: number;
  maxWidth: number;
}

// Breakpoint definitions
const BREAKPOINTS = {
  mobile: 767,
  tablet: 1023,
  desktop: 1439,
} as const;

// Container padding per breakpoint (8pt grid)
const CONTAINER_PADDING = {
  mobile: 16,
  tablet: 24,
  desktop: 32,
  largeDesktop: 40,
} as const;

// Max width per breakpoint
const MAX_WIDTH = {
  mobile: 767,
  tablet: 1023,
  desktop: 1200,
  largeDesktop: 1280,
} as const;

/**
 * Get the current breakpoint based on window width
 */
const getBreakpoint = (width: number): Breakpoint => {
  if (width <= BREAKPOINTS.mobile) return 'mobile';
  if (width <= BREAKPOINTS.tablet) return 'tablet';
  if (width <= BREAKPOINTS.desktop) return 'desktop';
  return 'largeDesktop';
};

/**
 * Custom hook for responsive design in React Native Web
 * Returns the current breakpoint and responsive values
 */
export const useResponsive = (): ResponsiveValues => {
  const [dimensions, setDimensions] = useState(() => {
    const { width } = Dimensions.get('window');
    return { width };
  });

  useEffect(() => {
    // Only add listener on web platform
    if (Platform.OS !== 'web') {
      return;
    }

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width });
    });

    return () => subscription?.remove();
  }, []);

  const { width } = dimensions;
  const breakpoint = getBreakpoint(width);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isLargeDesktop: breakpoint === 'largeDesktop',
    width,
    containerPadding: CONTAINER_PADDING[breakpoint],
    maxWidth: MAX_WIDTH[breakpoint],
  };
};

/**
 * Helper function to get responsive value based on breakpoint
 * Usage: getResponsiveValue({ mobile: 16, tablet: 24, desktop: 32 }, breakpoint)
 */
export const getResponsiveValue = <T>(
  values: Partial<Record<Breakpoint, T>>,
  breakpoint: Breakpoint
): T | undefined => {
  return values[breakpoint] ?? values.desktop ?? values.tablet ?? values.mobile;
};

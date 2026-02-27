/**
 * Theme Configuration
 */

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { lightTheme, darkTheme, getTheme, getStatusColor } from './colors';

/**
 * React Native Paper Theme (Material Design 3)
 */
export const paperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: lightTheme.primary,
    background: lightTheme.background,
    surface: lightTheme.surface,
    error: lightTheme.error,
    text: lightTheme.text,
    onSurface: lightTheme.text,
    onBackground: lightTheme.text,
  },
};

export const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkTheme.primary,
    background: darkTheme.background,
    surface: darkTheme.surface,
    error: darkTheme.error,
    text: darkTheme.text,
    onSurface: darkTheme.text,
    onBackground: darkTheme.text,
  },
};

/**
 * Spacing system (8pt grid)
 * 4 / 8 / 12 / 16 / 24 / 32 / 40 / 48
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  xxxxl: 48,
};

/**
 * Border radius
 */
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

/**
 * Typography (Enhanced)
 */
export const typography = {
  display: {
    fontSize: 40,
    fontWeight: '700' as const,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.25,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 21,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  overline: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  buttonSmall: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
};

/**
 * Shadow styles
 */
export const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

/**
 * Layout constants
 */
export const layout = {
  // Web max-width for centered content
  maxWidth: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1200,
    xxl: 1280,
  },
  // Container padding for web
  containerPadding: 24,
  // Standard component heights
  buttonHeight: 44,
  inputHeight: 48,
  headerHeight: 56,
};

/**
 * Animation & Transitions
 */
export const animations = {
  duration: {
    fast: 150,
    base: 200,
    slow: 300,
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

/**
 * Button System
 */
export const buttons = {
  primary: {
    height: 44,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
  },
  secondary: {
    height: 44,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
  },
  ghost: {
    height: 44,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
  },
  small: {
    height: 36,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
  },
};

/**
 * Component styles
 */
export const components = {
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
  },
  input: {
    height: layout.inputHeight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    padding: spacing.xxxxl,
    maxWidth: 400,
  },
};

export { lightTheme, darkTheme, getTheme, getStatusColor };

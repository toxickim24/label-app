/**
 * Theme Configuration
 */

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { lightTheme, darkTheme } from './colors';

/**
 * React Native Paper Theme (Material Design 3)
 * Updated with DM Sans font family
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
  fonts: {
    ...MD3LightTheme.fonts,
    displayLarge: { ...MD3LightTheme.fonts.displayLarge, fontFamily: 'DMSans_700Bold' },
    displayMedium: { ...MD3LightTheme.fonts.displayMedium, fontFamily: 'DMSans_700Bold' },
    displaySmall: { ...MD3LightTheme.fonts.displaySmall, fontFamily: 'DMSans_700Bold' },
    headlineLarge: { ...MD3LightTheme.fonts.headlineLarge, fontFamily: 'DMSans_700Bold' },
    headlineMedium: { ...MD3LightTheme.fonts.headlineMedium, fontFamily: 'DMSans_600SemiBold' },
    headlineSmall: { ...MD3LightTheme.fonts.headlineSmall, fontFamily: 'DMSans_600SemiBold' },
    titleLarge: { ...MD3LightTheme.fonts.titleLarge, fontFamily: 'DMSans_600SemiBold' },
    titleMedium: { ...MD3LightTheme.fonts.titleMedium, fontFamily: 'DMSans_500Medium' },
    titleSmall: { ...MD3LightTheme.fonts.titleSmall, fontFamily: 'DMSans_500Medium' },
    bodyLarge: { ...MD3LightTheme.fonts.bodyLarge, fontFamily: 'DMSans_400Regular' },
    bodyMedium: { ...MD3LightTheme.fonts.bodyMedium, fontFamily: 'DMSans_400Regular' },
    bodySmall: { ...MD3LightTheme.fonts.bodySmall, fontFamily: 'DMSans_400Regular' },
    labelLarge: { ...MD3LightTheme.fonts.labelLarge, fontFamily: 'DMSans_500Medium' },
    labelMedium: { ...MD3LightTheme.fonts.labelMedium, fontFamily: 'DMSans_500Medium' },
    labelSmall: { ...MD3LightTheme.fonts.labelSmall, fontFamily: 'DMSans_500Medium' },
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
  fonts: {
    ...MD3DarkTheme.fonts,
    displayLarge: { ...MD3DarkTheme.fonts.displayLarge, fontFamily: 'DMSans_700Bold' },
    displayMedium: { ...MD3DarkTheme.fonts.displayMedium, fontFamily: 'DMSans_700Bold' },
    displaySmall: { ...MD3DarkTheme.fonts.displaySmall, fontFamily: 'DMSans_700Bold' },
    headlineLarge: { ...MD3DarkTheme.fonts.headlineLarge, fontFamily: 'DMSans_700Bold' },
    headlineMedium: { ...MD3DarkTheme.fonts.headlineMedium, fontFamily: 'DMSans_600SemiBold' },
    headlineSmall: { ...MD3DarkTheme.fonts.headlineSmall, fontFamily: 'DMSans_600SemiBold' },
    titleLarge: { ...MD3DarkTheme.fonts.titleLarge, fontFamily: 'DMSans_600SemiBold' },
    titleMedium: { ...MD3DarkTheme.fonts.titleMedium, fontFamily: 'DMSans_500Medium' },
    titleSmall: { ...MD3DarkTheme.fonts.titleSmall, fontFamily: 'DMSans_500Medium' },
    bodyLarge: { ...MD3DarkTheme.fonts.bodyLarge, fontFamily: 'DMSans_400Regular' },
    bodyMedium: { ...MD3DarkTheme.fonts.bodyMedium, fontFamily: 'DMSans_400Regular' },
    bodySmall: { ...MD3DarkTheme.fonts.bodySmall, fontFamily: 'DMSans_400Regular' },
    labelLarge: { ...MD3DarkTheme.fonts.labelLarge, fontFamily: 'DMSans_500Medium' },
    labelMedium: { ...MD3DarkTheme.fonts.labelMedium, fontFamily: 'DMSans_500Medium' },
    labelSmall: { ...MD3DarkTheme.fonts.labelSmall, fontFamily: 'DMSans_500Medium' },
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
  xxl: 20,
  xxxl: 24,
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

/**
 * Interactive State Styles
 * For hover, focus, pressed, disabled states
 */
export const interactiveStates = {
  hover: {
    light: {
      opacity: 0.08,
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
    dark: {
      opacity: 0.12,
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
  },
  pressed: {
    light: {
      opacity: 0.12,
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
    dark: {
      opacity: 0.16,
      backgroundColor: 'rgba(255, 255, 255, 0.12)',
    },
  },
  focus: {
    light: {
      borderColor: '#007AFF',
      borderWidth: 2,
      shadowColor: '#007AFF',
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    dark: {
      borderColor: '#0A84FF',
      borderWidth: 2,
      shadowColor: '#0A84FF',
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
  },
  disabled: {
    opacity: 0.4,
  },
};

/**
 * Utility Styles for Common Patterns
 */
export const utils = {
  // Flexbox utilities
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexStart: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  // Text utilities
  textCenter: {
    textAlign: 'center' as const,
  },
  textBold: {
    fontWeight: '700' as const,
  },
  textSemiBold: {
    fontWeight: '600' as const,
  },

  // Spacing utilities
  fullWidth: {
    width: '100%',
  },
  fullHeight: {
    height: '100%',
  },
};

// Re-export color utilities
export {
  lightTheme,
  darkTheme,
  getTheme,
  getStatusColor,
  statusBadgeConfig,
  getStatusBadgeConfig,
} from './colors';

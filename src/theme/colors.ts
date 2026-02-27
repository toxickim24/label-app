/**
 * Theme Colors
 * Supports Light and Dark mode
 */

export const lightTheme = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0051D5',
  primaryLight: '#4DA2FF',

  // Background colors (refined neutral palette)
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceHover: '#F5F6F7',
  card: '#FFFFFF',

  // Text colors
  text: '#0F0F0F',
  textSecondary: '#5F6368',
  textTertiary: '#80868B',
  textDisabled: '#BDBDBD',

  // Border colors
  border: 'rgba(0, 0, 0, 0.08)',
  borderSubtle: 'rgba(0, 0, 0, 0.05)',
  divider: 'rgba(0, 0, 0, 0.06)',

  // Status colors
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  info: '#007AFF',

  // Badge colors
  badgeNew: '#34C759',
  badgeContacted: '#007AFF',
  badgeResponded: '#FF9500',
  badgeQualified: '#AF52DE',
  badgeDisqualified: '#FF3B30',
  badgeConverted: '#8E8E93',
  badgeInvalid: '#C7C7CC',

  // Logo (temporarily disabled - add PNG logos to enable)
  // logo: require('../assets/images/logos/label-logo.png'),
  // logoIcon: require('../assets/images/logos/label-favicon.png'),
};

export const darkTheme = {
  // Primary colors
  primary: '#0A84FF',
  primaryDark: '#0066CC',
  primaryLight: '#5AC8FA',

  // Background colors (improved contrast hierarchy)
  background: '#0A0A0A',
  surface: '#161616',
  surfaceElevated: '#1E1E1E',
  surfaceHover: '#282828',
  card: '#1E1E1E',

  // Text colors (better readability)
  text: '#FAFAFA',
  textSecondary: '#A1A8AD',
  textTertiary: '#6C7278',
  textDisabled: '#4A4A4A',

  // Border colors
  border: '#2E2E2E',
  borderSubtle: '#242424',
  divider: '#1F1F1F',

  // Status colors
  error: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A',
  info: '#0A84FF',

  // Badge colors
  badgeNew: '#30D158',
  badgeContacted: '#0A84FF',
  badgeResponded: '#FF9F0A',
  badgeQualified: '#BF5AF2',
  badgeDisqualified: '#FF453A',
  badgeConverted: '#8E8E93',
  badgeInvalid: '#48484A',

  // Logo (temporarily disabled - add PNG logos to enable)
  // logo: require('../assets/images/logos/label-white-logo.png'),
  // logoIcon: require('../assets/images/logos/label-white-favicon.png'),
};

export type Theme = typeof lightTheme;

/**
 * Get theme based on mode
 */
export const getTheme = (mode: 'light' | 'dark'): Theme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

/**
 * Status badge colors
 */
export const getStatusColor = (status: string, isDark: boolean) => {
  const theme = isDark ? darkTheme : lightTheme;

  switch (status) {
    case 'new':
      return theme.badgeNew;
    case 'contacted':
      return theme.badgeContacted;
    case 'responded':
      return theme.badgeResponded;
    case 'qualified':
      return theme.badgeQualified;
    case 'disqualified':
      return theme.badgeDisqualified;
    case 'converted':
      return theme.badgeConverted;
    case 'invalid':
      return theme.badgeInvalid;
    default:
      return theme.textSecondary;
  }
};

/**
 * Semantic Color System for advanced UI patterns
 */
export const semanticColors = {
  // Status Colors (expanded palette)
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',
    700: '#047857',
    900: '#064E3B',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    700: '#B45309',
    900: '#78350F',
  },
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    700: '#B91C1C',
    900: '#7F1D1D',
  },
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',
    700: '#1D4ED8',
    900: '#1E3A8A',
  },

  // Lead Health Colors
  health: {
    hot: '#10B981',      // Green - Active/responsive
    warm: '#F59E0B',     // Amber - Moderate activity
    cold: '#6B7280',     // Gray - Low activity
    risk: '#EF4444',     // Red - Needs attention
  },

  // Priority Colors
  priority: {
    urgent: '#DC2626',
    high: '#F59E0B',
    normal: '#3B82F6',
    low: '#6B7280',
  }
};

/**
 * Gradient System for premium accent elements
 */
export const gradients = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  success: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  premium: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  dark: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
};

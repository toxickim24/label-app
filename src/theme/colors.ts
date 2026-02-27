/**
 * Theme Colors
 * Supports Light and Dark mode
 */

export const lightTheme = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0051D5',
  primaryLight: '#4DA2FF',

  // Background colors
  background: '#FFFFFF',
  surface: '#F2F2F7',
  card: '#FFFFFF',

  // Text colors
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',

  // Border colors
  border: '#C6C6C8',
  divider: '#E5E5EA',

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

  // Logo (temporarily disabled - add PNG logos to enable)
  // logo: require('../assets/images/logos/label-logo.png'),
  // logoIcon: require('../assets/images/logos/label-favicon.png'),
};

export const darkTheme = {
  // Primary colors
  primary: '#0A84FF',
  primaryDark: '#0040DD',
  primaryLight: '#5AC8FA',

  // Background colors
  background: '#000000',
  surface: '#1C1C1E',
  card: '#2C2C2E',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',

  // Border colors
  border: '#38383A',
  divider: '#2C2C2E',

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
    default:
      return theme.textSecondary;
  }
};

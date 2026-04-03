/**
 * Theme Colors
 * Supports Light and Dark mode
 */

export const lightTheme = {
  // Primary colors - Updated to match new design system
  primary: '#10b981',           // Green (matching dark theme primary)
  primaryDark: '#059669',
  primaryLight: '#34d399',

  // Secondary colors
  secondary: '#6366f1',         // Purple/Indigo
  accent: '#f59e0b',            // Amber
  coral: '#f43f5e',             // Rose/Coral for warnings

  // Background colors (clean, professional light palette)
  background: '#f8fafc',        // Very light blue-gray for softer feel
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  surfaceHover: '#f1f5f9',
  card: '#ffffff',

  // Text colors (optimized contrast ratios - WCAG AAA)
  text: '#0f172a',              // Slate-900 for maximum readability
  textSecondary: '#475569',     // Slate-600 for secondary text
  textTertiary: '#64748b',      // Slate-500 for labels
  textDisabled: '#cbd5e1',      // Slate-300 for disabled states

  // Border colors
  border: '#e2e8f0',            // Slate-200 for visible borders
  borderSubtle: '#f1f5f9',      // Slate-100 for subtle borders
  divider: '#e2e8f0',

  // Status colors (vibrant but professional)
  error: '#ef4444',
  success: '#10b981',           // Match primary green
  warning: '#f59e0b',           // Match accent amber
  info: '#3b82f6',

  // 6-Stage Pipeline Badge Colors (Light Mode)
  badgeNew: '#10b981',          // Emerald-500 (Green)
  badgeContacted: '#6366f1',    // Indigo-500 (Purple)
  badgeEngaged: '#f59e0b',      // Amber-500 (Amber)
  badgeEstSent: '#3b82f6',      // Blue-500 (Blue)
  badgeAppointment: '#8b5cf6',  // Violet-500 (Indigo)
  badgeClosing: '#ec4899',      // Pink-500 (Pink)

  // Legacy badge colors (deprecated - keeping for backwards compatibility)
  badgeResponded: '#f59e0b',
  badgeQualified: '#8b5cf6',
  badgeDisqualified: '#ef4444',
  badgeConverted: '#6b7280',
  badgeInvalid: '#9ca3af',
};

export const darkTheme = {
  // Primary colors - Updated to match wireframe design system
  primary: '#34d399',           // Green (primary brand color)
  primaryDark: '#22c55e',
  primaryLight: '#6ee7b7',

  // Secondary colors
  secondary: '#818cf8',         // Purple
  accent: '#fbbf24',            // Amber
  coral: '#fb7185',             // Coral for warnings/stale leads

  // Background colors - Updated to wireframe dark theme
  background: '#06060b',        // Very dark blue-black
  surface: '#0f0f14',           // Slightly lighter surface
  surfaceElevated: '#1a1a22',   // Elevated surfaces
  surfaceHover: '#25252d',      // Hover state
  card: '#0f0f14',

  // Text colors (WCAG AA compliant)
  text: '#FFFFFF',              // Pure white for maximum contrast
  textSecondary: '#a1a1aa',     // Gray for secondary text
  textTertiary: '#71717a',      // Lighter gray for labels
  textDisabled: '#52525b',      // Disabled state

  // Border colors
  border: '#27272a',            // Subtle borders
  borderSubtle: '#18181b',
  divider: '#27272a',

  // Status colors
  error: '#ef4444',
  success: '#34d399',           // Match primary green
  warning: '#fbbf24',           // Match accent amber
  info: '#60a5fa',

  // 6-Stage Pipeline Badge Colors (New System)
  badgeNew: '#34d399',          // Green
  badgeContacted: '#818cf8',    // Purple
  badgeEngaged: '#fbbf24',      // Amber
  badgeEstSent: '#60a5fa',      // Blue
  badgeAppointment: '#a78bfa',  // Indigo
  badgeClosing: '#f472b6',      // Pink

  // Legacy badge colors (deprecated - keeping for backwards compatibility)
  badgeResponded: '#fbbf24',
  badgeQualified: '#a78bfa',
  badgeDisqualified: '#ef4444',
  badgeConverted: '#98989D',
  badgeInvalid: '#71717a',

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
 * Status badge colors - Updated for 6-stage pipeline
 */
export const getStatusColor = (status: string, isDark: boolean) => {
  const theme = isDark ? darkTheme : lightTheme;

  switch (status) {
    // New 6-stage pipeline
    case 'new':
      return theme.badgeNew;
    case 'contacted':
      return theme.badgeContacted;
    case 'engaged':
      return theme.badgeEngaged;
    case 'est_sent':
    case 'estimate_sent':
      return theme.badgeEstSent;
    case 'appointment':
      return theme.badgeAppointment;
    case 'closing':
      return theme.badgeClosing;

    // Legacy statuses (backwards compatibility)
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

/**
 * Status Badge Configuration - 6-Stage Pipeline (Dark Theme)
 * Each status has: background color, text color, and dot color
 */
export const statusBadgeConfigDark = {
  new: {
    bg: '#34d39920',    // 20% opacity green
    text: '#34d399',
    dot: '#22c55e',
    label: 'New',
  },
  contacted: {
    bg: '#818cf820',    // 20% opacity purple
    text: '#818cf8',
    dot: '#6366f1',
    label: 'Contacted',
  },
  engaged: {
    bg: '#fbbf2420',    // 20% opacity amber
    text: '#fbbf24',
    dot: '#f59e0b',
    label: 'Engaged',
  },
  est_sent: {
    bg: '#60a5fa20',    // 20% opacity blue
    text: '#60a5fa',
    dot: '#3b82f6',
    label: 'Est. Sent',
  },
  appointment: {
    bg: '#a78bfa20',    // 20% opacity indigo
    text: '#a78bfa',
    dot: '#8b5cf6',
    label: 'Appointment',
  },
  closing: {
    bg: '#f472b620',    // 20% opacity pink
    text: '#f472b6',
    dot: '#ec4899',
    label: 'Closing',
  },
};

/**
 * Status Badge Configuration - 6-Stage Pipeline (Light Theme)
 * Each status has: background color, text color, and dot color
 */
export const statusBadgeConfigLight = {
  new: {
    bg: '#d1fae5',      // Emerald-100
    text: '#059669',    // Emerald-600
    dot: '#10b981',     // Emerald-500
    label: 'New',
  },
  contacted: {
    bg: '#e0e7ff',      // Indigo-100
    text: '#4f46e5',    // Indigo-600
    dot: '#6366f1',     // Indigo-500
    label: 'Contacted',
  },
  engaged: {
    bg: '#fef3c7',      // Amber-100
    text: '#d97706',    // Amber-600
    dot: '#f59e0b',     // Amber-500
    label: 'Engaged',
  },
  est_sent: {
    bg: '#dbeafe',      // Blue-100
    text: '#2563eb',    // Blue-600
    dot: '#3b82f6',     // Blue-500
    label: 'Est. Sent',
  },
  appointment: {
    bg: '#ede9fe',      // Violet-100
    text: '#7c3aed',    // Violet-600
    dot: '#8b5cf6',     // Violet-500
    label: 'Appointment',
  },
  closing: {
    bg: '#fce7f3',      // Pink-100
    text: '#db2777',    // Pink-600
    dot: '#ec4899',     // Pink-500
    label: 'Closing',
  },
};

/**
 * Get status badge configuration based on theme
 */
export const getStatusBadgeConfig = (status: string, isDark: boolean = true) => {
  const config = isDark ? statusBadgeConfigDark : statusBadgeConfigLight;
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');

  const statusConfig = config[normalizedStatus as keyof typeof config];

  if (statusConfig) {
    return statusConfig;
  }

  // Fallback for unknown statuses
  return isDark
    ? { bg: '#71717a20', text: '#71717a', dot: '#52525b', label: status }
    : { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8', label: status };
};

/**
 * iOS Design System - Theme tokens and utilities
 */

export type ThemeMode = 'light' | 'dark';

export const COLORS = {
  // Primary colors
  primary: '#007AFF',
  primaryDark: '#0056CC',
  
  // Background colors
  background: '#F2F2F7',
  backgroundDark: '#000000',
  surface: '#FFFFFF',
  surfaceDark: '#1C1C1E',
  
  // Text colors
  text: '#000000',
  textSecondary: '#6D6D70',
  textTertiary: '#8E8E93',
  textDark: '#FFFFFF',
  textSecondaryDark: '#EBEBF5',
  textTertiaryDark: '#8E8E93',
  
  // Bubble colors (white to green scale)
  bubble: {
    0: '#F2F2F7',    // 0-3 attendees
    1: '#E8F5E8',    // 4-10 attendees  
    2: '#D4F4D4',    // 11-50 attendees
    3: '#34C759',    // 50+ attendees
  },
  
  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  
  // Blur colors
  blur: {
    light: 'rgba(255, 255, 255, 0.8)',
    dark: 'rgba(0, 0, 0, 0.8)',
  }
};

// Theme-aware color getter
export const getThemeColors = (mode: ThemeMode) => ({
  background: mode === 'dark' ? COLORS.backgroundDark : COLORS.background,
  surface: mode === 'dark' ? COLORS.surfaceDark : COLORS.surface,
  text: mode === 'dark' ? COLORS.textDark : COLORS.text,
  textSecondary: mode === 'dark' ? COLORS.textSecondaryDark : COLORS.textSecondary,
  textTertiary: mode === 'dark' ? COLORS.textTertiaryDark : COLORS.textTertiary,
  primary: COLORS.primary,
  primaryDark: COLORS.primaryDark,
  success: COLORS.success,
  warning: COLORS.warning,
  error: COLORS.error,
  bubble: COLORS.bubble,
  blur: COLORS.blur,
});

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADII = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const TYPOGRAPHY = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 21,
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
  },
};

// Bubble size calculations
export const getBubbleSize = (attendeeCount: number): number => {
  if (attendeeCount <= 3) return 20;
  if (attendeeCount <= 10) return 28;
  if (attendeeCount <= 50) return 36;
  return 44;
};

export const getBubbleColor = (attendeeCount: number): string => {
  if (attendeeCount <= 3) return COLORS.bubble[0];
  if (attendeeCount <= 10) return COLORS.bubble[1];
  if (attendeeCount <= 50) return COLORS.bubble[2];
  return COLORS.bubble[3];
};

export const getBubbleOpacity = (attendeeCount: number): number => {
  if (attendeeCount <= 3) return 0.3;
  if (attendeeCount <= 10) return 0.4;
  if (attendeeCount <= 50) return 0.5;
  return 0.6;
};

// Haptic feedback utilities
export const HAPTIC_FEEDBACK = {
  light: 'light' as const,
  medium: 'medium' as const,
  heavy: 'heavy' as const,
  success: 'success' as const,
  warning: 'warning' as const,
  error: 'error' as const,
};

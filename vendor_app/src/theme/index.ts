// Urban Captain Design System — exact colours from reference design
export const Colors = {
  // Base surfaces (Clean light & ivory palette)
  bg: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceCard: '#FFFFFF',
  surfaceContainer: '#F3F4F6',
  surfaceContainerLow: '#F9FAFB',
  surfaceContainerHigh: '#E5E7EB',
  surfaceContainerLowest: '#FFFFFF',
  surfaceVariant: '#E5E7EB',
  surfaceBright: '#FFFFFF',

  // Dark Forest Green Accents
  forestGreen: '#0D3325',
  forestGreenDark: '#082218',
  forestGreenLight: '#144634',
  forestGreenCard: '#0F382A',
  forestGreenPill: '#1A4D3B',

  // Text
  onSurface: '#111827',
  onSurfaceVariant: '#6B7280',
  onBackground: '#111827',
  textDark: '#111827',
  textMuted: '#6B7280',
  textSecondary: '#4B5563',
  textWhite: '#FFFFFF',

  // Emerald & Green functional
  emerald: '#10B981',
  emeraldLight: '#E8F8F0',
  emeraldDark: '#059669',
  greenActive: '#10B981',

  // Primary palette
  primary: '#0D3325',
  primaryContainer: '#E8F8F0',
  primaryFixed: '#10B981',
  primaryFixedDim: '#0D3325',
  onPrimary: '#FFFFFF',
  onPrimaryFixed: '#0D3325',

  // Secondary
  secondary: '#3B82F6',
  secondaryContainer: '#EFF6FF',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#1E40AF',

  // Tertiary
  tertiary: '#8B5CF6',
  tertiaryFixed: '#F3E8FF',
  tertiaryFixedDim: '#7C3AED',

  // Error
  error: '#EF4444',
  errorContainer: '#FEE2E2',
  onError: '#FFFFFF',
  onErrorContainer: '#991B1B',

  // Outline
  outline: '#D1D5DB',
  outlineVariant: '#E5E7EB',
  cardBorder: '#E5E7EB',

  // Gradients (start/end)
  gradientForestStart: '#0D3325',
  gradientForestEnd: '#164E3A',
  gradientBlueStart: '#2563EB',
  gradientBlueEnd: '#3B82F6',
  gradientGoldStart: '#F59E0B',
  gradientGoldEnd: '#D97706',
  gradientPurpleStart: '#8B5CF6',
  gradientPurpleEnd: '#6D28D9',
  gradientGreenStart: '#10B981',
  gradientGreenEnd: '#059669',
  gradientCyanStart: '#06B6D4',
  gradientCyanEnd: '#0284C7',
  gradientPrimaryStart: '#0D3325',
  gradientPrimaryEnd: '#10B981',
  gradientSOSStart: '#EF4444',
  gradientSOSEnd: '#DC2626',
  gradientGoldEarnStart: '#F59E0B',
  gradientGoldEarnEnd: '#D97706',
  gradientEmeraldStart: '#10B981',
  gradientEmeraldEnd: '#059669',

  // Legacy compat
  midnightNavy: '#F6F7F9',
  darkNavy: '#FFFFFF',
  deepBlue: '#F3F4F6',
  mutedGrey: '#6B7280',
  accentCyan: '#06B6D4',
  accentBlue: '#2563EB',
  accentGreen: '#10B981',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const Typography = {
  displayLg: { fontFamily: 'System', fontSize: 36, fontWeight: '800' as const, lineHeight: 44, letterSpacing: -0.72 },
  headlineLg: { fontFamily: 'System', fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  headlineLgMobile: { fontFamily: 'System', fontSize: 24, fontWeight: '700' as const, lineHeight: 30 },
  headlineMd: { fontFamily: 'System', fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  bodyLg: { fontFamily: 'System', fontSize: 18, fontWeight: '500' as const, lineHeight: 26 },
  bodyMd: { fontFamily: 'System', fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  labelMd: { fontFamily: 'System', fontSize: 14, fontWeight: '600' as const, lineHeight: 20, letterSpacing: 0.7 },
};

export const Spacing = {
  unit: 8, gutter: 16, containerPadding: 24,
  cardGap: 20, sectionMargin: 32,
};

export const Radius = {
  sm: 8, md: 12, DEFAULT: 16, lg: 24, xl: 32, full: 999,
};

export const Shadows = {
  cardSoft: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 10,
  },
  glowActive: {
    shadowColor: '#00B4DB', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 10, elevation: 6,
  },
};

export const theme = {
  colors: {
    background: '#0a0a0a',
    surface: '#141414',
    border: '#1f1f1f',
    accent: '#f59e0b',
    accentDark: '#b45309',
    textPrimary: '#fafafa',
    textMuted: '#9ca3af',
    danger: '#ef4444',
    success: '#22c55e',
  },
  fonts: {
    heading: 'BarlowCondensed_700Bold',
    headingSemi: 'BarlowCondensed_600SemiBold',
    body: 'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 4,
    md: 6,
    lg: 8,
  },
} as const

export type Theme = typeof theme

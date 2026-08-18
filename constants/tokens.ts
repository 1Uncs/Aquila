export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screen: { padding: 16, paddingHorizontal: 16, headerHeight: 64 },
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
};

export const border = {
  thin: 1,
  thick: 2,
} as const;

export const sizes = {
  icon: 48,
  avatar: 80,
  statCard: 152,
  rankBadge: 32,
} as const;

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  lineHeights: {
    xs: 18,
    sm: 22,
    md: 26,
    lg: 30,
    xl: 34,
    xxl: 42,
  },
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    bold: 'Inter-Bold',
  },
};

export const shadows = {
  sm: { shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 } as const,
  md: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 } as const,
  lg: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 24, elevation: 8 } as const,
};

export const opacities = {
  micro: 0.08,
  subtle: 0.1,
  dim: 0.3,
  overlay: 0.4,
  disabled: 0.5,
  press: 0.6,
  muted: 0.7,
};

export const animation = {
  fast: 150,
  xfast: 200,
  normal: 300,
  slow: 500,
  xslow: 800,
};

export const gradientPresets = {
  primary: ['#4f46e5', '#7c3aed'] as const,
  accent: ['#f59e0b', '#f97316'] as const,
  success: ['#10b981', '#059669'] as const,
  election: ['#4f46e5', '#4338ca'] as const,
};

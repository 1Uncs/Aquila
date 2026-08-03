export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screen: { padding: 16, paddingHorizontal: 16 },
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const border = {
  thin: 1,
  thick: 2,
} as const;

export const sizes = {
  icon: 48,
  avatar: 80,
  statCard: 128,
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
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
  },
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
};

export const shadows = {
  sm: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 } as const,
  md: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 } as const,
  lg: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 16, elevation: 6 } as const,
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

export const durations = {
  fast: 150,
  xfast: 200,
  normal: 300,
  slow: 500,
  xslow: 800,
};

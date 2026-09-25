import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  phone: 0,
  tablet: 600,
  large: 900,
} as const;

export const CONTENT_MAX_WIDTH = 768;

/** Minimal breakpoint hook: phones → tablets → large tablets/foldables. */
export function useBreakpoint() {
  const { width } = useWindowDimensions();
  const isTablet = width >= BREAKPOINTS.tablet;
  const isLarge = width >= BREAKPOINTS.large;
  // Grid columns scale with viewport: 1-col phones, 2-col tablets+.
  const numColumns = isLarge ? 3 : isTablet ? 2 : 1;
  return { width, isTablet, isLarge, numColumns, contentMaxWidth: CONTENT_MAX_WIDTH };
}

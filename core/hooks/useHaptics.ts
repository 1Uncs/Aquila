import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { HAPTICS, HapticStyle } from '@/constants/haptics';

export function useHaptics() {
  // Stable references: screens close over these in useCallback renderItem
  // fns. Fresh closures every render defeat memoization and re-render
  // every FlatList row on each parent render (VirtualizedList warning).
  const impact = useCallback((style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    Haptics.impactAsync(style).catch(() => {});
  }, []);

  const notification = useCallback((type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
    Haptics.notificationAsync(type).catch(() => {});
  }, []);

  const selection = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
  }, []);

  return { impact, notification, selection };
}

export function useHapticOnPress(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  const { impact } = useHaptics();
  return () => impact(style);
}

export function useTokenizedHaptic() {
  const impact = (style: HapticStyle = 'medium') => {
    const hapticStyle = HAPTICS[style];
    if (hapticStyle && typeof hapticStyle === 'number') {
      Haptics.impactAsync(hapticStyle as any).catch(() => {});
    }
  };

  const notify = (type: HapticStyle = 'success') => {
    const hapticType = HAPTICS[type];
    if (hapticType && typeof hapticType === 'number') {
      Haptics.notificationAsync(hapticType as any).catch(() => {});
    }
  };

  return { impact, notify };
}

import * as Haptics from 'expo-haptics';

export function useHaptics() {
  const impact = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    Haptics.impactAsync(style).catch(() => {});
  };

  const notification = (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
    Haptics.notificationAsync(type).catch(() => {});
  };

  const selection = () => {
    Haptics.selectionAsync().catch(() => {});
  };

  return { impact, notification, selection };
}

export function useHapticOnPress(style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) {
  const { impact } = useHaptics();
  return () => impact(style);
}

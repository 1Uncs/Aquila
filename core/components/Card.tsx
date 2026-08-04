import { StyleSheet, ViewStyle, View, PressableStateCallbackType } from 'react-native';
import { DebouncedPressable } from './DebouncedPressable';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { radius, shadows, opacities, border, spacing } from '@/constants/tokens';

type CardVariant = 'default' | 'highlighted' | 'elevated' | 'flat';

type CardProps = {
  children: React.ReactNode;
  variant?: CardVariant;
  pressable?: boolean;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
  key?: string | number;
};

export function Card({
  children,
  variant = 'default',
  pressable = false,
  onPress,
  style,
  testID,
}: CardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const isHighlighted = variant === 'highlighted';
  const isElevated = variant === 'elevated';
  const isFlat = variant === 'flat';

  const borderColor = isHighlighted ? colors.primary : colors.border;
  const borderWidth = isHighlighted ? border.thick : border.thin;
  const shadow = isElevated
    ? shadows.lg
    : isHighlighted
      ? shadows.md
      : isFlat
        ? {}
        : shadows.md;

  const mergedStyle = Array.isArray(style)
    ? Object.assign({}, ...style)
    : style;

  const cardStyle = [
    styles.card,
    { backgroundColor: colors.surface, borderColor, borderWidth },
    shadow,
    mergedStyle,
  ];

  const content = (
    <View style={cardStyle} testID={testID}>
      {children}
    </View>
  );

  if (pressable && onPress) {
    return (
      <DebouncedPressable
        onPress={onPress}
        style={({ pressed }: PressableStateCallbackType) => [
          styles.card,
          { backgroundColor: colors.surface, borderColor, borderWidth },
          shadow,
          pressed && { opacity: opacities.press, transform: [{ scale: 0.98 }] },
          mergedStyle,
        ]}
      >
        {content}
      </DebouncedPressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
  },
});

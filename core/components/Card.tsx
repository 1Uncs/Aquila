import React from 'react';
import { StyleSheet, ViewStyle, View, Animated } from 'react-native';
import { DebouncedPressable } from './DebouncedPressable';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { usePressScale } from '@/core/hooks/usePressScale';
import Colors from '@/constants/colors';
import { radius, shadows, border, spacing } from '@/constants/tokens';

type CardVariant = 'default' | 'highlighted' | 'elevated' | 'flat' | 'glass';

type CardProps = {
  children: React.ReactNode;
  variant?: CardVariant;
  pressable?: boolean;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
  accessibilityLabel?: string;
  key?: string | number;
};

export function Card({
  children,
  variant = 'default',
  pressable = false,
  onPress,
  style,
  testID,
  accessibilityLabel,
}: CardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const isHighlighted = variant === 'highlighted';
  const isElevated = variant === 'elevated';
  const isFlat = variant === 'flat';
  const isGlass = variant === 'glass';

  const borderColor = isHighlighted ? colors.primary : isGlass ? 'transparent' : colors.border;
  const borderWidth = isHighlighted ? border.thick : isGlass ? border.thin : border.thin;
  const shadow = isElevated
    ? shadows.lg
    : isHighlighted
      ? shadows.md
      : isFlat || isGlass
        ? {}
        : shadows.sm;

  const mergedStyle = Array.isArray(style)
    ? Object.assign({}, ...style)
    : style;

  const cardStyle = [
    styles.card,
    {
      backgroundColor: isGlass ? colors.surfaceGlass : colors.surface,
      borderColor,
      borderWidth,
      padding: spacing.screen.cardPadding,
    },
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
      <AnimatedCard onPress={onPress} accessibilityLabel={accessibilityLabel} testID={testID}>
        <View style={cardStyle} accessible accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
          {children}
        </View>
      </AnimatedCard>
    );
  }

  return content;
}

function AnimatedCard({
  onPress,
  accessibilityLabel,
  testID,
  children,
}: {
  onPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
  children: React.ReactNode;
}) {
  const { scale, onPressIn, onPressOut } = usePressScale({ toValue: 0.97 });

  return (
    <DebouncedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      testID={testID}
      style={{ borderRadius: radius.md }}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[{ transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </DebouncedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    padding: spacing.screen.cardPadding,
  },
});

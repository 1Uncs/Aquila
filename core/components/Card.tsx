import React, { useRef, useEffect } from 'react';
import { StyleSheet, ViewStyle, View, PressableStateCallbackType, Platform, Animated } from 'react-native';
import { DebouncedPressable } from './DebouncedPressable';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { radius, shadows, opacities, border, spacing } from '@/constants/tokens';

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
        : shadows.md;

  const mergedStyle = Array.isArray(style)
    ? Object.assign({}, ...style)
    : style;

  const cardStyle = [
    styles.card,
    { backgroundColor: isGlass ? colors.surfaceElevated + '99' : colors.surface, borderColor, borderWidth },
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
      <AnimatedCard
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      >
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
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const scale = useRef(new Animated.Value(1)).current;
  const isPressing = useRef(false);
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (safetyTimer.current) clearTimeout(safetyTimer.current);
    };
  }, []);

  const animateTo = (toValue: number, velocity = 0) => {
    Animated.spring(scale, {
      toValue,
      velocity,
      tension: 180,
      friction: 14,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = (_e: unknown) => {
    if (isPressing.current) return;
    isPressing.current = true;
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    animateTo(0.97, 0.8);
  };

  const handlePressOut = (_e: unknown) => {
    isPressing.current = false;
    if (safetyTimer.current) clearTimeout(safetyTimer.current);
    safetyTimer.current = setTimeout(() => {
      animateTo(1, 0.5);
    }, 80);
  };

  return (
    <DebouncedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      testID={testID}
      style={({ pressed }: PressableStateCallbackType) => [
        styles.card,
        { backgroundColor: colors.surface },
        pressed && { opacity: opacities.press },
        Platform.OS === 'android' && styles.androidRippleContainer,
      ]}
      android_ripple={{ color: colors.press, borderless: false, radius: radius.md }}
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
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  androidRippleContainer: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
});

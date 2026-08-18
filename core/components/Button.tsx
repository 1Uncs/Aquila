import React from 'react';
import {
  PressableStateCallbackType,
  StyleSheet,
  ViewStyle,
  PressableProps,
  Platform,
  FlexAlignType,
} from 'react-native';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { DebouncedPressable } from './DebouncedPressable';
import Colors from '@/constants/colors';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, opacities, border, shadows } from '@/constants/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
} & Omit<PressableProps, 'children'>;

export function Button({
  label,
  variant = 'primary',
  onPress,
  disabled = false,
  loading = false,
  style,
  testID,
  accessibilityLabel,
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  ...rest
}: ButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const sizeStyles = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 44 },
    md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 52 },
    lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, minHeight: 56 },
  };

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: colors.primary,
      ...Platform.select({
        ios: shadows.md,
        android: { ...shadows.md, elevation: 4 },
      }),
    },
    secondary: { backgroundColor: colors.primaryLight },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: border.thick,
      borderColor: colors.primary,
    },
    ghost: { backgroundColor: 'transparent' },
  };

  const textColor =
    variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFFFFF';

  const renderIcon = (iconName: keyof typeof Ionicons.glyphMap | undefined, iconColor: string) => {
    if (!iconName) return null;
    return <Ionicons name={iconName} size={20} color={iconColor} style={styles.icon} />;
  };

  const pressableStyle = ({ pressed }: PressableStateCallbackType) => [
    styles.button,
    { borderRadius: radius.full },
    sizeStyles[size],
    variantStyles[variant],
    fullWidth && { alignSelf: 'stretch' as FlexAlignType },
    pressed && {
      opacity: opacities.press,
      transform: [{ scale: 0.97 }],
      ...(size === 'lg' && { transform: [{ scale: 0.97 }, { translateY: 1 }] }),
    },
    disabled && { opacity: opacities.disabled },
    Platform.OS === 'android' && styles.androidRippleContainer,
    style,
  ];

  return (
    <DebouncedPressable
      onPress={onPress}
      disabled={disabled || loading}
      style={pressableStyle}
      testID={testID}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      android_ripple={{
        color: variant === 'primary' || variant === 'secondary' ? 'rgba(255,255,255,0.25)' : colors.press,
        borderless: false,
        radius: radius.full,
      }}
      {...rest}
    >
      {renderIcon(leftIcon, textColor)}
      <ThemedText
        variant="label"
        style={[
          styles.label,
          { color: textColor },
          size === 'lg' && { fontSize: 14 },
        ]}
      >
        {loading ? 'Loading...' : label}
      </ThemedText>
      {renderIcon(rightIcon, textColor)}
    </DebouncedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  label: { fontWeight: '600', letterSpacing: 0.3 },
  icon: { lineHeight: 20 },
  androidRippleContainer: {
    borderRadius: radius.full,
    overflow: 'hidden',
  },
});

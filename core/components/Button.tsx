import React from 'react';
import {
  PressableStateCallbackType,
  StyleSheet,
  ViewStyle,
  PressableProps,
} from 'react-native';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { DebouncedPressable } from './DebouncedPressable';
import Colors from '@/constants/colors';
import { ThemedText } from './ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing, opacities, border } from '@/constants/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

type ButtonProps = {
  label: string;
  variant?: ButtonVariant;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
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
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  ...rest
}: ButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const sizeStyles = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, height: 40 },
    md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, height: 48 },
    lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, height: 56 },
  };

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.primaryLight },
    outline: { backgroundColor: 'transparent', borderWidth: border.thick, borderColor: colors.primary },
    ghost: { backgroundColor: 'transparent' },
  };

  const textColor =
    variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFFFFF';

  const renderIcon = (iconName: keyof typeof Ionicons.glyphMap | undefined, iconColor: string) => {
    if (!iconName) return null;
    return <Ionicons name={iconName} size={20} color={iconColor} style={styles.icon} />;
  };

  return (
    <DebouncedPressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }: PressableStateCallbackType) => [
        styles.button,
        { borderRadius: radius.md },
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && { alignSelf: 'stretch' },
        pressed && {
          opacity: opacities.press,
          transform: [{ scale: 0.97 }],
          ...(size === 'lg' && { transform: [{ scale: 0.97 }, { translateY: 1 }] }),
        },
        disabled && { opacity: opacities.disabled },
        style,
      ]}
      testID={testID}
      {...rest}
    >
      {renderIcon(leftIcon, textColor)}
      <ThemedText
        variant="label"
        style={[
          styles.label,
          { color: textColor },
          size === 'lg' && { fontSize: 18 },
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
});

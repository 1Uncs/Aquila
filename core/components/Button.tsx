import React, { ComponentProps } from 'react';
import {
  Pressable as RNPressable,
  PressableStateCallbackType,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { ThemedText } from './ThemedText';
import { radius, spacing, opacities } from '@/constants/tokens';

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
} & Omit<ComponentProps<typeof RNPressable>, 'children'>;

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
  ...rest
}: ButtonProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const sizeStyles = {
    sm: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, height: 36 },
    md: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, height: 48 },
    lg: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, height: 56 },
  };

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.secondary },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary },
    ghost: { backgroundColor: 'transparent' },
  };

  const textColor =
    variant === 'outline' || variant === 'ghost' ? colors.primary : '#FFFFFF';

  return (
    <RNPressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }: PressableStateCallbackType) => [
        styles.button,
        { borderRadius: radius.md },
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && { alignSelf: 'stretch' },
        (pressed || loading) && { opacity: opacities.press },
        disabled && { opacity: opacities.disabled },
        style,
      ]}
      testID={testID}
      {...rest}
    >
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
    </RNPressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: '600', letterSpacing: 0.3 },
});

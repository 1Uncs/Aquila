import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { ThemedText } from './ThemedText';
import { radius, spacing } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';

type InputProps = {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  testID?: string;
} & RNTextInputProps;

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  testID,
  ...rest
}: InputProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <ThemedText variant="label" style={{ marginBottom: spacing.xs }}>
          {label}
        </ThemedText>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: error
              ? colors.error
              : focused
                ? colors.primary
                : colors.border,
          },
          focused && { shadowColor: colors.primary, shadowOpacity: 0.15 },
        ]}
      >
        {leftIcon && (
          <Ionicons name={leftIcon} size={20} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
        )}
        <RNTextInput
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          testID={testID}
          {...rest}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} hitSlop={8}>
            <Ionicons name={rightIcon} size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      {error && (
        <ThemedText variant="caption" color="error" style={{ marginTop: spacing.xs }}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  input: { flex: 1, fontSize: 16, fontFamily: 'System' },
});

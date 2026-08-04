import React, { useRef, useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  Pressable,
  ViewStyle,
  Platform,
} from 'react-native';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { ThemedText } from './ThemedText';
import { radius, spacing, border } from '@/constants/tokens';
import { Ionicons } from '@expo/vector-icons';

type InputProps = {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  secureToggle?: boolean;
  visible?: boolean;
  onToggleSecure?: () => void;
  containerStyle?: ViewStyle;
  testID?: string;
} & RNTextInputProps;

export const Input = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureToggle,
  visible,
  onToggleSecure,
  containerStyle,
  testID,
  ...rest
}: InputProps) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<RNTextInput>(null);
  const rightIconName = secureToggle
    ? (visible ? 'eye-off' : 'eye')
    : rightIcon;

  const handleRightPress = secureToggle
    ? onToggleSecure
    : onRightIconPress;

  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!(rightIconName || secureToggle);

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
        {hasLeftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={colors.textMuted}
            style={styles.leftIcon}
          />
        )}
        <RNTextInput
          ref={inputRef}
          style={[
            styles.input,
            { color: colors.text },
            hasLeftIcon && styles.inputWithLeftIcon,
            hasRightIcon && styles.inputWithRightIcon,
            Platform.OS === 'android' && { textAlignVertical: rest.multiline ? 'top' : 'center' },
          ]}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          testID={testID}
          maxFontSizeMultiplier={1.3}
          {...rest}
        />
        {hasRightIcon && (
          <Pressable
            onPress={handleRightPress}
            hitSlop={8}
            accessibilityRole="button"
            style={styles.rightIcon}
          >
            {rightIconName && (
              <Ionicons name={rightIconName} size={20} color={colors.textMuted} />
            )}
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
};

const styles = StyleSheet.create({
  wrapper: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: border.thick,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'System',
    paddingVertical: 12,
  },
  leftIcon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 1,
  },
  inputWithLeftIcon: {
    paddingLeft: 44,
  },
  inputWithRightIcon: {
    paddingRight: 44,
  },
});
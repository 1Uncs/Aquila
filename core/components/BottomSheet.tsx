import React, { useEffect, useRef } from 'react';
import { Pressable, Animated, Dimensions, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { spacing, radius, border, animation } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';

type BottomSheetOption = {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'destructive';
};

type BottomSheetProps = {
  visible: boolean;
  title?: string;
  options: BottomSheetOption[];
  onClose: () => void;
};

export function BottomSheet({ visible, title, options, onClose }: BottomSheetProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const translateY = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: animation.normal,
        easing: (t) => t * (2 - t),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: Dimensions.get('window').height,
        duration: animation.fast,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  if (!visible) return null;

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Animated.View style={[styles.sheet, { backgroundColor: colors.surface, transform: [{ translateY }] }]}>
        {title ? (
          <ThemedText variant="h3" style={{ marginBottom: spacing.md, textAlign: 'center' }}>
            {title}
          </ThemedText>
        ) : null}
        {options.map((option, index) => (
          <Pressable
            key={index}
            onPress={() => {
              option.onPress();
              onClose();
            }}
            style={({ pressed }) => [
              styles.option,
              { borderBottomColor: colors.border, opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <ThemedText
              variant="body"
              style={{ color: option.variant === 'destructive' ? colors.error : colors.text, fontWeight: '600', textAlign: 'center' }}
            >
              {option.label}
            </ThemedText>
          </Pressable>
        ))}
        <Pressable onPress={onClose} style={[styles.option, { marginTop: spacing.xs }]}>
          <ThemedText variant="body" style={{ color: colors.textSecondary, fontWeight: '600', textAlign: 'center' }}>
            Cancel
          </ThemedText>
        </Pressable>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderTopWidth: border.thin,
  },
  option: {
    paddingVertical: spacing.md,
    borderBottomWidth: border.thin,
  },
});

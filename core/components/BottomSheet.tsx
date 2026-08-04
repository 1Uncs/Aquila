import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Animated, Dimensions, StyleSheet, View } from 'react-native';
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
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: animation.normal,
        easing: (t) => t * (2 - t),
        useNativeDriver: true,
      }).start();
    } else if (shouldRender) {
      Animated.timing(translateY, {
        toValue: Dimensions.get('window').height,
        duration: animation.fast,
        useNativeDriver: true,
      }).start(() => {
        setShouldRender(false);
      });
    }
  }, [visible, translateY, shouldRender]);

  if (!shouldRender) return null;

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View style={[styles.sheet, { backgroundColor: colors.surface, transform: [{ translateY }] }]}>
          <View style={styles.dragHandle} />
          {title ? (
            <ThemedText variant="h3" style={{ marginBottom: spacing.sm, textAlign: 'center' }}>
              {title}
            </ThemedText>
          ) : null}
          <View style={styles.optionsContainer}>
            {options.map((option, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  option.onPress();
                  onClose();
                }}
                style={({ pressed }) => [
                  styles.option,
                  { backgroundColor: pressed ? colors.border : 'transparent' },
                ]}
              >
                <ThemedText
                  variant="body"
                  style={{
                    color: option.variant === 'destructive' ? colors.error : colors.text,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
          <View style={[styles.separator, { backgroundColor: colors.border }]} />
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.cancelButton,
              { backgroundColor: pressed ? colors.border : 'transparent' },
            ]}
          >
            <ThemedText variant="body" style={{ color: colors.textSecondary, fontWeight: '600', textAlign: 'center' }}>
              Cancel
            </ThemedText>
          </Pressable>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
    borderTopWidth: border.thin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C7C7CC',
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  optionsContainer: {
    paddingVertical: spacing.xs,
  },
  option: {
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    marginHorizontal: spacing.sm,
  },
  separator: {
    height: border.thin,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    marginHorizontal: spacing.sm,
  },
});

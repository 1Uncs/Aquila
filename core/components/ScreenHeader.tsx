import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { spacing, radius, border } from '@/constants/tokens';

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  category?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
};

export function ScreenHeader({
  title,
  subtitle,
  category,
  showBack = true,
  onBack,
  rightElement,
  style,
  testID,
}: ScreenHeaderProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.topRow}>
        {showBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>
        )}

        <View style={styles.textColumn}>
          {category && (
            <View style={styles.categoryRow}>
              <View style={[styles.categoryDot, { backgroundColor: colors.primary }]} />
              <ThemedText variant="label" color="primary" fontFamily="bold" numberOfLines={1}>
                {category.toUpperCase()}
              </ThemedText>
            </View>
          )}

          <ThemedText variant="title" color="text" fontFamily="bold" numberOfLines={1}>
            {title}
          </ThemedText>

          {subtitle && (
            <ThemedText variant="caption" color="textSecondary" numberOfLines={1} style={{ marginTop: 1 }}>
              {subtitle}
            </ThemedText>
          )}
        </View>

        {rightElement ? <View style={styles.rightContainer}>{rightElement}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: border.thin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

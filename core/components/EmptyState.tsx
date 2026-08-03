import { StyleSheet, View, Pressable, PressableStateCallbackType } from 'react-native';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { radius, spacing } from '@/constants/tokens';

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  ghost?: boolean;
  testID?: string;
};

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  ghost = false,
  testID,
}: EmptyStateProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <View style={[styles.container, ghost && styles.ghost]} testID={testID}>
      <Ionicons
        name={icon}
        size={64}
        color={colors.textMuted}
        style={{ marginBottom: spacing.md }}
      />
      <ThemedText variant="h3" style={{ textAlign: 'center', marginBottom: spacing.xs }}>
        {title}
      </ThemedText>
      {subtitle && (
        <ThemedText
          variant="body"
          color="textSecondary"
          style={{ textAlign: 'center', marginBottom: spacing.lg }}
        >
          {subtitle}
        </ThemedText>
      )}
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          style={({ pressed }: PressableStateCallbackType) => [
            styles.button,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.7 },
          ]}
        >
          <ThemedText variant="label" style={{ color: '#fff', fontWeight: '600' }}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  ghost: {
    borderWidth: 2,
    borderColor: '#C5C9D4',
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
  },
  button: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
});

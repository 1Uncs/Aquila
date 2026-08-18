import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { Button } from './Button';
import { radius, spacing, border } from '@/constants/tokens';

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  ghost?: boolean;
  testID?: string;
};

export function EmptyState({
  icon,
  title,
  subtitle,
  description,
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
        size={56}
        color={colors.textMuted}
        style={styles.icon}
      />
      <ThemedText variant="h3" style={styles.title}>
        {title}
      </ThemedText>
      {subtitle && (
        <ThemedText
          variant="body"
          color="textSecondary"
          style={styles.subtitle}
        >
          {subtitle}
        </ThemedText>
      )}
      {description && (
        <ThemedText
          variant="body"
          color="textSecondary"
          style={styles.description}
        >
          {description}
        </ThemedText>
      )}
      {actionLabel && onAction && (
        <Button label={actionLabel} onPress={onAction} size="md" testID={testID ? `${testID}-action` : undefined} />
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
    maxWidth: 400,
    alignSelf: 'center',
  },
  icon: {
    marginBottom: spacing.md,
    opacity: 0.8,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ghost: {
    borderWidth: border.thick,
    borderColor: '#94a3b8',
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.lg,
  },
});

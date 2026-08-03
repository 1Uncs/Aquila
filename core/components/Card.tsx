import { Pressable, StyleSheet, ViewStyle, View, PressableStateCallbackType } from 'react-native';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { radius, shadows, opacities } from '@/constants/tokens';

type CardProps = {
  children: React.ReactNode;
  variant?: 'default' | 'highlighted';
  pressable?: boolean;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  testID?: string;
  key?: string | number;
};

export function Card({
  children,
  variant = 'default',
  pressable = false,
  onPress,
  style,
  testID,
}: CardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const borderColor = variant === 'highlighted' ? colors.primary : colors.border;
  const shadow = variant === 'highlighted' ? shadows.lg : shadows.md;

  const mergedStyle = Array.isArray(style)
    ? Object.assign({}, ...style)
    : style;

  const content = (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor },
        shadow,
        mergedStyle,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );

  if (pressable && onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }: PressableStateCallbackType) => [
          styles.card,
          pressed && { opacity: opacities.press },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
  },
});

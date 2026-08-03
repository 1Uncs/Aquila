import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors, { ColorScheme } from '@/constants/colors';
import { Platform, PixelRatio, Text as RNText, StyleSheet } from 'react-native';

const useScheme = (): ColorScheme => {
  return useColorScheme() ?? 'light';
};

type ThemedTextProps = {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'xl' | 'xxl' | 'lg' | 'body' | 'caption' | 'label';
  color?: keyof typeof Colors.light | string;
  style?: object;
  allowFontScaling?: boolean;
  testID?: string;
  numberOfLines?: number;
  onPress?: () => void;
};

export function ThemedText({
  children,
  variant = 'body',
  color,
  style,
  allowFontScaling = true,
  testID,
  numberOfLines,
  onPress,
}: ThemedTextProps) {
  const scheme = useScheme();
  const colors = Colors[scheme];

  const textColor = color
    ? typeof color === 'string' && color in colors
      ? (colors as Record<string, string>)[color]
      : color
    : colors.text;

  const sizeMap = {
    h1: 32,
    h2: 24,
    h3: 20,
    xl: 28,
    xxl: 36,
    lg: 22,
    body: 16,
    caption: 12,
    label: 14,
  };

  const lineHeightMap = {
    h1: 40,
    h2: 32,
    h3: 28,
    xl: 34,
    xxl: 44,
    lg: 28,
    body: 24,
    caption: 16,
    label: 20,
  };

  const fontSize = sizeMap[variant];
  const lineHeight = lineHeightMap[variant];
  const scaledLineHeight = PixelRatio.roundToNearestPixel(
    Platform.OS === 'android' ? lineHeight * PixelRatio.getFontScale() : lineHeight
  );

  const maxFontSizeMultiplier = fontSize >= 28 ? 1.3 : fontSize >= 20 ? 1.4 : 1.5;

  return (
    <RNText
      style={[
        styles.base,
        { color: textColor, fontSize, lineHeight: scaledLineHeight },
        style,
      ]}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      numberOfLines={numberOfLines}
      testID={testID}
      onPress={onPress}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
    textAlignVertical: Platform.select({ android: 'center' }),
    includeFontPadding: Platform.select({ android: false }),
  },
});

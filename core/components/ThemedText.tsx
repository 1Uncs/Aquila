import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors, { ColorScheme } from '@/constants/colors';
import { Platform, PixelRatio, Text as RNText, StyleSheet, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const useScheme = (): ColorScheme => {
  return useColorScheme() ?? 'light';
};

type ThemedTextProps = {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'xl' | 'xxl' | 'lg' | 'body' | 'caption' | 'label' | 'gradient';
  color?: keyof typeof Colors.light | string;
  style?: object;
  allowFontScaling?: boolean;
  testID?: string;
  numberOfLines?: number;
  onPress?: () => void;
  uppercase?: boolean;
  tracking?: number;
  gradientColors?: readonly [string, string, ...string[]];
  fontFamily?: 'regular' | 'medium' | 'bold';
};

const SIZE_MAP: Record<string, number> = {
  h1: 32,
  h2: 28,
  h3: 22,
  xl: 26,
  xxl: 34,
  lg: 20,
  body: 16,
  caption: 13,
  label: 14,
};

const LINE_HEIGHT_MAP: Record<string, number> = {
  h1: 40,
  h2: 34,
  h3: 28,
  xl: 32,
  xxl: 44,
  lg: 26,
  body: 24,
  caption: 18,
  label: 20,
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
  uppercase,
  tracking,
  gradientColors,
  fontFamily = 'regular',
}: ThemedTextProps) {
  const scheme = useScheme();
  const colors = Colors[scheme];

  const textColor = color
    ? typeof color === 'string' && color in colors
      ? (colors as Record<string, string>)[color]
      : color
    : colors.text;

  const isGradient = variant === 'gradient';

  const isHeading = ['h1', 'h2', 'h3'].includes(variant);
  const isSubheading = variant === 'xl';
  const isDisplay = variant === 'xxl';

  const fontSize = SIZE_MAP[variant] ?? SIZE_MAP.body;
  const rawLineHeight = (LINE_HEIGHT_MAP[variant] ?? LINE_HEIGHT_MAP.body)!;
  const scaledLineHeight = PixelRatio.roundToNearestPixel(
    Platform.OS === 'android' ? rawLineHeight * PixelRatio.getFontScale() : rawLineHeight
  );

  const maxFontSizeMultiplier =
    isDisplay || isHeading
      ? 1.2
      : isSubheading
        ? 1.3
        : variant === 'lg' || variant === 'body'
          ? 1.4
          : 1.5;

  const fontFamilyValue =
    fontFamily === 'bold'
      ? 'Inter-Bold'
      : fontFamily === 'medium'
        ? 'Inter-Medium'
        : 'Inter-Regular';

  const baseStyle: TextStyle = {
    color: textColor,
    fontSize,
    lineHeight: scaledLineHeight,
    fontFamily: fontFamilyValue,
    includeFontPadding: Platform.select({ android: false }),
  };

  if (uppercase || variant === 'label') {
    baseStyle.textTransform = 'uppercase';
  }
  if (tracking !== undefined) {
    baseStyle.letterSpacing = tracking;
  } else if (variant === 'label') {
    baseStyle.letterSpacing = 0.5;
  }

  if (isGradient && gradientColors) {
    return (
      <RNText
        style={[styles.base, baseStyle, style]}
        allowFontScaling={allowFontScaling}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        numberOfLines={numberOfLines}
        testID={testID}
        onPress={onPress}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientFill}
        >
          <RNText
            style={[
              styles.base,
              baseStyle,
              { color: Platform.select({ ios: 'transparent', android: '#fff' }) },
            ]}
            allowFontScaling={allowFontScaling}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            numberOfLines={numberOfLines}
            testID={testID}
            onPress={onPress}
          >
            {children}
          </RNText>
        </LinearGradient>
      </RNText>
    );
  }

  return (
    <RNText
      style={[styles.base, baseStyle, style]}
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
    textAlignVertical: Platform.select({ android: 'center' }),
  },
  gradientFill: {
    alignSelf: 'flex-start',
  },
});

import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors, { ColorScheme } from '@/constants/colors';
import { Platform, PixelRatio, Text as RNText, StyleSheet, TextStyle, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ms } from '@/core/utils/ms';
import { FONT_FAMILY } from '@/constants/fonts';

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
  ellipsizeMode?: 'tail' | 'head' | 'middle' | 'clip';
  onPress?: () => void;
  uppercase?: boolean;
  tracking?: number;
  gradientColors?: readonly [string, string, ...string[]];
  fontFamily?: 'regular' | 'medium' | 'bold';
  minFontSize?: number;
  maxFontSize?: number;
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
  ellipsizeMode,
  onPress,
  uppercase,
  tracking,
  gradientColors,
  fontFamily = 'regular',
  minFontSize,
  maxFontSize,
}: ThemedTextProps) {
  const scheme = useScheme();
  const colors = Colors[scheme];
  const { width } = useWindowDimensions();

  const textColor = color
    ? typeof color === 'string' && color in colors
      ? (colors as Record<string, string>)[color]
      : color
    : colors.text;

  const isGradient = variant === 'gradient';

  const isHeading = ['h1', 'h2', 'h3'].includes(variant);
  const isSubheading = variant === 'xl';
  const isDisplay = variant === 'xxl';

  const baseFontSize: number = (SIZE_MAP[variant] ?? SIZE_MAP.body)!;
  const responsiveSize = ms(baseFontSize, width);
  const fontSize = Math.max(minFontSize ?? 0, Math.min(maxFontSize ?? Infinity, responsiveSize));
  const rawLineHeight = (LINE_HEIGHT_MAP[variant] ?? LINE_HEIGHT_MAP.body)!;
  const scaledLineHeight = PixelRatio.roundToNearestPixel(
    Platform.OS === 'android' ? rawLineHeight * PixelRatio.getFontScale() : rawLineHeight
  );

  const maxFontSizeMultiplier =
    isDisplay
      ? 1.3
      : isHeading
        ? 1.3
        : isSubheading
          ? 1.4
          : variant === 'lg' || variant === 'body'
            ? 1.4
            : 1.5;

  const fontFamilyValue =
    fontFamily === 'bold'
      ? FONT_FAMILY.bold
      : fontFamily === 'medium'
        ? FONT_FAMILY.medium
        : FONT_FAMILY.regular;

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
        ellipsizeMode={ellipsizeMode}
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
            ellipsizeMode={ellipsizeMode}
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
      ellipsizeMode={ellipsizeMode}
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

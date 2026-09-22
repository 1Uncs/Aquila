import { View, ViewStyle, Platform, ScrollView, ScrollViewProps, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSegments } from 'expo-router';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { spacing } from '@/constants/tokens';

type ScreenViewProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollable?: boolean;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  testID?: string;
  noScrollPadding?: boolean;
  refreshControl?: React.ReactElement;
  skipAndroidTopPadding?: boolean;
  skipTopSafeArea?: boolean;
  sectionGap?: number;
};

export function ScreenView({
  children,
  header,
  style,
  contentContainerStyle,
  scrollable = false,
  keyboardShouldPersistTaps,
  testID,
  noScrollPadding = false,
  refreshControl,
  skipAndroidTopPadding = false,
  skipTopSafeArea = false,
  sectionGap,
}: ScreenViewProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const segments = useSegments();

  const isTab = segments.some((s) => s === '(tabs)');
  const isAuth = segments.some((s) => s === '(auth)');
  const hasNoNativeHeader = isTab || isAuth;

  let resolvedTopPadding = 0;
  if (!skipTopSafeArea && !header) {
    if (!scrollable) {
      resolvedTopPadding = insets.top;
    } else if (Platform.OS === 'android' && !skipAndroidTopPadding) {
      resolvedTopPadding = insets.top;
    }
  }

  const baseStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: resolvedTopPadding,
  };

  const resolvedSectionGap = sectionGap ?? spacing.screen.sectionGap;

  if (scrollable) {
    const scrollContentStyle = [
      styles.scrollContent,
      noScrollPadding
        ? {}
        : {
            paddingHorizontal: spacing.screen.paddingHorizontal,
            paddingTop: !header && Platform.OS === 'ios' ? insets.top + spacing.xs : spacing.xs,
          },
      isTab ? { paddingBottom: Math.max(spacing.screen.padding, insets.bottom + 84) } : {},
      contentContainerStyle,
    ];

    const scrollViewProps: ScrollViewProps = {
      contentContainerStyle: scrollContentStyle,
      contentInsetAdjustmentBehavior: 'never',
      keyboardShouldPersistTaps: keyboardShouldPersistTaps,
      bounces: true,
      overScrollMode: 'always',
    };

    if (refreshControl) {
      scrollViewProps.refreshControl = refreshControl as ScrollViewProps['refreshControl'];
    }

    return (
      <View style={[baseStyle, style]} testID={testID} collapsable={false}>
        {header}
        <ScrollView style={styles.scrollView} {...scrollViewProps}>
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[baseStyle, style]} testID={testID}>
      {header}
      <View
        style={[
          styles.nonScrollContainer,
          noScrollPadding
            ? {}
            : {
                paddingHorizontal: spacing.screen.paddingHorizontal,
                paddingTop: spacing.xs,
                gap: resolvedSectionGap,
              },
          contentContainerStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.screen.padding,
    gap: spacing.screen.sectionGap,
  },
  nonScrollContainer: {
    flex: 1,
  },
});

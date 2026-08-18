import { View, ViewStyle, Platform, ScrollView, ScrollViewProps, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { spacing } from '@/constants/tokens';

type ScreenViewProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollable?: boolean;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  testID?: string;
  noScrollPadding?: boolean;
  refreshControl?: React.ReactElement;
  skipAndroidTopPadding?: boolean;
  sectionGap?: number;
};

export function ScreenView({
  children,
  style,
  contentContainerStyle,
  scrollable = false,
  keyboardShouldPersistTaps,
  testID,
  noScrollPadding = false,
  refreshControl,
  skipAndroidTopPadding = false,
  sectionGap,
}: ScreenViewProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const baseStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' && !skipAndroidTopPadding ? insets.top : 0,
    paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
  };

  const resolvedSectionGap = sectionGap ?? spacing.screen.sectionGap;

  if (scrollable) {
    const scrollContentStyle = [
      styles.scrollContent,
      noScrollPadding ? {} : { paddingHorizontal: spacing.screen.paddingHorizontal, paddingTop: spacing.screen.padding },
      contentContainerStyle,
    ];

    const scrollViewProps: ScrollViewProps = {
      contentContainerStyle: scrollContentStyle,
      contentInsetAdjustmentBehavior: 'automatic',
      keyboardShouldPersistTaps: keyboardShouldPersistTaps,
      bounces: true,
      overScrollMode: 'always',
    };

    if (refreshControl) {
      scrollViewProps.refreshControl = refreshControl as ScrollViewProps['refreshControl'];
    }

    return (
      <View style={[baseStyle, style]} testID={testID} collapsable={false}>
        <ScrollView style={styles.scrollView} {...scrollViewProps}>
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[baseStyle, style]} testID={testID}>
      <View style={[
        noScrollPadding ? {} : {
          paddingHorizontal: spacing.screen.paddingHorizontal,
          paddingTop: spacing.screen.padding,
          flex: 1,
          gap: resolvedSectionGap,
        },
        contentContainerStyle,
      ]}>
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
});

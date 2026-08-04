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

  if (scrollable) {
    const scrollContentStyle = [
      styles.scrollContent,
      noScrollPadding ? {} : { paddingHorizontal: spacing.md, paddingTop: spacing.md },
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
      <View style={[noScrollPadding ? {} : { paddingHorizontal: spacing.md, paddingTop: spacing.md, flex: 1 }]}>
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
    paddingBottom: spacing.md,
  },
});

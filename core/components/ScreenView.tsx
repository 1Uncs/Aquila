import { View, ViewStyle, Platform, ScrollView, ScrollViewProps, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing } from '@/constants/tokens';

type ScreenViewProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollable?: boolean;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  testID?: string;
  headerGradient?: readonly [string, string, ...string[]];
  noScrollPadding?: boolean;
  refreshControl?: React.ReactElement;
};

export function ScreenView({
  children,
  style,
  contentContainerStyle,
  scrollable = false,
  keyboardShouldPersistTaps,
  testID,
  headerGradient,
  noScrollPadding = false,
  refreshControl,
}: ScreenViewProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const baseStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: insets.top,
    paddingBottom: Platform.OS === 'ios' ? insets.bottom : insets.bottom,
  };

  const renderHeaderGradient = () => {
    if (!headerGradient || headerGradient.length === 0) return null;
    return (
      <LinearGradient
        colors={headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      />
    );
  };

  if (scrollable) {
    const scrollContentStyle = [
      styles.scrollContent,
      noScrollPadding ? {} : { paddingHorizontal: spacing.md, paddingTop: spacing.md },
      contentContainerStyle,
    ];

    const scrollViewProps: ScrollViewProps = {
      style: styles.scrollView,
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
        {renderHeaderGradient()}
        <ScrollView {...scrollViewProps}>
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[baseStyle, style]} testID={testID}>
      {renderHeaderGradient()}
      <View style={noScrollPadding ? {} : { paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    height: spacing.screen.headerHeight,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.md,
  },
});

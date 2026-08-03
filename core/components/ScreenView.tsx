import { View, ViewStyle, StatusBar, Platform, ScrollView, ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';

type ScreenViewProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollable?: boolean;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  testID?: string;
};

export function ScreenView({
  children,
  style,
  contentContainerStyle,
  scrollable = false,
  keyboardShouldPersistTaps,
  testID,
}: ScreenViewProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const baseStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'ios' ? insets.top : 0,
    paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
  };

  const header = (
    <StatusBar
      barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
      backgroundColor={colors.background}
    />
  );

  if (scrollable) {
    return (
      <View style={[baseStyle, style]} testID={testID}>
        {header}
        <ScrollView
          contentContainerStyle={contentContainerStyle}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[baseStyle, style]} testID={testID}>
      {header}
      {children}
    </View>
  );
}

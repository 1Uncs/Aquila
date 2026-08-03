import { View, ViewStyle, StatusBar, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';

type ScreenViewProps = {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollable?: boolean;
  testID?: string;
};

export function ScreenView({
  children,
  style,
  contentContainerStyle,
  scrollable = false,
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

  if (scrollable) {
    return (
      <View style={[baseStyle, style]} testID={testID}>
        <StatusBar
          barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <View style={[contentContainerStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <View style={[baseStyle, style]} testID={testID}>
      <StatusBar
        barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {children}
    </View>
  );
}

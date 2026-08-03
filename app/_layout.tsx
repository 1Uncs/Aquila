import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/core/hooks/useColorScheme';
import { AuthProvider } from '@/features/auth/store';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/core/utils/queryClient';

SplashScreen.preventAutoHideAsync();

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'), // eslint-disable-line @typescript-eslint/no-require-imports
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const iOSHeader = {
    headerTransparent: true,
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal' as const,
  };

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="election-detail"
              options={{ ...iOSHeader, headerShown: true, title: 'Election Details' }}
            />
            <Stack.Screen
              name="result-submit"
              options={{ ...iOSHeader, headerShown: true, title: 'Submit Result' }}
            />
            <Stack.Screen
              name="result-collation"
              options={{ ...iOSHeader, headerShown: true, title: 'Result Collation' }}
            />
            <Stack.Screen
              name="result-search"
              options={{ ...iOSHeader, headerShown: true, title: 'Search Results' }}
            />
            <Stack.Screen
              name="incident-report"
              options={{ ...iOSHeader, headerShown: true, title: 'Report Incident' }}
            />
            <Stack.Screen
              name="incident-search"
              options={{ ...iOSHeader, headerShown: true, title: 'Search Incidents' }}
            />
            <Stack.Screen
              name="locations"
              options={{ ...iOSHeader, headerShown: true, title: 'Locations' }}
            />
            <Stack.Screen
              name="parties"
              options={{ ...iOSHeader, headerShown: true, title: 'Political Parties' }}
            />
            <Stack.Screen
              name="users"
              options={{ ...iOSHeader, headerShown: true, title: 'User Management' }}
            />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

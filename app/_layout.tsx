import { enableScreens } from 'react-native-screens';
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/core/utils/queryClient';
import { AuthProvider, useAuthStore } from '@/features/auth/store';
import { ErrorBoundary } from 'expo-router';

enableScreens();

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootLayoutNav />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (navigationState?.routes) {
      const inAuthGroup = segments[0] === '(auth)';
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/login' as any);
      } else if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)/index' as any);
      }
    }
  }, [segments, navigationState?.routes, router]);

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="election-detail" options={{ headerShown: true, title: 'Election Details' }} />
      <Stack.Screen name="result-submit" options={{ headerShown: true, title: 'Submit Result' }} />
      <Stack.Screen name="result-collation" options={{ headerShown: true, title: 'Result Collation' }} />
      <Stack.Screen name="result-search" options={{ headerShown: true, title: 'Search Results' }} />
      <Stack.Screen name="incident-report" options={{ headerShown: true, title: 'Report Incident' }} />
      <Stack.Screen name="incident-search" options={{ headerShown: true, title: 'Search Incidents' }} />
      <Stack.Screen name="locations" options={{ headerShown: true, title: 'Locations' }} />
      <Stack.Screen name="parties" options={{ headerShown: true, title: 'Political Parties' }} />
      <Stack.Screen name="users" options={{ headerShown: true, title: 'User Management' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

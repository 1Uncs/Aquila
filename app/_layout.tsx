import { enableScreens } from 'react-native-screens';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { InteractionManager } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/core/utils/queryClient';
import { AuthProvider, useAuthStore } from '@/features/auth/store';

enableScreens();

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
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
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    if (navigationState?.key) {
      setIsNavigationReady(true);
    }
  }, [navigationState?.key]);

  useEffect(() => {
    if (!isNavigationReady) return;
    const task = InteractionManager.runAfterInteractions(() => {
      const inAuthGroup = segments[0] === '(auth)';
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/login' as any);
      } else if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)/index' as any);
      }
    });
    return () => task.cancel();
  }, [segments, isNavigationReady, router]);

  const pushOptions = (title: string) => ({
    headerShown: true,
    title,
    ...(Platform.OS === 'ios'
      ? {
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal' as const,
        }
      : {}),
  });

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="election-detail" options={pushOptions('Election Details')} />
      <Stack.Screen name="result-submit" options={pushOptions('Submit Result')} />
      <Stack.Screen name="result-collation" options={pushOptions('Result Collation')} />
      <Stack.Screen name="result-search" options={pushOptions('Search Results')} />
      <Stack.Screen name="incident-report" options={pushOptions('Report Incident')} />
      <Stack.Screen name="incident-search" options={pushOptions('Search Incidents')} />
      <Stack.Screen name="locations" options={pushOptions('Locations')} />
      <Stack.Screen name="parties" options={pushOptions('Political Parties')} />
      <Stack.Screen name="users" options={pushOptions('User Management')} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

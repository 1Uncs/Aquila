import { enableScreens } from 'react-native-screens';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { InteractionManager } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/core/utils/queryClient';
import { AuthProvider, useAuthStore } from '@/features/auth/store';
import { ToastProvider } from '@/core/components/ToastProvider';

enableScreens();

export const unstable_settings = {
  initialRouteName: 'login',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <RootLayoutNav />
            </ToastProvider>
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const lastTargetRef = useRef<string | null>(null);

  useEffect(() => {
    if (navigationState?.key) {
      setIsNavigationReady(true);
    }
  }, [navigationState?.key]);

  useEffect(() => {
    if (!isNavigationReady) return;
    const target = !isAuthenticated
      ? '/(auth)/login'
      : isAuthenticated && segments[0] === '(auth)'
        ? '/(tabs)'
        : null;
    if (!target || lastTargetRef.current === target) return;
    lastTargetRef.current = target;
    const task = InteractionManager.runAfterInteractions(() => {
      const inAuthGroup = segments[0] === '(auth)';
      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/login' as any);
      } else if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)' as any);
      }
    });
    return () => task.cancel();
  }, [segments, isNavigationReady, isAuthenticated, router]);

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
      <Stack.Screen name="result-drafts" options={pushOptions('Drafts')} />
      <Stack.Screen name="pu-picker" options={pushOptions('Select Polling Unit')} />
      <Stack.Screen name="locations" options={pushOptions('Locations')} />
      <Stack.Screen name="parties" options={pushOptions('Political Parties')} />
      <Stack.Screen name="users" options={pushOptions('User Management')} />
    </Stack>
  );
}

function pushOptions(title: string) {
  return {
    headerShown: true,
    title,
    headerBackTitle: 'Back',
    ...(Platform.OS === 'ios'
      ? {
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal' as const,
        }
      : {}),
  };
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

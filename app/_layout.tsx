import { enableScreens } from 'react-native-screens';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Stack>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isAuthenticated}>
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
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

import { Stack } from 'expo-router';
import { useColorScheme } from '@/core/hooks/useColorScheme';

export default function AppLayout() {
  const scheme = useColorScheme() ?? 'light';
  const rootBg = scheme === 'dark' ? '#070C09' : '#F8FAF9';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: rootBg },
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="election-detail" />
      <Stack.Screen name="result-submit" />
      <Stack.Screen name="result-detail" />
      <Stack.Screen name="result-collation" />
      <Stack.Screen name="result-search" />
      <Stack.Screen name="incident-report" />
      <Stack.Screen name="incident-search" />
      <Stack.Screen name="result-drafts" />
      <Stack.Screen name="pu-picker" />
      <Stack.Screen name="locations" />
      <Stack.Screen name="parties" />
    </Stack>
  );
}

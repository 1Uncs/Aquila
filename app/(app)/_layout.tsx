import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { useColorScheme } from '@/core/hooks/useColorScheme';
import Colors from '@/constants/colors';

function pushOptions(title: string, scheme: 'light' | 'dark') {
  const colors = Colors[scheme];
  return {
    headerShown: true,
    title,
    headerBackTitle: 'Back',
    headerTintColor: colors.text,
    headerTitleStyle: {
      fontWeight: '600' as const,
      fontSize: 17,
      color: colors.text,
    },
    ...(Platform.OS === 'ios'
      ? {
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal' as const,
        }
      : {
          headerTransparent: false,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.surface },
        }),
  };
}

export default function AppLayout() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const rootBg = scheme === 'dark' ? '#070C09' : '#F8FAF9';

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: rootBg },
        animation: 'slide_from_right',
        animationDuration: 250,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="election-detail" options={pushOptions('Election Details', scheme ?? 'light')} />
      <Stack.Screen name="result-submit" options={pushOptions('Submit Result', scheme ?? 'light')} />
      <Stack.Screen name="result-detail" options={pushOptions('Result Details', scheme ?? 'light')} />
      <Stack.Screen name="result-collation" options={pushOptions('Result Collation', scheme ?? 'light')} />
      <Stack.Screen name="result-search" options={pushOptions('Search Results', scheme ?? 'light')} />
      <Stack.Screen name="incident-report" options={pushOptions('Report Incident', scheme ?? 'light')} />
      <Stack.Screen name="incident-search" options={pushOptions('Search Incidents', scheme ?? 'light')} />
      <Stack.Screen name="result-drafts" options={pushOptions('Drafts Queue', scheme ?? 'light')} />
      <Stack.Screen name="pu-picker" options={pushOptions('Select Polling Unit', scheme ?? 'light')} />
      <Stack.Screen name="locations" options={pushOptions('Locations', scheme ?? 'light')} />
      <Stack.Screen name="parties" options={pushOptions('Political Parties', scheme ?? 'light')} />
    </Stack>
  );
}

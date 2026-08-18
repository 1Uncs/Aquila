import { Stack } from 'expo-router';
import { Platform } from 'react-native';

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

export default function AppLayout() {
  return (
    <Stack>
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
    </Stack>
  );
}

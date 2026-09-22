import { Stack } from 'expo-router';
import { useColorScheme } from '@/core/hooks/useColorScheme';

export default function AuthLayout() {
  const scheme = useColorScheme() ?? 'light';
  const rootBg = scheme === 'dark' ? '#070C09' : '#F8FAF9';

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: rootBg },
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#070C09' },
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

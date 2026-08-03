import { router } from 'expo-router';
import { useAuthStore } from '@/features/auth/store';
import { mockApi } from '@/features/elections/service';

export const login = async (email: string, password: string) => {
  const user = await mockApi.login(email, password);
  useAuthStore.getState().login(user);
  router.replace('/(tabs)/index' as any);
};

export const logout = () => {
  useAuthStore.getState().logout();
  router.replace('/(auth)/login' as any);
};

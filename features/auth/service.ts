import { useAuthStore } from '@/features/auth/store';
import { mockApi } from '@/features/elections/service';
import { setTokenAsync, deleteTokenAsync } from '@/core/utils/secureStorage';

export const login = async (email: string, password: string) => {
  const user = await mockApi.login(email, password);
  useAuthStore.getState().login(user);
  if (user.token) {
    await setTokenAsync(user.token);
  }
};

export const logout = async () => {
  await deleteTokenAsync();
  useAuthStore.getState().logout();
};

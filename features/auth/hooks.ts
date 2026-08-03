import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login as loginApi, logout as logoutApi } from '@/features/auth/service';

type LoginInput = { email: string; password: string };

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, LoginInput>({
    mutationFn: ({ email, password }) => loginApi(email, password),
    onSettled: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await logoutApi();
    },
    onSettled: () => {
      queryClient.clear();
    },
  });
}

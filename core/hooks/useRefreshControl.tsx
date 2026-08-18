import { useCallback, useRef } from 'react';
import { RefreshControl, NativeSyntheticEvent } from 'react-native';
import { useColorScheme } from './useColorScheme';
import { useQueryClient } from '@tanstack/react-query';
import Colors from '@/constants/colors';

export function useRefreshControl( refreshing: boolean, onRefresh: () => void) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const queryClient = useQueryClient();
  const refreshingRef = useRef(refreshing);

  refreshingRef.current = refreshing;

  const handleRefresh = useCallback(
    (_e: NativeSyntheticEvent<unknown>) => {
      const allQueryKeys: unknown[][] = [];
      queryClient.getQueryCache().getAll().forEach((entry) => {
        allQueryKeys.push(entry.queryKey as unknown[]);
      });
      const uniqueKeys = Array.from(new Set(allQueryKeys.map((k) => JSON.stringify(k)))).map(
        (k) => JSON.parse(k) as unknown[]
      );
      uniqueKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key as never });
      });
      onRefresh();
    },
    [queryClient, onRefresh]
  );

  const refreshControl = (
    <RefreshControl
      refreshing={refreshingRef.current}
      onRefresh={() => handleRefresh}
      tintColor={colors.primary}
      title="Refreshing..."
      colors={[colors.primary, colors.accent]}
      progressBackgroundColor={colors.surface}
    />
  );

  return { refreshControl, refreshing };
}

import React, { useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { ScreenView } from '@/core/components/ScreenView';
import { ThemedText, EmptyState, Card, Input, ScreenHeader } from '@/core/components';
import { useResultsQuery } from '@/features/elections/hooks';
import { ROUTES } from '@/constants/routes';
import { spacing, radius, shadows, border } from '@/constants/tokens';
import { useColorScheme } from '@/core/hooks/useColorScheme';
import { useStatusBar } from '@/core/hooks/useStatusBar';
import { useRefreshControl, useForegroundRefresh, useHaptics } from '@/core/hooks';
import Colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function ResultSearchScreen() {
  const { data: results = [], isLoading: loading, refetch } = useResultsQuery();
  const [query, setQuery] = useState('');
  const { refreshControl } = useRefreshControl(loading, refetch);
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  useStatusBar({ barStyle: scheme === 'dark' ? 'light' : 'dark' });
  useForegroundRefresh([['results', 'list']], 5 * 60 * 1000);
  const { impact } = useHaptics();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return results;
    return results.filter(
      (r) =>
        r.pollingUnitName.toLowerCase().includes(q) ||
        r.pollingUnitId.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }, [query, results]);

  return (
    <ScreenView scrollable={false} noScrollPadding>
      <View style={styles.container}>
        <ScreenHeader
          title="Search Ballot Returns"
          category="SEARCH & AUDIT"
          subtitle="Filter verified returns by Polling Unit name or code"
        />

        <View style={styles.headerBlock}>
          <Input
            placeholder="Type PU name or code (e.g. Alausa, Ikeja)..."
            value={query}
            onChangeText={setQuery}
            leftIcon="search-outline"
            rightIcon={query ? 'close-circle' : undefined}
            onRightIconPress={() => setQuery('')}
          />
        </View>

        <FlashList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshControl={refreshControl}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: spacing.xs }} />}
          renderItem={({ item }) => (
            <Card
              pressable
              style={styles.itemCard}
              onPress={() => {
                impact(Haptics.ImpactFeedbackStyle.Light);
                router.push({ pathname: ROUTES.RESULT_DETAIL, params: { id: item.id } });
              }}
            >
              <View style={styles.itemRow}>
                <View style={[styles.iconBadge, { backgroundColor: colors.primary + '16' }]}>
                  <Ionicons name="document-text" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <ThemedText variant="body" color="text" fontFamily="bold">
                    {item.pollingUnitName}
                  </ThemedText>
                  <ThemedText variant="caption" color="textSecondary">
                    {item.totalVotesCast.toLocaleString()} votes cast · Accredited: {item.totalAccreditedVoters}
                  </ThemedText>
                </View>
                <View style={[styles.statusChip, { backgroundColor: colors.successSubtle }]}>
                  <ThemedText variant="label" color="success" fontFamily="bold">
                    {item.status}
                  </ThemedText>
                </View>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState
              icon="search-outline"
              title="No Results Found"
              subtitle={`No ballot returns matched "${query}".`}
            />
          }
        />
      </View>
    </ScreenView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBlock: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  itemCard: {
    padding: spacing.sm,
    borderRadius: radius.md,
    ...shadows.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
});
